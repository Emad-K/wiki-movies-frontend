"use client"

import { useState, useEffect } from "react"
import { SearchHit } from "@/lib/types/api"
import { searchTMDB, type TMDBSearchResult } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"
import { Skeleton } from "@/components/ui/skeleton"

interface MovieGridProps {
  movies: SearchHit[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null)

  if (!movies || movies.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <p>No movies found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {movies.map((movie) => (
        <HydratedMovieCard
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

function HydratedMovieCard({
  movie,
  isHovered,
  onHover,
}: {
  movie: SearchHit
  isHovered: boolean
  onHover: (isHovered: boolean) => void
}) {
  const [tmdbData, setTmdbData] = useState<TMDBSearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const year = movie.fields?.released_year

  useEffect(() => {
    let isMounted = true

    const fetchTMDBData = async () => {
      if (!movie.title) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // TODO: REMOVE - Once backend provides TMDB IDs, this conditional logic won't be needed
        // Check if we already have a TMDB ID from backend
        const tmdbId = movie.fields?.tmdb_id

        if (tmdbId !== undefined) {
          // tmdbId is either a number (has TMDB entry) or null (confirmed no TMDB entry)
          if (tmdbId === null) {
            // Confirmed no TMDB entry exists, skip lookup
            console.log(`⏭️ Skipping TMDB lookup for "${movie.title}" - confirmed no TMDB entry`)
            setIsLoading(false)
            return
          }

          // TODO: When backend provides TMDB IDs, fetch full details using the ID
          // For now, we still need to do a search to get the full TMDB data
          console.log(`✅ Backend provided TMDB ID ${tmdbId} for "${movie.title}"`)
        }

        // Lookup TMDB data by title and year (temporary until backend provides full TMDB data)
        const mediaType = movie.fields?.media_type === 'television' ? 'tv' : 'movie'
        const result = await searchTMDB(movie.title, year, mediaType)

        if (isMounted && result) {
          setTmdbData(result)
        }
      } catch (error) {
        console.error('Error fetching TMDB data:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTMDBData()

    return () => {
      isMounted = false
    }
  }, [movie.title, movie.fields?.tmdb_id, movie.fields?.media_type, year])

  if (isLoading) {
    return (
      <div>
        <Skeleton className="aspect-[2/3] w-full rounded-[4px]" />
      </div>
    )
  }

  // Combine SearchHit data with TMDB data
  const movieData = {
    id: movie.id,
    title: tmdbData?.title || movie.title || '',
    name: tmdbData?.name,
    poster_path: tmdbData?.poster_path,
    backdrop_path: tmdbData?.backdrop_path,
    media_type: tmdbData?.media_type || 'movie',
    release_date: tmdbData?.release_date,
    first_air_date: tmdbData?.first_air_date,
    vote_average: tmdbData?.vote_average,
    vote_count: tmdbData?.vote_count,
    overview: tmdbData?.overview || movie.fields?.plot,
    genre_ids: tmdbData?.genre_ids
  }

  return <MovieCard movie={movieData} isHovered={isHovered} onHover={onHover} />
}

