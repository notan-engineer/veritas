import { NextRequest, NextResponse } from 'next/server'

const SCRAPER_API_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    
    const response = await fetch(
      `${SCRAPER_API_URL}/api/scraper/content${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to proxy content request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
} 