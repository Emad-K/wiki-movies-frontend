/**
 * Database connection using Drizzle ORM with Neon
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { env } from '@/lib/env';

let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get database connection
 * Database URL is validated at startup via env.ts
 */
export function getDb() {
  if (!db) {
    const sql = neon(env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }

  return db;
}

export { schema };

