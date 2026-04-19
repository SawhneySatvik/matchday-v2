import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as gemini from "@/lib/gemini";
import { POST } from "@/app/api/extract-ticket/route";

vi.mock("@/lib/gemini", () => ({
  getJsonProModel: vi.fn(),
  buildImagePart: vi.fn(),
  parseGeminiJSON: vi.fn(),
}));

describe("POST /api/extract-ticket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/extract-ticket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeReq({ imageBase64: "abc" }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "imageBase64 and mimeType are required",
    });
  });

  it("returns parsed ticket on success", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      response: { text: () => '{"match":"India vs AUS"}' },
    });

    vi.mocked(gemini.getJsonProModel).mockReturnValue({
      generateContent,
    } as any);
    vi.mocked(gemini.buildImagePart).mockReturnValue({
      inlineData: { data: "abc", mimeType: "image/png" },
    } as any);
    vi.mocked(gemini.parseGeminiJSON).mockReturnValue({
      match: "India vs AUS",
    } as any);

    const res = await POST(
      makeReq({ imageBase64: "abc", mimeType: "image/png" })
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ticket: { match: "India vs AUS" },
    });
  });
});
