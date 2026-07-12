import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { uploadWhatsAppMedia, sendWhatsAppDocument } from '../../lib/whatsapp'
import { generatePrescriptionPDF } from '../../lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = parseInt((session.user as any).id)

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    if (!doctor.whatsappNumber) {
      return NextResponse.json({ error: 'WhatsApp number not configured' }, { status: 400 })
    }

    // Handle daily limit reset
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentCount = doctor.testPdfCount
    
    if (doctor.lastTestPdfDate) {
      const lastTestDate = new Date(doctor.lastTestPdfDate)
      lastTestDate.setHours(0, 0, 0, 0)
      
      if (lastTestDate.getTime() !== today.getTime()) {
        // It's a new day, reset count
        currentCount = 0
      }
    }

    if (currentCount >= 3) {
      return NextResponse.json({ 
        error: 'Test limit reached', 
        details: 'You have already reached the maximum limit of 3 test notifications for today. Please try again tomorrow.' 
      }, { status: 403 })
    }

    // Get the first active patient to generate a preview
    const firstPatient = await prisma.patient.findFirst({
      where: { doctorId, isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!firstPatient) {
      return NextResponse.json({ 
        error: 'No patients found', 
        details: 'Please add at least one patient to generate a prescription preview.' 
      }, { status: 400 })
    }

    // Generate PDF
    const { buffer, fileName } = await generatePrescriptionPDF(firstPatient.id, doctorId)

    // Upload to Meta
    const uploadResult = await uploadWhatsAppMedia(buffer, fileName, 'application/pdf')
    
    if (!uploadResult.success || !uploadResult.mediaId) {
      return NextResponse.json({ error: 'Failed to upload PDF', details: uploadResult.error }, { status: 500 })
    }

    // Send the document
    const message = '📄 Test Notification: Here is a preview of your Prescription Header Style!'
    const sendResult = await sendWhatsAppDocument(doctor.whatsappNumber, uploadResult.mediaId, fileName, doctorId, message)

    if (sendResult.success) {
      // Increment limit and update date
      await prisma.doctor.update({
        where: { id: doctorId },
        data: { 
          testPdfCount: currentCount + 1,
          lastTestPdfDate: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully!',
        remaining: 2 - currentCount, // 3 minus (current count + 1)
        recipientNumber: doctor.whatsappNumber
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification', details: sendResult.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Test notification error:', error.message)
    return NextResponse.json(
      { error: 'Failed to send test notification', details: error.message },
      { status: 500 }
    )
  }
}