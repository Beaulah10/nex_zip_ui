import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoundDisplay } from "@/components/flight-selection/bound-display/bound-display";
import type { BoundDisplayProps } from "@/types/flight-selection/flight-selection.types";

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

vi.mock("@/components/flight-selection/cabin-type/cabin-type-legend", () => ({
	CabinTypeLegend: () => <div data-testid="cabin-type-legend" />,
}));

type AirCalendarTabsMockProps = {
	tabs: Array<{ date: string; price: string; value: string }>;
	value?: string;
	onValueChange?: (value: string) => void;
};

type FlightCardListMockProps = {
	flights: Array<{ id: string }>;
	hasMultipleConnectingFlights: boolean;
};

type FlightItem = BoundDisplayProps["flights"][number];

const mockFlight: FlightItem = {
	id: "flight-1",
	arrivalCity: "Osaka",
	arrivalTime: "12:00",
	departureCity: "Tokyo",
	departureTime: "10:00",
	duration: "2h",
	flightNumber: "NU101",
	standardPrices: { adult: "JPY 100" },
	zipPrices: { adult: "JPY 150" },
	standardSeatsLeft: 9,
	zipSeatsLeft: 9,
	overallFlightTime: "02:00",
	segments: [],
	fares: [],
};

const airCalendarTabsMock = vi.fn();
const flightCardListMock = vi.fn();

function AirCalendarTabsMockComponent({
	tabs,
	value,
	onValueChange,
}: Readonly<AirCalendarTabsMockProps>) {
	airCalendarTabsMock({ onValueChange, tabs, value });

	return createElement(
		"div",
		{ "data-testid": "air-calendar-tabs" },
		createElement("span", { "data-testid": "tab-count" }, tabs.length),
		createElement("span", { "data-testid": "selected-value" }, value),
		createElement(
			"button",
			{ onClick: () => onValueChange?.("updated-date"), type: "button" },
			"change date"
		)
	);
}

function FlightCardListMockComponent({
	flights,
	hasMultipleConnectingFlights,
	...props
}: Readonly<FlightCardListMockProps & Record<string, unknown>>) {
	flightCardListMock({ flights, hasMultipleConnectingFlights, ...props });

	return createElement(
		"div",
		{
			"data-has-multiple-connecting-flights": String(hasMultipleConnectingFlights),
			"data-testid": "flight-card-list",
		},
		flights.map((flight) => flight.id).join(",")
	);
}

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		const labels: Record<string, string> = {
			connecting_flight1_label: "Connecting flight group",
			connecting_flight_label: "Connecting flight",
			no_available_flights_label: "No available flights",
		};

		return labels[key] ?? key;
	},
}));

vi.mock("@/components/flight-selection/air-calendar/air-calendar-tabs", () => ({
	AirCalendarTabs: AirCalendarTabsMockComponent,
}));

vi.mock("@/components/flight-selection/flight-card-list/flight-card-list", () => ({
	FlightCardList: FlightCardListMockComponent,
}));

function createProps(overrides: Partial<BoundDisplayProps> = {}): BoundDisplayProps {
	return {
		title: "Outbound flights",
		tabs: [{ date: "7/7", price: "JPY 100", value: "7-7" }],
		selectedDate: "7-7",
		onDateChange: vi.fn(),
		flights: [mockFlight],
		selectedCabins: {},
		onCabinSelect: vi.fn(),
		standardCabinImage: { src: "standard.png" } as BoundDisplayProps["standardCabinImage"],
		zipFullFlatImage: { src: "zip.png" } as BoundDisplayProps["zipFullFlatImage"],
		standardDesktopImage: {
			src: "standard-desktop.png",
		} as BoundDisplayProps["standardDesktopImage"],
		zipfullflatDesktopImage: {
			src: "zip-desktop.png",
		} as BoundDisplayProps["zipfullflatDesktopImage"],
		isConnectingFlightBound: false,
		connectingFlightErrors: [],
		...overrides,
	};
}

