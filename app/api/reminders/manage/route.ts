import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { sendWhatsAppInteractiveMessage, sendWhatsAppTemplateMessage } from '../../../lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { patientId, action } = await req.json()
    if (!patientId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const doctorId = parseInt((session.user as any).id)

    if (action === 'delete') {
      await prisma.medicineSchedule.updateMany({
        where: {
          status: 'pending',
          medicine: {
            patientId: patientId,
            doctorId: doctorId,
          },
        },
        data: { status: 'dismissed' },
      })
      return NextResponse.json({ success: true, message: 'Queue cleared successfully' })
    }

    if (action === 'resend') {
      // Find all pending/failed schedules for this patient
      const schedules = await prisma.medicineSchedule.findMany({
        where: {
          status: { in: ['pending', 'failed'] },
          medicine: {
            patientId: patientId,
            doctorId: doctorId,
          },
        },
        include: {
          medicine: {
            include: {
              patient: true,
              doctor: true,
            },
          },
        },
      })

      if (schedules.length === 0) {
        return NextResponse.json({ success: true, message: 'No reminders to resend' })
      }

      let sentCount = 0
      for (const schedule of schedules) {
        const { medicine } = schedule
        const currentCount = (schedule.reminderCount || 0) + 1

        const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const feedbackLink = `${appUrl}/feedback/${medicine.id}`
        
        let prefix = currentCount > 1 ? `⚠️ Resend Reminder ${currentCount}: ` : '⏰ Manual Reminder: '
        let message = `${prefix}Please take your medicine ${medicine.name} (${medicine.dosage}).`
        
        // Add feedback link if it's likely one of the last ones
        const futureSchedules = await prisma.medicineSchedule.count({
          where: { medicineId: medicine.id, status: 'pending', id: { not: schedule.id } }
        })
        if (futureSchedules === 0) {
           message += `\n\nTap to give feedback:\n${feedbackLink}`
        }

        const buttons = [{ id: `taken_${schedule.id}`, title: 'Took Medicine' }]
        if (currentCount < 4) buttons.push({ id: `snooze_${schedule.id}`, title: 'Snooze 10m' })

        // 1. Try Interactive
        const result = await sendWhatsAppInteractiveMessage(medicine.patient.mobileNumber, message, buttons, doctorId)
        let delivered = result.success

        // 2. Fallback to Template
        if (!delivered) {
          const templateResult = await sendWhatsAppTemplateMessage(
            medicine.patient.mobileNumber,
            'healthyindia',
            [
              medicine.patient.name || 'Patient',
              medicine.name + ` (Attempt ${currentCount})`,
              medicine.dosage,
              medicine.doctor.name || 'your doctor'
            ],
            'en',
            doctorId
          )
          delivered = templateResult.success
        }

        if (delivered) {
          await prisma.medicineSchedule.update({
            where: { id: schedule.id },
            data: { status: 'sent', reminderCount: currentCount },
          })
          
          await prisma.reminderLog.create({
            data: {
              medicineId: medicine.id,
              scheduleId: schedule.id,
              doctorId: doctorId,
              action: 'manual_resend',
            },
          })
          sentCount++
        }
      }

      return NextResponse.json({ success: true, message: `Resent ${sentCount} reminders` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Reminder management error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
