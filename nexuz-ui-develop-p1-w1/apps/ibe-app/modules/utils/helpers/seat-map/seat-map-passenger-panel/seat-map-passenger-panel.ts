/**
 * File: seat-map-passenger-panel.helpers.ts
 * Description: Pure helper functions for formatting and deriving display data
 * used by the SeatMapPassengerPanel feature.
 */

import { SEAT_ELIGIBLE_BUNDLE_CODES } from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { BundleCode } from "@/types/passenger/passenger.type";
import type { PassengerSeatRow } from "@/types/seat-map/seat-map.types";

type TranslateFn = (key: string) => string;

/**
 * Returns true when the given bundle code qualifies the passenger for a
 * complimentary seat under the VALUE, PREMIUM or Flex Biz bundle rules.
 */
export function isBundleSeatEligible(bundleCode: string | undefined): boolean {
	if (!bundleCode) return false;
	return SEAT_ELIGIBLE_BUNDLE_CODES.has(bundleCode);
}

/** Maps each bundle code to its readable display label. move to prismic  Flex: FLBF*/
/**
 * Formats a passenger's first and last name into a single display string.
 * Returns an em dash when both values are empty.
 *
 * @param firstName - Passenger first name from the name store.
 * @param lastName  - Passenger last name from the name store.
 */
export function formatFullName(firstName: string, lastName: string): string {
	const parts = [firstName.trim(), lastName.trim()].filter(Boolean);
	return parts.length > 0 ? parts.join(" ") : "—";
}

/**
 * Returns the human-readable label for a given bundle code.
 * Returns undefined when no bundle code is supplied, which suppresses
 * the bundle in the passenger panel row.
 *
 * @param bundleCode - A BundleCode value or undefined.
 */
export function getBundleLabelFromCode(
	bundleCode: BundleCode | undefined,
	t: TranslateFn
): string | undefined {
	if (!bundleCode) return t("bundle_labels_no_bundle");

	switch (bundleCode) {
		case "NOBN":
			return t("bundle_labels_no_bundle");
		case "VALB":
			return t("bundle_labels_value");
		case "VALI":
			return t("bundle_labels_value");
		case "VALK":
			return t("bundle_labels_value");
		case "VALN":
			return t("bundle_labels_value");
		case "VALT":
			return t("bundle_labels_value");
		case "VALU":
			return t("bundle_labels_value");
		case "PREM":
			return t("bundle_labels_premium");
		case "PRMB":
			return t("bundle_labels_premium");
		case "PRMI":
			return t("bundle_labels_premium");
		case "PRMK":
			return t("bundle_labels_premium");
		case "PREN":
			return t("bundle_labels_premium");
		case "PRMT":
			return t("bundle_labels_premium");
		case "FLBF":
			return t("bundle_labels_flex_biz");
		case "FLBS":
			return t("bundle_labels_flex_biz");
	}
}

/**
 * Derives the flight route code (e.g. "NRT-BKK") from the confirmed
 * flight for the given booking direction. Returns an empty string when
 * the confirmed flight data is unavailable.
 *
 * @param confirmedFlight - The confirmed flight payload from Redux.
 * @param direction       - "outbound" or "inbound" booking flow direction.
 */
export function getFlightCode(
	confirmedFlight: ConfirmedFlightPayload | undefined,
	direction: BookingFlowDirection,
	selectedSegment?: SelectedSegment
): string {
	const activeSegment = selectedSegment;

	if (activeSegment) {
		return `${activeSegment.origin}-${activeSegment.destination}`;
	}

	const bound =
		direction === "inbound" ? confirmedFlight?.flights.inbound : confirmedFlight?.flights.outbound;
	const firstSegment = bound?.segments[0];
	if (!firstSegment) return "";

	return `${firstSegment.origin}-${firstSegment.destination}`;
}

/**
 * Returns the first passenger without a seat assignment.
 * Falls back to the first passenger when all passengers have seats.
 */
export function getFirstUnselectedPassengerIndex(passengers: PassengerSeatRow[]): number {
	const index = passengers.findIndex((passenger) => !passenger.seatCode);

	return index === -1 ? 0 : index;
}
