import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendWhatsAppMessage } from '../../../lib/whatsapp'

export const dynamic = 'force-dynamic'


// Using centralized prisma

/**
 * GET /api/cron/follow-up
 * This is an automated "Cron" endpoint that checks for:
 * 1. Patients who gave "no_improvement" feedback in the last 24 hours.
 * 2. Patients whose medicine course is ending today.
 */
export async function GET(request: NextRequest) {
    try {
        // In production, you would protect this with a CRON_SECRET header

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const logs: string[] = []

        // 1. Check for bad feedback
        const badFeedbacks = await prisma.feedback.findMany({
            where: {
                status: 'no_improvement',
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                medicine: {
                    include: {
                        patient: true,
                        doctor: true
                    }
                }
            }
        })

        for (const feedback of badFeedbacks) {
            const patient = feedback.medicine.patient
            const doctor = feedback.medicine.doctor
            const medicineName = feedback.medicine.name

            const message = `Hi ${patient.name}, Dr. ${doctor.name} noticed you mentioned no improvement with ${medicineName}. 

We strongly recommend a follow-up visit to adjust your treatment. Would you like to book an appointment for tomorrow?`

            await sendWhatsAppMessage(patient.mobileNumber, message)
            logs.push(`Nudge sent to ${patient.name} due to poor feedback.`)
        }

        // 2. Check for prescriptions ending today
        const endingMedicines = await prisma.medicine.findMany({
            where: {
                endDate: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                patient: true,
                doctor: true
            }
        })

        for (const med of endingMedicines) {
            const patient = med.patient
            const doctor = med.doctor

            const message = `Hi ${patient.name}, your course of ${med.name} ends today. 

Dr. ${doctor.name} recommends a quick follow-up check to ensure full recovery. Shall we book a slot for you this week?`

            await sendWhatsAppMessage(patient.mobileNumber, message)
            logs.push(`Nudge sent to ${patient.name} due to course completion.`)
        }

        return NextResponse.json({
            success: true,
            processed: logs.length,
            details: logs
        })

    } catch (error: any) {
        console.error('Follow-up Cron Error:', error)
        return NextResponse.json({ error: 'Cron failed: ' + error.message }, { status: 500 })
    }
}
