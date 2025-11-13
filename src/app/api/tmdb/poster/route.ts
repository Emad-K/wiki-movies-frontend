/**
 * TMDB Poster API Route
 * POST /api/tmdb/poster
 * 
 * Proxies TMDB poster search requests to keep API key secure
 * Uses Neon database to cache results and reduce API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { TMDB_API_KEY, TMDB_CACHE_DAYS } from '@/lib/env';
import { getDb } from '@/lib/db';
import { tmdbCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TMDBSearchResult } from '@/lib/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

interface PosterRequest {
  query: string;
  year?: number;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(updatedAt: Date): boolean {
  const cacheExpiryMs = TMDB_CACHE_DAYS * 24 * 60 * 60 * 1000;
  const age = Date.now() - updatedAt.getTime();
  return age < cacheExpiryMs;
}

export async function POST(request: NextRequest) {
  const db = getDb();

  try {
    // Validate TMDB API key is configured
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY not configured');
      return NextResponse.json(
        { error: 'TMDB API not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: PosterRequest = await request.json();

    // Validate required fields
    if (!body.query || typeof body.query !== 'string' || !body.query.trim()) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: 'Missing required field: query (must be a non-empty string)' 
        },
        { status: 400 }
      );
    }

    const searchQuery = body.query.trim();
    let shouldFetchFromTMDB = true;
    let cachedResult: TMDBSearchResult | null = null;

    // Try to get from cache first if database is configured
    if (db) {
      try {
        // Search cache by title/name (we'll match the first result from TMDB search)
        // Note: This is a simplified approach. For better caching, consider storing
        // a hash of the search query or using a more sophisticated lookup
        const response = await axios.get<TMDBSearchResponse>(
          `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1&include_adult=false${body.year ? `&year=${body.year}` : ''}`,
          {
            timeout: REQUEST_TIMEOUT,
            headers: { 'Accept': 'application/json' },
          }
        );

        const firstResult = response.data.results[0];
        if (firstResult) {
          // Check if we have this ID in cache
          const cached = await db
            .select()
            .from(tmdbCache)
            .where(eq(tmdbCache.id, firstResult.id))
            .limit(1);

          if (cached.length > 0 && isCacheValid(cached[0].updatedAt)) {
            // Cache hit and still valid
            cachedResult = {
              id: cached[0].id,
              title: cached[0].title || undefined,
              name: cached[0].name || undefined,
              poster_path: cached[0].posterPath || undefined,
              backdrop_path: cached[0].backdropPath || undefined,
              media_type: cached[0].mediaType || undefined,
              release_date: cached[0].releaseDate || undefined,
              first_air_date: cached[0].firstAirDate || undefined,
              vote_average: cached[0].voteAverage || undefined,
              vote_count: cached[0].voteCount || undefined,
              popularity: cached[0].popularity || undefined,
              overview: cached[0].overview || undefined,
              original_language: cached[0].originalLanguage || undefined,
              adult: cached[0].adult || undefined,
            };
            shouldFetchFromTMDB = false;
            console.log(`Cache hit for TMDB ID ${firstResult.id} (age: ${Math.floor((Date.now() - cached[0].updatedAt.getTime()) / 1000 / 60 / 60 / 24)} days)`);
          } else if (cached.length > 0) {
            console.log(`Cache expired for TMDB ID ${firstResult.id}, refetching...`);
          }
        }
      } catch (error) {
        console.error('Error checking cache:', error);
        // Continue to fetch from TMDB on cache error
      }
    }

    // If we have a valid cached result, return it
    if (!shouldFetchFromTMDB && cachedResult) {
      return NextResponse.json(cachedResult, { status: 200 });
    }

    // Build TMDB API request params
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      query: searchQuery,
      page: '1',
      include_adult: 'false',
    });

    if (body.year) {
      params.append('year', body.year.toString());
    }

    // Make request to TMDB API
    const response = await axios.get<TMDBSearchResponse>(
      `${TMDB_BASE_URL}/search/multi?${params}`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Get the first result (most relevant) or null
    const result = response.data.results[0] || null;

    // If database is configured and we have a result, cache it
    if (db && result) {
      try {
        // Check if this ID already exists in cache
        const existing = await db
          .select()
          .from(tmdbCache)
          .where(eq(tmdbCache.id, result.id))
          .limit(1);

        if (existing.length > 0) {
          // Update existing cache entry
          await db
            .update(tmdbCache)
            .set({
              title: result.title,
              name: result.name,
              posterPath: result.poster_path,
              backdropPath: result.backdrop_path,
              mediaType: result.media_type,
              releaseDate: result.release_date,
              firstAirDate: result.first_air_date,
              voteAverage: result.vote_average,
              voteCount: result.vote_count,
              popularity: result.popularity,
              overview: result.overview,
              originalLanguage: result.original_language,
              adult: result.adult,
              updatedAt: new Date(),
            })
            .where(eq(tmdbCache.id, result.id));
        } else {
          // Insert new cache entry
          await db.insert(tmdbCache).values({
            id: result.id,
            title: result.title,
            name: result.name,
            posterPath: result.poster_path,
            backdropPath: result.backdrop_path,
            mediaType: result.media_type,
            releaseDate: result.release_date,
            firstAirDate: result.first_air_date,
            voteAverage: result.vote_average,
            voteCount: result.vote_count,
            popularity: result.popularity,
            overview: result.overview,
            originalLanguage: result.original_language,
            adult: result.adult,
          });
        }
      } catch (dbError) {
        console.error('Error caching TMDB result:', dbError);
        // Continue even if caching fails
      }
    }
    
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // Handle axios errors with detailed logging
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      
      // Log comprehensive error details
      console.error('=== TMDB API Error ===');
      console.error('Status:', status);
      console.error('Error Message:', error.message);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Params:', error.config?.params);
      console.error('Response Data:', error.response?.data);
      console.error('Response Headers:', error.response?.headers);
      
      if (error.code) {
        console.error('Error Code:', error.code);
      }
      
      console.error('Full Error Object:', JSON.stringify(error, null, 2));
      console.error('======================');
      
      return NextResponse.json(
        { 
          error: error.response?.statusText || error.message || 'TMDB API request failed',
          status,
          details: {
            responseData: error.response?.data,
            errorCode: error.code,
            requestUrl: error.config?.url,
          },
        },
        { status }
      );
    }

    // Handle other errors
    console.error('=== Non-Axios Error ===');
    console.error('Error Type:', error?.constructor?.name);
    console.error('Error Message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full Error:', error);
    console.error('=======================');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: error?.constructor?.name,
          stack: error instanceof Error ? error.stack : undefined,
        }
      },
      { status: 500 }
    );
  }
}

// Disable other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

