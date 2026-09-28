import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { BAGGAGE_CATEGORY_MAP } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import { toPassengerValues } from "@/modules/utils/helpers/passenger-name/passenger-data/passenger-data";
import type { RootState } from "@/store";
import { updatePassenger } from "@/store/slices/customer-information/customer-information.slice";
import type { DestinationAddress } from "@/types/customer-information/customer-information.types";
import {
	createPassengerServiceGroups,
	PASSENGER_SERVICE_CATEGORIES,
	type PassengerBundle,
	type PassengerNameState,
	type PassengerSeat,
	type PassengerService,
	type PassengerServiceCategory,
	type PassengerServiceGroups,
	type PassengerValues,
} from "@/types/passenger/passenger.type";

export type { PassengerNameState, PassengerValues };

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: PassengerNameState = {
	passengers: [],
	submitted: false,
};

function flattenPassengerServices(services?: PassengerServiceGroups): PassengerService[] {
	return PASSENGER_SERVICE_CATEGORIES.flatMap((category) => services?.[category] ?? []);
}

function flattenPassengerServicesByCategory(
	services: PassengerServiceGroups | undefined,
	category: PassengerServiceCategory
): PassengerService[] {
	return services?.[category] ?? [];
}

function getPassengerById(
	state: PassengerNameState,
	passengerId: string
): PassengerValues | undefined {
	return state.passengers.find((passenger) => passenger.id === passengerId);
}

function upsertArrayItem<T>(items: T[], index: number, nextItem: T): void {
	if (index >= 0) {
		items[index] = nextItem;
		return;
	}

	items.push(nextItem);
}

