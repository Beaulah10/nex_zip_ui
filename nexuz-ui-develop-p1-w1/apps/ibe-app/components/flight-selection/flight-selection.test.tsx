import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { createContext, forwardRef, useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlightSelection } from "./flight-selection";

const mocks = vi.hoisted(() => ({
	push: vi.fn(),
	dispatch: vi.fn(),
	searchParams:
		"routes=NRT-SIN&departureDateFrom=2026-08-25&departureDateTo=2026-08-28&adult=1&childC=0&infant=0",
	setFlightSelectionRequest: vi.fn((payload) => ({ type: "flight/setRequest", payload })),
	confirmFlightSelection: vi.fn((payload) => ({ type: "flight/confirm", payload })),
	fetchCalendarFares: vi.fn((payload) => ({ type: "calendar/fetch", payload })),
	isSameCalendarRequest: vi.fn(() => false),
	flightSelectionData: vi.fn(),
	calculateGrandTotal: vi.fn(() => 25000),
	connectingErrors: vi.fn((): Array<{ groupId: string; message: string }> => []),
	outboundIncomplete: vi.fn(() => false),
	convertFaresToPrices: vi.fn(() => ({ "2026-08-25": 10000 })),
	convertPromoFaresToPrices: vi.fn(() => ({})),
	isLoadMoreNeeded: vi.fn<(startDate: Date) => boolean>(() => false),
	getNextCalendarWindowRange: vi.fn<(fromDate: Date) => { from: string; to: string }>(() => ({
		from: "2026-08-01",
		to: "2026-10-31",
	})),
	visibleMonth: "default" as "default" | "forward" | "backward" | "far-forward",
	state: {
		calendarFares: {
			outboundFares: [],
			inboundFares: [],
			loadedRanges: [],
			isPending: false,
			request: undefined,
			error: undefined,
		},
		flightSelection: { data: undefined },
	} as any,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mocks.push }),
	usePathname: () => "/en/flights",
	useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const t = (key: string) => key;
		t.rich = (key: string, values: any) => values.link(key);
		return t;
	},
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mocks.dispatch,
	useAppSelector: (selector: any) => selector(mocks.state),
}));

vi.mock("@/store/slices/calendar-fares/calendar-fares.slice", () => ({
	fetchCalendarFares: mocks.fetchCalendarFares,
	isSameCalendarRequest: mocks.isSameCalendarRequest,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	setFlightSelectionRequest: mocks.setFlightSelectionRequest,
	confirmFlightSelection: mocks.confirmFlightSelection,
}));

vi.mock("@/modules/hooks/flight-selection/flight-selection-data", () => ({
	flightSelectionData: mocks.flightSelectionData,
}));

vi.mock("@/modules/utils/helpers/flight-selection/cabin-utils/cabin-utils", () => ({
	calculateGrandTotal: mocks.calculateGrandTotal,
}));

vi.mock(
	"@/modules/utils/helpers/flight-selection/flight-selection-utils/flight-selection-utils",
	() => ({
		getConnectingFlightSelectionErrors: mocks.connectingErrors,
		isOutboundSelectionIncomplete: mocks.outboundIncomplete,
	})
);

vi.mock("@/modules/utils/helpers/calendar-fare/calendar-fare-utils", () => ({
	convertFaresToPrices: mocks.convertFaresToPrices,
	convertPromoFaresToPrices: mocks.convertPromoFaresToPrices,
	getMonthDateRange: (year: number, month: number) => ({
		start: new Date(year, month, 1),
		end: new Date(year, month + 1, 0),
	}),
	getNextCalendarWindowRange: mocks.getNextCalendarWindowRange,
	isLoadMoreNeeded: mocks.isLoadMoreNeeded,
	stringToDate: (value: string) => new Date(`${value}T00:00:00`),
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `JPY ${amount}`,
}));

vi.mock("@/repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@/repo/ui/components/button", () => ({
	Button: forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
		(props, ref) => <button ref={ref} {...props} />
	),
}));

const DialogContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(
	null
);
vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ open, onOpenChange, children }: any) => (
		<DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
			{children}
		</DialogContext.Provider>
	),
	DialogTrigger: ({ children }: any) => {
		const context = useContext(DialogContext);

		if (!context) {
			return children;
		}

		return React.cloneElement(children, {
			onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
				children.props.onClick?.(event);
				if (!event.defaultPrevented) context.setOpen(true);
			},
		});
	},
}));

vi.mock("@/components/common/loading-overlay/loading-overlay", () => ({
	LoadingOverlay: () => <div>loading-overlay</div>,
}));

