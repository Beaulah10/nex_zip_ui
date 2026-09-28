import type { StaticImageData } from "next/image";
import {
	SHUTTLE_ONE_WAY_SERVICE_ID,
	SHUTTLE_ONE_WAY_SSR_CODE,
	SHUTTLE_ROUND_TRIP_SERVICE_ID,
	SHUTTLE_ROUND_TRIP_SSR_CODE,
	TRANSPORT_CHILD_PASSENGER_TYPES,
	TRANSPORT_OLDER_PASSENGER_TYPES,
	TROLLEY_1_DAY_SERVICE_ID,
	TROLLEY_1_DAY_SSR_CODE,
	TROLLEY_4_DAYS_SERVICE_ID,
	TROLLEY_4_DAYS_SSR_CODE,
	TROLLEY_7_DAYS_SERVICE_ID,
	TROLLEY_7_DAYS_SSR_CODE,
} from "@/modules/utils/constants/customer-information/transport-service/transport-service-constants/transport-service.constants";
import { getAdultAmount } from "@/modules/utils/helpers/customize/transport-service/transport-service-pricing/transport-service-pricing";
import { getAllTransportSpecialServices } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type {
	TransportationOffersData,
	TransportServiceAvailability,
	TransportServiceCardPricingRowData,
	TransportServiceItem,
	TransportServiceSsrCode,
} from "@/types/customize/transport-service/transport-service.types";

function findAmountByPassengerTypes(
	transportationData: TransportationOffersData,
	ssrCode: TransportServiceSsrCode,
	passengerTypes: string[]
): number | null {
	for (const passengerType of passengerTypes) {
		const amount = transportationData?.data?.servicesPerPassengerType
			?.find((item) => item.passengerType === passengerType)
			?.categories?.flatMap((category) => category.specialServices ?? [])
			?.find((service) => service.ssrCode === ssrCode)?.amount;

		if (typeof amount === "number") {
			return amount;
		}
	}

	return null;
}

function trolleyServiceDurationVisibility({
	transportationData,
	hasTRLA,
	hasTRLB,
	hasTRLC,
}: {
	transportationData: TransportationOffersData;
	hasTRLA: boolean;
	hasTRLB: boolean;
	hasTRLC: boolean;
}): { displayOlderPtcColumn: boolean; displayChildPtcColumn: boolean } {
	const availableSsrCodes: TransportServiceSsrCode[] = [];

	if (hasTRLA) {
		availableSsrCodes.push("TRLA");
	}
	if (hasTRLB) {
		availableSsrCodes.push("TRLB");
	}
	if (hasTRLC) {
		availableSsrCodes.push("TRLC");
	}

	const displayOlderPtcColumn = availableSsrCodes.some(
		(ssrCode) =>
			findAmountByPassengerTypes(transportationData, ssrCode, TRANSPORT_OLDER_PASSENGER_TYPES) !==
			null
	);
	const displayChildPtcColumn = availableSsrCodes.some(
		(ssrCode) =>
			findAmountByPassengerTypes(transportationData, ssrCode, TRANSPORT_CHILD_PASSENGER_TYPES) !==
			null
	);

	return {
		displayOlderPtcColumn,
		displayChildPtcColumn,
	};
}

/**
 * Computes availability flags for transport SSR codes from ancillary services.
 */
export function getTransportServiceAvailability(
	transportationData: TransportationOffersData
): TransportServiceAvailability {
	const allSpecialServices = getAllTransportSpecialServices(transportationData);

	const hasOneWay = allSpecialServices.some(
		(service) => service.ssrCode === SHUTTLE_ONE_WAY_SSR_CODE
	);
	const hasRoundTrip = allSpecialServices.some(
		(service) => service.ssrCode === SHUTTLE_ROUND_TRIP_SSR_CODE
	);
	const hasTRLA = allSpecialServices.some((service) => service.ssrCode === TROLLEY_7_DAYS_SSR_CODE);
	const hasTRLB = allSpecialServices.some((service) => service.ssrCode === TROLLEY_4_DAYS_SSR_CODE);
	const hasTRLC = allSpecialServices.some((service) => service.ssrCode === TROLLEY_1_DAY_SSR_CODE);

	return {
		hasOneWay,
		hasRoundTrip,
		hasTRLA,
		hasTRLB,
		hasTRLC,
		hasAnySupportedTransportSsr: hasOneWay || hasRoundTrip || hasTRLA || hasTRLB || hasTRLC,
	};
}

