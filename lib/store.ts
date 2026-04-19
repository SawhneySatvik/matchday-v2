import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Current application stage in the user flow.
 */
export type Stage = "landing" | "upload" | "onboarding" | "travel" | "venue" | "plan" | "live";

/**
 * The phase of the match: before it starts, while it's ongoing, or after it ends.
 */
export type MatchPhase = "pre-match" | "during" | "post-match";

/**
 * Supported application languages.
 */
export type Language = "en" | "hi" | "mr" | "bn" | "gu";

/**
 * Session expiry duration in milliseconds (48 hours).
 */
export const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Crowd intelligence cache TTL in milliseconds (15 minutes).
 */
export const CROWD_CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Represents a specific area in the stadium with crowd density information.
 */
export interface CrowdZone {
  zone: string;
  crowdLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedWait: string;
  recommendation: string;
  coords: { lat: number; lng: number };
}

/**
 * Internal cache entry for crowd data.
 */
export interface CrowdCacheEntry {
  data: CrowdZone[];
  timestamp: number; // Date.now()
}

/**
 * Optimal exit strategy for a fan.
 */
export interface ExitPlan {
  leaveByTime: string;
  recommendedGate: string;
  estimatedCrowdLevel: "LOW" | "MEDIUM" | "HIGH";
  route: string;
  backupOptions: { gate: string; reason: string }[];
  reasoning: string;
}

/**
 * Extracted data from a match ticket image.
 */
export interface TicketData {
  match: string;
  teams: string;
  venue: string;
  venueAddress: string;
  date: string;
  kickoffTime: string;
  stand: string;
  gate: string;
  seat: string;
  section: string;
  rawText: string;
}

/**
 * User-defined preferences for travel and stadium experience.
 */
export interface UserPreferences {
  location: string;
  locationCoords: { lat: number; lng: number } | null;
  travelMode: "transit" | "driving" | "walking";
  foodPreference: "veg" | "non-veg" | "both";
  priorities: ("food" | "restroom" | "merchandise" | "atmosphere")[];
  accessibilityNeeds: boolean;
  doNotMiss: string[];
  language: Language;
}

/**
 * A travel recommendation from fan location to venue.
 */
export interface TravelOption {
  mode: string;
  label: string;
  duration: string;
  leaveBy: string;
  reasoning: string;
  steps: string[];
  recommended: boolean;
}

/**
 * Aggregated stadium facilities data.
 */
export interface VenueInfo {
  foodStalls: FoodStall[];
  gates: Gate[];
  restrooms: RestRoom[];
  medicalPoints: Facility[];
  atms: Facility[];
}

/**
 * Food stall facility.
 */
export interface FoodStall {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "both";
  walkTime: string;
  section: string;
  speciality: string;
  coords: { lat: number; lng: number };
}

/**
 * Entry/Exit gate facility.
 */
export interface Gate {
  id: string;
  name: string;
  serves: string[];
  coords: { lat: number; lng: number };
  congestionLevel: "low" | "medium" | "high";
}

/**
 * Restroom facility.
 */
export interface RestRoom {
  id: string;
  name: string;
  section: string;
  walkTime: string;
  coords: { lat: number; lng: number };
}

/**
 * Generic stadium facility (ATM, Medical, etc.)
 */
export interface Facility {
  id: string;
  name: string;
  section: string;
  coords: { lat: number; lng: number };
}

/**
 * A single item in the generated match day plan.
 */
export interface PlanItem {
  time: string;
  title: string;
  description: string;
  type: "travel" | "arrive" | "food" | "seat" | "event" | "break";
  reasoning: string;
}

/**
 * A single message in the AI concierge chat.
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string for JSON serialization
}

/**
 * Main application state store using Zustand.
 */
export interface MatchDayStore {
  /** Current UI stage */
  stage: Stage;

  /** Extracted ticket data */
  ticket: TicketData | null;
  /** User preferences */
  preferences: UserPreferences;
  /** Available travel options */
  travelOptions: TravelOption[];
  /** User's selected travel option */
  selectedTravel: TravelOption | null;
  /** Stadium facility information */
  venueInfo: VenueInfo | null;
  /** Generated game day timeline */
  plan: PlanItem[];
  /** Chat history for the concierge */
  chatHistory: ChatMessage[];
  /** Geocoded venue coordinates */
  venueCoords: { lat: number; lng: number } | null;
  /** Live crowd intelligence snapshots */
  crowdData: CrowdZone[] | null;
  /** Per-phase crowd intelligence cache */
  crowdCache: Record<string, CrowdCacheEntry>;
  /** Current match state phase */
  matchPhase: MatchPhase;
  /** Optimal exit strategy */
  exitPlan: ExitPlan | null;
  /** Collection of past archived sessions */
  savedSessions: Partial<MatchDayStore>[];
  /** When the current session was initialized */
  sessionCreatedAt: number | null;

