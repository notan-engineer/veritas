import { NextResponse } from 'next/server'

const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/metrics`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to proxy metrics request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
} 