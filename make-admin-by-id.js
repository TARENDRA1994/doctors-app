const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function makeAdmin(id) {
    try {
        const doctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: {
                isAdmin: true,
                subscriptionStatus: 'ACTIVE',
                planType: 'PRO'
            }
        })
        console.log(`Success: Doctor with ID ${id} is now an Admin with PRO plan.`)
        console.log(doctor)
    } catch (error) {
        console.error('Error making admin:', error)
    } finally {
        await prisma.$disconnect()
    }
}

const id = process.argv[2] || '1'
makeAdmin(id)
