import { NextRequest, NextResponse } from 'next/server'

const SCRAPER_API_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/sources/${id}/test`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ 
        valid: false, 
        error: data.message || 'RSS feed test failed' 
      }, { status: response.status })
    }
    
    return NextResponse.json({ 
      valid: true, 
      message: data.message || 'RSS feed is valid' 
    })
  } catch (error) {
    console.error('Failed to test RSS feed:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to test RSS feed' 
    }, { status: 500 })
  }
}