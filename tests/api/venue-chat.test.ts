import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as gemini from "@/lib/gemini";
import { POST } from "@/app/api/venue-chat/route";

vi.mock("@/lib/gemini", () => ({
  getFlashModel: vi.fn(),
  parseGeminiJSON: vi.fn(),
}));

const requestBody = {
  message: "Can you update my plan?",
  history: [{ role: "user", content: "hello", timestamp: new Date().toISOString() }],
  ticket: {
    match: "India vs Australia",
    teams: "India vs Australia",
    venue: "Wankhede Stadium",
    venueAddress: "Mumbai",
    date: "1 Jan 2026",
    kickoffTime: "7:00 PM",
    stand: "North",
    gate: "Gate 1",
    seat: "A1",
    section: "Block A",
    rawText: "raw",
  },
  preferences: {
    location: "Andheri",
    locationCoords: null,
    travelMode: "transit",
    foodPreference: "veg",
    priorities: ["food"],
    accessibilityNeeds: false,
    doNotMiss: [],
  },
  venueInfo: null,
  plan: [],
  matchPhase: "pre-match",
  crowdData: null,
  planUpdate: true,
};

describe("POST /api/venue-chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/venue-chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns plain chat response when no plan JSON included", async () => {
    const sendMessage = vi.fn().mockResolvedValue({
      response: { text: () => "Go to Gate 1 now." },
    });
    const startChat = vi.fn().mockReturnValue({ sendMessage });

    vi.mocked(gemini.getFlashModel).mockReturnValue({ startChat } as any);

    const res = await POST(makeReq(requestBody));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      response: "Go to Gate 1 now.",
      updatedPlan: null,
    });
  });

  it("extracts updatedPlan JSON and strips it from response", async () => {
    const modelText =
      'Done. {"updatedPlan":[{"time":"7:10 PM","title":"Move","description":"Head to gate","type":"event","reasoning":"Less crowd"}] }';

    const sendMessage = vi.fn().mockResolvedValue({
      response: { text: () => modelText },
    });
    const startChat = vi.fn().mockReturnValue({ sendMessage });

    vi.mocked(gemini.getFlashModel).mockReturnValue({ startChat } as any);
    vi.mocked(gemini.parseGeminiJSON).mockReturnValue({
      updatedPlan: [
        {
          time: "7:10 PM",
          title: "Move",
          description: "Head to gate",
          type: "event",
          reasoning: "Less crowd",
        },
      ],
    } as any);

    const res = await POST(makeReq(requestBody));
    expect(res.status).toBe(200);

    await expect(res.json()).resolves.toEqual({
      response: "Done.",
      updatedPlan: [
        {
          time: "7:10 PM",
          title: "Move",
          description: "Head to gate",
          type: "event",
          reasoning: "Less crowd",
        },
      ],
    });
  });
});
