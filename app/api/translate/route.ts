import { NextRequest, NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";
import { logError, logApiCall } from "@/lib/logger";
import { getEnv } from "@/lib/env";

const ROUTE_NAME = "/api/translate";
const client = new TranslationServiceClient();

/**
 * Valid target languages for the MatchDay app.
 */
const SUPPORTED_LANGUAGES = ["hi", "mr", "bn", "gu"];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();
  try {
    const env = getEnv();
    const { texts, targetLanguage } = (await req.json()) as { 
      texts: string[]; 
      targetLanguage: string 
    };

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      logApiCall(ROUTE_NAME, Date.now() - start, 400);
      return NextResponse.json({ error: "texts array is required" }, { status: 400 });
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      logApiCall(ROUTE_NAME, Date.now() - start, 400);
      return NextResponse.json(
        { error: `Unsupported target language: ${targetLanguage}. Supported: ${SUPPORTED_LANGUAGES.join(", ")}` },
        { status: 400 }
      );
    }

    const request = {
      parent: `projects/${env.GOOGLE_CLOUD_PROJECT}/locations/global`,
      contents: texts,
      mimeType: "text/plain",
      sourceLanguageCode: "en",
      targetLanguageCode: targetLanguage,
    };

    const [response] = await client.translateText(request);
    const translations = response.translations?.map(t => t.translatedText || "") || [];

    logApiCall(ROUTE_NAME, Date.now() - start, 200);
    return NextResponse.json({ translations });
  } catch (error: unknown) {
    logError(ROUTE_NAME, error);
    logApiCall(ROUTE_NAME, Date.now() - start, 500);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
