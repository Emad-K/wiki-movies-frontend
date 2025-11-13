/**
 * Database queries for TMDB cache
 */

import { getDb } from './index';
import { tmdbCache } from './schema';
import { and, eq, sql } from 'drizzle-orm';
import { TMDB_CACHE_DAYS } from '@/lib/env';

/**
 * Normalize search query for consistent cache lookups
 */
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(updatedAt: Date): boolean {
  const cacheExpiryMs = TMDB_CACHE_DAYS * 24 * 60 * 60 * 1000;
  const age = Date.now() - updatedAt.getTime();
  return age < cacheExpiryMs;
}

/**
 * Get cached TMDB result by search query
 */
export async function getCachedTMDBResult(query: string, year?: number) {
  const db = getDb();
  if (!db) return null;

  try {
    const normalizedQuery = normalizeQuery(query);
    
    const conditions = year
      ? and(
          eq(tmdbCache.searchQuery, normalizedQuery),
          eq(tmdbCache.searchYear, year)
        )
      : eq(tmdbCache.searchQuery, normalizedQuery);

    const results = await db
      .select()
      .from(tmdbCache)
      .where(conditions)
      .limit(1);

    if (results.length > 0) {
      const cached = results[0];
      
      // Check if cache is still valid
      if (isCacheValid(cached.updatedAt)) {
        console.log(`✅ Cache HIT for "${query}" (age: ${Math.floor((Date.now() - cached.updatedAt.getTime()) / 1000 / 60 / 60 / 24)} days)`);
        return {
          id: cached.id,
          title: cached.title || undefined,
          name: cached.name || undefined,
          poster_path: cached.posterPath || undefined,
          backdrop_path: cached.backdropPath || undefined,
          media_type: cached.mediaType || undefined,
          release_date: cached.releaseDate || undefined,
          first_air_date: cached.firstAirDate || undefined,
          vote_average: cached.voteAverage || undefined,
          vote_count: cached.voteCount || undefined,
          popularity: cached.popularity || undefined,
          overview: cached.overview || undefined,
          original_language: cached.originalLanguage || undefined,
          adult: cached.adult || undefined,
        };
      } else {
        console.log(`⏰ Cache EXPIRED for "${query}" (age: ${Math.floor((Date.now() - cached.updatedAt.getTime()) / 1000 / 60 / 60 / 24)} days)`);
        return null;
      }
    }

    console.log(`❌ Cache MISS for "${query}"`);
    return null;
  } catch (error) {
    console.error('Error getting cached TMDB result:', error);
    return null;
  }
}

/**
 * Cache TMDB result
 */
export async function cacheTMDBResult(
  query: string,
  year: number | undefined,
  result: any
) {
  const db = getDb();
  if (!db || !result) return;

  try {
    const normalizedQuery = normalizeQuery(query);

    // Check if entry exists
    const existing = await db
      .select()
      .from(tmdbCache)
      .where(eq(tmdbCache.id, result.id))
      .limit(1);

    if (existing.length > 0) {
      // Update existing entry
      await db
        .update(tmdbCache)
        .set({
          searchQuery: normalizedQuery,
          searchYear: year || null,
          title: result.title,
          name: result.name,
          posterPath: result.poster_path,
          backdropPath: result.backdrop_path,
          mediaType: result.media_type,
          releaseDate: result.release_date,
          firstAirDate: result.first_air_date,
          voteAverage: result.vote_average,
          voteCount: result.vote_count,
          popularity: result.popularity,
          overview: result.overview,
          originalLanguage: result.original_language,
          adult: result.adult,
          updatedAt: new Date(),
        })
        .where(eq(tmdbCache.id, result.id));
      
      console.log(`💾 Cache UPDATED for "${query}" (ID: ${result.id})`);
    } else {
      // Insert new entry
      await db.insert(tmdbCache).values({
        id: result.id,
        searchQuery: normalizedQuery,
        searchYear: year || null,
        title: result.title,
        name: result.name,
        posterPath: result.poster_path,
        backdropPath: result.backdrop_path,
        mediaType: result.media_type,
        releaseDate: result.release_date,
        firstAirDate: result.first_air_date,
        voteAverage: result.vote_average,
        voteCount: result.vote_count,
        popularity: result.popularity,
        overview: result.overview,
        originalLanguage: result.original_language,
        adult: result.adult,
      });
      
      console.log(`💾 Cache SAVED for "${query}" (ID: ${result.id})`);
    }
  } catch (error) {
    console.error('Error caching TMDB result:', error);
  }
}

