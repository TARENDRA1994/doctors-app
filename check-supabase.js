const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Database Verification ---')
  console.log('Checking connection to Supabase...')
  try {
    const doctorCount = await prisma.doctor.count()
    const patientCount = await prisma.patient.count()
    
    console.log('✅ Connection Successful!')
    console.log('Total Doctors in Supabase:', doctorCount)
    console.log('Total Patients in Supabase:', patientCount)
    
    if (doctorCount > 0) {
      const latestDoctor = await prisma.doctor.findFirst({
        orderBy: { createdAt: 'desc' }
      })
      console.log('Latest Doctor:', latestDoctor.name, `(ID: ${latestDoctor.id})`)
    }
  } catch (err) {
    console.error('❌ Connection Failed!')
    console.error('Error Details:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