vi.mock("@/components/passenger-name/enter-passenger/enter-passenger", () => ({
	EnterPassengerDialog: () => <div>passenger-dialog</div>,
}));

vi.mock("@/components/flight-selection/emergency-support/emergency-support-dialog", () => ({
	EmergencySupportDialog: ({ open, onClose, onAgree }: any) =>
		open ? (
			<div>
				<span>emergency-dialog</span>
				<button type="button" onClick={onAgree}>
					agree-emergency
				</button>
				<button type="button" onClick={onClose}>
					close-emergency
				</button>
			</div>
		) : null,
}));

vi.mock("@/components/flight-selection/calendar/date-selection-modal/date-selection-modal", () => ({
	default: (props: any) =>
		props.isOpen ? (
			<div data-testid="date-modal">
				<span>{props.oneWay ? "one-way-calendar" : "round-trip-calendar"}</span>
				<span>{props.passengerType}</span>
				<button type="button" onClick={() => props.onConfirmOneWay(new Date(2026, 8, 2))}>
					confirm-one-way
				</button>
				<button
					type="button"
					onClick={() => props.onConfirm(new Date(2026, 8, 2), new Date(2026, 8, 5))}
				>
					confirm-round-trip
				</button>
				<button type="button" onClick={props.onReset}>
					reset-calendar
				</button>
				<button type="button" onClick={props.onClose}>
					close-calendar
				</button>
				<button type="button" onClick={() => props.onSeatTypeChange("zip")}>
					select-zip
				</button>
				<button
					type="button"
					onClick={() =>
						props.onVisibleMonthChange(
							mocks.visibleMonth === "forward"
								? new Date(2027, 2, 1)
								: mocks.visibleMonth === "far-forward"
									? new Date(2027, 4, 1)
									: mocks.visibleMonth === "backward"
										? new Date(2026, 10, 1)
										: new Date(2026, 5, 1),
							mocks.visibleMonth === "forward"
								? new Date(2027, 3, 1)
								: mocks.visibleMonth === "far-forward"
									? new Date(2027, 5, 1)
									: mocks.visibleMonth === "backward"
										? new Date(2026, 11, 1)
										: new Date(2026, 6, 1)
						)
					}
				>
					change-visible-month
				</button>
			</div>
		) : null,
}));

vi.mock("@/components/flight-selection/bound-display/bound-display", () => ({
	BoundDisplay: forwardRef<HTMLDivElement, any>((props, ref) => (
		<section ref={ref} data-testid={`bound-${props.title}`}>
			<h2>{props.title}</h2>
			<span>flights:{props.flights.length}</span>
			{props.showError && <span>bound-error</span>}
			{props.connectingFlightErrors?.map((error: any) => (
				<span key={error.groupId}>{error.groupId}</span>
			))}
			<button type="button" onClick={() => props.onDateChange("9-2")}>
				change-{props.title}-date
			</button>
			<button type="button" onClick={() => props.onDateChange(" ")}>
				change-{props.title}-date-empty
			</button>
			<button type="button" onClick={() => props.onCabinSelect?.("flight-outbound-0", "standard")}>
				select-cabin
			</button>
		</section>
	)),
}));

vi.mock("@/assets/images/standard.png", () => ({ default: "standard.png" }));
vi.mock("@/assets/images/zipfullflat.png", () => ({ default: "zip.png" }));

const displaySegment = {
	carrierCode: "ZG",
	origin: "NRT",
	destination: "SIN",
	flightNumber: "51",
	scheduledDepartureArrivalDateTime: {
		departureDateTime: "2026-08-25T10:00:00",
		arrivalDateTime: "2026-08-25T16:00:00",
	},
	flightTime: 360,
};

const rawSegment = {
	...displaySegment,
	pfid: 11,
	lfid: 22,
	scheduledDepartureArrivalDateTime: {
		...displaySegment.scheduledDepartureArrivalDateTime,
		departureDateTimeOffset: "+09:00",
		arrivalDateTimeOffset: "+08:00",
	},
	fareInfos: [
		{
			cabin: "standard",
			fareDetails: [{ passengerType: "ADT", fareAmtInclTax: 12000 }],
			boundSummary: { passengerWiseFares: [{ passengerType: "ADT", count: 1 }] },
		},
		{
			cabin: "zipfullflat",
			fareDetails: [{ passengerType: "ADT", fareAmtInclTax: 30000 }],
			boundSummary: { passengerWiseFares: [{ passengerType: "ADT", count: 1 }] },
		},
	],
};

const flight = {
	segments: [displaySegment],
	cabinFares: [{ cabin: "standard", fares: [{ fareAmtInclTax: 12000, count: 1 }] }],
	isConnectingFlight: false,
};

