import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { sendWhatsAppMessage } from '@/app/lib/whatsapp'

function stripTime(date: Date | string) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = parseInt((session.user as any).id)
    if (isNaN(doctorId)) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const queryDate = dateParam ? stripTime(dateParam) : stripTime(new Date())

    const tokens = await prisma.queueToken.findMany({
      where: {
        doctorId,
        date: queryDate
      },
      orderBy: {
        tokenNumber: 'asc'
      }
    })

    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Error fetching admin queue tokens:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = parseInt((session.user as any).id)
    if (isNaN(doctorId)) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    const { patientName, patientPhone, dateStr } = await request.json()
    if (!patientName || !patientPhone || !dateStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const requestedDate = stripTime(dateStr)

    const lastToken = await prisma.queueToken.findFirst({
      where: {
        doctorId,
        date: requestedDate
      },
      orderBy: {
        tokenNumber: 'desc'
      }
    })

    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1

    const newQueueToken = await prisma.queueToken.create({
      data: {
        doctorId,
        patientName,
        patientPhone,
        date: requestedDate,
        tokenNumber,
        status: 'CONFIRMED' // Admin-created offline tokens are automatically confirmed
      }
    })

    return NextResponse.json(newQueueToken)
  } catch (error) {
    console.error('Error adding offline token:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = parseInt((session.user as any).id)
    if (isNaN(doctorId)) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    const { tokenId, status } = await request.json()
    if (!tokenId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const token = await prisma.queueToken.findUnique({ where: { id: parseInt(tokenId) } })
    if (!token || token.doctorId !== doctorId) {
      return NextResponse.json({ error: 'Token not found or unauthorized' }, { status: 404 })
    }

    const updatedToken = await prisma.queueToken.update({
      where: { id: parseInt(tokenId) },
      data: { status }
    })

    // Send WhatsApp Notification for accept/reject
    try {
      if (status === 'CONFIRMED' && token.status !== 'CONFIRMED') {
        const msg = `Hello ${updatedToken.patientName},\n\nYour appointment request for ${updatedToken.date.toDateString()} has been *CONFIRMED*!\n\nYour Queue Number is: *#${updatedToken.tokenNumber}*\n\nYou can check your live queue status on our website.`
        await sendWhatsAppMessage(updatedToken.patientPhone, msg, doctorId)
      } else if (status === 'CANCELLED' && token.status !== 'CANCELLED') {
        const msg = `Hello ${updatedToken.patientName},\n\nUnfortunately, your appointment request for ${updatedToken.date.toDateString()} has been *CANCELLED* by the clinic. Please contact the clinic for more details.`
        await sendWhatsAppMessage(updatedToken.patientPhone, msg, doctorId)
      }
    } catch (waErr) {
      console.error('Failed to send WhatsApp notification:', waErr)
      // We don't fail the API if WhatsApp fails
    }

    return NextResponse.json(updatedToken)
  } catch (error) {
    console.error('Error updating token status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
