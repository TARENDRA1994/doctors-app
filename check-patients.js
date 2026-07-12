const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const p = await prisma.patient.findMany({ where: { doctorId: 1 } });
    console.log(p);
}

main().catch(console.error).finally(() => prisma.$disconnect());
