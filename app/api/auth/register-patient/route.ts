import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const { name, mobileNumber, password } = await req.json()

    if (!mobileNumber || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required' },
        { status: 400 }
      )
    }

    // Check if patient already exists
    const existingPatient = await prisma.patientUser.findUnique({
      where: { mobileNumber }
    })

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Account with this mobile number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.patientUser.create({
      data: {
        name,
        mobileNumber,
        password: hashedPassword,
      }
    })

    return NextResponse.json(
      { message: 'Patient account created successfully', id: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
