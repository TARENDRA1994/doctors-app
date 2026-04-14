import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { sendWhatsAppMessage } from '../../lib/whatsapp'


// Using centralized prisma

export async function POST(request: NextRequest) {
  try {
    console.log('📩 Test notification endpoint called')

    const session = await getServerSession(authOptions)
    console.log('🔐 Session check:', session ? `Authenticated as ${(session.user as any)?.id}` : 'NOT AUTHENTICATED')

    if (!session?.user) {
      console.error('❌ Unauthorized - no session found.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get doctor details
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt((session.user as any).id) }
    })

    if (!doctor) {
      console.error('❌ Doctor not found for id:', (session.user as any).id)
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    if (!doctor.whatsappNumber) {
      console.error('❌ Doctor has no WhatsApp number configured')
      return NextResponse.json({ error: 'Doctor WhatsApp number not configured' }, { status: 400 })
    }

    console.log('📤 Sending test message to:', doctor.whatsappNumber)

    const message = '✅ Test notification from MediReminder app! Your WhatsApp integration is working correctly.'

    const result = await sendWhatsAppMessage(doctor.whatsappNumber, message)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully!',
        messageId: result.messageId,
        recipientNumber: doctor.whatsappNumber
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification', details: result.error },
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