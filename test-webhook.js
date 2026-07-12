const fetch = require('node-fetch');

async function testWebhook() {
    const payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "1234567890",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "1234567890",
                                "phone_number_id": "1234567890"
                            },
                            "contacts": [
                                {
                                    "profile": {
                                        "name": "Test User"
                                    },
                                    "wa_id": "918878914647"
                                }
                            ],
                            "messages": [
                                {
                                    "from": "918878914647",
                                    "id": "wamid.123",
                                    "timestamp": "1700000000",
                                    "type": "interactive",
                                    "interactive": {
                                        "type": "button_reply",
                                        "button_reply": {
                                            "id": "taken_99999", // non-existent schedule id just to see if the webhook processes it
                                            "title": "Took Medicine"
                                        }
                                    }
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    };

    const res = await fetch('https://deepskyblue-gerbil-405007.hostingersite.com/api/whatsapp/webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
}

testWebhook();
