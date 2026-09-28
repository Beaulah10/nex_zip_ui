/**
 * File: order-prepare.ts
 * Description: Utility functions used to transform flight, passenger, seat,
 * service, and bundle selection data into the Order Prepare / Summary API request
 * payload. Provides mappings between application-specific models and SDK request
 * types, including trip type determination, flight segment formatting, passenger
 * normalization, ancillary service transformation, bundle conversion, and
 * passenger association handling required for booking confirmation workflows.
 */
import {
	type NEXUZR005APIsBundle,
	type NEXUZR005APIsFareDetails,
	type NEXUZR005APIsFlightBound,
	type NEXUZR005APIsFlightSegment,
	NEXUZR005APIsFlightSegmentCabinEnum,
	type NEXUZR005APIsPassengerDetails,
	NEXUZR005APIsPassengerDetailsGenderEnum,
	NEXUZR005APIsPassengerDetailsPassengerTypeEnum,
	type NEXUZR005APIsSeat,
	type NEXUZR005APIsService,
	type NEXUZR005APIsSummaryRequest,
	NEXUZR005APIsSummaryRequestTripTypeEnum,
} from "@repo/sdk";
import { toApiPassengerType } from "@/modules/utils/helpers/common/passenger-type/passenger-type-code";
import type {
	ConfirmedFlightPayload,
	SelectedFlightBound,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { Passenger as CustomerPassenger } from "@/types/customer-information/customer-information.types";
import type {
	PassengerBundle,
	PassengerService,
	PassengerServiceGroups,
	PassengerValues,
} from "@/types/passenger/passenger.type";
import { PASSENGER_SERVICE_CATEGORIES } from "@/types/passenger/passenger.type";

function toSummaryTripType(
	confirmedFlight: ConfirmedFlightPayload
): NEXUZR005APIsSummaryRequest["tripType"] {
	if (confirmedFlight.tripType === "roundtrip") {
		return NEXUZR005APIsSummaryRequestTripTypeEnum.roundTrip;
	}

	return confirmedFlight.flights.outbound.segments.length > 1
		? NEXUZR005APIsSummaryRequestTripTypeEnum.onewayConnecting
		: NEXUZR005APIsSummaryRequestTripTypeEnum.oneway;
}

function toSummaryCabin(value: string | undefined): NEXUZR005APIsFlightSegment["cabin"] {
	return value?.toUpperCase() === NEXUZR005APIsFlightSegmentCabinEnum.zipfullflat
		? NEXUZR005APIsFlightSegmentCabinEnum.zipfullflat
		: NEXUZR005APIsFlightSegmentCabinEnum.standard;
}

function toSummaryFareDetails(
	fareDetails: SelectedSegment["fareDetails"]
): NEXUZR005APIsFareDetails[] {
	return fareDetails.map((fareDetail) => ({
		fareId: fareDetail.fareId,
		fareClass: fareDetail.fareClass,
		fareBasisCode: fareDetail.fareBasisCode,
		passengerType: toApiPassengerType(fareDetail.passengerType),
		baseFareAmtInclTax: fareDetail.baseFareAmtInclTax,
		amtInclTax: fareDetail.fareAmtInclTax,
	}));
}

function toSummaryFlightSegment(segment: SelectedSegment): NEXUZR005APIsFlightSegment {
	const flightNumber = Number(segment.flightNumber);

	return {
		carrierCode: segment.carrierCode,
		origin: segment.origin,
		destination: segment.destination,
		flightNumber: Number.isFinite(flightNumber) ? flightNumber : 0,
		pfid: segment.pfid,
		lfid: segment.lfid,
		cabin: toSummaryCabin(segment.selectedCabin),
		scheduledDepartureArrivalDateTime: {
			departureDateTime: segment.scheduledDepartureArrivalDateTime.departureDateTime,
			arrivalDateTime: segment.scheduledDepartureArrivalDateTime.arrivalDateTime,
		},
		fareDetails: toSummaryFareDetails(segment.fareDetails),
	};
}

function toSummaryFlightBound(bound: SelectedFlightBound): NEXUZR005APIsFlightBound[] {
	return [
		{
			segments: bound.segments.map(toSummaryFlightSegment),
		},
	];
}

function toPassengerType(
	passengerTypeCode?: string
): NEXUZR005APIsPassengerDetails["passengerType"] {
	switch (passengerTypeCode?.trim().toLowerCase()) {
		case "adult":
		case "adt":
			return NEXUZR005APIsPassengerDetailsPassengerTypeEnum.adult;
		case "childa":
		case "chd":
			return NEXUZR005APIsPassengerDetailsPassengerTypeEnum.childA;
		case "childb":
			return NEXUZR005APIsPassengerDetailsPassengerTypeEnum.childB;
		case "childc":
			return NEXUZR005APIsPassengerDetailsPassengerTypeEnum.childC;
		case "infant":
		case "inf":
			return NEXUZR005APIsPassengerDetailsPassengerTypeEnum.infant;
		default:
			return NEXUZR005APIsPassengerDetailsPassengerTypeEnum.adult;
	}
}

function toPassengerGender(gender?: string): NEXUZR005APIsPassengerDetails["gender"] {
	return gender?.trim().toLowerCase() === "f"
		? NEXUZR005APIsPassengerDetailsGenderEnum.f
		: NEXUZR005APIsPassengerDetailsGenderEnum.m;
}

function toDateString(value?: PassengerValues["dateOfBirth"]): string {
	if (!value) {
		return "";
	}

	if (typeof value === "string") {
		return value;
	}

	const year = value.year?.trim() ?? "";
	const month = value.month?.trim() ? value.month.trim().padStart(2, "0") : "";
	const day = value.day?.trim() ? value.day.trim().padStart(2, "0") : "";

	return year && month && day ? `${year}-${month}-${day}` : "";
}

function toNumber(value?: number | string): number | undefined {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	const parsedValue = typeof value === "number" ? value : Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function toSummarySeats(seats?: PassengerValues["seats"]): NEXUZR005APIsSeat[] {
	if (!seats?.length) {
		return [];
	}

	return seats.map((seat) => ({
		lfid: seat.lfid,
		pfid: seat.pfid,
		row: Number(seat.row),
		column: seat.column,
		serviceCode: seat.serviceCode,
		amount: seat.amount,
		...(seat.bundleCode ? { bundleCode: seat.bundleCode } : {}),
	}));
}

function toSummaryService(service: PassengerService): NEXUZR005APIsService {
	return {
		lfid: service.lfid,
		pfid: service.pfid,
		amount: service.amount,
		categoryId: service.categoryId,
		ssrCode: service.ssrCode,
		serviceID: service.serviceID,
		...(service.chargeComment ? { chargeComment: service.chargeComment } : {}),
		...(service.bundleCode ? { bundleCode: service.bundleCode } : {}),
	};
}

function flattenPassengerServices(services?: PassengerServiceGroups): PassengerService[] {
	if (!services) {
		return [];
	}

	return PASSENGER_SERVICE_CATEGORIES.flatMap((category) => services[category] ?? []);
}

function toSummaryServices(services?: PassengerValues["services"]): NEXUZR005APIsService[] {
	const flattenedServices = flattenPassengerServices(services);
	return flattenedServices.map(toSummaryService);
}

function toSummaryBundle(bundle: PassengerBundle): NEXUZR005APIsBundle | null {
	if (
		bundle.amount === undefined ||
		bundle.categoryId === undefined ||
		bundle.serviceID === undefined
	) {
		return null;
	}

	return {
		lfid: bundle.lfid,
		pfid: bundle.pfid,
		bundleCode: bundle.bundleCode,
		amount: bundle.amount,
		categoryId: bundle.categoryId,
		serviceId: bundle.serviceID,
	};
}

function toSummaryBundles(bundles?: PassengerValues["bundles"]): NEXUZR005APIsBundle[] {
	if (!bundles?.length) {
		return [];
	}

	const mappedBundles = bundles
		.map(toSummaryBundle)
		.filter((bundle): bundle is NEXUZR005APIsBundle => bundle !== null);

	return mappedBundles;
}

function buildPassengerIdMap(passengerList: CustomerPassenger[]): Map<string, number> {
	return new Map(passengerList.map((passenger, index) => [passenger.id, index + 1]));
}

function getStoredPassengerById(
	storedPassengers: PassengerValues[],
	passengerId: string
): PassengerValues | undefined {
	return storedPassengers.find((passenger) => passenger.id === passengerId);
}

function buildFallbackPassenger(
	passenger: CustomerPassenger,
	primaryPassengerId?: string
): Partial<PassengerValues> {
	return {
		id: passenger.id,
		passengerTypeCode: passenger.passengerTypeCode ?? "adult",
		firstName: passenger.firstName ?? "",
		middleName: passenger.middleName,
		lastName: passenger.lastName ?? "",
		dateOfBirth: passenger.dateOfBirth,
		gender: passenger.gender,
		redressNumber: passenger.apisInfo?.redressNumber,
		knownTravelerNumber: passenger.apisInfo?.knownTravelerNumber,
		nationality: passenger.apisInfo?.nationality ?? passenger.nationality,
		isPrimaryPassenger:
			passenger.id === primaryPassengerId || Boolean(passenger.isPrimaryPassenger),
		height: passenger.height,
		weight: passenger.weight,
		associateWithPassengerId: passenger.associateWithPassengerId,
		contactInformation: passenger.contactInformation
			? {
					countryCode: passenger.contactInformation.countryCode,
					phoneNumber: passenger.contactInformation.phoneNumber,
					email: passenger.contactInformation.email,
				}
			: undefined,
		emergencyContact: passenger.contactInformation
			? {
					countryCode: passenger.emergencyContact?.countryCode,
					phoneNumber: passenger.emergencyContact?.phoneNumber,
				}
			: undefined,
	};
}

function buildSummaryPassenger({
	passenger,
	storedPassenger,
	passengerIdMap,
	primaryPassengerId,
	marketingMails,
}: {
	passenger: CustomerPassenger;
	storedPassenger?: PassengerValues;
	passengerIdMap: ReadonlyMap<string, number>;
	primaryPassengerId?: string;
	marketingMails: boolean;
}): NEXUZR005APIsPassengerDetails {
	const summaryPassengerId = passengerIdMap.get(passenger.id);

	if (!summaryPassengerId) {
		throw new Error(
			`Unable to build OrderPrepare request: missing passenger id for ${passenger.id}`
		);
	}

	const source = storedPassenger ?? buildFallbackPassenger(passenger, primaryPassengerId);
	const associatedPassengerId = source.associateWithPassengerId
		? passengerIdMap.get(source.associateWithPassengerId)
		: undefined;
	const seats = toSummarySeats(source.seats);
	const services = toSummaryServices(source.services);
	const bundles = toSummaryBundles(source.bundles);
	const height = toNumber(source.height);
	const weight = toNumber(source.weight);
	const emergencyCountryCode = source.emergencyContact?.countryCode;
	const emergencyPhoneNumber = source.emergencyContact?.phoneNumber;

	return {
		id: summaryPassengerId,
		passengerType: toPassengerType(source.passengerTypeCode ?? passenger.passengerTypeCode),
		...(associatedPassengerId ? { associateWithPassengerId: associatedPassengerId } : {}),
		firstName: source.firstName ?? passenger.firstName ?? "",
		...(source.middleName ? { middleName: source.middleName } : {}),
		lastName: source.lastName ?? passenger.lastName ?? "",
		dateOfBirth: toDateString(source.dateOfBirth ?? passenger.dateOfBirth),
		gender: toPassengerGender(source.gender ?? passenger.gender),
		...(source.redressNumber ? { redressNumber: source.redressNumber } : {}),
		...(source.knownTravelerNumber ? { knownTravelerNumber: source.knownTravelerNumber } : {}),
		nationality:
			source.apisInfo?.nationality ??
			source.nationality ??
			passenger.apisInfo?.nationality ??
			passenger.nationality ??
			"",
		isPrimaryPassenger:
			Boolean(source.isPrimaryPassenger) ||
			passenger.id === primaryPassengerId ||
			Boolean(passenger.isPrimaryPassenger),
		...(height !== undefined ? { height } : {}),
		...(weight !== undefined ? { weight } : {}),
		contactInformation: {
			countryCode: source.contactInformation?.countryCode ?? "",
			phoneNumber: source.contactInformation?.phoneNumber ?? "",
			email: source.contactInformation?.email ?? "",
		},
		...(emergencyCountryCode || emergencyPhoneNumber
			? {
					emergencyContact: {
						...(emergencyCountryCode ? { countryCode: emergencyCountryCode } : {}),
						...(emergencyPhoneNumber ? { phoneNumber: emergencyPhoneNumber } : {}),
					},
				}
			: {}),
		marketingMails,
		...(seats ? { seats } : {}),
		...(services ? { services } : {}),
		...(bundles ? { bundles } : {}),
	};
}

export function buildConfirmationOrderPrepareRequest({
	confirmedFlight,
	passengerList,
	storedPassengers,
	primaryPassengerId,
	marketingMails,
}: {
	confirmedFlight: ConfirmedFlightPayload;
	passengerList: CustomerPassenger[];
	storedPassengers: PassengerValues[];
	primaryPassengerId?: string;
	marketingMails: boolean;
}): NEXUZR005APIsSummaryRequest {
	const passengerIdMap = buildPassengerIdMap(passengerList);

	return {
		tripType: toSummaryTripType(confirmedFlight),
		reservationAmount: confirmedFlight.grandTotalAmount,
		flights: {
			outbound: toSummaryFlightBound(confirmedFlight.flights.outbound),
			...(confirmedFlight.flights.inbound
				? { inbound: toSummaryFlightBound(confirmedFlight.flights.inbound) }
				: {}),
		},
		passengers: passengerList.map((passenger) =>
			buildSummaryPassenger({
				passenger,
				storedPassenger: getStoredPassengerById(storedPassengers, passenger.id),
				passengerIdMap,
				primaryPassengerId,
				marketingMails,
			})
		),
	};
}
