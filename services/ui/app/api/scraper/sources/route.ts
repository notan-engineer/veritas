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
    console.log('UI Proxy POST - SCRAPER_API_URL:', SCRAPER_API_URL)
    console.log('UI Proxy POST - Request body:', body)
    
    const scraperUrl = `${SCRAPER_API_URL}/api/scraper/sources`
    console.log('UI Proxy POST - Calling:', scraperUrl)
    
    const response = await fetch(scraperUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle specific error types from scraper service
      let errorMessage = data.message || 'Failed to create source'
      
      if (data.error === 'InvalidRSSFeed') {
        errorMessage = `RSS Feed Validation Failed: ${data.message || 'The RSS feed URL is invalid or unreachable'}`
      } else if (response.status === 404) {
        errorMessage = 'Service temporarily unavailable. Please try again.'
      } else if (response.status === 400) {
        errorMessage = `Invalid data: ${data.message || 'Please check your input and try again'}`
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        errorType: data.error || 'UnknownError'
      }, { status: response.status })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to create source:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Network error: Unable to connect to scraper service. Please try again.',
      errorType: 'NetworkError'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    console.log('UI Proxy PUT - SCRAPER_API_URL:', SCRAPER_API_URL)
    console.log('UI Proxy PUT - Request body:', body)
    console.log('UI Proxy PUT - ID:', id, 'Updates:', updates)
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required' }, { status: 400 })
    }
    
    const scraperUrl = `${SCRAPER_API_URL}/api/scraper/sources/${id}`
    console.log('UI Proxy PUT - Calling:', scraperUrl)
    
    const response = await fetch(scraperUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle specific error types from scraper service
      let errorMessage = data.message || 'Failed to update source'
      
      if (data.error === 'InvalidRSSFeed') {
        errorMessage = `RSS Feed Validation Failed: ${data.message || 'The RSS feed URL is invalid or unreachable'}`
      } else if (response.status === 404) {
        errorMessage = 'Source not found. It may have been deleted by another user.'
      } else if (response.status === 400) {
        errorMessage = `Invalid data: ${data.message || 'Please check your input and try again'}`
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        errorType: data.error || 'UnknownError'
      }, { status: response.status })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to update source:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Network error: Unable to connect to scraper service. Please try again.',
      errorType: 'NetworkError'
    }, { status: 500 })
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