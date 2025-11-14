/**
 * Environment variables validation using Zod
 * Validates and parses all environment variables at app startup
 * Throws descriptive errors if validation fails
 */

import { z } from 'zod';

const envSchema = z.object({
  // Required variables
  BACKEND_BASE_URL: z.string().url('BACKEND_BASE_URL must be a valid URL'),
  BACKEND_API_KEY: z.string().min(1, 'BACKEND_API_KEY is required'),
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY is required'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),

  // Optional variables with defaults
  TMDB_CACHE_DAYS: z.coerce.number().int().positive().default(7),
  TMDB_TIMEOUT: z.coerce.number().int().min(1000).default(10000),
  TMDB_MAX_RETRIES: z.coerce.number().int().nonnegative().default(2),
  TMDB_RETRY_DELAY: z.coerce.number().int().nonnegative().default(1000),
  LOG_LEVEL: z.enum(['debug', 'info', 'error']).default('info'),
});

// Validate environment variables at module load time
// This will throw a detailed error if validation fails
const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envResult.error.format());
  throw new Error(
    'Environment validation failed. Please check your .env.local file.\n' +
    'Missing or invalid variables: ' +
    Object.keys(envResult.error.format())
      .filter(key => key !== '_errors')
      .join(', ')
  );
}

// Export validated env object
export const env = envResult.data;

