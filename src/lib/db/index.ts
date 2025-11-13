/**
 * Database connection using Drizzle ORM with Neon
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { DATABASE_URL } from '@/lib/env';

let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get database connection
 * Returns null if DATABASE_URL is not configured
 */
export function getDb() {
  if (!DATABASE_URL) {
    console.warn('DATABASE_URL not configured. TMDB caching will be disabled.');
    return null;
  }

  if (!db) {
    const sql = neon(DATABASE_URL);
    db = drizzle(sql, { schema });
  }

  return db;
}

export { schema };

