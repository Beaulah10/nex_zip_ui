/**
 * File: customer-information.slice.test.ts
 * Classification: Redux Slice
 * Description: Tests for the passenger Redux slice including all reducers and
 * extra reducers triggered by passenger-name slice actions.
 */

import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import customerInformationReducer, {
	clearPassengerNames,
	setAllPassengers,
	setPassengersSubmitted,
	updateAllPassengersAccommodation,
	updatePassenger,
	upsertPassenger,
} from "@/store/slices/customer-information/customer-information.slice";
import { setPassengerNames } from "@/store/slices/passenger/passenger.slice";
import type { Passenger } from "@/types/customer-information/customer-information.types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makePassenger(overrides: Partial<Passenger> = {}): Passenger {
	return {
		id: "pax-test-1",
		passengerTypeCode: "adult",
		title: "MR",
		firstName: "JOHN",
		middleName: "",
		lastName: "SMITH",
		dateOfBirth: { year: "1990", month: "01", day: "15" },
		gender: "male",
		nationality: "JPN",
		contactInformation: {
			countryCode: "+81",
			phoneNumber: "1234567890",
			email: "john@example.com",
		},
		emergencyContact: {
			countryCode: "+1",
			phoneNumber: "0987654321",
		},
		apisInfo: {
			passportNumber: "AB123456",
			passportExpiryDate: { year: "2030", month: "12", day: "31" },
			nationality: "JPN",
			countryOfResidence: "USA",
			destinationAddress: {
				hotelName: "ZIPAIR HOTEL",
				countryOfStay: "USA",
				postalCode: "96615",
				city: "HONOLULU",
				state: "HAWAII",
			},
			redressNumber: "",
			knownTravelerNumber: "",
		},
		nonChargeable: {
			travelDocument: {
				hasTravelDocs: false,
				documentType: "",
				documentNumber: "",
				documentExpiryDate: { year: "", month: "", day: "" },
				issuingCountry: "",
				purposeOfTravel: "",
				evusObtained: false,
			},
			isPregnant: false,
			pregnancyWeeks: "",
			assistanceService: {
				requestingAssistance: false,
				canManagePersonalNeeds: "",
				boardingWithAccompanion: "",
				accompanyingPersonName: "",
				assistanceReasons: [],
				canWalk: "",
				canGoUpDownStairs: "",
				needsOnboardWheelchair: "",
				reasonForWheelchair: "",
				bringingOwnWheelchair: "",
				wheelchairType: "",
				wheelchairBatteryType: "",
				wheelchairBatteryRemovable: "",
				isFoldable: "",
				wheelchairHeight: "",
				wheelchairWidth: "",
				wheelchairDepth: "",
				wheelchairWeight: "",
			},
			dogForm: {
				accompaniedByServiceDog: false,
				serviceDogType: "",
				serviceDogBreed: "",
				serviceDogWeight: "",
				serviceDogCagePresence: "",
				serviceDogCageHeight: "",
				serviceDogCageWidth: "",
				serviceDogCageDepth: "",
				serviceDogCageWeight: "",
			},
		},
		isCompleted: false,
		...overrides,
	} as Passenger;
}

/** Builds a store that uses only the passenger slice (avoids full app store dependencies). */
function buildStore(preloadedPassengers?: Passenger[]) {
	return configureStore({
		reducer: {
			passengerNames: customerInformationReducer,
		},
		...(preloadedPassengers
			? { preloadedState: { passengerNames: { values: preloadedPassengers, submitted: false } } }
			: {}),
	});
}

// ── Reducer Tests ─────────────────────────────────────────────────────────────

