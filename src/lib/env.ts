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

  // Parse TMDB_CACHE_DAYS with default value of 7 days
  const cacheDays = process.env.TMDB_CACHE_DAYS
    ? parseInt(process.env.TMDB_CACHE_DAYS, 10)
    : 7;

  if (isNaN(cacheDays) || cacheDays < 1) {
    throw new Error(
      `TMDB_CACHE_DAYS must be a positive number. Got: ${process.env.TMDB_CACHE_DAYS}`
    );
  }

  return {
    ...requiredEnvVars,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    TMDB_CACHE_DAYS: cacheDays,
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

