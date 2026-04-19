import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai";
import { VertexAI, GenerativeModel as VertexGenerativeModel } from "@google-cloud/vertexai";
import JSON5 from "json5";

let genAI: GoogleGenerativeAI | null = null;
let vertexAI: VertexAI | null = null;

/**
 * Get internal AI Studio client.
 */
function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get internal Vertex AI client.
 * @returns VertexAI client
 */
function getVertexAI(): VertexAI {
  if (!vertexAI) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    if (!project) throw new Error("GOOGLE_CLOUD_PROJECT is not set");
    vertexAI = new VertexAI({
      project,
      location: "asia-south1",
    });
  }
  return vertexAI;
}


/**
 * Returns a Gemini 1.5 Flash model from AI Studio.
 * @returns GenerativeModel
 */
export function getFlashModel(): GenerativeModel {
  return getClient().getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
    },
  });
}

/**
 * Returns a Gemini 1.5 Flash model from AI Studio with JSON response mime type.
 * @returns GenerativeModel
 */
export function getJsonFlashModel(): GenerativeModel {
  return getClient().getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Returns a Gemini 1.5 Pro model from AI Studio.
 * @returns GenerativeModel
 */
export function getProModel(): GenerativeModel {
  return getClient().getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.4,
      topP: 0.85,
    },
  });
}

/**
 * Returns a Gemini 1.5 Pro model from AI Studio with JSON response mime type.
 * @returns GenerativeModel
 */
export function getJsonProModel(): GenerativeModel {
  return getClient().getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.4,
      topP: 0.85,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Returns a Gemini 1.5 Flash model from Vertex AI.
 * @returns VertexGenerativeModel
 */
export function getVertexFlashModel(): VertexGenerativeModel {
  return getVertexAI().getGenerativeModel({
    model: "gemini-1.5-flash-001",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
    },
  });
}

/**
 * Returns a Gemini 1.5 Flash model from Vertex AI with JSON response mime type.
 * @returns VertexGenerativeModel
 */
export function getVertexJsonFlashModel(): VertexGenerativeModel {
  return getVertexAI().getGenerativeModel({
    model: "gemini-1.5-flash-001",
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Parses a potentially messy JSON string from Gemini, cleaning markdown markers.
 * @template T - The expected return type
 * @param text - The raw response text from Gemini
 * @param contextName - Logging context name
 * @returns The parsed JSON object of type T
 * @throws Error if no valid JSON can be extracted
 */
export function parseGeminiJSON<T>(text: string, contextName: string = "gemini"): T {
  // 1. Try extracting an explicitly labeled markdown block
  const mdMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/i);
  const coreText = mdMatch?.[1] ?? text;

  // 2. Sliding window parse: hunt for the true JSON payload
  const startChars = ['{', '['];
  for (let i = 0; i < coreText.length; i++) {
    const char = coreText[i];
    if (char && startChars.includes(char)) {
      const endChar = char === '{' ? '}' : ']';
      const lastIndex = coreText.lastIndexOf(endChar);
      
      if (lastIndex > i) {
        const slice = coreText.substring(i, lastIndex + 1);
        try {
          const parsed = JSON5.parse(slice);
          // Only log in dev/test if needed, but for prompt instruction we suppress direct console.log later.
          // For now, keep it compatible but maybe use the new logger in actual app routes.
          return parsed as T;
        } catch (err) {
          // Keep hunting
        }
      }
    }
  }

  throw new Error(`[${contextName}] Could not extract parseable JSON from response.`);
}

/**
 * Builds an image part for multimodal Gemini calls.
 * @param base64Data - Base64 encoded image data
 * @param mimeType - Image mime type
 * @returns Part object for use in generateContent
 */
export function buildImagePart(base64Data: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
    },
  };
}