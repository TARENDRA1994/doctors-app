import { NextResponse } from 'next/server'
import getConfig from 'next/config'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        // Return some basic health info
        return NextResponse.json({
            status: 'ok',
            time: new Date().toISOString(),
            env: {
                hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
                hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID
            }
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message })
    }
}
