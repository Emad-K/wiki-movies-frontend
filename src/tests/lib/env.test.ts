/**
 * Tests for environment validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh import
    vi.resetModules();
    // Create a fresh copy of env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should successfully validate when all required env vars are present', async () => {
    process.env.BACKEND_BASE_URL = 'https://api.example.com';
    process.env.BACKEND_API_KEY = 'test-key';

    const { env, BACKEND_BASE_URL, BACKEND_API_KEY } = await import('@/lib/env');

    expect(env.BACKEND_BASE_URL).toBe('https://api.example.com');
    expect(env.BACKEND_API_KEY).toBe('test-key');
    expect(BACKEND_BASE_URL).toBe('https://api.example.com');
    expect(BACKEND_API_KEY).toBe('test-key');
  });

  it('should export TMDB_API_KEY when present', async () => {
    process.env.BACKEND_BASE_URL = 'https://api.example.com';
    process.env.BACKEND_API_KEY = 'test-key';
    process.env.TMDB_API_KEY = 'tmdb-test-key';

    const { env, TMDB_API_KEY } = await import('@/lib/env');

    expect(env.TMDB_API_KEY).toBe('tmdb-test-key');
    expect(TMDB_API_KEY).toBe('tmdb-test-key');
  });

  it('should export undefined TMDB_API_KEY when not set', async () => {
    process.env.BACKEND_BASE_URL = 'https://api.example.com';
    process.env.BACKEND_API_KEY = 'test-key';
    delete process.env.TMDB_API_KEY;

    const { env, TMDB_API_KEY } = await import('@/lib/env');

    expect(env.TMDB_API_KEY).toBeUndefined();
    expect(TMDB_API_KEY).toBeUndefined();
  });

  it('should throw error when BACKEND_BASE_URL is missing', async () => {
    delete process.env.BACKEND_BASE_URL;
    process.env.BACKEND_API_KEY = 'test-key';

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow(/Missing required environment variables.*BACKEND_BASE_URL/);
  });

  it('should throw error when BACKEND_API_KEY is missing', async () => {
    process.env.BACKEND_BASE_URL = 'https://api.example.com';
    delete process.env.BACKEND_API_KEY;

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow(/Missing required environment variables.*BACKEND_API_KEY/);
  });

  it('should throw error when both env vars are missing', async () => {
    delete process.env.BACKEND_BASE_URL;
    delete process.env.BACKEND_API_KEY;

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow(/Missing required environment variables.*BACKEND_BASE_URL.*BACKEND_API_KEY/);
  });

  it('should throw error when env vars are empty strings', async () => {
    process.env.BACKEND_BASE_URL = '   ';
    process.env.BACKEND_API_KEY = '';

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow(/Missing required environment variables/);
  });
});

