const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function activateShefali() {
    try {
        const result = await prisma.doctor.updateMany({
            where: {
                name: { contains: 'Shefali' }
            },
            data: {
                subscriptionStatus: 'ACTIVE',
                planType: 'PRO'
            }
        })
        console.log('Activation Result:', result)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
activateShefali()
