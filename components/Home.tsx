"use client"

import { useState } from "react"
import { Moon, Sun, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function Home() {
  const [query, setQuery] = useState("")
  interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    similarity: number;
  }

  const [results, setResults] = useState<Array<SearchResult>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState("relevance_desc")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchField, setSearchField] = useState("both")
  const [threshold, setThreshold] = useState<number[]>([0.1])
  const [showFilters, setShowFilters] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleSearch = async (newPage?: number) => {
    setLoading(true)
    setError(null)
    const searchPage = newPage || page
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&sort=${sort}&page=${searchPage}&field=${searchField}&threshold=${
          threshold[0]
        }`
      )
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setResults(data.results || [])
      setTotalPages(data.total_pages || 1)
      setPage(searchPage)
    } catch (error) {
      console.error("Error fetching search results:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted transition-all duration-500">
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-24">
        <Card className="w-full max-w-4xl border-none bg-background/50 shadow-lg backdrop-blur-sm transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">Big Data Search Engine</CardTitle>
                <CardDescription className="mt-2">Discover insights from your data</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-transform hover:scale-110"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter your search query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button 
                onClick={() => handleSearch(1)} 
                disabled={loading}
                className="transition-transform hover:scale-105"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowFilters(!showFilters)}
                className="transition-transform hover:scale-105"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={cn(
                "grid gap-4 overflow-hidden transition-all duration-300",
                showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort Results</label>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance_desc">Relevance (High to Low)</SelectItem>
                        <SelectItem value="relevance_asc">Relevance (Low to High)</SelectItem>
                        <SelectItem value="date_desc">Date (Newest First)</SelectItem>
                        <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search In</label>
                    <Select value={searchField} onValueChange={setSearchField}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search in" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title Only</SelectItem>
                        <SelectItem value="content">Description Only</SelectItem>
                        <SelectItem value="both">Both Title and Description</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Threshold: {threshold[0].toFixed(2)}</label>
                    <Slider
                      value={threshold}
                      onValueChange={setThreshold}
                      min={0}
                      max={1}
                      step={0.01}
                      className="py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-lg border bg-card p-4 text-card-foreground transition-all duration-300",
                      "hover:bg-accent/50 hover:-translate-y-1",
                    )}
                    style={{
                      animation: `fadeSlideIn 0.3s ease-out forwards ${index * 0.1}s`
                    }}
                  >
                    <h4 className="text-lg font-medium">{result.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{result.snippet}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Relevance: {result.similarity.toFixed(4)}</p>
                  </div>
                ))}
                {results.length === 0 && !error && (
                  <p className="text-center text-sm text-muted-foreground">
                    No results found.
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(newPage: number | undefined) => handleSearch(newPage)}
                  />
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

