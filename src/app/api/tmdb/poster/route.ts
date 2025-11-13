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
    const isNetworkError = isAxiosError && 
      (error.code === 'ECONNREFUSED' || 
       error.code === 'ETIMEDOUT' || 
       error.code === 'ENOTFOUND' ||
       error.code === 'ECONNRESET');

    // Retry on network errors
    if (isNetworkError && retryCount < MAX_RETRIES) {
      const delayTime = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
      console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES} for "${query}" after ${delayTime}ms (error: ${error.code})`);
      await delay(delayTime);
      return fetchFromTMDB(query, year, retryCount + 1);
    }

    // Log error and rethrow
    if (isAxiosError) {
      console.error(`❌ TMDB API error after ${retryCount} retries:`, {
        query,
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

