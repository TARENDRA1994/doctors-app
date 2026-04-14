import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcrypt'


// Using centralized prisma

export async function POST(request: NextRequest) {
  try {
    const { name, clinicName, mobileNumber, whatsappNumber, email, password } = await request.json()

    // Check if doctor already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email }
    })

    if (existingDoctor) {
      return NextResponse.json({ error: 'Doctor already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        name,
        clinicName,
        mobileNumber,
        whatsappNumber,
        email,
        password: hashedPassword,
        subscriptionStatus: 'INACTIVE', // New doctors must be activated manually
        planType: 'TRIAL'
      }
    })

    return NextResponse.json({ message: 'Doctor registered successfully', doctorId: doctor.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}