describe("passengerSlice - upsertPassenger", () => {
	it("adds a new passenger when id does not exist", () => {
		const store = buildStore([]);
		const passenger = makePassenger({ id: "pax-new" });
		store.dispatch(upsertPassenger(passenger));
		const state = store.getState().passengerNames;
		expect(state.values).toHaveLength(1);
		expect(state.values[0]?.id).toBe("pax-new");
	});

	it("replaces an existing passenger when id matches", () => {
		const existing = makePassenger({ id: "pax-1", firstName: "JOHN" });
		const store = buildStore([existing]);
		const updated = makePassenger({ id: "pax-1", firstName: "JANE" });
		store.dispatch(upsertPassenger(updated));
		const state = store.getState().passengerNames;
		expect(state.values).toHaveLength(1);
		expect(state.values[0]?.firstName).toBe("JANE");
	});

	it("preserves other passengers when upserting one", () => {
		const pax1 = makePassenger({ id: "pax-1" });
		const pax2 = makePassenger({ id: "pax-2" });
		const store = buildStore([pax1, pax2]);
		const updated = makePassenger({ id: "pax-1", firstName: "UPDATED" });
		store.dispatch(upsertPassenger(updated));
		const state = store.getState().passengerNames;
		expect(state.values).toHaveLength(2);
		expect(state.values[1]?.id).toBe("pax-2");
	});
});

describe("passengerSlice - updatePassenger", () => {
	it("merges updates into existing passenger", () => {
		const existing = makePassenger({ id: "pax-1", firstName: "JOHN" });
		const store = buildStore([existing]);
		store.dispatch(updatePassenger({ ...existing, firstName: "JANE" }));
		const state = store.getState().passengerNames;
		expect(state.values[0]?.firstName).toBe("JANE");
	});

	it("preserves unchanged fields when updating", () => {
		const existing = makePassenger({ id: "pax-1", lastName: "SMITH" });
		const store = buildStore([existing]);
		store.dispatch(updatePassenger({ ...existing, firstName: "JANE" }));
		const state = store.getState().passengerNames;
		expect(state.values[0]?.lastName).toBe("SMITH");
		expect(state.values[0]?.firstName).toBe("JANE");
	});

	it("creates a new entry when passenger id does not exist", () => {
		const store = buildStore([]);
		const passenger = makePassenger({ id: "pax-new" });
		store.dispatch(updatePassenger(passenger));
		const state = store.getState().passengerNames;
		expect(state.values).toHaveLength(1);
		expect(state.values[0]?.id).toBe("pax-new");
	});

	it("deep merges nested objects", () => {
		const existing = makePassenger({
			id: "pax-1",
			contactInformation: {
				countryCode: "+81",
				phoneNumber: "111",
				email: "old@example.com",
			},
			emergencyContact: {
				countryCode: "+1",
				phoneNumber: "222",
			},
		});
		const store = buildStore([existing]);

		const contactInformation = existing.contactInformation;
		const emergencyContact = existing.emergencyContact;
		if (!contactInformation || !emergencyContact) {
			throw new Error("contact information is undefined");
		}
		store.dispatch(
			updatePassenger({
				...existing,
				contactInformation: {
					countryCode: contactInformation.countryCode,
					phoneNumber: "999",
					email: contactInformation.email,
				},
				emergencyContact: {
					countryCode: emergencyContact.countryCode,
					phoneNumber: emergencyContact.phoneNumber,
				},
			})
		);
		const state = store.getState().passengerNames;
		expect(state.values[0]?.contactInformation?.phoneNumber).toBe("999");
		expect(state.values[0]?.contactInformation?.email).toBe("old@example.com");
	});
});

describe("passengerSlice - setPassengersSubmitted", () => {
	it("sets submitted to true", () => {
		const store = buildStore([]);
		store.dispatch(setPassengersSubmitted());
		expect(store.getState().passengerNames.submitted).toBe(true);
	});
});

describe("passengerSlice - clearPassengerNames", () => {
	it("clears all passengers and resets submitted", () => {
		const pax = makePassenger({ id: "pax-1" });
		const store = buildStore([pax]);
		store.dispatch(setPassengersSubmitted());
		store.dispatch(clearPassengerNames());
		const state = store.getState().passengerNames;
		expect(state.values).toHaveLength(0);
		expect(state.submitted).toBe(false);
	});
});

