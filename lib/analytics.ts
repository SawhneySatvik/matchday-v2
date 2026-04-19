/**
 * Valid event names for MatchDay analytics.
 */
export type AnalyticsEvent =
  | "ticket_scanned"
  | "plan_generated"
  | "crowd_checked"
  | "exit_plan_generated"
  | "language_changed"
  | "stage_transition"
  | "chat_message_sent"
  | "plan_updated"
  | "travel_option_selected";

/**
 * Structured parameters for analytics events.
 */
export interface AnalyticsParams extends Record<string, string | number | boolean | undefined> {}

/**
 * Tracks a custom event in Google Analytics 4.
 * Guards against non-browser environments and missing gtag.
 * @param name - The event name from AnalyticsEvent
 * @param params - Optional parameter object
 */
export function trackEvent(name: AnalyticsEvent, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  
  const windowWithGtag = window as Window & { gtag?: Function };
  if (!windowWithGtag.gtag) return;
  
  windowWithGtag.gtag("event", name, params ?? {});
}

/**
 * Tracks a page view in Google Analytics 4.
 * @param path - The page path
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  
  const windowWithGtag = window as Window & { gtag?: Function };
  if (!windowWithGtag.gtag) return;
  
  windowWithGtag.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
    page_path: path,
  });
}
