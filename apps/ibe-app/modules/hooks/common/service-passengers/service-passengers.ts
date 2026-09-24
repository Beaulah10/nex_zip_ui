/**
 * File: use-service-passengers.ts
 * Description: Custom hook that prepares passenger service data for ancillary
 * service customization flows. It enriches passenger information with
 * direction-specific bundle details, service entitlements, display names,
 * and bundle-related features, providing a normalized passenger list for
 * inflight meals and other service selection experiences
 * **/

import { useMemo } from "react";
import { isValueBundleCode } from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import { isICNRoute } from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	type BookingFlowDirection,
	getBookingFlowType,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { useAppSelector } from "@/store/hooks";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import { selectPassengers } from "@/store/slices/passenger/passenger.slice";
import { usePassengerOrder } from "../passenger-order/passenger-order";

type BundleDetails = {
	bundleLabel: string;
	mealFeatures?: string[];
	baggageFeatures?: string[];
};

const DEFAULT_BUNDLE_DETAILS: BundleDetails = {
	bundleLabel: "nobundle_label",
	baggageFeatures: ["baggage_feature_carryon_no_bundle"],
};

const FLEXBIZ_BUNDLE: BundleDetails = {
	bundleLabel: "flexbiz_label",
	baggageFeatures: ["baggage_feature_carryon_bundle"],
};

const VALUE_BUNDLE: BundleDetails = {
	bundleLabel: "value_label",
	mealFeatures: ["meal_feature"],
	baggageFeatures: ["baggage_feature_carryon_no_bundle", "baggage_feature_checkin"],
};

const PREMIUM_BUNDLE: BundleDetails = {
	bundleLabel: "premium_label",
	mealFeatures: ["meal_feature"],
	baggageFeatures: ["baggage_feature_carryon_bundle", "baggage_feature_checkin"],
};

const BUNDLE_CODE_LABEL_MAP: Record<string, BundleDetails> = {
	NOBN: DEFAULT_BUNDLE_DETAILS,
	FLBF: FLEXBIZ_BUNDLE,
	FLBS: FLEXBIZ_BUNDLE,
	PREM: PREMIUM_BUNDLE,
	PREN: PREMIUM_BUNDLE,
	PRMB: PREMIUM_BUNDLE,
	PRMI: PREMIUM_BUNDLE,
	PRMK: PREMIUM_BUNDLE,
	PRMT: PREMIUM_BUNDLE,
	VALB: VALUE_BUNDLE,
	VALI: VALUE_BUNDLE,
	VALK: VALUE_BUNDLE,
	VALN: VALUE_BUNDLE,
	VALT: VALUE_BUNDLE,
	VALU: VALUE_BUNDLE,
};

function getDisplayPassengerName(passenger: { id: string; firstName?: string; lastName?: string }) {
	const name = [passenger.lastName, passenger.firstName]
		.map((part) => part?.trim() ?? "")
		.filter((part) => part.length > 0)
		.join(" ");

	return name.length > 0 ? name : passenger.id;
}

/**
 * Returns ordered passengers enriched with a display name and the bundle label
 * matching the given booking flow direction (outbound or inbound).
 *
 * Bundle label is derived from the selected bundle codes for the segments that
 * belong to the requested direction.  Falls back to "No Bundle" when no
 * matching bundle entry exists.
 */
export function useServicePassengers(direction: BookingFlowDirection) {
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const passengers = useAppSelector(selectPassengers);
	const { orderedPassengersWithNames } = usePassengerOrder();
	const bookingFlowType = getBookingFlowType(confirmedFlight);
	const isConnectingFlight = bookingFlowType === "connecting";

	const directionSegments = useMemo(() => {
		if (!confirmedFlight) {
			return [];
		}
		const outboundSegments = confirmedFlight.flights.outbound.segments;
		if (isConnectingFlight) {
			const connectingSegmentIndex = direction === "outbound" ? 0 : 1;
			const connectingSegment = confirmedFlight.flights.outbound.segments[connectingSegmentIndex];
			return connectingSegment ? [connectingSegment] : [];
		}

		if (direction === "outbound") {
			return outboundSegments;
		}

		return confirmedFlight.flights.inbound?.segments ?? [];
	}, [confirmedFlight, direction, isConnectingFlight]);

	// Creates a set of segment LFIDs for the selected flight direction (outbound or inbound) to enable quick bundle matching.
	const directionSegmentLfids = useMemo(() => {
		return new Set(directionSegments.map((segment) => segment.lfid));
	}, [directionSegments]);

	const isCurrentDirectionICNRoute = useMemo(
		() => isICNRoute(directionSegments),
		[directionSegments]
	);

	// Creates a mapping of each passenger ID to the bundleCode of the bundle that belongs to the current direction (matching lfid).
	const bundleCodeByPassengerId = useMemo(
		() =>
			Object.fromEntries(
				passengers.map((passenger) => {
					const bundleCode =
						passenger.bundles?.find((bundle) => directionSegmentLfids.has(bundle.lfid))
							?.bundleCode ?? "NOBN";
					return [passenger.id, bundleCode];
				})
			),
		[directionSegmentLfids, passengers]
	);

	// Builds passenger service details by combining passenger information with bundle-based labels and features for the current flight direction.
	const servicePassengers = useMemo(
		() =>
			orderedPassengersWithNames.map((passenger) => {
				const bundleCode = bundleCodeByPassengerId[passenger.id] ?? "NOBN";
				const bundleDetails = BUNDLE_CODE_LABEL_MAP[bundleCode] ?? DEFAULT_BUNDLE_DETAILS;
				const isValueBundle = isValueBundleCode(bundleCode);
				const isICNValueException = isCurrentDirectionICNRoute && isValueBundle;

				return {
					id: passenger.id,
					name: getDisplayPassengerName(passenger),
					bundleCode,
					bundleLabel: bundleDetails.bundleLabel,
					mealfeatures: isICNValueException ? [] : (bundleDetails.mealFeatures ?? []),
					baggagefeatures: bundleDetails.baggageFeatures ?? [],
					passengerTypeCode: passenger.passengerTypeCode,
					isIcnRoute: isCurrentDirectionICNRoute,
					isValueBundle,
				};
			}),
		[bundleCodeByPassengerId, isCurrentDirectionICNRoute, orderedPassengersWithNames]
	);

	return { servicePassengers };
}
