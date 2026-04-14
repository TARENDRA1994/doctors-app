const https = require('https');
require('dotenv').config({ path: '.env.local' });

async function listTemplates() {
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!businessAccountId) {
        console.error('Missing WHATSAPP_BUSINESS_ACCOUNT_ID');
        return;
    }

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v21.0/${businessAccountId}/message_templates`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            const data = JSON.parse(body);
            if (data.data) {
                console.log('Templates found:', data.data.length);
                data.data.forEach(t => {
                    console.log(`- ${t.name} (${t.status}, ${t.language})`);
                });
            } else {
                console.log('Data:', JSON.stringify(data, null, 2));
            }
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.end();
}

listTemplates();
