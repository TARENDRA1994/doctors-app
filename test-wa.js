require('dotenv').config({ path: '.env.local' });

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

async function sendTest() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    // Try sending to a static number to see the exact API response
    const to = '919000000000'; // Any number works for checking auth/schema errors

    try {
        const response = await fetch(
            `${GRAPH_API_URL}/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: 'Test',
                    },
                }),
            }
        );

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

sendTest();
