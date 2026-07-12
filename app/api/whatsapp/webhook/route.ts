import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendWhatsAppMessage } from '../../../lib/whatsapp'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'


// Using centralized prisma

const LOG_FILE = path.join(process.cwd(), 'webhook-debug.log')
const logToFile = (msg: string) => {
    try {
        const timestamp = new Date().toISOString()
        fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`)
    } catch (e) {
        console.log(`[WEBHOOK LOG] ${msg}`)
    }
}

// Meta requires a GET request to verify the webhook URL
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Verify token matches the one set in Meta App Dashboard
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('✅ Webhook verified successfully')
        return new NextResponse(challenge, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
}

// POST request receives messages from users
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        logToFile(`--- NEW WEBHOOK EVENT ---`)
        logToFile(`Raw Body: ${JSON.stringify(body, null, 2)}`)

        // Check if it's a WhatsApp message event
        if (body.object === 'whatsapp_business_account' && body.entry && body.entry[0].changes) {
            const changes = body.entry[0].changes[0].value

            // Check if there is a message
            if (changes.messages && changes.messages.length > 0) {
                const message = changes.messages[0]
                const from = message.from // User's WhatsApp number

                // Check if message is an interactive button reply
                if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
                    const buttonId = message.interactive.button_reply.id
                    logToFile(`received button reply: ${buttonId} from ${from}`)
                    await handleButtonReply(from, buttonId)
                } else {
                    logToFile(`Received message type: ${message.type}`)
                }
            } else {
                logToFile('No messages in changes')
            }
        } else {
            logToFile('Not a valid WA message event structure or no messages found.')
            if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
                logToFile('Received a status update (delivered/read), ignoring.')
            }
        }

        // Meta API expects a 200 OK response quickly to acknowledge receipt
        return NextResponse.json({ status: 'ok' }, { status: 200 })
    } catch (error) {
        logToFile(`Webhook processing error: ${error}`)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function handleButtonReply(from: string, buttonId: string) {
    try {
        logToFile(`handleButtonReply: from=${from}, buttonId=${buttonId}`)
        // Parse buttonId, e.g., 'taken_123' or 'snooze_123' or 'confirm_apt_123'
        const parts = buttonId.split('_')

        // Handle appointment confirmation
        if (buttonId.startsWith('confirm_apt_')) {
            const aptId = parseInt(parts[2])
            logToFile(`Confirming appointment: ${aptId}`)
            if (isNaN(aptId)) {
                logToFile(`Invalid aptId: ${parts[2]}`)
                return
            }

            const appointment = await prisma.appointment.findUnique({
                where: { id: aptId },
                include: { doctor: true, patient: true }
            })

            if (!appointment) {
                logToFile(`Appointment not found: ${aptId}`)
                return
            }

            if (appointment.status === 'CONFIRMED') {
                logToFile(`Appointment already confirmed: ${aptId}`)
                await sendWhatsAppMessage(from, 'This appointment has already been confirmed.')
                return
            }

            // Update to confirmed
            await prisma.appointment.update({
                where: { id: aptId },
                data: { status: 'CONFIRMED' }
            })

            // Notify Doctor
            if (appointment.doctor.whatsappNumber) {
                const docMsg = `📅 Appointment Confirmed!\n\n${appointment.patient.name} has accepted the follow-up visit for:\n\nSlot: ${appointment.proposedTime}\n\nYou can view it on your Dashboard.`
                await sendWhatsAppMessage(appointment.doctor.whatsappNumber, docMsg)
            }

            // Acknowledge to Patient
            await sendWhatsAppMessage(from, `Thank you, ${appointment.patient.name}! Your appointment for ${appointment.proposedTime} is confirmed. Dr. ${appointment.doctor.name} has been notified.`)
            logToFile(`✅ Appointment ${aptId} confirmed via WhatsApp Webhook`)
            return
        }

        // Handle medicine reminders (backwards compatibility)
        const action = parts[0]
        const scheduleId = parseInt(parts[1])

        if (isNaN(scheduleId)) {
            logToFile(`Invalid schedule ID in button reply: ${buttonId}`)
            return
        }

        // Find the schedule to ensure it exists and we can log it
        const schedule = await prisma.medicineSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                medicine: {
                    include: {
                        patient: true,
                        doctor: true,
                        feedback: true
                    }
                }
            }
        })

        if (!schedule) {
            logToFile(`Schedule ${scheduleId} not found`)
            return
        }

        // Basic verification - number should match the patient
        const cleanPatientNumber = schedule.medicine.patient.mobileNumber.replace(/[\s\-\+\(\)]/g, '')
        if (!from.includes(cleanPatientNumber) && !cleanPatientNumber.includes(from)) {
            logToFile(`Warning: Reply from ${from} doesn't seem to match patient number ${schedule.medicine.patient.mobileNumber}`)
        }

        if (schedule.status === 'taken') {
            logToFile(`User tried to action a schedule that is already taken: ${scheduleId}`)
            await sendWhatsAppMessage(from, `You have already marked your ${schedule.medicine.name} as taken!`)
            return
        }

        if (action === 'snooze' && schedule.medicine.feedback.length > 0) {
            logToFile(`User tried to snooze but course is completed (feedback submitted).`)
            await sendWhatsAppMessage(from, `Your course for ${schedule.medicine.name} is already complete!`)
            return
        }

        if (action === 'taken') {
            // Update schedule to taken
            await prisma.medicineSchedule.update({
                where: { id: scheduleId },
                data: { status: 'taken' }
            })

            // Log the action
            await prisma.reminderLog.create({
                data: {
                    medicineId: schedule.medicine.id,
                    scheduleId: schedule.id,
                    doctorId: schedule.medicine.doctorId,
                    action: 'taken'
                }
            })

            logToFile(`✅ Patient took medicine: ${schedule.medicine.name}`)
            await sendWhatsAppMessage(from, `Great! We've logged that you took your ${schedule.medicine.name}. Stay healthy!`)

        } else if (action === 'snooze') {
            if (schedule.reminderCount >= 2) {
                await sendWhatsAppMessage(from, `You have reached the maximum number of snoozes for ${schedule.medicine.name}. Please take it as soon as possible!`)
                return
            }

            // Snooze for 10 minutes
            const newScheduledTime = new Date(Date.now() + 10 * 60 * 1000)

            await prisma.medicineSchedule.update({
                where: { id: scheduleId },
                data: {
                    status: 'pending',
                    scheduledAt: newScheduledTime
                }
            })

            // Log the snooze action
            await prisma.reminderLog.create({
                data: {
                    medicineId: schedule.medicine.id,
                    scheduleId: schedule.id,
                    doctorId: schedule.medicine.doctorId,
                    action: 'snoozed'
                }
            })

            logToFile(`⏳ Patient snoozed medicine (Snooze Attempt ${schedule.reminderCount}): ${schedule.medicine.name} to ${newScheduledTime.toLocaleTimeString()}`)
            await sendWhatsAppMessage(from, `Got it. We will remind you again about your ${schedule.medicine.name} in 10 minutes.`)
        }
    } catch (error) {
        logToFile(`Error handling button reply: ${error}`)
    }
}
