import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

function stripTime(date: Date | string) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const today = stripTime(new Date())

    const tokens = await prisma.queueToken.findMany({
      where: {
        patientPhone: phone,
        date: { gte: today }
      },
      include: {
        doctor: { select: { name: true, clinicName: true } }
      },
      orderBy: { date: 'asc' }
    })

    // For each token, find the currently running token for that doctor and date
    const enrichedTokens = await Promise.all(tokens.map(async (t) => {
      const currentToken = await prisma.queueToken.findFirst({
        where: {
          doctorId: t.doctorId,
          date: t.date,
          status: 'IN_PROGRESS'
        },
        orderBy: { tokenNumber: 'asc' } // Lowest in progress is the one running
      })

      return {
        ...t,
        currentlyRunning: currentToken ? currentToken.tokenNumber : null
      }
    }))

    return NextResponse.json(enrichedTokens)
  } catch (error) {
    console.error('Error fetching token status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
