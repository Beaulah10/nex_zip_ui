import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { searchCalendarFaresGetBySdk } from "@/modules/services/calendar-fare-service/calendar-fares.service";

export interface FareDateEntry {
	date: string;
	baseFareForPromotion?: number;
	lowestPrice: number;
}

export interface BoundFareData {
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
	from: string;
	to: string;
}

export interface CalendarFaresRequest {
	routes: string;
	departureDateFrom: string;
	departureDateTo?: string;
	language: string;
	currency: string;
	promotionCode?: string;
}

export interface CalendarFaresState {
	outboundFares: FareDataByDate;
	inboundFares: FareDataByDate;
	loadedRanges: DateRange[];
	request?: CalendarFaresRequest;
	isPending: boolean;
	error?: string;
}

function createInitialState(): CalendarFaresState {
	return {
		outboundFares: {},
		inboundFares: {},
		loadedRanges: [],
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

function normalizeFareDateKey(rawDate: string): string {
	const trimmed = rawDate.trim();
	if (!trimmed) return "";

	if (trimmed.includes("T")) {
		return trimmed.split("T")[0] ?? "";
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
		return trimmed;
	}

	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}

	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export const fetchCalendarFares = createAsyncThunk<
	CalendarFaresResponse,
	{ locale: string; request: CalendarFaresRequest; loadedRange: DateRange },
	{ rejectValue: string }
>("calendarFares/fetch", async ({ locale, request }, thunkApi) => {
	try {
		const response = await searchCalendarFaresGetBySdk(locale, request);
		return response;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unable to fetch calendar fares";
		return thunkApi.rejectWithValue(errorMessage);
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
				state.isPending = true;
				state.error = undefined;
			})
			.addCase(fetchCalendarFares.fulfilled, (state, action) => {
				if (!state.request || !isSameCalendarRequest(state.request, action.meta.arg.request)) {
					return;
				}

				const data = action.payload.data;

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
				state.isPending = false;
			})
			.addCase(fetchCalendarFares.rejected, (state, action) => {
				if (!state.request || !isSameCalendarRequest(state.request, action.meta.arg.request)) {
					return;
				}

				state.error = action.payload ?? action.error.message ?? "Unable to fetch calendar fares";
				state.isPending = false;
			});
	},
});

export const { resetCalendarFares, addLoadedRange } = calendarFaresSlice.actions;
export default calendarFaresSlice.reducer;
