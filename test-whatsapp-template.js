require('dotenv').config({ path: '.env.local' });

async function testWhatsAppTemplate() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const to = '8878914647';
    
    console.log('Using Phone Number ID:', phoneNumberId ? 'Set' : 'Missing');
    console.log('Using Access Token:', accessToken ? 'Set' : 'Missing');

    let cleanNumber = '91' + to; // Defaulting to India

    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
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
                    name: 'hello_world',
                    language: {
                        code: 'en_US'
                    }
                }
            }),
        });

        const data = await response.json();
        console.log('Meta API Response HTTP Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testWhatsAppTemplate();
