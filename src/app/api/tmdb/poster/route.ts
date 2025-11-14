/**
 * TMDB Poster API Route
 * POST /api/tmdb/poster
 * 
 * Proxies TMDB poster search requests to keep API key secure
 * Uses Neon database to cache results and reduce API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { setTimeout } from 'timers/promises';
import axios from 'axios';
import { env } from '@/lib/env';
import { getCachedTMDBResult, cacheTMDBResult } from '@/lib/db/queries';
import { tryAsync } from '@/lib/utils/async';
import { logDebug, logError } from '@/lib/utils/logger';
import type { TMDBSearchResult } from '@/lib/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
 * Fetch from TMDB with retry logic (exponential backoff)
 */
async function fetchFromTMDB(query: string, year?: number, retryCount = 0): Promise<TMDBSearchResult | null> {
  const params = new URLSearchParams({
    api_key: env.TMDB_API_KEY,
    language: 'en-US',
    query: query.trim(),
    page: '1',
    include_adult: 'false',
  });

  if (year) {
    params.append('year', year.toString());
  }

  const [response, error] = await tryAsync(
    axios.get<TMDBSearchResponse>(`${TMDB_BASE_URL}/search/multi?${params}`, {
      timeout: env.TMDB_TIMEOUT,
      headers: { 'Accept': 'application/json' },
    })
  );

  if (error || !response) {
    if (!error) {
      throw new Error('No response received from TMDB');
    }

    const isAxiosError = axios.isAxiosError(error);
    const status = isAxiosError ? error.response?.status : null;
    const errorCode = isAxiosError ? error.code : 'UNKNOWN';
    
    // Client errors - don't retry
    const isClientError = status && (status === 401 || status === 403 || status === 404 || status === 429);
    if (isClientError) {
      logError(`❌ TMDB [${status}] "${query}" - not retrying`);
      throw error;
    }

    // Network/server errors - retry
    const isNetworkError = isAxiosError && ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(errorCode || '');
    const isServerError = status && status >= 500;

    if ((isNetworkError || isServerError) && retryCount < env.TMDB_MAX_RETRIES) {
      const delayMs = env.TMDB_RETRY_DELAY * Math.pow(2, retryCount);
      const errorInfo = isNetworkError ? errorCode : `HTTP ${status}`;
      logDebug(`🔄 Retry ${retryCount + 1}/${env.TMDB_MAX_RETRIES} for "${query}" after ${delayMs}ms (${errorInfo})`);
      await setTimeout(delayMs);
      return fetchFromTMDB(query, year, retryCount + 1);
    }

    logError(`❌ TMDB [${errorCode || status}] "${query}" failed after ${retryCount} retries`);
    throw error;
  }

  return response.data.results[0] || null;
}

export async function POST(request: NextRequest) {
  // Parse and validate request
  const [body, parseError] = await tryAsync(request.json() as Promise<PosterRequest>);
  if (parseError || !body?.query?.trim()) {
    return NextResponse.json(
      { error: 'Invalid request', details: 'Missing required field: query' },
      { status: 400 }
    );
  }

  const searchQuery = body.query.trim();

  // Step 1: Check cache
  const [cachedResult, cacheError] = await tryAsync(getCachedTMDBResult(searchQuery, body.year));
  if (cacheError) {
    logError(`Cache lookup error for "${searchQuery}"`, cacheError);
  }
  if (cachedResult) {
    logDebug(`✅ Cache hit for "${searchQuery}"`);
    return NextResponse.json(cachedResult, { status: 200 });
  }

  // Step 2: Fetch from TMDB
  const [result, fetchError] = await tryAsync(fetchFromTMDB(searchQuery, body.year));
  if (fetchError) {
    const status = axios.isAxiosError(fetchError) ? (fetchError.response?.status || 500) : 500;
    const code = axios.isAxiosError(fetchError) ? fetchError.code : 'UNKNOWN';
    
    return NextResponse.json(
      { error: 'Failed to fetch from TMDB', code, message: fetchError.message },
      { status }
    );
  }

  // Step 3: Cache the result
  if (result) {
    const [, cacheWriteError] = await tryAsync(cacheTMDBResult(searchQuery, body.year, result));
    if (cacheWriteError) {
      logError(`Failed to cache "${searchQuery}"`, cacheWriteError);
    }
  }

  return NextResponse.json(result, { status: 200 });
}

// Disable other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

