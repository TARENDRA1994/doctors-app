import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../lib/prisma'
import { authOptions } from '../../lib/auth'
import { sendWhatsAppInteractiveMessage, sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../../lib/whatsapp'


// Using centralized prisma

// Fetch Appointments for Dashboard
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctorId = parseInt((session.user as any).id)

        const appointments = await prisma.appointment.findMany({
            where: { doctorId },
            include: {
                patient: {
                    select: { name: true, mobileNumber: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(appointments)
    } catch (error) {
        console.error('Error fetching appointments:', error)
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }
}

// Create Pending Appointment & Send Invites
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { patientId, proposedTime, appointmentDate, bookedBy } = body

        let doctorId: number;

        if ((session.user as any).role === 'PATIENT') {
            const patientRecord = await prisma.patient.findUnique({ where: { id: patientId } })
            if (!patientRecord || patientRecord.mobileNumber !== (session.user as any).mobileNumber) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 })
            }
            doctorId = patientRecord.doctorId
        } else {
            doctorId = parseInt((session.user as any).id)
        }

        if (!patientId || !proposedTime) {
            return NextResponse.json({ error: 'Patient ID and proposed time are required' }, { status: 400 })
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId }
        })

        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        })

        if (!doctor || !patient) {
            return NextResponse.json({ error: 'Doctor or Patient not found' }, { status: 404 })
        }

        // 1. Create DB Record
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                proposedTime,
                appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
                status: 'PENDING'
            }
        })

        // 2. Draft the Magic Link message
        const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
        const magicLink = `${appUrl}/appointment/${appointment.id}`

        if (bookedBy !== 'PATIENT') {
            const message = `Hi ${patient.name}, Dr. ${doctor.name} noticed you aren't feeling well and would like to see you for a follow-up visit.\n\nProposed Slot: ${proposedTime}\n\nPlease tap the link below to confirm your appointment:\n${magicLink}`

            // 3. Smart Delivery: Try interactive message first
            const patientButtons = [
                { id: `confirm_apt_${appointment.id}`, title: 'Confirm Online' }
            ]
            const docResult = await sendWhatsAppInteractiveMessage(patient.mobileNumber, message, patientButtons, doctorId)
            
            if (!docResult.success) {
                // ... fallback
                await sendWhatsAppMessage(patient.mobileNumber, message, doctorId)
            }

            // Fallback to Template if interactive fails
            if (!docResult.success) {
                console.log(`🔄 Appointment interactive failed (${docResult.errorCode}), trying Template fallback for ${patient.mobileNumber}`)
                await sendWhatsAppTemplateMessage(
                    patient.mobileNumber,
                    'appointment_proposal',
                    [patient.name, doctor.name, proposedTime, magicLink],
                    'en',
                    doctorId
                )
            }

            // 4. Dual Send to Guardian if available
            if (patient.guardianNumber) {
                const guardianResult = await sendWhatsAppInteractiveMessage(
                    patient.guardianNumber,
                    `Guardian Alert: \n\n${message}`,
                    patientButtons,
                    doctorId
                )

                if (!guardianResult.success) {
                    await sendWhatsAppTemplateMessage(
                        patient.guardianNumber,
                        'appointment_proposal',
                        [`${patient.name} (Guardian Copy)`, doctor.name, proposedTime, magicLink],
                        'en',
                        doctorId
                    )
                }
            }
        }

        return NextResponse.json({ success: true, appointment })
    } catch (error) {
        console.error('Error creating appointment:', error)
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }
}
