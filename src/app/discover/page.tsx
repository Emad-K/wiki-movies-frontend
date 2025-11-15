"use client"

import { Navigation } from "@/components/navigation"
import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieGrid } from "@/components/movie-grid"
import type { SearchHit } from "@/lib/types/api"

export default function DiscoverPage() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: query.trim(),
          size: 50,
          offset: 0,
          mode: "multifield_hybrid_search",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search movies")
      }

      const data = await response.json()
      setSearchResults(data.hits || [])
    } catch (error) {
      console.error("Error searching movies:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Discover Movies
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Describe what you're looking for in natural language
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g. "find me all the chris pratt movies after 2010 where he is in space"'
                className="flex h-14 w-full rounded-md border border-input bg-background pl-12 pr-24 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Searching movies...</p>
              </div>
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Search Results
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {searchResults.length} movies
                  </span>
                </div>
                <MovieGrid movies={searchResults} />
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  No movies found. Try a different search query.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Enter a search query to discover movies
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