/**
 * Builds visible trolley age-group labels based on available PTC pricing in API response.
 */
export function displayPtcAgeGroupLabels({
	transportationData,
	hasTRLA,
	hasTRLB,
	hasTRLC,
	transportServiceLabels,
}: {
	transportationData: TransportationOffersData;
	hasTRLA: boolean;
	hasTRLB: boolean;
	hasTRLC: boolean;
	transportServiceLabels: (key: string) => string;
}): string[] {
	const { displayOlderPtcColumn, displayChildPtcColumn } = trolleyServiceDurationVisibility({
		transportationData,
		hasTRLA,
		hasTRLB,
		hasTRLC,
	});

	const labels: string[] = [];

	if (displayOlderPtcColumn) {
		labels.push(transportServiceLabels("adult_12_years_and_older"));
	}

	if (displayChildPtcColumn) {
		labels.push(transportServiceLabels("child_2_to_11_years_old"));
	}

	return labels;
}

/**
 * Builds shuttle pricing rows from ancillary transportation data.
 */
export function displayShuttleServicePricingRows({
	transportationData,
	hasOneWay,
	hasRoundTrip,
	transportServiceLabels,
}: {
	transportationData: TransportationOffersData;
	hasOneWay: boolean;
	hasRoundTrip: boolean;
	transportServiceLabels: (key: string) => string;
}): TransportServiceCardPricingRowData[] {
	const rows: TransportServiceCardPricingRowData[] = [];

	if (hasOneWay) {
		rows.push({
			label: transportServiceLabels("shuttle_one_way"),
			prices: [getAdultAmount(transportationData, SHUTTLE_ONE_WAY_SSR_CODE)],
		});
	}

	if (hasRoundTrip) {
		rows.push({
			label: transportServiceLabels("shuttle_round_trip"),
			prices: [getAdultAmount(transportationData, SHUTTLE_ROUND_TRIP_SSR_CODE)],
		});
	}

	return rows;
}

/**
 * Builds trolley pricing rows from ancillary transportation data.
 */
export function displayTrolleyServicePricingRows({
	transportationData,
	hasTRLA,
	hasTRLB,
	hasTRLC,
	transportServiceLabels,
}: {
	transportationData: TransportationOffersData;
	hasTRLA: boolean;
	hasTRLB: boolean;
	hasTRLC: boolean;
	transportServiceLabels: (key: string) => string;
}): TransportServiceCardPricingRowData[] {
	const rows: TransportServiceCardPricingRowData[] = [];
	const { displayOlderPtcColumn, displayChildPtcColumn } = trolleyServiceDurationVisibility({
		transportationData,
		hasTRLA,
		hasTRLB,
		hasTRLC,
	});

	const createRowPrices = (ssrCode: TransportServiceSsrCode): number[] => {
		const prices: number[] = [];

		if (displayOlderPtcColumn) {
			const olderAmount = findAmountByPassengerTypes(
				transportationData,
				ssrCode,
				TRANSPORT_OLDER_PASSENGER_TYPES
			);
			if (olderAmount !== null) {
				prices.push(olderAmount);
			}
		}

		if (displayChildPtcColumn) {
			const childAmount = findAmountByPassengerTypes(
				transportationData,
				ssrCode,
				TRANSPORT_CHILD_PASSENGER_TYPES
			);
			if (childAmount !== null) {
				prices.push(childAmount);
			}
		}

		return prices;
	};

	if (hasTRLA) {
		const prices = createRowPrices(TROLLEY_7_DAYS_SSR_CODE);
		if (prices.length > 0) {
			rows.push({
				label: transportServiceLabels("trolley_7_days"),
				prices,
			});
		}
	}

	if (hasTRLB) {
		const prices = createRowPrices(TROLLEY_4_DAYS_SSR_CODE);
		if (prices.length > 0) {
			rows.push({
				label: transportServiceLabels("trolley_4_days"),
				prices,
			});
		}
	}

	if (hasTRLC) {
		const prices = createRowPrices(TROLLEY_1_DAY_SSR_CODE);
		if (prices.length > 0) {
			rows.push({
				label: transportServiceLabels("trolley_1_day"),
				prices,
			});
		}
	}

	return rows;
}