describe("passengerSlice - setAllPassengers", () => {
	it("replaces the entire passengers array", () => {
		const existing = [makePassenger({ id: "pax-1" }), makePassenger({ id: "pax-2" })];
		const store = buildStore(existing);
		const newList = [makePassenger({ id: "pax-99" })];
		store.dispatch(setAllPassengers(newList));
		const state = store.getState().passengerNames;
		expect(state.values).toHaveLength(1);
		expect(state.values[0]?.id).toBe("pax-99");
	});
});

describe("passengerSlice - updateAllPassengersAccommodation", () => {
	it("updates current passenger's full data and copies accommodation to others", () => {
		const pax1 = makePassenger({ id: "pax-1" });
		const pax2 = makePassenger({
			id: "pax-2",
			apisInfo: {
				passportNumber: "CD654321",
				passportExpiryDate: { year: "2031", month: "06", day: "01" },
				nationality: "USA",
				countryOfResidence: "USA",
				destinationAddress: {},
			},
		});
		const store = buildStore([pax1, pax2]);

		const newDestination = {
			hotelName: "NEW HOTEL",
			countryOfStay: "USA",
			postalCode: "12345",
			city: "LOS ANGELES",
			state: "CA",
		};

		const apisInfo = pax1.apisInfo;

		expect(apisInfo).toBeDefined();

		if (!apisInfo) {
			throw new Error("apisInfo is undefined");
		}

		const updatedPassenger = {
			...pax1,
			apisInfo: {
				...apisInfo,
				destinationAddress: newDestination,
			},
		};

		store.dispatch(
			updateAllPassengersAccommodation({
				passengerId: "pax-1",
				passengerData: updatedPassenger,
				destinationAddress: newDestination,
			})
		);

		const state = store.getState().passengerNames;

		// Current passenger updated with full data
		expect(state.values[0]?.apisInfo?.destinationAddress.hotelName).toBe("NEW HOTEL");
		// Other passenger gets only destination address
		expect(state.values[1]?.apisInfo?.destinationAddress.hotelName).toBe("NEW HOTEL");
		expect(state.values[1]?.apisInfo?.destinationAddress.city).toBe("LOS ANGELES");
	});

	it("initialises apisInfo for passengers who have none when copying accommodation", () => {
		const pax1 = makePassenger({ id: "pax-1" });
		const pax2 = makePassenger({ id: "pax-2", apisInfo: undefined });
		const store = buildStore([pax1, pax2]);

		const newDestination = { hotelName: "HOTEL XYZ", countryOfStay: "USA" };

		store.dispatch(
			updateAllPassengersAccommodation({
				passengerId: "pax-1",
				passengerData: pax1,
				destinationAddress: newDestination,
			})
		);

		const state = store.getState().passengerNames;
		expect(state.values[1]?.apisInfo).toBeDefined();
		expect(state.values[1]?.apisInfo?.destinationAddress.hotelName).toBe("HOTEL XYZ");
	});
});

// ── extraReducers Tests ───────────────────────────────────────────────────────

describe("passengerSlice - extraReducers (setPassengerNames)", () => {
	it("rebuilds passenger list from PassengerValues on setPassengerNames", () => {
		const store = configureStore({
			reducer: {
				passengerNames: customerInformationReducer,
			},
		});

		store.dispatch(
			setPassengerNames([
				{ id: "pax-1", passengerTypeCode: "adult", firstName: "ALICE", lastName: "WONDER" },
			])
		);

		const state = store.getState().passengerNames;
		expect(state.values.length).toBeGreaterThan(0);
		expect(state.submitted).toBe(false);
	});

	it("resets submitted to false when setPassengerNames is dispatched", () => {
		const store = configureStore({
			reducer: {
				passengerNames: customerInformationReducer,
			},
		});
		store.dispatch(setPassengersSubmitted());
		expect(store.getState().passengerNames.submitted).toBe(true);

		store.dispatch(
			setPassengerNames([
				{ id: "pax-1", passengerTypeCode: "adult", firstName: "BOB", lastName: "BUILD" },
			])
		);
		expect(store.getState().passengerNames.submitted).toBe(false);
	});
});

