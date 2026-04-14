/**
 * Meta WhatsApp Cloud API helper
 * Sends WhatsApp messages using Meta's Graph API
 */

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0'

import { prisma } from './prisma'

// Using centralized prisma

interface WhatsAppResponse {
    messaging_product: string
    contacts?: Array<{ input: string; wa_id: string }>
    messages?: Array<{ id: string }>
    error?: {
        message: string
        type: string
        code: number
        error_subcode?: number
        fbtrace_id: string
    }
}

/**
 * Send a WhatsApp text message via Meta Cloud API
 */
export async function sendWhatsAppMessage(
    to: string,
    body: string,
    doctorId?: number
): Promise<{ success: boolean; messageId?: string; error?: string; errorCode?: number; errorData?: any }> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
        console.error('❌ WhatsApp config missing. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.local')
        return { success: false, error: 'WhatsApp API not configured' }
    }

    // Clean up the phone number — remove spaces, dashes, parentheses
    let cleanNumber = to.replace(/[\s\-\(\)]/g, '')

    // Ensure it starts with country code (default to India +91)
    if (!cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.replace(/^0+/, '') // remove leading zeros
        if (!cleanNumber.startsWith('91')) {
            cleanNumber = '91' + cleanNumber
        }
        cleanNumber = '+' + cleanNumber
    }

    // Remove the + for Meta API (they want just digits)
    const whatsappNumber = cleanNumber.replace('+', '')

    console.log(`📤 Sending WhatsApp message via Meta API`)
    console.log(`   To: ${whatsappNumber}`)
    console.log(`   Body: ${body.substring(0, 50)}...`)

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
                    to: whatsappNumber,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: body,
                    },
                }),
            }
        )

        const data: WhatsAppResponse = await response.json()

        if (!response.ok || data.error) {
            const errorMsg = data.error?.message || `HTTP ${response.status}`
            console.error(`❌ WhatsApp send failed:`, errorMsg)
            console.error(`   Full error data:`, JSON.stringify(data.error, null, 2))
            return { success: false, error: errorMsg, errorCode: data.error?.code, errorData: data.error }
        }

        const messageId = data.messages?.[0]?.id || 'unknown'
        console.log(`✅ WhatsApp message sent! ID: ${messageId} | To: ${whatsappNumber}`)
        
        // Track message count if doctor ID is provided
        if (doctorId) {
            try {
                await prisma.doctor.update({
                    where: { id: doctorId },
                    data: { whatsappMsgCount: { increment: 1 } }
                })
            } catch (dbErr) {
                console.error('Failed to increment WhatsApp message count:', dbErr)
            }
        }

        return { success: true, messageId }
    } catch (error: any) {
        console.error('❌ WhatsApp API request failed:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Send a WhatsApp interactive message via Meta Cloud API
 * Buttons array should contain objects like: { id: 'btn_1', title: 'Button Text' }
 */
export async function sendWhatsAppInteractiveMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    doctorId?: number
): Promise<{ success: boolean; messageId?: string; error?: string; errorCode?: number; errorData?: any }> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
        console.error('❌ WhatsApp config missing. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.local')
        return { success: false, error: 'WhatsApp API not configured' }
    }

    // Clean up the phone number
    let cleanNumber = to.replace(/[\s\-\(\)]/g, '')

    // Ensure it starts with country code (default to India +91)
    if (!cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.replace(/^0+/, '') // remove leading zeros
        if (!cleanNumber.startsWith('91')) {
            cleanNumber = '91' + cleanNumber
        }
        cleanNumber = '+' + cleanNumber
    }

    // Remove the + for Meta API
    const whatsappNumber = cleanNumber.replace('+', '')

    console.log(`📤 Sending WhatsApp interactive message via Meta API`)
    console.log(`   To: ${whatsappNumber}`)
    console.log(`   Body: ${bodyText.substring(0, 50)}...`)

    // Format buttons for Meta API
    const interactiveButtons = buttons.map(btn => ({
        type: 'reply',
        reply: {
            id: btn.id,
            title: btn.title.substring(0, 20) // Max 20 chars allowed by Meta
        }
    }))

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
                    to: whatsappNumber,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: {
                            text: bodyText
                        },
                        action: {
                            buttons: interactiveButtons
                        }
                    }
                }),
            }
        )

        const data: WhatsAppResponse = await response.json()

        if (!response.ok || data.error) {
            const errorMsg = data.error?.message || `HTTP ${response.status}`
            console.error(`❌ WhatsApp interactive send failed:`, errorMsg)
            console.error(`   Full error data:`, JSON.stringify(data.error, null, 2))
            return { success: false, error: errorMsg, errorCode: data.error?.code, errorData: data.error }
        }

        const messageId = data.messages?.[0]?.id || 'unknown'
        console.log(`✅ WhatsApp interactive message sent! ID: ${messageId}`)

        // Track message count if doctor ID is provided
        if (doctorId) {
            try {
                await prisma.doctor.update({
                    where: { id: doctorId },
                    data: { whatsappMsgCount: { increment: 1 } }
                })
            } catch (dbErr) {
                console.error('Failed to increment WhatsApp message count:', dbErr)
            }
        }

        return { success: true, messageId }
    } catch (error: any) {
        console.error('❌ WhatsApp interactive API request failed:', error.message)
        return { success: false, error: error.message }
    }
}
/**
 * Send a WhatsApp template message via Meta Cloud API
 * components should be an array of strings representing the {{1}}, {{2}}, etc. variables
 */
