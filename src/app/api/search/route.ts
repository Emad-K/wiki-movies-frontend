/**
 * Search API Route
 * POST /api/search
 * 
 * Proxies search requests to the backend API
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { apiClient } from '@/lib/api-client';
import { SearchRequest, SearchResponse, BackendSearchResponse, APIError } from '@/lib/types/api';
import { tryAsync } from '@/lib/utils/async';
import { logError } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  // Parse request body
  const [body, parseError] = await tryAsync(request.json() as Promise<SearchRequest>);
  if (parseError || !body?.value || typeof body.value !== 'string') {
    return NextResponse.json(
      { 
        error: 'Invalid request', 
        details: 'Missing required field: value (must be a string)' 
      } as APIError,
      { status: 400 }
    );
  }

  // Make request to backend
  const [response, error] = await tryAsync(
    apiClient.post<BackendSearchResponse>('/search', body)
  );

  if (error) {
    const status = axios.isAxiosError(error) ? (error.response?.status || 500) : 500;
    const code = axios.isAxiosError(error) ? error.code : 'UNKNOWN';
    
    logError(`❌ Backend Search [${code || status}] - ${error.message}`);
    
    const errorData: APIError = {
      error: axios.isAxiosError(error) 
        ? (error.response?.data?.detail || error.message || 'Request failed')
        : 'Internal server error',
      status,
      details: {
        errorCode: code,
      },
    };
    return NextResponse.json(errorData, { status });
  }

  // Transform paginated backend response to simplified format
  const simplifiedResponse: SearchResponse = {
    hits: response.data.content,
    total: response.data.totalElements,
  };

  return NextResponse.json(simplifiedResponse, { status: 200 });
}

// Disable OPTIONS method
export async function OPTIONS() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

