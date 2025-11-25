"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getTMDBPosterUrl, getTMDBBackdropUrl } from "@/lib/tmdb"
import { TMDB_GENRES } from "@/lib/tmdb-genres"
import { getTVDateRange, shouldShowTVStatus } from "@/lib/media-utils"
import { Star } from "lucide-react"

export interface MovieCardProps {
  movie: {
    id: number
    title?: string
    name?: string
    poster_path?: string | null
    backdrop_path?: string | null
    media_type?: string
    release_date?: string
    first_air_date?: string
    last_air_date?: string
    vote_average?: number
    vote_count?: number
    overview?: string
    genre_ids?: number[]
    // TV show specific fields
    episode_run_time?: number[]
    status?: string
    content_ratings?: {
      results: Array<{
        iso_3166_1: string
        rating: string
      }>
    }
  }
  isHovered?: boolean
  onHover?: (isHovered: boolean) => void
}

export function MovieCard({ movie, isHovered = false, onHover }: MovieCardProps) {
  const [metadata, setMetadata] = useState<{
    // TV show fields
    status?: string
    last_air_date?: string
    episode_run_time?: number[]
    number_of_seasons?: number
    content_ratings?: {
      results: Array<{
        iso_3166_1: string
        rating: string
      }>
    }
    // Movie fields
    runtime?: number
    release_dates?: {
      results: Array<{
        iso_3166_1: string
        release_dates: Array<{ certification: string }>
      }>
    }
  } | null>(null)
  const [metadataFetched, setMetadataFetched] = useState(false)

  const posterUrl = getTMDBPosterUrl(movie.poster_path, 'w500')
  // Use w780 for high quality backdrop, w300 for low res placeholder
  const backdropUrl = movie.backdrop_path
    ? getTMDBBackdropUrl(movie.backdrop_path, 'w780')
    : posterUrl


  const title = movie.title || movie.name || 'Unknown'
  const releaseDate = movie.release_date || movie.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

  // Get top 3 genres
  const genres = movie.genre_ids
    ?.slice(0, 3)
    .map(id => TMDB_GENRES[id])
    .filter(Boolean)
    .join(" • ")

  // Format year range for TV shows
  const getYearDisplay = () => {
    if (movie.media_type === 'tv' && movie.first_air_date) {
      const data = metadata || movie
      return getTVDateRange(movie.first_air_date, data.last_air_date, data.status)
    }
    return year
  }

  // Format duration for both movies and TV shows
  const getDuration = () => {
    if (movie.media_type === 'tv') {
      const data = metadata || movie
      if (data.episode_run_time && data.episode_run_time.length > 0) {
        const avgDuration = data.episode_run_time[0]
        if (avgDuration >= 60) {
          const hours = Math.floor(avgDuration / 60)
          const minutes = avgDuration % 60
          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
        }
        return `${avgDuration}m`
      }
    } else if (movie.media_type === 'movie' && metadata?.runtime) {
      const runtime = metadata.runtime
      if (runtime >= 60) {
        const hours = Math.floor(runtime / 60)
        const minutes = runtime % 60
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      }
      return `${runtime}m`
    }
    return null
  }

  // Get content rating for both movies and TV shows
  const getContentRating = () => {
    if (movie.media_type === 'tv') {
      const data = metadata || movie
      if (data.content_ratings?.results) {
        const usRating = data.content_ratings.results.find(r => r.iso_3166_1 === 'US')
        return usRating?.rating
      }
    } else if (movie.media_type === 'movie' && metadata?.release_dates) {
      const usCertification = metadata.release_dates.results
        ?.find(r => r.iso_3166_1 === 'US')
        ?.release_dates?.[0]?.certification
      return usCertification || null
    }
    return null
  }

  // Fetch metadata on hover
  useEffect(() => {
    if (!isHovered || metadataFetched) return

    const fetchMetadata = async () => {
      try {
        const endpoint = movie.media_type === 'tv'
          ? `/api/tmdb/tv/${movie.id}`
          : `/api/tmdb/movie/${movie.id}`

        const response = await fetch(endpoint)
        if (!response.ok) return

        const data = await response.json()
        setMetadata(data)
        setMetadataFetched(true)
      } catch {
        // Silently fail - not critical
      }
    }

    fetchMetadata()
  }, [isHovered, metadataFetched, movie.media_type, movie.id])

  const handleMouseEnter = () => {
    onHover?.(true)
  }

  const handleMouseLeave = () => {
    onHover?.(false)
  }

  // Determine the correct route based on media type
  const detailRoute = movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`

  return (
    <Link
      href={detailRoute}
      className="relative group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Card (Poster) */}
      <div className="relative rounded-[4px] overflow-hidden aspect-[2/3] transition-opacity duration-300">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
        />

        {/* Media Type Badge */}
        {movie.media_type && (
          <div className="absolute top-2 right-2 z-10">
            <span className="border border-white/40 px-1.5 py-0.5 rounded text-[10px] uppercase bg-black/60 backdrop-blur-sm text-white font-medium">
              {movie.media_type === 'movie' ? 'Movie' : 'TV'}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Card (Hover State) */}
      {isHovered && (
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[240%] z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="bg-card rounded-[4px] shadow-xl overflow-hidden relative h-full">
            {/* High Res Backdrop - Full Cover */}
            <Image
              src={backdropUrl || posterUrl}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />

            {/* Gradient Overlay - Stronger at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 text-white">
              {/* Title */}
              <h3 className="font-bold text-lg line-clamp-1 drop-shadow-md">{title}</h3>

              {/* Metadata Row */}
              <div className="flex items-center gap-2 text-xs font-medium text-white/90 flex-wrap">
                {rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-white">{rating}</span>
                    <span className="text-white/60">({movie.vote_count?.toLocaleString()})</span>
                  </div>
                )}
                {getYearDisplay() && <span>{getYearDisplay()}</span>}
                {getContentRating() && (
                  <span className="border border-white/40 px-1.5 py-0.5 rounded text-[10px] uppercase bg-black/20 backdrop-blur-sm">
                    {getContentRating()}
                  </span>
                )}
                {getDuration() && <span>{getDuration()}</span>}
                {movie.media_type === 'tv' && shouldShowTVStatus(metadata?.status || movie.status) && (
                  <span className="border border-white/40 px-1.5 py-0.5 rounded text-[10px] uppercase bg-red-500/80 backdrop-blur-sm">
                    {metadata?.status || movie.status}
                  </span>
                )}
                {movie.media_type && (
                  <span className="border border-white/40 px-1.5 py-0.5 rounded text-[10px] uppercase bg-black/20 backdrop-blur-sm">
                    {movie.media_type === 'movie' ? 'Movie' : 'TV'}
                  </span>
                )}
              </div>

              {/* Genres */}
              {genres && (
                <div className="text-xs text-white/80 font-medium line-clamp-1">
                  {genres}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <p className="text-xs text-white/70 line-clamp-3 leading-relaxed drop-shadow-sm">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Link>
  )
}
