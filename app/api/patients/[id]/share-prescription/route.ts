import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientId = parseInt(params.id)
    
    // Verify ownership
    const patient = await prisma.patient.findFirst({
        where: { id: patientId, doctorId: parseInt(session.user.id) }
    })

    if (!patient) {
        return NextResponse.json({ error: 'Patient not found or unauthorized' }, { status: 404 })
    }

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: { prescriptionSharedAt: new Date() }
    })

    return NextResponse.json({ success: true, prescriptionSharedAt: updated.prescriptionSharedAt })
  } catch (error) {
    console.error('Share prescription error:', error)
    return NextResponse.json({ error: 'Failed to share prescription' }, { status: 500 })
  }
}
