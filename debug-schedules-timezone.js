const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const pendingSchedules = await prisma.medicineSchedule.findMany({
        where: {
            status: 'pending'
        },
        include: {
            medicine: true
        }
    })

    console.log('Pending Schedules:')
    for (const schedule of pendingSchedules) {
        console.log(`- ID: ${schedule.id}, Medicine: ${schedule.medicine.name}, Scheduled At: ${schedule.scheduledAt.toISOString()} (Local: ${schedule.scheduledAt.toString()})`)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
