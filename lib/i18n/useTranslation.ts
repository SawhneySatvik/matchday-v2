"use client";

import { useState, useEffect } from "react";
import { useMatchDayStore } from "@/lib/store";
import { translations } from "./translations";
import { isCacheValid, setCache, getFromCache } from "./translationCache";

/**
 * Custom hook for runtime UI translations.
 * Supports on-the-fly translation via Google Cloud Translation API with caching.
 * @returns A translation function (key) => string
 */
export function useT(): (key: keyof typeof translations.en) => string {
  const language = useMatchDayStore((state) => state.preferences.language);
  const [, setTick] = useState(0); // Used to trigger re-renders on cache updates

  useEffect(() => {
    // English doesn't need API calls or caching
    if (language === "en") return;

    // Check if we already have valid cached translations
    if (isCacheValid(language)) return;

    // Fetch translations for all keys
    async function fetchTranslations(): Promise<void> {
      try {
        const keys = Object.keys(translations.en) as (keyof typeof translations.en)[];
        const texts = keys.map((k) => translations.en[k]);

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts,
            targetLanguage: language,
          }),
        });

        if (!res.ok) throw new Error("Translation fetch failed");

        const { translations: translatedTexts } = (await res.json()) as { 
          translations: string[] 
        };
        
        const newCache: Record<string, string> = {};
        keys.forEach((key, index) => {
          newCache[key] = translatedTexts[index] || translations.en[key];
        });

        setCache(language, newCache);
        setTick((t) => t + 1); // Trigger re-render to show new translations
      } catch (err) {
        // Silently fail and fall back to English
      }
    }

    fetchTranslations();
  }, [language]);

  /**
   * The actual translation function returned by the hook.
   * @param key - The translation key to look up
   * @returns The translated string
   */
  return (key: keyof typeof translations.en): string => {
    if (language === "en") return translations.en[key];

    const cached = getFromCache(language, key);
    return cached ?? translations.en[key];
  };
}
