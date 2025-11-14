/**
 * Tests for API client configuration
 */

import { describe, it, expect } from 'vitest';
import { createApiClient, API_TIMEOUT, SEARCH_API_TIMEOUT } from '@/lib/api-client';
import { BACKEND_BASE_URL, BACKEND_API_KEY } from '@/lib/env';

describe('API Client', () => {
  it('should create axios instance with correct configuration', () => {
    const client = createApiClient();

    expect(client.defaults.baseURL).toBe(BACKEND_BASE_URL);
    expect(client.defaults.timeout).toBe(API_TIMEOUT);
    expect(client.defaults.timeout).toBe(10000);
    
    // Check Authorization header
    const authHeader = client.defaults.headers.common['Authorization'];
    expect(authHeader).toBe(`Bearer ${BACKEND_API_KEY}`);
    
    // Check Content-Type header
    expect(client.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have correct timeout value', () => {
    expect(API_TIMEOUT).toBe(10000);
  });

  it('should have correct search API timeout value', () => {
    expect(SEARCH_API_TIMEOUT).toBe(100000);
  });

  it('should include Authorization header with Bearer token', () => {
    const client = createApiClient();
    const authHeader = client.defaults.headers.common['Authorization'];
    
    expect(authHeader).toBeDefined();
    expect(typeof authHeader).toBe('string');
    expect((authHeader as string).startsWith('Bearer ')).toBe(true);
    expect(authHeader).toBe(`Bearer ${BACKEND_API_KEY}`);
  });
});