describe("BoundDisplay", () => {
	afterEach(() => {
		cleanup();
	});

	beforeEach(() => {
		airCalendarTabsMock.mockClear();
		flightCardListMock.mockClear();
	});

	it("renders the direct-bound title, forwards the ref, and wires date changes through AirCalendarTabs", () => {
		const onDateChange = vi.fn();
		const ref = createRef<HTMLDivElement>();

		render(createElement(BoundDisplay, { ...createProps({ onDateChange }), ref }));

		expect(screen.getByRole("heading", { name: "Outbound flights" })).toBeTruthy();
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(screen.getByTestId("selected-value").textContent).toBe("7-7");

		fireEvent.click(screen.getByRole("button", { name: "change date" }));

		expect(onDateChange).toHaveBeenCalledWith("updated-date");
		expect(airCalendarTabsMock).toHaveBeenCalledTimes(1);
	});

	it("renders the singular connecting-flight heading when only one connecting flight is present", () => {
		render(
			createElement(BoundDisplay, {
				...createProps({
					flights: [
						{
							...mockFlight,
							id: "connecting-1",
							arrivalCity: "Osaka",
							arrivalTime: "12:00",
							departureCity: "Tokyo",
							departureTime: "10:00",
							duration: "2h",
							flightNumber: "NU101",
							isConnectingFlight: true,
							standardPrices: { adult: "JPY 100" },
							zipPrices: { adult: "JPY 150" },
							standardSeatsLeft: 9,
							zipSeatsLeft: 9,
							overallFlightTime: "02:00",
							segments: [],
							fares: [],
						},
					],
					isConnectingFlightBound: true,
				}),
			})
		);

		expect(screen.getByRole("heading", { name: "Connecting flight" })).toBeTruthy();
	});

	it("renders the grouped connecting-flight heading and passes multiple-connecting state to FlightCardList", () => {
		const flights = [
			{
				...mockFlight,
				id: "connecting-1",
				arrivalCity: "Osaka",
				arrivalTime: "12:00",
				departureCity: "Tokyo",
				departureTime: "10:00",
				duration: "2h",
				flightNumber: "NU101",
				isConnectingFlight: true,
				standardPrices: { adult: "JPY 100" },
				zipPrices: { adult: "JPY 150" },
				standardSeatsLeft: 9,
				zipSeatsLeft: 9,
				overallFlightTime: "02:00",
				segments: [],
				fares: [],
			},
			{
				...mockFlight,
				id: "connecting-2",
				arrivalCity: "Fukuoka",
				arrivalTime: "15:00",
				departureCity: "Osaka",
				departureTime: "13:00",
				duration: "2h",
				flightNumber: "NU202",
				isConnectingFlight: true,
				standardPrices: { adult: "JPY 100" },
				zipPrices: { adult: "JPY 150" },
				standardSeatsLeft: 9,
				zipSeatsLeft: 9,
				overallFlightTime: "02:00",
				segments: [],
				fares: [],
			},
		];

		render(
			createElement(BoundDisplay, {
				...createProps({
					connectingFlightErrors: [{ groupId: "connecting-2", message: "Error" }],
					flights,
					isConnectingFlightBound: true,
				}),
			})
		);

		expect(screen.getByRole("heading", { name: "Connecting flight group" })).toBeTruthy();
		expect(screen.getByTestId("flight-card-list").dataset.hasMultipleConnectingFlights).toBe(
			"true"
		);
		expect(flightCardListMock.mock.calls[0]?.[0]).toMatchObject({
			connectingFlightErrors: [{ groupId: "connecting-2", message: "Error" }],
			flights,
			hasMultipleConnectingFlights: true,
		});
	});

	it("renders the empty-state label instead of FlightCardList when there are no flights", () => {
		render(createElement(BoundDisplay, createProps({ flights: [] })));

		expect(screen.getByText("No available flights")).toBeTruthy();
		expect(screen.queryByTestId("flight-card-list")).toBeNull();
		expect(flightCardListMock).not.toHaveBeenCalled();
	});

	it("renders the selection error banner when showError is true and flights exist", () => {
		render(createElement(BoundDisplay, createProps({ showError: true })));

		expect(screen.getByText("flight_selection_error_label")).toBeTruthy();
		expect(screen.getByTestId("flight-card-list")).toBeTruthy();
	});

	it("renders per-flight error messages for a single connecting flight with errors", () => {
		const flight = {
			...mockFlight,
			id: "connecting-single",
			isConnectingFlight: true,
		};

		render(
			createElement(BoundDisplay, {
				...createProps({
					flights: [flight],
					isConnectingFlightBound: true,
					connectingFlightErrors: [{ groupId: "connecting-single", message: "Cabin required" }],
				}),
			})
		);

		expect(screen.getByText("Cabin required")).toBeTruthy();
	});

	it("renders safely when connectingFlightErrors is undefined (uses ?? [] fallback)", () => {
		render(
			createElement(BoundDisplay, {
				...createProps({
					connectingFlightErrors: undefined,
				}),
			})
		);

		expect(screen.getByTestId("flight-card-list")).toBeTruthy();
	});
});