function upsertPassengerServiceGroups(
	services: PassengerServiceGroups | undefined,
	service: PassengerService,
	serviceCategory: PassengerServiceCategory = "non-chargeable"
): PassengerServiceGroups {
	const nextServices = createPassengerServiceGroups(services);
	const bucket = nextServices[serviceCategory] ?? [];
	//baggage services should always append
	if (
		serviceCategory === "baggage" &&
		(service.ssrCode === "BAGN" || service.categoryId === BAGGAGE_CATEGORY_MAP.SPORTS)
	) {
		bucket.push(service);

		nextServices[serviceCategory] = bucket;

		return nextServices;
	}
	const index = bucket.findIndex(
		(entry) =>
			entry.lfid === service.lfid &&
			entry.ssrCode === service.ssrCode &&
			entry.serviceID === service.serviceID
	);

	if (index >= 0) {
		bucket[index] = service;
	} else {
		bucket.push(service);
	}

	nextServices[serviceCategory] = bucket;

	return nextServices;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const passengerSlice = createSlice({
	name: "passenger",
	initialState,
	reducers: {
		/** Called on successful form submission. Saves data to Redux store only. */
		setPassengerNames(state, action: PayloadAction<PassengerValues[]>) {
			state.passengers = action.payload.map((passenger) => {
				const currentPassenger = state.passengers.find(
					(existingPassenger) => existingPassenger.id === passenger.id
				);

				return toPassengerValues(passenger as unknown as Record<string, unknown>, currentPassenger);
			});
			state.submitted = true;
		},

		// ── Seats ────────────────────────────────────────────────────────────

		/** Replace seat array for a passenger on a specific leg. */
		setSeats(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				seats: PassengerSeat[];
			}>
		) {
			const { passengerId, lfid, seats } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const others = (passenger.seats ?? []).filter((s) => s.lfid !== lfid);
			passenger.seats = [...others, ...seats];
		},

		/** Append or replace a seat (same lfid+pfid) for a passenger on a specific leg. */
		addSeat(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				seat: PassengerSeat;
			}>
		) {
			const { passengerId, lfid, seat } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const seats = passenger.seats ?? [];
			const index = seats.findIndex((s) => s.lfid === lfid && s.pfid === seat.pfid);
			upsertArrayItem(seats, index, seat);
			passenger.seats = seats;
		},

		/** Partial merge a seat by lfid+pfid for a passenger on a specific leg. */
		updateSeat(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				seat: PassengerSeat;
			}>
		) {
			const { passengerId, lfid, seat } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const seats = passenger.seats ?? [];
			const index = seats.findIndex((s) => s.lfid === lfid && s.pfid === seat.pfid);
			if (index >= 0) {
				upsertArrayItem(seats, index, {
					...seats[index],
					...seat,
				} as PassengerSeat);
			}
			passenger.seats = seats;
		},

		/** Remove a seat by passengerId + lfid + pfid. */
		removeSeat(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				pfid: number;
			}>
		) {
			const { passengerId, lfid, pfid } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			passenger.seats = (passenger.seats ?? []).filter(
				(s) => !(s.lfid === lfid && s.pfid === pfid)
			);
		},

		/** Wipe seats for a passenger on a specific leg. */
		clearSeats(state, action: PayloadAction<{ passengerId: string; lfid: number }>) {
			const { passengerId, lfid } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			passenger.seats = (passenger.seats ?? []).filter((s) => s.lfid !== lfid);
		},

		/** Wipe seats for specific passengers, optionally scoped to a specific leg. */
		clearSeatsForPassengers(
			state,
			action: PayloadAction<{ passengerIds: string[]; lfid?: number }>
		) {
			const { passengerIds, lfid } = action.payload;

			for (const passengerId of passengerIds) {
				const passenger = getPassengerById(state, passengerId);
				if (!passenger) continue;

				if (lfid === undefined) {
					passenger.seats = [];
					continue;
				}

				passenger.seats = (passenger.seats ?? []).filter((seat) => seat.lfid !== lfid);
			}
		},

		// ── Bundles ──────────────────────────────────────────────────────────

		/** Replace bundle array for a passenger on a specific leg. */
		setBundles(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				bundles: PassengerBundle[];
			}>
		) {
			const { passengerId, lfid, bundles } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const others = (passenger.bundles ?? []).filter((b) => b.lfid !== lfid);
			passenger.bundles = [...others, ...bundles];
		},

		/** Merge a bundle entry by passengerId + lfid + pfid. */
		updateBundle(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				bundle: PassengerBundle;
			}>
		) {
			const { passengerId, lfid, bundle } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const bundles = passenger.bundles ?? [];
			const index = bundles.findIndex((b) => b.lfid === lfid && b.pfid === bundle.pfid);
			if (index >= 0) {
				upsertArrayItem(bundles, index, {
					...bundles[index],
					...bundle,
				} as PassengerBundle);
			}
			passenger.bundles = bundles;
		},

		/** Wipe bundles for a passenger on a specific leg. */
		clearBundles(state, action: PayloadAction<{ passengerId: string; lfid: number }>) {
			const { passengerId, lfid } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			passenger.bundles = (passenger.bundles ?? []).filter((b) => b.lfid !== lfid);
		},

		// ── Services ─────────────────────────────────────────────────────────

		/** Append or replace a service (same lfid+ssrCode+serviceID) for a passenger. */
		addService(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				serviceCategory: PassengerServiceCategory;
				service: PassengerService;
			}>
		) {
			const { passengerId, lfid, service, serviceCategory } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const normalizedService: PassengerService = { ...service, lfid };
			passenger.services = upsertPassengerServiceGroups(
				passenger.services,
				normalizedService,
				serviceCategory
			);
		},

		/** Remove a service by passengerId + lfid + ssrCode + serviceID.
		 *
		 * When serviceID is provided:
		 * Removes services matching lfid + ssrCode + serviceID.
		 *
		 * When serviceID is omitted:
		 * Removes all services matching lfid + ssrCode.
		 */
		removeService(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				ssrCode: string;
				serviceID?: number;
			}>
		) {
			const { passengerId, lfid, ssrCode, serviceID } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const nextServices = createPassengerServiceGroups(passenger.services);
			for (const category of PASSENGER_SERVICE_CATEGORIES) {
				nextServices[category] = (nextServices[category] ?? []).filter((service) => {
					if (service.lfid !== lfid || service.ssrCode !== ssrCode) {
						return true;
					}
					if (serviceID !== undefined) {
						return service.serviceID !== serviceID;
					}
					return false;
				});
			}
			passenger.services = nextServices;
		},

		/** Partial merge a service by passengerId + lfid + ssrCode + serviceID. */
		updateService(
			state,
			action: PayloadAction<{
				passengerId: string;
				lfid: number;
				service: PassengerService;
			}>
		) {
			const { passengerId, service } = action.payload;
			const passenger = getPassengerById(state, passengerId);
			if (!passenger) return;
			const currentServices = flattenPassengerServices(passenger.services);
			const index = currentServices.findIndex(
				(s) =>
					s.lfid === service.lfid &&
					s.ssrCode === service.ssrCode &&
					s.serviceID === service.serviceID
			);
			const nextService =
				index >= 0 ? ({ ...currentServices[index], ...service } as PassengerService) : service;
			passenger.services = upsertPassengerServiceGroups(passenger.services, nextService);
		},

		/** Wipe all services across all passengers. */
		clearServices(state) {
			for (const passenger of state.passengers) {
				passenger.services = createPassengerServiceGroups();
			}
		},

		/** Wipe services for specific passengers, optionally scoped to a specific leg. */
		clearServicesForPassengers(
			state,
			action: PayloadAction<{ passengerIds: string[]; lfid?: number }>
		) {
			const { passengerIds, lfid } = action.payload;

			for (const passengerId of passengerIds) {
				const passenger = getPassengerById(state, passengerId);
				if (!passenger) continue;

				if (lfid === undefined) {
					passenger.services = createPassengerServiceGroups();
					continue;
				}

				const nextServices = createPassengerServiceGroups(passenger.services);
				for (const category of PASSENGER_SERVICE_CATEGORIES) {
					nextServices[category] = (nextServices[category] ?? []).filter(
						(service) => service.lfid !== lfid
					);
				}

				passenger.services = nextServices;
			}
		},

		// ── Extras ───────────────────────────────────────────────────────────

		/** Add or replace an extra service for a passenger (matched by lfid+ssrCode). */
		addExtrasService(
			state,
			action: PayloadAction<{ passengerId: string; service: PassengerService }>
		) {
			const { passengerId, service } = action.payload;
			const passenger = state.passengers.find((p) => p.id === passengerId);
			if (!passenger) return;
			const nextServices = createPassengerServiceGroups(passenger.services);
			const extras = nextServices.extras ?? [];
			const index = extras.findIndex(
				(s) => s.ssrCode === service.ssrCode && s.lfid === service.lfid
			);
			if (index >= 0) {
				extras[index] = service;
			} else {
				extras.push(service);
			}
			nextServices.extras = extras;
			passenger.services = nextServices;
		},

		/** Remove an extra service for a passenger by lfid+ssrCode. */
		removeExtrasService(
			state,
			action: PayloadAction<{ passengerId: string; lfid: number; ssrCode: string }>
		) {
			const { passengerId, lfid, ssrCode } = action.payload;
			const passenger = state.passengers.find((p) => p.id === passengerId);
			if (!passenger) return;
			const nextServices = createPassengerServiceGroups(passenger.services);
			nextServices.extras = (nextServices.extras ?? []).filter(
				(s) => !(s.ssrCode === ssrCode && s.lfid === lfid)
			);
			passenger.services = nextServices;
		},

		/** Clear all extras services across all passengers. */
		clearAllExtras(state) {
			for (const passenger of state.passengers) {
				const nextServices = createPassengerServiceGroups(passenger.services);
				nextServices.extras = [];
				passenger.services = nextServices;
			}
		},
		/** Stores committed total for top-bar display. */
		setCommittedPassengerSelectionsTotal(state, action: PayloadAction<number>) {
			state.committedSelectionsTotal = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(updatePassenger, (state, action) => {
			state.passengers = state.passengers.map((p) =>
				p.id === action.payload.id
					? toPassengerValues(action.payload as unknown as Record<string, unknown>, p)
					: p
			);
			state.submitted = true;
		});
	},
});

