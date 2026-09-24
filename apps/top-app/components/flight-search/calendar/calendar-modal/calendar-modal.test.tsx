import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarContent from "./calendar-modal";

const mockUseSelector = vi.fn();
const mockDispatch = vi.fn(() => Promise.resolve());

vi.mock("next/navigation", () => ({
	useParams: () => ({ locale: "en" }),
}));

vi.mock("react-redux", () => ({
	useDispatch: () => mockDispatch,
	useSelector: (selector: (state: unknown) => unknown) => mockUseSelector(selector),
}));

vi.mock("@/modules/utils/helpers/calendar-fare/calendar-fare-utils", () => ({
	convertFaresToPrices: () => ({ "2026-07-10": "¥12,000" }),
	convertPromoFaresToPrices: () => ({ "2026-07-10": "¥10,000" }),
	getCalendarFaresBoundaryError: (
		error: { status: number; code?: string } | null | undefined
	): Error | null => {
		if (!error) {
			return null;
		}

		if (error.status === 404 && error.code === "NEXUZR002E051") {
			return new Error("CALENDAR_FARES_API_ERROR:NEXUZR002E051");
		}

		if (error.status >= 500 && error.status < 600) {
			return new Error("CALENDAR_FARES_API_ERROR:GENERIC");
		}

		return null;
	},
	getMonthDateRange: (year: number, month: number) => ({
		start: new Date(year, month, 1),
		end: new Date(year, month + 1, 0),
	}),
	getNextCalendarWindowRange: (fromDate: Date) =>
		fromDate.getMonth() === 9
			? { from: "2026-10-01", to: "2026-12-31" }
			: { from: "2026-07-01", to: "2026-09-30" },
	isLoadMoreNeeded: () => true,
	stringToDate: (value: string) => new Date(`${value}T00:00:00`),
}));

vi.mock("@/modules/utils/helpers/flight-search/flight-search.helpers", () => ({
	buildSearchRoutes: () => "NRT,BKK",
}));

vi.mock("@/store/slices/calendar-fares/calendar-fares.slice", () => ({
	fetchCalendarFares: (payload: unknown) => ({ type: "fetch", payload }),
	isSameCalendarRequest: () => false,
}));

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const messages: Record<string, string | Record<string, string>> = {
			dialog_title: "Date Selection",
			close_button_label: "Close date selection",
			error_titles: {
				travel_dates_error: "Please select a travel date.",
			},
		};

		const t = ((key: string) => {
			const parts = key.split(".");
			const sectionVal = parts[0] !== undefined ? messages[parts[0]] : undefined;
			const nestedKey = parts[1];
			if (!nestedKey) {
				return typeof sectionVal === "string" ? sectionVal : key;
			}

			return typeof sectionVal === "object" ? (sectionVal[nestedKey] ?? key) : key;
		}) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => {
			const parts = key.split(".");
			const sectionKey = parts[0];
			const nestedKey = parts[1];
			if (!sectionKey) return false;
			const section = messages[sectionKey];
			return Boolean(
				nestedKey ? typeof section === "object" && nestedKey in section : sectionKey in messages
			);
		};
		return t;
	},
}));

vi.mock("../date-selection-modal/date-selection-modal", () => ({
	default: ({
		onConfirm,
		onReset,
		onVisibleMonthChange,
	}: {
		onConfirm: (departure: Date, returnDate: Date) => void;
		onReset?: () => void;
		onVisibleMonthChange?: (visibleMonth: Date, secondVisibleMonth: Date) => void;
	}) => (
		<div>
			<button
				type="button"
				onClick={() => onConfirm(new Date("2026-07-10"), new Date("2026-07-12"))}
			>
				Confirm in modal
			</button>
			<button type="button" onClick={() => onReset?.()}>
				Reset in modal
			</button>
			<button
				type="button"
				onClick={() => onVisibleMonthChange?.(new Date(2026, 9, 1), new Date(2026, 10, 1))}
			>
				Navigate quickly
			</button>
		</div>
	),
}));

