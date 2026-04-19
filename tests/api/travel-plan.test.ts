import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as gemini from "@/lib/gemini";
import { POST } from "@/app/api/travel-plan/route";

vi.mock("@/lib/gemini", () => ({
  getJsonFlashModel: vi.fn(),
  parseGeminiJSON: vi.fn(),
}));

describe("POST /api/travel-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/travel-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 for missing required fields", async () => {
    const res = await POST(makeReq({ venue: "Wankhede" }));
    expect(res.status).toBe(400);
  });

  it("returns travel options on success", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      response: {
        candidates: [{ finishReason: "STOP" }],
        text: () => "[{mode:'transit'}]",
      },
    });

    vi.mocked(gemini.getJsonFlashModel).mockReturnValue({
      generateContent,
    } as any);
    vi.mocked(gemini.parseGeminiJSON).mockReturnValue([
      {
        mode: "transit",
        label: "Metro + Walk",
        duration: "45 min",
        leaveBy: "5:15 PM",
        reasoning: "Best option",
        steps: ["Take metro"],
        recommended: true,
      },
    ] as any);

    const res = await POST(
      makeReq({
        venue: "Wankhede Stadium",
        kickoffTime: "7:00 PM",
        date: "01 Jan 2026",
        userLocation: "Andheri",
        gate: "Gate 1",
      })
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      options: [
        {
          mode: "transit",
          label: "Metro + Walk",
          duration: "45 min",
          leaveBy: "5:15 PM",
          reasoning: "Best option",
          steps: ["Take metro"],
          recommended: true,
        },
      ],
    });
  });
});
