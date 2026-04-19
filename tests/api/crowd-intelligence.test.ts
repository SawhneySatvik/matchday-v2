import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as gemini from "@/lib/gemini";
import { POST } from "@/app/api/crowd-intelligence/route";

vi.mock("@/lib/gemini", () => ({
  getVertexJsonFlashModel: vi.fn(),
  parseGeminiJSON: vi.fn(),
}));


describe("POST /api/crowd-intelligence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/crowd-intelligence", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when venue or matchPhase missing", async () => {
    const res = await POST(makeReq({ venue: "Wankhede" }));
    expect(res.status).toBe(400);
  });

  it("returns zones on success", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      response: { text: () => "[{zone:'Entry Gates'}]" },
    });

    vi.mocked(gemini.getVertexJsonFlashModel).mockReturnValue({
      generateContent,
    } as any);

    vi.mocked(gemini.parseGeminiJSON).mockReturnValue([
      {
        zone: "Entry Gates",
        crowdLevel: "HIGH",
        estimatedWait: "~15 min",
        recommendation: "Arrive early",
        coords: { lat: 18.9, lng: 72.8 },
      },
    ] as any);

    const res = await POST(
      makeReq({ venue: "Wankhede Stadium", matchPhase: "pre-match" })
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      zones: [
        {
          zone: "Entry Gates",
          crowdLevel: "HIGH",
          estimatedWait: "~15 min",
          recommendation: "Arrive early",
          coords: { lat: 18.9, lng: 72.8 },
        },
      ],
    });
  });
});
