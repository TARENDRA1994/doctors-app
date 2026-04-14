import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import path from 'path'

export async function GET() {
    try {
        // process.execPath gets the exact location of node.exe currently running the server
        const nodePath = process.execPath
        const prismaPath = path.join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')

        console.log('Running programmatic migration...')
        const pushResult = execSync(`"${nodePath}" "${prismaPath}" db push`, { encoding: 'utf-8' })
        const genResult = execSync(`"${nodePath}" "${prismaPath}" generate`, { encoding: 'utf-8' })

        return NextResponse.json({
            success: true,
            message: 'Database migrated successfully!',
            pushResult,
            genResult
        })
    } catch (error: any) {
        console.error('Migration failed:', error)
        return NextResponse.json({
            error: error.message,
            stdout: error.stdout ? error.stdout.toString() : '',
            stderr: error.stderr ? error.stderr.toString() : ''
        }, { status: 500 })
    }
}
