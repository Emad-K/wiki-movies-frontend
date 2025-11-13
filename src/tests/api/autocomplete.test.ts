/**
 * Tests for autocomplete API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/autocomplete/route';
import { NextRequest } from 'next/server';
import * as apiClientModule from '@/lib/api-client';
import { AutocompleteRequest } from '@/lib/types/api';
import { AxiosError } from 'axios';

// Mock the api client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  API_TIMEOUT: 10000,
}));

describe('POST /api/autocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully proxy autocomplete request', async () => {
    const mockRequest: AutocompleteRequest = {
      field: 'director',
      size: 10,
      value: 'Chris',
      offset: 0,
    };

    const mockResponse = {
      total: 2,
      suggestions: [
        { value: 'Christopher Nolan', image_url: 'https://example.com/image.jpg', media_type: 'film' },
        { value: 'Chris Hemsworth' },
      ],
    };

    vi.mocked(apiClientModule.apiClient.post).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    const request = new NextRequest('http://localhost:3000/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(apiClientModule.apiClient.post).toHaveBeenCalledWith('/autocomplete', mockRequest);
  });

  it('should return 400 for invalid request (missing field)', async () => {
    const invalidRequest = {
      size: 10,
      value: 'test',
    };

    const request = new NextRequest('http://localhost:3000/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
    expect(apiClientModule.apiClient.post).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid request (missing size)', async () => {
    const invalidRequest = {
      field: 'director',
      value: 'test',
    };

    const request = new NextRequest('http://localhost:3000/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should handle backend error responses', async () => {
    // Suppress console.error for this test since we're testing error handling
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockRequest: AutocompleteRequest = {
      field: 'director',
      size: 10,
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
              loc: ['body', 'field'],
              msg: 'Invalid field value',
              type: 'value_error',
            },
          ],
        },
        headers: {},
        config: {} as any,
      }
    );

    vi.mocked(apiClientModule.apiClient.post).mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost:3000/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBeDefined();
    expect(data.details).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle network errors', async () => {
    // Suppress console.error for this test since we're testing error handling
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockRequest: AutocompleteRequest = {
      field: 'director',
      size: 10,
    };

    const mockError = new AxiosError('Network Error');

    vi.mocked(apiClientModule.apiClient.post).mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost:3000/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify(mockRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network Error');
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    
    consoleErrorSpy.mockRestore();
  });
});

