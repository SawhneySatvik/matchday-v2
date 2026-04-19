import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/translate/route";
import { NextRequest } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";

const { mockTranslateText } = vi.hoisted(() => ({
  mockTranslateText: vi.fn(),
}));

// Mock TranslationServiceClient
vi.mock("@google-cloud/translate", () => {
  return {
    TranslationServiceClient: vi.fn().mockImplementation(function() {
      return {
        translateText: mockTranslateText,
      };
    }),
  };
});

describe("POST /api/translate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for empty texts array", async () => {
    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      body: JSON.stringify({ texts: [], targetLanguage: "hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("texts array is required");
  });

  it("returns 400 for unsupported language", async () => {
    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      body: JSON.stringify({ texts: ["Hello"], targetLanguage: "fr" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Unsupported target language");
  });

  it("returns translations on success", async () => {
    const mockResponse = [{
      translations: [{ translatedText: "नमस्ते" }]
    }];
    mockTranslateText.mockResolvedValue(mockResponse);

    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      body: JSON.stringify({ texts: ["Hello"], targetLanguage: "hi" }),
    });
    
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.translations).toEqual(["नमस्ते"]);
  });

  it("returns 500 on client error", async () => {
    mockTranslateText.mockRejectedValue(new Error("API Error"));

    const req = new NextRequest("http://localhost/api/translate", {
      method: "POST",
      body: JSON.stringify({ texts: ["Hello"], targetLanguage: "hi" }),
    });
    
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Translation failed");
  });
});
