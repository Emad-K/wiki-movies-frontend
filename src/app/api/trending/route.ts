/**
 * TMDB Trending API Route
 * GET /api/trending
 * 
 * Proxies TMDB trending movies/TV endpoint to keep API key secure
 * Caches results for 24 hours
 */

import { NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/lib/env';
import { tryAsync } from '@/lib/utils/async';
import { logError } from '@/lib/utils/logger';
import { TMDBTrendingResponse } from '@/lib/types/api';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const revalidate = 86400; // Cache for 24 hours (86400 seconds)

export async function GET() {
  const params = new URLSearchParams({
    api_key: env.TMDB_API_KEY,
    language: 'en-US',
  });

  const [response, error] = await tryAsync(
    axios.get<TMDBTrendingResponse>(`${TMDB_BASE_URL}/trending/all/week?${params}`, {
      timeout: env.TMDB_TIMEOUT,
      headers: { 'Accept': 'application/json' },
    })
  );

  if (error) {
    const status = axios.isAxiosError(error) ? (error.response?.status || 500) : 500;
    const code = axios.isAxiosError(error) ? error.code : 'UNKNOWN';
    
    logError(`❌ TMDB Trending [${code || status}] - ${error.message}`);
    
    return NextResponse.json(
      { error: 'Failed to fetch trending', code, message: error.message },
      { status }
    );
  }

  return NextResponse.json(response.data, { 
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}

// Disable other methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

