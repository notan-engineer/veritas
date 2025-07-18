import { NextRequest, NextResponse } from 'next/server'

const SCRAPER_API_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to proxy trigger request:', error)
    return NextResponse.json(
      { error: 'Failed to trigger scraping job' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger scraping.' },
    { status: 405 }
  );
} 