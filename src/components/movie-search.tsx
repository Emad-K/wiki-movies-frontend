"use client"

import { useState, useEffect, useRef } from "react"
import { useCombobox } from "downshift"
import { Search, X, Loader2, Film, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieGrid } from "@/components/movie-grid"
import { cn } from "@/lib/utils"
import type { SearchHit } from "@/lib/types/api"

interface AutocompleteSuggestion {
  value: string
  image_url: string | null
  media_type: string
  released_year: number | null
}

interface MovieSearchProps {
  mode: "similarity_search" | "multifield_hybrid_search"
  title: string
  description: string
}

export function MovieSearch({ mode, title, description }: MovieSearchProps) {
  const [inputValue, setInputValue] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [trendingMovies, setTrendingMovies] = useState<SearchHit[]>([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(true)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollObserverRef = useRef<HTMLDivElement>(null)

  // Downshift combobox configuration
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    reset,
  } = useCombobox({
    items: suggestions,
    itemToString: (item) => (item ? item.value : ""),
    inputValue,
    onInputValueChange: ({ inputValue: newValue }) => {
      setInputValue(newValue || "")
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSelectedMovie(selectedItem.value)
        setCurrentOffset(0)
        setHasMore(false)
        performSearch(selectedItem.value, 0, false)
      }
    },
  })

  // Fetch trending movies on mount
  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  // Fetch autocomplete suggestions with debouncing
  useEffect(() => {
    // Clear suggestions if input is empty or too short
    if (!inputValue.trim() || inputValue.trim().length < 3) {
      setSuggestions([])
      return
    }

    // Wait for user to finish typing (500ms debounce)
    const timer = setTimeout(async () => {
      await fetchAutocompleteSuggestions(inputValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [inputValue])

  // Infinite scroll observer
  useEffect(() => {
    if (!selectedMovie || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          performSearch(selectedMovie, currentOffset, true)
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
  }, [selectedMovie, currentOffset, hasMore, isLoadingMore])

  const fetchTrendingMovies = async () => {
    setIsLoadingTrending(true)
    try {
      const response = await fetch("/api/trending")
      if (!response.ok) {
        throw new Error("Failed to fetch trending movies")
      }
      const data = await response.json()
      setTrendingMovies(data.content || [])
    } catch (error) {
      console.error("Error fetching trending movies:", error)
    } finally {
      setIsLoadingTrending(false)
    }
  }

  const fetchAutocompleteSuggestions = async (value: string) => {
    setIsLoadingAutocomplete(true)
    try {
      const response = await fetch("/api/autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: "title",
          value: value.trim(),
          size: 10,
          offset: 0,
        }),
      })

      if (!response.ok) {
        throw new Error("Autocomplete failed")
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Autocomplete error:", error)
      setSuggestions([])
    } finally {
      setIsLoadingAutocomplete(false)
    }
  }

  const performSearch = async (movieTitle: string, offset: number = 0, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoadingSearch(true)
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: movieTitle,
          size: 20,
          offset: offset,
          mode: mode,
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

      // Check if there are more movies to load
      setHasMore(newMovies.length === 20)
      setCurrentOffset(offset + 20)
    } catch (error) {
      console.error("Error searching movies:", error)
      if (!append) {
        setSearchResults([])
      }
    } finally {
      setIsLoadingSearch(false)
      setIsLoadingMore(false)
    }
  }

  const handleClear = () => {
    reset()
    setSelectedMovie(null)
    setSearchResults([])
    setSuggestions([])
    setCurrentOffset(0)
    setHasMore(false)
  }

  const moviesToDisplay = selectedMovie ? searchResults : trendingMovies
  const isLoading = selectedMovie ? isLoadingSearch : isLoadingTrending

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {selectedMovie ? title : `Find ${title}`}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {selectedMovie
            ? `${description} "${selectedMovie}"`
            : "Search for a movie to discover more"}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <input
            {...getInputProps()}
            placeholder="Search for a movie title (min 3 characters)..."
            className="flex h-12 w-full rounded-md border border-input bg-background px-10 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoadingAutocomplete && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 z-10">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Autocomplete dropdown */}
          <ul
            {...getMenuProps()}
            className={cn(
              "absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto",
              !(isOpen && suggestions.length > 0) && "hidden"
            )}
          >
            {isOpen &&
              suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.value}
                  {...getItemProps({ item: suggestion, index })}
                  className={cn(
                    "px-4 py-3 cursor-pointer border-b border-border last:border-b-0",
                    highlightedIndex === index && "bg-accent",
                    selectedItem?.value === suggestion.value && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      {suggestion.media_type === "television" ? (
                        <Tv className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Film className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.value}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{suggestion.media_type}</span>
                        {suggestion.released_year && (
                          <>
                            <span>•</span>
                            <span>{suggestion.released_year}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                {selectedMovie ? "Searching movies..." : "Loading trending movies..."}
              </p>
            </div>
          </div>
        ) : moviesToDisplay.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">
                {selectedMovie ? title : "Trending Movies"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {moviesToDisplay.length} movies
              </span>
            </div>
            <MovieGrid movies={moviesToDisplay} />

            {/* Infinite scroll trigger */}
            {selectedMovie && (
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
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {selectedMovie
                ? "No movies found. Try searching for another movie."
                : "No trending movies available."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

