import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BookingStepper from "./booking-stepper";

const usePathnameMock = vi.hoisted(() => vi.fn());
const useSearchParamsMock = vi.hoisted(() => vi.fn());
const useTranslationsMock = vi.hoisted(() => vi.fn());
const useTripTypeMock = vi.hoisted(() => vi.fn());

const bookingStepperLabels: Record<string, string> = {
	flight_selection: "Select Flights",
	outbound_options: "Outbound Options",
	inbound_options: "Inbound Options",
	segment1_options: "Segment 1 Options",
	segment2_options: "Segment 2 Options",
	customer_information: "Customer Information",
	insurance_selection: "Insurance Selection",
	review_confirm_selection: "Review and Confirm",
	payment_selection: "Payment",
};

vi.mock("next/navigation", () => ({
	usePathname: usePathnameMock,
	useSearchParams: useSearchParamsMock,
}));

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock("@/modules/hooks/common/trip-type/trip-type", () => ({
	useTripType: useTripTypeMock,
}));

vi.mock("@repo/ui/components/stepper", () => ({
	Stepper: ({
		currentStep,
		steps,
		completedSteps,
	}: {
		currentStep: number;
		steps: Array<{ label: string }>;
		completedSteps?: number[];
	}) =>
		React.createElement(
			"div",
			{
				"data-testid": "booking-stepper",
				"data-current-step": currentStep,
				"data-step-count": steps.length,
				"data-completed-steps": completedSteps ? JSON.stringify(completedSteps) : "[]",
			},
			steps.map((step) => step.label).join("|")
		),
}));

describe("BookingStepper", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
		sessionStorage.clear();
	});

	beforeEach(() => {
		useTranslationsMock.mockReturnValue((key: string) => bookingStepperLabels[key] ?? key);
		useSearchParamsMock.mockReturnValue(new URLSearchParams());
		useTripTypeMock.mockReturnValue({ tripType: undefined });
		sessionStorage.clear();
	});

	it("renders the one-way stepper with grouped option steps", () => {
		usePathnameMock.mockReturnValue("/en/bundles/outbound");
		useTripTypeMock.mockReturnValue({ tripType: "oneway" });

		render(React.createElement(BookingStepper));

		const stepper = screen.getByTestId("booking-stepper");
		expect(stepper.getAttribute("data-current-step")).toBe("1");
		expect(stepper.getAttribute("data-step-count")).toBe("6");
		expect(stepper.textContent).toContain("Outbound Options");
	});

	it("shows inbound options on the select-flights screen for roundtrip searches", () => {
		usePathnameMock.mockReturnValue("/en/flight-selection");
		useSearchParamsMock.mockReturnValue(new URLSearchParams("departureDateTo=2026-08-20"));

		render(React.createElement(BookingStepper));

		const stepper = screen.getByTestId("booking-stepper");
		expect(stepper.getAttribute("data-current-step")).toBe("0");
		expect(stepper.getAttribute("data-step-count")).toBe("7");
		expect(stepper.textContent).toContain("Inbound Options");
	});

	it("maps inbound extras routes to the inbound step for roundtrip journeys", () => {
		usePathnameMock.mockReturnValue("/en/extras/inbound");
		useTripTypeMock.mockReturnValue({ tripType: "roundtrip" });

		render(React.createElement(BookingStepper));

		const stepper = screen.getByTestId("booking-stepper");
		expect(stepper.getAttribute("data-current-step")).toBe("2");
		expect(stepper.getAttribute("data-step-count")).toBe("7");
		expect(stepper.textContent).toContain("Inbound Options");
	});

	it("maps connecting segment routes to the expected segment step", () => {
		usePathnameMock.mockReturnValue("/en/customize/segment2");
		useTripTypeMock.mockReturnValue({ tripType: "connecting" });

		render(React.createElement(BookingStepper));

		const stepper = screen.getByTestId("booking-stepper");
		expect(stepper.getAttribute("data-current-step")).toBe("2");
		expect(stepper.getAttribute("data-step-count")).toBe("7");
		expect(stepper.textContent).toContain("Segment 2 Options");
	});

	it("returns null for an unknown route", () => {
		usePathnameMock.mockReturnValue("/en/unknown-route");

		const { container } = render(React.createElement(BookingStepper));

		expect(container.innerHTML).toBe("");
		expect(screen.queryByTestId("booking-stepper")).toBeNull();
	});

	it("returns null when the route segment is missing", () => {
		usePathnameMock.mockReturnValue("/en");

		const { container } = render(React.createElement(BookingStepper));

		expect(container.innerHTML).toBe("");
		expect(screen.queryByTestId("booking-stepper")).toBeNull();
	});
});
