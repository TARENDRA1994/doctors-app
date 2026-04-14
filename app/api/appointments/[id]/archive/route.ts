import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const appointmentId = parseInt(params.id)

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        })

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
        }

        // Optional: verify that the appointment belongs to the logged-in doctor
        const doctorId = parseInt((session.user as any).id)
        if (appointment.doctorId !== doctorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'ARCHIVED' }
        })

        return NextResponse.json({ success: true, appointment: updatedAppointment })
    } catch (error) {
        console.error('Error archiving appointment:', error)
        return NextResponse.json({ error: 'Failed to archive appointment' }, { status: 500 })
    }
}
