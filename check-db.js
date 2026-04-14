const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const columns = await prisma.$queryRaw`PRAGMA table_info(Doctor)`
    console.log('Doctor Table Columns:', columns)
    
    const doctorCount = await prisma.doctor.count()
    console.log('Total Doctors:', doctorCount)
    
    if (doctorCount > 0) {
      const firstDoctor = await prisma.doctor.findFirst()
      console.log('First Doctor (Sanitized):', { 
        id: firstDoctor.id, 
        name: firstDoctor.name,
        hasQualification: 'qualification' in firstDoctor,
        qualificationVal: firstDoctor.qualification
      })
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
