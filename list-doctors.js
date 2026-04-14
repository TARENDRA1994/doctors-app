const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function list() {
    const doctors = await prisma.doctor.findMany()
    doctors.forEach(d => console.log(`ID: ${d.id} | Email: ${d.email}`))
    await prisma.$disconnect()
}
list()
