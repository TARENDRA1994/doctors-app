import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { analyzeLabReport } from '../../../lib/gemini'


// Using centralized prisma

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const patientId = parseInt(formData.get('patientId') as string)

        if (!file || !patientId) {
            return NextResponse.json({ error: 'File and Patient ID are required' }, { status: 400 })
        }

        // Convert file to base64 for Gemini
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')

        // Analyze with Gemini
        console.log(`Analyzing lab report for patient ${patientId}...`)
        const aiSummary = await analyzeLabReport(base64, file.type)

        // Save to database
        const labReport = await prisma.labReport.create({
            data: {
                patientId,
                fileName: file.name,
                aiSummary: aiSummary,
                // In a production app, we would upload the file to S3/Cloudinary here
                // For now, we just save the AI summary and file metadata
                fileUrl: null
            }
        })

        return NextResponse.json(labReport)
    } catch (error: any) {
        console.error('Lab report upload error:', error)
        return NextResponse.json({ error: 'Failed to process lab report: ' + error.message }, { status: 500 })
    }
}