describe("CalendarContent", () => {
	it("dispatches fetch request and passes confirm/reset handlers", async () => {
		mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) =>
			selector({
				calendarFares: {
					outboundFares: {},
					inboundFares: {},
					loadedRanges: [],
					isPending: false,
					request: undefined,
					error: undefined,
				},
				flightSearchForm: {
					data: { origin: "NRT", destination: "BKK", promotionCode: "PROMO" },
				},
			})
		);

		const onConfirm = vi.fn();
		const onOpenChange = vi.fn();
		const onReset = vi.fn();

		render(
			<CalendarContent
				open={true}
				onOpenChange={onOpenChange}
				onConfirm={onConfirm}
				onReset={onReset}
				tripType="round-trip"
				origin="NRT"
				destination="BKK"
			/>
		);

		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalledWith({
				type: "fetch",
				payload: {
					request: {
						routes: "NRT,BKK",
						departureDateFrom: "2026-07-01",
						departureDateTo: "2026-07-01",
						language: "en",
						currency: "JPY",
						promotionCode: "PROMO",
					},
					loadedRange: { from: "2026-07-01", to: "2026-09-30" },
				},
			});
		});

		fireEvent.click(screen.getByText("Confirm in modal"));
		expect(onConfirm).toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledWith(false);

		fireEvent.click(screen.getByText("Reset in modal"));
		expect(onReset).toHaveBeenCalled();
	});

	it("fetches the next window while the initial request is still pending", async () => {
		mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) =>
			selector({
				calendarFares: {
					outboundFares: {},
					inboundFares: {},
					loadedRanges: [],
					isPending: true,
					request: undefined,
					error: undefined,
				},
				flightSearchForm: {
					data: { origin: "NRT", destination: "BKK", promotionCode: "PROMO" },
				},
			})
		);
		mockDispatch.mockClear();
		mockDispatch.mockImplementation(() => new Promise(() => undefined));

		render(
			<CalendarContent
				open={true}
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
				tripType="round-trip"
				origin="NRT"
				destination="BKK"
			/>
		);

		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalledTimes(1);
		});

		fireEvent.click(screen.getByText("Navigate quickly"));

		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalledTimes(2);
		});
		expect(mockDispatch).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				payload: expect.objectContaining({
					request: expect.objectContaining({
						departureDateFrom: "2026-10-01",
						departureDateTo: "2026-10-01",
					}),
				}),
			})
		);
		mockDispatch.mockImplementation(() => Promise.resolve());
	});

	it("skips fetch when origin/destination are unavailable", async () => {
		mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) =>
			selector({
				calendarFares: {
					outboundFares: {},
					inboundFares: {},
					loadedRanges: [],
					isPending: false,
					request: undefined,
					error: undefined,
				},
				flightSearchForm: {
					data: { origin: "", destination: "", promotionCode: "" },
				},
			})
		);

		mockDispatch.mockClear();

		render(
			<CalendarContent
				open={true}
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
				tripType="round-trip"
				origin=""
				destination=""
			/>
		);

		await waitFor(() => {
			expect(mockDispatch).not.toHaveBeenCalled();
		});
	});

	it("throws route error for supported calendar fare errors", () => {
		mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) =>
			selector({
				calendarFares: {
					outboundFares: {},
					inboundFares: {},
					loadedRanges: [],
					isPending: false,
					request: undefined,
					error: {
						status: 404,
						code: "NEXUZR002E051",
						description: "Requested Bound is not available",
						message: "Requested Bound is not available",
					},
				},
				flightSearchForm: {
					data: { origin: "NRT", destination: "BKK", promotionCode: "PROMO" },
				},
			})
		);

		expect(() =>
			render(
				<CalendarContent
					open={true}
					onOpenChange={vi.fn()}
					onConfirm={vi.fn()}
					tripType="round-trip"
					origin="NRT"
					destination="BKK"
				/>
			)
		).toThrow("CALENDAR_FARES_API_ERROR:NEXUZR002E051");
	});

	it("does not throw for unsupported 4xx calendar fare errors", async () => {
		mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) =>
			selector({
				calendarFares: {
					outboundFares: {},
					inboundFares: {},
					loadedRanges: [],
					isPending: false,
					request: undefined,
					error: {
						status: 404,
						code: "UNSUPPORTED",
						description: "Other error",
						message: "Other error",
					},
				},
				flightSearchForm: {
					data: { origin: "NRT", destination: "BKK", promotionCode: "PROMO" },
				},
			})
		);

		render(
			<CalendarContent
				open={true}
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
				tripType="round-trip"
				origin="NRT"
				destination="BKK"
			/>
		);

		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalled();
		});
	});

	it("throws route error for unsupported 5xx calendar fare errors", () => {
		mockUseSelector.mockImplementation((selector: (state: unknown) => unknown) =>
			selector({
				calendarFares: {
					outboundFares: {},
					inboundFares: {},
					loadedRanges: [],
					isPending: false,
					request: undefined,
					error: {
						status: 503,
						code: "UNSUPPORTED_500_ERROR",
						description: "Internal server error",
						message: "Internal server error",
					},
				},
				flightSearchForm: {
					data: { origin: "NRT", destination: "BKK", promotionCode: "PROMO" },
				},
			})
		);

		expect(() =>
			render(
				<CalendarContent
					open={true}
					onOpenChange={vi.fn()}
					onConfirm={vi.fn()}
					tripType="round-trip"
					origin="NRT"
					destination="BKK"
				/>
			)
		).toThrow("CALENDAR_FARES_API_ERROR:GENERIC");
	});
});