const baseData = (overrides: Record<string, unknown> = {}) => ({
	isLoadingFlights: false,
	tripType: "oneway",
	isRoundTrip: false,
	selectedDateOutbound: "8-25",
	setSelectedDateOutbound: vi.fn(),
	selectedDateInbound: "",
	setSelectedDateInbound: vi.fn(),
	calendarTabsOutbound: [{ value: "8-25", disabled: false }],
	calendarTabsInbound: [{ value: "8-28", disabled: false }],
	filteredFlightsOutbound: [flight],
	filteredFlightsInbound: [],
	mappedFlightsOutbound: [flight],
	mappedFlightsInbound: [],
	selectedCabinsOutbound: { "flight-outbound-0": "standard" },
	selectedCabinsInbound: {},
	onSelectOutboundCabin: vi.fn(),
	onSelectInboundCabin: vi.fn(),
	hasConnectingOutbound: false,
	...overrides,
});

function setRawData(inbound = false) {
	mocks.state.flightSelection.data = {
		data: {
			outbound: { flightsByDate: [{ flights: [{ segments: [rawSegment] }] }] },
			...(inbound
				? { inbound: { flightsByDate: [{ flights: [{ segments: [rawSegment] }] }] } }
				: {}),
		},
	};
}

describe("FlightSelection", () => {
	afterEach(() => {
		cleanup();
		document.body.innerHTML = "";
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.visibleMonth = "default";
		mocks.getNextCalendarWindowRange.mockImplementation(() => ({
			from: "2026-08-01",
			to: "2026-10-31",
		}));
		mocks.push.mockReset();
		mocks.dispatch.mockReset();
		mocks.searchParams =
			"routes=NRT-SIN&departureDateFrom=2026-08-25&departureDateTo=2026-08-28&adult=1&childC=0&infant=0";
		mocks.setFlightSelectionRequest.mockReset();
		mocks.confirmFlightSelection.mockReset();
		mocks.fetchCalendarFares.mockReset();
		mocks.isSameCalendarRequest.mockReturnValue(false);
		mocks.flightSelectionData.mockReset();
		mocks.calculateGrandTotal.mockReturnValue(25000);
		mocks.connectingErrors.mockReturnValue([]);
		mocks.outboundIncomplete.mockReturnValue(false);
		mocks.convertFaresToPrices.mockReturnValue({ "2026-08-25": 10000 });
		mocks.convertPromoFaresToPrices.mockReturnValue({});
		mocks.isLoadMoreNeeded.mockReturnValue(false);
		mocks.getNextCalendarWindowRange.mockReturnValue({ from: "2026-08-01", to: "2026-10-31" });
		mocks.state.calendarFares = {
			outboundFares: [],
			inboundFares: [],
			loadedRanges: [],
			isPending: false,
			request: undefined,
			error: undefined,
		};
		setRawData();
		mocks.dispatch.mockImplementation((action: any) => {
			if (action?.type === "calendar/fetch") return Promise.resolve(action);
			return action;
		});
		mocks.flightSelectionData.mockReturnValue(baseData());
	});

	it("renders loading state", () => {
		mocks.flightSelectionData.mockReturnValue(baseData({ isLoadingFlights: true }));
		render(<FlightSelection locale="en" />);
		expect(screen.getByText("loading-overlay")).toBeInTheDocument();
	});

	it("renders selection, total, notices, and opens passenger dialog for a valid standard fare", async () => {
		const user = userEvent.setup();
		render(<FlightSelection locale="en" />);

		expect(screen.getByText("flight_page_title")).toBeInTheDocument();
		expect(screen.getByText("JPY 25000")).toBeInTheDocument();
		expect(screen.getByText("airfare_not_guaranteed_message")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "check_in_baggage_fee_message" })).toHaveAttribute(
			"href",
			"https://www.zipair.net/en/service/baggage"
		);

		await user.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(screen.getByText("passenger-dialog")).toBeInTheDocument();
		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				tripType: "oneway",
				grandTotalAmount: 12000,
				currency: "JPY",
				language: "en",
				flights: { outbound: expect.objectContaining({ totalFlightAmount: 12000 }) },
			})
		);
	});

	it("blocks proceeding when no outbound flights exist", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				mappedFlightsOutbound: [],
				filteredFlightsOutbound: [],
				selectedCabinsOutbound: {},
			})
		);
		render(<FlightSelection locale="en" />);

		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(screen.queryByText("passenger-dialog")).not.toBeInTheDocument();
		expect(mocks.confirmFlightSelection).not.toHaveBeenCalled();
	});

	it("shows outbound validation error for an incomplete one-way choice", async () => {
		mocks.outboundIncomplete.mockReturnValue(true);
		mocks.flightSelectionData.mockReturnValue(baseData({ selectedCabinsOutbound: {} }));
		render(<FlightSelection locale="en" />);

		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(screen.getByText("bound-error")).toBeInTheDocument();
		expect(mocks.confirmFlightSelection).not.toHaveBeenCalled();
	});

	it("shows connecting-flight errors and does not proceed", async () => {
		mocks.connectingErrors.mockReturnValue([
			{ groupId: "connection-group-1", message: "required" },
		]);
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				hasConnectingOutbound: true,
				filteredFlightsOutbound: [{ ...flight, isConnectingFlight: true }],
				mappedFlightsOutbound: [{ ...flight, isConnectingFlight: true }],
			})
		);
		document.body.insertAdjacentHTML("beforeend", '<div id="connection-group-1"></div>');
		Element.prototype.scrollIntoView = vi.fn();
		render(<FlightSelection locale="en" />);

		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(screen.getByText("connection-group-1")).toBeInTheDocument();
		expect(mocks.confirmFlightSelection).not.toHaveBeenCalled();
	});

	it("requires both bounds for a round trip", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				mappedFlightsInbound: [flight],
				filteredFlightsInbound: [flight],
				selectedCabinsInbound: {},
				selectedDateInbound: "8-28",
			})
		);
		render(<FlightSelection locale="en" />);

		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(screen.getAllByText("bound-error")).toHaveLength(1);
		expect(mocks.confirmFlightSelection).not.toHaveBeenCalled();
	});

	it("builds outbound and inbound confirmation payload", async () => {
		setRawData(true);
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				mappedFlightsInbound: [flight],
				filteredFlightsInbound: [flight],
				selectedCabinsInbound: { "flight-inbound-0": "standard" },
				selectedDateInbound: "8-28",
			})
		);
		render(<FlightSelection locale="ja" />);

		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				grandTotalAmount: 24000,
				flights: expect.objectContaining({
					outbound: expect.any(Object),
					inbound: expect.any(Object),
				}),
			})
		);
	});

	it("builds payload safely when selected cabins contain non-string values", async () => {
		const weirdCabins = {
			"flight-outbound-0": true as unknown as string,
		};
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: weirdCabins,
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				grandTotalAmount: 0,
				flights: expect.objectContaining({
					outbound: expect.objectContaining({
						segments: [],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
					}),
				}),
			})
		);
	});

	it("handles malformed selected-cabin ids without crashing and keeps totals at zero", async () => {
		const malformedCabins = {
			"flight-outbound-not-a-number": "standard",
			"flight-outbound-9": "standard",
			"flight-outbound-0-segment-NaN": "standard",
			"flight-outbound-0-segment-5": "standard",
		};
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: malformedCabins,
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				grandTotalAmount: 0,
				flights: expect.objectContaining({
					outbound: expect.objectContaining({ totalFlightAmount: 0 }),
				}),
			})
		);
	});

	it("falls back segment identifiers and fare details when api segment does not match", async () => {
		const unmatchedFlight = {
			...flight,
			segments: [
				{
					...displaySegment,
					flightNumber: "999",
					carrierCode: "XX",
				},
			],
		};

		mocks.flightSelectionData.mockReturnValue(
			baseData({
				mappedFlightsOutbound: [unmatchedFlight],
				filteredFlightsOutbound: [unmatchedFlight],
				selectedCabinsOutbound: { "flight-outbound-0": "standard" },
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				flights: expect.objectContaining({
					outbound: expect.objectContaining({
						totalFlightAmount: 12000,
						segments: [
							expect.objectContaining({
								pfid: 0,
								lfid: 0,
								fareDetails: [],
							}),
						],
					}),
				}),
			})
		);
	});

	it("opens emergency dialog for zip-full-flat and opens passenger dialog after agreement", async () => {
		const user = userEvent.setup();
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: { "flight-outbound-0": "zipfullflat" },
			})
		);
		render(<FlightSelection locale="en" />);

		await user.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);
		expect(await screen.findByText("emergency-dialog")).toBeInTheDocument();
		expect(screen.queryByText("passenger-dialog")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "agree-emergency" }));
		await waitFor(() => {
			expect(screen.queryByText("emergency-dialog")).not.toBeInTheDocument();
		});
		expect(screen.getByText("passenger-dialog")).toBeInTheDocument();
		expect(mocks.confirmFlightSelection).toHaveBeenCalledTimes(2);
	});

	it("closes emergency dialog without agreement", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: { "flight-outbound-0": "zipfullflat" },
			})
		);
		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);
		await userEvent.click(screen.getByRole("button", { name: "close-emergency" }));
		await waitFor(() => {
			expect(screen.queryByText("emergency-dialog")).not.toBeInTheDocument();
		});
	});

	it("opens date selection and confirms one-way routing", async () => {
		const data = baseData();
		mocks.flightSelectionData.mockReturnValue(data);
		render(<FlightSelection locale="en" />);

		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));
		expect(screen.getByText("one-way-calendar")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "confirm-one-way" }));

		expect(data.setSelectedDateOutbound).toHaveBeenCalledWith("9-2");
		expect(data.setSelectedDateInbound).toHaveBeenCalledWith("");
		expect(mocks.push).toHaveBeenCalledWith(
			expect.stringContaining("departureDateFrom=2026-09-02")
		);
		const pushedPath = String(mocks.push.mock.calls[0]?.[0] ?? "");
		expect(pushedPath).not.toContain("departureDateTo");
	});

	it("opens add-return calendar and confirms round-trip routing", async () => {
		const data = baseData();
		mocks.flightSelectionData.mockReturnValue(data);
		render(<FlightSelection locale="en" />);

		await userEvent.click(screen.getByRole("button", { name: "add_return_flight_button_label" }));
		expect(screen.getByText("round-trip-calendar")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "confirm-round-trip" }));

		expect(data.setSelectedDateOutbound).toHaveBeenCalledWith("9-2");
		expect(data.setSelectedDateInbound).toHaveBeenCalledWith("9-5");
		expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("departureDateTo=2026-09-05"));
	});

	it("updates only menu dates when outbound date changes", async () => {
		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "change-outbound_label-date" }));
		expect(mocks.setFlightSelectionRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateFrom: "2026-09-02",
			})
		);
	});

	it("does not update menu request when outbound date value is empty", async () => {
		const data = baseData();
		mocks.flightSelectionData.mockReturnValue(data);
		render(<FlightSelection locale="en" />);

		const callCountAfterMount = mocks.setFlightSelectionRequest.mock.calls.length;
		await userEvent.click(screen.getByRole("button", { name: "change-outbound_label-date-empty" }));

		expect(data.setSelectedDateOutbound).toHaveBeenCalledWith(" ");
		expect(mocks.setFlightSelectionRequest.mock.calls.length).toBe(callCountAfterMount);
	});

	it("updates inbound date for a round trip", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				mappedFlightsInbound: [flight],
				filteredFlightsInbound: [flight],
				selectedCabinsInbound: { "flight-inbound-0": "standard" },
				selectedDateInbound: "8-28",
			})
		);
		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "change-inbound_label-date" }));
		expect(mocks.setFlightSelectionRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateTo: "2026-09-02",
			})
		);
	});

	it("keeps existing departureDateTo when outbound date changes and selected inbound date is blank", async () => {
		const data = baseData({
			selectedDateInbound: " ",
		});
		mocks.flightSelectionData.mockReturnValue(data);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "change-outbound_label-date" }));

		expect(mocks.setFlightSelectionRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateFrom: "2026-09-02",
				departureDateTo: undefined,
			})
		);
	});

	it("does not update inbound route date when inbound month-day value is blank", async () => {
		const data = baseData({
			tripType: "roundtrip",
			isRoundTrip: true,
			selectedDateOutbound: "9-2",
			selectedDateInbound: "9-5",
			mappedFlightsInbound: [flight],
			filteredFlightsInbound: [flight],
			selectedCabinsInbound: { "flight-inbound-0": "standard" },
		});

		mocks.flightSelectionData.mockReturnValue(data);
		render(<FlightSelection locale="en" />);

		await userEvent.click(screen.getByRole("button", { name: "change-inbound_label-date-empty" }));

		expect(data.setSelectedDateInbound).toHaveBeenCalledWith(" ");
		expect(mocks.setFlightSelectionRequest).not.toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateTo: " ",
			})
		);
	});

	it("requests calendar fares when opening an unloaded range", async () => {
		mocks.isLoadMoreNeeded.mockReturnValue(true);
		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));
		expect(mocks.fetchCalendarFares).toHaveBeenCalledWith(
			expect.objectContaining({
				locale: "en",
				request: expect.objectContaining({ routes: "NRT-SIN", currency: "JPY" }),
			})
		);
	});

	it("uses the inbound month start for both round-trip calendar request dates", async () => {
		mocks.isLoadMoreNeeded.mockReturnValue(true);
		mocks.searchParams =
			"routes=NRT-SIN&departureDateFrom=2027-08-25&departureDateTo=2027-09-02&adult=1&childC=0&infant=0";
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				selectedDateInbound: "9-2",
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		expect(mocks.fetchCalendarFares).toHaveBeenCalledWith(
			expect.objectContaining({
				request: expect.objectContaining({
					departureDateFrom: "2027-09-01",
					departureDateTo: "2027-09-01",
				}),
			})
		);
	});

	it("uses the outbound month start for both one-way calendar request dates", async () => {
		mocks.isLoadMoreNeeded.mockReturnValue(true);
		mocks.searchParams = "routes=NRT-SIN&departureDateFrom=2027-08-25&adult=1&childC=0&infant=0";

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		expect(mocks.fetchCalendarFares).toHaveBeenCalledWith(
			expect.objectContaining({
				request: expect.objectContaining({
					departureDateFrom: "2027-08-01",
					departureDateTo: "2027-08-01",
				}),
			})
		);
	});

	it("uses today for a calendar request targeting the current month", async () => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");
		const monthDay = `${today.getMonth() + 1}-1`;
		const currentMonthStart = `${year}-${month}-01`;
		const todayString = `${year}-${month}-${day}`;

		mocks.isLoadMoreNeeded.mockReturnValue(true);
		mocks.searchParams = `routes=NRT-SIN&departureDateFrom=${currentMonthStart}&departureDateTo=${currentMonthStart}&adult=1&childC=0&infant=0`;
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				selectedDateOutbound: monthDay,
				selectedDateInbound: monthDay,
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		expect(mocks.fetchCalendarFares).toHaveBeenCalledWith(
			expect.objectContaining({
				request: expect.objectContaining({
					departureDateFrom: todayString,
					departureDateTo: todayString,
				}),
			})
		);
	});

	it("handles calendar fare fetch failure gracefully", async () => {
		mocks.isLoadMoreNeeded.mockReturnValue(true);
		mocks.dispatch.mockImplementation((action: any) => {
			if (action?.type === "calendar/fetch") {
				return Promise.reject(new Error("network"));
			}
			return action;
		});

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		await waitFor(() => {
			expect(mocks.fetchCalendarFares).toHaveBeenCalled();
		});
	});

	it("does not request an already loaded calendar range", async () => {
		mocks.isLoadMoreNeeded.mockReturnValue(false);
		mocks.state.calendarFares.loadedRanges = [{ from: "2026-08-01", to: "2026-10-31" }];
		mocks.isSameCalendarRequest.mockReturnValue(true);
		mocks.state.calendarFares.request = { routes: "NRT-SIN" };
		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));
		expect(mocks.fetchCalendarFares).not.toHaveBeenCalled();
	});

	it("changes visible month, seat type, resets, and closes calendar", async () => {
		const user = userEvent.setup();
		mocks.isLoadMoreNeeded.mockReturnValue(true);
		render(<FlightSelection locale="en" />);
		await user.click(screen.getByRole("button", { name: "date_selection_button_label" }));
		await user.click(screen.getByRole("button", { name: "select-zip" }));
		expect(mocks.convertFaresToPrices).toHaveBeenCalledWith([], "zip");
		await user.click(screen.getByRole("button", { name: "reset-calendar" }));
		expect(mocks.convertFaresToPrices).toHaveBeenCalledWith([], "standard");
		await user.click(screen.getByRole("button", { name: "change-visible-month" }));
		await user.click(screen.getByRole("button", { name: "close-calendar" }));
		expect(screen.queryByTestId("date-modal")).not.toBeInTheDocument();
	});

	it("requests the next aligned month start when navigating forward", async () => {
		const user = userEvent.setup();
		mocks.isLoadMoreNeeded.mockImplementation((startDate: Date) => startDate.getMonth() !== 11);
		mocks.visibleMonth = "forward";
		mocks.state.calendarFares.loadedRanges = [{ from: "2026-12-01", to: "2027-02-28" }];
		mocks.searchParams =
			"routes=NRT-SIN&departureDateFrom=2026-12-02&departureDateTo=2026-12-06&adult=1&childC=0&infant=0";
		mocks.getNextCalendarWindowRange.mockImplementation((fromDate: Date) => ({
			from: `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-01`,
			to: "2027-05-31",
		}));
		mocks.flightSelectionData.mockReturnValue(
			baseData({ selectedDateOutbound: "12-2", selectedDateInbound: "12-6" })
		);

		render(<FlightSelection locale="en" />);
		await user.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		await user.click(screen.getByRole("button", { name: "change-visible-month" }));

		await waitFor(() => expect(mocks.fetchCalendarFares).toHaveBeenCalled());
		expect(mocks.fetchCalendarFares.mock.calls.at(-1)?.[0]).toEqual(
			expect.objectContaining({
				request: expect.objectContaining({
					departureDateFrom: "2027-03-01",
					departureDateTo: "2027-03-01",
				}),
			})
		);
	});

	it("dispatches every missing range when navigation skips several months", async () => {
		const user = userEvent.setup();
		mocks.isLoadMoreNeeded.mockImplementation((startDate: Date) => startDate.getMonth() !== 11);
		mocks.visibleMonth = "far-forward";
		mocks.state.calendarFares.loadedRanges = [{ from: "2026-12-01", to: "2027-02-28" }];
		mocks.searchParams =
			"routes=NRT-SIN&departureDateFrom=2026-12-02&departureDateTo=2026-12-06&adult=1&childC=0&infant=0";
		mocks.getNextCalendarWindowRange.mockImplementation((fromDate: Date) => {
			const from = new Date(fromDate);
			const to = new Date(from.getFullYear(), from.getMonth() + 3, 0);
			const format = (date: Date) =>
				`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
			return { from: format(from), to: format(to) };
		});
		mocks.flightSelectionData.mockReturnValue(
			baseData({ selectedDateOutbound: "12-2", selectedDateInbound: "12-6" })
		);

		render(<FlightSelection locale="en" />);
		await user.click(screen.getByRole("button", { name: "date_selection_button_label" }));
		await user.click(screen.getByRole("button", { name: "change-visible-month" }));

		await waitFor(() => expect(mocks.fetchCalendarFares).toHaveBeenCalledTimes(2));
		expect(mocks.fetchCalendarFares.mock.calls).toEqual(
			expect.arrayContaining([
				expect.arrayContaining([
					expect.objectContaining({
						request: expect.objectContaining({
							departureDateFrom: "2027-03-01",
							departureDateTo: "2027-03-01",
						}),
					}),
				]),
				expect.arrayContaining([
					expect.objectContaining({
						request: expect.objectContaining({
							departureDateFrom: "2027-06-01",
							departureDateTo: "2027-06-01",
						}),
					}),
				]),
			])
		);
	});

	it("requests the previous aligned month start when navigating backward", async () => {
		const today = new Date();
		const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
		const user = userEvent.setup();
		mocks.isLoadMoreNeeded.mockImplementation((startDate: Date) => startDate.getMonth() !== 11);
		mocks.visibleMonth = "backward";
		mocks.state.calendarFares.loadedRanges = [{ from: "2026-12-01", to: "2027-02-28" }];
		mocks.searchParams =
			"routes=NRT-SIN&departureDateFrom=2026-12-02&departureDateTo=2026-12-06&adult=1&childC=0&infant=0";
		mocks.getNextCalendarWindowRange.mockImplementation((fromDate: Date) => ({
			from: `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-01`,
			to: "2027-02-28",
		}));
		mocks.flightSelectionData.mockReturnValue(
			baseData({ selectedDateOutbound: "12-2", selectedDateInbound: "12-6" })
		);

		render(<FlightSelection locale="en" />);
		await user.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		await user.click(screen.getByRole("button", { name: "change-visible-month" }));

		await waitFor(() => expect(mocks.fetchCalendarFares).toHaveBeenCalled());
		expect(mocks.fetchCalendarFares.mock.calls.at(-1)?.[0]).toEqual(
			expect.objectContaining({
				request: expect.objectContaining({
					departureDateFrom: todayString,
					departureDateTo: todayString,
				}),
			})
		);
	});

	it("uses child passenger type when child or infant exists in query params", async () => {
		mocks.searchParams =
			"routes=NRT-SIN&departureDateFrom=2026-08-25&departureDateTo=2026-08-28&adult=1&childC=1&infant=0";
		render(<FlightSelection locale="en" />);

		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));
		expect(screen.getByText("child")).toBeInTheDocument();
	});

	it("updates inbound menu date when no outbound cabin/date is selected", async () => {
		const data = baseData({
			tripType: "roundtrip",
			isRoundTrip: true,
			selectedDateOutbound: "",
			selectedCabinsOutbound: {},
			selectedDateInbound: "",
			mappedFlightsInbound: [flight],
			filteredFlightsInbound: [flight],
			selectedCabinsInbound: { "flight-inbound-0": "standard" },
		});
		mocks.flightSelectionData.mockReturnValue(data);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "change-inbound_label-date" }));

		expect(data.setSelectedDateInbound).toHaveBeenCalledWith("9-2");
		expect(mocks.setFlightSelectionRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateFrom: "2026-08-25",
				departureDateTo: "2026-09-02",
			})
		);
	});

	it("does not update inbound date when selected date is not after outbound date", async () => {
		const data = baseData({
			tripType: "roundtrip",
			isRoundTrip: true,
			selectedDateOutbound: "9-2",
			selectedDateInbound: "9-5",
			mappedFlightsInbound: [flight],
			filteredFlightsInbound: [flight],
			selectedCabinsInbound: { "flight-inbound-0": "standard" },
		});
		mocks.flightSelectionData.mockReturnValue(data);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "change-inbound_label-date" }));

		expect(data.setSelectedDateInbound).not.toHaveBeenCalledWith("9-2");
		expect(mocks.setFlightSelectionRequest).not.toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateTo: "2026-09-02",
			})
		);
	});

	it("requests calendar fares even for repeated request when previous request had an error", async () => {
		mocks.isLoadMoreNeeded.mockReturnValue(true);
		mocks.isSameCalendarRequest.mockReturnValue(true);
		mocks.state.calendarFares.request = { routes: "NRT-SIN" };
		mocks.state.calendarFares.error = { code: "FAILED" };

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		expect(mocks.fetchCalendarFares).toHaveBeenCalled();
	});

	it("does not request calendar fares when routes query is missing", async () => {
		mocks.searchParams =
			"departureDateFrom=2026-08-25&departureDateTo=2026-08-28&adult=1&childC=0&infant=0";
		mocks.isLoadMoreNeeded.mockReturnValue(true);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "date_selection_button_label" }));

		expect(mocks.fetchCalendarFares).not.toHaveBeenCalled();
	});

	it("uses default values for missing query parameters", async () => {
		mocks.searchParams = "routes=NRT-SIN";
		render(<FlightSelection locale="en" />);

		await userEvent.click(screen.getByRole("button", { name: "change-outbound_label-date" }));

		expect(mocks.setFlightSelectionRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				routes: "NRT-SIN",
				departureDateFrom: "",
				departureDateTo: undefined,
				adult: 0,
				childA: 0,
				childB: 0,
				childC: 0,
				infant: 0,
			})
		);
		expect(mocks.setFlightSelectionRequest).not.toHaveBeenCalledWith(
			expect.objectContaining({ departureDateFrom: "2026-09-02" })
		);
	});

	it("proceeds with connecting outbound when connection errors are empty", async () => {
		mocks.connectingErrors.mockReturnValue([]);
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				hasConnectingOutbound: true,
				selectedCabinsOutbound: { "flight-outbound-0-segment-0": "standard" },
				filteredFlightsOutbound: [{ ...flight, isConnectingFlight: true }],
				mappedFlightsOutbound: [{ ...flight, isConnectingFlight: true }],
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalled();
		expect(screen.getByText("passenger-dialog")).toBeInTheDocument();
	});

	it("returns empty breakdown when last selected cabin has non-numeric flight index", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: { "flight-outbound-not-a-number": "standard" },
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				flights: expect.objectContaining({
					outbound: expect.objectContaining({ passengerFareBreakdown: [] }),
				}),
			})
		);
	});

	it("returns empty breakdown when last selected cabin points to missing flight", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: { "flight-outbound-99": "standard" },
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				flights: expect.objectContaining({
					outbound: expect.objectContaining({ passengerFareBreakdown: [] }),
				}),
			})
		);
	});

	it("returns empty breakdown when connecting segment index is malformed", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				selectedCabinsOutbound: { "flight-outbound-0-segment-NaN": "standard" },
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(mocks.confirmFlightSelection).toHaveBeenCalledWith(
			expect.objectContaining({
				flights: expect.objectContaining({
					outbound: expect.objectContaining({ passengerFareBreakdown: [] }),
				}),
			})
		);
	});

	it("uses outbound-date fallback when selected outbound month-day is blank space", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				selectedDateOutbound: " ",
				selectedDateInbound: "9-5",
				mappedFlightsInbound: [flight],
				filteredFlightsInbound: [flight],
				selectedCabinsInbound: { "flight-inbound-0": "standard" },
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(screen.getByRole("button", { name: "change-inbound_label-date" }));

		expect(mocks.setFlightSelectionRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				departureDateFrom: "2026-08-25",
				departureDateTo: "2026-09-02",
			})
		);
	});

	it("opens emergency dialog when zipfullflat is selected on inbound cabins", async () => {
		mocks.flightSelectionData.mockReturnValue(
			baseData({
				tripType: "roundtrip",
				isRoundTrip: true,
				mappedFlightsInbound: [flight],
				filteredFlightsInbound: [flight],
				selectedDateInbound: "8-28",
				selectedCabinsInbound: { "flight-inbound-0": "zipfullflat" },
			})
		);

		render(<FlightSelection locale="en" />);
		await userEvent.click(
			screen.getByRole("button", { name: "proceed_to_enter_customer_info_button_label" })
		);

		expect(screen.getByText("emergency-dialog")).toBeInTheDocument();
	});
});
