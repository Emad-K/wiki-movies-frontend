/**
 * Centralized logging utility
 * Supports different log levels for cleaner console output
 */

import { env } from '@/lib/env';

type LogLevel = 'debug' | 'info' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  error: 2,
};

/**
 * Log debug messages (only in debug mode)
 */
export function logDebug(...args: any[]) {
  if (LOG_LEVELS[env.LOG_LEVEL] <= LOG_LEVELS.debug) {
    console.log(...args);
  }
}

/**
 * Log info messages (in debug and info modes)
 */
export function logInfo(...args: any[]) {
  if (LOG_LEVELS[env.LOG_LEVEL] <= LOG_LEVELS.info) {
    console.log(...args);
  }
}

/**
 * Log error messages
 * In debug mode, includes full details
 * In info/error modes, shows clean one-liners
 */
export function logError(message: string, details?: any) {
  if (LOG_LEVELS[env.LOG_LEVEL] === LOG_LEVELS.debug && details) {
    console.error(message, details);
  } else {
    console.error(message);
  }
}

/**
 * Log warning messages
 */
export function logWarn(...args: any[]) {
  if (LOG_LEVELS[env.LOG_LEVEL] <= LOG_LEVELS.info) {
    console.warn(...args);
  }
}

