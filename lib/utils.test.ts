import { describe, it, expect } from "vitest";
import { cn, formatTime } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4", "text-sm", undefined, false && "hidden")).toBe(
      "px-4 text-sm"
    );
  });
});

describe("formatTime", () => {
  it("returns time in en-IN 12h format", () => {
    const date = new Date("2026-01-01T14:05:00.000Z");
    const formatted = formatTime(date);

    expect(typeof formatted).toBe("string");
    expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(am|pm|AM|PM)/);
  });
});
