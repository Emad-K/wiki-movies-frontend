"use client"

import { useEffect, useState } from "react"
import { TMDBTrendingMovie } from "@/lib/types/api"
import { MovieCard } from "./movie-card"

import { Skeleton } from "@/components/ui/skeleton"

export function TrendingMovies() {
  const [movies, setMovies] = useState<TMDBTrendingMovie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/trending')

        if (!response.ok) {
          throw new Error('Failed to fetch trending movies')
        }

        const data = await response.json()
        setMovies(data.results || [])
      } catch (err) {
        console.error('Error fetching trending movies:', err)
        setError(err instanceof Error ? err.message : 'Failed to load trending movies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[2/3] w-full rounded-[4px]" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {movies.slice(0, 24).map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isHovered={hoveredMovieId === movie.id}
          onHover={(isHovered) => {
            if (isHovered) {
              setHoveredMovieId(movie.id)
            } else {
              setHoveredMovieId((prev) => (prev === movie.id ? null : prev))
            }
          }}
        />
      ))}
    </div>
  )
}
