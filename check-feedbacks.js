const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const feedbacks = await prisma.feedback.findMany()
    console.log("Feedbacks:", JSON.stringify(feedbacks, null, 2))
}
check().finally(() => prisma.$disconnect())
