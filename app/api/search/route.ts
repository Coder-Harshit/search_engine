import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const sort = searchParams.get('sort') || 'relevance_desc'
  const page = searchParams.get('page') || '1'
  const searchField = searchParams.get('field') || 'both'
  const threshold = searchParams.get('threshold') || '0.1'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const backendUrl = process.env.BACKEND_URL || 'https://search-engine-1nfx.onrender.com'
  console.log(backendUrl)
  const searchUrl = `${backendUrl}/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${page}&field=${searchField}&threshold=${threshold}`
  console.log(searchUrl)

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    // Get the response text first
    const text = await response.text()

    // Try to parse it as JSON
    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse JSON:', text)
      throw new Error('Invalid JSON response from server')
    }

    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json(
      {
        error: 'Error fetching search results. Please ensure the backend server is running.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}