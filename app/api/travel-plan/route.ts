import { NextRequest, NextResponse } from "next/server";
import { getJsonFlashModel, parseGeminiJSON } from "@/lib/gemini";
import { TravelOption } from "@/lib/store";
import { logInfo, logError, logApiCall } from "@/lib/logger";
import { getEnv } from "@/lib/env";

const ROUTE_NAME = "/api/travel-plan";

// SAVE TO PROMPT LIBRARY
const TRAVEL_PLAN_PROMPT = (
  venue: string,
  kickoffTime: string,
  date: string,
  userLocation: string,
  gate: string
) => `You are an experienced game-day travel advisor who knows Indian cities well.

Match Details:
- Venue: ${venue}
- Gate: ${gate}
- Date: ${date}
- Kickoff: ${kickoffTime}
- Fan Location: ${userLocation}

Generate exactly 3 travel options from the fan's location to the venue. For each option, think through:
1. Typical travel time considering time of day and day of week
2. Gates typically open 90 minutes before kickoff
3. Crowd surge usually hits 60-75 minutes before kickoff
4. Account for security queues (add 15-20 min buffer inside venue)

Return ONLY a JSON array with this exact structure:
[
  {
    "mode": "transit",
    "label": "Metro + Walk",
    "duration": "45 min",
    "leaveBy": "5:15 PM",
    "reasoning": "Metro Line X drops you 800m from the venue. Crowd surge expected at 5:45 PM — leaving at 5:15 keeps you 30 min ahead. Factor in 15 min security queue.",
    "steps": ["Take Metro Line X from [nearest station]", "Alight at [Stadium station]", "Walk 800m via [street name] to Gate ${gate}"],
    "recommended": true
  },
  {
    "mode": "driving",
    "label": "Cab / Drive",
    "duration": "35 min",
    "leaveBy": "5:00 PM",
    "reasoning": "...",
    "steps": ["..."],
    "recommended": false
  },
  {
    "mode": "walking",
    "label": "Walk / Auto",
    "duration": "20 min",
    "leaveBy": "5:30 PM",
    "reasoning": "...",
    "steps": ["..."],
    "recommended": false
  }
]

Rules:
- Mark the single best option as recommended: true
- The reasoning must explain the TIMING logic, not just directions
- Steps should be specific to the actual city/route
- Return ONLY the JSON array`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();
  try {
    const env = getEnv(); // Validate env vars
    const { venue, kickoffTime, date, userLocation, gate } = (await req.json()) as {
      venue: string;
      kickoffTime: string;
      date: string;
      userLocation: string;
      gate: string;
    };

    if (!venue || !kickoffTime || !userLocation) {
      logApiCall(ROUTE_NAME, Date.now() - start, 400);
      return NextResponse.json(
        { error: "venue, kickoffTime, and userLocation are required" },
        { status: 400 }
      );
    }

    const model = getJsonFlashModel();
    const prompt = TRAVEL_PLAN_PROMPT(venue, kickoffTime, date, userLocation, gate);
    
    logInfo(ROUTE_NAME, { message: "Generating travel options", venue, userLocation });
    const result = await model.generateContent(prompt);
    
    const finishReason = result.response.candidates?.[0]?.finishReason;
    logInfo(ROUTE_NAME, { message: "Gemini response received", finishReason });
    
    const text = result.response.text();
    const options = parseGeminiJSON<TravelOption[]>(text, "travel-plan");

    logApiCall(ROUTE_NAME, Date.now() - start, 200);
    return NextResponse.json({ options });
  } catch (error: unknown) {
    logError(ROUTE_NAME, error);
    logApiCall(ROUTE_NAME, Date.now() - start, 500);
    return NextResponse.json(
      { error: "Failed to generate travel plan." },
      { status: 500 }
    );
  }
}