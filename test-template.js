require('dotenv').config({ path: '.env.local' });

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

async function sendTestTemplate() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    // Use the user's phone number from the previous complaint
    const to = '8878914647'; 
    let cleanNumber = '91' + to; // Assume India for testing

    const parameters = [
        { type: 'text', text: 'Tarendra' }, // Patient Name
        { type: 'text', text: 'Medicine 1' }, // Medicine Name
        { type: 'text', text: '100mg' }, // Dosage
        { type: 'text', text: 'Dr. John' } // Doctor Name
    ];

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
                    to: cleanNumber,
                    type: 'template',
                    template: {
                        name: 'healthyindia',
                        language: {
                            code: 'en'
                        },
                        components: [
                            {
                                type: 'body',
                                parameters: parameters
                            }
                        ]
                    }
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

sendTestTemplate();
