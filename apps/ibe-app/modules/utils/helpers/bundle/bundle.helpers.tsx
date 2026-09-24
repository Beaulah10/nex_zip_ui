import type { NEXUZR004OffersBundleResponse } from "@repo/sdk";
import {
	ADULT_PASSENGER_TYPE_CODE_SET,
	BUNDLE_NAMES,
	BUNDLE_UNAVAILABLE_ERROR_CODE,
	NO_BUNDLE_ID,
} from "@/modules/utils/constants/bundle/bundle.constants";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { BundleId, BundleSelectionMap, PassengerEntry } from "@/types/bundle/bundle.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type { PassengerBundle } from "@/types/passenger/passenger.type";

/**
 * Resolves current flight segment used for bundle calculations based on booking stage.
 * Falls back to outbound segment when inbound is not present.
 */
export function getBundleSegment(
	confirmedFlight: ConfirmedFlightPayload | undefined,
	direction: BookingFlowDirection
) {
	if (!confirmedFlight) return undefined;

	const stage = getBookingStageSegment({ confirmedFlight, direction });

	if (stage === "segment1" || stage === "outbound") {
		return confirmedFlight.flights.outbound.segments[0];
	}

	if (stage === "segment2") {
		return (
			confirmedFlight.flights.inbound?.segments[0] ?? confirmedFlight.flights.outbound.segments[1]
		);
	}

	return (
		confirmedFlight.flights.inbound?.segments[0] ?? confirmedFlight.flights.outbound.segments[0]
	);
}
/**
 * Returns user-facing bundle name for one bundle code.
 */
export function getBundleName(bundleCode: BundleId): string {
	return BUNDLE_NAMES[bundleCode];
}

/**
 * Resolves available bundle IDs for active segment.
 * Offers response can contain multiple rows for same segment (for different fare contexts),
 * so final availability is intersection across all matching rows.
 * Returns null when prerequisites are missing, meaning availability is still unknown.
 */
export function getAvailableBundleIds(
	bundleOffersData: NEXUZR004OffersBundleResponse | undefined,
	confirmedFlight: ConfirmedFlightPayload | undefined,
	direction: BookingFlowDirection
): Set<BundleId> | null {
	const segment = getBundleSegment(confirmedFlight, direction);

	if (!bundleOffersData || !confirmedFlight || !segment) {
		return null;
	}

	const matchingSegments = bundleOffersData.data.filter((offer) => offer.lfid === segment.lfid);

	if (matchingSegments.length === 0) {
		return new Set<BundleId>();
	}

	const segmentBundleIdSets = matchingSegments.map(
		(segment) => new Set(segment.bundles.map((bundle) => bundle.bundleCode as BundleId))
	);

	const [firstSet, ...restSets] = segmentBundleIdSets as [Set<BundleId>, ...Set<BundleId>[]];
	const availableBundleIds = new Set(firstSet);

	// Keep only bundle IDs present in every matching segment row.
	for (const bundleId of availableBundleIds) {
		if (restSets.some((segmentBundleIds) => !segmentBundleIds.has(bundleId))) {
			availableBundleIds.delete(bundleId);
		}
	}

	return availableBundleIds;
}

export function isBundleUnavailable(
	bundleId: BundleId,
	availableBundleIds: Set<BundleId> | null
): boolean {
	if (bundleId === NO_BUNDLE_ID || availableBundleIds === null) {
		return false;
	}

	return !availableBundleIds.has(bundleId);
}

/**
 * Returns true when all sellable bundles are unavailable for current segment/context.
 */
export function isAllBundlesUnavailable(
	bundleOffersData: NEXUZR004OffersBundleResponse | undefined,
	availableBundleIds: Set<BundleId> | null,
	error?: string
): boolean {
	// Backend unavailable code is hard override even before availability set is resolved.
	const normalizedError = error?.toUpperCase() ?? "";
	if (normalizedError.includes(BUNDLE_UNAVAILABLE_ERROR_CODE)) return true;
	if (!bundleOffersData || availableBundleIds === null) return false;

	return ![...availableBundleIds].some((bundleId) => bundleId !== NO_BUNDLE_ID);
}

/**
 * Returns bundle IDs from requested list that are unavailable for current context.
 */
export function getUnavailableBundleIds(
	bundles: BundleId[],
	availableBundleIds: Set<BundleId> | null
): BundleId[] {
	if (availableBundleIds === null) return [];
	return bundles.filter((bundleId) => isBundleUnavailable(bundleId, availableBundleIds));
}

/**
 * Computes per-bundle inventory capacity for the active segment.
 * Uses ADULT/ADT passenger type only and keeps minimum available quantity across matching rows.
 */
