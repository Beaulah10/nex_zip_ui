/**
 * File: confirmation-tax.ts
 * Utility functions for building confirmation tax breakdowns, passenger-wise tax summaries,
 * and fare totals used on the booking confirmation screen.
 */

import type { SelectedFlightBound } from "@/store/slices/flight-selection/flight-selection.slice";
import type { TaxRowData, TaxSubItem } from "@/types/confirmation/confirmation.types";
import type { FareInfo, PassengerWiseTax } from "@/types/flight-selection/flight-selection.types";

export type TaxPassengerCategoryLabels = {
	adult: string;
	childA: string;
	childB: string;
	childC: string;
	infant: string;
};

const TAX_PASSENGER_DISPLAY_ORDER = ["adult", "childA", "childB", "childC", "infant"] as const;

function getTaxPassengerCategoryLabel(
	passengerType: string,
	labels: TaxPassengerCategoryLabels
): string | undefined {
	switch (passengerType.toLowerCase()) {
		case "adult":
		case "adt":
			return labels.adult;
		case "childa":
		case "chd":
			return labels.childA;
		case "childb":
			return labels.childB;
		case "childc":
			return labels.childC;
		case "infant":
		case "inf":
			return labels.infant;
		default:
			return undefined;
	}
}

function formatTaxTitle(taxCode?: string, description?: string): string {
	const cleanTaxCode = taxCode?.trim();
	const cleanDescription = description?.trim();

	if (cleanTaxCode && cleanDescription) {
		return cleanDescription.startsWith(`${cleanTaxCode}:`)
			? cleanDescription
			: `${cleanTaxCode}: ${cleanDescription}`;
	}

	return cleanDescription || cleanTaxCode || "";
}

function buildPassengerWiseTaxSubItems(
	passengerWiseTaxes: PassengerWiseTax[],
	labels: TaxPassengerCategoryLabels
): TaxSubItem[] {
	const totalsByType = new Map<string, { count: number; amount: number }>();

	for (const passengerTax of passengerWiseTaxes) {
		const normalizedType = passengerTax.passengerType?.toLowerCase();
		if (!normalizedType) {
			continue;
		}

		const passengerCountFromSdk = (passengerTax as PassengerWiseTax & { passengerCount?: number })
			.passengerCount;
		const passengerCount =
			typeof passengerTax.count === "number"
				? passengerTax.count
				: typeof passengerCountFromSdk === "number"
					? passengerCountFromSdk
					: 0;

		const currentTotals = totalsByType.get(normalizedType) ?? { count: 0, amount: 0 };
		totalsByType.set(normalizedType, {
			count: currentTotals.count + passengerCount,
			amount: currentTotals.amount + passengerTax.amount,
		});
	}

	return TAX_PASSENGER_DISPLAY_ORDER.flatMap((passengerType) => {
		const totals = totalsByType.get(passengerType.toLowerCase());
		if (!totals?.count) {
			return [];
		}

		const label = getTaxPassengerCategoryLabel(passengerType, labels);
		return label ? [{ label: `${label} ×${totals.count}`, price: totals.amount }] : [];
	});
}

/**
 * Builds confirmation tax rows from a single segment's selected fare info.
 * Connecting confirmation uses this to render taxes per segment.
 */
export function getTaxRowsFromFareInfo(
	fareInfo: FareInfo | undefined,
	passengerCategoryLabels: TaxPassengerCategoryLabels
): TaxRowData[] {
	const taxBreakdown = fareInfo?.boundSummary?.taxBreakDown ?? [];
	return taxBreakdown.map((taxItem) => ({
		title: formatTaxTitle(taxItem.taxCode, taxItem.description),
		price: taxItem.taxAmount,
		subItems: buildPassengerWiseTaxSubItems(
			taxItem.passengerWiseTaxes ?? [],
			passengerCategoryLabels
		),
	}));
}

/**
 * Returns the total tax amount for a single segment's selected fare info.
 */
export function getTaxTotalFromFareInfo(fareInfo: FareInfo | undefined): number {
	return fareInfo?.boundSummary?.totalTaxAmount ?? 0;
}

/**
 * Returns the total segment amount from one selected fare info entry.
 * Prefers per-passenger totals when available and falls back to fare amount x count.
 */
export function getSegmentTotalFromFareInfo(fareInfo: FareInfo | undefined): number {
	const fareDetails = fareInfo?.fareDetails ?? [];
	const passengerWiseFares = fareInfo?.boundSummary?.passengerWiseFares ?? [];

	return fareDetails.reduce((total, fareDetail) => {
		if (typeof fareDetail.ptcTotalFare === "number") {
			return total + fareDetail.ptcTotalFare;
		}

		const matchingPassengerFare = passengerWiseFares.find(
			(fare) => fare.passengerType?.toLowerCase() === fareDetail.passengerType?.toLowerCase()
		);

		return total + fareDetail.fareAmtInclTax * (matchingPassengerFare?.count ?? 0);
	}, 0);
}

/**
 * Builds confirmation tax rows from the selected fare breakdown.
 * Groups passenger-wise tax values into the UI row structure.
 */
export function getTaxRows(
	bound: SelectedFlightBound,
	passengerCategoryLabels: TaxPassengerCategoryLabels
): TaxRowData[] {
	return getTaxRowsFromFareInfo(bound.selectedFareInfos?.[0], passengerCategoryLabels);
}

/**
 * Returns the total tax amount for the selected flight bound.
 * Falls back to zero when the fare summary does not provide tax totals.
 */
export function getTaxTotal(bound: SelectedFlightBound): number {
	return getTaxTotalFromFareInfo(bound.selectedFareInfos?.[0]);
}
