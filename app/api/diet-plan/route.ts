import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../lib/prisma'
import { authOptions } from '../../lib/auth'
import { generateDietPlan } from '../../lib/gemini'


// Using centralized prisma

// Generate a new diet plan
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctorId = parseInt((session.user as any).id)
        const body = await request.json()
        const { patientId, doctorNotes, gender } = body

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
        }

        // Fetch patient with medicines
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                medicines: {
                    select: { name: true, dosage: true, frequency: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Generate diet plan using Gemini AI
        const planContent = await generateDietPlan({
            name: patient.name,
            age: patient.age,
            gender: gender || undefined,
            weight: patient.weight,
            height: patient.height,
            disease: patient.disease,
            medicines: patient.medicines,
            foodPreference: patient.foodPreference,
            allergies: patient.allergies,
            activityLevel: patient.activityLevel,
            doctorNotes: doctorNotes || undefined,
        })

        // Save to database
        const dietPlan = await prisma.dietPlan.create({
            data: {
                patientId,
                doctorId,
                planContent,
                context: JSON.stringify({
                    disease: patient.disease,
                    medicines: patient.medicines.map(m => m.name),
                    foodPreference: patient.foodPreference,
                    doctorNotes,
                }),
            }
        })

        return NextResponse.json({
            success: true,
            dietPlan: {
                id: dietPlan.id,
                planContent: dietPlan.planContent,
                createdAt: dietPlan.createdAt,
            }
        })
    } catch (error: any) {
        console.error('CRITICAL: Error generating diet plan:', error)
        return NextResponse.json(
            { error: `Gemini API Error: ${error.message || 'Unknown error'}. Please check your terminal logs for details.` },
            { status: 500 }
        )
    }
}

// Fetch diet plans for a patient
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const patientId = searchParams.get('patientId')

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
        }

        const dietPlans = await prisma.dietPlan.findMany({
            where: { patientId: parseInt(patientId) },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                planContent: true,
                context: true,
                createdAt: true,
            }
        })

        return NextResponse.json(dietPlans)
    } catch (error) {
        console.error('Error fetching diet plans:', error)
        return NextResponse.json({ error: 'Failed to fetch diet plans' }, { status: 500 })
    }
}
