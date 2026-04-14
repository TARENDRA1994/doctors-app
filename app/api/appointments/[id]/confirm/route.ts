import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendWhatsAppMessage } from '../../../../lib/whatsapp'


// Using centralized prisma

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const appointmentId = parseInt(params.id)

        if (isNaN(appointmentId)) {
            return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 })
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: true,
                doctor: true,
            }
        })

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
        }

        if (appointment.status === 'CONFIRMED') {
            return NextResponse.json({ message: 'Appointment is already confirmed' })
        }

        // 1. Update Appointment Status in DB
        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CONFIRMED' }
        })

        // 2. Notify the Doctor via WhatsApp
        // Usually doctors are using the app on web, but if we have their WhatsApp Number:
        if (appointment.doctor.whatsappNumber) {
            const message = `📅 Appointment Confirmed!\n\n${appointment.patient.name} has accepted the follow-up visit for:\n\nSlot: ${appointment.proposedTime}\n\nYou can view it on your Dashboard.`
            await sendWhatsAppMessage(appointment.doctor.whatsappNumber, message)
            console.log(`Sent doctor whatsapp confirmation for apt ${appointmentId}`)
        }

        return NextResponse.json({ success: true, updatedAppointment })
    } catch (error) {
        console.error('Error confirming appointment:', error)
        return NextResponse.json({ error: 'Failed to confirm appointment' }, { status: 500 })
    }
}
