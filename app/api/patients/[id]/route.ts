import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'


// Using centralized prisma

// GET /api/patients/[id] - Get full patient history
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const patientId = parseInt(params.id)
        const doctorId = parseInt((session.user as any).id)

        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                doctorId: doctorId
            },
            include: {
                medicines: {
                    include: {
                        feedback: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                labReports: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                vitals: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        return NextResponse.json(patient)
    } catch (error) {
        console.error('Get patient history error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/patients/[id] - Inactivate or Permanently Delete patient
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const patientId = parseInt(params.id)
        const doctorId = parseInt((session.user as any).id)

        // Check for hard delete flag
        const { searchParams } = new URL(request.url)
        const isHardDelete = searchParams.get('hard') === 'true'

        // Find patient first to ensure ownership
        const patient = await prisma.patient.findFirst({
            where: { id: patientId, doctorId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        if (isHardDelete) {
            await prisma.patient.delete({
                where: { id: patientId }
            })
            return NextResponse.json({ message: 'Patient permanently deleted' })
        }

        // Soft delete: set isActive to false
        const updatedPatient = await prisma.patient.update({
            where: { id: patientId },
            data: {
                isActive: false,
                status: 'INACTIVE'
            }
        })

        return NextResponse.json({ message: 'Patient inactivated successfully', patient: updatedPatient })
    } catch (error) {
        console.error('Delete patient error:', error)
        return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
    }
}
