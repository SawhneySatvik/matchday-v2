import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as gemini from "@/lib/gemini";
import { POST } from "./route";

vi.mock("@/lib/gemini", () => ({
  getJsonFlashModel: vi.fn(),
  parseGeminiJSON: vi.fn(),
}));

describe("POST /api/exit-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/exit-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when venue missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns exit plan on success", async () => {
    const generateContent = vi.fn().mockResolvedValue({
      response: { text: () => '{"leaveByTime":"85th minute"}' },
    });

    vi.mocked(gemini.getJsonFlashModel).mockReturnValue({
      generateContent,
    } as any);
    vi.mocked(gemini.parseGeminiJSON).mockReturnValue({
      leaveByTime: "85th minute",
      recommendedGate: "Gate 4",
      estimatedCrowdLevel: "MEDIUM",
      route: "Use inner concourse",
      backupOptions: [],
      reasoning: "Beat final whistle rush",
    } as any);

    const res = await POST(makeReq({ venue: "Wankhede Stadium" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      exitPlan: {
        leaveByTime: "85th minute",
        recommendedGate: "Gate 4",
        estimatedCrowdLevel: "MEDIUM",
        route: "Use inner concourse",
        backupOptions: [],
        reasoning: "Beat final whistle rush",
      },
    });
  });
});
