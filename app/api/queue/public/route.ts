import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

function stripTime(date: Date | string) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { doctorId, patientName, patientPhone, dateStr } = body
    
    if (!doctorId || !patientName || !patientPhone || !dateStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const requestedDate = stripTime(dateStr)
    const today = stripTime(new Date())

    if (requestedDate < today) {
      return NextResponse.json({ error: 'Cannot book tokens for past dates' }, { status: 400 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) },
      select: { maxTokensPerDay: true }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const existingTokensCount = await prisma.queueToken.count({
      where: {
        doctorId: parseInt(doctorId),
        date: requestedDate,
        status: { not: 'CANCELLED' }
      }
    })

    if (existingTokensCount >= doctor.maxTokensPerDay) {
      return NextResponse.json({ error: 'Maximum tokens for this day have been reached' }, { status: 400 })
    }

    const lastToken = await prisma.queueToken.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        date: requestedDate
      },
      orderBy: {
        tokenNumber: 'desc'
      }
    })

    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1

    const newQueueToken = await prisma.queueToken.create({
      data: {
        doctorId: parseInt(doctorId),
        patientName,
        patientPhone,
        date: requestedDate,
        tokenNumber,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, token: newQueueToken })
  } catch (error) {
    console.error('Error creating public queue token:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
