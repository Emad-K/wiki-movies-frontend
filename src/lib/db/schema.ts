/**
 * Database schema for TMDB cache
 * Using Drizzle ORM with Neon
 */

import { pgTable, text, timestamp, integer, real, boolean } from 'drizzle-orm/pg-core';

export const tmdbCache = pgTable('tmdb_cache', {
  id: integer('id').primaryKey(),
  searchQuery: text('search_query').notNull(), // Store normalized search query for lookup
  searchYear: integer('search_year'), // Optional year filter
  title: text('title'),
  name: text('name'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  mediaType: text('media_type'),
  releaseDate: text('release_date'),
  firstAirDate: text('first_air_date'),
  voteAverage: real('vote_average'),
  voteCount: integer('vote_count'),
  popularity: real('popularity'),
  overview: text('overview'),
  originalLanguage: text('original_language'),
  adult: boolean('adult'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TMDBCache = typeof tmdbCache.$inferSelect;
export type NewTMDBCache = typeof tmdbCache.$inferInsert;

