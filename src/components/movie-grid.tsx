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
        <HydratedMovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

function HydratedMovieCard({ movie }: { movie: SearchHit }) {
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
        const result = await searchTMDB(movie.title, year)

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
  }, [movie.title, year])

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

  return <MovieCard movie={movieData} />
}

