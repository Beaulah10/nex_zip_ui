import { describe, expect, it } from "vitest";
import reducer, {
	clearFormData,
	setDraftFormData,
	setFormData,
} from "@/store/slices/flight-search-form/flight-search-form.slice";
import type { FlightSearchFormValues } from "@/types/flight-search/flight-search.types";

const formData: FlightSearchFormValues = {
	tripType: "round-trip",
	origin: "NRT",
	destination: "ICN",
	passengerCounts: {
		adult: 1,
		childA: 0,
		childB: 0,
		childC: 0,
		infant: 0,
	},
	travelDates: {
		outboundDate: "2026-10-01",
		returnDate: "2026-10-10",
	},
};

describe("flightSearchFormSlice", () => {
	it("returns initial state", () => {
		expect(reducer(undefined, { type: "unknown" })).toEqual({
			data: null,
			hasSubmittedSearch: false,
		});
	});

	it("stores draft form data without marking it as submitted", () => {
		const state = reducer(undefined, setDraftFormData(formData));
		expect(state.data).toEqual(formData);
		expect(state.hasSubmittedSearch).toBe(false);
	});

	it("sets submitted form data", () => {
		const state = reducer(undefined, setFormData(formData));
		expect(state.data).toEqual(formData);
		expect(state.hasSubmittedSearch).toBe(true);
	});

	it("clears form data", () => {
		const populated = reducer(undefined, setFormData(formData));
		const cleared = reducer(populated, clearFormData());

		expect(cleared.data).toBeNull();
		expect(cleared.hasSubmittedSearch).toBe(false);
	});
});
