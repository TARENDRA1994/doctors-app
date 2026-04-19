import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { generatePrescriptionPDF } from '../../../lib/pdf-generator'
import { prisma } from '../../../lib/prisma'

export async function GET(
    request: NextRequest
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const patientId = parseInt(searchParams.get('patientId') || '')
        let doctorId: number

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
        }

        if ((session.user as any).role === 'PATIENT') {
            const patientRecord = await prisma.patient.findUnique({
                where: { id: patientId }
            })
            if (!patientRecord || patientRecord.mobileNumber !== (session.user as any).mobileNumber) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 })
            }
            doctorId = patientRecord.doctorId
        } else {
            doctorId = parseInt((session.user as any).id)
        }

        const { buffer, fileName } = await generatePrescriptionPDF(patientId, doctorId)

        const isDownload = searchParams.get('download') === 'true'
        const disposition = isDownload ? 'attachment' : 'inline'

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `${disposition}; filename="${fileName}"`,
            }
        })

    } catch (error: any) {
        console.error('PDF Generation Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 })
    }
}
