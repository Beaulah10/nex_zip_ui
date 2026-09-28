/**
 * File: use-confirmation-data.ts
 * Description: Custom hook that reads all confirmation page data from the Redux
 * store and transforms it into display-ready structures via the confirmation
 * helpers. No API calls are made — all data originates from persisted store state.
 */

import { useLocale, useMessages, useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import { resolveDepartureDateTime } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { NO_BUNDLE_ID } from "@/modules/utils/constants/bundle/bundle.constants";
import { DEADLINE_VALIDATION_TYPES } from "@/modules/utils/constants/confirmation/confirmation.constants";
import { getAirportFullNameMap } from "@/modules/utils/helpers/airport";
import {
	isLoungeServiceRouteEnabled,
	isTransportServiceRouteEnabled,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	getBookingDirectionLabel,
	getBookingFlowType,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getCountryOptions } from "@/modules/utils/helpers/common/nationality-utils/nationality-utils";
import {
	buildPassengerDisplayList,
	buildTransitInfo,
	getFlightItineraryProps,
	getPassengerInfoRows,
	getSegmentItineraryProps,
	getTaxRows,
	getTaxRowsFromFareInfo,
	getTaxTotal,
	getTaxTotalFromFareInfo,
	type SummaryLabels,
	type TaxPassengerCategoryLabels,
} from "@/modules/utils/helpers/confirmation/confirmation";
import {
	validateConfirmationAncillaryEligibilityOnLoad,
	validateConfirmationPurchaseDeadlines,
} from "@/modules/utils/validations/confirmation/purchase-deadline";
import { useAppSelector } from "@/store/hooks";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	ConfirmationPageData,
	ConfirmationPurchaseDeadlineValidationResult,
} from "@/types/confirmation/confirmation.types";

/**
 * Calculates the grand total for a flight leg by summing all passenger fares.
 * Adds the leg's total tax amount to the aggregated passenger total and returns the final amount.
 */
