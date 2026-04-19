import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as gemini from "@/lib/gemini";
import { POST } from "@/app/api/plan-generate/route";

vi.mock("@/lib/gemini", () => ({
  getJsonFlashModel: vi.fn(),
  parseGeminiJSON: vi.fn(),
}));

describe("POST /api/plan-generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/plan-generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when prompt is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns generated plan on success", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      response: { text: () => "[{title:'Leave'}]" },
    });

    vi.mocked(gemini.getJsonFlashModel).mockReturnValue({
      generateContent,
    } as any);
    vi.mocked(gemini.parseGeminiJSON).mockReturnValue([
      {
        time: "5:00 PM",
        title: "Leave",
        description: "Start travel",
        type: "travel",
        reasoning: "Beat traffic",
      },
    ] as any);

    const res = await POST(makeReq({ prompt: "generate plan" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      plan: [
        {
          time: "5:00 PM",
          title: "Leave",
          description: "Start travel",
          type: "travel",
          reasoning: "Beat traffic",
        },
      ],
    });
  });
});
