"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching search results:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setResults([])
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Big Data Search Engine</CardTitle>
          <CardDescription>Enter your search query below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter your search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="mb-2">
                <h4 className="font-medium">{result.title}</h4>
                <p className="text-sm text-gray-600">{result.snippet}</p>
              </div>
            ))}
            {results.length === 0 && !error && (
              <p className="text-sm text-gray-600">No results found.</p>
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}

