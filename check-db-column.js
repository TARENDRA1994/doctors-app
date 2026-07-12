const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const feedbacks = await prisma.$queryRaw`SELECT * FROM "Feedback" LIMIT 1`;
        console.log("Feedback columns:", Object.keys(feedbacks[0] || {}));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
