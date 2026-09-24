/**
 * File: purchase-deadline.ts
 * Validation utilities for booking, bundle, and ancillary service purchase deadlines on confirmation.
 */

import { evaluateAncillaryEligibility } from "@/modules/hooks/air-ancillary/air-ancillary";
import {
	getBundleDeadlineHours,
	getRemainingHours,
	isBookingCutoffExceeded,
	resolveDepartureDateTime,
} from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { NO_BUNDLE_ID } from "@/modules/utils/constants/bundle/bundle.constants";
import {
	DEFAULT_SERVICE_CUTOFF_HOURS,
	HNL_LOUNGE_CUTOFF_HOURS,
	HNL_NRT_TRANSPORT_CUTOFF_HOURS,
} from "@/modules/utils/constants/confirmation/confirmation.constants";
import {
	isKoreanFlight,
	isKoreanFlightNrtDeparture,
	isLoungeServiceRouteEnabled,
	isTransportServiceRouteEnabled,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	ConfirmationDeadlineCleanupInstruction,
	ConfirmationOnLoadValidationInput,
	ConfirmationPassengerDeadlineState,
	ConfirmationPassengerServiceDeadlineState,
	ConfirmationPurchaseDeadlineServiceKey,
	ConfirmationPurchaseDeadlineValidationLabels,
	ConfirmationPurchaseDeadlineValidationResult,
} from "@/types/confirmation/confirmation.types";
import type {
	PassengerService,
	PassengerServiceCategory,
	PassengerValues,
} from "@/types/passenger/passenger.type";

/**
 * Mapping of service keys to their corresponding passenger service categories.
 */
const SERVICE_CATEGORY_BY_KEY: Record<
	Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle" | "seat">,
	PassengerServiceCategory
> = {
	baggage: "baggage",
	meal: "meals",
	priority: "express",
	lounge: "lounge",
	transport: "travel",
	extras: "extras",
};
/**
 * A no-operation translator function that returns an empty string.
 */
const NOOP_TRANSLATOR = () => "";
/**
 * Mapping of ancillary service card keys to their corresponding service keys.
 */
const ANCILLARY_SERVICE_KEY_BY_CARD_KEY = {
	seat: "seat",
	baggage: "baggage",
	meal: "meal",
	express: "priority",
	lounge: "lounge",
	transport: "transport",
} satisfies Record<
	keyof ReturnType<typeof evaluateAncillaryEligibility>["cards"],
	Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle" | "extras">
>;
/** Mapping of ancillary service service keys to their corresponding card keys. */
const ANCILLARY_CARD_KEY_BY_SERVICE_KEY = Object.fromEntries(
	Object.entries(ANCILLARY_SERVICE_KEY_BY_CARD_KEY).map(([cardKey, serviceKey]) => [
		serviceKey,
		cardKey,
	])
) as Record<
	Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle" | "extras">,
	keyof ReturnType<typeof evaluateAncillaryEligibility>["cards"]
>;
/**
 * Retrieves all segments from a confirmed flight, including outbound and inbound segments.
 */
function getAllSegments(confirmedFlight: ConfirmedFlightPayload): SelectedSegment[] {
	return [
		...confirmedFlight.flights.outbound.segments,
		...(confirmedFlight.flights.inbound?.segments ?? []),
	];
}
/**
 * Retrieves the departure time for a given segment.
 */
function getSegmentDepartureTime(segment: SelectedSegment): string {
	return resolveDepartureDateTime({
		departureDateTime: segment.scheduledDepartureArrivalDateTime?.departureDateTime,
		departureDateTimeOffset: segment.scheduledDepartureArrivalDateTime?.departureDateTimeOffset,
	});
}

/**
 * Calculates the remaining hours until the departure of a given segment.
 */
function getRemainingHoursForSegment(segment: SelectedSegment): number {
	return getRemainingHours(getSegmentDepartureTime(segment));
}

/**
 * Finds the earliest upcoming segment from a list of segments based on remaining hours.
 */
function getEarliestUpcomingSegment(segments: SelectedSegment[]): SelectedSegment | undefined {
	const segmentDurations = segments
		.map((segment) => ({ segment, remainingHours: getRemainingHoursForSegment(segment) }))
		.filter(({ remainingHours }) => Number.isFinite(remainingHours));

	if (segmentDurations.length === 0) {
		return undefined;
	}

	const upcoming = segmentDurations
		.filter(({ remainingHours }) => remainingHours >= 0)
		.sort((left, right) => left.remainingHours - right.remainingHours);

	if (upcoming.length > 0) {
		return upcoming[0]?.segment;
	}

	return segmentDurations.sort((left, right) => left.remainingHours - right.remainingHours)[0]
		?.segment;
}

