import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'


// Using centralized prisma

// POST /api/feedback - Submit new feedback
export async function POST(request: NextRequest) {
    try {
        const { medicineId, status, notes } = await request.json()

        if (!medicineId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Ensure the medicine exists to get patient and doctor IDs
        const medicine = await prisma.medicine.findUnique({
            where: { id: parseInt(medicineId) }
        })

        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
        }

        // Check if feedback already exists for this medicine
        const existingFeedback = await prisma.feedback.findUnique({
            where: {
                medicineId: parseInt(medicineId)
            }
        })

        if (existingFeedback) {
            return NextResponse.json({ error: 'Feedback already submitted for this prescription' }, { status: 400 })
        }

        // Save the feedback to database
        const feedback = await prisma.feedback.create({
            data: {
                medicineId: parseInt(medicineId),
                patientId: medicine.patientId,
                doctorId: medicine.doctorId,
                status,
                notes,
                isRead: false
            }
        })

        return NextResponse.json({ success: true, feedback })
    } catch (error: any) {
        console.error('API /feedback POST error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
    }
}

// GET /api/feedback - Fetch feedbacks for the doctor's dashboard
export async function GET(request: NextRequest) {
    try {
        // Ideally we would get the doctorId from the NextAuth session here
        // but this endpoint handles it directly for demo simplicity

        // In a real app we'd verify session first:
        // const session = await getServerSession(authOptions)
        // const doctorId = session?.user?.id

        const { searchParams } = new URL(request.url)
        const doctorId = searchParams.get('doctorId')

        if (!doctorId) {
            return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
        }

        const feedbacks = await prisma.feedback.findMany({
            where: {
                doctorId: parseInt(doctorId)
            },
            include: {
                patient: { select: { id: true, name: true, mobileNumber: true } },
                medicine: { select: { id: true, name: true, dosage: true, endDate: true } }
            },
            orderBy: [
                { isRead: 'asc' },      // Unread items first
                { createdAt: 'desc' }   // Newest first
            ],
            take: 20                  // Limit for performance
        })

        return NextResponse.json(feedbacks)
    } catch (error) {
        console.error('API /feedback GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/feedback - Mark feedback as read
export async function PATCH(request: NextRequest) {
    try {
        const { id, isRead } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
        }

        await prisma.feedback.update({
            where: { id: parseInt(id) },
            data: { isRead }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API /feedback PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
