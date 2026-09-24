import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { searchCalendarFaresGetBySdk } from "@/modules/services/calendar-fare-service/calendar-fares.service";
import {
	type CalendarFaresApiError,
	getCalendarFaresApiError,
	normalizeCalendarFaresApiError,
} from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";

export interface FareDateEntry {
	date: string; // YYYY-MM-DD
	baseFareForPromotion?: number;
	lowestPrice: number;
}

export interface BoundFareData {
	/** Cabin code from backend (expected: STANDARD, ZIPFULLFLAT). */
	cabin: string;
	dates: FareDateEntry[];
}

export interface CalendarFaresResponse {
	data: {
		outbound: BoundFareData[];
		inbound?: BoundFareData[];
	};
}

export interface FareDataByDate {
	[date: string]: {
		standard?: number;
		standardPromo?: number;
		zipFullFlat?: number;
		zipFullFlatPromo?: number;
	};
}

export interface DateRange {
	from: string; // YYYY-MM-DD
	to: string; // YYYY-MM-DD
}

export interface CalendarFaresRequest {
	routes: string; // e.g., "NRT,BKK"
	departureDateFrom: string; // YYYY-MM-DD
	departureDateTo?: string; // YYYY-MM-DD for round-trip inbound
	language: string;
	currency: string;
	promotionCode?: string;
}

export interface CalendarFaresState {
	outboundFares: FareDataByDate;
	inboundFares: FareDataByDate;
	loadedRanges: DateRange[];
	request?: CalendarFaresRequest;
	pendingRequestIds: string[];
	isPending: boolean;
	error?: CalendarFaresApiError;
}

function createInitialState(): CalendarFaresState {
	/** Compares two request payloads to prevent stale data from being merged. */
	return {
		outboundFares: {},
		inboundFares: {},
		loadedRanges: [],
		pendingRequestIds: [],
		isPending: false,
	};
}

const initialState = createInitialState();

export function isSameCalendarRequest(left: CalendarFaresRequest, right: CalendarFaresRequest) {
	return (
		left.routes === right.routes &&
		left.departureDateFrom === right.departureDateFrom &&
		left.departureDateTo === right.departureDateTo &&
		left.language === right.language &&
		left.currency === right.currency &&
		left.promotionCode === right.promotionCode
	);
}

function isSameCalendarRequestContext(left: CalendarFaresRequest, right: CalendarFaresRequest) {
	return (
		left.routes === right.routes &&
		left.language === right.language &&
		left.currency === right.currency &&
		left.promotionCode === right.promotionCode &&
		(left.departureDateTo === undefined) === (right.departureDateTo === undefined)
	);
}

function normalizeFareDateKey(rawDate: string): string {
	const trimmed = rawDate.trim();
	if (!trimmed) return "";

	// API may return full datetime (e.g. 2026-07-01T00:00:00Z); calendar keys are YYYY-MM-DD.
	if (trimmed.includes("T")) {
		return trimmed.split("T")[0] ?? "";
	}

	// Accept already-normalized date keys as-is.
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
		return trimmed;
	}

	// Fallback: parse any other format and normalize in local date components.
	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}

	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/** Fetches calendar fares for a request window. */
export const fetchCalendarFares = createAsyncThunk<
	CalendarFaresResponse,
	{ request: CalendarFaresRequest; loadedRange: DateRange },
	{ rejectValue: CalendarFaresApiError }
>("calendarFares/fetch", async ({ request }, thunkApi) => {
	try {
		console.info("[calendar-fares][thunk] dispatch request", {
			request,
		});
		const response = await searchCalendarFaresGetBySdk(request);
		console.info("[calendar-fares][thunk] fulfilled", {
			request,
		});
		return response;
	} catch (error) {
		console.info("[calendar-fares][thunk] rejected", {
			request,
			error: error instanceof Error ? error.message : String(error),
		});
		return thunkApi.rejectWithValue(getCalendarFaresApiError(error));
	}
});

