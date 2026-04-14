import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const appointmentId = parseInt(params.id)
        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { 
                status: 'RESCHEDULED'
            }
        })

        return NextResponse.json({ success: true, appointment: updatedAppointment })
    } catch (error) {
        console.error('Error rescheduling appointment:', error)
        return NextResponse.json({ error: 'Failed to request reschedule' }, { status: 500 })
    }
}
