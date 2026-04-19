import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  translationCache, 
  setCache, 
  getFromCache, 
  isCacheValid, 
  TRANSLATION_CACHE_TTL_MS 
} from "@/lib/i18n/translationCache";

describe("translationCache", () => {
  beforeEach(() => {
    // Clear the cache singleton before each test
    Object.keys(translationCache).forEach(key => delete translationCache[key]);
  });

  it("sets and gets from cache", () => {
    const data = { hello: "नमस्ते" };
    setCache("hi", data);
    expect(getFromCache("hi", "hello")).toBe("नमस्ते");
  });

  it("returns undefined for missing language", () => {
    expect(getFromCache("fr", "hello")).toBeUndefined();
  });

  it("validates cache based on TTL", () => {
    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    setCache("hi", { foo: "bar" });
    expect(isCacheValid("hi")).toBe(true);

    // Advance time just under TTL
    vi.setSystemTime(now + TRANSLATION_CACHE_TTL_MS - 1000);
    expect(isCacheValid("hi")).toBe(true);

    // Advance time past TTL
    vi.setSystemTime(now + TRANSLATION_CACHE_TTL_MS + 1000);
    expect(isCacheValid("hi")).toBe(false);

    vi.useRealTimers();
  });

  it("isCacheValid returns false for missing language", () => {
    expect(isCacheValid("unseen")).toBe(false);
  });
});
