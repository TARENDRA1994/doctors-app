import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendWhatsAppMessage, sendWhatsAppInteractiveMessage, sendWhatsAppTemplateMessage } from '../../../lib/whatsapp'


// Using centralized prisma

// This is the core logic for checking and sending reminders.
// It can be triggered by GET (Vercel Cron) or POST (manual testing).
async function checkAndSendReminders() {
  try {
    const now = new Date()
    // Widen the window to 10 minutes to avoid race conditions with cron job timing
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    // Find pending schedules that are due (including snoozed ones)
    const dueSchedules = await prisma.medicineSchedule.findMany({
      where: {
        status: 'pending',
        reminderCount: { lt: 4 }, // Limit to 4 attempts (Initial + 3 Snoozes)
        scheduledAt: {
          lte: now,
          gte: new Date(now.getTime() - 15 * 60 * 1000), // Widen window to 15 mins
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

    if (dueSchedules.length === 0) {
      return { message: 'No due reminders found.', count: 0 }
    }

    let sentCount = 0
    for (const schedule of dueSchedules) {
      const { medicine } = schedule
      const currentCount = (schedule.reminderCount || 0) + 1

      // Determine if this is the absolute last dose for this medicine
      const futurePendingSchedules = await prisma.medicineSchedule.count({
        where: {
          medicineId: medicine.id,
          status: 'pending',
          id: { not: schedule.id }
        }
      })
      const isLastDose = futurePendingSchedules === 0

      // Craft the message based on reminder count
      let prefix = ''
      if (currentCount === 2) prefix = '⚠️ Reminder 2: '
      else if (currentCount === 3) prefix = '⚠️ Reminder 3: '
      else if (currentCount === 4) prefix = '🛑 FINAL REMINDER: '
      else prefix = '⏰ Reminder: '

      let message = `${prefix}Time to take your medicine ${medicine.name} (${medicine.dosage}).`

      if (isLastDose) {
        // Use the absolute URL via NEXTAUTH_URL or a generic request origin
        const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
        const feedbackLink = `${appUrl}/feedback/${medicine.id}`
        message += `\n\n🎉 This is your FINAL dose for this prescription!\nPlease tap the link below to let your doctor know how you are feeling:\n${feedbackLink}`
      }

      const buttons = [
        { id: `taken_${schedule.id}`, title: 'Took Medicine' }
      ]

      // Only show snooze button if we haven't reached the limit (4 total attempts means 3 snoozes max)
      if (currentCount < 4) {
        buttons.push({ id: `snooze_${schedule.id}`, title: 'Snooze 10m' })
      }

      try {
        // 0. ATOMIC CLAIM: Only one process (Scheduler or API) can claim this reminder
        const claim = await prisma.medicineSchedule.updateMany({
          where: { id: schedule.id, status: 'pending' },
          data: { status: 'sending' }
        })

        if (claim.count === 0) {
          console.log(`⏩ Reminder ${schedule.id} already claimed by another process. Skipping.`)
          continue
        }

        console.log(`📤 Sending reminder (Attempt ${currentCount}) to ${medicine.patient.mobileNumber} for ${medicine.name}`)

        // 1. Try sending Interactive Message first (Includes buttons: Took Medicine/Snooze)
        // This only works if the 24-hour messaging window is open
        const result = await sendWhatsAppInteractiveMessage(medicine.patient.mobileNumber, message, buttons, medicine.doctorId)

        // 2. Fallback to Template if Interactive Message fails for ANY reason
        let delivered = result.success
        if (!delivered) {
          console.log(`🔄 Interactive reminder failed (${result.errorCode}), trying Template fallback for ${medicine.patient.mobileNumber}`)
          
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
            medicine.doctorId
          )
          delivered = templateResult.success
        }

        // Handle Guardian if available
        if (medicine.patient.guardianNumber) {
          console.log(`👥 Sending smart guardian reminder to ${medicine.patient.guardianNumber} for ${medicine.name}`)
          const guardianResult = await sendWhatsAppInteractiveMessage(
            medicine.patient.guardianNumber,
            `Guardian Alert: \n\n${message}`,
            buttons,
            medicine.doctorId
          )

          if (!guardianResult.success && (guardianResult.errorCode === 131047 || guardianResult.error?.includes('24 hours'))) {
            await sendWhatsAppTemplateMessage(
              medicine.patient.guardianNumber,
              'healthyindia',
              [
                (medicine.patient.name || 'Patient') + ' (Guardian)',
                medicine.name,
                medicine.dosage,
                medicine.doctor.name || 'your doctor'
              ],
              'en',
              medicine.doctorId
            )
          }
        }

        if (delivered) {
          // Update status to sent and increment count
          await prisma.medicineSchedule.update({
            where: { id: schedule.id },
            data: {
              status: 'sent',
              reminderCount: currentCount
            },
          })
          
          // ... rest of logic

          // Log the reminder
          await prisma.reminderLog.create({
            data: {
              medicineId: medicine.id,
              scheduleId: schedule.id,
              doctorId: medicine.doctorId,
              action: 'sent',
            },
          })

          sentCount++
          console.log(`✅ Reminder (Attempt ${currentCount}) sent to ${medicine.patient.name} for ${medicine.name}`)
        } else {
          console.error(`❌ Failed to send reminder: ${result.error}`)
          await prisma.medicineSchedule.update({
            where: { id: schedule.id },
            data: { status: 'failed' },
          })
        }
      } catch (error: any) {
        console.error(
          `❌ Failed to send reminder for schedule ${schedule.id} to ${medicine.patient.mobileNumber}:`,
          error.message
        )
        // Update status to 'failed' to prevent retries for the same error
        await prisma.medicineSchedule.update({
          where: { id: schedule.id },
          data: { status: 'failed' },
        })
      }
    }

    return { message: `Processed ${dueSchedules.length} schedules. Sent ${sentCount} reminders.`, count: sentCount }
  } catch (error: any) {
    console.error('Check reminders error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/reminders/check - For Vercel Cron Jobs
export async function GET() {
  const result = await checkAndSendReminders()
  return NextResponse.json(result)
}

// POST /api/reminders/check - For manual testing
export async function POST() {
  const result = await checkAndSendReminders()
  return NextResponse.json(result)
}