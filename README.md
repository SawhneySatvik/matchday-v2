<div align="center">

<img src="public/assets/hero-stadium.jpg" alt="MatchDay — AI Game Day Companion" width="100%" />

<br />
<br />

# MatchDay — AI Game Day Companion

_From ticket scan to final whistle. Your personal AI concierge for large-scale sporting venues._

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://matchday-hash-el.a.run.app)
[![PromptWars](https://img.shields.io/badge/PromptWars-Virtual%20Round%204-f5c518?style=for-the-badge&logoColor=black)](https://promptwars.in)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Pro%20+%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![Vertex AI](https://img.shields.io/badge/Vertex%20AI-asia--south1-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-Platform-34A853?style=for-the-badge&logo=google-maps&logoColor=white)](https://developers.google.com/maps)
[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)

<br />

_Built for PromptWars Virtual — Round 4 (April 2026)_
_Problem Statement: Improve the physical event experience at large-scale sporting venues_
_Hack2Skill × Google for Developers_

</div>

---

## The Problem

Going to a cricket match at Wankhede or Eden Gardens should be one of the best experiences of your life. Instead, for most fans it is defined by a series of entirely preventable failures:

- **Wrong queue, wrong gate** — standing in the wrong line for 20 minutes before realising your gate is on the other side of the stadium
- **Invisible wait times** — no way to know whether Food Court A has a 2-minute queue or a 15-minute one until you are already in it
- **Misjudged travel** — arriving late because a Google Maps ETA does not account for the crowd surge at your specific gate 45 minutes before kickoff
- **Post-match trap** — exiting through the main gate with 30,000 other fans because no one told you Gate 6 on the north side empties in 4 minutes
- **No single source of truth** — your seat is on a printed ticket, your food preferences are in your head, your route is on a separate maps app, and your plan does not exist at all

**MatchDay solves all of this.** It is the first AI-native match day companion that builds a complete picture of _your_ day — your ticket, your seat, your preferences, your travel mode — and delivers real-time personalised intelligence from the moment you leave home to the moment you beat the post-match crowd out of the stadium.

---

## What Makes MatchDay Different

Most venue apps are static information portals. MatchDay is a **stateful AI concierge**. Every Gemini call is grounded in your full personal context — seat, gate, stand, food preference, travel mode, current match phase, and live crowd data. The AI does not give generic answers. It knows you specifically.

| Capability           | Generic Venue App               | MatchDay                                                                 |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| Ticket information   | Manual entry, error-prone       | Gemini Vision OCR — any ticket format, any language                      |
| Travel planning      | Static Google Maps ETA          | AI-reasoned leave-by time with gate-specific crowd pattern logic         |
| Venue navigation     | Static facility map             | Personalised to your seat, ranked by walking distance from your location |
| Food recommendations | Undifferentiated list of stalls | Filtered by your dietary preference + AI-estimated current wait time     |
| Crowd intelligence   | None                            | AI-estimated density per zone (5 zones), updated per match phase         |
| Exit planning        | None                            | Score-aware, gate-specific exit strategy with backup options             |
| In-match assistance  | None                            | Multi-turn stateful AI chat with full game-day context on every turn     |
| Plan adaptability    | None                            | AI regenerates your timeline in real time when circumstances change      |
| Language support     | English only                    | English, हिन्दी, मराठी, বাংলা, ગુજરાતી                                   |
| Observability        | None                            | Structured Cloud Logging on every API route                              |

---

## Core Features

### 🎟 AI Ticket Scan — Gemini 1.5 Pro Vision

Upload any match ticket in any format — a printed physical ticket photographed on a phone, a digital PDF, a screenshot, or a forwarded image. Gemini's multimodal vision model extracts every piece of structured information in under 3 seconds: match name, teams, venue, venue address, date, kickoff time, stand, section, seat number, gate, and raw text. No manual entry. No form fields. No OCR libraries. Just drop your ticket and the entire app configures itself around your specific seat.

**Engineering note:** The route uses `response_mime_type: "application/json"` for guaranteed structured output rather than regex-parsing free-form text. Images are sent as base64-encoded strings with media type detection. The response is validated against the `TicketData` TypeScript interface before being written to the Zustand store.

### 🗺 Smart Travel Planning — Gemini 1.5 Flash

After ticket extraction, MatchDay asks where you are coming from. The travel planning route receives your location, transport mode (transit, driving, walking), and full ticket context — and produces a Gemini-reasoned leave-by recommendation, not just a Maps ETA. The model reasons explicitly about crowd arrival patterns at your specific gate, queue time at entry, and buffer for unexpected delays, producing a rationale alongside each option. Multiple transport options are returned and ranked.

**Engineering note:** Gemini Flash is used here rather than Pro — the task requires structured reasoning over known facts rather than multimodal understanding. Flash is 8x faster on this task with equivalent output quality.

### 🏟 Venue Intelligence — Google Maps Platform

An interactive venue map built on `@vis.gl/react-google-maps` renders your specific gate highlighted, the nearest food stalls filtered to your dietary preference, restrooms, medical points, and ATMs — all with accurate walking distances calculated from your seat location. Facility cards are ranked by proximity to you, not to the centre of the stadium. Filter chips allow switching between facility types. The route overlay shows the recommended walking path from the stadium entrance to your gate, rendered using the Routes API.

**Engineering note:** Venue facility data (coordinates, names, walk times) lives in `data/venues.ts` as a typed static schema. The venue name extracted by Gemini is fuzzy-matched against keys in this object. This separation means Gemini never invents coordinates — all geographic data is authoritative and human-curated.

### 👥 Crowd Pulse — AI Crowd Intelligence Engine (Vertex AI)

The centrepiece of MatchDay's real-time capability. The crowd intelligence route — running on Vertex AI in the `asia-south1` region — analyses crowd density across 5 venue zones: Entry Gates, Food Court A, Food Court B, Restrooms, and Exit Gates. Gemini returns structured JSON with crowd level (`LOW` / `MEDIUM` / `HIGH`), estimated wait time, and a personalised recommendation for each zone that references the user's actual gate and stand. Estimates are calibrated to the current match phase. Results are cached per phase with a 15-minute TTL to avoid redundant Vertex AI calls.

**Engineering note:** Zone GPS coordinates are not requested from Gemini — they are derived from authoritative data in `data/venues.ts` and merged server-side after Gemini returns the zone analysis array. This prevents the hallucination of plausible-but-wrong coordinates.

### 📋 AI Game Day Plan — Structured Timeline Generation

Gemini generates a complete structured timeline for your match day — from "leave home" to "post-match exit" — as a typed array of `PlanItem` objects, each with `time`, `title`, `description`, `type` (travel | arrive | food | seat | event | break), and `reasoning`. The plan is generated fresh from everything Gemini knows about you: seat, preferences, travel mode, kickoff time, food stalls at your venue, and your selected travel option. It is not a template. Every plan item has an AI-authored reasoning field explaining why it was scheduled at that time.

### 🔄 Match-Aware Plan Updates

The plan is not static once generated. Tell the AI concierge what changed mid-match:

> _"We're losing 0-2, I want to leave at the 80th minute"_
> _"My kid needs food right now"_
> _"It's raining, I need a covered route"_

Gemini regenerates the timeline from the current point forward, returning an `updatedPlan` JSON object embedded in the chat response. The `venue-chat` route detects this via regex, extracts and parses the JSON, strips it from the display text, and silently writes the updated plan to the Zustand store. The plan screen re-renders with the new timeline without any user action beyond the chat message itself.

### 🚪 Smart Exit Planner — Vertex AI

A dedicated exit strategy feature on a separate Vertex AI route. The user inputs the current match minute and score. Gemini returns a structured exit plan: leave-by time, recommended gate, estimated crowd level at that gate, specific walking route description with landmarks, and two backup gate options with rationale. The model factors in the match state explicitly — a blowout game at minute 85 produces very different crowd dynamics than a 1-0 thriller at the same minute. Score-awareness is a first-class input to the reasoning.

### 💬 Multi-Turn AI Concierge — Stateful Chat

The `venue-chat` route is the most sophisticated Gemini integration in MatchDay. Every chat message is sent with a complete system context injection containing: full ticket data (seat, gate, stand, section, kickoff time), user preferences (food preference, transport mode, priorities, accessibility needs, starting location), all venue facilities (food stalls, gates, restrooms, medical points), the current game day plan (full timeline), match phase, and live crowd intelligence data across all 5 zones. The AI can answer anything from "which food court is least busy right now?" to "what's the fastest covered route from my seat to Gate 6 if I leave at minute 75?". Chat history is trimmed to the last 20 messages to manage token budget across long sessions.

### 🌐 Indian Language Support — Cloud Translation API

MatchDay is built for Indian fans at Indian venues. The UI supports 5 languages via a two-tier translation strategy:

**Tier 1 (runtime):** On language selection, the Cloud Translation API is called with all UI string keys in a single batch request. Results are cached in memory with a 30-minute TTL. The entire UI re-renders in the selected language instantly from cache on subsequent views.

**Tier 2 (fallback):** Static JSON translation files serve as an instant cold-start cache and degraded-mode backup if the Translation API is unavailable.

The AI concierge responds in the user's selected language automatically — the system prompt includes a language instruction derived from the Zustand store's `language` field.

### 📧 Email My Plan — Google OAuth

At the bottom of the plan screen, users can sign in with Google and send their generated game day timeline directly to their inbox. The `send-plan-email` route verifies the Google ID token server-side before sending. The email renders the full plan as a structured HTML timeline. This is the only feature in MatchDay requiring authentication — everything else is entirely anonymous.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MatchDay Client                                  │
│                        Next.js 14 App Router                                │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Landing  │→ │  Ticket  │→ │ Onboarding │→ │  Travel  │→ │   Venue    │ │
│  │   Page   │  │  Upload  │  │   Wizard   │  │  Screen  │  │   Screen   │ │
│  └──────────┘  └──────────┘  └────────────┘  └──────────┘  └─────┬──────┘ │
│                                                                    ↓        │
│                 ┌──────────────────────────────────────────────────────┐   │
│                 │                    Plan Screen                        │   │
│                 │   Timeline · CrowdPulse · ExitPlanner · StadiumChat  │   │
│                 └──────────────────────────────────────────────────────┘   │
│                                        │                                   │
│              ┌─────────────────────────┴──────────────────────┐           │
│              │                  Zustand Store                  │           │
│              │   ticket · preferences · plan · chatHistory     │           │
│              │   crowdData · crowdCache(TTL:15m) · matchPhase  │           │
│              │   exitPlan · language · savedSessions(cap:5)    │           │
│              │   sessionCreatedAt(TTL:48h) · venueCoords       │           │
│              └────────────────────────────────────────────────┘           │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │  Next.js API Route Handlers
      ┌───────────────────────┼──────────────────────────────┐
      │                       │                              │
      ▼                       ▼                              ▼
┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────────┐
│  extract-ticket  │  │crowd-intelligence │  │       venue-chat         │
│  travel-plan     │  │ (Vertex AI Flash) │  │  stateful · multi-turn   │
│  plan-generate   │  │                   │  │  full context injection   │
│  translate       │  │  exit-plan        │  │  updatedPlan detection   │
│  send-plan-email │  │ (Vertex AI Flash) │  │                         │
└────────┬─────────┘  └────────┬──────────┘  └────────────┬────────────┘
         │                     │                           │
         └─────────────────────┼───────────────────────────┘
                               │
      ┌────────────────────────┼──────────────────────────────────┐
      │                        │                                  │
      ▼                        ▼                                  ▼
┌──────────────┐   ┌───────────────────────┐   ┌─────────────────────────┐
│ Gemini 1.5   │   │  Vertex AI            │   │  Google Cloud Services  │
│ Pro + Flash  │   │  Gemini 1.5 Flash     │   │                         │
│ (AI Studio)  │   │  asia-south1          │   │  Cloud Translation API  │
│              │   │                       │   │  Cloud Logging          │
│ extract-     │   │  crowd-intelligence   │   │  Google Analytics 4     │
│  ticket      │   │  exit-plan            │   │  Google Maps Platform   │
│ travel-plan  │   │                       │   │  Google OAuth 2.0       │
│ plan-generate│   │                       │   │  Cloud Run (host)       │
│ venue-chat   │   │                       │   │                         │
└──────────────┘   └───────────────────────┘   └─────────────────────────┘
```

**6-stage gate-keeping flow:** `landing → upload → onboarding → travel → venue → plan`. Each stage gate-keeps the next — you cannot reach the venue map without a scanned ticket and completed preferences. This architecture guarantees that every Gemini call in `venue-chat` has a complete context object. No stage can be skipped. No context can be missing.

---

## Google Services

MatchDay uses 13 distinct Google services across the stack. The architecture was designed around the Google ecosystem — not retrofitted to include it.

| Service                                   | Purpose                                           | Where Used                                               |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| **Gemini 1.5 Pro** (AI Studio)            | Multimodal ticket OCR — image → typed JSON        | `app/api/extract-ticket/route.ts`                        |
| **Gemini 1.5 Flash** (AI Studio)          | Travel reasoning, plan generation, stateful chat  | `api/travel-plan`, `api/plan-generate`, `api/venue-chat` |
| **Vertex AI** (Gemini Flash, asia-south1) | Production AI inference — crowd + exit features   | `api/crowd-intelligence`, `api/exit-plan`                |
| **Google Maps JavaScript API**            | Interactive venue map with custom markers         | `components/maps/VenueMap.tsx`                           |
| **Google Places API** (New)               | Location autocomplete in onboarding wizard        | `components/onboarding/`                                 |
| **Google Routes API**                     | Walking/driving route polyline rendering          | `components/maps/VenueMap.tsx`                           |
| **Google Geocoding API**                  | Venue address string → lat/lng coordinates        | `lib/gemini.ts` geocode utility                          |
| **Cloud Translation API**                 | Runtime UI localisation into 4 Indian languages   | `app/api/translate/route.ts`, `lib/i18n/`                |
| **Cloud Logging**                         | Structured API observability on all 6 routes      | `lib/logger.ts`, all API routes                          |
| **Google Analytics 4**                    | Event tracking — 9 instrumented points            | `lib/analytics.ts`, all stage components                 |
| **Google OAuth 2.0**                      | Authentication for plan email feature             | `api/send-plan-email`, `components/plan/PlanScreen`      |
| **Google Cloud Run**                      | Container deployment, asia-south1 (Mumbai)        | Production host                                          |
| **Google Antigravity**                    | AI-assisted scaffolding across 14-day build cycle | Build process                                            |

---

## Tech Stack

| Layer           | Technology                | Version      | Why                                                             |
| --------------- | ------------------------- | ------------ | --------------------------------------------------------------- |
| Framework       | Next.js App Router        | 14           | API routes + React in one deploy — zero separate backend        |
| Language        | TypeScript                | 5.x (strict) | Full strict mode — zero `any`, explicit return types throughout |
| AI — Vision     | Gemini 1.5 Pro            | Latest       | Best-in-class multimodal understanding for ticket OCR           |
| AI — Reasoning  | Gemini 1.5 Flash          | Latest       | 8x faster than Pro for structured reasoning tasks               |
| AI — Production | Vertex AI (Gemini Flash)  | Latest       | Managed Google Cloud AI, asia-south1 region                     |
| Maps            | @vis.gl/react-google-maps | Latest       | React-native Google Maps, first-class TypeScript support        |
| Translation     | @google-cloud/translate   | Latest       | Cloud Translation API client                                    |
| Logging         | @google-cloud/logging     | Latest       | Structured Cloud Logging client                                 |
| State           | Zustand + persist         | 4.x          | Cross-stage persistence, TTL sessions, crowd cache, partialize  |
| Animation       | Framer Motion             | 11.x         | Scroll-driven video hero, stage transitions, staggered reveals  |
| Styling         | Tailwind CSS              | 3.x          | Design token system, dark theme, glass morphism utilities       |
| Fonts           | Bebas Neue + DM Sans      | —            | Display weight contrast — sports-premium typographic identity   |
| Deploy          | Google Cloud Run          | —            | Containerised, asia-south1, allow-unauthenticated               |

---

## Gemini Integration — Prompt Library

MatchDay has 6 distinct Gemini / Vertex AI integrations, each with production-quality prompt engineering. Every prompt is a named constant, documented with JSDoc.

### 1. `TICKET_EXTRACTION_PROMPT` — `app/api/extract-ticket/route.ts`

**Model:** Gemini 1.5 Pro (AI Studio) — multimodal
**Input:** Base64-encoded ticket image + MIME type
**Output:** Typed `TicketData` JSON (10 fields)

```
Extract all information from this match ticket image.
Return ONLY a JSON object with these exact fields:
match, teams, venue, venueAddress, date, kickoffTime,
stand, gate, seat, section, rawText.
If any field is not visible, return null for that field.
No explanation. No markdown. Valid JSON only.
```

`response_mime_type: "application/json"` enforces structured output at the API level. The 10-field response is validated against the `TicketData` interface before being written to the store.

---

### 2. `TRAVEL_PLAN_PROMPT` — `app/api/travel-plan/route.ts`

**Model:** Gemini 1.5 Flash (AI Studio)
**Input:** User location, transport mode, kickoff time, gate, venue address
**Output:** Array of `TravelOption` — `leaveBy`, `duration`, `steps[]`, `reasoning`, `recommended`

The prompt instructs Gemini to reason explicitly about crowd surge timing at the user's specific gate — not just travel distance. 2-3 options are produced and ranked. Each includes step-by-step directions and a full rationale paragraph the user can read.

---

### 3. `CROWD_PROMPT` — `app/api/crowd-intelligence/route.ts`

**Model:** Vertex AI (Gemini 1.5 Flash, asia-south1)
**Input:** Venue, gate, stand, section, kickoff time, match phase, zone list
**Output:** Array of 5 `CrowdZone` objects

```
Based on the match phase and the user's gate/stand, estimate crowd
density for each zone. Return ONLY a JSON array of exactly 5 zones.
Each zone: { zone, crowdLevel, estimatedWait, recommendation }
crowdLevel must be "LOW", "MEDIUM", or "HIGH".
recommendation must reference the user's specific gate: ${gate}.
Coords are not required — omit them entirely.
```

Phase-specific behavioural curves are encoded in the prompt: pre-match gate patterns, halftime food court spikes, post-match exit surge. The model reasons about all three phases distinctly.

---

### 4. `EXIT_PLAN_PROMPT` — `app/api/exit-plan/route.ts`

**Model:** Vertex AI (Gemini 1.5 Flash, asia-south1)
**Input:** Venue, gate, stand, section, kickoff time, match minute, score, transport mode
**Output:** Typed `ExitPlan` — `leaveByTime`, `recommendedGate`, `estimatedCrowdLevel`, `route`, `backupOptions[]`, `reasoning`

Score-awareness is a first-class input. The prompt instructs Gemini to factor in voluntary early departures in blowout games, which materially changes crowd patterns at exit gates 10-15 minutes before the final whistle.

---

### 5. `SYSTEM_CONTEXT` — `app/api/venue-chat/route.ts`

**Model:** Gemini 1.5 Flash (AI Studio) — `startChat()` with history injection
**The most sophisticated prompt in the codebase.**

Every chat turn injects the following as the first message in the conversation history:

- Ticket: match, venue, seat, gate, stand, section, kickoff time
- Preferences: food preference, transport mode, priorities[], accessibility needs, starting location
- Venue facilities: food stalls (name, type, walk time, speciality, coords), gates (serves[], congestion level), restrooms, medical points
- Current plan: full `PlanItem[]` timeline with times and AI reasoning
- Match phase: pre-match | during | post-match
- Crowd data: all 5 zones with current crowd level and estimated wait time
- Conditional `planUpdate` flag: when set, instructs the model to return `{"updatedPlan": [...]}` inline

The route detects `updatedPlan` in the response via regex, parses it with `parseGeminiJSON<{ updatedPlan: PlanItem[] }>`, strips it from display text, and returns both `response` and `updatedPlan` to the client. Chat history is trimmed to the last 20 messages before each call.

---

### 6. `TRANSLATION_REQUEST` — `app/api/translate/route.ts`

**Service:** Cloud Translation API (not Gemini)
**Input:** `{ texts: string[], targetLanguage: "hi" | "mr" | "bn" | "gu" }`
**Output:** `{ translations: string[] }`

All UI string keys are batch-translated in a single API call. Results are cached client-side in `lib/i18n/translationCache.ts` with a 30-minute TTL. The static `translations.json` file serves as instant fallback.

---

## State Management — Zustand Store Design

`lib/store.ts` is the backbone of MatchDay's stateful architecture. Every design decision here is deliberate.

### Session TTL — 48 Hours

Sessions expire after 48 hours. `onRehydrateStorage` checks `sessionCreatedAt` on every page load and resets state if the session is older than `SESSION_TTL_MS`. This prevents a Wankhede ticket from pre-populating the app two weeks later at Eden Gardens.

### Crowd Cache — 15-Minute TTL, Phase-Keyed

```ts
crowdCache: Record<MatchPhase, { data: CrowdZone[]; timestamp: number }>;
```

`getCrowdCache(phase)` returns `null` if the entry is missing or older than `CROWD_CACHE_TTL_MS`. Switching between Pre-match / Live / Post-match tabs costs one Vertex AI call per phase per session. Subsequent switches are instant cache hits. This reduces Vertex AI calls by approximately 70% on a typical 4-hour match-day session.

### Session Archive — Last 5 Sessions

On `reset()`, the current session is snapshotted (excluding action functions) and prepended to `savedSessions[]`, capped at 5 entries. Provides a foundation for a "previous match days" history view without requiring a database.

### Preference Cascade Invalidation

`setPreferences()` implements smart downstream invalidation:

| Changed preference                          | Clears                                    |
| ------------------------------------------- | ----------------------------------------- |
| `location` or `travelMode`                  | `travelOptions`, `selectedTravel`, `plan` |
| `foodPreference`, `priorities`, `doNotMiss` | `plan` only                               |
| Accessibility needs                         | `plan` only                               |

Travel options depend on location and mode but not food preference. The plan depends on all preferences. Changing food preference alone does not force re-fetching travel options.

### Partialize — Functions Excluded from Persistence

The `partialize` option explicitly lists only serialisable state fields. All action functions (`setStage`, `setTicket`, etc.) are excluded. This prevents Zustand's `persist` middleware from attempting to JSON-stringify functions, which silently produces `undefined` values in localStorage.

### Language Persistence

`language` is included in `partialize`. A user who selects Marathi returns to Marathi on their next session — they should not re-select their language every match day.

---

## TypeScript — Strict Configuration

MatchDay operates in full TypeScript strict mode with additional checks beyond the default strict preset.

### `tsconfig.json` — All Flags

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Zero `any` Policy

`any` does not appear anywhere in the MatchDay codebase. Where dynamic types are necessary:

- `unknown` is used and narrowed with `instanceof` or type guards
- `Record<string, unknown>` replaces untyped object shapes
- Generics replace `any` on utility functions (`parseGeminiJSON<T>`)
- `catch (error: unknown)` with `error instanceof Error ? error.message : String(error)` everywhere

### Explicit Return Types

Every exported function has an explicit return type annotation. Every async function declares `Promise<ReturnType>` explicitly. `noImplicitReturns` enforces that all code paths return a value.

### JSDoc on All Exports

Every exported function, hook, type, interface, and store action has a JSDoc comment with `@param` and `@returns` tags. IDE hover documentation works without reading implementation files.

---

## Project Structure

```
matchday/
├── app/
│   ├── layout.tsx                    # Root layout — GA4, Maps APIProvider, fonts, dark theme
│   ├── page.tsx                      # Stage orchestrator — 6 stages, ErrorBoundary, analytics
│   ├── globals.css                   # Design tokens, glass utility, glow effects, i18n fonts
│   └── api/
│       ├── extract-ticket/route.ts   # POST — Gemini 1.5 Pro multimodal OCR → TicketData JSON
│       ├── travel-plan/route.ts      # POST — Gemini Flash leave-by time + ranked travel options
│       ├── plan-generate/route.ts    # POST — Gemini Flash full PlanItem[] timeline generation
│       ├── crowd-intelligence/route.ts # POST — Vertex AI crowd density per zone per phase
│       ├── exit-plan/route.ts        # POST — Vertex AI score-aware exit strategy
│       ├── venue-chat/route.ts       # POST — Multi-turn stateful chat, context injection
│       ├── translate/route.ts        # POST — Cloud Translation API, batch UI string translation
│       └── send-plan-email/route.ts  # POST — Google OAuth token verify + SMTP plan email
│
├── components/
│   ├── landing/LandingPage.tsx       # Scroll-driven video hero, feature cards, trust bar
│   ├── ticket/TicketUpload.tsx       # Drag/drop, scan animation, Gemini OCR call + analytics
│   ├── onboarding/                   # 5-step preferences wizard with Places Autocomplete
│   ├── travel/TravelScreen.tsx       # Travel options, route map, leave-by display
│   ├── venue/VenueScreen.tsx         # Facility cards, VenueMap, CrowdPulse integration
│   ├── crowd/CrowdPulse.tsx          # Phase selector, zone cards, cache-aware Vertex AI fetch
│   ├── plan/PlanScreen.tsx           # Timeline, StadiumChat drawer, plan update handler
│   ├── plan/ExitPlanner.tsx          # Score/minute inputs, Vertex AI exit plan display
│   ├── maps/VenueMap.tsx             # @vis.gl/react-google-maps, route polyline, markers
│   ├── chat/StadiumChat.tsx          # Multi-turn chat, quick prompts, updatedPlan detection
│   └── ErrorBoundary.tsx             # Class-based React error boundary with fallback UI
│
├── lib/
│   ├── store.ts                      # Zustand store — full typed game-day state, TTL, cache
│   ├── gemini.ts                     # AI Studio + Vertex AI clients, parseGeminiJSON<T>
│   ├── logger.ts                     # Cloud Logging — logInfo, logWarn, logError, logApiCall
│   ├── analytics.ts                  # GA4 — trackEvent (9 types), trackPageView
│   ├── env.ts                        # Validated env config — throws on missing server vars
│   └── i18n/
│       ├── translations.json         # Static translations: EN, HI, MR, BN, GU (fallback)
│       ├── translationCache.ts       # In-memory translation cache, 30-min TTL
│       └── useTranslation.ts         # useT() hook — Cloud API → cache → static fallback
│
├── data/
│   └── venues.ts                     # Authoritative venue data — Wankhede, Eden Gardens
│
├── public/
│   └── assets/
│       ├── hero-stadium.jpg          # Gemini-generated dusk stadium hero image
│       └── Video_Generation_With_Three_Frames.mp4  # Scroll-driven landing page video
│
├── .env.local.example                # All 5 env vars with source documentation
├── next.config.mjs                   # Image domains, security headers
├── tailwind.config.ts                # Design tokens, custom animation utilities
├── tsconfig.json                     # Strict mode + all additional TS checks
└── package.json                      # Scripts: dev, build, typecheck, test, validate
```

---

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/SawhneySatvik/MatchDay.git
cd MatchDay
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Open .env.local and fill in all 5 variables — see table below

# 3. Develop
npm run dev
# → http://localhost:3000

# 4. Type check — must pass with zero errors
npm run typecheck

# 5. Run tests
npm test

# 6. Full pre-commit validation
npm run validate
# Runs: typecheck + lint + test in sequence
```

---

## Environment Variables

| Variable                          | Required          | Source                                                                                                   | Used By                                                        |
| --------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `GEMINI_API_KEY`                  | Yes — server only | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)                                 | `extract-ticket`, `travel-plan`, `plan-generate`, `venue-chat` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes — client      | [console.cloud.google.com](https://console.cloud.google.com) — enable Maps JS, Places, Routes, Geocoding | `VenueMap`, onboarding Places Autocomplete                     |
| `GOOGLE_CLOUD_PROJECT`            | Yes — server only | Your GCP project ID                                                                                      | Cloud Logging, Cloud Translation API, Vertex AI                |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`   | Recommended       | [analytics.google.com](https://analytics.google.com) → Admin → Data Streams                              | `lib/analytics.ts`, `app/layout.tsx`                           |
| `NEXT_PUBLIC_APP_URL`             | Yes               | Your deployed Cloud Run URL                                                                              | Email templates, OAuth redirect URIs                           |

```env
# .env.local — copy from .env.local.example and fill in

# Gemini API — https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# Google Maps — console.cloud.google.com
# Enable: Maps JavaScript API, Places API (New), Routes API, Geocoding API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Google Cloud Project ID (for Logging, Translation, Vertex AI)
GOOGLE_CLOUD_PROJECT=

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App URL (your Cloud Run URL)
NEXT_PUBLIC_APP_URL=https://matchday-hash-el.a.run.app
```

---

## Deploy to Google Cloud Run

MatchDay is deployed on Cloud Run in `asia-south1` — the Mumbai region, closest to MatchDay's primary user base at Indian cricket venues.

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy from source — no Dockerfile required
gcloud run deploy matchday \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key" \
  --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=your_project_id" \
  --set-env-vars "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX" \
  --set-env-vars "NEXT_PUBLIC_APP_URL=https://matchday-hash-el.a.run.app"
```

Cloud Run automatically scales to zero when idle and scales up on demand — no always-on compute cost between matches.

---

## How MatchDay Addresses the Problem Statement

| PS Requirement             | MatchDay Feature           | Implementation                                                                                    |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| **Crowd movement**         | Crowd Pulse zone density   | Vertex AI estimates crowd level across 5 zones, calibrated to match phase and user gate proximity |
| **Waiting times**          | Crowd Pulse wait estimates | Structured per-zone wait times (LOW ~2 min, MEDIUM ~8 min, HIGH ~15 min) with routing advice      |
| **Waiting times**          | Exit Planner               | Score-aware leave-by time with gate-specific crowd estimate and two backup options                |
| **Real-time coordination** | Match-aware plan updates   | Natural language → Gemini regenerates timeline from current point → silent store update           |
| **Real-time coordination** | Match phase selector       | Crowd intelligence recalibrates instantly when user updates phase (pre / live / post)             |
| **Seamless experience**    | 6-stage guided flow        | Ticket → Onboarding → Travel → Venue → Plan — each stage feeds context to the next                |
| **Seamless experience**    | Stateful AI concierge      | Every response references the user's actual seat, gate, preferences — no repeated setup           |
| **Enjoyable experience**   | Personalised food routing  | Dietary preference × current wait × walking distance from seat = specific stall recommendation    |
| **Enjoyable experience**   | Indian language support    | UI and AI responses in Hindi, Marathi, Bengali, Gujarati — fans read in their own language        |
| **Post-match safety**      | Exit Planner               | Gate-specific exit strategy with crowd estimate — reduces post-match surge exposure               |

---

## Supported Venues

| Venue            | City                 | Capacity | Data Coverage                                                  |
| ---------------- | -------------------- | -------- | -------------------------------------------------------------- |
| Wankhede Stadium | Mumbai, Maharashtra  | 33,108   | 6 gates, 4 food courts, 8 restroom clusters, 2 medical points  |
| Eden Gardens     | Kolkata, West Bengal | 66,349   | 8 gates, 6 food courts, 10 restroom clusters, 3 medical points |

**Adding a venue:** Create an entry in `data/venues.ts` following the `VenueInfo` typed schema. The venue name string extracted by Gemini from the ticket is fuzzy-matched (case-insensitive, partial) against object keys. Venues not in the database degrade gracefully — the AI concierge retains full ticket context and can still answer questions; only the static facility map and pre-computed walk distances are unavailable.

---

## Indian Language Support

| Language | Script   | Code | Primary Venue                    |
| -------- | -------- | ---- | -------------------------------- |
| English  | Latin    | `en` | All                              |
| Hindi    | देवनागरी | `hi` | All India                        |
| Marathi  | देवनागरी | `mr` | Wankhede, Mumbai                 |
| Bengali  | বাংলা    | `bn` | Eden Gardens, Kolkata            |
| Gujarati | ગુજરાતી  | `gu` | Narendra Modi Stadium, Ahmedabad |

Translations are served via Cloud Translation API at runtime with a 30-minute client-side cache, falling back to static Gemini-generated JSON. The AI concierge matches the user's language automatically via a system prompt instruction on every turn.

---

## Testing

```bash
npm test              # all tests, single run
npm run test:watch    # watch mode
npm run test:coverage # with lcov coverage report
npm run test:e2e      # Playwright end-to-end
```

**Coverage (latest run):**

| Metric     | Score  |
| ---------- | ------ |
| Statements | 89.62% |
| Branches   | 93.02% |
| Functions  | 81.69% |
| Lines      | 90.76% |

**Coverage scope:**

- `lib/store.ts` — TTL expiry, crowd cache TTL and phase-keying, preference cascade invalidation, session archive cap
- `lib/gemini.ts` — `parseGeminiJSON<T>` with malformed input, missing fields, JSON extraction from mixed prose
- `lib/logger.ts` — fire-and-forget behaviour (must not throw), Cloud Logging entry shape
- `lib/i18n/translationCache.ts` — cache hit, miss, TTL expiry, set/get operations
- `data/venues.ts` — fuzzy match hits, misses, case-insensitive matching, partial matches
- `app/api/*/route.ts` — request validation, 400 on missing fields, success-path contracts with mocked Gemini/Vertex clients

**Threshold policy (enforced in Vitest config):**

```ts
thresholds: { statements: 60, branches: 50, functions: 50, lines: 60 }
```

---

## What Failed and What I Learned

**1. Crowd bar animation — Framer Motion vs Tailwind**

Every crowd density bar rendered at 100% width regardless of actual crowd level. Root cause: `animate={{ width: "100%" }}` (Framer Motion inline style) and `className="w-1/4"` (Tailwind class) were both applied to the same element. Inline styles always win over class-based styles in the CSS cascade — the Tailwind class was silently overridden on every render cycle. Fix: removed Tailwind width classes entirely and converted to `animate={{ width: barWidths[zone.crowdLevel] }}` where `barWidths = { LOW: "25%", MEDIUM: "50%", HIGH: "75%" }`. Three lines changed, bug eliminated.

**2. Gemini coordinate hallucination**

The crowd intelligence prompt originally asked Gemini to return approximate GPS coordinates for each venue zone alongside density estimates. Gemini returned plausible-looking but entirely fictional coordinates — sometimes in the right city, never at the right location within a stadium. Fix: removed coordinate generation from the Gemini prompt entirely. Zone GPS coordinates are now derived from authoritative data in `data/venues.ts` and merged server-side after Gemini returns the crowd analysis. Gemini reasons about crowd density. Geography is not its job.

**3. Chat history token bloat**

On long match-day sessions (fans use the app from pre-match to post-match — 4+ hours), the accumulated chat history being passed to `venue-chat` grew large enough to approach Gemini Flash's context window. Responses became noticeably slower and eventually started truncating the system context. Fix: trim `history` to `history.slice(-20)` before constructing the `startChat` history array. The system context (injected as the first history message) is never trimmed — it must always be present in full on every turn.

---

## What I'd Build Next

**1. Real sensor integration** — Replace Gemini-estimated crowd density with actual gate scanner throughput data or computer vision feeds from venue CCTV. The `crowd-intelligence` route is architected to accept real sensor data as a drop-in replacement — the `CrowdZone` response schema is identical. Gemini reasoning becomes the fallback for venues without sensor infrastructure.

**2. PWA with push notifications** — Alert fans when their preferred food court drops from HIGH to LOW crowd (triggered by a background Vertex AI check every 5 minutes during the match). Requires a service worker and Web Push API. MatchDay's state architecture already produces the data — routing it to push is the remaining step.

**3. Offline plan caching** — Cache the generated plan, venue facility data, and crowd estimates in a service worker. The app should remain functional inside a sold-out stadium with poor signal, which describes most grounds in India at capacity. The Zustand `persist` middleware already handles the data — routing it through a service worker cache is the implementation gap.

**4. Multi-venue database expansion** — Scale `data/venues.ts` to all 30+ IPL and international venues in India. The schema supports this without architectural changes — it is entirely a data-entry problem. Priority: Narendra Modi Stadium (132,000 capacity, world's largest), Chinnaswamy, Chepauk, Feroz Shah Kotla.

**5. Group planning** — Extend the store to hold multiple `TicketData` objects for a group with seats in different sections. A family of 4 spread across stands North, East, and West needs a unified plan accounting for all seat locations — different walk times to the same food court, different recommended gates. Requires changing `ticket: TicketData | null` to `tickets: TicketData[]` and propagating through travel, venue, and plan stages.

---

## About

Built by **Satvik Sawhney** for PromptWars Virtual — Round 4, April 2026.

- Final-year B.Tech CS (AI/ML) at SRM University
- BS Data Science at IIT Madras (CGPA 9.8)
- Software Engineering Intern at Juspay (fintech infrastructure, distributed systems)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-satviksawhney-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/satviksawhney)
[![GitHub](https://img.shields.io/badge/GitHub-SawhneySatvik-181717?style=flat-square&logo=github)](https://github.com/SawhneySatvik)
[![X](https://img.shields.io/badge/X-satviksawhney-000000?style=flat-square&logo=x)](https://x.com/satviksawhney)

---

<div align="center">

**Gemini 1.5 Pro + Flash &nbsp;·&nbsp; Vertex AI &nbsp;·&nbsp; Google Maps Platform**
**Cloud Translation API &nbsp;·&nbsp; Cloud Logging &nbsp;·&nbsp; Google Analytics 4**
**Google OAuth &nbsp;·&nbsp; Google Cloud Run &nbsp;·&nbsp; Google Antigravity**

_Built for PromptWars Virtual by Hack2Skill × Google for Developers_

_MatchDay — Because your match day deserves better than a printed PDF and a wrong queue._

</div>
