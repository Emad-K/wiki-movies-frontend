"use client"

import { Navigation } from "@/components/navigation"
import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieGrid } from "@/components/movie-grid"
import { TrendingMovies } from "@/components/trending-movies"
import type { SearchHit } from "@/lib/types/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollObserverRef = useRef<HTMLDivElement>(null)

  // Infinite scroll observer
  useEffect(() => {
    if (!hasSearched || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreResults()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = scrollObserverRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasSearched, currentOffset, hasMore, isLoadingMore])

  const performSearch = async (searchQuery: string, offset: number = 0, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: searchQuery.trim(),
          size: 20,
          offset: offset,
          mode: "multifield_hybrid_search",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search movies")
      }

      const data = await response.json()
      const newMovies = data.hits || []

      if (append) {
        setSearchResults((prev) => [...prev, ...newMovies])
      } else {
        setSearchResults(newMovies)
      }

      setHasMore(newMovies.length === 20)
      setCurrentOffset(offset + 20)
    } catch (error) {
      console.error("Error searching movies:", error)
      if (!append) {
        setSearchResults([])
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setHasSearched(true)
    setCurrentOffset(0)
    setHasMore(false)
    await performSearch(query, 0, false)
  }

  const loadMoreResults = () => {
    if (query.trim() && hasMore && !isLoadingMore) {
      performSearch(query, currentOffset, true)
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
              Describe what you&apos;re looking for in natural language
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[2/3] w-full rounded-[4px]" />
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <>
                <MovieGrid movies={searchResults} />

                {/* Infinite scroll trigger */}
                <div ref={scrollObserverRef} className="h-20 flex items-center justify-center mt-8">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading more movies...</span>
                    </div>
                  )}
                  {!hasMore && !isLoadingMore && searchResults.length > 0 && (
                    <p className="text-sm text-muted-foreground">That&apos;s all the results!</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  No movies found. Try a different search query.
                </p>
              </div>
            )
          ) : (
            <div>
              <TrendingMovies />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
