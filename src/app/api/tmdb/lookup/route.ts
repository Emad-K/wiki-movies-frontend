/**
 * TMDB Lookup API Route
 * POST /api/tmdb/lookup
 * 
 * Looks up movie/TV show on TMDB by title and year
 * Returns full TMDB data including ID for subsequent API calls
 * 
 * TODO: REMOVE THIS ENDPOINT - Once backend includes TMDB IDs in search results,
 * this lookup step will no longer be necessary. The backend should store and return
 * TMDB IDs alongside Wikipedia IDs.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/lib/env';
import { tryAsync } from '@/lib/utils/async';
import { logError } from '@/lib/utils/logger';
import type { TMDBSearchResult } from '@/lib/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBSearchResponse {
    page: number;
    results: TMDBSearchResult[];
    total_pages: number;
    total_results: number;
}

interface LookupRequest {
    query: string;
    year?: number;
    media_type?: 'movie' | 'tv'; // Optional: helps narrow down results
}

/**
 * Fetch from TMDB
 * TODO: REMOVE - This will be unnecessary once backend provides TMDB IDs
 */
async function fetchFromTMDB(
    query: string,
    year?: number,
    mediaType?: 'movie' | 'tv'
): Promise<TMDBSearchResult | null> {
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

    // Use specific endpoint if media_type is provided, otherwise use multi search
    const endpoint = mediaType === 'movie'
        ? `${TMDB_BASE_URL}/search/movie?${params}`
        : mediaType === 'tv'
            ? `${TMDB_BASE_URL}/search/tv?${params}`
            : `${TMDB_BASE_URL}/search/multi?${params}`;

    const [response, error] = await tryAsync(
        axios.get<TMDBSearchResponse>(endpoint, {
            timeout: env.TMDB_TIMEOUT,
            headers: { 'Accept': 'application/json' },
        })
    );

    if (error || !response) {
        const isAxiosError = axios.isAxiosError(error);
        const status = isAxiosError ? error.response?.status : null;
        const errorCode = isAxiosError ? error.code : 'UNKNOWN';

        logError(`❌ TMDB [${errorCode || status}] "${query}" failed`);
        throw error || new Error('No response received from TMDB');
    }

    return response.data.results[0] || null;
}

export async function POST(request: NextRequest) {
    // Parse and validate request
    const [body, parseError] = await tryAsync(request.json() as Promise<LookupRequest>);
    if (parseError || !body?.query?.trim()) {
        return NextResponse.json(
            { error: 'Invalid request', details: 'Missing required field: query' },
            { status: 400 }
        );
    }

    const searchQuery = body.query.trim();

    // TODO: REMOVE - Once backend provides TMDB IDs, this entire lookup becomes unnecessary
    // Fetch from TMDB with Next.js caching (no database cache needed for temporary solution)
    const [result, fetchError] = await tryAsync(
        fetchFromTMDB(searchQuery, body.year, body.media_type)
    );

    if (fetchError) {
        const status = axios.isAxiosError(fetchError) ? (fetchError.response?.status || 500) : 500;
        const code = axios.isAxiosError(fetchError) ? fetchError.code : 'UNKNOWN';

        return NextResponse.json(
            { error: 'Failed to fetch from TMDB', code, message: fetchError.message },
            { status }
        );
    }

    // Cache for 7 days using Next.js caching
    // TODO: REMOVE - Caching won't be needed when TMDB IDs come from backend
    return NextResponse.json(result, {
        status: 200,
        headers: {
            'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 7 days cache, 1 day stale
        }
    });
}

// Disable other methods
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function OPTIONS() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
