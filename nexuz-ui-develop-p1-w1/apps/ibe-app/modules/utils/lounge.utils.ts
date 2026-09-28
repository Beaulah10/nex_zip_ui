import type { NEXUZR004OffersAncillaryResponse, NEXUZR004OffersSpecialService } from "@repo/sdk";

export type LoungeServiceEntry = {
	service: NEXUZR004OffersSpecialService;
	categoryId: number;
	passengerType: string;
};

export type AncillaryServiceOption = {
	id: string;
	title: string;
	price: number;
	ssrCode: string;
	passengerType: string;
	categoryId: number;
	service: NEXUZR004OffersSpecialService;
};

const LOUNGE_CODES = ["LNGB", "LNGC", "LNGD", "LNGE"];

/**
 * Returns ancillary services that match the specified SSR codes.
 * @param data Ancillary offers response.
 * @param ssrCodes SSR codes to filter services by.
 */

function extractServicesBySsrCodes(
	data: NEXUZR004OffersAncillaryResponse | undefined,
	ssrCodes: readonly string[]
): AncillaryServiceOption[] {
	if (!data?.data?.servicesPerPassengerType) {
		return [];
	}

	const lookupCodes = new Set(ssrCodes);

	return data.data.servicesPerPassengerType.flatMap((entry) =>
		entry.categories.flatMap((category) =>
			category.specialServices
				.filter((service) => lookupCodes.has(service.ssrCode))
				.map((service) => ({
					id: service.ssrId.toString(),
					title: service.description,
					price: service.amount,
					ssrCode: service.ssrCode,
					passengerType: entry.passengerType,
					categoryId: category.categoryId,
					service,
				}))
		)
	);
}

function extractLoungeServicesWithFallback(
	data: NEXUZR004OffersAncillaryResponse | undefined
): AncillaryServiceOption[] {
	const preferred = extractServicesBySsrCodes(data, LOUNGE_CODES);
	return preferred;
}

/**
 * Creates a lookup of lounge services by service ID.
 * @param data Ancillary offers response.
 * @returns Lounge service details mapped by service ID.
 */

export const extractLoungeServiceLookup = (
	data: NEXUZR004OffersAncillaryResponse | undefined
): Record<string, LoungeServiceEntry> => {
	const lookup: Record<string, LoungeServiceEntry> = {};

	for (const option of extractLoungeServicesWithFallback(data)) {
		lookup[option.id] = {
			service: option.service,
			categoryId: option.categoryId,
			passengerType: option.passengerType,
		};
	}

	return lookup;
};

/**Returns the available lounge service options.*/
export const extractLoungeServices = (data: NEXUZR004OffersAncillaryResponse | undefined) => {
	return extractLoungeServicesWithFallback(data);
};
