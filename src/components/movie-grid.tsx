"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { Calendar, Globe, Play, Plus, Star } from "lucide-react"
import { SearchHit } from "@/lib/types/api"
import { searchTMDB, getTMDBPosterUrl, DEFAULT_POSTER_URL, type TMDBSearchResult } from "@/lib/tmdb"

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

function MovieCard({ movie }: { movie: SearchHit }) {
  const [showDetails, setShowDetails] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_POSTER_URL)
  const [isLoadingImage, setIsLoadingImage] = useState(true)
  const [showLeft, setShowLeft] = useState(false)
  const [tmdbData, setTmdbData] = useState<TMDBSearchResult | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const plot = movie.fields?.plot || "No description available"
  const director = movie.fields?.director?.[0] || "Unknown"
  const year = movie.fields?.released_year
  const country = movie.fields?.country?.[0]
  
  // Get rating info from TMDB data
  const rating = tmdbData?.vote_average ? tmdbData.vote_average.toFixed(1) : null
  const voteCount = tmdbData?.vote_count

  // Fetch TMDB poster image and data
  useEffect(() => {
    let isMounted = true

    const fetchPoster = async () => {
      if (!movie.title) {
        setIsLoadingImage(false)
        return
      }

      try {
        setIsLoadingImage(true)
        const result = await searchTMDB(movie.title, year)
        
        if (isMounted) {
          setTmdbData(result)
          setImageUrl(getTMDBPosterUrl(result?.poster_path))
          setIsLoadingImage(false)
        }
      } catch (error) {
        console.error('Error fetching TMDB data:', error)
        if (isMounted) {
          setImageUrl(DEFAULT_POSTER_URL)
          setIsLoadingImage(false)
        }
      }
    }

    fetchPoster()

    return () => {
      isMounted = false
    }
  }, [movie.title, year])

  // Check viewport boundaries to position details card
  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const cardWidth = cardRef.current.offsetWidth
      const gap = 16 // gap-4 = 16px
      const detailsWidth = cardWidth + gap // Cover next card completely
      const spaceOnRight = window.innerWidth - rect.right
      
      // Show details on left if not enough space on right
      setShowLeft(spaceOnRight < detailsWidth + 20)
    }
    setShowDetails(true)
  }

  return (
    <>
      {/* Desktop: Hover to show details */}
      <div
        ref={cardRef}
        className="relative cursor-pointer hidden md:block group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Base card - stays in place */}
        <div className="relative rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt={movie.title}
            className={`w-full aspect-[2/3] object-cover transition-opacity duration-300 ${
              isLoadingImage ? 'opacity-50' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {isLoadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse text-muted-foreground text-xs">Loading...</div>
            </div>
          )}
        </div>
        
        {/* Expanded card on hover - overlays the grid */}
        {showDetails && (
          <div className="absolute inset-0 z-50">
            <div className="relative w-full h-full">
              {/* Expanded container - perfectly aligned with original card */}
              <div
                className={`absolute top-0 h-full flex bg-card rounded-md shadow-2xl border border-border overflow-hidden ${
                  showLeft ? 'right-0 flex-row-reverse' : 'left-0 flex-row'
                }`}
                style={{
                  width: `${(cardRef.current?.offsetWidth || 0) * 2 + 16 + 2}px`, // 2 cards + gap + border compensation
                }}
              >
                {/* Image section - exactly matches original card size */}
                <div 
                  className="relative flex-shrink-0" 
                  style={{ 
                    width: `${cardRef.current?.offsetWidth || 0}px`,
                    height: '100%'
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details section - exactly one card width + gap */}
                <div 
                  className="flex flex-col justify-between p-4 bg-card"
                  style={{ 
                    width: `${(cardRef.current?.offsetWidth || 0) + 16}px`,
                    height: '100%'
                  }}
                >
                  <div>
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">{movie.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                      {year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{year}</span>
                        </div>
                      )}
                      {country && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{country}</span>
                        </div>
                      )}
                      {rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{rating}</span>
                          {voteCount && (
                            <span className="text-muted-foreground">({voteCount.toLocaleString()})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {director && (
                      <p className="text-xs mb-2">
                        <span className="text-muted-foreground">Director:</span>{' '}
                        <span className="font-medium">{director}</span>
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed mb-3">
                      {plot}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="w-full">
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Click to show details */}
      <div className="md:hidden">
        <div className="relative rounded-lg overflow-hidden cursor-pointer" onClick={() => setShowDetails(true)}>
          <img
            src={imageUrl}
            alt={movie.title}
            className={`w-full aspect-[2/3] object-cover transition-opacity duration-300 ${
              isLoadingImage ? 'opacity-50' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {isLoadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse text-muted-foreground text-xs">Loading...</div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="font-semibold text-sm text-white line-clamp-2">{movie.title}</h3>
            <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
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
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:hidden"
            onClick={() => setShowDetails(false)}
          >
            <div
              className="bg-card rounded-t-2xl p-6 w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-4 mb-4">
                <img
                  src={imageUrl}
                  alt={movie.title}
                  className="w-24 aspect-[2/3] object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{year}</span>
                      </div>
                    )}
                    {country && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{country}</span>
                      </div>
                    )}
                    {rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{rating}/10</span>
                        {voteCount && (
                          <span className="text-muted-foreground">({voteCount.toLocaleString()} votes)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {director && (
                <p className="text-sm mb-2">
                  <span className="font-semibold">Director:</span> {director}
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{plot}</p>
              <Button className="w-full mt-4" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

