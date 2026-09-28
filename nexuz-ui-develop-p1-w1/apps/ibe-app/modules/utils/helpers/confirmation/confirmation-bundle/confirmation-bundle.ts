/**
 * File: confirmation-bundles.ts
 * Utility functions and constants for confirmation bundle management,
 * including bundle availability checks, dialog state creation,
 * bundle selection validation, default no-bundle state generation,
 * and confirmation flow navigation helpers.
 */

import {
	NO_BUNDLE_ID,
	NO_BUNDLES_AVAILABLE_CODES,
} from "@/modules/utils/constants/bundle/bundle.constants";
import type {
	BookingFlowDirection,
	BookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { BundleDialogLabels, BundleId, BundleSelectionMap } from "@/types/bundle/bundle.types";
import type { ConfirmationBundleErrorState } from "@/types/confirmation/confirmation.types";
import type { PassengerBundle, PassengerValues } from "@/types/passenger/passenger.type";

function buildConfirmationBundleDialogState({
	labels,
	action,
	redirectUrl,
}: {
	labels: BundleDialogLabels;
	action: ConfirmationBundleErrorState["action"];
	redirectUrl?: string;
}): ConfirmationBundleErrorState {
	return {
		open: true,
		title: labels.title,
		content: labels.content,
		buttonLabel: labels.buttonLabel,
		action,
		redirectUrl,
	};
}

export function buildNoBundlesAvailableDialogState(
	labels: BundleDialogLabels
): ConfirmationBundleErrorState {
	return buildConfirmationBundleDialogState({ labels, action: "close" });
}

export function buildBundleSelectionUnavailableDialogState(
	labels: BundleDialogLabels,
	redirectUrl: string
): ConfirmationBundleErrorState {
	return buildConfirmationBundleDialogState({ labels, action: "returnToTop", redirectUrl });
}

export function isNoBundlesAvailableErrorCode(errorCode?: string): boolean {
	return NO_BUNDLES_AVAILABLE_CODES.has(errorCode?.toUpperCase() ?? "");
}

export function buildNoBundleSelectionState({
	passengerIds,
	lfid,
	pfid,
}: {
	passengerIds: string[];
	lfid: number;
	pfid?: number;
}): {
	selections: BundleSelectionMap;
	bundlesByPassenger: Array<{ passengerId: string; bundles: PassengerBundle[] }>;
} {
	const selections = Object.fromEntries(
		passengerIds.map((passengerId) => [passengerId, NO_BUNDLE_ID])
	) as BundleSelectionMap;

	return {
		selections,
		bundlesByPassenger: passengerIds.map((passengerId) => ({
			passengerId,
			bundles: [
				{
					lfid,
					pfid: pfid ?? 0,
					bundleCode: NO_BUNDLE_ID,
				},
			],
		})),
	};
}

export function hasInvalidConfirmationBundleSelection({
	storedPassengers,
	segmentLfid,
	availableBundleIds,
	bundleCapacities,
}: {
	storedPassengers: PassengerValues[];
	segmentLfid: number;
	availableBundleIds: Set<BundleId> | null;
	bundleCapacities: Map<BundleId, number> | null;
}): boolean {
	const selectedPassengerIdsByBundle = storedPassengers.reduce<Map<BundleId, string[]>>(
		(bundleMap, passenger) => {
			const bundleCode =
				passenger.bundles?.find((bundle) => bundle.lfid === segmentLfid)?.bundleCode ??
				NO_BUNDLE_ID;

			if (bundleCode === NO_BUNDLE_ID) {
				return bundleMap;
			}

			const selectedPassengerIds = bundleMap.get(bundleCode as BundleId) ?? [];
			selectedPassengerIds.push(passenger.id);
			bundleMap.set(bundleCode as BundleId, selectedPassengerIds);
			return bundleMap;
		},
		new Map<BundleId, string[]>()
	);

	return [...selectedPassengerIdsByBundle.entries()].some(([bundleCode, selectedPassengerIds]) => {
		if (availableBundleIds === null || !availableBundleIds.has(bundleCode)) {
			return true;
		}

		const capacity = bundleCapacities?.get(bundleCode) ?? 0;
		return capacity < selectedPassengerIds.length;
	});
}

/**
 * Builds the bundle selection route for the confirmation change flow.
 * Generates a localized bundle page URL that allows users to modify
 * their existing bundle selections from the booking confirmation page.
 */
export function buildConfirmationBundleChangePath({
	locale,
	stage,
}: {
	locale: string;
	stage: BookingStageSegment;
}): string {
	return `/${locale}/bundles/${stage}?changeFlow=confirmation`;
}

/**
 * Determines whether bundle selection is disabled for a specific
 * booking direction. Used to evaluate route-level restrictions
 * for outbound or inbound bundle selection flows.
 */
export function getBundleDirectionDisabled(
	disabledDirections: Partial<Record<BookingFlowDirection, boolean>>,
	direction: BookingFlowDirection
): boolean {
	return disabledDirections[direction] === true;
}
