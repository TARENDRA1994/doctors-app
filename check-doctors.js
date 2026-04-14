const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const doctors = await prisma.doctor.findMany()
    console.log("Doctors:", JSON.stringify(doctors.map(d => ({ id: d.id, email: d.email })), null, 2))
    const feedbacks = await prisma.feedback.findMany()
    console.log("Feedbacks doctorId:", feedbacks.map(f => f.doctorId))
}
check().finally(() => prisma.$disconnect())
