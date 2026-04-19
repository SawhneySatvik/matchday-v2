import { NextRequest, NextResponse } from "next/server";
import { getJsonFlashModel, parseGeminiJSON } from "@/lib/gemini";
import { PlanItem } from "@/lib/store";
import { logInfo, logError, logApiCall } from "@/lib/logger";
import { getEnv } from "@/lib/env";

const ROUTE_NAME = "/api/plan-generate";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();
  try {
    const env = getEnv(); // Validate env vars
    const { prompt } = (await req.json()) as { prompt: string };
    if (!prompt) {
      logApiCall(ROUTE_NAME, Date.now() - start, 400);
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const model = getJsonFlashModel();
    logInfo(ROUTE_NAME, { message: "Generating match day plan" });
    const result = await model.generateContent(prompt);
    
    const text = result.response.text();
    const plan = parseGeminiJSON<PlanItem[]>(text, "plan-generate");

    logApiCall(ROUTE_NAME, Date.now() - start, 200);
    return NextResponse.json({ plan });
  } catch (error: unknown) {
    logError(ROUTE_NAME, error);
    logApiCall(ROUTE_NAME, Date.now() - start, 500);
    return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
  }
}