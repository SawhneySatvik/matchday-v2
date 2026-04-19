import { describe, it, expect } from "vitest";
import { VENUE_DATA, getVenueData } from "@/data/venues";

describe("getVenueData", () => {
  it("returns exact venue data", () => {
    const result = getVenueData("Eden Gardens");
    expect(result).toEqual(VENUE_DATA["Eden Gardens"]);
  });

  it("returns fuzzy matched venue data", () => {
    const result = getVenueData("Wankhede Stadium, Mumbai");
    expect(result).toEqual(VENUE_DATA["Wankhede Stadium"]);
  });

  it("returns null for unknown venue", () => {
    expect(getVenueData("Unknown Arena")).toBeNull();
  });
});
