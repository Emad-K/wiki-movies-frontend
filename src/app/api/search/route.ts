/**
 * Search API Route
 * POST /api/search
 * 
 * Proxies search requests to the backend API
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { SearchRequest, SearchResponse, BackendSearchResponse, APIError } from '@/lib/types/api';
import { AxiosError } from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SearchRequest = await request.json();

    // Validate required fields
    if (!body.value || typeof body.value !== 'string') {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: 'Missing required field: value (must be a string)' 
        } as APIError,
        { status: 400 }
      );
    }

    // Make request to backend
    const response = await apiClient.post<BackendSearchResponse>(
      '/search',
      body
    );

    // Transform paginated backend response to simplified format
    const simplifiedResponse: SearchResponse = {
      hits: response.data.content,
      total: response.data.totalElements,
    };

    // Return the simplified response
    return NextResponse.json(simplifiedResponse, { status: 200 });

  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      console.error('Search API error:', status, error.message);
      
      const errorData: APIError = {
        error: error.response?.data?.detail || error.message || 'Request failed',
        status,
        details: {
          responseData: error.response?.data,
          errorCode: error.code,
          requestUrl: error.config?.url,
        },
      };
      return NextResponse.json(errorData, { status });
    }

    console.error('Search error:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as APIError,
      { status: 500 }
    );
  }
}

// Disable OPTIONS method
export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

