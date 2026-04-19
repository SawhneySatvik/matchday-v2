import { describe, it, expect, vi, beforeEach } from "vitest";
import { logInfo, logWarn, logError, logApiCall } from "@/lib/logger";
import { Logging } from "@google-cloud/logging";

const { mockLog } = vi.hoisted(() => ({
  mockLog: {
    entry: vi.fn().mockImplementation((meta: any, data: any) => ({ meta, data })),
    write: vi.fn().mockResolvedValue([{}]),
  }
}));

// Mock @google-cloud/logging
vi.mock("@google-cloud/logging", () => {
  return {
    Logging: vi.fn().mockImplementation(function() {
      return {
        log: vi.fn().mockReturnValue(mockLog),
      };
    }),
  };
});

describe("logger", () => {
  let mockLog: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const logging = new Logging();
    mockLog = logging.log("matchday-api");
  });

  it("logInfo calls write with INFO severity", async () => {
    logInfo("/test", { foo: "bar" });
    expect(mockLog.entry).toHaveBeenCalledWith(
      { severity: "INFO" },
      expect.objectContaining({ route: "/test", foo: "bar" })
    );
    expect(mockLog.write).toHaveBeenCalled();
  });

  it("logWarn calls write with WARNING severity", async () => {
    logWarn("/test", { baz: 123 });
    expect(mockLog.entry).toHaveBeenCalledWith(
      { severity: "WARNING" },
      expect.objectContaining({ route: "/test", baz: 123 })
    );
  });

  it("logError calls write with ERROR severity and extracts message", async () => {
    const error = new Error("Sample error");
    logError("/test", error, { context: "extra" });
    expect(mockLog.entry).toHaveBeenCalledWith(
      { severity: "ERROR" },
      expect.objectContaining({ 
        route: "/test", 
        message: "Sample error",
        context: "extra"
      })
    );
  });

  it("logError handles non-Error objects", async () => {
    logError("/test", "string error");
    expect(mockLog.entry).toHaveBeenCalledWith(
      { severity: "ERROR" },
      expect.objectContaining({ message: "string error" })
    );
  });

  it("logApiCall calls write with performance data", async () => {
    logApiCall("/api/test", 150, 201);
    expect(mockLog.entry).toHaveBeenCalledWith(
      { severity: "INFO" },
      expect.objectContaining({ 
        route: "/api/test", 
        durationMs: 150, 
        status: 201,
        type: "api_performance"
      })
    );
  });
});
