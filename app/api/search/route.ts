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
  const searchUrl = `${backendUrl}/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${page}&field=${searchField}&threshold=${threshold}`

  try {
    const response = await fetch(searchUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Error fetching search results. Please ensure the backend server is running.' }, { status: 500 })
  }
}
