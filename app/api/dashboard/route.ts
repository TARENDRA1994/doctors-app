import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'

export const dynamic = 'force-dynamic'

function stripTime(date: Date | string) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctorId = parseInt((session.user as any).id)

        if (isNaN(doctorId)) {
            return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
        }

        // Fetch everything in parallel using Promise.all
        const [patients, feedbacks, appointments, queueTokens] = await Promise.all([
            // 1. Fetch Patients with their medicines and schedules
            prisma.patient.findMany({
                where: { doctorId, isActive: true },
                include: {
                    medicines: {
                        include: {
                            schedules: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }),
            // 2. Fetch Unread Feedbacks
            prisma.feedback.findMany({
                where: { doctorId, isRead: false },
                include: {
                    patient: { select: { id: true, name: true, mobileNumber: true } },
                    medicine: { select: { name: true, dosage: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // 3. Fetch Active Appointments
            prisma.appointment.findMany({
                where: { 
                    doctorId,
                    status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] }
                },
                include: {
                    patient: { select: { name: true, mobileNumber: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // 4. Fetch QueueTokens
            prisma.queueToken.findMany({
                where: { 
                    doctorId,
                    date: { gte: stripTime(new Date()) },
                    status: { in: ['PENDING', 'CONFIRMED'] }
                },
                orderBy: { createdAt: 'desc' }
            })
        ])

        return NextResponse.json({
            patients,
            feedbacks,
            appointments,
            queueTokens,
            stats: {
                totalPatients: patients.length,
                totalMedicines: patients.reduce((acc, p) => acc + p.medicines.length, 0),
                pendingReminders: patients.reduce((acc, p) => 
                    acc + p.medicines.reduce((macc, m) => 
                        macc + m.schedules.filter(s => s.status === 'pending').length, 0
                    ), 0
                )
            }
        })
    } catch (error) {
        console.error('Dashboard API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
