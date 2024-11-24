"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState('relevance_desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchField, setSearchField] = useState('both')

  const handleSearch = async (newPage?: number) => {
    setLoading(true)
    setError(null)
    const searchPage = newPage || page
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${searchPage}&field=${searchField}`)
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setResults(data.results || [])
      setTotalPages(data.total_pages || 1)
      setPage(searchPage)
    } catch (error) {
      console.error('Error fetching search results:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setResults([])
    }
    setLoading(false)
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Big Data Search Engine</CardTitle>
          <CardDescription>Enter your search query below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter your search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
            />
            <Button onClick={() => handleSearch(1)} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <Select value={sort} onValueChange={(value) => setSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance_desc">Relevance (High to Low)</SelectItem>
                <SelectItem value="relevance_asc">Relevance (Low to High)</SelectItem>
                <SelectItem value="date_desc">Date (Newest First)</SelectItem>
                <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title Only</SelectItem>
                <SelectItem value="content">Description Only</SelectItem>
                <SelectItem value="both">Both Title and Description</SelectItem>
              </SelectContent>
            </Select>
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
              <div key={index} className="mb-4 p-4 border rounded">
                <h4 className="font-medium text-lg">{result.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
                <p className="text-xs text-gray-400 mt-1">Relevance: {result.similarity.toFixed(4)}</p>
              </div>
            ))}
            {results.length === 0 && !error && (
              <p className="text-sm text-gray-600">No results found.</p>
            )}
            {totalPages > 1 && (
              <Pagination
                className="mt-4"
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage: number | undefined) => handleSearch(newPage)}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}