import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent, trackPageView } from "@/lib/analytics";

describe("analytics", () => {
  const mockGtag = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate window environment
    vi.stubGlobal("window", { gtag: mockGtag });
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST";
  });

  it("trackEvent calls window.gtag with correct arguments", () => {
    trackEvent("ticket_scanned", { venue: "Wankhede" });
    expect(mockGtag).toHaveBeenCalledWith("event", "ticket_scanned", { venue: "Wankhede" });
  });

  it("trackEvent works without params", () => {
    trackEvent("plan_generated");
    expect(mockGtag).toHaveBeenCalledWith("event", "plan_generated", {});
  });

  it("trackPageView calls window.gtag with config", () => {
    trackPageView("/plan");
    expect(mockGtag).toHaveBeenCalledWith("config", "G-TEST", { page_path: "/plan" });
  });

  it("does nothing when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    trackEvent("ticket_scanned");
    expect(mockGtag).not.toHaveBeenCalled();
  });

  it("does nothing when gtag is missing", () => {
    vi.stubGlobal("window", {});
    trackEvent("ticket_scanned");
    expect(mockGtag).not.toHaveBeenCalled();
  });
});
