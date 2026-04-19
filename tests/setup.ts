import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";


// Mock essential environment variables
process.env.GEMINI_API_KEY = "dummy-key";
process.env.GOOGLE_CLOUD_PROJECT = "dummy-project";
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "dummy-maps-key";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-XXXXXX";


const storage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  },
  writable: true,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  globalThis.localStorage?.clear?.();
});