const calendarFaresSlice = createSlice({
	name: "calendarFares",
	initialState,
	reducers: {
		resetCalendarFares: () => createInitialState(),
		addLoadedRange: (state, action: PayloadAction<DateRange>) => {
			state.loadedRanges.push(action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCalendarFares.pending, (state, action) => {
				state.request = action.meta.arg.request;
				if (action.meta.requestId) {
					state.pendingRequestIds.push(action.meta.requestId);
				}
				state.isPending = true;
				state.error = undefined;
			})
			.addCase(fetchCalendarFares.fulfilled, (state, action) => {
				if (action.meta.requestId) {
					state.pendingRequestIds = state.pendingRequestIds.filter(
						(requestId) => requestId !== action.meta.requestId
					);
				}
				state.isPending = state.pendingRequestIds.length > 0;

				if (
					!state.request ||
					!isSameCalendarRequestContext(state.request, action.meta.arg.request)
				) {
					return;
				}

				const data = action.payload.data;

				// Process outbound fares
				if (data?.outbound) {
					for (const bound of data.outbound) {
						if (!bound?.dates) {
							continue;
						}

						for (const entry of bound.dates) {
							if (!entry?.date) {
								continue;
							}

							const normalizedDate = normalizeFareDateKey(entry.date);
							if (!normalizedDate) {
								continue;
							}

							if (!state.outboundFares[normalizedDate]) {
								state.outboundFares[normalizedDate] = {};
							}

							const fareKey = bound.cabin === "STANDARD" ? "standard" : "zipFullFlat";
							const promoFareKey =
								bound.cabin === "STANDARD" ? "standardPromo" : "zipFullFlatPromo";

							if (
								typeof entry.baseFareForPromotion === "number" &&
								entry.baseFareForPromotion !== entry.lowestPrice
							) {
								const regularFare = Math.max(entry.baseFareForPromotion, entry.lowestPrice);
								const promoFare = Math.min(entry.baseFareForPromotion, entry.lowestPrice);
								state.outboundFares[normalizedDate][fareKey] = regularFare;
								state.outboundFares[normalizedDate][promoFareKey] = promoFare;
							} else {
								state.outboundFares[normalizedDate][fareKey] = entry.lowestPrice;
							}
						}
					}
				}

				// Process inbound fares
				if (data?.inbound) {
					for (const bound of data.inbound) {
						if (!bound?.dates) {
							continue;
						}

						for (const entry of bound.dates) {
							if (!entry?.date) {
								continue;
							}

							const normalizedDate = normalizeFareDateKey(entry.date);
							if (!normalizedDate) {
								continue;
							}

							if (!state.inboundFares[normalizedDate]) {
								state.inboundFares[normalizedDate] = {};
							}

							const fareKey = bound.cabin === "STANDARD" ? "standard" : "zipFullFlat";
							const promoFareKey =
								bound.cabin === "STANDARD" ? "standardPromo" : "zipFullFlatPromo";

							if (
								typeof entry.baseFareForPromotion === "number" &&
								entry.baseFareForPromotion !== entry.lowestPrice
							) {
								const regularFare = Math.max(entry.baseFareForPromotion, entry.lowestPrice);
								const promoFare = Math.min(entry.baseFareForPromotion, entry.lowestPrice);
								state.inboundFares[normalizedDate][fareKey] = regularFare;
								state.inboundFares[normalizedDate][promoFareKey] = promoFare;
							} else {
								state.inboundFares[normalizedDate][fareKey] = entry.lowestPrice;
							}
						}
					}
				}

				state.loadedRanges.push(action.meta.arg.loadedRange);
			})
			.addCase(fetchCalendarFares.rejected, (state, action) => {
				if (action.meta.requestId) {
					state.pendingRequestIds = state.pendingRequestIds.filter(
						(requestId) => requestId !== action.meta.requestId
					);
				}
				state.isPending = state.pendingRequestIds.length > 0;

				if (
					!state.request ||
					!isSameCalendarRequestContext(state.request, action.meta.arg.request)
				) {
					return;
				}

				state.error =
					action.payload ??
					normalizeCalendarFaresApiError({
						status: 500,
						message: action.error.message ?? "Unable to fetch calendar fares",
					});
			});
	},
});

export const { resetCalendarFares, addLoadedRange } = calendarFaresSlice.actions;
export default calendarFaresSlice.reducer;
