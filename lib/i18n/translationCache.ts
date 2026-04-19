/**
 * Cache for translated strings keyed by language code.
 */
export interface TranslationCache {
  [language: string]: {
    data: { [key: string]: string };
    fetchedAt: number;
  };
}

/**
 * Time-to-live for translated strings (30 minutes).
 */
export const TRANSLATION_CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * In-memory singleton for translation caching.
 */
export const translationCache: TranslationCache = {};

/**
 * Checks if a language has a valid, non-expired cache entry.
 * @param language - The language code to check
 * @returns boolean
 */
export function isCacheValid(language: string): boolean {
  const entry = translationCache[language];
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < TRANSLATION_CACHE_TTL_MS;
}

/**
 * Populates the cache for a specific language.
 * @param language - The language code
 * @param translations - Record of key-value pairs
 */
export function setCache(language: string, translations: Record<string, string>): void {
  translationCache[language] = {
    data: translations,
    fetchedAt: Date.now(),
  };
}

/**
 * Retrieves a translated string from the cache.
 * @param language - The language code
 * @param key - The translation key
 * @returns The translated string, or undefined if not found
 */
export function getFromCache(language: string, key: string): string | undefined {
  const entry = translationCache[language];
  if (!entry) return undefined;
  return entry.data[key];
}

