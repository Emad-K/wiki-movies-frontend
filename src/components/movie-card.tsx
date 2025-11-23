"use client"

import { useState } from "react"
import { getTMDBPosterUrl } from "@/lib/tmdb"
import { TMDB_GENRES } from "@/lib/tmdb-genres"

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
        vote_average?: number
        vote_count?: number
        overview?: string
        genre_ids?: number[]
    }
}

export function MovieCard({ movie }: MovieCardProps) {
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
            <div className="relative rounded-[4px] overflow-hidden aspect-[2/3] transition-opacity duration-300">
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
                    className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[240%] z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="bg-card rounded-[4px] shadow-xl overflow-hidden relative h-full">
                        {/* Backdrop Image - Full Cover */}
                        <img
                            src={backdropUrl}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Gradient Overlay - Stronger at bottom for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 text-white">
                            {/* Title */}
                            <h3 className="font-bold text-lg line-clamp-1 drop-shadow-md">{title}</h3>

                            {/* Metadata Row */}
                            <div className="flex items-center gap-3 text-xs font-medium text-white/90">
                                {rating && <span className="text-green-400 font-bold">{rating} Match</span>}
                                {year && <span>{year}</span>}
                                {movie.media_type && (
                                    <span className="border border-white/40 px-1.5 py-0.5 rounded text-[10px] uppercase bg-black/20 backdrop-blur-sm">
                                        {movie.media_type === 'movie' ? 'Movie' : 'TV'}
                                    </span>
                                )}
                                {voteCount && (
                                    <span className="text-white/60">({voteCount} votes)</span>
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
        </div>
    )
}
