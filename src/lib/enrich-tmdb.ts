/**
 * Helper functions for enriching search results with TMDB data
 * 
 * TODO: REMOVE THIS FILE - Once backend provides TMDB IDs in search results,
 * these enrichment functions will no longer be necessary
 */

import { searchTMDB } from '@/lib/tmdb';
import type { SearchHit } from '@/lib/types/api';
import type { TMDBSearchResult } from '@/lib/tmdb';

/**
 * Enrich a single search result with TMDB data if tmdb_id is undefined
 * 
 * Logic:
 * - If tmdb_id is a number: Already has TMDB ID, skip lookup
 * - If tmdb_id is null: Confirmed no TMDB entry exists, skip lookup
 * - If tmdb_id is undefined: Needs TMDB lookup
 * 
 * TODO: REMOVE - This will be unnecessary once backend provides TMDB IDs
 */
export async function enrichSearchHitWithTMDB(
    hit: SearchHit
): Promise<SearchHit & { tmdbData?: TMDBSearchResult }> {
    const fields = hit.fields;

    // Skip if we already have a TMDB ID or confirmed it doesn't exist
    if (fields?.tmdb_id !== undefined) {
        return hit;
    }

    // Need to lookup TMDB data
    const title = fields?.title || fields?.title_raw || hit.title;
    const year = fields?.released_year;
    const mediaType = fields?.media_type === 'television' ? 'tv' : 'movie';

    if (!title) {
        return hit;
    }

    try {
        const tmdbData = await searchTMDB(title, year, mediaType);

        return {
            ...hit,
            tmdbData: tmdbData || undefined,
        };
    } catch (error) {
        console.error(`Failed to enrich "${title}" with TMDB data:`, error);
        return hit;
    }
}

/**
 * Enrich multiple search results with TMDB data in parallel
 * Only looks up items where tmdb_id is undefined
 * 
 * TODO: REMOVE - This will be unnecessary once backend provides TMDB IDs
 */
export async function enrichSearchResultsWithTMDB(
    hits: SearchHit[]
): Promise<Array<SearchHit & { tmdbData?: TMDBSearchResult }>> {
    // Filter hits that need TMDB lookup (tmdb_id is undefined)
    const hitsNeedingLookup = hits.filter(hit => hit.fields?.tmdb_id === undefined);
    const hitsWithTMDB = hits.filter(hit => hit.fields?.tmdb_id !== undefined);

    console.log(
        `🔍 Enriching ${hitsNeedingLookup.length}/${hits.length} search results with TMDB data`
    );

    // Enrich hits that need lookup in parallel
    const enrichedHitsNeedingLookup = await Promise.all(
        hitsNeedingLookup.map(hit => enrichSearchHitWithTMDB(hit))
    );

    // Combine results maintaining original order
    const enrichedResults = hits.map(hit => {
        if (hit.fields?.tmdb_id !== undefined) {
            return hit;
        }
        return enrichedHitsNeedingLookup.find(enriched => enriched.id === hit.id) || hit;
    });

    return enrichedResults;
}
