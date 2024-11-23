import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Error parsing JSON:', text)
      throw new Error('Invalid JSON response from server')
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching search results:', error)
    return NextResponse.json({ error: 'Error fetching search results. Please ensure the backend server is running.' }, { status: 500 })
  }
}

