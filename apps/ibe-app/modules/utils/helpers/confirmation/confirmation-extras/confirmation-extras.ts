import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import {
	getBundledSsrCodesForPassenger,
	mapAncillaryDataToProducts,
} from "@/modules/utils/helpers/extras/extras.helpers";
import type {
	ExtrasAvailabilityActionResult,
	ExtraToRemove,
	UnavailableExtraEntry,
} from "@/types/confirmation/confirmation.types";
import type { PassengerService, PassengerValues } from "@/types/passenger/passenger.type";

function getExtrasOnSegment(passenger: PassengerValues, lfid: number): PassengerService[] {
	return (passenger.services?.extras ?? []).filter((service) => service.lfid === lfid);
}

export function detectExtrasAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
}): ExtrasAvailabilityActionResult {
	const { ancillaryData, storedPassengers, orderedPassengerIds, lfid } = params;
	const products = mapAncillaryDataToProducts(ancillaryData);
	const productQtyBySsrCode = Object.fromEntries(
		products.map((product) => [product.ssrCode, product.qtyAvailable ?? 0])
	) as Record<string, number>;
	const hasAvailableExtras = products.some((product) => (product.qtyAvailable ?? 0) > 0);

	for (const passenger of storedPassengers) {
		const bundledCodes = getBundledSsrCodesForPassenger(passenger, lfid);
		if (bundledCodes.size === 0) {
			continue;
		}

		const hasUnavailableBundledExtra = getExtrasOnSegment(passenger, lfid).some(
			(service) =>
				bundledCodes.has(service.ssrCode) && (productQtyBySsrCode[service.ssrCode] ?? 0) <= 0
		);

		if (hasUnavailableBundledExtra) {
			return { type: "bundle-extra-unavailable" };
		}
	}

	if (!hasAvailableExtras) {
		const extrasToRemove: ExtraToRemove[] = [];

		for (const passenger of storedPassengers) {
			for (const service of getExtrasOnSegment(passenger, lfid)) {
				extrasToRemove.push({
					passengerId: passenger.id,
					lfid: service.lfid,
					ssrCode: service.ssrCode,
				});
			}
		}

		return {
			type: "all-extras-unavailable",
			hasExistingSelections: extrasToRemove.length > 0,
			extrasToRemove,
		};
	}

	const orderedPassengers = orderedPassengerIds
		.map((id) => storedPassengers.find((passenger) => passenger.id === id))
		.filter((passenger): passenger is PassengerValues => passenger !== undefined);

	const passengersBySsrCode: Record<
		string,
		Array<{ passenger: PassengerValues; service: PassengerService }>
	> = {};

	for (const passenger of orderedPassengers) {
		for (const service of getExtrasOnSegment(passenger, lfid)) {
			const entries = passengersBySsrCode[service.ssrCode] ?? [];
			entries.push({ passenger, service });
			passengersBySsrCode[service.ssrCode] = entries;
		}
	}

	const unavailableExtras: UnavailableExtraEntry[] = [];
	const extrasToRemove: ExtraToRemove[] = [];

	for (const [ssrCode, selectedEntries] of Object.entries(passengersBySsrCode)) {
		const qtyAvailable = productQtyBySsrCode[ssrCode] ?? 0;

		if (qtyAvailable <= 0) {
			for (const entry of selectedEntries) {
				unavailableExtras.push({
					passengerId: entry.passenger.id,
					passengerName: `${entry.passenger.firstName} ${entry.passenger.lastName}`,
					extraName: entry.service.description,
				});
				extrasToRemove.push({
					passengerId: entry.passenger.id,
					lfid: entry.service.lfid,
					ssrCode: entry.service.ssrCode,
				});
			}
			continue;
		}

		if (qtyAvailable < selectedEntries.length) {
			const toRemove = selectedEntries.slice(-(selectedEntries.length - qtyAvailable));

			for (const entry of toRemove) {
				unavailableExtras.push({
					passengerId: entry.passenger.id,
					passengerName: `${entry.passenger.firstName} ${entry.passenger.lastName}`,
					extraName: entry.service.description,
				});
				extrasToRemove.push({
					passengerId: entry.passenger.id,
					lfid: entry.service.lfid,
					ssrCode: entry.service.ssrCode,
				});
			}
		}
	}

	if (unavailableExtras.length > 0) {
		return {
			type: "selected-extra-unavailable",
			unavailableExtras,
			extrasToRemove,
		};
	}

	return { type: "noop" };
}
