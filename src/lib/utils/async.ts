/**
 * Async utilities for cleaner error handling
 */

/**
 * Try-catch wrapper that returns [data, error] tuple
 * Makes async code less nested and easier to read
 * 
 * @example
 * const [data, error] = await tryAsync(fetchUser(id))
 * if (error) {
 *   // handle error
 *   return
 * }
 * // use data safely
 */
export async function tryAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

