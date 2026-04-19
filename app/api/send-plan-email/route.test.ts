import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const { sendMailMock, createTransportMock, verifyIdTokenMock, OAuth2ClientMock } = vi.hoisted(() => {
  const sendMail = vi.fn();
  const createTransport = vi.fn(() => ({ sendMail }));
  const verifyIdToken = vi.fn();
  const OAuth2Client = vi.fn(function () {
    return { verifyIdToken };
  });
  return {
    sendMailMock: sendMail,
    createTransportMock: createTransport,
    verifyIdTokenMock: verifyIdToken,
    OAuth2ClientMock: OAuth2Client,
  };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: OAuth2ClientMock,
}));

describe("POST /api/send-plan-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "smtp-user";
    process.env.SMTP_PASS = "smtp-pass";
    process.env.SMTP_FROM = "MatchDay <no-reply@example.com>";
  });

  function makeReq(body: unknown) {
    return new NextRequest("http://localhost/api/send-plan-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when credential/plan is invalid", async () => {
    const res = await POST(makeReq({ credential: "", plan: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when Google email is unverified", async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ email: "fan@example.com", email_verified: false }),
    });

    const res = await POST(
      makeReq({
        credential: "token",
        plan: [
          {
            time: "5:00 PM",
            title: "Leave",
            description: "Start travel",
            type: "travel",
            reasoning: "Avoid traffic",
          },
        ],
      })
    );

    expect(res.status).toBe(401);
  });

  it("sends email when token and SMTP config are valid", async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ email: "fan@example.com", email_verified: true }),
    });
    sendMailMock.mockResolvedValue({});

    const res = await POST(
      makeReq({
        credential: "token",
        ticket: {
          match: "India vs Australia",
          venue: "Wankhede Stadium",
          kickoffTime: "7:00 PM",
          date: "01 Jan 2026",
          stand: "North",
          section: "A",
          seat: "A1",
          gate: "Gate 1",
        },
        preferences: { travelMode: "transit" },
        selectedTravel: { label: "Metro + Walk" },
        plan: [
          {
            time: "5:00 PM",
            title: "Leave",
            description: "Start travel",
            type: "travel",
            reasoning: "Avoid traffic",
          },
        ],
      })
    );

    expect(createTransportMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      email: "fan@example.com",
    });
  });
});
