const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.patient.count();
    console.log('Patients count:', count);
    
    const docs = await prisma.doctor.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            _count: {
                select: { patients: true }
            }
        }
    });
    console.log(docs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
