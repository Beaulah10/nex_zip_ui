/**
 * File: confirmation.ts
 * Central export file for confirmation helpers, providing itinerary,
 * passenger summary, and tax-related utility functions and types.
 */

export {
	buildBundleSelectionUnavailableDialogState,
	buildConfirmationBundleChangePath,
	buildNoBundleSelectionState,
	buildNoBundlesAvailableDialogState,
	getBundleDirectionDisabled,
	hasInvalidConfirmationBundleSelection,
	isNoBundlesAvailableErrorCode,
} from "@/modules/utils/helpers/confirmation/confirmation-bundle/confirmation-bundle";
export {
	buildTransitInfo,
	getFlightItineraryProps,
	getSegmentItineraryProps,
} from "@/modules/utils/helpers/confirmation/confirmation-itinerary/confirmation-itinerary";
export {
	buildPassengerDisplayList,
	getPassengerAgeBadge,
	getPassengerInfoRows,
	getPassengerSummaryRows,
	getPassengerTotal,
	type SummaryLabels,
} from "@/modules/utils/helpers/confirmation/confirmation-passenger/confirmation-passenger";
export {
	buildConfirmationPassengerNameMap,
	getConfirmationAdjacentRequiredSeatPassengerIds,
	getMissingConfirmationMealPassengerNames,
	getMissingConfirmationSeatPassengerNames,
	getOrderedPassengerNames,
	getUniquePassengerNames,
	resolveConfirmationTopProceedIssue,
} from "@/modules/utils/helpers/confirmation/confirmation-proceed/confirmation-proceed";
export {
	buildConfirmationSeatErrorState,
	buildConfirmationSeatRouteLabel,
	buildConfirmationSeatUnavailableErrorState,
	getConfirmationEmergencyExitRestrictedPassengerIds,
	getConfirmationSeatSegment,
	getSeatMapDialogAction,
	prepareConfirmationSeatDialog,
} from "@/modules/utils/helpers/confirmation/confirmation-seat/confirmation-seat";
export {
	getSegmentTotalFromFareInfo,
	getTaxRows,
	getTaxRowsFromFareInfo,
	getTaxTotal,
	getTaxTotalFromFareInfo,
	type TaxPassengerCategoryLabels,
} from "@/modules/utils/helpers/confirmation/confirmation-tax/confirmation-tax";
export { buildConfirmationCreateOrderRequest } from "@/modules/utils/helpers/confirmation/create-order/create-order";
export { buildConfirmationOrderPrepareRequest } from "@/modules/utils/helpers/confirmation/order-prepare/order-prepare";
export type { ConfirmationTopProceedIssue } from "@/types/confirmation/confirmation.types";
export { detectLoungeAvailabilityIssue } from "./lounge-availability/lounge-availability";
