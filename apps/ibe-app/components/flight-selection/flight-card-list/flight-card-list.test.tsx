import { fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlightCardList } from "./flight-card-list";

const { useAppSelectorMock } = vi.hoisted(() => ({
	useAppSelectorMock: vi.fn(),
}));

vi.mock("next-intl", () => ({
	useTranslations:
		() =>
		(key: string, params?: Record<string, number>): string => {
			if (key === "segment_label") {
				return `Segment ${params?.number}`;
			}

			if (key === "connecting_flight_label") {
				return "Connecting Flight";
			}

			if (key === "zip_full_flat_restriction_message") {
				return "ZIP not allowed for children";
			}

			if (key === "no_available_seats_message") {
				return "No available seats";
			}

			if (key === "adult_label") {
				return "Adult";
			}

			if (key === "transit_label") {
				return "Transit";
			}

			if (key === "total_hours_label") {
				return "Total";
			}

			if (key === "standard_cabin_label") {
				return "Standard Cabin";
			}

			if (key === "zip_full_flat_label") {
				return "ZIP Full-Flat";
			}

			if (key === "cabin_legend_info_text") {
				return "Legend info";
			}

			if (key === "cabin_legend_link_text") {
				return "Learn more";
			}

			return key;
		},
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: useAppSelectorMock,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectFlightSearchRequest: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/airport", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/modules/utils/helpers/airport")>();

	return {
		...actual,
		getAirportDisplayName: (code: string) => `Airport-${code}`,
	};
});

vi.mock("@/modules/utils/helpers/common/passenger-label/passenger-label", () => ({
	PASSENGER_DISPLAY_ORDER: ["adult", "childC"],
	getPassengerLabel: (type: string) => `Label-${type}`,
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `JPY ${amount}`,
}));

vi.mock("@/modules/utils/helpers/flightTime-formatter", () => ({
	formatDuration: (duration: string) => `D(${duration})`,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/flight-selection/cabin-type/cabin-type-legend", () => ({
	CabinTypeLegend: ({ infoText }: { infoText: string }) => <div>{infoText}</div>,
}));

vi.mock("@/components/flight-selection/flight-information/flight-info", () => ({
	FlightInfo: ({ flightNumber }: { flightNumber: string }) => <div>{flightNumber}</div>,
}));

vi.mock("@/components/flight-selection/cabin-card/cabin-card", () => ({
	CabinCard: ({
		cabinType,
		isDisabled,
		disabledMessage,
		selected,
		onClick,
		prices,
		seatsLeft,
	}: {
		cabinType: string;
		isDisabled?: boolean;
		disabledMessage?: string;
		selected?: boolean;
		onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
		prices?: {
			adult?: string;
			extras?: Array<{
				label: string;
				price: string;
			}>;
		};
		seatsLeft?: number;
	}) => (
		<button
			type="button"
			data-testid={`cabin-${cabinType}`}
			data-disabled={String(Boolean(isDisabled))}
			data-selected={String(Boolean(selected))}
			data-seats={seatsLeft ?? "none"}
			disabled={isDisabled}
			onClick={onClick}
		>
			{`${cabinType}|${disabledMessage ?? ""}|${
				prices?.adult ?? ""
			}|extras:${prices?.extras?.length ?? 0}`}
		</button>
	),
}));

const standardImage = {
	src: "/standard.png",
	width: 100,
	height: 100,
} as const;

const zipImage = {
	src: "/zip.png",
	width: 100,
	height: 100,
} as const;

const standardDesktopImage = {
	src: "/standard-desktop.png",
	width: 100,
	height: 100,
} as const;

const zipfullflatDesktopImage = {
	src: "/zip-desktop.png",
	width: 100,
	height: 100,
} as const;

const baseFlight = {
	id: "flight-outbound-0",
	isConnectingFlight: false,
	departureTime: "09:00",
	arrivalTime: "11:00",
	departureCity: "NRT",
	arrivalCity: "KIX",
	flightNumber: "NU100",
	duration: "2h",
	hasZipFullFlat: true,
	hasStandardCabin: true,
	standardPrices: {
		adult: "JPY 12000",
	},
	zipPrices: {
		adult: "JPY 20000",
	},
	standardSeatsLeft: 4,
	zipSeatsLeft: 6,
	segments: [],
} as const;

