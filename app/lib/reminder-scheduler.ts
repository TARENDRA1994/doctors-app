import * as cron from 'node-cron'
import { prisma } from './prisma'
import { sendWhatsAppMessage, sendWhatsAppInteractiveMessage, sendWhatsAppTemplateMessage } from './whatsapp'


// Using centralized prisma

let scheduledJob: cron.ScheduledTask | null = null

export function startReminderScheduler() {
  if (scheduledJob) {
    console.log('Reminder scheduler already running')
    return
  }

  // Run every minute
  scheduledJob = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      // Find pending schedules that are due (including snoozed ones)
      const dueSchedules = await prisma.medicineSchedule.findMany({
        where: {
          status: 'pending',
          reminderCount: { lt: 2 }, // Limit to 2 attempts (Initial + 1 Snooze)
          scheduledAt: {
            lte: now,
            gte: new Date(now.getTime() - 15 * 60 * 1000) // Widen window to 15 mins to catch drifts
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
          let appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          
          // WhatsApp doesn't make raw IP addresses clickable. We append .nip.io to convert it to a domain.
          if (appUrl.match(/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
            appUrl = appUrl.replace(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/, '$1.nip.io')
          }
          
          const feedbackLink = `${appUrl}/feedback/${medicine.id}`
          message += `\n\n🎉 This is your FINAL dose for this prescription!\nPlease tap the link below to let your doctor know how you are feeling:\n${feedbackLink}`
        }

        const buttons = [
          { id: `taken_${schedule.id}`, title: 'Took Medicine' }
        ]

        // Only show snooze button if we haven't reached the limit
        if (currentCount < 2) {
          buttons.push({ id: `snooze_${schedule.id}`, title: 'Snooze 10m' })
        }

        try {
          // 0. ATOMIC CLAIM: Only one process can claim this reminder
          const claim = await prisma.medicineSchedule.updateMany({
            where: { id: schedule.id, status: 'pending' },
            data: { status: 'sending' }
          })

          if (claim.count === 0) {
            console.log(`⏩ Scheduler: Reminder ${schedule.id} already claimed by another process. Skipping.`)
            continue
          }

          console.log(`📤 Sending reminder (Attempt ${currentCount}) to ${medicine.patient.mobileNumber} for ${medicine.name}`)

          // 1. Try sending Interactive Message first
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

          if (medicine.patient.guardianNumber) {
            console.log(`👥 Sending smart guardian reminder to ${medicine.patient.guardianNumber} for ${medicine.name}`)
            
            const guardianResult = await sendWhatsAppInteractiveMessage(
              medicine.patient.guardianNumber,
              `Guardian Alert: \n\n${message}`,
              buttons,
              medicine.doctorId
            )

            if (!guardianResult.success && (guardianResult.errorCode === 131047 || guardianResult.error?.includes('24 hours'))) {
              console.log(`🔄 Guardian interactive reminder failed (${guardianResult.errorCode}), trying Template fallback for ${medicine.patient.guardianNumber}`)
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
              }
            })

            // Log the reminder
            await prisma.reminderLog.create({
              data: {
                medicineId: medicine.id,
                scheduleId: schedule.id,
                doctorId: medicine.doctorId,
                action: 'sent'
              }
            })

            console.log(
              `✅ Reminder (Attempt ${currentCount}) sent to ${medicine.patient.name} for ${medicine.name}`
            )
          } else {
            console.error(`❌ Failed to send reminder: ${result.error}`)
          }
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${medicine.patient.mobileNumber}:`, (error as any).message)
        }
      }

      if (dueSchedules.length > 0) {
        console.log(`📤 Sent ${dueSchedules.length} medicine reminders`)
      }
    } catch (error) {
      console.error('Reminder scheduler error:', error)
    }
  })

  console.log('🕐 Reminder scheduler started - checking every minute')
}

export function stopReminderScheduler() {
  if (scheduledJob) {
    scheduledJob.stop()
    scheduledJob = null
    console.log('Reminder scheduler stopped')
  }
}
