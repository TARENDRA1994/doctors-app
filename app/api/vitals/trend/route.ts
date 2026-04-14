import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'


// Using centralized prisma
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { patientId } = body

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
        }

        const patient = await prisma.patient.findUnique({
            where: { id: parseInt(patientId) },
            include: { vitals: true }
        })

        if (!patient || patient.vitals.length === 0) {
            return NextResponse.json({ error: 'Not enough data for trend analysis' }, { status: 400 })
        }

        // Prepare data for AI
        const vitalHistory = patient.vitals.map(v =>
            `- ${v.timestamp.toLocaleDateString()}: ${v.type} = ${v.value} ${v.unit}`
        ).join('\n')

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
        You are a medical analyst. Analyze the following patient health vitals and provide a professional, concise trend summary for a doctor.
        
        Patient Name: ${patient.name}
        Vitals History:
        ${vitalHistory}
        
        Provide:
        1. General Trend (Improving/Declining/Stable)
        2. Any specific concerns (e.g., spikes in sugar, rising BP)
        3. A short medical suggestion for the doctor.
        
        Keep it under 150 words. Use Marathi or Hindi if the patient's preferred language is Marathi/Hindi, otherwise English. 
        Preferred Language: ${patient.preferredLanguage}
        `

        const result = await model.generateContent(prompt)
        const summary = result.response.text()

        return NextResponse.json({ summary })

    } catch (error: any) {
        console.error('Trend Analysis Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
