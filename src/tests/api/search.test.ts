/**
 * Tests for search API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/search/route';
import { NextRequest } from 'next/server';
import * as apiClientModule from '@/lib/api-client';
import { SearchRequest } from '@/lib/types/api';
import { AxiosError } from 'axios';

// Mock the api client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  API_TIMEOUT: 10000,
}));

describe('POST /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully proxy search request with hybrid_search mode', async () => {
    const mockRequest: SearchRequest = {
      value: 'a science fiction movie about moving the Earth',
      size: 10,
      offset: 0,
      mode: 'hybrid_search',
      filters: [
        { field: 'country', value: 'china' },
        { field: 'media_type', value: 'film' },
      ],
    };

    const mockResponse = {
      total: 2,
      hits: [
        { 
          id: 1, 
          title: 'The Wandering Earth', 
          relevance: 0.95,
          fields: {
            id: 1,
            title: 'The Wandering Earth',
            media_type: 'film',
            country: ['China']
          }
        },
        { 
          id: 2, 
          title: 'The Wandering Earth II', 
          relevance: 0.89,
          fields: {
            id: 2,
            title: 'The Wandering Earth II',
            media_type: 'film',
            country: ['China']
          }
        },
      ],
    };

    vi.mocked(apiClientModule.apiClient.post).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(apiClientModule.apiClient.post).toHaveBeenCalledWith('/search', mockRequest);
  });

  it('should successfully proxy search request with title_search mode', async () => {
    const mockRequest: SearchRequest = {
      value: 'matrix',
      mode: 'title_search',
    };

    const mockResponse = {
      total: 2,
      hits: [
        { 
          id: 1, 
          title: 'The Matrix', 
          relevance: 1.0,
          fields: {
            id: 1,
            title: 'The Matrix',
            media_type: 'film'
          }
        },
        { 
          id: 2, 
          title: 'The Matrix Reloaded', 
          relevance: 0.85,
          fields: {
            id: 2,
            title: 'The Matrix Reloaded',
            media_type: 'film'
          }
        },
      ],
    };

    vi.mocked(apiClientModule.apiClient.post).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
  });

  it('should return 400 for missing value field', async () => {
    const invalidRequest = {
      size: 10,
      mode: 'hybrid_search',
    };

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
    expect(apiClientModule.apiClient.post).not.toHaveBeenCalled();
  });

  it('should return 400 for non-string value', async () => {
    const invalidRequest = {
      value: 123,
      size: 10,
    };

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should handle backend validation errors', async () => {
    // Suppress console.error for this test since we're testing error handling
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockRequest: SearchRequest = {
      value: 'test',
    };

    const mockError = new AxiosError(
      'Request failed with status code 422',
      '422',
      undefined,
      undefined,
      {
        status: 422,
        statusText: 'Unprocessable Entity',
        data: {
          detail: [
            {
              loc: ['body', 'value'],
              msg: 'Value too short',
              type: 'value_error',
            },
          ],
        },
        headers: {},
        config: {} as any,
      }
    );

    vi.mocked(apiClientModule.apiClient.post).mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle timeout errors', async () => {
    // Suppress console.error for this test since we're testing error handling
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockRequest: SearchRequest = {
      value: 'test query',
    };

    const mockError = new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED');

    vi.mocked(apiClientModule.apiClient.post).mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('timeout of 10000ms exceeded');
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    
    consoleErrorSpy.mockRestore();
  });
});

