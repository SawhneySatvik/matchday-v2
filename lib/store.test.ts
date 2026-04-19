import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMatchDayStore, type CrowdZone, type TravelOption, type PlanItem } from "@/lib/store";

const sampleTravel: TravelOption = {
  mode: "transit",
  label: "Metro",
  duration: "40 min",
  leaveBy: "5:10 PM",
  reasoning: "Fastest",
  steps: ["Take metro"],
  recommended: true,
};

const samplePlan: PlanItem[] = [
  {
    time: "5:00 PM",
    title: "Leave home",
    description: "Start commute",
    type: "travel",
    reasoning: "Avoid rush",
  },
];

const sampleCrowd: CrowdZone[] = [
  {
    zone: "Entry Gates",
    crowdLevel: "HIGH",
    estimatedWait: "~15 min",
    recommendation: "Arrive early",
    coords: { lat: 1, lng: 1 },
  },
];

describe("useMatchDayStore", () => {
  beforeEach(() => {
    localStorage.clear();
    const state = useMatchDayStore.getState();
    state.reset();
    state.setSavedSessions([]);
  });

  it("invalidates travel and plan when location changes", () => {
    const state = useMatchDayStore.getState();
    state.setTravelOptions([sampleTravel]);
    state.setSelectedTravel(sampleTravel);
    state.setPlan(samplePlan);

    state.setPreferences({ location: "Andheri" });

    const next = useMatchDayStore.getState();
    expect(next.travelOptions).toEqual([]);
    expect(next.selectedTravel).toBeNull();
    expect(next.plan).toEqual([]);
  });

  it("invalidates only plan when food preference changes", () => {
    const state = useMatchDayStore.getState();
    state.setTravelOptions([sampleTravel]);
    state.setSelectedTravel(sampleTravel);
    state.setPlan(samplePlan);

    state.setPreferences({ foodPreference: "veg" });

    const next = useMatchDayStore.getState();
    expect(next.travelOptions).toHaveLength(1);
    expect(next.selectedTravel).not.toBeNull();
    expect(next.plan).toEqual([]);
  });

  it("returns crowd cache while entry is fresh", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1000);
    const state = useMatchDayStore.getState();
    state.setCrowdCache("pre-match", sampleCrowd);

    nowSpy.mockReturnValue(1000 + 5 * 60 * 1000);
    expect(state.getCrowdCache("pre-match")).toEqual(sampleCrowd);
  });

  it("returns null when crowd cache entry expires", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(2000);
    const state = useMatchDayStore.getState();
    state.setCrowdCache("pre-match", sampleCrowd);

    nowSpy.mockReturnValue(2000 + 16 * 60 * 1000);
    expect(state.getCrowdCache("pre-match")).toBeNull();
  });

  it("archives current session on reset and caps saved sessions at 5", () => {
    const state = useMatchDayStore.getState();
    state.setSavedSessions([
      { stage: "plan" },
      { stage: "venue" },
      { stage: "travel" },
      { stage: "onboarding" },
      { stage: "upload" },
    ] as any);

    state.setTicket({
      match: "India vs Australia",
      teams: "India vs Australia",
      venue: "Wankhede Stadium",
      venueAddress: "Mumbai",
      date: "01 Jan 2026",
      kickoffTime: "7:00 PM",
      stand: "North",
      gate: "Gate 1",
      seat: "A1",
      section: "Block A",
      rawText: "raw",
    });

    state.reset();

    const next = useMatchDayStore.getState();
    expect(next.stage).toBe("landing");
    expect(next.ticket).toBeNull();
    expect(next.savedSessions).toHaveLength(5);
  });
});
