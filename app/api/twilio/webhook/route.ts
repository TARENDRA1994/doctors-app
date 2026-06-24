import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'


// Using centralized prisma

// POST /api/twilio/webhook - Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    // Extract phone number from whatsapp:+123...
    const phoneNumber = from.replace('whatsapp:', '')

    // Find patient by phone number
    const patient = await prisma.patient.findFirst({
      where: { mobileNumber: phoneNumber }
    })

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' })
    }

    // Find the last sent schedule for this patient
    const lastSchedule = await prisma.medicineSchedule.findFirst({
      where: {
        medicine: { patientId: patient.id },
        status: 'sent'
      },
      orderBy: { scheduledAt: 'desc' },
      include: { medicine: true }
    })

    if (!lastSchedule) {
      return NextResponse.json({ message: 'No pending reminder' })
    }

    const action = body.toLowerCase().trim()

    if (action === 'taken' || action === 'took medicine') {
      // Mark as taken
      await prisma.medicineSchedule.update({
        where: { id: lastSchedule.id },
        data: { status: 'taken' }
      })

      // Log
      await prisma.reminderLog.create({
        data: {
          medicineId: lastSchedule.medicineId,
          scheduleId: lastSchedule.id,
          doctorId: lastSchedule.medicine.doctorId,
          action: 'taken'
        }
      })
    } else if (action.startsWith('snooze')) {
      // Snooze for 10 minutes from NOW
      const snoozeTime = new Date(Date.now() + 10 * 60 * 1000)

      // Update existing schedule to pending and push scheduledAt forward
      // This preserves reminderCount (which is 1) so they only get 1 snooze
      await prisma.medicineSchedule.update({
        where: { id: lastSchedule.id },
        data: { 
          status: 'pending',
          scheduledAt: snoozeTime
        }
      })

      // Log snooze
      await prisma.reminderLog.create({
        data: {
          medicineId: lastSchedule.medicineId,
          scheduleId: lastSchedule.id,
          doctorId: lastSchedule.medicine.doctorId,
          action: 'snoozed'
        }
      })
    }

    return NextResponse.json({ message: 'Action processed' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}