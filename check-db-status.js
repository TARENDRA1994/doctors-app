const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Latest Appointments ---')
  const apts = await prisma.appointment.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: { patient: { select: { name: true } } }
  })
  console.log(JSON.stringify(apts, null, 2))

  console.log('\n--- Latest Medicine Schedules ---')
  const schedules = await prisma.medicineSchedule.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: { medicine: { select: { name: true } } }
  })
  console.log(JSON.stringify(schedules, null, 2))

  console.log('\n--- Recent Reminder Logs ---')
  const logs = await prisma.reminderLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10
  })
  console.log(JSON.stringify(logs, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
