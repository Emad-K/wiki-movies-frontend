"use client"

import { useEffect, useState } from "react"
import { TMDBTrendingMovie } from "@/lib/types/api"
import { getTMDBPosterUrl } from "@/lib/tmdb"
import { TrendingUp } from "lucide-react"

import { TMDB_GENRES } from "@/lib/tmdb-genres"

export function TrendingMovies() {
  const [movies, setMovies] = useState<TMDBTrendingMovie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-[2/3] w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending This Week</h2>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <div className="w-full px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Trending This Week</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.slice(0, 24).map((movie) => (
            <TrendingMovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TrendingMovieCard({ movie }: { movie: TMDBTrendingMovie }) {
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const posterUrl = getTMDBPosterUrl(movie.poster_path, 'w500')
  const backdropUrl = movie.backdrop_path ? getTMDBPosterUrl(movie.backdrop_path, 'w780') : posterUrl
  const title = movie.title || movie.name || 'Unknown'
  const releaseDate = movie.release_date || movie.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const voteCount = movie.vote_count ? movie.vote_count.toLocaleString() : null

  // Get top 3 genres
  const genres = movie.genre_ids
    ?.slice(0, 3)
    .map(id => TMDB_GENRES[id])
    .filter(Boolean)
    .join(" • ")

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true)
    }, 400) // 400ms delay before showing expanded card
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setIsHovered(false)
  }

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Card (Poster) */}
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] transition-opacity duration-300">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Expanded Card (Hover State) */}
      {isHovered && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{ minWidth: '300px' }}
        >
          <div className="bg-card rounded-lg shadow-xl overflow-hidden ring-1 ring-border">
            {/* Backdrop Image */}
            <div className="relative aspect-video w-full">
              <img
                src={backdropUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

              {/* Title on Image */}
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-bold text-lg text-white line-clamp-1 drop-shadow-md">{title}</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Metadata Row */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-500 font-semibold">{rating} Match</span>
                <span className="text-muted-foreground">{year}</span>
                <span className="border border-muted-foreground/30 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">
                  {movie.media_type === 'movie' ? 'Movie' : 'TV'}
                </span>
                {voteCount && (
                  <span className="text-xs text-muted-foreground">({voteCount} votes)</span>
                )}
              </div>

              {/* Genres */}
              {genres && (
                <div className="text-xs text-muted-foreground font-medium">
                  {genres}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
