const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugSchedules() {
  try {
    const schedules = await prisma.medicineSchedule.findMany({
      include: {
        medicine: {
          include: {
            patient: true,
            doctor: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log('All Medicine Schedules:')
    schedules.forEach(schedule => {
      console.log(`ID: ${schedule.id}, Medicine: ${schedule.medicine.name}, Patient: ${schedule.medicine.patient.name}, Scheduled: ${schedule.scheduledAt}, Status: ${schedule.status}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSchedules()