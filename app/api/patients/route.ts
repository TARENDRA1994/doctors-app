import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { sendWhatsAppTemplateMessage } from '../../lib/whatsapp'

function stripTime(date: Date | string) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}


// Using centralized prisma

// GET /api/patients - Get all patients for the logged-in doctor
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('GET patients - Session:', session)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = parseInt((session.user as any).id)
    console.log('GET patients - Doctor ID:', doctorId)

    const patients = await prisma.patient.findMany({
      where: { doctorId },
      include: {
        medicines: {
          include: {
            schedules: true
          }
        }
      }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    console.log('Session user:', session.user)

    const { name, mobileNumber, guardianNumber, age, disease, weight, height, foodPreference, allergies, activityLevel } = body

    if (!name || !mobileNumber) {
      return NextResponse.json({ error: 'Name and mobile number are required' }, { status: 400 })
    }

    // Ensure phone number has +91 country code
    let formattedNumber = mobileNumber.toString().trim()
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+91' + formattedNumber.replace(/^91/, '') // Remove 91 if already present
    }

    let formattedGuardianNumber = null
    if (guardianNumber && guardianNumber.toString().trim() !== '') {
      formattedGuardianNumber = guardianNumber.toString().trim()
      if (!formattedGuardianNumber.startsWith('+')) {
        formattedGuardianNumber = '+91' + formattedGuardianNumber.replace(/^91/, '')
      }
    }

    const doctorId = parseInt((session.user as any).id)
    console.log('Doctor ID:', doctorId)

    // Check if patient already exists for this doctor with same mobile number
    let patient = await prisma.patient.findFirst({
      where: {
        mobileNumber: formattedNumber,
        doctorId: doctorId
      }
    })

    if (patient) {
      // If patient exists, maybe update their changing details like age or latest reported disease
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          name, // Could be correcting spelling
          guardianNumber: formattedGuardianNumber || patient.guardianNumber,
          age: age ? parseInt(age) : patient.age,
          disease: disease || patient.disease,
          weight: weight ? parseFloat(weight) : patient.weight,
          height: height ? parseFloat(height) : patient.height,
          foodPreference: foodPreference || patient.foodPreference,
          allergies: allergies || patient.allergies,
        }
      });
      (patient as any).isExisting = true;
      console.log('Patient already exists, updated details. Returning existing patient ID:', patient.id)
    } else {
      // Create fresh patient
      patient = await prisma.patient.create({
        data: {
          name,
          mobileNumber: formattedNumber,
          guardianNumber: formattedGuardianNumber,
          age: age ? parseInt(age) : null,
          disease,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          foodPreference: foodPreference || null,
          allergies: allergies || null,
          doctorId,
        }
      })
      console.log('Created new patient ID:', patient.id)

      // Send a welcome message via WhatsApp using the built-in hello_world template
      // This proves that adding any new patient will successfully trigger a message
      try {
        await sendWhatsAppTemplateMessage(
          patient.mobileNumber,
          'hello_world', // Use default Meta template
          [], // No variables needed
          'en_US', // English (US)
          doctorId
        )
        console.log(`✅ Sent hello_world welcome template to new patient ${patient.mobileNumber}`)
      } catch (waError) {
        console.error('Failed to send welcome WhatsApp message:', waError)
      }
    }

    // --- Automatically generate a QueueToken for today ---
    const today = stripTime(new Date())
    
    // Check if they already have a token for today to avoid duplicates
    const existingToken = await prisma.queueToken.findFirst({
      where: {
        doctorId,
        patientPhone: formattedNumber,
        date: today
      }
    })

    if (!existingToken) {
      const lastToken = await prisma.queueToken.findFirst({
        where: { doctorId, date: today },
        orderBy: { tokenNumber: 'desc' }
      })
      const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1

      await prisma.queueToken.create({
        data: {
          doctorId,
          patientName: name,
          patientPhone: formattedNumber,
          date: today,
          tokenNumber,
          status: 'CONFIRMED'
        }
      })
      console.log(`Created Queue Token #${tokenNumber} for patient ${name}`)
    }

    const responseData = {
      ...patient,
      isExisting: !!(patient as any).isExisting
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}