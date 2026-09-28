/**
 * File: test-utils.tsx
 * Description: Shared test utilities for customer-information component tests.
 * Provides renderWithProviders, renderWithFormAndProviders, and factory helpers.
 */

import { configureStore } from "@reduxjs/toolkit";
import { type RenderOptions, type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { toPassengerValues as mapToPassengerValues } from "@/modules/utils/helpers/passenger-name/passenger-data/passenger-data";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import passengerReducer from "@/store/slices/customer-information/customer-information.slice";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import flightSelectionReducer from "@/store/slices/flight-selection/flight-selection.slice";
import passengerNameReducer, {
	type PassengerValues,
} from "@/store/slices/passenger/passenger.slice";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type { FlightSelectionRequest } from "@/types/flight-selection/flight-selection.types";

function toPassengerValues(passengers: Passenger[]): PassengerValues[] {
	return passengers.map((passenger) =>
		mapToPassengerValues(passenger as unknown as Record<string, unknown>)
	);
}

// ── Store factory ─────────────────────────────────────────────────────────────

export function makeTestStore(passengers: Passenger[] = []) {
	const passengerValues = toPassengerValues(passengers);

	const request: FlightSelectionRequest = {
		routes: "NRT,SFO",
		departureDateFrom: "2030-01-01",
		adult: 1,
		childA: 0,
		childB: 0,
		childC: 0,
		infant: 0,
	};

	const confirmedFlight: ConfirmedFlightPayload = {
		tripType: "oneway",
		currency: "USD",
		language: "en",
		grandTotalAmount: 123,
		selectedCabinsOutbound: {},
		selectedCabinsInbound: {},
		flights: {
			outbound: {
				totalFlightAmount: 123,
				selectedFareInfos: [],
				passengerFareBreakdown: [],
				segments: [
					{
						pfid: 1,
						lfid: 1,
						carrierCode: "XX",
						origin: "NRT",
						destination: "SFO",
						flightNumber: "1",
						scheduledDepartureArrivalDateTime: {
							departureDateTime: "2030-01-01T00:00:00",
							departureDateTimeOffset: "2030-01-01T00:00:00+09:00",
							arrivalDateTime: "2030-01-01T08:00:00",
							arrivalDateTimeOffset: "2030-01-01T08:00:00-08:00",
						},
						flightTime: "8h",
						selectedCabin: "economy",
						fareDetails: [],
					},
				],
			},
		},
	};

	return configureStore({
		reducer: {
			customerInformation: passengerReducer,
			passenger: passengerNameReducer,
			flightSelection: flightSelectionReducer,
		},
		preloadedState: {
			customerInformation: { values: passengers, submitted: false },
			passenger: { passengers: passengerValues, submitted: false },
			flightSelection: {
				isPending: false,
				request,
				confirmedFlight,
			},
		},
	});
}

// ── Passenger fixture ─────────────────────────────────────────────────────────

export function makePassenger(overrides: Partial<Passenger> = {}): Passenger {
	return {
		id: "pax-1",
		passengerTypeCode: "adult",
		title: "MR",
		firstName: "JOHN",
		middleName: "",
		lastName: "SMITH",
		dateOfBirth: { year: "1990", month: "06", day: "15" },
		gender: "male",
		weight: "",
		height: "",
		nationality: "JPN",
		associateWithPassengerId: undefined,
		redressNumber: "",
		knownTravelerNumber: "",
		isCompleted: false,
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
			destinationAddress: {},
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
		...overrides,
	} as Passenger;
}

// ── renderWithProviders ───────────────────────────────────────────────────────

type WithStoreOptions = RenderOptions & { passengers?: Passenger[] };
type StoreRenderResult = RenderResult & { store: ReturnType<typeof makeTestStore> };

export function renderWithProviders(
	ui: ReactElement,
	{ passengers = [], ...options }: WithStoreOptions = {}
): StoreRenderResult {
	const store = makeTestStore(passengers);
	function Wrapper({ children }: { readonly children: ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}
	return { ...render(ui, { wrapper: Wrapper, ...options }), store } as StoreRenderResult;
}

// ── renderWithFormAndProviders ────────────────────────────────────────────────

type WithFormOptions = WithStoreOptions & {
	formValues?: Partial<PassengerInformation>;
};

export function renderWithFormAndProviders(
	ui: ReactElement,
	{ passengers = [], formValues = {}, ...options }: WithFormOptions = {}
): StoreRenderResult {
	const store = makeTestStore(passengers);
	function Wrapper({ children }: { readonly children: ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				lastName: "",
				firstName: "",
				middleName: "",
				gender: "" as PassengerInformation["gender"],
				dateOfBirth: { year: "", month: "", day: "" },
				nationality: "",
				countryOfResidence: "",
				bodyWeight: "",
				bodyHeight: "",
				passportNumber: "",
				passportExpiryDate: { year: "", month: "", day: "" },
				phoneExtension: "+81",
				phoneNumber: "",
				emergencyExtension: "+1",
				emergencyNumber: "",
				email: "",
				emailConfirmation: "",
				hasTravelDocs: false,
				isPregnant: false,
				pregnancyWeeks: "",
				requestingAssistance: false,
				assistanceReasons: [],
				...formValues,
			},
		});
		return (
			<Provider store={store}>
				<FormProvider {...methods}>{children}</FormProvider>
			</Provider>
		);
	}
	return { ...render(ui, { wrapper: Wrapper, ...options }), store } as StoreRenderResult;
}
