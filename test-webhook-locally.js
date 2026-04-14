async function testWebhook() {
  const payload = {
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "12345",
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
                      "id": "taken_83",
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
  }

  console.log('🚀 Sending mock appointment confirmation for ID 5...')
  const response = await fetch('http://localhost:3001/api/whatsapp/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  console.log('Response:', data)
}

testWebhook()