/**
 * Checks if a bundle has been purchased based on its bundle code.
 */
function isPurchasedBundle(bundleCode?: string): boolean {
	return Boolean(bundleCode) && bundleCode !== NO_BUNDLE_ID;
}

/**
 * Determines if a service is expired based on remaining hours and cutoff hours.
 */
function isExpired(remainingHours: number, cutoffHours: number): boolean {
	return remainingHours <= cutoffHours;
}

/**
 * Checks if a passenger has purchased a bundle on a specific segment.
 */
function isPurchasedOnSegment(passenger: PassengerValues, lfid: number): boolean {
	return (passenger.bundles ?? []).some(
		(bundle) => bundle.lfid === lfid && isPurchasedBundle(bundle.bundleCode)
	);
}

/**
 * Determines the cutoff hours for a bundle based on the flight segment.
 */
function getBundleCutoffHours(segment: SelectedSegment): 24 | 48 {
	if (isKoreanFlightNrtDeparture(segment.origin, segment.destination)) {
		return 24;
	}

	if (isKoreanFlight(segment.origin, segment.destination)) {
		return 48;
	}

	return 48;
}

/**
 * Determines the cutoff hours for a specific service based on the flight segment.
 */
function getServiceCutoffHours(
	serviceKey: ConfirmationPurchaseDeadlineServiceKey,
	segment: SelectedSegment
): number | undefined {
	switch (serviceKey) {
		case "seat":
		case "baggage":
		case "priority":
		case "extras":
			return DEFAULT_SERVICE_CUTOFF_HOURS;
		case "meal":
			return segment.origin === "NRT" ? 24 : 48;
		case "lounge":
			if (!isLoungeServiceRouteEnabled(segment.origin)) {
				return undefined;
			}

			return segment.origin === "HNL" ? HNL_LOUNGE_CUTOFF_HOURS : 24;
		case "transport":
			if (!isTransportServiceRouteEnabled(segment.origin, segment.destination)) {
				return undefined;
			}

			return segment.origin === "HNL" && segment.destination === "NRT"
				? HNL_NRT_TRANSPORT_CUTOFF_HOURS
				: 24;
	}
}
/**
 * Validates if there is a booking error on page load based on the segment and departure time.
 */
function validateBookingErrorOnLoad({
	segment,
	departureTime,
	labels,
}: {
	segment: SelectedSegment | undefined;
	departureTime?: string;
	labels: ConfirmationPurchaseDeadlineValidationLabels;
}): ConfirmationPurchaseDeadlineValidationResult | undefined {
	const actualDepartureTime = segment ? getSegmentDepartureTime(segment) : departureTime;

	if (!actualDepartureTime) {
		return undefined;
	}

	if (!isBookingCutoffExceeded(actualDepartureTime)) {
		return undefined;
	}

	return {
		type: "booking-error",
		modal: {
			title: labels.bookingErrorTitle,
			message: labels.bookingErrorMessage,
			buttonLabel: labels.bookingErrorButtonLabel,
			redirectPath: `/${labels.locale}/flight-selection`,
		},
	};
}
/**
 * Validates if the purchased bundle deadline has passed for any passenger on any segment.
 */
function validatePurchasedBundleDeadline({
	segmentsByLfid,
	passengerList,
	labels,
}: {
	segmentsByLfid: Map<number, SelectedSegment>;
	passengerList: PassengerValues[];
	labels: ConfirmationPurchaseDeadlineValidationLabels;
}): ConfirmationPurchaseDeadlineValidationResult | undefined {
	for (const passenger of passengerList) {
		for (const bundle of passenger.bundles ?? []) {
			if (!isPurchasedBundle(bundle.bundleCode)) {
				continue;
			}

			const segment = segmentsByLfid.get(bundle.lfid);

			if (!segment) {
				continue;
			}

			if (!isExpired(getRemainingHoursForSegment(segment), getBundleCutoffHours(segment))) {
				continue;
			}

			return {
				type: "bundle-deadline",
				modal: {
					title: labels.bundleDeadlineTitle,
					message: labels.bundleDeadlineMessage,
					buttonLabel: labels.bundleDeadlineButtonLabel,
					redirectPath: `/${labels.locale}`,
				},
			};
		}
	}

	return undefined;
}

