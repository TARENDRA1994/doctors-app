import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 1) {
      return NextResponse.json({ medicines: [] })
    }

    // Search the MedicineMaster table
    const medicines = await prisma.medicineMaster.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // PostgreSQL specific: case-insensitive search
        },
      },
      distinct: ['name'],
      select: {
        name: true,
      },
      take: 15, // Limit to 15 results for fast UI rendering
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ medicines: medicines.map(m => m.name) })
  } catch (error) {
    console.error('Error in medicine autocomplete API:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}
