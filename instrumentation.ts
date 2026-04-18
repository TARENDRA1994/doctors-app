export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { startReminderScheduler } = await import('./app/lib/reminder-scheduler')
        
        // Only start scheduler if NOT in build phase
        if (process.env.NEXT_PHASE !== 'phase-production-build') {
            startReminderScheduler()
        }
    }
}