/**
 * Builds a map of segments to their no-bundle eligibility cards.
 */
function buildNoBundleEligibilityByLfid(
	segments: SelectedSegment[]
): Map<number, ReturnType<typeof evaluateAncillaryEligibility>["cards"]> {
	return new Map(
		segments.map((segment) => [
			segment.lfid,
			evaluateAncillaryEligibility({
				pageType: "customize",
				bundleType: "NoBundle",
				source: segment.origin,
				destination: segment.destination,
				departureTime: getSegmentDepartureTime(segment),
				t: NOOP_TRANSLATOR,
			}).cards,
		])
	);
}

/**
 * Determines if the deadline for a specific passenger service has passed.
 */
function isPassengerServiceDeadlinePassed({
	serviceKey,
	segment,
	remainingHours,
	eligibilityCards,
}: {
	serviceKey: ConfirmationPurchaseDeadlineServiceKey;
	segment: SelectedSegment;
	remainingHours: number;
	eligibilityCards?: ReturnType<typeof evaluateAncillaryEligibility>["cards"];
}): boolean {
	if (serviceKey === "extras") {
		return isExpired(remainingHours, DEFAULT_SERVICE_CUTOFF_HOURS);
	}

	if (serviceKey === "bundle") {
		return false;
	}

	const cardKey = ANCILLARY_CARD_KEY_BY_SERVICE_KEY[serviceKey];

	if (eligibilityCards?.[cardKey]) {
		return !eligibilityCards[cardKey].enabled;
	}

	const cutoffHours = getServiceCutoffHours(serviceKey, segment);
	return cutoffHours === undefined ? false : isExpired(remainingHours, cutoffHours);
}
/**
 * Builds the deadline state for a purchased passenger service.
 */
function buildPurchasedDeadlineState({
	serviceKey,
	lfid,
}: {
	serviceKey: Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle">;
	lfid: number;
}): ConfirmationPassengerServiceDeadlineState {
	return {
		serviceKey,
		lfid,
		isPurchased: true,
		isDeadlinePassed: true,
		warningMode: "cannot-change",
		actionDisabled: true,
		shouldDisplayNotSelected: true,
		shouldOverrideActionToAdd: true,
	};
}
/**
 * Builds the deadline state for an unpurchased passenger service.
 */
function buildUnpurchasedDeadlineState({
	serviceKey,
	lfid,
}: {
	serviceKey: Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle">;
	lfid: number;
}): ConfirmationPassengerServiceDeadlineState {
	return {
		serviceKey,
		lfid,
		isPurchased: false,
		isDeadlinePassed: true,
		warningMode: "cannot-select",
		actionDisabled: true,
		shouldDisplayNotSelected: false,
		shouldOverrideActionToAdd: true,
	};
}
/**
 * Validates the deadline for an unpurchased bundle for a specific passenger.
 */
function validateUnpurchasedBundleDeadline({
	lfid,
	remainingHours,
	outboundSegments,
}: {
	lfid: number;
	remainingHours: number;
	outboundSegments: SelectedSegment[];
}): ConfirmationPassengerServiceDeadlineState | undefined {
	const bundleDeadlineHours = getBundleDeadlineHours(outboundSegments);

	if (remainingHours > bundleDeadlineHours) {
		return undefined;
	}

	return {
		serviceKey: "bundle",
		lfid,
		isPurchased: false,
		isDeadlinePassed: true,
		warningMode: "cannot-select",
		actionDisabled: true,
		shouldDisplayNotSelected: false,
		shouldOverrideActionToAdd: true,
	};
}
/**
 * Creates a deep clone of the passengers array, ensuring that nested arrays are also cloned.
 */
