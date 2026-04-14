import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '../../lib/whatsapp'


// Using centralized prisma

// GET /api/medicines - Get all medicines for the logged-in doctor
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const medicines = await prisma.medicine.findMany({
      where: { doctorId: parseInt((session.user as any).id) },
      include: {
        patient: true,
        schedules: true
      }
    })

    return NextResponse.json(medicines)
  } catch (error) {
    console.error('Get medicines error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/medicines - Create a new medicine and schedules
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, dosage, frequency, reminderTime, startDate, endDate, instructions, patientId } = await request.json()

    // Get doctor and patient
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt((session.user as any).id) }
    })

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(patientId) }
    })

    if (!doctor || !patient) {
      return NextResponse.json({ error: 'Doctor or patient not found' }, { status: 404 })
    }

    // Create medicine
    const medicine = await prisma.medicine.create({
      data: {
        name,
        dosage,
        frequency: parseInt(frequency),
        reminderTime,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructions,
        doctorId: doctor.id,
        patientId: patient.id,
      }
    })

    // Create schedules based on frequency and reminderTime
    const schedules = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Handle test-2min special case
    if (reminderTime === 'test-2min') {
      // Create a single schedule 2 minutes from now
      const testTime = new Date(Date.now() + 2 * 60 * 1000)
      schedules.push({
        medicineId: medicine.id,
        scheduledAt: testTime,
      })
    } else {
      // Parse comma-separated times (e.g., "08:00,20:00")
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

    // Format times for display in WhatsApp message
    let timeDisplay = reminderTime
    if (reminderTime === 'test-2min') {
      timeDisplay = '2 minutes (Test)'
    } else {
      // Convert comma-separated HH:MM times to readable format
      const times = reminderTime.split(',').map((t: string) => {
        const [h, m] = t.trim().split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const displayH = h % 12 || 12
        return `${displayH}:${String(m || 0).padStart(2, '0')} ${ampm}`
      })
      timeDisplay = times.join(' & ')
    }

    const message = `Hello ${patient.name},\nDr. ${doctor.name} has scheduled your medicine reminder.\n\n💊 Medicine: ${medicine.name}\n💉 Dosage: ${medicine.dosage}\n⏰ Time: ${timeDisplay}\n\nYou will receive reminder notifications when it is time to take your medicine.`

    try {
      // 1. ALWAYS send the Template message first to guarantee initial delivery
      // This ensures the patient receives a notification even outside the 24-hour window
      await sendWhatsAppTemplateMessage(
        patient.mobileNumber,
        'healthyindia', // Use User's approved template
        [
          patient.name || 'Patient',
          medicine.name,
          medicine.dosage,
          doctor.name || 'your doctor'
        ],
        'en',
        doctor.id
      )

      // 2. Try sending the detailed free-form message right after
      // If the patient's 24-hour window is active, they will receive the full details.
      // If closed, Meta silently drops this one, but the Template above ensures they got notified.
      await sendWhatsAppMessage(patient.mobileNumber, message, doctor.id)
    } catch (error) {
      console.error('WhatsApp send error:', error)
      // Continue, don't fail the request
    }

    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    console.error('Create medicine error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}