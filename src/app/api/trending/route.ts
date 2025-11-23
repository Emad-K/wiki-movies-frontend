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

  // Fetch page 1 and 2 in parallel to get at least 24 items
  const [results, error] = await tryAsync(
    Promise.all([
      axios.get<TMDBTrendingResponse>(`${TMDB_BASE_URL}/trending/all/week?${params}&page=1`, {
        timeout: env.TMDB_TIMEOUT,
        headers: { 'Accept': 'application/json' },
      }),
      axios.get<TMDBTrendingResponse>(`${TMDB_BASE_URL}/trending/all/week?${params}&page=2`, {
        timeout: env.TMDB_TIMEOUT,
        headers: { 'Accept': 'application/json' },
      })
    ])
  );

  if (error || !results) {
    const status = axios.isAxiosError(error) ? (error.response?.status || 500) : 500;
    const code = axios.isAxiosError(error) ? error.code : 'UNKNOWN';
    const message = error?.message || 'No response from TMDB';

    logError(`❌ TMDB Trending [${code || status}] - ${message}`);

    return NextResponse.json(
      { error: 'Failed to fetch trending', code, message },
      { status }
    );
  }

  // Combine results from both pages
  const allResults = [
    ...(results[0].data.results || []),
    ...(results[1].data.results || [])
  ];

  // Return top 24 items
  const top24 = allResults.slice(0, 24);

  return NextResponse.json({ results: top24 }, {
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

