import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(session.user.id) },
            select: {
                name: true,
                email: true,
                clinicName: true,
                mobileNumber: true,
                whatsappNumber: true,
                qualification: true,
                specialization: true,
                degree: true,
                address: true,
                fellowships: true,
                website: true,
                selectedTemplate: true,
                consultationFee: true
            }
        })

        if (!doctor) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
        }

        return NextResponse.json(doctor)
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const doctorId = parseInt(session.user.id)

        const updatedDoctor = await prisma.doctor.update({
            where: { id: doctorId },
            data: {
                name: data.name,
                clinicName: data.clinicName,
                whatsappNumber: data.whatsappNumber,
                qualification: data.qualification,
                specialization: data.specialization,
                degree: data.degree,
                address: data.address,
                fellowships: data.fellowships,
                website: data.website,
                selectedTemplate: data.selectedTemplate,
                consultationFee: data.consultationFee
            }
        })

        return NextResponse.json({ 
            success: true, 
            message: 'Profile updated successfully',
            doctor: updatedDoctor 
        })
    } catch (error: any) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
