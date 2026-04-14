const https = require('https');
require('dotenv').config({ path: '.env.local' });

async function sendText() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const to = '918878914647'; // Doctor Tarendra
    
    const data = JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
            preview_url: false,
            body: 'Plain text test to Doctor',
        },
    });

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v21.0/${phoneNumberId}/messages`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        },
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            const responseData = JSON.parse(body);
            console.log('Data:', JSON.stringify(responseData, null, 2));
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.write(data);
    req.end();
}

sendText();
