"use client"

import { useEffect, useState } from "react"
import { TMDBTrendingMovie } from "@/lib/types/api"
import { getTMDBPosterUrl, DEFAULT_POSTER_URL } from "@/lib/tmdb"
import { Calendar, Star, TrendingUp } from "lucide-react"

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
          {movies.slice(0, 18).map((movie) => (
            <TrendingMovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TrendingMovieCard({ movie }: { movie: TMDBTrendingMovie }) {
  const [showDetails, setShowDetails] = useState(false)
  const posterUrl = getTMDBPosterUrl(movie.poster_path, 'w500')
  const title = movie.title || movie.name || 'Unknown'
  const releaseDate = movie.release_date || movie.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

  return (
    <>
      {/* Desktop: Hover to show details */}
      <div
        className="relative cursor-pointer hidden md:block group"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="relative rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105">
          <img
            src={posterUrl}
            alt={title}
            className="w-full aspect-[2/3] object-cover"
            loading="lazy"
          />
          {/* Media Type Badge - Always Visible */}
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-foreground text-background">
              {movie.media_type === 'movie' ? 'Movie' : 'TV'}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
              <h3 className="font-semibold text-sm text-white line-clamp-2">{title}</h3>
              <div className="flex items-center justify-between text-xs text-white/90">
                {year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{year}</span>
                  </div>
                )}
                {rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span>{rating}</span>
                  </div>
                )}
              </div>
              {movie.overview && (
                <p className="text-xs text-white/80 line-clamp-2 mt-1">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Click to show details */}
      <div className="md:hidden">
        <div 
          className="relative rounded-lg overflow-hidden cursor-pointer" 
          onClick={() => setShowDetails(true)}
        >
          <img
            src={posterUrl}
            alt={title}
            className="w-full aspect-[2/3] object-cover"
            loading="lazy"
          />
          {/* Media Type Badge - Always Visible */}
          <div className="absolute top-2 right-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-foreground text-background">
              {movie.media_type === 'movie' ? 'Movie' : 'TV'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="font-semibold text-sm text-white line-clamp-2">{title}</h3>
            <div className="flex items-center justify-between text-xs text-white/90 mt-1">
              {year && <span>{year}</span>}
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-end"
            onClick={() => setShowDetails(false)}
          >
            <div
              className="bg-card rounded-t-2xl p-6 w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-4 mb-4">
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-24 aspect-[2/3] object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{year}</span>
                      </div>
                    )}
                    {rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{rating}/10</span>
                      </div>
                    )}
                    {movie.media_type && (
                      <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                        {movie.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {movie.overview && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-1">Overview</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{movie.overview}</p>
                </div>
              )}
              <button
                className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

