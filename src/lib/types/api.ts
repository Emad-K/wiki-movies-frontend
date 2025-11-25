/**
 * TypeScript types generated from OpenAPI specification
 * wiki-movies API v1.0.0
 */

// Enums
export type FieldEnum =
  | 'imdb_id'
  | 'metacritic_id'
  | 'rotten_tomatoes_id'
  | 'title_raw'
  | 'title'
  | 'director'
  | 'producer'
  | 'writer'
  | 'screenplay'
  | 'story'
  | 'developer'
  | 'starring'
  | 'music'
  | 'cinematography'
  | 'editing'
  | 'studio'
  | 'distributor'
  | 'country'
  | 'language'
  | 'production_companies'
  | 'media_type';

export type ModeEnum = 'hybrid_search' | 'title_search';

// Request Types
export interface AutocompleteRequest {
  /** Maximum number of suggestions to return */
  size: number;
  /** Field to search in (one of autocomplete/fields) */
  field: FieldEnum;
  /** Substring(s) to match in the field */
  value?: string | string[] | null;
  /** Result offset (for pagination, zero-based) */
  offset?: number;
}

export interface FieldFilter {
  /** Attribute field to filter on */
  field: FieldEnum;
  /** List of values to filter the attribute by (must be an array) */
  value: string[];
}

export interface SearchRequest {
  /** Search string to match in 'plot' and 'plot_chunks' (mandatory) */
  value: string;
  /** Number of hits to return */
  size?: number;
  /** Result offset */
  offset?: number;
  /** Search mode: 'hybrid_search' (default) or 'title_search' for prefix title search */
  mode?: ModeEnum;
  /** Optional attribute filters applied alongside the search */
  filters?: FieldFilter[] | null;
}

// Response Types
export interface AutocompleteSuggestion {
  value: string;
  image_url?: string;
  media_type?: string;
}

// Backend Paginated Response Types
export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface BackendAutocompleteResponse {
  content: AutocompleteSuggestion[];
  pageable: PageableInfo;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SearchHitFields {
  sddocname?: string;
  documentid?: string;
  id?: number;
  title?: string;
  title_raw?: string;
  gross?: number;
  gross_currency?: string;
  director?: string[];
  producer?: string[];
  writer?: string[];
  screenplay?: string[];
  story?: string[];
  developer?: string[];
  starring?: string[];
  music?: string[];
  cinematography?: string[];
  editor?: string[];
  studio?: string[];
  distributor?: string[];
  country?: string[];
  language?: string[];
  production_companies?: string[];
  media_type?: string;
  image_url?: string;
  plot?: string;
  reception?: string;
  released_year?: number;
  runtime_minutes?: number;
  budget?: number;
  budget_currency?: string;
  imdb_id?: string;
  imdb_url?: string;
  metacritic_id?: string;
  metacritic_url?: string;
  metacritic_score?: number;
  rotten_tomatoes_id?: string;
  rotten_tomatoes_url?: string;
  rotten_tomatoes_score?: number;
  official_website?: string;
  [key: string]: any;
}

export interface SearchHit {
  id: number;
  title: string;
  relevance: number;
  fields?: SearchHitFields;
}

export interface AutocompleteResponse {
  total?: number;
  suggestions: AutocompleteSuggestion[];
}

export interface SearchResponse {
  total?: number;
  hits: SearchHit[];
}

export interface BackendSearchResponse {
  content: SearchHit[];
  pageable: PageableInfo;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface HealthResponse {
  status: string;
  [key: string]: any;
}

// Error Types
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface APIError {
  error: string;
  status?: number;
  details?: any;
}

// TMDB Types
export interface TMDBTrendingMovie {
  adult: boolean;
  backdrop_path: string | null;
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  media_type: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
  // TV show specific fields
  episode_run_time?: number[];
  status?: string;
  content_ratings?: {
    results: Array<{
      iso_3166_1: string;
      rating: string;
    }>
  };
}

export interface TMDBTrendingResponse {
  page: number;
  results: TMDBTrendingMovie[];
  total_pages: number;
  total_results: number;
}

