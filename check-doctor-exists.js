const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'tarendra.garhewal2024@gmail.com'
  console.log(`Checking for doctor with email: ${email}...`)
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { email }
    })
    
    if (doctor) {
      console.log('✅ Doctor found!')
      console.log('Name:', doctor.name)
      console.log('ID:', doctor.id)
      console.log('Hashed Password starts with:', doctor.password.substring(0, 10) + '...')
    } else {
      console.log('❌ Doctor NOT found in Supabase!')
      const allDoctors = await prisma.doctor.findMany({
        select: { email: true }
      })
      console.log('Existing doctor emails in Supabase:', allDoctors.map(d => d.email))
    }
  } catch (err) {
    console.error('❌ Error checking database:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