  /** Update the current UI stage */
  setStage: (stage: Stage) => void;
  /** Store extracted ticket information */
  setTicket: (ticket: TicketData) => void;
  /** Update user preferences with logic to invalidate related state */
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  /** Store generated travel options */
  setTravelOptions: (options: TravelOption[]) => void;
  /** Mark a specific travel option as selected */
  setSelectedTravel: (option: TravelOption) => void;
  /** Store stadium facility data */
  setVenueInfo: (info: VenueInfo) => void;
  /** Store the generated game day timeline */
  setPlan: (plan: PlanItem[]) => void;
  /** Add a message to chat history */
  addChatMessage: (message: ChatMessage) => void;
  /** Store geocoded venue coordinates */
  setVenueCoords: (coords: { lat: number; lng: number }) => void;
  /** Store live crowd data */
  setCrowdData: (data: CrowdZone[]) => void;
  /** Update crowd cache for a specific phase */
  setCrowdCache: (phase: MatchPhase, data: CrowdZone[]) => void;
  /** 
   * Retrieves crowd intelligence data from the phase-keyed cache.
   * Returns null if missing or older than CROWD_CACHE_TTL_MS.
   */
  getCrowdCache: (phase: MatchPhase) => CrowdZone[] | null;
  /** Update current match phase */
  setMatchPhase: (phase: MatchPhase) => void;
  /** Store generated exit strategy */
  setExitPlan: (plan: ExitPlan) => void;
  /** Store archived sessions */
  setSavedSessions: (sessions: Partial<MatchDayStore>[]) => void;
  /** Restore state from an archived session */
  restoreSession: (session: Partial<MatchDayStore>) => void;
  /** Archive current session and reset store to defaults */
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  location: "",
  locationCoords: null,
  travelMode: "transit",
  foodPreference: "both",
  priorities: ["food"],
  accessibilityNeeds: false,
  doNotMiss: [],
  language: "en",
};

const defaultState = {
  stage: "landing" as Stage,
  ticket: null,
  preferences: defaultPreferences,
  travelOptions: [] as TravelOption[],
  selectedTravel: null,
  venueInfo: null,
  plan: [] as PlanItem[],
  chatHistory: [] as ChatMessage[],
  venueCoords: null,
  crowdData: null,
  crowdCache: {} as Record<string, CrowdCacheEntry>,
  matchPhase: "pre-match" as MatchPhase,
  exitPlan: null,
  savedSessions: [] as Partial<MatchDayStore>[],
  sessionCreatedAt: null as number | null,
};

export const useMatchDayStore = create<MatchDayStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setStage: (stage) => set({ stage }),
      setTicket: (ticket) =>
        set({ ticket, sessionCreatedAt: get().sessionCreatedAt || Date.now() }),
      setPreferences: (prefs) =>
        set((state) => {
          const needsTravelReset = prefs.location !== undefined || prefs.travelMode !== undefined;
          const needsPlanReset =
            needsTravelReset ||
            prefs.foodPreference !== undefined ||
            prefs.priorities !== undefined ||
            prefs.doNotMiss !== undefined;

          return {
            preferences: { ...state.preferences, ...prefs },
            ...(needsTravelReset ? { travelOptions: [] as TravelOption[], selectedTravel: null } : {}),
            ...(needsPlanReset ? { plan: [] as PlanItem[] } : {}),
          };
        }),
      setTravelOptions: (travelOptions) => set({ travelOptions }),
      setSelectedTravel: (selectedTravel) => set({ selectedTravel }),
      setVenueInfo: (venueInfo) => set({ venueInfo }),
      setPlan: (plan) => set({ plan }),
      addChatMessage: (message) =>
        set((state) => ({ chatHistory: [...state.chatHistory, message] })),
      setVenueCoords: (venueCoords) => set({ venueCoords }),
      setCrowdData: (crowdData) => set({ crowdData }),
      setCrowdCache: (phase, data) =>
        set((state) => ({
          crowdData: data,
          crowdCache: {
            ...state.crowdCache,
            [phase]: { data, timestamp: Date.now() },
          },
        })),
      getCrowdCache: (phase) => {
        const entry = get().crowdCache[phase];
        if (!entry) return null;
        const age = Date.now() - entry.timestamp;
        if (age > CROWD_CACHE_TTL_MS) return null; 
        return entry.data;
      },
      setMatchPhase: (matchPhase) => set({ matchPhase }),
      setExitPlan: (exitPlan) => set({ exitPlan }),
      setSavedSessions: (savedSessions) => set({ savedSessions }),
      restoreSession: (session) => set({
        ...defaultState,
        ...session,
        savedSessions: get().savedSessions 
      }),
      reset: () => {
        const state = get();
        let newSavedSessions = state.savedSessions;
        if (state.ticket) {
          const sessionSnapshot = { ...state };
          delete (sessionSnapshot as Partial<MatchDayStore>).savedSessions;
          newSavedSessions = [sessionSnapshot, ...state.savedSessions].slice(0, 5);
        }

        set({
          ...defaultState,
          savedSessions: newSavedSessions,
        });
      },
    }),
    {
      name: "matchday-session",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return;
          const { sessionCreatedAt } = state;
          if (sessionCreatedAt) {
            const age = Date.now() - sessionCreatedAt;
            if (age > SESSION_TTL_MS) {
              const savedSessions = state.savedSessions;
              state.reset();
              state.setSavedSessions(savedSessions);
            }
          }
          if (!state.ticket && state.stage !== "landing") {
            state.setStage("landing");
          }
        };
      },
      partialize: (state) => ({
        stage: state.stage,
        ticket: state.ticket,
        preferences: state.preferences,
        travelOptions: state.travelOptions,
        selectedTravel: state.selectedTravel,
        venueInfo: state.venueInfo,
        plan: state.plan,
        chatHistory: state.chatHistory,
        venueCoords: state.venueCoords,
        crowdData: state.crowdData,
        crowdCache: state.crowdCache,
        matchPhase: state.matchPhase,
        exitPlan: state.exitPlan,
        savedSessions: state.savedSessions,
        sessionCreatedAt: state.sessionCreatedAt,
      }),
    }
  )
);