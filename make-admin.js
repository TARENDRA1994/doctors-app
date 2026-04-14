const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function makeAdmin(email) {
    try {
        const doctor = await prisma.doctor.update({
            where: { email },
            data: {
                isAdmin: true,
                subscriptionStatus: 'ACTIVE',
                planType: 'PRO'
            }
        })
        console.log(`Success: ${email} is now an Admin with PRO plan.`)
        console.log(doctor)
    } catch (error) {
        console.error('Error making admin:', error)
    } finally {
        await prisma.$disconnect()
    }
}

const email = process.argv[2] || 'tarendra.garhwal02@gmail.com'
makeAdmin(email)
