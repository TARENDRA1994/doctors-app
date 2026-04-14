import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'


// Using centralized prisma

// GET /api/feedback/info?medicineId=123 - Get basic details to show on the feedback form
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const medicineId = searchParams.get('medicineId')

        if (!medicineId) {
            return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 })
        }

        const medicine = await prisma.medicine.findUnique({
            where: { id: parseInt(medicineId) },
            include: {
                patient: true
            }
        })

        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
        }

        return NextResponse.json({
            medicineName: medicine.name,
            patientName: medicine.patient.name,
        })
    } catch (error) {
        console.error('API /feedback/info GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
