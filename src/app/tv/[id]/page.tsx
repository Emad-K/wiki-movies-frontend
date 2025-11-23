"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTMDBBackdropUrl, getTMDBPosterUrl } from "@/lib/tmdb"
import { Loader2, Calendar, Clock, Star, Tv, Globe } from "lucide-react"
import Link from "next/link"

interface TVShowDetails {
    id: number
    name: string
    tagline?: string
    overview: string
    backdrop_path: string | null
    poster_path: string | null
    first_air_date: string
    last_air_date?: string
    number_of_seasons: number
    number_of_episodes: number
    episode_run_time: number[]
    vote_average: number
    vote_count: number
    genres: { id: number; name: string }[]
    production_companies: { id: number; name: string; logo_path: string | null }[]
    production_countries: { iso_3166_1: string; name: string }[]
    spoken_languages: { iso_639_1: string; name: string }[]
    status: string
    homepage?: string
    created_by: { id: number; name: string }[]
    networks: { id: number; name: string; logo_path: string | null }[]
    credits?: {
        cast: { id: number; name: string; character: string; profile_path: string | null }[]
        crew: { id: number; name: string; job: string; department: string }[]
    }
    videos?: {
        results: { id: string; key: string; name: string; type: string; site: string }[]
    }
}

export default function TVShowDetailPage() {
    const params = useParams()
    const [show, setShow] = useState<TVShowDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchShow = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`/api/tmdb/tv/${params.id}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch TV show details')
                }

                const data = await response.json()
                setShow(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchShow()
        }
    }, [params.id])

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

    if (error || !show) {
        return (
            <div className="flex flex-col h-screen">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">{error || 'TV show not found'}</p>
                        <Link href="/" className="text-primary hover:underline">
                            Go back home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const backdropUrl = getTMDBBackdropUrl(show.backdrop_path, 'original')
    const posterUrl = getTMDBPosterUrl(show.poster_path, 'w500')
    const creators = show.created_by?.map(c => c.name).join(', ')
    const trailer = show.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube')
    const avgRuntime = show.episode_run_time.length > 0 ? show.episode_run_time[0] : 0

    return (
        <div className="flex flex-col h-screen">
            <Navigation />
            <ScrollArea className="flex-1 h-0">
                {/* Hero Banner */}
                <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px]">
                    {/* Backdrop Image */}
                    <div className="absolute inset-0">
                        {show.backdrop_path && (
                            <img
                                src={backdropUrl}
                                alt={show.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
                    </div>

                    {/* Content Over Banner */}
                    <div className="relative h-full container mx-auto px-4 flex items-end pb-8">
                        <div className="flex gap-6 items-end max-w-5xl">
                            {/* Poster */}
                            <div className="hidden md:block flex-shrink-0">
                                {show.poster_path && (
                                    <img
                                        src={posterUrl}
                                        alt={show.name}
                                        className="w-48 rounded-lg shadow-2xl"
                                    />
                                )}
                            </div>

                            {/* Title and Meta */}
                            <div className="flex-1 space-y-3 pb-2">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                                    {show.name}
                                </h1>

                                {show.tagline && (
                                    <p className="text-lg md:text-xl text-white/80 italic drop-shadow">
                                        &ldquo;{show.tagline}&rdquo;
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90">
                                    {show.first_air_date && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(show.first_air_date).getFullYear()}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5">
                                        <Tv className="h-4 w-4" />
                                        <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                                    </div>

                                    {avgRuntime > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            <span>{avgRuntime}m</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                                        <span className="text-white/60">({show.vote_count.toLocaleString()} votes)</span>
                                    </div>
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {show.genres.map(genre => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/30"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
                    {/* Overview */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Overview</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {show.overview}
                        </p>
                    </section>

                    {/* Key Information Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {creators && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Created By</h3>
                                <p className="text-lg">{creators}</p>
                            </div>
                        )}

                        {show.status && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Status</h3>
                                <p className="text-lg">{show.status}</p>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Episodes</h3>
                            <p className="text-lg">{show.number_of_episodes} Episodes</p>
                        </div>

                        {show.first_air_date && show.last_air_date && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Aired</h3>
                                <p className="text-lg">
                                    {new Date(show.first_air_date).getFullYear()} - {new Date(show.last_air_date).getFullYear()}
                                </p>
                            </div>
                        )}

                        {show.production_countries.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                                    <Globe className="h-4 w-4" />
                                    Countries
                                </h3>
                                <p className="text-lg">{show.production_countries.map(c => c.name).join(', ')}</p>
                            </div>
                        )}

                        {show.spoken_languages.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Languages</h3>
                                <p className="text-lg">{show.spoken_languages.map(l => l.name).join(', ')}</p>
                            </div>
                        )}
                    </section>

                    {/* Networks */}
                    {show.networks.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Networks</h2>
                            <div className="flex flex-wrap gap-6">
                                {show.networks.map(network => (
                                    <div key={network.id} className="flex items-center gap-3">
                                        {network.logo_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w200${network.logo_path}`}
                                                alt={network.name}
                                                className="h-8 object-contain"
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">{network.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cast */}
                    {show.credits && show.credits.cast.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Cast</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {show.credits.cast.slice(0, 10).map(person => (
                                    <div key={person.id} className="space-y-2">
                                        {person.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                alt={person.name}
                                                className="w-full aspect-[2/3] object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                                                <span className="text-muted-foreground text-xs">No Image</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm">{person.name}</p>
                                            <p className="text-xs text-muted-foreground">{person.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Trailer */}
                    {trailer && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Trailer</h2>
                            <div className="aspect-video w-full max-w-3xl">
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailer.key}`}
                                    title={trailer.name}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full rounded-lg"
                                />
                            </div>
                        </section>
                    )}

                    {/* External Links */}
                    {show.homepage && (
                        <section>
                            <a
                                href={show.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:underline"
                            >
                                <Globe className="h-4 w-4" />
                                Official Website
                            </a>
                        </section>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
