import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Home from "@/app/page";
import { useMatchDayStore } from "@/lib/store";

vi.mock("@/components/landing/LandingPage", () => ({
  LandingPage: () => React.createElement("div", null, "Landing Content"),
}));

vi.mock("@/components/ticket/TicketUpload", () => ({
  TicketUpload: () => React.createElement("div", null, "Upload Content"),
}));

vi.mock("@/components/onboarding/OnboardingScreen", () => ({
  OnboardingScreen: () => React.createElement("div", null, "Onboarding Content"),
}));

vi.mock("@/components/travel/TravelScreen", () => ({
  TravelScreen: () => React.createElement("div", null, "Travel Content"),
}));

vi.mock("@/components/venue/VenueScreen", () => ({
  VenueScreen: () => React.createElement("div", null, "Venue Content"),
}));

vi.mock("@/components/plan/PlanScreen", () => ({
  PlanScreen: () => React.createElement("div", null, "Plan Content"),
}));

vi.mock("framer-motion", () => {
  const MotionWrapper = ({ children, ...props }: any) =>
    React.createElement("div", props, children);

  return {
    motion: new Proxy(
      {},
      {
        get: () => MotionWrapper,
      }
    ),
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

describe("app/page", () => {
  beforeEach(() => {
    const state = useMatchDayStore.getState();
    state.reset();
    state.setSavedSessions([]);
  });

  it("renders landing screen when stage is landing", () => {
    useMatchDayStore.getState().setStage("landing");

    render(React.createElement(Home));

    expect(screen.getByText("Landing Content")).toBeInTheDocument();
  });

  it("renders stage component when stage is not landing", () => {
    useMatchDayStore.getState().setStage("upload");

    render(React.createElement(Home));

    expect(screen.getByText("Upload Content")).toBeInTheDocument();
    expect(screen.getByLabelText("Go back")).toBeInTheDocument();
  });
});
