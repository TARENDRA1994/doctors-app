import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { generatePrescriptionPDF } from '../../../lib/pdf-generator'
import { uploadWhatsAppMedia, sendWhatsAppDocument } from '../../../lib/whatsapp'
import { prisma } from '../../../lib/prisma'

export async function POST(
    request: NextRequest
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { patientId } = await request.json()
        const doctorId = parseInt((session.user as any).id)

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
        }

        // 1. Generate PDF (Active medicines only for WhatsApp)
        const { buffer, fileName } = await generatePrescriptionPDF(patientId, doctorId, true)

        // 2. Fetch Patient Number
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // 3. Upload to WhatsApp Media API
        console.log(`Uploading prescription PDF for ${patient.name}...`)
        const uploadResult = await uploadWhatsAppMedia(buffer, fileName, 'application/pdf')

        if (!uploadResult.success || !uploadResult.mediaId) {
            console.error('WhatsApp Media Upload Failed:', uploadResult.error)
            return NextResponse.json({ error: `WhatsApp upload failed: ${uploadResult.error}` }, { status: 500 })
        }

        // 4. Send Document Message
        console.log(`Sending prescription document to ${patient.mobileNumber} (Media ID: ${uploadResult.mediaId})...`)
        const sendResult = await sendWhatsAppDocument(
            patient.mobileNumber,
            uploadResult.mediaId,
            fileName,
            doctorId,
            "Thank you for your visit. Here is the prescription, please download it."
        )

        if (!sendResult.success) {
            console.error('WhatsApp Document Send Failed:', sendResult.error)
            return NextResponse.json({ error: `WhatsApp send failed: ${sendResult.error}` }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Prescription sent successfully via WhatsApp!',
            messageId: sendResult.messageId 
        })

    } catch (error: any) {
        console.error('Prescription Share Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to share prescription' }, { status: 500 })
    }
}
