import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'


// Using centralized prisma

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctorId = parseInt(session.user.id)

        // 1. Fetch all patients with their medicine schedules and feedbacks
        const patients = await prisma.patient.findMany({
            where: { doctorId },
            include: {
                medicines: {
                    include: {
                        schedules: true,
                        feedback: true
                    }
                }
            }
        })

        let totalSchedules = 0
        let takenSchedules = 0
        let totalFeedbacks = 0
        let improvedCount = 0

        const patientStats = patients.map(patient => {
            let pTotal = 0
            let pTaken = 0
            let pFeedbacks = 0
            let pImproved = 0

            patient.medicines.forEach(med => {
                pTotal += med.schedules.length
                pTaken += med.schedules.filter(s => s.status === 'taken').length
                if (med.feedback) {
                    pFeedbacks++
                    if (med.feedback.status === 'feeling_ok') pImproved++
                }
            })

            totalSchedules += pTotal
            takenSchedules += pTaken
            totalFeedbacks += pFeedbacks
            improvedCount += pImproved

            const pAdherence = pTotal > 0 ? (pTaken / pTotal) * 100 : 100
            const pSentiment = pFeedbacks > 0 ? (pImproved / pFeedbacks) * 100 : 100

            // Calculate a "Health Score" (weighted average)
            const healthScore = Math.round((pAdherence * 0.7) + (pSentiment * 0.3))

            return {
                id: patient.id,
                name: patient.name,
                adherence: Math.round(pAdherence),
                healthScore,
                isAtRisk: pAdherence < 60 || (pFeedbacks > 0 && pSentiment < 50)
            }
        })

        const adherenceRate = totalSchedules > 0 ? (takenSchedules / totalSchedules) * 100 : 0
        const progressRate = totalFeedbacks > 0 ? (improvedCount / totalFeedbacks) * 100 : 0

        // 3. Patient Growth (Last 6 months)
        const growthTrend: { month: string; count: number }[] = []
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthName = d.toLocaleString('default', { month: 'short' })
            const count = patients.filter(p => {
                const pDate = new Date(p.createdAt)
                return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear()
            }).length
            growthTrend.push({ month: monthName, count })
        }

        // 4. Disease Distribution
        const diseaseMap: Record<string, number> = {}
        patients.forEach(p => {
            const disease = p.disease || 'General'
            diseaseMap[disease] = (diseaseMap[disease] || 0) + 1
        })
        const diseaseDistribution = Object.entries(diseaseMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5 diseases

        // Risk Alerts (Top 5 at-risk patients)
        const riskAlerts = patientStats
            .filter(p => p.isAtRisk)
            .sort((a, b) => a.healthScore - b.healthScore)
            .slice(0, 5)

        const totalPatients = patients.length
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const newPatients = patients.filter(p => p.createdAt >= thirtyDaysAgo).length

        const averageHealthScore = Math.round(patientStats.reduce((acc, p) => acc + p.healthScore, 0) / (patientStats.length || 1))

        // Intelligence: Trending
        const isImproving = adherenceRate > 60 && newPatients > 0

        return NextResponse.json({
            adherenceRate: Math.round(adherenceRate),
            totalSchedules,
            takenSchedules,
            progressRate: Math.round(progressRate),
            totalFeedbacks,
            improvedCount,
            growth: {
                totalPatients,
                newPatients,
                trend: growthTrend
            },
            diseaseDistribution,
            riskAlerts,
            averageHealthScore,
            intelligence: {
                trend: isImproving ? 'increasing' : 'declining',
                strategy: adherenceRate < 50
                    ? 'Urgent: Overall adherence is critical. Consider automated voice call reminders.'
                    : riskAlerts.length > 0
                        ? 'Targeted: Focus on high-risk patients with personalized video messages.'
                        : 'Maintenance: Clinic health is stable. Continue standard monitoring protocols.'
            }
        })

    } catch (error: any) {
        console.error('Error fetching reports:', error)
        return NextResponse.json({ error: 'Failed to fetch reports', details: error.message }, { status: 500 })
    }
}
