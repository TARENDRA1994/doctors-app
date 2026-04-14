const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const doctors = await prisma.doctor.findMany()
    console.log("Doctors:", JSON.stringify(doctors.map(d => ({ 
        id: d.id, 
        email: d.email, 
        isAdmin: d.isAdmin, 
        planType: d.planType,
        subscriptionStatus: d.subscriptionStatus
    })), null, 2))
}
check().finally(() => prisma.$disconnect())
