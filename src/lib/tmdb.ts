/**
 * TMDB (The Movie Database) API utilities
 * Used to fetch movie poster images
 * API calls are proxied through the backend to keep the API key secure
 */

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Default placeholder image when no poster is available
export const DEFAULT_POSTER_URL = 'https://placehold.co/500x750/1a1a1a/gray?text=No+Poster'

export interface TMDBSearchResult {
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
  popularity?: number
  overview?: string
  original_language?: string
  adult?: boolean
}

/**
 * Search for a movie/TV show on TMDB by title
 * Calls the backend API to keep the TMDB API key secure
 */
export async function searchTMDB(
  query: string,
  year?: number
): Promise<TMDBSearchResult | null> {
  if (!query?.trim()) return null

  try {
    const response = await fetch('/api/tmdb/poster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        year,
      }),
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      console.error('TMDB API error:', response.status, response.statusText)
      return null
    }

    const result: TMDBSearchResult | null = await response.json()
    return result
  } catch (error) {
    console.error('Error searching TMDB:', error)
    return null
  }
}

/**
 * Get the full poster URL from TMDB
 * @param posterPath - The poster_path from TMDB API
 * @param size - Image size (w92, w154, w185, w342, w500, w780, original)
 * @returns Full TMDB image URL or default placeholder
 */
export function getTMDBPosterUrl(
  posterPath: string | null | undefined,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string {
  if (!posterPath) return DEFAULT_POSTER_URL
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`
}

/**
 * Get the full backdrop URL from TMDB
 * @param backdropPath - The backdrop_path from TMDB API
 * @param size - Image size (w300, w780, w1280, original)
 * @returns Full TMDB backdrop URL or null
 */
export function getTMDBBackdropUrl(
  backdropPath: string | null | undefined,
  size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'
): string | null {
  if (!backdropPath) return null
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`
}

/**
 * Get movie poster URL by searching TMDB
 * @param title - Movie title to search for
 * @param year - Optional release year for more accurate results
 * @returns TMDB poster URL or default placeholder
 */
export async function getMoviePosterUrl(
  title: string,
  year?: number
): Promise<string> {
  if (!title?.trim()) return DEFAULT_POSTER_URL

  const result = await searchTMDB(title, year)
  return getTMDBPosterUrl(result?.poster_path)
}

