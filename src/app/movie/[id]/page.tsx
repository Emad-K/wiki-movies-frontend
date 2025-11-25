"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { motion, useMotionValue } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTMDBBackdropUrl, getTMDBPosterUrl } from "@/lib/tmdb"
import { Star, Calendar, Clock, DollarSign, Loader2 } from "lucide-react"
import Link from "next/link"
import { ExpandableText } from "@/components/expandable-text"
import { WatchProvider } from "@/components/watch-provider"
import { CastList } from "@/components/cast-list"
import { SimilarMedia } from "@/components/similar-media"

interface MovieDetails {
    id: number
    title: string
    tagline?: string
    overview: string
    backdrop_path: string | null
    poster_path: string | null
    release_date: string
    runtime: number
    vote_average: number
    vote_count: number
    budget: number
    revenue: number
    genres: { id: number; name: string }[]
    production_companies: { id: number; name: string; logo_path: string | null }[]
    production_countries: { iso_3166_1: string; name: string }[]
    spoken_languages: { iso_639_1: string; name: string }[]
    status: string
    homepage?: string
    credits?: {
        cast: { id: number; name: string; character: string; profile_path: string | null }[]
        crew: { id: number; name: string; job: string; department: string }[]
    }
    videos?: {
        results: { id: string; key: string; name: string; type: string; site: string }[]
    }
    "watch/providers"?: {
        results: {
            [key: string]: {
                link: string
                flatrate?: { provider_id: number; provider_name: string; logo_path: string }[]
                rent?: { provider_id: number; provider_name: string; logo_path: string }[]
                buy?: { provider_id: number; provider_name: string; logo_path: string }[]
            }
        }
    }
    similar?: {
        results: {
            id: number
            title: string
            poster_path: string | null
            vote_average: number
            release_date: string
        }[]
    }
}

export default function MovieDetailPage() {
    const params = useParams()
    const [movie, setMovie] = useState<MovieDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Framer Motion for smooth parallax
    const parallaxY = useMotionValue(0)

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`/api/tmdb/movie/${params.id}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch movie details')
                }

                const data = await response.json()
                setMovie(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchMovie()
        }
    }, [params.id])

    // Smooth parallax effect with framer-motion
    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement
            const scrolled = target.scrollTop
            // Directly update motion value for instant response
            parallaxY.set(scrolled * 0.5)
        }

        // Find the ScrollArea viewport element
        const viewport = document.querySelector('[data-radix-scroll-area-viewport]')
        if (viewport) {
            viewport.addEventListener('scroll', handleScroll, { passive: true })
            return () => viewport.removeEventListener('scroll', handleScroll)
        }
    }, [movie, parallaxY])

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="flex flex-col h-screen">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">{error || 'Movie not found'}</p>
                        <Link href="/" className="text-primary hover:underline">
                            Go back home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const backdropUrl = getTMDBBackdropUrl(movie.backdrop_path, 'original')
    const posterUrl = getTMDBPosterUrl(movie.poster_path, 'w500')
    const director = movie.credits?.crew.find(person => person.job === 'Director')
    const trailer = movie.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube')

    return (
        <div className="flex flex-col h-screen">
            <Navigation />
            <ScrollArea className="flex-1 h-0">
                {/* Hero Banner */}
                <div className="hero-banner-wrapper">
                    <div className="hero-banner-container">
                        <div className="hero-banner">
                            {/* Backdrop Image */}
                            <motion.div
                                className="absolute inset-0 parallax-smooth"
                                style={{ y: parallaxY }}
                            >
                                {movie.backdrop_path && backdropUrl && (
                                    <Image
                                        src={backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover object-top"
                                        priority
                                        sizes="(max-width: 1536px) 100vw, 1536px"
                                        quality={90}
                                    />
                                )}
                                {/* Gradient Overlays - Stronger for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />
                            </motion.div>

                            {/* Content Over Banner */}
                            <div className="hero-banner-content">
                                <div className="hero-banner-content-inner">
                                    <div className="flex gap-6 items-end">
                                        {/* Poster */}
                                        <div className="hidden md:block flex-shrink-0 relative w-48 h-72">
                                            <Image
                                                src={posterUrl}
                                                alt={movie.title}
                                                fill
                                                className="rounded-lg shadow-2xl object-cover"
                                                sizes="192px"
                                            />
                                        </div>

                                        {/* Title and Meta */}
                                        <div className="flex-1 space-y-3 pb-2">
                                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                                                {movie.title}
                                            </h1>

                                            {movie.tagline && (
                                                <p className="text-lg md:text-xl text-white/80 italic drop-shadow">
                                                    &ldquo;{movie.tagline}&rdquo;
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90">
                                                {movie.release_date && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(movie.release_date).getFullYear()}</span>
                                                    </div>
                                                )}

                                                {movie.runtime > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1.5">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                                    <span className="text-white/60">({movie.vote_count.toLocaleString()} votes)</span>
                                                </div>
                                            </div>

                                            {/* Genres */}
                                            <div className="flex flex-wrap gap-2">
                                                {movie.genres.map(genre => (
                                                    <span
                                                        key={genre.id}
                                                        className="px-3 py-1 bg-white/12 backdrop-blur-sm rounded-full text-sm text-white border border-white/30"
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Action Row */}
                                            <div className="pt-2 flex flex-wrap gap-4">
                                                <WatchProvider
                                                    providers={movie["watch/providers"]}
                                                    homepage={movie.homepage}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8 space-y-8 max-w-screen-2xl">
                    {/* Overview */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Overview</h2>
                        <ExpandableText text={movie.overview} />
                    </section>

                    {/* Key Information Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {director && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Director</h3>
                                <p className="text-lg">{director.name}</p>
                            </div>
                        )}

                        {movie.status && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Status</h3>
                                <p className="text-lg">{movie.status}</p>
                            </div>
                        )}

                        {movie.budget > 0 && (
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    Budget
                                </h3>
                                <p className="text-2xl font-bold tracking-tight">${movie.budget.toLocaleString()}</p>
                            </div>
                        )}

                        {movie.revenue > 0 && (
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    Revenue
                                </h3>
                                <p className="text-2xl font-bold tracking-tight">${movie.revenue.toLocaleString()}</p>
                            </div>
                        )}

                        {movie.production_countries.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                                    Countries
                                </h3>
                                <p className="text-lg">{movie.production_countries.map(c => c.name).join(', ')}</p>
                            </div>
                        )}

                        {movie.spoken_languages.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Languages</h3>
                                <p className="text-lg">{movie.spoken_languages.map(l => l.name).join(', ')}</p>
                            </div>
                        )}
                    </section>

                    {/* Production Companies */}
                    {movie.production_companies.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">
                                Production Companies
                            </h2>
                            <div className="flex flex-wrap gap-6">
                                {movie.production_companies.map(company => (
                                    <div key={company.id} className="flex items-center gap-3">
                                        {company.logo_path ? (
                                            <div className="relative h-8 w-32">
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                                                    alt={company.name}
                                                    fill
                                                    className="object-contain object-left"
                                                    sizes="128px"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">{company.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cast */}
                    {movie.credits && movie.credits.cast.length > 0 && (
                        <CastList cast={movie.credits.cast} />
                    )}

                    {/* Trailer */}
                    {trailer && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Official Trailer</h2>
                            <div className="relative aspect-video w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailer.key}`}
                                    title={trailer.name}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>
                        </section>
                    )}

                    {/* Similar Movies */}
                    {movie.similar && (
                        <SimilarMedia similar={movie.similar} type="movie" />
                    )}


                </div >
            </ScrollArea >
        </div >
    )
}