/**
 * Builds selectable trolley service rows for the transport-service card.
 */
export function displayTrolleyServices({
	hasTRLA,
	hasTRLB,
	hasTRLC,
	transportServiceLabels,
	trolleyImage,
}: {
	hasTRLA: boolean;
	hasTRLB: boolean;
	hasTRLC: boolean;
	transportServiceLabels: (key: string) => string;
	trolleyImage: StaticImageData;
}): TransportServiceItem["services"] {
	const services: TransportServiceItem["services"] = [];

	if (hasTRLA) {
		services.push({
			id: TROLLEY_7_DAYS_SERVICE_ID,
			label: transportServiceLabels("trolley_service_7_days"),
			imageSrc: trolleyImage,
		});
	}

	if (hasTRLB) {
		services.push({
			id: TROLLEY_4_DAYS_SERVICE_ID,
			label: transportServiceLabels("trolley_service_4_days"),
			imageSrc: trolleyImage,
		});
	}

	if (hasTRLC) {
		services.push({
			id: TROLLEY_1_DAY_SERVICE_ID,
			label: transportServiceLabels("trolley_service_1_day"),
			imageSrc: trolleyImage,
		});
	}

	return services;
}

/**
 * Builds the transport service UI sections based on route and API availability.
 */
export function displayTransportServiceApplicable({
	isNrtToHnlRoute,
	isHnlToNrtRoute,
	hasOneWay,
	hasRoundTrip,
	transportServiceLabels,
	shuttleImage,
	shuttleServiceImage,
	trolleyImage,
	shuttlePricingRows,
	trolleyPricingRows,
	trolleyServices,
	trolleyAgeGroupLabels,
}: {
	isNrtToHnlRoute: boolean;
	isHnlToNrtRoute: boolean;
	hasOneWay: boolean;
	hasRoundTrip: boolean;
	transportServiceLabels: (key: string) => string;
	shuttleImage: StaticImageData;
	shuttleServiceImage: StaticImageData;
	trolleyImage: StaticImageData;
	shuttlePricingRows: TransportServiceCardPricingRowData[];
	trolleyPricingRows: TransportServiceCardPricingRowData[];
	trolleyServices: TransportServiceItem["services"];
	trolleyAgeGroupLabels: string[];
}): TransportServiceItem[] {
	const services: TransportServiceItem[] = [];
	const hasTrolleySection = isNrtToHnlRoute && trolleyServices.length > 0;

	if ((isNrtToHnlRoute || isHnlToNrtRoute) && (hasOneWay || hasRoundTrip)) {
		services.push({
			imageSrc: shuttleImage,
			mobileImageClassName: "object-[-25px_-65px] scale-[1.2]",
			desktopImageClassName: hasTrolleySection
				? "object-[-15px_-90px] scale-[1.45]"
				: "object-[0px_-290px] scale-[1.45]",
			title: transportServiceLabels("lealea_airport_shuttle"),
			moreInfoHref: "#",
			description: transportServiceLabels("lealea_airport_shuttle_description"),
			ageGroupLabels: [],
			durationLabel: transportServiceLabels("trip_type"),
			pricingRows: shuttlePricingRows,
			footnote: transportServiceLabels("free_for_children"),
			services: [
				...(hasOneWay
					? [
							{
								id: SHUTTLE_ONE_WAY_SERVICE_ID,
								label: transportServiceLabels("shuttle_service_one_way"),
								imageSrc: shuttleServiceImage,
							},
						]
					: []),
				...(hasRoundTrip
					? [
							{
								id: SHUTTLE_ROUND_TRIP_SERVICE_ID,
								label: transportServiceLabels("shuttle_service_round_trip"),
								imageSrc: shuttleServiceImage,
							},
						]
					: []),
			],
		});
	}

	if (hasTrolleySection) {
		services.push({
			imageSrc: trolleyImage,
			title: transportServiceLabels("lealea_trolley"),
			moreInfoHref: "#",
			description: transportServiceLabels("lealea_trolley_description"),
			ageGroupLabels: trolleyAgeGroupLabels,
			pricingRows: trolleyPricingRows,
			footnote: transportServiceLabels("free_for_children"),
			services: trolleyServices,
		});
	}

	return services;
}