function clonePassengers(passengers: PassengerValues[]): PassengerValues[] {
	return passengers.map((passenger) => ({
		...passenger,
		bundles: passenger.bundles ? [...passenger.bundles] : passenger.bundles,
		seats: passenger.seats ? [...passenger.seats] : passenger.seats,
		services: passenger.services
			? {
					baggage: passenger.services.baggage
						? [...passenger.services.baggage]
						: passenger.services.baggage,
					meals: passenger.services.meals
						? [...passenger.services.meals]
						: passenger.services.meals,
					express: passenger.services.express
						? [...passenger.services.express]
						: passenger.services.express,
					lounge: passenger.services.lounge
						? [...passenger.services.lounge]
						: passenger.services.lounge,
					travel: passenger.services.travel
						? [...passenger.services.travel]
						: passenger.services.travel,
					extras: passenger.services.extras
						? [...passenger.services.extras]
						: passenger.services.extras,
					"non-chargeable": passenger.services["non-chargeable"]
						? [...passenger.services["non-chargeable"]]
						: passenger.services["non-chargeable"],
				}
			: passenger.services,
	}));
}
/**
 * Builds the initial state for all passengers, mapping each passenger ID to an empty state object.
 */
function buildInitialPassengerStates(
	passengers: PassengerValues[]
): Record<string, ConfirmationPassengerDeadlineState> {
	return Object.fromEntries(passengers.map((passenger) => [passenger.id, {}]));
}
/**
 * Sets the state for a specific service of a passenger for a given segment.
 */
function setPassengerServiceState({
	passengerStates,
	passengerId,
	lfid,
	serviceKey,
	state,
}: {
	passengerStates: Record<string, ConfirmationPassengerDeadlineState>;
	passengerId: string;
	lfid: number;
	serviceKey: ConfirmationPurchaseDeadlineServiceKey;
	state: ConfirmationPassengerServiceDeadlineState;
}) {
	const passengerState = passengerStates[passengerId] ?? {};
	const segmentState = passengerState[lfid] ?? {};

	passengerStates[passengerId] = {
		...passengerState,
		[lfid]: {
			...segmentState,
			[serviceKey]: state,
		},
	};
}
/**
 * Retrieves the services for a specific passenger and segment.
 */
function getPassengerServicesForSegment(
	passenger: PassengerValues,
	serviceKey: Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle" | "seat">,
	lfid: number
): PassengerService[] {
	const category = SERVICE_CATEGORY_BY_KEY[serviceKey];
	return (passenger.services?.[category] ?? []).filter((service) => service.lfid === lfid);
}

/**
 * Removes expired services for a specific passenger and segment, updating the passenger object and generating cleanup instructions.
 */
function removeExpiredPassengerService({
	passenger,
	passengerId,
	serviceKey,
	lfid,
	cleanupInstructions,
}: {
	passenger: PassengerValues;
	passengerId: string;
	serviceKey: Exclude<ConfirmationPurchaseDeadlineServiceKey, "bundle">;
	lfid: number;
	cleanupInstructions: ConfirmationDeadlineCleanupInstruction[];
}) {
	if (serviceKey === "seat") {
		const seatsToRemove = (passenger.seats ?? []).filter((seat) => seat.lfid === lfid);
		passenger.seats = (passenger.seats ?? []).filter((seat) => seat.lfid !== lfid);

		for (const seat of seatsToRemove) {
			cleanupInstructions.push({
				type: "remove-seat",
				passengerId,
				lfid: seat.lfid,
				pfid: seat.pfid,
			});
		}

		return;
	}

	if (!passenger.services) {
		return;
	}

	const category = SERVICE_CATEGORY_BY_KEY[serviceKey];
	const servicesToRemove = (passenger.services[category] ?? []).filter(
		(service) => service.lfid === lfid
	);
	passenger.services = {
		...passenger.services,
		[category]: (passenger.services[category] ?? []).filter((service) => service.lfid !== lfid),
	};

	for (const service of servicesToRemove) {
		cleanupInstructions.push({
			type: "remove-service",
			passengerId,
			lfid: service.lfid,
			ssrCode: service.ssrCode,
			serviceID: service.serviceID,
		});
	}
}
/**
 * Validates the confirmation ancillary eligibility on page load, considering existing store data and passenger list.
 */
