import { logWarn } from "./logger";

/**
 * Validated Environment Variables interface.
 */
export interface Env {
  /** Gemini API Key (AI Studio) - Server only */
  GEMINI_API_KEY: string;
  /** Google Cloud Project ID - Server only */
  GOOGLE_CLOUD_PROJECT: string;
  /** Google Maps API Key - Client & Server */
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
  /** GA4 Measurement ID - Client & Server */
  NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
  /** Application base URL - Client & Server */
  NEXT_PUBLIC_APP_URL: string;
}

/**
 * Returns validated environment variables.
 * Throws on missing server-only variables.
 * Warns on missing client-side public variables.
 * @returns Env object
 */
export function getEnv(): Env {
  // Server-only variables — never expose these to the client!
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;

  if (!GEMINI_API_KEY) {
    throw new Error("Missing required server-side environment variable: GEMINI_API_KEY");
  }
  if (!GOOGLE_CLOUD_PROJECT) {
    throw new Error("Missing required server-side environment variable: GOOGLE_CLOUD_PROJECT");
  }

  // Client-side public variables
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!mapsKey) logWarn("env", { message: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing" });
  if (!gaId) logWarn("env", { message: "NEXT_PUBLIC_GA_MEASUREMENT_ID is missing" });

  return {
    GEMINI_API_KEY,
    GOOGLE_CLOUD_PROJECT,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: mapsKey,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: gaId,
    NEXT_PUBLIC_APP_URL: appUrl,
  };
}
