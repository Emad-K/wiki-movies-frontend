import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Please add it to your .env.local file.\n' +
    'Example: DATABASE_URL=postgresql://user:password@host/database'
  );
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;

