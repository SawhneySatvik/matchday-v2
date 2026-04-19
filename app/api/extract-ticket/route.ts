import { NextRequest, NextResponse } from "next/server";
import { getJsonProModel, buildImagePart, parseGeminiJSON } from "@/lib/gemini";
import { TicketData } from "@/lib/store";
import { logInfo, logError, logApiCall } from "@/lib/logger";
import { getEnv } from "@/lib/env";

const ROUTE_NAME = "/api/extract-ticket";

// SAVE TO PROMPT LIBRARY
const TICKET_EXTRACTION_PROMPT = `You are a ticket scanning specialist. Analyse this stadium/match ticket image carefully.

Extract ALL available information and return ONLY a JSON object with this exact structure:
{
  "match": "Full match description (e.g. India vs Australia - 3rd ODI)",
  "teams": "Home Team vs Away Team",
  "venue": "Stadium name only (e.g. Wankhede Stadium)",
  "venueAddress": "Full venue address if visible",
  "date": "DD Month YYYY format",
  "kickoffTime": "HH:MM AM/PM format (match start time)",
  "stand": "Stand name (e.g. North Stand, Members Pavilion)",
  "gate": "Gate number or name (e.g. Gate 4, Gate A)",
  "seat": "Seat number",
  "section": "Section/Block (e.g. Block A, Row 12)",
  "rawText": "All raw text visible on the ticket concatenated"
}

Rules:
- If a field is not visible on the ticket, set it to "Not specified"
- Be precise about the venue name — this is used for location lookup
- For kickoffTime, look for match start time, not gate opening time
- Return ONLY the JSON, no markdown, no explanation`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();
  try {
    const env = getEnv(); // Validate env vars
    const { imageBase64, mimeType } = (await req.json()) as { imageBase64: string; mimeType: string };

    if (!imageBase64 || !mimeType) {
      logApiCall(ROUTE_NAME, Date.now() - start, 400);
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 }
      );
    }

    logInfo(ROUTE_NAME, { message: "Starting ticket extraction", mimeType });

    const model = getJsonProModel();
    const imagePart = buildImagePart(imageBase64, mimeType);

    const result = await model.generateContent([
      TICKET_EXTRACTION_PROMPT,
      imagePart,
    ]);

    const text = result.response.text();
    const ticketData = parseGeminiJSON<TicketData>(text, "extract-ticket");

    logApiCall(ROUTE_NAME, Date.now() - start, 200);
    return NextResponse.json({ ticket: ticketData });
  } catch (error: unknown) {
    logError(ROUTE_NAME, error);
    logApiCall(ROUTE_NAME, Date.now() - start, 500);
    return NextResponse.json(
      { error: "Failed to extract ticket data. Please try a clearer image." },
      { status: 500 }
    );
  }
}