export function validateConfirmationAncillaryEligibilityOnLoad({
	bundleType: _bundleType,
	source: _source,
	destination: _destination,
	departureTime: _departureTime,
	passengerList,
	existingStoreData,
	labels,
}: ConfirmationOnLoadValidationInput): ConfirmationPurchaseDeadlineValidationResult {
	const { confirmedFlight } = existingStoreData;

	if (!confirmedFlight) {
		return {
			type: "passenger-services",
			sanitizedPassengers: passengerList,
			passengerStates: buildInitialPassengerStates(passengerList),
			cleanupInstructions: [],
		};
	}

	const allSegments = getAllSegments(confirmedFlight);
	const earliestUpcomingSegment = getEarliestUpcomingSegment(allSegments);
	const bookingErrorValidation = validateBookingErrorOnLoad({
		segment: earliestUpcomingSegment,
		departureTime: _departureTime,
		labels,
	});

	if (bookingErrorValidation) {
		return bookingErrorValidation;
	}

	const segmentsByLfid = new Map(allSegments.map((segment) => [segment.lfid, segment]));
	const bundleValidation = validatePurchasedBundleDeadline({
		segmentsByLfid,
		passengerList,
		labels,
	});

	if (bundleValidation) {
		return bundleValidation;
	}

	const sanitizedPassengers = clonePassengers(passengerList);
	const cleanupInstructions: ConfirmationDeadlineCleanupInstruction[] = [];
	const passengerStates = buildInitialPassengerStates(sanitizedPassengers);
	const noBundleEligibilityByLfid = buildNoBundleEligibilityByLfid(allSegments);
	const serviceKeys: ConfirmationPurchaseDeadlineServiceKey[] = [
		"bundle",
		"seat",
		"baggage",
		"meal",
		"priority",
		"lounge",
		"transport",
		"extras",
	];

	for (const passenger of sanitizedPassengers) {
		for (const segment of allSegments) {
			const remainingHours = getRemainingHoursForSegment(segment);
			const eligibilityCards = noBundleEligibilityByLfid.get(segment.lfid);

			for (const serviceKey of serviceKeys) {
				if (serviceKey === "bundle") {
					if (isPurchasedOnSegment(passenger, segment.lfid)) {
						continue;
					}

					const bundleState = validateUnpurchasedBundleDeadline({
						lfid: segment.lfid,
						remainingHours,
						outboundSegments: confirmedFlight.flights.outbound.segments,
					});

					if (bundleState) {
						setPassengerServiceState({
							passengerStates,
							passengerId: passenger.id,
							lfid: segment.lfid,
							serviceKey,
							state: bundleState,
						});
					}

					continue;
				}
				if (
					!isPassengerServiceDeadlinePassed({
						serviceKey,
						segment,
						remainingHours,
						eligibilityCards,
					})
				) {
					continue;
				}

				const isPurchased =
					serviceKey === "seat"
						? (passenger.seats ?? []).some((seat) => seat.lfid === segment.lfid)
						: getPassengerServicesForSegment(passenger, serviceKey, segment.lfid).length > 0;

				if (isPurchased) {
					removeExpiredPassengerService({
						passenger,
						passengerId: passenger.id,
						serviceKey,
						lfid: segment.lfid,
						cleanupInstructions,
					});
				}

				setPassengerServiceState({
					passengerStates,
					passengerId: passenger.id,
					lfid: segment.lfid,
					serviceKey,
					state: isPurchased
						? buildPurchasedDeadlineState({ serviceKey, lfid: segment.lfid })
						: buildUnpurchasedDeadlineState({ serviceKey, lfid: segment.lfid }),
				});
			}
		}
	}

	return {
		type: "passenger-services",
		sanitizedPassengers,
		passengerStates,
		cleanupInstructions,
	};
}
/**
 * Validates the confirmation purchase deadlines for all passengers and services.
 */
export function validateConfirmationPurchaseDeadlines({
	confirmedFlight,
	passengers,
	labels,
}: {
	confirmedFlight: ConfirmedFlightPayload | undefined;
	passengers: PassengerValues[];
	labels: ConfirmationPurchaseDeadlineValidationLabels;
}): ConfirmationPurchaseDeadlineValidationResult {
	const firstSegment = confirmedFlight?.flights.outbound.segments[0];

	return validateConfirmationAncillaryEligibilityOnLoad({
		bundleType: passengers.some((passenger) =>
			(passenger.bundles ?? []).some((bundle) => isPurchasedBundle(bundle.bundleCode))
		)
			? "Bundle"
			: "NoBundle",
		source: firstSegment?.origin ?? "",
		destination: firstSegment?.destination ?? "",
		departureTime: firstSegment ? getSegmentDepartureTime(firstSegment) : "",
		passengerList: passengers,
		existingStoreData: { confirmedFlight },
		labels,
	});
}
