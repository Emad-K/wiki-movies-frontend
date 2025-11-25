"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { motion, useMotionValue } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTMDBBackdropUrl, getTMDBPosterUrl } from "@/lib/tmdb"
import { Loader2, Calendar, Clock, Star, Tv } from "lucide-react"
import Link from "next/link"
import { ExpandableText } from "@/components/expandable-text"
import { WatchProvider } from "@/components/watch-provider"
import { CastList } from "@/components/cast-list"
import { SimilarMedia } from "@/components/similar-media"

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
      name: string
      poster_path: string | null
      vote_average: number
      first_air_date: string
    }[]
  }
}

export default function TVShowDetailPage() {
  const params = useParams()
  const [show, setShow] = useState<TVShowDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Framer Motion for smooth parallax
  const parallaxY = useMotionValue(0)

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
  }, [show, parallaxY])

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
        <div className="hero-banner-wrapper">
          <div className="hero-banner-container">
            <div className="hero-banner">
              {/* Backdrop Image */}
              <motion.div
                className="absolute inset-0 parallax-smooth"
                style={{ y: parallaxY }}
              >
                {show.backdrop_path && backdropUrl && (
                  <Image
                    src={backdropUrl}
                    alt={show.name}
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
                      {show.poster_path && posterUrl && (
                        <Image
                          src={posterUrl}
                          alt={show.name}
                          fill
                          className="rounded-lg shadow-2xl object-cover"
                          sizes="192px"
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
                            className="px-3 py-1 rounded-full bg-white/20 dark:bg-black/20 text-white dark:text-white text-sm backdrop-blur-sm border border-white/20 dark:border-white/20"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>

                      {/* Action Row */}
                      <div className="pt-2 flex flex-wrap gap-4">
                        <WatchProvider
                          providers={show["watch/providers"]}
                          homepage={show.homepage}
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
            <ExpandableText text={show.overview} />
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
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
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

          {/* Cast */}
          {show.credits && show.credits.cast.length > 0 && (
            <CastList cast={show.credits.cast} />
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

          {/* Similar Shows */}
          {show.similar && (
            <SimilarMedia similar={show.similar} type="tv" />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
