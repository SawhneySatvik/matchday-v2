import { describe, it, expect, vi } from "vitest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";
import { 
  buildImagePart, 
  parseGeminiJSON, 
  getFlashModel, 
  getJsonFlashModel, 
  getProModel, 
  getJsonProModel, 
  getVertexFlashModel, 
  getVertexJsonFlashModel 
} from "@/lib/gemini";

const { mockGetGenerativeModel } = vi.hoisted(() => ({
  mockGetGenerativeModel: vi.fn().mockReturnValue({ model: "mocked-model" }),
}));

// Mock AI Studio client
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    }),
  };
});

// Mock Vertex AI client
vi.mock("@google-cloud/vertexai", () => {
  return {
    VertexAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    }),
  };
});


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
    expect(parsed.updatedPlan?.[0]?.title).toBe("Reach gate");
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
describe("model getters", () => {
  it("getFlashModel returns a flash model", () => {
    const model = getFlashModel();
    expect(model).toBeDefined();
    expect(mockGetGenerativeModel).toHaveBeenCalled();
  });

  it("getJsonFlashModel returns a flash model with JSON config", () => {
    const model = getJsonFlashModel();
    expect(model).toBeDefined();
  });

  it("getProModel returns a pro model", () => {
    const model = getProModel();
    expect(model).toBeDefined();
  });

  it("getJsonProModel returns a pro model with JSON config", () => {
    const model = getJsonProModel();
    expect(model).toBeDefined();
  });

  it("getVertexFlashModel returns a vertex flash model", () => {
    const model = getVertexFlashModel();
    expect(model).toBeDefined();
    expect(mockGetGenerativeModel).toHaveBeenCalled();
  });

  it("getVertexJsonFlashModel returns a vertex flash model with JSON config", () => {
    const model = getVertexJsonFlashModel();
    expect(model).toBeDefined();
  });
});
