import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FlightInfo } from "./flight-info";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

describe("FlightInfo", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders the main flight details and both day indicators when provided", () => {
		render(
			<FlightInfo
				arrivalCity="Osaka"
				arrivalTime="11:00"
				departureCity="Tokyo"
				departureTime="09:00"
				duration="2h"
				flightNumber="NU100"
				nextDayIndicator
				previousDayIndicator
			/>
		);

		expect(screen.getByText("09:00")).toBeTruthy();
		expect(screen.getByText("11:00")).toBeTruthy();
		expect(screen.getByText("Tokyo")).toBeTruthy();
		expect(screen.getByText("Osaka")).toBeTruthy();
		expect(screen.getByText("NU100")).toBeTruthy();
		expect(screen.getByText("2h")).toBeTruthy();
		expect(screen.getByText("previous_day_indicator_label")).toBeTruthy();
		expect(screen.getByText("next_day_indicator_label")).toBeTruthy();
		expect(screen.getByTestId("icon-flight")).toBeTruthy();
	});

	it("omits day indicators when they are not provided", () => {
		render(
			<FlightInfo
				arrivalCity="Osaka"
				arrivalTime="11:00"
				departureCity="Tokyo"
				departureTime="09:00"
				duration="2h"
				flightNumber="NU100"
			/>
		);

		expect(screen.queryByText("previous_day_indicator_label")).toBeNull();
		expect(screen.queryByText("next_day_indicator_label")).toBeNull();
	});
});
