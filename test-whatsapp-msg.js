const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

async function run() {
    const to = '919999999999'; // Dummy indian number
    console.log(`Sending to ${to} using ID ${phoneNumberId}`);
    
    // Test the template that is approved
    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
            name: 'healthyindia',
            language: { code: 'en' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: 'Test Patient' },
                        { type: 'text', text: 'Paracetamol' },
                        { type: 'text', text: '500mg' },
                        { type: 'text', text: 'Smith' }
                    ]
                }
            ]
        }
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