export async function sendWhatsAppTemplateMessage(
    to: string,
    templateName: string,
    variables: string[],
    languageCode: string = 'en',
    doctorId?: number
): Promise<{ success: boolean; messageId?: string; error?: string; errorCode?: number; errorData?: any }> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
        console.error('❌ WhatsApp config missing. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.local')
        return { success: false, error: 'WhatsApp API not configured' }
    }

    // Clean up the phone number
    let cleanNumber = to.replace(/[\s\-\(\)]/g, '')
    if (!cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.replace(/^0+/, '')
        if (!cleanNumber.startsWith('91')) cleanNumber = '91' + cleanNumber
        cleanNumber = '+' + cleanNumber
    }
    const whatsappNumber = cleanNumber.replace('+', '')

    // Format components for Meta API
    const parameters = variables.map(val => ({
        type: 'text',
        text: val
    }))

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
                    to: whatsappNumber,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: languageCode
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
        )

        const data: WhatsAppResponse = await response.json()

        if (!response.ok || data.error) {
            const errorMsg = data.error?.message || `HTTP ${response.status}`
            console.error(`❌ WhatsApp template send failed:`, errorMsg)
            return { success: false, error: errorMsg, errorCode: data.error?.code, errorData: data.error }
        }

        const messageId = data.messages?.[0]?.id || 'unknown'
        console.log(`✅ WhatsApp template message sent! ID: ${messageId}`)

        // Track message count if doctor ID is provided
        if (doctorId) {
            try {
                await prisma.doctor.update({
                    where: { id: doctorId },
                    data: { whatsappMsgCount: { increment: 1 } }
                })
            } catch (dbErr) {
                console.error('Failed to increment WhatsApp message count:', dbErr)
            }
        }

        return { success: true, messageId }
    } catch (error: any) {
        console.error('❌ WhatsApp template API request failed:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Upload a file as media to Meta Cloud API
 */
export async function uploadWhatsAppMedia(
    buffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
        return { success: false, error: 'WhatsApp API not configured' }
    }

    try {
        const formData = new FormData()
        const blob = new Blob([new Uint8Array(buffer)], { type: mimeType })
        formData.append('file', blob, fileName)
        formData.append('type', mimeType)
        formData.append('messaging_product', 'whatsapp')

        const response = await fetch(
            `${GRAPH_API_URL}/${phoneNumberId}/media`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            }
        )

        const data = await response.json()

        if (!response.ok || data.error) {
            return { success: false, error: data.error?.message || `HTTP ${response.status}` }
        }

        return { success: true, mediaId: data.id }
    } catch (error: any) {
        console.error('❌ WhatsApp media upload failed:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Send a document via WhatsApp Cloud API
 */
export async function sendWhatsAppDocument(
    to: string,
    mediaId: string,
    fileName: string,
    doctorId?: number,
    caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
        return { success: false, error: 'WhatsApp API not configured' }
    }

    // Clean up the phone number
    let cleanNumber = to.replace(/[\s\-\(\)]/g, '')
    if (!cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.replace(/^0+/, '')
        if (!cleanNumber.startsWith('91')) cleanNumber = '91' + cleanNumber
        cleanNumber = '+' + cleanNumber
    }
    const whatsappNumber = cleanNumber.replace('+', '')

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
                    to: whatsappNumber,
                    type: 'document',
                    document: {
                        id: mediaId,
                        filename: fileName,
                        caption: caption
                    }
                }),
            }
        )

        const data: WhatsAppResponse = await response.json()

        if (!response.ok || data.error) {
            return { success: false, error: data.error?.message || `HTTP ${response.status}` }
        }

        const messageId = data.messages?.[0]?.id || 'unknown'

        // Track message count
        if (doctorId) {
            try {
                await prisma.doctor.update({
                    where: { id: doctorId },
                    data: { whatsappMsgCount: { increment: 1 } }
                })
            } catch (dbErr) {
                console.error('Failed to increment WhatsApp message count:', dbErr)
            }
        }

        return { success: true, messageId }
    } catch (error: any) {
        console.error('❌ WhatsApp document send failed:', error.message)
        return { success: false, error: error.message }
    }
}
