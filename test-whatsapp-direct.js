import { sendWhatsAppMessage } from './app/lib/whatsapp.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function runTest() {
    console.log('Sending test message...')

    // Use the WhatsApp destination number defined in the environment, or hardcode here for a test
    // Get this from the patient or doctor record in the DB, or .env
    const targetNumber = process.env.WHATSAPP_TEST_NUMBER || 'CHANGE_THIS_TO_YOUR_NUMBER'

    console.log(`Sending to: ${targetNumber}`)

    try {
        const result = await sendWhatsAppMessage(targetNumber, '✅ Direct test notification from Node.js script.')
        console.log('Result:', result)
    } catch (error) {
        console.error('Failed:', error)
    }
}

runTest()
