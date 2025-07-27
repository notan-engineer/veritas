import { NextRequest, NextResponse } from 'next/server'

const SCRAPER_API_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/sources`)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to fetch sources' }, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch sources:', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.message || 'Failed to create source' }, { status: response.status })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to create source:', error)
    return NextResponse.json({ success: false, error: 'Failed to create source' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required' }, { status: 400 })
    }
    
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/sources/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.message || 'Failed to update source' }, { status: response.status })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to update source:', error)
    return NextResponse.json({ success: false, error: 'Failed to update source' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required' }, { status: 400 })
    }
    
    const response = await fetch(`${SCRAPER_API_URL}/api/scraper/sources/${id}`, {
      method: 'DELETE'
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.message || 'Failed to delete source' }, { status: response.status })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to delete source:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete source' }, { status: 500 })
  }
} 