export function getBundleCapacities(
	bundleOffersData: NEXUZR004OffersBundleResponse | undefined,
	confirmedFlight: ConfirmedFlightPayload | undefined,
	direction: BookingFlowDirection
): Map<BundleId, number> | null {
	const segment = getBundleSegment(confirmedFlight, direction);
	if (!bundleOffersData || !confirmedFlight || !segment) {
		return null;
	}

	const matchingSegments = bundleOffersData.data.filter((offer) => offer.lfid === segment.lfid);
	const capacities = new Map<BundleId, number>();

	for (const segment of matchingSegments) {
		for (const bundle of segment.bundles) {
			const adultPassengerType = bundle.passengerTypes.find((passengerType) => {
				const type = passengerType.type.trim().toLowerCase();
				return ADULT_PASSENGER_TYPE_CODE_SET.has(type);
			});
			if (!adultPassengerType) continue;

			const capacity = Math.min(
				adultPassengerType.actualQuantity,
				adultPassengerType.bundleQuantity
			);
			const bundleId = bundle.bundleCode as BundleId;
			const currentCapacity = capacities.get(bundleId);
			capacities.set(
				bundleId,
				currentCapacity === undefined ? capacity : Math.min(currentCapacity, capacity)
			);
		}
	}

	return capacities;
}

/**
 * Extracts adult bundle price map for active segment.
 * Always includes NOBN as zero for no-bundle baseline option.
 */
export function getBundlePrices(
	bundleOffersData: NEXUZR004OffersBundleResponse | undefined,
	confirmedFlight: ConfirmedFlightPayload | undefined,
	direction: BookingFlowDirection
): Partial<Record<BundleId, number>> {
	const currentSegment = getBundleSegment(confirmedFlight, direction);
	if (!bundleOffersData || !currentSegment) {
		return { [NO_BUNDLE_ID]: 0 };
	}

	const segment = bundleOffersData.data.find((offer) => offer.lfid === currentSegment.lfid);
	const prices: Partial<Record<BundleId, number>> = { [NO_BUNDLE_ID]: 0 };

	for (const bundle of segment?.bundles ?? []) {
		const adultType = bundle.passengerTypes.find((passengerType) => {
			const passengerTypeCode = passengerType.type.trim().toLowerCase();
			return ADULT_PASSENGER_TYPE_CODE_SET.has(passengerTypeCode);
		});

		if (adultType) {
			prices[bundle.bundleCode as BundleId] = adultType.amount;
		}
	}

	return prices;
}

/**
 * Resolves locale string from Next.js route param value.
 */
export function getLocaleFromParam(localeParam?: string | string[]): string {
	if (Array.isArray(localeParam)) {
		return localeParam[0] ?? "en";
	}

	return localeParam ?? "en";
}

/**
 * Checks whether passenger type code should be treated as adult.
 */
export function isAdultPassengerTypeCode(passengerTypeCode?: string): boolean {
	const normalized = passengerTypeCode?.toLowerCase();
	if (!normalized) return false;
	return ADULT_PASSENGER_TYPE_CODE_SET.has(normalized);
}

/**
 * Creates passenger display name falling back to Passenger {n} when empty.
 */
export function getPassengerDisplayName(
	passenger: {
		firstName?: string;
		middleName?: string;
		lastName?: string;
	},
	index: number
): string {
	const fullName = [passenger.lastName, passenger.firstName, passenger.middleName]
		.filter(Boolean)
		.join(" ")
		.trim();

	return fullName.length > 0 ? fullName : `Passenger ${index + 1}`;
}

/**
 * Returns true when any flight segment touches requested airport code.
 */
export function isRouteConnectedToAirport(
	confirmedFlight: ConfirmedFlightPayload | undefined,
	airportCode: string
): boolean {
	if (!confirmedFlight) return false;

	const segments = [
		...confirmedFlight.flights.outbound.segments,
		...(confirmedFlight.flights.inbound?.segments ?? []),
	];

	return segments.some(
		(segment) => segment.origin === airportCode || segment.destination === airportCode
	);
}

/**
 * Applies one bundle selection across passenger entries while respecting bundle capacity.
 */
export function applyBundleToAll(
	passengers: PassengerEntry[],
	value: BundleId,
	bundleCapacity: number | null,
	onSelectionChange: (id: string, value: BundleId) => void
): void {
	let assigned = 0;
	for (const entry of passengers) {
		if (entry.kind === "passenger") {
			if (bundleCapacity === null || assigned < bundleCapacity) {
				onSelectionChange(entry.id, value);
				assigned += 1;
			} else {
				onSelectionChange(entry.id, NO_BUNDLE_ID);
			}
		} else {
			for (const passenger of entry.passengers) {
				onSelectionChange(passenger.id, NO_BUNDLE_ID);
			}
		}
	}
}

/**
 * Builds selected bundle payload for one flight direction.
 */
export function buildSelectedBundle({
	passengers,
	confirmedFlight,
	outbound,
	inbound,
	direction,
}: {
	passengers: Passenger[];
	confirmedFlight: ConfirmedFlightPayload;
	outbound: BundleSelectionMap;
	inbound: BundleSelectionMap;
	direction: BookingFlowDirection;
}): { passengers: { id: string; bundles: PassengerBundle[] }[] } {
	const segment = getBundleSegment(confirmedFlight, direction);
	const selection = direction === "inbound" ? inbound : outbound;

	if (!segment) {
		throw new Error("Unable to build selected bundles: stage segment is missing");
	}

	return {
		passengers: passengers.map((passenger) => ({
			id: passenger.id,
			bundles: [
				{
					lfid: segment.lfid,
					pfid: segment.pfid,
					bundleCode: selection[passenger.id] ?? "NOBN",
				},
			],
		})),
	};
}
