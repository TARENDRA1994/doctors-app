const { PrismaClient } = require('@prisma/client');

async function testUrl(url) {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });
    try {
        const count = await prisma.patient.count();
        console.log(`URL ${url} has ${count} patients`);
    } catch (e) {
        console.error(`URL ${url} failed:`, e.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const oldUrl = 'postgresql://postgres:Tarendra123DoctorsApp99@db.jjwwvcftkwlagswvgjlr.supabase.co:5432/postgres';
    const poolerUrl = 'postgresql://postgres.jjwwvcftkwlagswvgjlr:Tarendra123DoctorsApp99@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
    
    await testUrl(oldUrl);
    await testUrl(poolerUrl);
}

main();
