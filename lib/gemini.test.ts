import { describe, it, expect } from "vitest";
import { buildImagePart, parseGeminiJSON } from "@/lib/gemini";

describe("parseGeminiJSON", () => {
  it("parses direct JSON object", () => {
    const parsed = parseGeminiJSON<{ foo: string }>(`{"foo":"bar"}`, "unit");
    expect(parsed).toEqual({ foo: "bar" });
  });

  it("parses markdown wrapped JSON", () => {
    const parsed = parseGeminiJSON<{ list: number[] }>(
      "```json\n{list:[1,2,3]}\n```",
      "unit"
    );
    expect(parsed).toEqual({ list: [1, 2, 3] });
  });

  it("extracts JSON from noisy text", () => {
    const parsed = parseGeminiJSON<{ updatedPlan: Array<{ title: string }> }>(
      'Some preface text {"updatedPlan":[{"title":"Reach gate"}] } trailing text',
      "unit"
    );
    expect(parsed.updatedPlan[0].title).toBe("Reach gate");
  });

  it("throws when no valid JSON is present", () => {
    expect(() => parseGeminiJSON("not json at all", "unit")).toThrow(
      "[unit] Could not extract parseable JSON from response."
    );
  });
});

describe("buildImagePart", () => {
  it("builds inlineData payload", () => {
    expect(buildImagePart("abc", "image/png")).toEqual({
      inlineData: {
        data: "abc",
        mimeType: "image/png",
      },
    });
  });
});
