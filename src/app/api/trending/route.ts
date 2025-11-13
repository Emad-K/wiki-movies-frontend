/**
 * TMDB Trending API Route
 * GET /api/trending
 * 
 * Proxies TMDB trending movies/TV endpoint to keep API key secure
 * Caches results for 24 hours
 */

import { NextResponse } from 'next/server';
import axios from 'axios';
import { TMDB_API_KEY } from '@/lib/env';
import { TMDBTrendingResponse } from '@/lib/types/api';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT = 10000; // 10 seconds

export const revalidate = 86400; // Cache for 24 hours (86400 seconds)

export async function GET() {
  try {
    // Validate TMDB API key is configured
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY not configured');
      return NextResponse.json(
        { error: 'TMDB API not configured' },
        { status: 500 }
      );
    }

    // Build TMDB API request params
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
    });

    // Make request to TMDB API for trending all (movies + TV) for the week
    const response = await axios.get<TMDBTrendingResponse>(
      `${TMDB_BASE_URL}/trending/all/week?${params}`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Return the trending results
    return NextResponse.json(response.data, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });

  } catch (error) {
    // Handle axios errors with detailed logging
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      
      // Log comprehensive error details
      console.error('=== TMDB Trending API Error ===');
      console.error('Status:', status);
      console.error('Error Message:', error.message);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Response Data:', error.response?.data);
      console.error('Response Headers:', error.response?.headers);
      
      if (error.code) {
        console.error('Error Code:', error.code);
      }
      
      console.error('================================');
      
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
    console.error('=======================');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: error?.constructor?.name,
        }
      },
      { status: 500 }
    );
  }
}

// Disable other methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