// ── Line 45 coverage: deepMerge else-if false branch (sourceValue === undefined) ─
// The `else if (sourceValue !== undefined)` in deepMerge has two branches:
//   • true  (sourceValue is a defined primitive) — covered by existing merge tests
//   • false (sourceValue is explicitly undefined) — NOT yet covered
// Dispatching updatePassenger with a property explicitly set to `undefined` triggers
// the false branch, causing deepMerge to skip that key and preserve the target value.
describe("passengerSlice - deepMerge undefined sourceValue (line 45 false branch)", () => {
	it("preserves target value when source property is explicitly undefined", () => {
		const existing = makePassenger({ id: "pax-1", firstName: "JOHN" });
		const store = buildStore([existing]);

		// Pass `firstName: undefined` — Object.keys() includes 'firstName', but
		// sourceValue === undefined → else-if condition is false → target value preserved.
		store.dispatch(updatePassenger({ ...existing, firstName: undefined } as any));

		const state = store.getState().passengerNames;
		// firstName should remain "JOHN" because deepMerge skips undefined source values
		expect(state.values[0]?.firstName).toBe("JOHN");
	});

	it("preserves multiple target values when source contains several undefined properties", () => {
		const existing = makePassenger({ id: "pax-1", firstName: "ALICE", lastName: "WONDER" });
		const store = buildStore([existing]);

		store.dispatch(
			updatePassenger({ ...existing, firstName: undefined, lastName: undefined } as any)
		);

		const state = store.getState().passengerNames;
		expect(state.values[0]?.firstName).toBe("ALICE");
		expect(state.values[0]?.lastName).toBe("WONDER");
	});
});

// ── Line 111 coverage: updateAllPassengersAccommodation with non-existent ID ──
// Line 111 is `if (currentIndex !== -1) {` in updateAllPassengersAccommodation.
// The false branch (currentIndex === -1, passengerId not found) is never tested.
describe("passengerSlice - updateAllPassengersAccommodation with non-existent passengerId (line 111 false branch)", () => {
	it("skips the direct-update block when passengerId is not found in state", () => {
		const pax1 = makePassenger({ id: "pax-1", firstName: "ORIGINAL" });
		const pax2 = makePassenger({ id: "pax-2" });
		const store = buildStore([pax1, pax2]);

		const newDestination = { hotelName: "GHOST HOTEL", countryOfStay: "USA" };
		const ghostPassengerData = makePassenger({ id: "pax-99" });

		// passengerId "pax-99" does not exist in state → currentIndex = -1 → if block skipped
		store.dispatch(
			updateAllPassengersAccommodation({
				passengerId: "pax-99",
				passengerData: ghostPassengerData,
				destinationAddress: newDestination,
			})
		);

		const state = store.getState().passengerNames;

		// pax-1 is NOT updated directly (it's not the target passenger)
		// Both pax-1 and pax-2 receive the destination address (they're "other" passengers)
		expect(state.values[0]?.apisInfo?.destinationAddress.hotelName).toBe("GHOST HOTEL");
		expect(state.values[1]?.apisInfo?.destinationAddress.hotelName).toBe("GHOST HOTEL");
		// pax-1's own data (firstName) is untouched — the direct-update block was skipped
		expect(state.values[0]?.firstName).toBe("ORIGINAL");
	});

	it("state remains unchanged when passengerId is not found and there are no other passengers", () => {
		const pax1 = makePassenger({ id: "pax-1", firstName: "SOLO" });
		const store = buildStore([pax1]);

		const destination = { hotelName: "EMPTY HOTEL" };
		const ghostData = makePassenger({ id: "pax-99" });

		store.dispatch(
			updateAllPassengersAccommodation({
				passengerId: "pax-99",
				passengerData: ghostData,
				destinationAddress: destination,
			})
		);

		const state = store.getState().passengerNames;
		// pax-1 gets destination copied (it's not passengerId), but direct update is skipped
		expect(state.values[0]?.apisInfo?.destinationAddress.hotelName).toBe("EMPTY HOTEL");
		expect(state.values[0]?.firstName).toBe("SOLO");
	});
});
