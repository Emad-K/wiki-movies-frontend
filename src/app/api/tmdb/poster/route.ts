/**
 * TMDB Poster API Route
 * POST /api/tmdb/poster
 * 
 * Proxies TMDB poster search requests to keep API key secure
 * Uses Neon database to cache results and reduce API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { TMDB_API_KEY } from '@/lib/env';
import { getCachedTMDBResult, cacheTMDBResult } from '@/lib/db/queries';
import type { TMDBSearchResult } from '@/lib/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

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
 * Delay helper for retries
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch from TMDB with retry logic (exponential backoff)
 */
async function fetchFromTMDB(query: string, year?: number, retryCount = 0): Promise<TMDBSearchResult | null> {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    language: 'en-US',
    query: query.trim(),
    page: '1',
    include_adult: 'false',
  });

  if (year) {
    params.append('year', year.toString());
  }

  try {
    const response = await axios.get<TMDBSearchResponse>(
      `${TMDB_BASE_URL}/search/multi?${params}`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    return response.data.results[0] || null;
  } catch (error) {
    const isAxiosError = axios.isAxiosError(error);
    
    // Check if it's a client error that we shouldn't retry
    const status = isAxiosError ? error.response?.status : null;
    const isClientError = status && (
      status === 401 || // Unauthorized
      status === 403 || // Forbidden
      status === 404 || // Not Found
      status === 429    // Too Many Requests
    );

    // Don't retry on client errors
    if (isClientError) {
      console.error(`❌ TMDB API client error [${status}] for "${query}" - not retrying`);
      throw error;
    }

    // Check if it's a network error or 5xx server error (retriable)
    const isNetworkError = isAxiosError && 
      (error.code === 'ECONNREFUSED' || 
       error.code === 'ETIMEDOUT' || 
       error.code === 'ENOTFOUND' ||
       error.code === 'ECONNRESET');
    
    const isServerError = status && status >= 500;

    // Retry on network errors or server errors
    if ((isNetworkError || isServerError) && retryCount < MAX_RETRIES) {
      const delayTime = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
      const errorInfo = isNetworkError ? error.code : `HTTP ${status}`;
      console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES} for "${query}" after ${delayTime}ms (${errorInfo})`);
      await delay(delayTime);
      return fetchFromTMDB(query, year, retryCount + 1);
    }

    // Log error and rethrow
    if (isAxiosError) {
      console.error(`❌ TMDB API error after ${retryCount} retries:`, {
        query,
        status,
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
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

    // Step 1: Check cache FIRST (without calling TMDB)
    const cachedResult = await getCachedTMDBResult(searchQuery, body.year);
    if (cachedResult) {
      return NextResponse.json(cachedResult, { status: 200 });
    }

    // Step 2: Cache miss - fetch from TMDB with retry logic
    const result = await fetchFromTMDB(searchQuery, body.year);

    // Step 3: Cache the result for future requests
    if (result) {
      await cacheTMDBResult(searchQuery, body.year, result);
    }
    
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorCode = error.code || 'UNKNOWN';
      
      // Clean, readable error logging
      console.error(`❌ TMDB API Error [${errorCode}] - ${error.message}`);
      if (error.config?.url) {
        console.error(`   URL: ${error.config.url}`);
      }
      if (error.response) {
        console.error(`   Status: ${status} ${error.response.statusText || ''}`);
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch from TMDB',
          code: errorCode,
          message: error.message,
          status,
        },
        { status }
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ TMDB Route Error: ${errorMessage}`);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage,
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

