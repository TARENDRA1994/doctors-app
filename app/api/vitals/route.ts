import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'


// Using centralized prisma

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { patientId, type, value, unit } = body

        if (!patientId || !type || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const vital = await prisma.vital.create({
            data: {
                patientId: parseInt(patientId),
                type,
                value: value.toString(),
                unit: unit || '',
            }
        })

        return NextResponse.json(vital)
    } catch (error: any) {
        console.error('Vital Entry Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const patientId = parseInt(searchParams.get('patientId') || '')

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
        }

        const vitals = await prisma.vital.findMany({
            where: { patientId },
            orderBy: { timestamp: 'asc' }
        })

        return NextResponse.json(vitals)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