function getLegGrandTotal(
	leg: Pick<ConfirmationPageData["outbound"], "passengers" | "taxTotalAmount">
) {
	const passengerTotal = leg.passengers.reduce(
		(total, passenger) => total + passenger.totalPrice,
		0
	);

	return passengerTotal + leg.taxTotalAmount;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Reads flight, passenger, and customer-information slices from the store and
 * returns a single `ConfirmationPageData` object ready for the confirmation page.
 */
export function useConfirmationData(): {
	pageData: ConfirmationPageData | undefined;
	isLoading: boolean;
	deadlineValidation: ConfirmationPurchaseDeadlineValidationResult;
} {
	const t = useTranslations("confirmation_page");
	const ancillaryServiceT = useTranslations("ancillary_service");
	const baggageServiceT = useTranslations("baggage_service");
	const flightSelectionT = useTranslations("flight_selection_page");
	const locale = useLocale();
	const messages = useMessages();

	// ── Store selectors ───────────────────────────────────────────────────────
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	// Passenger[] — personal details (name, passport, assistance) from customerInformation.slice
	const passengerDetailsList = useAppSelector(selectPassengerList);
	// Reuse the shared ordering hook: primary passenger first, then dependents
	const { orderedPassengers } = usePassengerOrder();

	// ── Pre-translated labels (stable across re-renders) ─────────────────────
	const labels = useMemo<SummaryLabels>(
		() => ({
			bundleLabel: t("bundle_label"),
			bundleUnavailableForAssociatedDependentNote: t(
				"bundle_unavailable_associated_dependent_note"
			),
			priorityAssociatedDependentIncludedNote: t(
				"priority_service_included_associated_dependent_note"
			),
			infantAssociatedDependentIncludedNote: t("infant_service_included_associated_dependent_note"),
			seatTypeLabel: t("seat_type_label"),
			seatLabel: t("seat_label"),
			baggageLabel: t("baggage_label"),
			mealLabel: t("meal_label"),
			priorityServicesLabel: t("priority_services_label"),
			airportLoungeLabel: t("airport_lounge_label"),
			transportServicesLabel: t("transport_services_label"),
			ancillaryOptionalServicesLabel: t("ancillary_optional_services_label"),
			flightChangeVoucherLabel: t("flight_change_voucher_label"),
			selectedLabel: t("selected_label"),
			addLabel: ancillaryServiceT("add_button"),
			changeLabel: t("change_button"),
			standardSeatTypeLabel: flightSelectionT("standard_cabin_label"),
			zipFullFlatSeatTypeLabel: flightSelectionT("zip_full_flat_label"),
			baggageTranslate: baggageServiceT,
			seatTypeNote: t("seat_type_note"),
			seatIncludedInBundleNote: t("seat_included_in_bundle_note"),
			notSelectedLabel: t("not_selected_label"),
			buildDeadlineSelectWarning: (serviceLabel: string) =>
				t("purchase_deadline_warning_select", { serviceName: serviceLabel }),
			buildDeadlineChangeWarning: (serviceLabel: string) =>
				t("purchase_deadline_warning_change", { serviceName: serviceLabel }),
			carryOnBaggage7kgLabel: baggageServiceT("select_carry_on_baggage_7kg"),
		}),
		[t, ancillaryServiceT, baggageServiceT, flightSelectionT]
	);
	const initialDeadlineValidationRef = useRef<{
		key: string;
		result: ConfirmationPurchaseDeadlineValidationResult;
	} | null>(null);
	const validationLabels = useMemo(
		() => ({
			locale,
			bookingErrorTitle: t("booking_error_title"),
			bookingErrorMessage: t("booking_error_message"),
			bookingErrorButtonLabel: t("booking_error_button_label"),
			bundleDeadlineTitle: t("bundle_deadline_title"),
			bundleDeadlineMessage: t("bundle_deadline_message"),
			bundleDeadlineButtonLabel: t("bundle_deadline_button_label"),
		}),
		[locale, t]
	);
	const confirmationValidationKey = useMemo(() => {
		if (!confirmedFlight || orderedPassengers.length === 0) {
			return "pending";
		}

		const segmentKey = [
			...confirmedFlight.flights.outbound.segments,
			...(confirmedFlight.flights.inbound?.segments ?? []),
		]
			.map((segment) => {
				const departureDateTime = resolveDepartureDateTime({
					departureDateTime: segment.scheduledDepartureArrivalDateTime?.departureDateTime,
					departureDateTimeOffset:
						segment.scheduledDepartureArrivalDateTime?.departureDateTimeOffset,
				});

				return `${segment.lfid}:${segment.pfid}:${segment.origin}:${segment.destination}:${departureDateTime}`;
			})
			.join("|");
		const bundleKey = orderedPassengers
			.map(
				(passenger) =>
					`${passenger.id}:${(passenger.bundles ?? [])
						.filter((bundle) => bundle.bundleCode !== NO_BUNDLE_ID)
						.map((bundle) => `${bundle.lfid}:${bundle.bundleCode}`)
						.sort()
						.join(",")}`
			)
			.join("|");

		return `${segmentKey}__${bundleKey}`;
	}, [confirmedFlight, orderedPassengers]);

	const deadlineValidation = useMemo<ConfirmationPurchaseDeadlineValidationResult>(() => {
		if (
			initialDeadlineValidationRef.current &&
			initialDeadlineValidationRef.current.key === confirmationValidationKey
		) {
			return initialDeadlineValidationRef.current.result;
		}

		if (!confirmedFlight) {
			return validateConfirmationPurchaseDeadlines({
				confirmedFlight,
				passengers: orderedPassengers,
				labels: validationLabels,
			});
		}

		if (orderedPassengers.length === 0) {
			return validateConfirmationPurchaseDeadlines({
				confirmedFlight,
				passengers: orderedPassengers,
				labels: validationLabels,
			});
		}

		const firstSegment = confirmedFlight.flights.outbound.segments[0];
		const validation = validateConfirmationAncillaryEligibilityOnLoad({
			bundleType: orderedPassengers.some((passenger) =>
				(passenger.bundles ?? []).some((bundle) => bundle.bundleCode !== NO_BUNDLE_ID)
			)
				? "Bundle"
				: "NoBundle",
			source: firstSegment?.origin ?? "",
			destination: firstSegment?.destination ?? "",
			departureTime: firstSegment
				? resolveDepartureDateTime({
						departureDateTime: firstSegment.scheduledDepartureArrivalDateTime?.departureDateTime,
						departureDateTimeOffset:
							firstSegment.scheduledDepartureArrivalDateTime?.departureDateTimeOffset,
					})
				: "",
			passengerList: orderedPassengers,
			existingStoreData: { confirmedFlight },
			labels: validationLabels,
		});

		initialDeadlineValidationRef.current = {
			key: confirmationValidationKey,
			result: validation,
		};
		return validation;
	}, [confirmationValidationKey, confirmedFlight, orderedPassengers, validationLabels]);

	const taxPassengerCategoryLabels = useMemo<TaxPassengerCategoryLabels>(() => {
		return {
			adult: t("tax_passenger_type_adult_label"),
			childA: t("tax_passenger_type_child_a_label"),
			childB: t("tax_passenger_type_child_b_label"),
			childC: t("tax_passenger_type_child_c_label"),
			infant: t("tax_passenger_type_infant_label"),
		};
	}, [t]);

	const nationalityMap = useMemo(
		() => new Map(getCountryOptions({ locale }).map((c) => [c.alpha3 ?? "", c.name])),
		[locale]
	);
	const airportFullNameMap = useMemo(
		() => getAirportFullNameMap(messages as Parameters<typeof getAirportFullNameMap>[0]),
		[messages]
	);

	// ── Derived page data ─────────────────────────────────────────────────────
	const pageData = useMemo<ConfirmationPageData | undefined>(() => {
		if (!confirmedFlight) return undefined;
		const displayPassengers = orderedPassengers;
		const passengerDeadlineStatesById =
			deadlineValidation.type === DEADLINE_VALIDATION_TYPES.PASSENGER_SERVICES
				? deadlineValidation.passengerStates
				: undefined;

		// Reorder personal details to match the shared passenger display order
		const passengerDetailsById = new Map(passengerDetailsList.map((detail) => [detail.id, detail]));
		const orderedPassengerDetails = displayPassengers
			.map((passenger) => passengerDetailsById.get(passenger.id))
			.filter((detail): detail is NonNullable<typeof detail> => detail !== undefined);

		const { flights } = confirmedFlight;
		const flowType = getBookingFlowType(confirmedFlight);
		const isConnecting = flowType === "connecting";
		const outboundSegmentLfids = new Set(flights.outbound.segments.map((segment) => segment.lfid));
		const inboundSegmentLfids = new Set(
			(flights.inbound?.segments ?? []).map((segment) => segment.lfid)
		);

		const outboundLabel = getBookingDirectionLabel({ confirmedFlight, direction: "outbound" });
		const inboundLabel = getBookingDirectionLabel({ confirmedFlight, direction: "inbound" });

		let outbound: ConfirmationPageData["outbound"];
		let inbound: ConfirmationPageData["inbound"];
		let transitInfo: ConfirmationPageData["transitInfo"];

		if (isConnecting) {
			// Each outbound segment gets its own itinerary card.
			const segment1 = flights.outbound.segments[0];
			const segment2 = flights.outbound.segments[1];
			const segment1FareInfo = flights.outbound.selectedFareInfos[0];
			const segment2FareInfo = flights.outbound.selectedFareInfos[1];
			const outboundPassengers = buildPassengerDisplayList(
				orderedPassengerDetails,
				displayPassengers,
				labels,
				segment1 ? new Set([segment1.lfid]) : outboundSegmentLfids,
				{
					fareInfo: segment1FareInfo,
					passengerDeadlineStatesById,
					isAirportLoungeRouteEnabled: isLoungeServiceRouteEnabled(segment1?.origin),
					isTransportServiceRouteEnabled: isTransportServiceRouteEnabled(
						segment1?.origin,
						segment1?.destination
					),
				}
			);
			const outboundTaxRows = getTaxRowsFromFareInfo(segment1FareInfo, taxPassengerCategoryLabels);
			const outboundTaxTotalAmount = getTaxTotalFromFareInfo(segment1FareInfo);

			outbound = {
				itinerary: segment1
					? getSegmentItineraryProps(segment1, outboundLabel, airportFullNameMap)
					: getFlightItineraryProps(flights.outbound, outboundLabel, airportFullNameMap),
				legLabel: outboundLabel,
				passengers: outboundPassengers,
				totalAmount: getLegGrandTotal({
					passengers: outboundPassengers,
					taxTotalAmount: outboundTaxTotalAmount,
				}),
				taxRows: outboundTaxRows,
				taxTotalAmount: outboundTaxTotalAmount,
			};

			if (segment2) {
				const inboundPassengers = buildPassengerDisplayList(
					orderedPassengerDetails,
					displayPassengers,
					labels,
					new Set([segment2.lfid]),
					{
						fareInfo: segment2FareInfo,
						passengerDeadlineStatesById,
						isAirportLoungeRouteEnabled: isLoungeServiceRouteEnabled(segment2.origin),
						isTransportServiceRouteEnabled: isTransportServiceRouteEnabled(
							segment2.origin,
							segment2.destination
						),
					}
				);
				const inboundTaxRows = getTaxRowsFromFareInfo(segment2FareInfo, taxPassengerCategoryLabels);
				const inboundTaxTotalAmount = getTaxTotalFromFareInfo(segment2FareInfo);

				inbound = {
					itinerary: getSegmentItineraryProps(segment2, inboundLabel, airportFullNameMap),
					legLabel: inboundLabel,
					passengers: inboundPassengers,
					totalAmount: getLegGrandTotal({
						passengers: inboundPassengers,
						taxTotalAmount: inboundTaxTotalAmount,
					}),
					taxRows: inboundTaxRows,
					taxTotalAmount: inboundTaxTotalAmount,
				};
			}

			if (segment1 && segment2) {
				transitInfo = buildTransitInfo(segment1, segment2, airportFullNameMap) ?? undefined;
			}
		} else {
			const outboundFirstSegment = flights.outbound.segments[0];
			const outboundLastSegment = flights.outbound.segments[flights.outbound.segments.length - 1];
			const outboundPassengers = buildPassengerDisplayList(
				orderedPassengerDetails,
				displayPassengers,
				labels,
				outboundSegmentLfids,
				{
					fareInfo: flights.outbound.selectedFareInfos[0],
					passengerDeadlineStatesById,
					isAirportLoungeRouteEnabled: isLoungeServiceRouteEnabled(outboundFirstSegment?.origin),
					isTransportServiceRouteEnabled: isTransportServiceRouteEnabled(
						outboundFirstSegment?.origin,
						outboundLastSegment?.destination
					),
				}
			);
			const outboundTaxRows = getTaxRows(flights.outbound, taxPassengerCategoryLabels);
			const outboundTaxTotalAmount = getTaxTotal(flights.outbound);
			// Oneway / roundtrip: each bound maps to one card and one section.
			outbound = {
				itinerary: getFlightItineraryProps(flights.outbound, outboundLabel, airportFullNameMap),
				legLabel: outboundLabel,
				passengers: outboundPassengers,
				totalAmount: getLegGrandTotal({
					passengers: outboundPassengers,
					taxTotalAmount: outboundTaxTotalAmount,
				}),
				taxRows: outboundTaxRows,
				taxTotalAmount: outboundTaxTotalAmount,
			};

			if (flights.inbound) {
				const inboundFirstSegment = flights.inbound.segments[0];
				const inboundLastSegment = flights.inbound.segments[flights.inbound.segments.length - 1];
				const inboundPassengers = buildPassengerDisplayList(
					orderedPassengerDetails,
					displayPassengers,
					labels,
					inboundSegmentLfids,
					{
						fareInfo: flights.inbound.selectedFareInfos[0],
						passengerDeadlineStatesById,
						isAirportLoungeRouteEnabled: isLoungeServiceRouteEnabled(inboundFirstSegment?.origin),
						isTransportServiceRouteEnabled: isTransportServiceRouteEnabled(
							inboundFirstSegment?.origin,
							inboundLastSegment?.destination
						),
					}
				);
				const inboundTaxRows = getTaxRows(flights.inbound, taxPassengerCategoryLabels);
				const inboundTaxTotalAmount = getTaxTotal(flights.inbound);
				inbound = {
					itinerary: getFlightItineraryProps(flights.inbound, inboundLabel, airportFullNameMap),
					legLabel: inboundLabel,
					passengers: inboundPassengers,
					totalAmount: getLegGrandTotal({
						passengers: inboundPassengers,
						taxTotalAmount: inboundTaxTotalAmount,
					}),
					taxRows: inboundTaxRows,
					taxTotalAmount: inboundTaxTotalAmount,
				};
			}
		}

		const grandTotalAmount = outbound.totalAmount + (inbound?.totalAmount ?? 0);

		return {
			outbound,
			inbound,
			transitInfo,
			isConnecting,
			passengerInfoRows: getPassengerInfoRows(orderedPassengers, nationalityMap),
			grandTotalAmount,
		};
	}, [
		confirmedFlight,
		deadlineValidation,
		passengerDetailsList,
		orderedPassengers,
		labels,
		taxPassengerCategoryLabels,
		nationalityMap,
		airportFullNameMap,
	]);

	return { pageData, isLoading: !confirmedFlight, deadlineValidation };
}
