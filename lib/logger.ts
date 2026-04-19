import { Logging } from "@google-cloud/logging";

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const logging = new Logging(projectId ? { projectId } : {});
const log = logging.log("matchday-api");

/**
 * Logs informational data to Google Cloud Logging (fire-and-forget).
 */
export function logInfo(route: string, data: Record<string, unknown>): void {
  const entry = log.entry(
    { severity: "INFO" },
    { route, timestamp: new Date().toISOString(), ...data }
  );
  log.write(entry).catch(() => undefined);
}

/**
 * Logs a warning message to Google Cloud Logging.
 * Fire-and-forget; will not block execution or throw.
 * @param route - The API route path or name
 * @param data - Structured data to log
 */
export function logWarn(route: string, data: Record<string, unknown>): void {
  const entry = log.entry(
    { severity: "WARNING" },
    { route, timestamp: new Date().toISOString(), ...data }
  );
  log.write(entry).catch(() => undefined);
}

/**
 * Logs an error to Google Cloud Logging with safe message extraction.
 * Fire-and-forget; will not block execution or throw.
 * @param route - The API route path or name
 * @param error - The error object or unknown error value
 * @param context - Optional additional context
 */
export function logError(
  route: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const message = error instanceof Error ? error.message : String(error);
  const entry = log.entry(
    { severity: "ERROR" },
    { 
      route, 
      timestamp: new Date().toISOString(), 
      message, 
      ...context, 
      stack: error instanceof Error ? error.stack : undefined 
    }
  );
  log.write(entry).catch(() => undefined);
}

/**
 * Logs API call performance and status.
 * Fire-and-forget; will not block execution or throw.
 * @param route - The API route path or name
 * @param durationMs - Time taken for the API call in milliseconds
 * @param status - HTTP response status code
 */
export function logApiCall(
  route: string,
  durationMs: number,
  status: number
): void {
  const entry = log.entry(
    { severity: "INFO" },
    { route, timestamp: new Date().toISOString(), durationMs, status, type: "api_performance" }
  );
  log.write(entry).catch(() => undefined);
}

