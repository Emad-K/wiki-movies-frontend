/**
 * TMDB Poster API Route
 * POST /api/tmdb/poster
 * 
 * Proxies TMDB poster search requests to keep API key secure
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { TMDB_API_KEY } from '@/lib/env';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

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

    // Build TMDB API request params
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      query: body.query.trim(),
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

    // Return the first result (most relevant) or null
    const result = response.data.results[0] || null;
    
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