describe("FlightCardList", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useAppSelectorMock.mockReturnValue({
			childC: 0,
			infant: 0,
		} as never);
	});

	it("renders non-connecting flight and handles cabin selection", () => {
		const onCabinSelect = vi.fn();

		render(
			<FlightCardList
				flights={[baseFlight as never]}
				selectedCabins={{
					"flight-outbound-0": "standard",
				}}
				onCabinSelect={onCabinSelect}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		expect(screen.getByText("NU100")).toBeTruthy();

		expect(screen.getByTestId("cabin-Standard").getAttribute("data-selected")).toBe("true");

		expect(screen.getByTestId("cabin-Standard").textContent).toContain("JPY 12000");

		expect(screen.getByTestId("cabin-ZIP Full-Flat").textContent).toContain("JPY 20000");

		fireEvent.click(screen.getByTestId("cabin-Standard"));
		fireEvent.click(screen.getByTestId("cabin-ZIP Full-Flat"));

		expect(onCabinSelect).toHaveBeenCalledWith("flight-outbound-0", "standard");

		expect(onCabinSelect).toHaveBeenCalledWith("flight-outbound-0", "zipfullflat");
	});

	it("disables cabins and shows availability messages", () => {
		useAppSelectorMock.mockReturnValue({
			childC: 1,
			infant: 0,
		} as never);

		const onCabinSelect = vi.fn();

		render(
			<FlightCardList
				flights={
					[
						{
							...baseFlight,
							hasZipFullFlat: false,
							hasStandardCabin: false,
						},
					] as never
				}
				selectedCabins={{}}
				onCabinSelect={onCabinSelect}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
				disableCabinSelection
			/>
		);

		const standardCabin = screen.getByTestId("cabin-Standard");
		const zipCabin = screen.getByTestId("cabin-ZIP Full-Flat");

		expect(zipCabin.textContent).toContain("ZIP not allowed for children");

		expect(standardCabin.textContent).toContain("No available seats");

		expect(standardCabin.getAttribute("data-disabled")).toBe("true");

		expect(zipCabin.getAttribute("data-disabled")).toBe("true");

		fireEvent.click(standardCabin);
		fireEvent.click(zipCabin);

		expect(onCabinSelect).not.toHaveBeenCalled();
	});

	it("renders connecting flight sections, per-segment fares, and transit information", () => {
		const onCabinSelect = vi.fn();

		const connectingFlight = {
			id: "flight-outbound-1",
			isConnectingFlight: true,
			hasZipFullFlat: true,
			hasStandardCabin: true,
			standardSeatsLeft: 10,
			zipSeatsLeft: 10,
			overallFlightTime: "8h",
			transitTime: "1h30m",
			segmentFaresList: [
				{
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 10000,
						},
						{
							passengerType: "childC",
							fareAmtInclTax: 5000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 18000,
						},
					],
				},
				{
					standard: [
						{
							passengerType: "adult",
							fareAmtInclTax: 9000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 17000,
						},
					],
				},
			],
			standardSeatsLeftBySegment: [8, 2],
			zipSeatsLeftBySegment: [7, 1],
			segments: [
				{
					departureTime: "09:00",
					arrivalTime: "11:00",
					departureCity: "NRT",
					arrivalCity: "TPE",
					flightNumber: "NU201",
					duration: "2h",
				},
				{
					departureTime: "12:30",
					arrivalTime: "15:00",
					departureCity: "TPE",
					arrivalCity: "BKK",
					flightNumber: "NU202",
					duration: "2h30m",
				},
			],
		};

		render(
			<FlightCardList
				flights={[baseFlight as never, connectingFlight as never]}
				selectedCabins={{
					"flight-outbound-1-segment-0": "zipfullflat",
				}}
				onCabinSelect={onCabinSelect}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights
				connectingFlightErrors={
					[
						{
							groupId: "flight-outbound-1",
							message: "Select all cabins",
						},
					] as never
				}
			/>
		);

		expect(screen.getByText("Select all cabins")).toBeTruthy();
		expect(screen.getByText("Legend info")).toBeTruthy();
		expect(screen.getByText("Segment 1")).toBeTruthy();
		expect(screen.getByText("Segment 2")).toBeTruthy();

		expect(screen.getByText(/Transit:/)).toBeTruthy();
		expect(screen.getByText(/D\(1h30m\)/)).toBeTruthy();

		expect(screen.getByText(/Total:/)).toBeTruthy();
		expect(screen.getByText(/D\(8h\)/)).toBeTruthy();

		const zipButtons = screen.getAllByTestId("cabin-ZIP Full-Flat");

		const standardButtons = screen.getAllByTestId("cabin-Standard");

		const firstSegmentZipButton = zipButtons[1];
		const firstSegmentStandardButton = standardButtons[1];

		if (!firstSegmentZipButton) {
			throw new Error("ZIP cabin button for the first segment was not found");
		}

		if (!firstSegmentStandardButton) {
			throw new Error("Standard cabin button for the first segment was not found");
		}

		fireEvent.click(firstSegmentZipButton);

		expect(onCabinSelect).toHaveBeenCalledWith("flight-outbound-1-segment-0", "zipfullflat");

		fireEvent.click(firstSegmentStandardButton);

		expect(onCabinSelect).toHaveBeenCalledWith("flight-outbound-1-segment-0", "standard");

		expect(firstSegmentZipButton.textContent).toContain("extras:1");

		expect(firstSegmentStandardButton.textContent).toContain("extras:2");

		expect(firstSegmentStandardButton.getAttribute("data-seats")).toBe("8");
	});

	it("shows undefined seatsLeft for a non-connecting flight when standardSeatsLeft is 9 or more", () => {
		render(
			<FlightCardList
				flights={
					[
						{
							...baseFlight,
							standardSeatsLeft: 9,
						},
					] as never
				}
				selectedCabins={{}}
				onCabinSelect={vi.fn()}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		expect(screen.getByTestId("cabin-Standard").getAttribute("data-seats")).toBe("none");
	});

	it("shows no-available-seats message when ZIP is unavailable and the passenger has no children", () => {
		render(
			<FlightCardList
				flights={
					[
						{
							...baseFlight,
							hasZipFullFlat: false,
						},
					] as never
				}
				selectedCabins={{}}
				onCabinSelect={vi.fn()}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		expect(screen.getByTestId("cabin-ZIP Full-Flat").textContent).toContain("No available seats");
	});

	it("handles non-connecting flight cabin selection with visible seatsLeft indicators", () => {
		const onCabinSelect = vi.fn();

		const flight = {
			...baseFlight,
			standardSeatsLeft: 3,
			zipSeatsLeft: 5,
		};

		render(
			<FlightCardList
				flights={[flight as never]}
				selectedCabins={{}}
				onCabinSelect={onCabinSelect}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		const standardButton = screen.getByTestId("cabin-Standard");

		const zipButton = screen.getByTestId("cabin-ZIP Full-Flat");

		expect(standardButton.getAttribute("data-seats")).toBe("3");

		expect(zipButton.getAttribute("data-seats")).toBe("5");

		fireEvent.click(standardButton);

		expect(onCabinSelect).toHaveBeenCalledWith("flight-outbound-0", "standard");

		fireEvent.click(zipButton);

		expect(onCabinSelect).toHaveBeenCalledWith("flight-outbound-0", "zipfullflat");
	});

	it("renders segment fares and allows cabin selection for each segment", () => {
		const onCabinSelect = vi.fn();

		const connectingFlight = {
			id: "connecting-2seg",
			isConnectingFlight: true,
			hasZipFullFlat: true,
			hasStandardCabin: true,
			standardSeatsLeft: 10,
			zipSeatsLeft: 10,
			overallFlightTime: "5h",
			transitTime: "2h",
			segmentFaresList: [
				{
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 8000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 14000,
						},
					],
				},
				{
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 6000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 12000,
						},
					],
				},
			],
			standardSeatsLeftBySegment: [8, 5],
			zipSeatsLeftBySegment: [6, 3],
			segments: [
				{
					departureTime: "10:00",
					arrivalTime: "12:00",
					departureCity: "NRT",
					arrivalCity: "KIX",
					flightNumber: "NU501",
					duration: "2h",
				},
				{
					departureTime: "14:00",
					arrivalTime: "16:30",
					departureCity: "KIX",
					arrivalCity: "ITM",
					flightNumber: "NU502",
					duration: "1.5h",
				},
			],
		};

		render(
			<FlightCardList
				flights={[connectingFlight as never]}
				selectedCabins={{}}
				onCabinSelect={onCabinSelect}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		const standardButtons = screen.getAllByTestId("cabin-Standard");

		const zipButtons = screen.getAllByTestId("cabin-ZIP Full-Flat");

		const firstSegmentStandardButton = standardButtons[0];
		const secondSegmentStandardButton = standardButtons[1];
		const firstSegmentZipButton = zipButtons[0];
		const secondSegmentZipButton = zipButtons[1];

		if (
			!firstSegmentStandardButton ||
			!secondSegmentStandardButton ||
			!firstSegmentZipButton ||
			!secondSegmentZipButton
		) {
			throw new Error("Expected cabin buttons were not rendered for both segments");
		}

		expect(firstSegmentStandardButton.getAttribute("data-seats")).toBe("8");

		expect(firstSegmentZipButton.getAttribute("data-seats")).toBe("6");

		expect(secondSegmentStandardButton.getAttribute("data-seats")).toBe("5");

		expect(secondSegmentZipButton.getAttribute("data-seats")).toBe("3");

		fireEvent.click(firstSegmentStandardButton);

		expect(onCabinSelect).toHaveBeenCalledWith("connecting-2seg-segment-0", "standard");

		fireEvent.click(secondSegmentZipButton);

		expect(onCabinSelect).toHaveBeenCalledWith("connecting-2seg-segment-1", "zipfullflat");
	});

	it("falls back to JPY 0 prices when segment fares are missing or empty", () => {
		const onCabinSelect = vi.fn();

		const noFaresFlight = {
			id: "flight-nofares-0",
			isConnectingFlight: true,
			hasZipFullFlat: true,
			hasStandardCabin: true,
			standardSeatsLeft: 10,
			zipSeatsLeft: 10,
			overallFlightTime: "",
			transitTime: "",
			segmentFaresList: [
				{
					standard: [],
					zipFullFlat: [],
				},
			],
			standardSeatsLeftBySegment: [],
			zipSeatsLeftBySegment: [],
			segments: [
				{
					departureTime: "09:00",
					arrivalTime: "11:00",
					departureCity: "NRT",
					arrivalCity: "KIX",
					flightNumber: "NU999",
					duration: "2h",
				},
			],
		};

		render(
			<FlightCardList
				flights={[noFaresFlight as never]}
				selectedCabins={{}}
				onCabinSelect={onCabinSelect}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		expect(screen.getByText("NU999")).toBeTruthy();

		expect(screen.getByTestId("cabin-Standard").textContent).toContain("JPY 0");

		expect(screen.getByTestId("cabin-ZIP Full-Flat").textContent).toContain("JPY 0");
	});

	it("renders per-segment cabins with segment-level seat count overrides", () => {
		const multiSegmentFlight = {
			id: "flight-multi-seg",
			isConnectingFlight: true,
			hasZipFullFlat: true,
			hasStandardCabin: true,
			standardSeatsLeft: 10,
			zipSeatsLeft: 10,
			overallFlightTime: "",
			transitTime: "",
			segmentFaresList: [
				{
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 5000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 8000,
						},
					],
				},
			],
			standardSeatsLeftBySegment: [3],
			zipSeatsLeftBySegment: [2],
			segments: [
				{
					departureTime: "09:00",
					arrivalTime: "11:00",
					departureCity: "NRT",
					arrivalCity: "TPE",
					flightNumber: "NU301",
					duration: "2h",
				},
			],
		};

		render(
			<FlightCardList
				flights={[multiSegmentFlight as never]}
				selectedCabins={{}}
				onCabinSelect={vi.fn()}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		const standardButtons = screen.getAllByTestId("cabin-Standard");

		const zipButtons = screen.getAllByTestId("cabin-ZIP Full-Flat");

		const standardButton = standardButtons[0];
		const zipButton = zipButtons[0];

		if (!standardButton || !zipButton) {
			throw new Error("Expected standard and ZIP cabin buttons were not rendered");
		}

		expect(standardButton.getAttribute("data-seats")).toBe("3");

		expect(zipButton.getAttribute("data-seats")).toBe("2");
	});

	it("shows no-available-seats message only for the segment missing that cabin type, not all segments", () => {
		const connectingFlight = {
			id: "flight-partial-cabins",
			isConnectingFlight: true,
			hasZipFullFlat: true,
			hasStandardCabin: true,
			standardSeatsLeft: 10,
			zipSeatsLeft: 10,
			overallFlightTime: "",
			transitTime: "",
			segmentFaresList: [
				{
					// Segment 0: has both cabins
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 8000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 14000,
						},
					],
				},
				{
					// Segment 1: no zip fares → zip should show "No available seats"
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 6000,
						},
					],
					zipFullFlat: [],
				},
			],
			standardSeatsLeftBySegment: [5, 5],
			zipSeatsLeftBySegment: [5, 5],
			segments: [
				{
					departureTime: "10:00",
					arrivalTime: "12:00",
					departureCity: "NRT",
					arrivalCity: "KIX",
					flightNumber: "NU601",
					duration: "2h",
				},
				{
					departureTime: "14:00",
					arrivalTime: "16:00",
					departureCity: "KIX",
					arrivalCity: "ITM",
					flightNumber: "NU602",
					duration: "2h",
				},
			],
		};

		render(
			<FlightCardList
				flights={[connectingFlight as never]}
				selectedCabins={{}}
				onCabinSelect={vi.fn()}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		const zipButtons = screen.getAllByTestId("cabin-ZIP Full-Flat");
		const standardButtons = screen.getAllByTestId("cabin-Standard");

		const seg0ZipButton = zipButtons[0];
		const seg1ZipButton = zipButtons[1];
		const seg0StandardButton = standardButtons[0];
		const seg1StandardButton = standardButtons[1];

		if (!seg0ZipButton || !seg1ZipButton || !seg0StandardButton || !seg1StandardButton) {
			throw new Error("Expected cabin buttons were not rendered for both segments");
		}

		// Segment 0 has zip fares → no disabled message, not disabled
		expect(seg0ZipButton.textContent).not.toContain("No available seats");
		expect(seg0ZipButton.getAttribute("data-disabled")).toBe("false");

		// Segment 1 has no zip fares → disabled with message
		expect(seg1ZipButton.textContent).toContain("No available seats");
		expect(seg1ZipButton.getAttribute("data-disabled")).toBe("true");

		// Both segments have standard fares → neither standard card is disabled
		expect(seg0StandardButton.textContent).not.toContain("No available seats");
		expect(seg0StandardButton.getAttribute("data-disabled")).toBe("false");

		expect(seg1StandardButton.textContent).not.toContain("No available seats");
		expect(seg1StandardButton.getAttribute("data-disabled")).toBe("false");
	});

	it("shows no-available-seats for standard on the specific segment missing standard fares", () => {
		const connectingFlight = {
			id: "flight-no-standard-seg1",
			isConnectingFlight: true,
			hasZipFullFlat: true,
			hasStandardCabin: true,
			standardSeatsLeft: 10,
			zipSeatsLeft: 10,
			overallFlightTime: "",
			transitTime: "",
			segmentFaresList: [
				{
					// Segment 0: has both cabins
					standard: [
						{
							passengerType: "adult",
							baseFareAmtInclTax: 7000,
						},
					],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 13000,
						},
					],
				},
				{
					// Segment 1: no standard fares → standard should show "No available seats"
					standard: [],
					zipFullFlat: [
						{
							passengerType: "adult",
							fareAmtInclTax: 13000,
						},
					],
				},
			],
			standardSeatsLeftBySegment: [5, 5],
			zipSeatsLeftBySegment: [5, 5],
			segments: [
				{
					departureTime: "10:00",
					arrivalTime: "12:00",
					departureCity: "NRT",
					arrivalCity: "KIX",
					flightNumber: "NU701",
					duration: "2h",
				},
				{
					departureTime: "14:00",
					arrivalTime: "16:00",
					departureCity: "KIX",
					arrivalCity: "ITM",
					flightNumber: "NU702",
					duration: "2h",
				},
			],
		};

		render(
			<FlightCardList
				flights={[connectingFlight as never]}
				selectedCabins={{}}
				onCabinSelect={vi.fn()}
				standardCabinImage={standardImage as never}
				zipFullFlatImage={zipImage as never}
				standardDesktopImage={standardDesktopImage as never}
				zipfullflatDesktopImage={zipfullflatDesktopImage as never}
				hasMultipleConnectingFlights={false}
				connectingFlightErrors={[]}
			/>
		);

		const standardButtons = screen.getAllByTestId("cabin-Standard");
		const zipButtons = screen.getAllByTestId("cabin-ZIP Full-Flat");

		const seg0StandardButton = standardButtons[0];
		const seg1StandardButton = standardButtons[1];
		const seg0ZipButton = zipButtons[0];
		const seg1ZipButton = zipButtons[1];

		if (!seg0StandardButton || !seg1StandardButton || !seg0ZipButton || !seg1ZipButton) {
			throw new Error("Expected cabin buttons were not rendered for both segments");
		}

		// Segment 0 has standard fares → not disabled
		expect(seg0StandardButton.textContent).not.toContain("No available seats");
		expect(seg0StandardButton.getAttribute("data-disabled")).toBe("false");

		// Segment 1 has no standard fares → disabled with message
		expect(seg1StandardButton.textContent).toContain("No available seats");
		expect(seg1StandardButton.getAttribute("data-disabled")).toBe("true");

		// Both segments have zip fares → neither zip card shows the message
		expect(seg0ZipButton.textContent).not.toContain("No available seats");
		expect(seg0ZipButton.getAttribute("data-disabled")).toBe("false");

		expect(seg1ZipButton.textContent).not.toContain("No available seats");
		expect(seg1ZipButton.getAttribute("data-disabled")).toBe("false");
	});
});
