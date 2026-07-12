import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import slugify from 'slugify'


// Simplified to use centralized prisma

// GET /api/admin/leads - Fetch all leads or search Google Places
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        if (query) {
            // SEARCH MODE: Proxy to Google Places API
            const apiKey = process.env.GOOGLE_MAPS_API_KEY

            if (!apiKey) {
                // Mock data for demonstration if no API key is provided
                return NextResponse.json([
                    {
                        clinicName: "City Heart Care Clinic",
                        address: "Market Road, Near Central Square, Bangalore",
                        phone: "+91 98765 43210",
                        rating: 4.8,
                        photos: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"]
                    },
                    {
                        clinicName: "Dr. Sharma's Orthopedic Center",
                        address: "123 Health Ave, Civil Lines, Jaipur",
                        phone: "+91 91234 56789",
                        rating: 4.5,
                        photos: ["https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&q=80&w=800"]
                    }
                ])
            }

            // Real Google Places API call logic
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.photos,places.id'
                },
                body: JSON.stringify({
                    textQuery: query,
                    locationBias: {
                        circle: {
                            center: { latitude: 20.5937, longitude: 78.9629 }, // Default to India center
                            radius: 50000.0
                        }
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Google Places API error:', errorData)
                return NextResponse.json({ error: 'Failed to fetch from Google Places' }, { status: 502 })
            }

            const data = await response.json()
            const transformedResults = (data.places || []).map((place: any) => {
                // Generate a photo URL using the first photo reference if available
                let photoUrl = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
                if (place.photos && place.photos.length > 0) {
                    // Using the photo name for the V1 Places API
                    photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${apiKey}&maxHeightPx=800&maxWidthPx=1200`
                }

                return {
                    clinicName: place.displayName?.text || "Unknown Clinic",
                    address: place.formattedAddress || "No address provided",
                    phone: place.nationalPhoneNumber || "",
                    rating: place.rating || 0,
                    photos: [photoUrl]
                }
            })

            return NextResponse.json(transformedResults)
        }

        // DATABASE MODE: Fetch saved leads
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(leads)

    } catch (error) {
        console.error('Leads GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/admin/leads - Create a new lead here
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { clinicName, doctorName, address, phone, rating, photos } = data

        if (!clinicName) {
            return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 })
        }

        // Generate unique slug
        const baseSlug = slugify(clinicName, { lower: true, strict: true })
        let slug = baseSlug
        let count = 1

        while (await prisma.lead.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count++}`
        }

        const lead = await prisma.lead.create({
            data: {
                clinicName,
                doctorName,
                address,
                phone,
                rating: rating ? parseFloat(rating.toString()) : null,
                photos: photos ? JSON.stringify(photos) : null,
                slug,
                status: 'NEW'
            }
        })

        return NextResponse.json(lead, { status: 201 })

    } catch (error) {
        console.error('Leads POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
