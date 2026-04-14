import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '../../../lib/prisma'
import { authOptions } from '../../../lib/auth'
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../../../lib/whatsapp'


// Using centralized prisma

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { patientId, trendSummary } = body

        if (!patientId || !trendSummary) {
            return NextResponse.json({ error: 'Patient ID and trend summary are required' }, { status: 400 })
        }

        const patient = await prisma.patient.findUnique({
            where: { id: parseInt(patientId) }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt((session.user as any).id) }
        })

        if (!doctor) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
        }

        // 1. Prepare delivery components
        const fullMessage = `Health Report Analysis:\n\n${trendSummary}`

        // 2. Try sending the full content first (Free-form)
        // This works if the 24-hour window is open
        const sendResult = await sendWhatsAppMessage(patient.mobileNumber, fullMessage, doctor.id)

        // 3. If it fails because the 24-hour window is closed, fallback to Template
        if (!sendResult.success && (sendResult.errorCode === 131047 || sendResult.error?.includes('24 hours'))) {
            console.log('🔄 Window closed, falling back to Template delivery for health report')
            const summarySnippet = trendSummary.split('.')[0].substring(0, 100) + '...'
            
            await sendWhatsAppTemplateMessage(
                patient.mobileNumber,
                'health_report_share',
                [patient.name, doctor.name || 'Your Doctor', summarySnippet],
                'en',
                doctor.id
            )
        }

        // Send to guardian if available
        if (patient.guardianNumber) {
            const guardianResult = await sendWhatsAppMessage(patient.guardianNumber, `Health Report for ${patient.name}:\n\n${trendSummary}`, doctor.id)
            
            if (!guardianResult.success && (guardianResult.errorCode === 131047 || guardianResult.error?.includes('24 hours'))) {
                const summarySnippet = trendSummary.split('.')[0].substring(0, 100) + '...'
                await sendWhatsAppTemplateMessage(
                    patient.guardianNumber,
                    'health_report_share',
                    [`${patient.name} (Guardian Copy)`, doctor.name || 'Your Doctor', summarySnippet],
                    'en',
                    doctor.id
                )
            }
        }

        return NextResponse.json({ success: true, message: 'Health report shared via WhatsApp Template' })

    } catch (error: any) {
        console.error('Share Health Report Error:', error)
        return NextResponse.json({ error: 'Failed to share report' }, { status: 500 })
    }
}
