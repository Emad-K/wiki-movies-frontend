/**
 * Environment variables validation
 * This file validates required environment variables at app startup
 * and throws an error if any are missing
 */

interface EnvConfig {
  BACKEND_BASE_URL: string;
  BACKEND_API_KEY: string;
  TMDB_API_KEY: string | undefined;
  DATABASE_URL: string | undefined;
  TMDB_CACHE_DAYS: number;
  TMDB_TIMEOUT: number;
  TMDB_MAX_RETRIES: number;
  TMDB_RETRY_DELAY: number;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    BACKEND_API_KEY: process.env.BACKEND_API_KEY,
  };

  const missingVars: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please ensure these are set in your .env.local file.`
    );
  }

  // Parse numeric environment variables with defaults
  const cacheDays = process.env.TMDB_CACHE_DAYS
    ? parseInt(process.env.TMDB_CACHE_DAYS, 10)
    : 7;

  const tmdbTimeout = process.env.TMDB_TIMEOUT
    ? parseInt(process.env.TMDB_TIMEOUT, 10)
    : 10000; // 10 seconds

  const tmdbMaxRetries = process.env.TMDB_MAX_RETRIES
    ? parseInt(process.env.TMDB_MAX_RETRIES, 10)
    : 2;

  const tmdbRetryDelay = process.env.TMDB_RETRY_DELAY
    ? parseInt(process.env.TMDB_RETRY_DELAY, 10)
    : 1000; // 1 second

  // Validate numeric values
  if (isNaN(cacheDays) || cacheDays < 1) {
    throw new Error(
      `TMDB_CACHE_DAYS must be a positive number. Got: ${process.env.TMDB_CACHE_DAYS}`
    );
  }

  if (isNaN(tmdbTimeout) || tmdbTimeout < 1000) {
    throw new Error(
      `TMDB_TIMEOUT must be at least 1000ms. Got: ${process.env.TMDB_TIMEOUT}`
    );
  }

  if (isNaN(tmdbMaxRetries) || tmdbMaxRetries < 0) {
    throw new Error(
      `TMDB_MAX_RETRIES must be a non-negative number. Got: ${process.env.TMDB_MAX_RETRIES}`
    );
  }

  if (isNaN(tmdbRetryDelay) || tmdbRetryDelay < 0) {
    throw new Error(
      `TMDB_RETRY_DELAY must be a non-negative number. Got: ${process.env.TMDB_RETRY_DELAY}`
    );
  }

  return {
    ...requiredEnvVars,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    TMDB_CACHE_DAYS: cacheDays,
    TMDB_TIMEOUT: tmdbTimeout,
    TMDB_MAX_RETRIES: tmdbMaxRetries,
    TMDB_RETRY_DELAY: tmdbRetryDelay,
  } as EnvConfig;
}

// Validate and export environment variables
// This will throw an error at module load time if variables are missing
export const env = validateEnv();

// Export individual variables for convenience
export const BACKEND_BASE_URL = env.BACKEND_BASE_URL;
export const BACKEND_API_KEY = env.BACKEND_API_KEY;
export const TMDB_API_KEY = env.TMDB_API_KEY;
export const DATABASE_URL = env.DATABASE_URL;
export const TMDB_CACHE_DAYS = env.TMDB_CACHE_DAYS;
export const TMDB_TIMEOUT = env.TMDB_TIMEOUT;
export const TMDB_MAX_RETRIES = env.TMDB_MAX_RETRIES;
export const TMDB_RETRY_DELAY = env.TMDB_RETRY_DELAY;