export const {
	setPassengerNames,
	setSeats,
	addSeat,
	updateSeat,
	removeSeat,
	clearSeats,
	clearSeatsForPassengers,
	setBundles,
	updateBundle,
	clearBundles,
	addService,
	removeService,
	updateService,
	clearServices,
	clearServicesForPassengers,
	addExtrasService,
	removeExtrasService,
	clearAllExtras,
	setCommittedPassengerSelectionsTotal,
} = passengerSlice.actions;

// ── Helpers ─────────────────────────────────────────────────────────────────

const isDestinationAddressComplete = (destinationAddress?: DestinationAddress): boolean => {
	if (!destinationAddress) {
		return false;
	}

	return Boolean(
		destinationAddress.hotelName?.trim() &&
			destinationAddress.countryOfStay?.trim() &&
			destinationAddress.postalCode?.trim() &&
			destinationAddress.city?.trim() &&
			destinationAddress.state?.trim()
	);
};

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectHasIncompleteDestinationAddress = (state: RootState): boolean => {
	const passengers = state.passenger.passengers;

	if (!passengers.length) {
		return true;
	}

	return passengers.some(
		(passenger) => !isDestinationAddressComplete(passenger.apisInfo?.destinationAddress)
	);
};

export const selectPassengers = (state: RootState): PassengerValues[] => state.passenger.passengers;

export const selectPassengerById = (state: RootState, id: string): PassengerValues | undefined =>
	state.passenger.passengers.find((p) => p.id === id);

/** All services for a passenger, optionally filtered to a specific leg. */
export const selectServicesByPassengerId = (
	state: RootState,
	id: string,
	lfid?: number
): PassengerService[] => {
	const services = flattenPassengerServices(
		state.passenger.passengers.find((p) => p.id === id)?.services
	);
	return lfid !== undefined ? services.filter((s) => s.lfid === lfid) : services;
};

/** Flatten all services across all passengers. */
export const selectAllPassengerServices = (state: RootState): PassengerService[] =>
	state.passenger.passengers.flatMap((p) => flattenPassengerServices(p.services));

/**
 * All services across all passengers for a specific category, optionally
 * filtered to a specific leg.
 */
