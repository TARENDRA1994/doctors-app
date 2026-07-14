import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctorId = parseInt(session.user.id)

        // Fetch Doctor to get the consultation fee
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { consultationFee: true }
        })
        const fee = doctor?.consultationFee || 500

        // Fetch all QueueTokens (assuming 1 token = 1 consultation paid)
        // You might want to filter by status, e.g., 'COMPLETED', but we'll include all non-cancelled ones here.
        const tokens = await prisma.queueToken.findMany({
            where: { 
                doctorId,
                status: { not: 'CANCELLED' }
            }
        })

        // Fetch patients to determine New vs Returning
        const patients = await prisma.patient.findMany({
            where: { doctorId }
        })

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        // Calculate Today's Stats
        const todayTokens = tokens.filter(t => new Date(t.date) >= startOfDay)
        const todayRevenue = todayTokens.length * fee

        // Calculate Monthly Stats
        const monthlyTokens = tokens.filter(t => new Date(t.date) >= startOfMonth)
        const monthlyRevenue = monthlyTokens.length * fee

        // Calculate Traffic (Last 7 days)
        const trafficData: { day: string; visits: number; revenue: number }[] = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            const nextD = new Date(d)
            nextD.setDate(nextD.getDate() + 1)

            const dayTokens = tokens.filter(t => {
                const tDate = new Date(t.date)
                return tDate >= d && tDate < nextD
            })

            trafficData.push({
                day: d.toLocaleString('default', { weekday: 'short' }),
                visits: dayTokens.length,
                revenue: dayTokens.length * fee
            })
        }

        // New vs Returning this month
        const newPatientsThisMonth = patients.filter(p => new Date(p.createdAt) >= startOfMonth).length
        // The total unique patients seen this month
        const uniquePatientPhonesThisMonth = new Set(monthlyTokens.map(t => t.patientPhone))
        const returningPatientsThisMonth = Math.max(0, uniquePatientPhonesThisMonth.size - newPatientsThisMonth)

        return NextResponse.json({
            fee,
            today: {
                revenue: todayRevenue,
                visits: todayTokens.length
            },
            monthly: {
                revenue: monthlyRevenue,
                visits: monthlyTokens.length
            },
            trafficData,
            patientSplit: [
                { name: 'New Patients', value: newPatientsThisMonth },
                { name: 'Returning', value: returningPatientsThisMonth }
            ]
        })

    } catch (error: any) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics data', details: error.message }, { status: 500 })
    }
}
