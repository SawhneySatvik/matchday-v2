import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useT } from "@/lib/i18n/useTranslation";
import { useMatchDayStore } from "@/lib/store";
import { translationCache } from "@/lib/i18n/translationCache";

// Mock the store
vi.mock("@/lib/store", () => ({
  useMatchDayStore: vi.fn(),
}));

describe("useT hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Clear the cache singleton
    Object.keys(translationCache).forEach(key => delete translationCache[key]);
  });

  it("returns English directly for 'en' language", () => {
    (useMatchDayStore as any).mockReturnValue("en");
    
    const { result } = renderHook(() => useT());
    const t = result.current;
    
    expect(t("heroTitle")).toBe("MATCHDAY\nINTELLIGENCE");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches and caches translations for non-English languages", async () => {
    (useMatchDayStore as any).mockReturnValue("hi");
    
    const mockTranslations = ["मैचडे", "शुरू करें", "टिकट स्कैन करें"];
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ translations: mockTranslations }),
    });

    const { result } = renderHook(() => useT());
    
    // Initial call might return English if cache is empty
    expect(result.current("heroTitle")).toBe("MATCHDAY\nINTELLIGENCE");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/translate", expect.any(Object));
    });

    // After fetch, hook should re-render and provide Hindi
    await waitFor(() => {
        expect(result.current("heroTitle")).toBe("मैचडे");
    });
  });

  it("falls back to English on fetch failure", async () => {
    (useMatchDayStore as any).mockReturnValue("hi");
    
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useT());
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should still be English (heroTitle)
    expect(result.current("heroTitle")).toBe("MATCHDAY\nINTELLIGENCE");
  });
});