export const selectAllPassengerServicesByCategoryAndLfid = (
	state: RootState,
	category: PassengerServiceCategory,
	lfid?: number
): PassengerService[] => {
	const services = state.passenger.passengers.flatMap((p) =>
		flattenPassengerServicesByCategory(p.services, category)
	);

	return lfid !== undefined ? services.filter((service) => service.lfid === lfid) : services;
};

/** All bundles for a passenger, optionally filtered to a specific leg. */
export const selectBundlesByPassengerId = (
	state: RootState,
	id: string,
	lfid?: number
): PassengerBundle[] => {
	const bundles = state.passenger.passengers.find((p) => p.id === id)?.bundles ?? [];
	return lfid !== undefined ? bundles.filter((b) => b.lfid === lfid) : bundles;
};

/** Flatten all bundles across all passengers. */
export const selectAllPassengerBundles = (state: RootState): PassengerBundle[] =>
	state.passenger.passengers.flatMap((p) => p.bundles ?? []);

/** Total amount committed by page-level proceed/confirm actions. */
export const selectCommittedPassengerSelectionsTotalValue = (
	state: RootState
): number | undefined => state.passenger.committedSelectionsTotal;

/** Total amount committed by page-level proceed/confirm actions. */
export const selectCommittedPassengerSelectionsTotal = (state: RootState): number =>
	state.passenger.committedSelectionsTotal ?? 0;

/** Total amount of all selected bundles across passengers. */
export const selectPassengerBundleTotal = (state: RootState): number =>
	state.passenger.passengers.reduce(
		(sum, passenger) =>
			sum +
			(passenger.bundles ?? []).reduce(
				(bundleTotal, bundle) =>
					bundleTotal + (bundle.amount ?? bundle.bundleCategory?.amount ?? 0),
				0
			),
		0
	);
/** All seats for a passenger, optionally filtered to a specific leg. */
export const selectSeatsByPassengerId = (
	state: RootState,
	id: string,
	lfid?: number
): PassengerSeat[] => {
	const seats = state.passenger.passengers.find((p) => p.id === id)?.seats ?? [];
	return lfid !== undefined ? seats.filter((s) => s.lfid === lfid) : seats;
};

// ── Extras selectors ──────────────────────────────────────────────────────────

/** Total amount of all extras services across all passengers, optionally filtered to a specific leg. */
export const selectExtrasTotal = (state: RootState, lfid?: number): number =>
	state.passenger.passengers.reduce((sum, p) => {
		const extras = flattenPassengerServicesByCategory(p.services, "extras");
		const filtered = lfid !== undefined ? extras.filter((e) => e.lfid === lfid) : extras;
		return sum + filtered.reduce((s, e) => s + e.amount, 0);
	}, 0);

/** Total chargeable ancillary amount (all service categories + seats) for a specific leg. */
export const selectAncillaryTotalByLfid = (state: RootState, lfid?: number): number => {
	const chargeableCategories: PassengerServiceCategory[] = [
		"meals",
		"baggage",
		"lounge",
		"express",
		"travel",
	];

	const servicesTotal = state.passenger.passengers.reduce((sum, p) => {
		for (const category of chargeableCategories) {
			const services = p.services?.[category] ?? [];
			const filtered = lfid !== undefined ? services.filter((s) => s.lfid === lfid) : services;
			sum += filtered.reduce(
				(s, service) =>
					s +
					(category === "meals" ? (service.applicableAmount ?? service.amount) : service.amount),
				0
			);
		}
		return sum;
	}, 0);

	const seatsTotal = state.passenger.passengers.reduce((sum, p) => {
		const seats = p.seats ?? [];
		const filtered = lfid !== undefined ? seats.filter((s) => s.lfid === lfid) : seats;
		return sum + filtered.reduce((s, seat) => s + (seat.applicableAmount ?? seat.amount), 0);
	}, 0);

	return servicesTotal + seatsTotal;
};
/** Total amount of all current passenger selections used for commit-on-proceed flow. */
export const selectPassengerSelectionsTotal = (state: RootState): number =>
	selectPassengerBundleTotal(state) + selectAncillaryTotalByLfid(state) + selectExtrasTotal(state);

/** Commits current passenger selections total by reading existing totals from store selectors. */
export const commitPassengerSelectionsTotal =
	() => (dispatch: (action: PayloadAction<number>) => void, getState: () => RootState) => {
		dispatch(setCommittedPassengerSelectionsTotal(selectPassengerSelectionsTotal(getState())));
	};
/** IDs of passengers who have a specific extra selected (matched by ssrCode). */
export const selectExtrasPassengerIdsByProduct = (state: RootState, ssrCode: string): string[] =>
	state.passenger.passengers
		.filter((p) =>
			flattenPassengerServicesByCategory(p.services, "extras").some((s) => s.ssrCode === ssrCode)
		)
		.map((p) => p.id);

export default passengerSlice.reducer;
