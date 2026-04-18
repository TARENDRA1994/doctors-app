import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'


// Using centralized prisma Example

// Verify if the user is a super admin
async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user && (session.user as any).isAdmin === true
}

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                name: true,
                clinicName: true,
                email: true,
                subscriptionStatus: true,
                planType: true,
                whatsappMsgCount: true,
                subscriptionExpiry: true,
                createdAt: true,
                _count: {
                    select: { patients: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(doctors)
    } catch (error) {
        console.error('Admin API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id, subscriptionStatus, planType, subscriptionExpiry } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus
        if (planType) updateData.planType = planType
        if (subscriptionExpiry) updateData.subscriptionExpiry = new Date(subscriptionExpiry)

        const updatedDoctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: updateData
        })

        return NextResponse.json(updatedDoctor)
    } catch (error) {
        console.error('Admin Update Error:', error)
        return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 })
    }
}
