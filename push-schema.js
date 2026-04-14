import { execSync } from 'child_process'

try {
    console.log('Running Prisma DB Push...')
    // Using db push instead of migrate dev to bypass prompt issues in an automated script
    execSync('npx prisma db push', { stdio: 'inherit' })
    console.log('Successfully pushed database schema!')
} catch (error) {
    console.error('Failed to push schema:', error)
    process.exit(1)
}
