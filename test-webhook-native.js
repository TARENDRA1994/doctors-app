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
                            "messages": [
                                {
                                    "from": "918878914647",
                                    "type": "interactive",
                                    "interactive": {
                                        "type": "button_reply",
                                        "button_reply": {
                                            "id": "taken_99999", 
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

    const res = await globalThis.fetch('https://deepskyblue-gerbil-405007.hostingersite.com/api/whatsapp/webhook', {
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
