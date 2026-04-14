import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../../../lib/whatsapp'

// PATCH /api/medicines/[id] - Update medicine and schedules
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = parseInt((session.user as any).id)
    const medicineId = parseInt(params.id)
    const { name, dosage, frequency, reminderTime, startDate, endDate, instructions } = await request.json()

    // Verify medicine belongs to doctor
    const existingMedicine = await prisma.medicine.findFirst({
      where: { id: medicineId, doctorId },
      include: { patient: true }
    })

    if (!existingMedicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    const patient = existingMedicine.patient

    if (!doctor || !patient) {
        return NextResponse.json({ error: 'Doctor or patient not found' }, { status: 404 })
    }

    // Update medicine
    const medicine = await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        name,
        dosage,
        frequency: parseInt(frequency),
        reminderTime,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructions,
      }
    })

    // Delete existing pending schedules
    await prisma.medicineSchedule.deleteMany({
      where: {
        medicineId,
        status: 'pending'
      }
    })

    // Create new schedules
    const schedules = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (reminderTime === 'test-2min') {
      const testTime = new Date(Date.now() + 2 * 60 * 1000)
      schedules.push({
        medicineId: medicine.id,
        scheduledAt: testTime,
      })
    } else {
      const times = reminderTime.split(',').map((t: string) => t.trim())
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        for (const timeStr of times) {
          const [hour, minute] = timeStr.split(':').map(Number)
          let scheduledTime = new Date(date)
          scheduledTime.setHours(hour, minute || 0, 0, 0)
          schedules.push({
            medicineId: medicine.id,
            scheduledAt: new Date(scheduledTime),
          })
        }
      }
    }

    await prisma.medicineSchedule.createMany({
      data: schedules
    })

    // WhatsApp Notification for the update
    let timeDisplay = reminderTime
    if (reminderTime === 'test-2min') {
      timeDisplay = '2 minutes (Test)'
    } else {
      const times = reminderTime.split(',').map((t: string) => {
        const [h, m] = t.trim().split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const displayH = h % 12 || 12
        return `${displayH}:${String(m || 0).padStart(2, '0')} ${ampm}`
      })
      timeDisplay = times.join(' & ')
    }

    const message = `*Updated Medicine Schedule*\n\nHello ${patient.name},\nDr. ${doctor.name} has updated your medicine schedule.\n\n💊 Medicine: ${medicine.name}\n💉 Dosage: ${medicine.dosage}\n⏰ New Time: ${timeDisplay}\n\nYour reminders have been updated accordingly.`

    try {
        const result = await sendWhatsAppMessage(patient.mobileNumber, message, doctor.id)
        if (!result.success) {
            await sendWhatsAppTemplateMessage(
                patient.mobileNumber,
                'healthyindia',
                [
                  patient.name || 'Patient',
                  medicine.name + " (Updated)",
                  medicine.dosage,
                  doctor.name || 'your doctor'
                ],
                'en',
                doctor.id
            )
        }
    } catch (error) {
        console.error('WhatsApp send error during update:', error)
    }

    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Update medicine error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/medicines/[id] - Delete medicine and schedules
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const doctorId = parseInt((session.user as any).id)
        const medicineId = parseInt(params.id)

        const medicine = await prisma.medicine.findFirst({
            where: { id: medicineId, doctorId }
        })

        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found or unauthorized' }, { status: 404 })
        }

        await prisma.medicine.delete({
            where: { id: medicineId }
        })

        return NextResponse.json({ message: 'Medicine deleted successfully' })
    } catch (error) {
        console.error('Delete medicine error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
