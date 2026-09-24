/**
 * File: customize.tsx
 * Description: Main Customize page component that orchestrates ancillary service dialogs
 * and passenger-level selections. Priority Service logic is delegated to usePriorityService.
 * Airport lounge passenger state is delegated to useAirportLounge.
 * SelectCustomers receives enable/disable behavior via disabledPassengerCategories.
 * It also coordinates ancillary availability, dialog state, and proceed-time bundle validation.
 */

"use client";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import baggageImage from "@/assets/images/baggageImage.png";
import expressServiceImageAsset from "@/assets/images/express-service.png";
import mealImageAsset from "@/assets/images/InflightMeal.png";
import shuttleImage from "@/assets/images/LeaLea-shuttle.png";
import seatImage from "@/assets/images/seat.png";
import AncillaryAlerts from "@/components/common/ancillary-alerts/ancillary-alerts";
import { BookingFooter } from "@/components/common/booking-footer/booking-footer";
import { BookingHeader } from "@/components/common/booking-header/booking-header";
import { ErrorDialog, type ErrorDialogAction } from "@/components/common/error-dialog/error-dialog";
import { LoadingOverlay } from "@/components/common/loading-overlay/loading-overlay";
import { ServicePromoCard } from "@/components/common/service-promo-card";
import { BaggageService } from "@/components/customize/baggage-service/baggage-service";
import { InflightMeals } from "@/components/customize/inflight-meals/inflight-meals";
import LoungeDialog from "@/components/customize/lounge-dialog/lounge-dialog";
import { SeatMapDialog } from "@/components/customize/seat-map/seat-map-dialog/seat-map-dialog";
import { TransportService } from "@/components/customize/transport-service/transport-service";
import {
	evaluateAncillaryEligibility,
	getDefaultResponse,
} from "@/modules/hooks/air-ancillary/air-ancillary";
import { useBookingBundleStatus } from "@/modules/hooks/common/booking-bundle-status/booking-bundle-status";
import {
	is24HourDeadlineExceeded,
	is96HourDeadlineExceeded,
} from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { getAirportLoungeImage } from "@/modules/hooks/common/lounge-service/lounge-service";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { usePriorityService } from "@/modules/hooks/common/priority-service/priority-service";
import { useServicePassengers } from "@/modules/hooks/common/service-passengers/service-passengers";
import { useInflightMealSummary } from "@/modules/hooks/customize/infight-meals/use-inflight-meal-summary/use-inflight-meal-summary";
import { BAGGAGE_INVENTORY_TYPE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import { TRANSPORT_SERVICE_SSR_CODES } from "@/modules/utils/constants/customer-information/transport-service/transport-service-constants/transport-service.constants";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import {
	formatBaggagePreselectedText,
	getBaggageOffersByPassengerType,
	getFreeBaggageItemCount,
} from "@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers";
import {
	getConnectingSegmentInfo,
	getDefaultBaggageActions,
} from "@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils";
import { compareBaggageServices } from "@/modules/utils/helpers/baggage-service/baggage-validation/baggage-validation";
import { getStoredBaggageByLfid } from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import { getAncillaryOffersErrorCodeFromBoundaryError } from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import {
	isPremiumBundleCode,
	isValueBundleCode,
	normalizeServiceCode,
} from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import {
	isDestinationHNLfromNRT,
	isDestinationNRTfromHNL,
	isLoungeServiceRouteEnabled,
	isTransportServiceRouteEnabled,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	type BookingFlowDirection,
	getBookingDirectionLabel,
	getBookingStageRoute,
	getBookingStageSegment,
	getNextBookingFlowPath,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import {
	getGroupedContentSuffix,
	resolveConfirmationBaggageInventory,
} from "@/modules/utils/helpers/confirmation/confirmation-baggage/baggage-availability/baggage-availability/baggage-availability";
import {
	applyBaggageShortageChanges,
	outOfStockValidationForUpdatedServices,
	removeAllBaggageServicesForPassengers,
} from "@/modules/utils/helpers/confirmation/confirmation-baggage/baggage-helpers/baggage-helpers";
import { resolveLoungeAvailabilityIssue } from "@/modules/utils/helpers/confirmation/lounge-availability/lounge-availability";
import { resolvePriorityAvailabilityIssue } from "@/modules/utils/helpers/confirmation/priority-availability/priority-availability";
import { resolveTransportAvailabilityIssue } from "@/modules/utils/helpers/confirmation/transport-availability/transport-availability";
import type { CustomizeAssets } from "@/modules/utils/helpers/customize/customize-assets";
import { handleInflightMealAncillaryOffer } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-ancillary-handler/inflight-meal-ancillary-handler";
import {
	formatMealSelectedText,
	formatRequiredMealSelectionText,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import { buildBundleIncludedMealCodesByPassengerId } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils"; /** Returns a string value when the input is a string, otherwise undefined. */
import { getTransportServiceAvailability } from "@/modules/utils/helpers/customize/transport-service/transport-service-card/transport-service-card-display";
import { buildSeatMapFromApiResponse } from "@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils";
import { isNoAvailableSeatsSeatMapError } from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import { getSeatSelectionAvailabilityDialogMessage } from "@/modules/utils/helpers/seat-map/seat-map-error-message/seat-map-error-message";
import {
	getSeatSelectionAvailabilityDialog,
	toSeatValidationPassengers,
} from "@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability";
import {
	buildAvailableSeatCodeSet,
	getCancelledSeatSelections,
	hasBundleSeatUnavailable,
} from "@/modules/utils/helpers/seat-map/seat-selection-cancellation/seat-selection-cancellation";
import { getSeatSelectionProgressSummary } from "@/modules/utils/helpers/seat-map/seat-selection-summary/seat-selection-summary";
import { extractLoungeServices } from "@/modules/utils/lounge.utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
	markCategoriesOutOfStock,
	selectAncillaryOffersRequestByDirectionAndServiceCategory,
	selectOutOfStockByDirectionAndServiceCategory,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	removeSeat,
	removeService,
	selectAncillaryTotalByLfid,
	selectPassengers,
} from "@/store/slices/passenger/passenger.slice";
import {
	buildRetrieveSeatMapRequest,
	clearSeatMap,
	fetchSeatMapOffers,
	selectSeatMapOutOfStock,
	selectSeatMapRequest,
	setSeatMapOutOfStock,
} from "@/store/slices/seat-map/seat-map.slice";
import type {
	CancelledSeatSelection,
	SeatSelectionDialogType,
} from "@/types/seat-map/seat-map.types";
import { PriorityServiceDialog } from "./priority-service/priority-service";

const toOptionalString = (value: unknown): string | undefined =>
	typeof value === "string" ? value : undefined;

const ancillaryServiceCategories = {
	SEAT: "AMENITIES",
	BAGGAGE: "BAGGAGE",
	MEAL: "MEALS",
	PRIORITY: "AMENITIES",
	LOUNGE: "LOUNGE",
	TRANSPORT: "TRANSPORTATION",
} as const;

/** Maps a bundle identifier to the ancillary service category used by the offers API. */
function getAncillaryServiceCategory(id: keyof typeof ancillaryServiceCategories) {
	return ancillaryServiceCategories[id];
}
/** Returns true when every provided service has zero available quantity. */
function areAllServicesOutOfStock(services: { qtyAvailable?: number }[]): boolean {
	return services.length > 0 && services.every((service) => (service.qtyAvailable ?? 0) === 0);
}

/** Maps a bundle identifier to the ancillary eligibility card key. */
function getAncillaryCardKey(title: keyof typeof ancillaryServiceCategories) {
	if (title === "SEAT") return "seat";
	if (title === "BAGGAGE") return "baggage";
	if (title === "MEAL") return "meal";
	if (title === "PRIORITY") return "express";
	if (title === "LOUNGE") return "lounge";
	return "transport";
}

/**
 * Render the Customize page and orchestrate ancillary dialogs and passenger selections.
 */
export function Customize({
	locale,
	direction,
	customizeAssets,
}: {
	locale: string;
	direction: BookingFlowDirection;
	customizeAssets?: CustomizeAssets;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const dispatch = useAppDispatch();
	const mealLabels = useTranslations("meals_service");
	const t = useTranslations("ancillary_service");
	const expressServiceT = useTranslations("express_service");
	const loungeServiceT = useTranslations("lounge_service");
	const transportServiceT = useTranslations("transportation_service");
	const seatDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
	const inflightMealTriggerRef = useRef<HTMLButtonElement | null>(null);
	const passengers = useAppSelector(selectPassengerList);
	const passengersWithBundles = useAppSelector(selectPassengers);
	const storedPassengers = useAppSelector(selectPassengers);
	const seatLabels = useTranslations("seat_service");
	const baggageServiceLabels = useTranslations("baggage_service");
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const { servicePassengers } = useServicePassengers(direction);
	const stageLabel = getBookingDirectionLabel({ confirmedFlight, direction });
	const ancillaryScope = getBookingStageSegment({ confirmedFlight, direction });
	const bundleType = useBookingBundleStatus(direction);
	const selectedAncillarySegment =
		confirmedFlight !== undefined
			? getSelectedAncillarySegment({ confirmedFlight, direction })
			: undefined;

	const ancillaryResult = useMemo(() => {
		if (!selectedAncillarySegment) {
			return getDefaultResponse();
		}

		return evaluateAncillaryEligibility({
			pageType: "customize",
			bundleType,
			source: selectedAncillarySegment.origin,
			destination: selectedAncillarySegment.destination,
			departureTime:
				selectedAncillarySegment.scheduledDepartureArrivalDateTime?.departureDateTimeOffset ?? "",
			t,
		});
	}, [bundleType, selectedAncillarySegment, t]);

	const routeLabel = selectedAncillarySegment
		? getAirportRouteLabel([selectedAncillarySegment])
		: "";
	const isTransportServiceEnabled = isTransportServiceRouteEnabled(
		selectedAncillarySegment?.origin,
		selectedAncillarySegment?.destination
	);
	const isNrtToHnlRoute = isDestinationHNLfromNRT(
		selectedAncillarySegment?.origin,
		selectedAncillarySegment?.destination
	);
	const isHnlToNrtRoute = isDestinationNRTfromHNL(
		selectedAncillarySegment?.origin,
		selectedAncillarySegment?.destination
	);

	const transportDepartureDateTime =
		selectedAncillarySegment?.scheduledDepartureArrivalDateTime?.departureDateTimeOffset ??
		selectedAncillarySegment?.scheduledDepartureArrivalDateTime?.departureDateTime ??
		"";

	const isTransportServiceDeadlinePassed =
		(isNrtToHnlRoute && is24HourDeadlineExceeded(transportDepartureDateTime)) ||
		(isHnlToNrtRoute && is96HourDeadlineExceeded(transportDepartureDateTime));
	const currentRoute = getBookingStageRoute({
		section: "customize",
		confirmedFlight,
		direction,
	});
	const isConfirmationChangeFlow = searchParams.get("changeFlow") === "confirmation";
	const confirmationChangeQuery = isConfirmationChangeFlow ? searchParams.toString() : "";
	const { orderedPassengersWithNames } = usePassengerOrder();

	const isLoungeServiceEnabled = isLoungeServiceRouteEnabled(selectedAncillarySegment?.origin);

	// Step-through state management for single-modal flows
	const transportServiceTriggerRef = useRef<HTMLButtonElement | null>(null);
	const [isBundleLoading, setIsBundleLoading] = useState(false);
	const [isLimitedStockAlertOpen, setIsLimitedStockAlertOpen] = useState(false);
	const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState(false);
	const [unavailableDialogTitle, setUnavailableDialogTitle] = useState("");
	const [unavailableDialogContent, setUnavailableDialogContent] = useState("");
	const [unavailableDialogButtonLabel, setUnavailableDialogButtonLabel] = useState<string>();
	const [errorDialogAction, setErrorDialogAction] = useState<ErrorDialogAction>("returnToTop");
	const [pendingDialogAfterError, setPendingDialogAfterError] = useState<
		"MEAL" | "LOUNGE" | "PRIORITY" | "TRANSPORT" | "BAGGAGE" | null
	>(null);
	const [mealDialogInitialPassengerId, setMealDialogInitialPassengerId] = useState<string>();
	const [unavailableMealPassengerIds, setUnavailableMealPassengerIds] = useState<
		ReadonlySet<string>
	>(new Set());
	const [unavailableSeatSelections, setUnavailableSeatSelections] = useState<
		CancelledSeatSelection[]
	>([]);
	const [showBundleCompletionAlert, setShowBundleCompletionAlert] = useState(false);
	const [categoryToMarkOutOfStock, setCategoryToMarkOutOfStock] = useState<
		keyof typeof ancillaryServiceCategories | null
	>(null);
	const isCurrentDirectionICNRoute = servicePassengers.some((passenger) => passenger.isIcnRoute);
	const bundledMealPassengerCount = servicePassengers.filter((passenger) => {
		if (isCurrentDirectionICNRoute) {
			return isPremiumBundleCode(passenger.bundleCode);
		}

		return isValueBundleCode(passenger.bundleCode) || isPremiumBundleCode(passenger.bundleCode);
	}).length;

	const selectedSegment = confirmedFlight
		? getSelectedAncillarySegment({
				confirmedFlight,
				direction,
			})
		: undefined;

	const currentLfid = selectedSegment?.lfid;
	const { selectedMealPassengerCount, requiredMealSelectionCount } = useInflightMealSummary({
		selectedAncillarySegmentLfid: currentLfid,
		servicePassengers,
		storedPassengers,
		unavailablePassengerIds: unavailableMealPassengerIds,
	});
	const mealSelectedCount = formatMealSelectedText(selectedMealPassengerCount);
	const inflightMealSelectedText = mealSelectedCount
		? mealLabels(mealSelectedCount, { count: selectedMealPassengerCount })
		: undefined;
	const freeSelectionsCount = formatRequiredMealSelectionText(requiredMealSelectionCount);
	const inflightMealFreeSelectionsText = freeSelectionsCount
		? mealLabels(freeSelectionsCount, { count: requiredMealSelectionCount })
		: undefined;
	const currentPfid = selectedSegment?.pfid;

	const seatSelectionSummary = getSeatSelectionProgressSummary({
		servicePassengers,
		adjacentPassengers: orderedPassengersWithNames,
		storedPassengers,
		currentLfid,
		currentPfid,
		labels: {
			selectedSingle: (count) =>
				seatLabels("seat_selection_summary_selected_single", {
					count: String(count),
				}),
			selectedMultiple: (count) =>
				seatLabels("seat_selection_summary_selected_multiple", {
					count: String(count),
				}),
			requiredSingle: (count) =>
				seatLabels("seat_selection_summary_required_single", {
					count: String(count),
				}),
			requiredMultiple: (count) =>
				seatLabels("seat_selection_summary_required_multiple", {
					count: String(count),
				}),
			allSelected: seatLabels("seat_selection_summary_all_selected"),
		},
	});
	const bundleCompletionAlertData =
		seatSelectionSummary.remainingRequiredSeatCount > 0 &&
		seatSelectionSummary.remainingBundleRequiredSeatCount === 0 &&
		seatSelectionSummary.remainingAdjacentRequiredSeatCount > 0
			? {
					title: t("error_labels.adjacent_seat_error_title"),
				}
			: {
					title: t("error_labels.mandatory_bundle_selection_error_title"),
				};

	const ancillaryTotal = useAppSelector((state) => selectAncillaryTotalByLfid(state, currentLfid));
	const isLoungeOutOfStock = useAppSelector((state) =>
		selectOutOfStockByDirectionAndServiceCategory(state, ancillaryScope, "LOUNGE")
	);
	const loungeRequest = useAppSelector((state) =>
		selectAncillaryOffersRequestByDirectionAndServiceCategory(state, ancillaryScope, "LOUNGE")
	);
	const showLoungeOutOfStockBanner = isLoungeOutOfStock && loungeRequest?.lfid === currentLfid;

	const isPriorityOutOfStock = useAppSelector((state) =>
		selectOutOfStockByDirectionAndServiceCategory(state, ancillaryScope, "AMENITIES")
	);
	const priorityRequest = useAppSelector((state) =>
		selectAncillaryOffersRequestByDirectionAndServiceCategory(state, ancillaryScope, "AMENITIES")
	);
	const showPriorityOutOfStockBanner =
		isPriorityOutOfStock && priorityRequest?.lfid === currentLfid;

	const isTransportOutOfStock = useAppSelector((state) =>
		selectOutOfStockByDirectionAndServiceCategory(state, ancillaryScope, "TRANSPORTATION")
	);
	const transportRequest = useAppSelector((state) =>
		selectAncillaryOffersRequestByDirectionAndServiceCategory(
			state,
			ancillaryScope,
			"TRANSPORTATION"
		)
	);
	const showTransportOutOfStockBanner =
		isTransportOutOfStock && transportRequest?.lfid === currentLfid;

	const isBaggageOutOfStock = useAppSelector((state) =>
		selectOutOfStockByDirectionAndServiceCategory(state, ancillaryScope, "BAGGAGE")
	);
	const baggageRequest = useAppSelector((state) =>
		selectAncillaryOffersRequestByDirectionAndServiceCategory(state, ancillaryScope, "BAGGAGE")
	);
	const showBaggageOutOfStockBanner = isBaggageOutOfStock && baggageRequest?.lfid === currentLfid;

	const isMealOutOfStock = useAppSelector((state) =>
		selectOutOfStockByDirectionAndServiceCategory(state, ancillaryScope, "MEALS")
	);
	const mealRequest = useAppSelector((state) =>
		selectAncillaryOffersRequestByDirectionAndServiceCategory(state, ancillaryScope, "MEALS")
	);
	const showMealOutOfStockBanner = isMealOutOfStock && mealRequest?.lfid === currentLfid;
	const isSeatOutOfStock = useAppSelector((state) =>
		selectSeatMapOutOfStock(state, ancillaryScope)
	);
	const seatMapRequest = useAppSelector(selectSeatMapRequest);
	const showSeatOutOfStockBanner =
		isSeatOutOfStock && seatMapRequest?.logicalFlightId === currentLfid;
	const [showBaggageSegmentMismatchBanner, setShowBaggageSegmentMismatchBanner] = useState(false);
	const baggageSelectedItemsText = formatBaggagePreselectedText(
		servicePassengers.reduce(
			(totalItems, passenger) => totalItems + getFreeBaggageItemCount(passenger.bundleCode),
			0
		)
	);
	// Baggage Service --------------------------------------------
	const { isConnectingFlight, otherLfid } = useMemo(
		() =>
			confirmedFlight
				? getConnectingSegmentInfo({
						confirmedFlight,
						direction,
					})
				: {
						isConnectingFlight: false,
						otherLfid: undefined,
					},
		[confirmedFlight, direction]
	);
	const baggageTriggerRef = useRef<HTMLButtonElement | null>(null);
	//  Baggage-Selection : On Load of Ancillary Service page sending default service slection
	const initializedBaggageLfidRef = useRef<number | null>(null);
	const showAncillaryBanner = Boolean(ancillaryResult.bannerTitle);
	useEffect(() => {
		if (!currentLfid) {
			return;
		}

		if (initializedBaggageLfidRef.current === currentLfid) {
			return;
		}

		const defaultBaggageActions = getDefaultBaggageActions({
			currentLfid: Number(currentLfid),
			currentPfid,
			servicePassengers,
			orderedPassengersWithNames,
		});
		for (const action of defaultBaggageActions) {
			dispatch(action);
		}
		initializedBaggageLfidRef.current = currentLfid;
	}, [currentLfid, currentPfid, dispatch, orderedPassengersWithNames, servicePassengers]);

	// Auto-dismiss bundle completion alert when validation passes
	useEffect(() => {
		const isMealCompleted = requiredMealSelectionCount === 0;
		const isBaggageCompleted = true;
		const isSeatCompleted = seatSelectionSummary.remainingRequiredSeatCount === 0;

		if (isSeatCompleted && isMealCompleted && isBaggageCompleted) {
			setShowBundleCompletionAlert(false);
		}
	}, [requiredMealSelectionCount, seatSelectionSummary.remainingRequiredSeatCount]);

	// Scroll to top when ancillary banner alert appears
	useEffect(() => {
		if (showAncillaryBanner) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [showAncillaryBanner]);

	const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({
		SEAT: false,
		BAGGAGE: false,
		MEAL: false,
		PRIORITY: false,
		LOUNGE: false,
		TRANSPORT: false,
	});

	const outboundBundles = [
		{
			id: "SEAT",
			imageSrc: customizeAssets?.seatImage?.url ?? seatImage.src,
			icon: "airline_seat_recline_extra",
			title: t("seat_service_name"),
			description: t("seat_service_description"),
		},
		{
			id: "BAGGAGE",
			imageSrc: customizeAssets?.baggageImage?.url ?? baggageImage.src,
			icon: "luggage",
			discountLabel: "30% Discount",
			title: t("baggage_service_name"),
			description: t("baggage_service_description"),
		},
		{
			id: "MEAL",
			imageSrc: customizeAssets?.mealImage?.url ?? mealImageAsset.src,
			icon: "restaurant",
			discountLabel: "Most Popular",
			title: t("meal_service_name"),
			description: t("inflight_meal_service_description"),
		},
		{
			id: "PRIORITY",
			imageSrc: customizeAssets?.expressServiceImage?.url ?? expressServiceImageAsset.src,
			icon: "airplane_ticket",
			title: t("priority_service_name"),
			description: t("priority_service_description"),
		},
		{
			id: "LOUNGE",
			imageSrc: getAirportLoungeImage(selectedAncillarySegment?.origin, customizeAssets),
			icon: "weekend",
			title: t("airport_lounge_name"),
			description: t("airport_lounge_service_description"),
		},
		{
			id: "TRANSPORT",
			imageSrc: customizeAssets?.transportServiceImage?.url ?? shuttleImage.src,
			icon: "airport_shuttle",
			title: t("transportation_service_name"),
			description: t("transportation_service_description"),
			fill: 1,
		},
	] as const;

	const {
		priorityServicePassengers,
		priorityServiceTotalAmount,
		hasOutOfStockPassengers,
		remainingStocksLabel,
		showTransitApplicabilityWarning,
		togglePriorityPax,
		togglePrioritySelectAll,
		confirmPrioritySelection,
	} = usePriorityService(direction, Boolean(openDialogs.PRIORITY));

	/**
	 * Build lounge pax state from ordered passengers.
	 * Labels and pricing will be handled by SelectCustomers component internally.
	 */

	/** Opens a specific ancillary dialog by bundle identifier. */
	const openDialog = (title: string) => {
		setOpenDialogs((prev) => ({ ...prev, [title]: true }));
	};

	/** Closes a specific ancillary dialog by bundle identifier. */
	const closeDialog = (title: string) => {
		setOpenDialogs((prev) => ({ ...prev, [title]: false }));
	};

	/** Shows the shared error dialog and optionally tracks seat selections that must be cleared. */
	const openErrorDialog = (
		title: string,
		content: string,
		seatSelectionsToRemove: CancelledSeatSelection[] = [],
		buttonLabel?: string,
		action: ErrorDialogAction = "returnToTop"
	) => {
		setUnavailableDialogTitle(title);
		setUnavailableDialogContent(content);
		setUnavailableDialogButtonLabel(buttonLabel);
		setUnavailableSeatSelections(seatSelectionsToRemove);
		setErrorDialogAction(action);
		setIsUnavailableDialogOpen(true);
	};

	/** Maps seat availability dialog types to the follow-up action expected by the modal. */
	const getSeatMapDialogAction = (dialogType: SeatSelectionDialogType): ErrorDialogAction => {
		switch (dialogType) {
			case "NO_AVAILABLE_SEATS":
				return "close";
			case "NO_ADJACENT_SEATS":
				return "returnToTop";
			case "UNAVAILABLE_SELECTED_SEAT":
				return "returnToTop";
		}
	};

	/** Opens a seat-map-specific dialog using translated copy and optional seat cleanup metadata. */
	const openSeatMapDialog = ({
		dialogType,
		seatSelectionsToRemove = [],
		action,
		contentSuffix,
		useAdjacentSeatCancellationMessage,
	}: {
		dialogType: SeatSelectionDialogType;
		seatSelectionsToRemove?: CancelledSeatSelection[];
		action?: ErrorDialogAction;
		contentSuffix?: string;
		useAdjacentSeatCancellationMessage?: boolean;
	}) => {
		const dialogMessage = getSeatSelectionAvailabilityDialogMessage(seatLabels, dialogType, {
			useAdjacentSeatCancellationMessage,
		});

		openErrorDialog(
			dialogMessage.title,
			contentSuffix ? `${dialogMessage.content}\n\n${contentSuffix}` : dialogMessage.content,
			seatSelectionsToRemove,
			dialogMessage.buttonLabel,
			action ?? getSeatMapDialogAction(dialogType)
		);
	};

	/** Handles error dialog confirmation and restores the seat flow when cancelled seats exist. */
	const handleErrorDialog = () => {
		if (unavailableSeatSelections.length > 0) {
			for (const unavailableSeatSelection of unavailableSeatSelections) {
				dispatch(
					removeSeat({
						passengerId: unavailableSeatSelection.passengerId,
						lfid: unavailableSeatSelection.lfid,
						pfid: unavailableSeatSelection.pfid,
					})
				);
			}
			setUnavailableSeatSelections([]);
			setIsUnavailableDialogOpen(false);
			setIsLimitedStockAlertOpen(false);
			setOpenDialogs((prev) => ({ ...prev, SEAT: true }));
			return;
		}

		if (categoryToMarkOutOfStock === "MEAL") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "MEALS",
					isOutOfStock: true,
				})
			);
			setCategoryToMarkOutOfStock(null);
		}

		setIsUnavailableDialogOpen(false);
		setIsLimitedStockAlertOpen(false);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	/** Applies ancillary availability rules before delegating to the bundle click handler. */
	const handleAncillaryCardClick = (bundle: (typeof outboundBundles)[number]) => {
		const cardKey = getAncillaryCardKey(bundle.id);
		const cardState = ancillaryResult.cards[cardKey];

		if (!cardState.enabled) {
			if (cardState.showPopupOnClick) {
				openErrorDialog(
					t("error_labels.popup_error_title"),
					cardState.popupMessage ?? t("error_labels.popup_error_message")
				);
			}

			return;
		}

		handleBundleClick(bundle);
	};

	/** Resets transient dialog state when the shared error dialog closes. */
	/** Resets transient dialog state when the shared error dialog closes. */
	const handleErrorDialogOpenChange = (open: boolean) => {
		setIsUnavailableDialogOpen(open);

		if (!open) {
			setIsLimitedStockAlertOpen(false);
			if (categoryToMarkOutOfStock === "MEAL") {
				dispatch(
					markCategoriesOutOfStock({
						scope: ancillaryScope,
						serviceCategory: "MEALS",
						isOutOfStock: true,
					})
				);
				setCategoryToMarkOutOfStock(null);
			}

			if (pendingDialogAfterError === "MEAL") {
				setMealDialogInitialPassengerId(undefined);
				setOpenDialogs((prev) => ({ ...prev, MEAL: true }));
			}
			if (pendingDialogAfterError === "LOUNGE") {
				setOpenDialogs((prev) => ({ ...prev, LOUNGE: true }));
			}
			if (pendingDialogAfterError === "PRIORITY") {
				setOpenDialogs((prev) => ({ ...prev, PRIORITY: true }));
			}
			if (pendingDialogAfterError === "TRANSPORT") {
				setOpenDialogs((prev) => ({ ...prev, TRANSPORT: true }));
			}
			if (pendingDialogAfterError === "BAGGAGE") {
				setOpenDialogs((prev) => ({ ...prev, BAGGAGE: true }));
			}
			setPendingDialogAfterError(null);
			setErrorDialogAction("returnToTop");
		}
	};

	/** Loads bundle data and opens the matching ancillary dialog when the service is available. */
	const handleBundleClick = async (bundle: (typeof outboundBundles)[number]) => {
		// Only reset the banner for the specific bundle being clicked
		setMealDialogInitialPassengerId(undefined);
		setCategoryToMarkOutOfStock(null);
		if (bundle.id === "SEAT" && ancillaryScope) {
			dispatch(setSeatMapOutOfStock({ scope: ancillaryScope, isOutOfStock: false }));
		}
		if (bundle.id === "LOUNGE") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "LOUNGE",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "BAGGAGE") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "BAGGAGE",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "PRIORITY") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "AMENITIES",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "MEAL") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "MEALS",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "TRANSPORT") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "TRANSPORTATION",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "MEAL") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "MEALS",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "BAGGAGE") {
			dispatch(
				markCategoriesOutOfStock({
					scope: ancillaryScope,
					serviceCategory: "BAGGAGE",
					isOutOfStock: false,
				})
			);
		}
		if (bundle.id === "TRANSPORT" && !isTransportServiceEnabled) {
			return;
		}
		if (bundle.id === "TRANSPORT" && isTransportServiceDeadlinePassed) {
			return;
		}

		if (bundle.id === "LOUNGE" && !isLoungeServiceEnabled) {
			return;
		}
		setIsBundleLoading(true);
		try {
			if (bundle.id !== "TRANSPORT") {
				openDialog(bundle.title);
			}

			if (!confirmedFlight || passengers.length === 0) {
				return;
			}
			// Seat Map API
			if (bundle.id === "SEAT") {
				const seatSegment = getSelectedAncillarySegment({
					confirmedFlight,
					direction,
				});

				if (!seatSegment) {
					return;
				}

				let request: ReturnType<typeof buildRetrieveSeatMapRequest>;

				try {
					request = buildRetrieveSeatMapRequest(confirmedFlight, seatSegment);
				} catch {
					openErrorDialog(
						seatLabels("service_unavailable_title"),
						seatLabels("service_unavailable_description")
					);
					return;
				}

				const resultAction = await dispatch(
					fetchSeatMapOffers({
						locale,
						request,
					})
				);

				if (fetchSeatMapOffers.fulfilled.match(resultAction)) {
					const cabinClass = request.cabin === "ZIPFULLFLAT" ? "ZipFullFlat" : "Standard";
					const builtSeatMap = buildSeatMapFromApiResponse(
						resultAction.payload.data?.seatInfo ?? [],
						cabinClass
					);
					const availableSeatCodes = buildAvailableSeatCodeSet(builtSeatMap);
					dispatch(
						setSeatMapOutOfStock({
							scope: ancillaryScope,
							isOutOfStock: availableSeatCodes.size === 0,
						})
					);
					const cancelledSelections = getCancelledSeatSelections({
						orderedPassengersWithNames,
						storedPassengers,
						lfid: seatSegment.lfid,
						pfid: seatSegment.pfid ?? 0,
						availableSeatCodes,
					});
					const seatSelectionDialog = getSeatSelectionAvailabilityDialog({
						cabins: builtSeatMap,
						cabinType: request.cabin === "ZIPFULLFLAT" ? "ZIP_FULL_FLAT" : "STANDARD",
						passengers: toSeatValidationPassengers(orderedPassengersWithNames),
					});

					if (cancelledSelections.length > 0) {
						const isBundleIncludedSeatUnavailable = hasBundleSeatUnavailable({
							cancelledSelections,
							storedPassengers,
							lfid: seatSegment.lfid,
						});

						/**
						 * Bundle-Included Seat Out-of-Stock:
						 * A seat included in the selected bundle is no longer available.
						 * Clear the affected seat selections and return to the TOP page.
						 */
						if (isBundleIncludedSeatUnavailable) {
							for (const unavailableSeatSelection of cancelledSelections) {
								dispatch(
									removeSeat({
										passengerId: unavailableSeatSelection.passengerId,
										lfid: unavailableSeatSelection.lfid,
										pfid: unavailableSeatSelection.pfid,
									})
								);
							}

							dispatch(clearSeatMap());
							closeDialog("SEAT");

							openErrorDialog(
								seatLabels("error_labels.bundle_seat_unavailable_title"),
								seatLabels("error_labels.bundle_seat_unavailable_description"),
								[],
								seatLabels("error_labels.bundle_seat_unavailable_button"),
								"returnToTop"
							);

							return;
						}

						/**
						 *No Bundle and Next-Seat Guarantee scenarios.
						 */
						const passengerList = cancelledSelections
							.map((selection) => `${selection.seatCode} : ${selection.passengerName}`)
							.join("\n");

						openSeatMapDialog({
							dialogType: "UNAVAILABLE_SELECTED_SEAT",
							seatSelectionsToRemove: cancelledSelections,
							action: "returnToTop",
							contentSuffix: passengerList,
							useAdjacentSeatCancellationMessage: cancelledSelections.some(
								(selection) => selection.isAdjacentSeatRelated
							),
						});
						return;
					}
					if (seatSelectionDialog) {
						dispatch(clearSeatMap());
						openSeatMapDialog({ dialogType: seatSelectionDialog });
						return;
					}

					openDialog(bundle.id);
					return;
				}

				if (resultAction.meta.condition) {
					return;
				}

				if (
					fetchSeatMapOffers.rejected.match(resultAction) &&
					isNoAvailableSeatsSeatMapError(resultAction.payload)
				) {
					dispatch(clearSeatMap());
					if (ancillaryScope) {
						dispatch(setSeatMapOutOfStock({ scope: ancillaryScope, isOutOfStock: true }));
					}
					openSeatMapDialog({ dialogType: "NO_AVAILABLE_SEATS" });
					return;
				}
				openErrorDialog(
					seatLabels("service_unavailable_title"),
					seatLabels("service_unavailable_description")
				);

				return;
			}
			// Ancillary API
			const ancillaryDirection = getBookingStageSegment({
				confirmedFlight,
				direction,
			});

			const selectedSegment = getSelectedAncillarySegment({
				confirmedFlight,
				direction,
			});

			if (!selectedSegment) {
				return;
			}
			let request: ReturnType<typeof buildRetrieveOfferAncillariesRequest>;
			try {
				request = buildRetrieveOfferAncillariesRequest({
					confirmedFlight,
					segment: selectedSegment,
					passengers,
					serviceCategory: getAncillaryServiceCategory(bundle.id),
				});
			} catch {
				openErrorDialog(t("service_unavailable_title"), t("service_unavailable_message"));
				return;
			}
			const resultAction = await dispatch(
				fetchAncillaryOffers({ scope: ancillaryDirection, request })
			);

			if (fetchAncillaryOffers.fulfilled.match(resultAction)) {
				if (bundle.id === "TRANSPORT") {
					const transportAvailabilityIssue = resolveTransportAvailabilityIssue({
						ancillaryData: resultAction.payload,
						storedPassengers,
						orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
						lfid: selectedSegment.lfid,
						clickedPassengerId: "",
						allPassengerIds: servicePassengers.map((passenger) => passenger.id),
					});
					// Scenario 1:
					// No transport services available.
					if (transportAvailabilityIssue.type === "all-transports-unavailable") {
						for (const transportToRemove of transportAvailabilityIssue.transportsToRemove) {
							dispatch(removeService(transportToRemove));
						}

						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "TRANSPORTATION",
								isOutOfStock: true,
							})
						);

						openErrorDialog(
							transportServiceT("error_labels.transport_no_services_available_title"),
							transportServiceT("error_labels.transport_no_services_available_content"),
							[],
							transportServiceT("error_labels.transport_no_services_available_button"),
							"close"
						);

						return;
					}

					// Scenario 2:
					// Previously selected transport became unavailable.
					if (transportAvailabilityIssue.type === "selected-transport-unavailable") {
						for (const transportToRemove of transportAvailabilityIssue.transportsToRemove) {
							dispatch(removeService(transportToRemove));
						}
						setPendingDialogAfterError("TRANSPORT");
						openErrorDialog(
							transportServiceT("error_labels.transport_selection_cancelled_title"),
							`${transportServiceT(
								"error_labels.transport_selection_cancelled_content"
							)}\n\n${transportAvailabilityIssue.contentSuffix}`,
							[],
							transportServiceT("error_labels.transport_selection_cancelled_button"),
							"close"
						);

						return;
					}

					const { hasAnySupportedTransportSsr } = getTransportServiceAvailability(
						resultAction.payload
					);

					const transportServices =
						resultAction.payload?.data?.servicesPerPassengerType?.flatMap((entry) =>
							entry.categories.flatMap((category) =>
								category.specialServices.filter((service) =>
									(TRANSPORT_SERVICE_SSR_CODES as string[]).includes(service.ssrCode)
								)
							)
						) ?? [];

					const isTransportOutOfStock =
						!hasAnySupportedTransportSsr || areAllServicesOutOfStock(transportServices);

					if (isTransportOutOfStock) {
						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "TRANSPORTATION",
								isOutOfStock: true,
							})
						);

						openErrorDialog(
							transportServiceT("error_labels.transport_no_services_available_title"),
							transportServiceT("error_labels.transport_no_services_available_content"),
							[],
							transportServiceT("error_labels.transport_no_services_available_button"),
							"close"
						);

						return;
					}
				}

				if (bundle.id === "MEAL") {
					const adultEntry = resultAction.payload?.data?.servicesPerPassengerType?.find(
						(entry) => entry.passengerType === "adult"
					);

					const mealServices =
						adultEntry?.categories
							.filter(
								(category) => category.title === "In-Flight Meals" || category.title === "Drinks"
							)
							.flatMap((category) => category.specialServices) ?? [];

					// 1. Bundle-included meal SSR missing from response → service unavailable popup
					if (bundledMealPassengerCount > 0) {
						const directionSegmentLfids = new Set(selectedSegment ? [selectedSegment.lfid] : []);

						const bundleIncludedMealCodesByPassengerId = buildBundleIncludedMealCodesByPassengerId({
							passengers: passengersWithBundles,
							directionSegmentLfids,
							servicePassengers: servicePassengers.map((passenger) => ({
								id: passenger.id,
								isIcnRoute: isCurrentDirectionICNRoute,
								isValueBundle: isValueBundleCode(passenger.bundleCode),
							})),
						});

						const allBundleMealCodes = new Set<string>();
						for (const codes of Object.values(bundleIncludedMealCodesByPassengerId)) {
							for (const code of codes) {
								allBundleMealCodes.add(code);
							}
						}

						const returnedServiceCodes = new Set(
							mealServices.map((service) => normalizeServiceCode(service.ssrCode))
						);

						const isBundleMealMissingFromResponse =
							allBundleMealCodes.size > 0 &&
							![...allBundleMealCodes].some((code) => returnedServiceCodes.has(code));

						if (isBundleMealMissingFromResponse) {
							openErrorDialog(t("service_unavailable_title"), t("service_unavailable_message"));
							return;
						}
					}

					// 2. All meals/drinks out of stock → out-of-stock popup + disable card on Return

					handleInflightMealAncillaryOffer({
						ancillaryData: resultAction.payload,
						bundledMealPassengerCount,
						direction,
						confirmedFlight,
						servicePassengers,
						passengersWithBundles,
						storedPassengers,
						orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
						selectedSegmentLfid: selectedSegment.lfid,
						dispatch,
						openMealDialog: () => openDialog(bundle.id),
						openErrorDialog,
						markMealOutOfStock: () => {
							dispatch(
								markCategoriesOutOfStock({
									scope: ancillaryScope,
									serviceCategory: "MEALS",
									isOutOfStock: true,
								})
							);
						},
						setUnavailableMealPassengerIds,
						setPendingDialogAfterError,
						setCategoryToMarkOutOfStock,
						mealLabels,
					});
					return;
				}

				if (bundle.id === "BAGGAGE") {
					const adultEntry = resultAction.payload?.data?.servicesPerPassengerType?.find(
						(entry) => entry.passengerType === "adult"
					);

					const baggageServices =
						adultEntry?.categories
							.filter(
								(category) =>
									category.title === "Carry-on Baggage" || category.title === "Check-in Baggage"
							)
							.flatMap((category) => category.specialServices) ?? [];

					// 1. Passenger has Value/Premium bundle (promises check-in baggage) but
					//    "Check-in Baggage" category is missing or empty in the response → service unavailable
					const hasCheckInPromisingBundlePassenger = servicePassengers.some((passenger) =>
						isCurrentDirectionICNRoute
							? isPremiumBundleCode(passenger.bundleCode)
							: isValueBundleCode(passenger.bundleCode) || isPremiumBundleCode(passenger.bundleCode)
					);

					if (hasCheckInPromisingBundlePassenger) {
						const checkInCategory = adultEntry?.categories.find(
							(category) => category.title === "Check-in Baggage"
						);

						const isCheckInBaggageMissingFromResponse =
							!checkInCategory || checkInCategory.specialServices.length === 0;

						if (isCheckInBaggageMissingFromResponse) {
							openErrorDialog(t("service_unavailable_title"), t("service_unavailable_message"));
							return;
						}
					}

					// 2. Existing out-of-stock check (unchanged)
					const isBaggageOutOfStock =
						baggageServices.length === 0 || areAllServicesOutOfStock(baggageServices);

					if (isBaggageOutOfStock) {
						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "BAGGAGE",
								isOutOfStock: true,
							})
						);
						return;
					}

					// 3. Existing bundle-quantity validation (unchanged)
					const baggageOffersByPassengerType = getBaggageOffersByPassengerType(
						resultAction.payload
					);

					const inventoryResolution = resolveConfirmationBaggageInventory({
						passengerList: storedPassengers,
						servicePassengers,
						currentLfid: selectedSegment.lfid,
						orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
						baggageOffersByPassengerType,
					});

					/**
					 * Scenario 1:
					 * No baggage inventory is available for non-bundled passengers. Remove existing baggage selections and show the No Bundle Out Of Stock dialog.
					 */
					if (inventoryResolution.type === BAGGAGE_INVENTORY_TYPE.NO_BUNDLE_OUT_OF_STOCK) {
						removeAllBaggageServicesForPassengers({
							dispatch,
							baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
							currentLfid: selectedSegment.lfid,
						});
						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "BAGGAGE",
								isOutOfStock: true,
							})
						);
						openErrorDialog(
							baggageServiceLabels("dialog_title_no_bundle_out_of_stock"),
							baggageServiceLabels("dialog_content_no_bundle_out_of_stock"),
							[],
							t("dialog_button_ok"),
							"close"
						);

						return;
					}

					/**
					 * Scenario 2:
					 * Bundle-included baggage is no longer available. Clear baggage selections and show a Service Unavailable dialog that returns the user to the top of the page.
					 */
					if (inventoryResolution.type === BAGGAGE_INVENTORY_TYPE.BUNDLE_OUT_OF_STOCK) {
						removeAllBaggageServicesForPassengers({
							dispatch,
							baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
							currentLfid: selectedSegment.lfid,
						});

						openErrorDialog(
							baggageServiceLabels("dialog_title_bundle_out_of_stock"),
							baggageServiceLabels("dialog_content_bundle_out_of_stock"),
							[],
							baggageServiceLabels("button_return_to_top"),
							"returnToTop"
						);

						return;
					}

					/**
					 * Scenario 3:
					 * One or more selected baggage items have become unavailable due to stock shortage. Update baggage selections and display the affected passengers and cancelled baggage items.
					 */
					if (inventoryResolution.type === BAGGAGE_INVENTORY_TYPE.SELECTED_BAGGAGE_UNAVAILABLE) {
						const isOutOfStock = outOfStockValidationForUpdatedServices({
							updatedBaggageServicesByPassengerId:
								inventoryResolution.updatedBaggageServicesByPassengerId,
							baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
						});

						if (isOutOfStock) {
							removeAllBaggageServicesForPassengers({
								dispatch,
								baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
								currentLfid: selectedSegment.lfid,
							});
							setPendingDialogAfterError("BAGGAGE");
							openErrorDialog(
								baggageServiceLabels("dialog_title_bundle_out_of_stock"),
								baggageServiceLabels("dialog_content_bundle_out_of_stock"),
								[],
								baggageServiceLabels("button_return_to_top"),
								"returnToTop"
							);

							return;
						}

						/**
						 * Updates baggage selections based on the latest inventory
						 * and removes baggage services that are no longer available.
						 */
						applyBaggageShortageChanges({
							dispatch,
							baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
							updatedBaggageServicesByPassengerId:
								inventoryResolution.updatedBaggageServicesByPassengerId,
							currentLfid: selectedSegment.lfid,
						});

						const unavailableBaggageByPassenger = getGroupedContentSuffix(
							inventoryResolution.unavailableBaggage
						);

						const contentSuffix = Array.from(unavailableBaggageByPassenger.values())
							.map(
								({ baggageName, quantity, passengerName }) =>
									`${baggageServiceLabels(baggageName)} x ${quantity}: ${passengerName}`
							)
							.join("\n");
						setPendingDialogAfterError("BAGGAGE");
						openErrorDialog(
							baggageServiceLabels("dialog_title_stock_shortage"),
							contentSuffix
								? `${baggageServiceLabels("dialog_content_stock_shortage")}\n\n${contentSuffix}`
								: baggageServiceLabels("dialog_content_stock_shortage"),
							[],
							baggageServiceLabels("button_ok"),
							"close"
						);

						return;
					}
				}
				if (bundle.id === "LOUNGE") {
					const loungeAncillaryData = resultAction.payload;
					const loungeAvailabilityIssue = resolveLoungeAvailabilityIssue({
						ancillaryData: loungeAncillaryData,
						storedPassengers,
						orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
						lfid: selectedSegment.lfid,
						clickedPassengerId: "",
						allPassengerIds: servicePassengers.map((passenger) => passenger.id),
					});

					// Scenario 1:
					// Express Service is completely unavailable.
					if (loungeAvailabilityIssue.type === "all-lounges-unavailable") {
						for (const serviceToRemove of loungeAvailabilityIssue.loungesToRemove) {
							dispatch(removeService(serviceToRemove));
						}

						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "LOUNGE",
								isOutOfStock: true,
							})
						);

						openErrorDialog(
							loungeServiceT("no_lounges_available_title"),
							loungeServiceT("no_lounges_available_content"),
							[],
							loungeServiceT("no_lounges_available_button"),
							"close"
						);

						return;
					}

					// Scenario 2:
					// Previously selected Express Service is no longer available.
					if (loungeAvailabilityIssue.type === "selected-lounge-unavailable") {
						for (const serviceToRemove of loungeAvailabilityIssue.loungesToRemove) {
							dispatch(removeService(serviceToRemove));
						}
						setPendingDialogAfterError("LOUNGE");
						openErrorDialog(
							loungeServiceT("lounge_cancelled_title"),
							`${loungeServiceT(
								"lounge_cancelled_content"
							)}\n\n${loungeAvailabilityIssue.contentSuffix}`,
							[],
							loungeServiceT("lounge_cancelled_ok_button"),
							"close"
						);

						return;
					}
					const loungeServices = extractLoungeServices(resultAction.payload);
					const isLoungeOutOfStock =
						loungeServices.length === 0 ||
						areAllServicesOutOfStock(loungeServices.map((option) => option.service));

					if (isLoungeOutOfStock) {
						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "LOUNGE",
								isOutOfStock: true,
							})
						);
						return;
					}
				}

				if (bundle.id === "PRIORITY") {
					const priorityAvailabilityIssue = resolvePriorityAvailabilityIssue({
						ancillaryData: resultAction.payload,
						storedPassengers,
						orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
						lfid: selectedSegment.lfid,

						// Customize is card-level, not passenger-level.
						clickedPassengerId: "",

						allPassengerIds: servicePassengers.map((passenger) => passenger.id),
					});

					// Scenario 1:
					// Express Service is completely unavailable.
					if (priorityAvailabilityIssue.type === "all-priority-unavailable") {
						for (const serviceToRemove of priorityAvailabilityIssue.servicesToRemove) {
							dispatch(removeService(serviceToRemove));
						}

						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "AMENITIES",
								isOutOfStock: true,
							})
						);

						openErrorDialog(
							expressServiceT("express_services_available_title"),
							expressServiceT("express_services_available_content"),
							[],
							expressServiceT("express_services_available_button"),
							"close"
						);

						return;
					}

					// Scenario 2:
					// Previously selected Express Service is no longer available.
					if (priorityAvailabilityIssue.type === "selected-priority-unavailable") {
						for (const serviceToRemove of priorityAvailabilityIssue.servicesToRemove) {
							dispatch(removeService(serviceToRemove));
						}
						setPendingDialogAfterError("PRIORITY");
						openErrorDialog(
							expressServiceT("express_cancelled_title"),
							`${expressServiceT(
								"express_cancelled_content"
							)}\n\n${priorityAvailabilityIssue.contentSuffix}`,
							[],
							expressServiceT("express_cancelled_ok_button"),
							"close"
						);

						return;
					}

					const expressServices =
						resultAction.payload?.data?.servicesPerPassengerType?.flatMap((entry) =>
							entry.categories.flatMap((category) =>
								category.specialServices.filter((service) => service.ssrCode === "EXPS")
							)
						) ?? [];

					const isPriorityOutOfStock =
						expressServices.length === 0 || areAllServicesOutOfStock(expressServices);

					if (isPriorityOutOfStock) {
						dispatch(
							markCategoriesOutOfStock({
								scope: ancillaryScope,
								serviceCategory: "AMENITIES",
								isOutOfStock: true,
							})
						);
						return;
					}
				}

				openDialog(bundle.id);
				return;
			}

			if (resultAction.meta.condition) {
				return;
			}
			if (fetchAncillaryOffers.rejected.match(resultAction)) {
				const ancillaryOffersErrorMessage = resultAction.payload ?? resultAction.error.message;

				const errorCode = getAncillaryOffersErrorCodeFromBoundaryError(
					ancillaryOffersErrorMessage ? new Error(ancillaryOffersErrorMessage) : undefined
				);

				const isNonBundledPassenger = servicePassengers.every(
					(passenger) => passenger.bundleCode === "NOBN"
				);

				if (isNonBundledPassenger && errorCode === "NEXUZCMNE004") {
					dispatch(
						markCategoriesOutOfStock({
							scope: ancillaryScope,
							serviceCategory: getAncillaryServiceCategory(bundle.id),
							isOutOfStock: true,
						})
					);
					closeDialog(bundle.id);
					return;
				}
			}
			openErrorDialog(t("service_unavailable_title"), t("service_unavailable_message"));
		} finally {
			setIsBundleLoading(false);
		}
	};

	/** Validates required bundle selections before navigating to the next booking step. */
	const handleProceedOnClick = (): void => {
		const isMealCompleted = requiredMealSelectionCount === 0;
		const isBaggageCompleted = true;
		const isSeatCompleted = seatSelectionSummary.remainingRequiredSeatCount === 0;

		// Bundle validations
		if (!isSeatCompleted || !isMealCompleted || !isBaggageCompleted) {
			setShowBundleCompletionAlert(true);
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}
		// segment mismatch Baggage validation
		if (isConnectingFlight && stageLabel === "Segment 2") {
			const segment1Selections = getStoredBaggageByLfid({
				passengers: orderedPassengersWithNames,
				lfid: otherLfid,
				serviceCategory: "baggage",
			});

			const segment2Selections = getStoredBaggageByLfid({
				passengers: orderedPassengersWithNames,
				lfid: currentLfid,
				serviceCategory: "baggage",
			});
			const isValid = orderedPassengersWithNames.every((passenger) => {
				const passengerId = passenger.id;

				const segment1 = segment1Selections[passengerId];
				const segment2 = segment2Selections[passengerId];

				if (!segment1 || !segment2) {
					return true;
				}

				const comparison = compareBaggageServices(segment2, segment1);

				return !comparison.hasOtherGreater;
			});
			if (!isValid) {
				setShowBaggageSegmentMismatchBanner(true);
				window.scrollTo({ top: 0, behavior: "smooth" });
				return;
			}
		}
		setShowBaggageSegmentMismatchBanner(false);
		router.push(
			`${getNextBookingFlowPath({
				locale,
				confirmedFlight,
				currentRoute,
			})}${confirmationChangeQuery ? `?${confirmationChangeQuery}` : ""}`
		);
	};

	return (
		<div className="flex flex-col items-start gap-4 px-4 pb-32 md:px-0">
			{/* Ancillary Page Header */}
			<div className="w-full">
				<BookingHeader
					title={t("ancillary_page_title")}
					description={t("ancillary_page_description")}
				/>
			</div>
			<AncillaryAlerts
				showAncillaryBanner={showAncillaryBanner}
				ancillaryResult={ancillaryResult}
				showBundleCompletionAlert={showBundleCompletionAlert}
				bundleCompletionAlertData={bundleCompletionAlertData}
				showStockBanner={
					showBaggageOutOfStockBanner ||
					showMealOutOfStockBanner ||
					showLoungeOutOfStockBanner ||
					showPriorityOutOfStockBanner ||
					showTransportOutOfStockBanner
				}
				stockBannerData={
					showBaggageOutOfStockBanner ||
					showMealOutOfStockBanner ||
					showLoungeOutOfStockBanner ||
					showPriorityOutOfStockBanner ||
					showTransportOutOfStockBanner
						? {
								title: t("error_labels.stock_banner_title"),
								description: t("error_labels.stock_banner_description"),
							}
						: undefined
				}
				showBaggageSegmentMismatchBanner={showBaggageSegmentMismatchBanner}
				baggageSegmentMismatchBannerData={
					showBaggageSegmentMismatchBanner
						? {
								title: baggageServiceLabels("error_labels.error_title_segment_mismatch"),
								description: baggageServiceLabels(
									"error_labels.error_description_segment_mismatch"
								),
							}
						: undefined
				}
			></AncillaryAlerts>
			<div className="flex w-full flex-col items-start gap-1">
				<div className="flex w-full items-center gap-2 md:mt-4">
					<Icon name="flight_takeoff" size={24} className="text-primary-700" />
					<h2 className="flex-1 font-bold text-2xl text-primary-700 leading-9">
						Select {stageLabel} Bundle
					</h2>
				</div>
				<div className="h-px w-full bg-base-200" />
			</div>
			<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
				{outboundBundles.map((bundle) => {
					const cardKey = getAncillaryCardKey(bundle.id);
					const cardState = ancillaryResult.cards[cardKey];
					const isDisabledCard = !cardState.enabled && !cardState.showPopupOnClick;
					const triggerRef =
						bundle.id === "TRANSPORT"
							? transportServiceTriggerRef
							: bundle.id === "MEAL"
								? inflightMealTriggerRef
								: bundle.id === "BAGGAGE"
									? baggageTriggerRef
									: undefined;
					const selectedItemsText =
						bundle.id === "MEAL"
							? inflightMealSelectedText
							: bundle.id === "BAGGAGE"
								? baggageSelectedItemsText
								: undefined;
					const freeItemsText =
						bundle.id === "MEAL"
							? inflightMealFreeSelectionsText
							: bundle.id === "BAGGAGE"
								? undefined
								: toOptionalString((bundle as Record<string, unknown>).freeItemsText);
					if (bundle.id === "TRANSPORT" && !isTransportServiceEnabled) {
						return null;
					}
					if (bundle.id === "LOUNGE" && !isLoungeServiceEnabled) {
						return null;
					}
					const isCurrentTransportServiceDisabled =
						bundle.id === "TRANSPORT" && isTransportServiceDeadlinePassed;
					const isBaggageOutOfStockDisabled =
						bundle.id === "BAGGAGE" && showBaggageOutOfStockBanner;
					const isMealOutOfStockDisabled = bundle.id === "MEAL" && showMealOutOfStockBanner;
					const isLoungeOutOfStockDisabled = bundle.id === "LOUNGE" && showLoungeOutOfStockBanner;
					const isTransportOutOfStockDisabled =
						bundle.id === "TRANSPORT" && showTransportOutOfStockBanner;
					const isPriorityOutOfStockDisabled =
						bundle.id === "PRIORITY" && showPriorityOutOfStockBanner;
					const isSeatOutOfStockDisabled = bundle.id === "SEAT" && showSeatOutOfStockBanner;
					return (
						<div key={bundle.id} className="flex h-full flex-col gap-0">
							{bundle.id === "SEAT" ? (
								<button
									type="button"
									onClick={(event) => {
										seatDialogTriggerRef.current = event.currentTarget;
										void handleAncillaryCardClick(bundle);
									}}
									disabled={isDisabledCard || isSeatOutOfStockDisabled}
									className={cn(
										"h-full w-full",
										isDisabledCard || isSeatOutOfStockDisabled
											? "cursor-not-allowed opacity-50"
											: "cursor-pointer"
									)}
								>
									<ServicePromoCard
										imageSrc={bundle.imageSrc}
										icon={bundle.icon}
										discountLabel={toOptionalString(
											(bundle as Record<string, unknown>).discountLabel
										)}
										title={bundle.title}
										description={bundle.description}
										selectedItemsText={seatSelectionSummary.selectedItemsText}
										freeItemsText={seatSelectionSummary.freeItemsText}
										reserveStatusSpace
									/>
								</button>
							) : (
								<button
									type="button"
									ref={triggerRef}
									disabled={
										isCurrentTransportServiceDisabled ||
										isDisabledCard ||
										isSeatOutOfStockDisabled ||
										isBaggageOutOfStockDisabled ||
										isMealOutOfStockDisabled ||
										isLoungeOutOfStockDisabled ||
										isTransportOutOfStockDisabled ||
										isMealOutOfStockDisabled ||
										isPriorityOutOfStockDisabled
									}
									onClick={() => handleAncillaryCardClick(bundle)}
									className={cn(
										"h-full w-full cursor-pointer",

										(isCurrentTransportServiceDisabled ||
											isDisabledCard ||
											isSeatOutOfStockDisabled ||
											isBaggageOutOfStockDisabled ||
											isMealOutOfStockDisabled ||
											isLoungeOutOfStockDisabled ||
											isTransportOutOfStockDisabled ||
											isMealOutOfStockDisabled ||
											isPriorityOutOfStockDisabled) &&
											"cursor-not-allowed opacity-50"
									)}
								>
									<ServicePromoCard
										imageSrc={bundle.imageSrc}
										icon={bundle.icon}
										discountLabel={toOptionalString(
											(bundle as Record<string, unknown>).discountLabel
										)}
										title={bundle.title}
										description={bundle.description}
										selectedItemsText={selectedItemsText}
										freeItemsText={freeItemsText}
										reserveStatusSpace={bundle.id === "MEAL" || bundle.id === "BAGGAGE"}
									/>
								</button>
							)}
						</div>
					);
				})}
			</div>
			{/* Seat Dialog */}
			<SeatMapDialog
				open={openDialogs.SEAT ?? false}
				onOpenChange={(open) => setOpenDialogs((prev) => ({ ...prev, SEAT: open }))}
				direction={direction}
				stageLabel={stageLabel}
				routeLabel={routeLabel}
				restoreFocusElement={seatDialogTriggerRef.current}
			/>
			{/* Baggage Dialog */}
			<BaggageService
				ref={baggageTriggerRef}
				stageLabel={stageLabel}
				routeLabel={routeLabel}
				direction={direction}
				openBaggageDialog={openDialogs.BAGGAGE ?? false}
				onOpenBaggageDialogChange={(open) => setOpenDialogs({ ...openDialogs, BAGGAGE: open })}
				closeBaggageDialog={() => closeDialog("BAGGAGE")}
			/>
			{/* In-flight Meal Dialog */}
			<InflightMeals
				open={Boolean(openDialogs.MEAL)}
				onOpenChange={(open) => {
					setOpenDialogs({ ...openDialogs, MEAL: open });
					if (!open) {
						setMealDialogInitialPassengerId(undefined);
					}
				}}
				triggerRef={inflightMealTriggerRef}
				stageLabel={stageLabel}
				routeLabel={routeLabel}
				direction={direction}
				servicePassengers={servicePassengers}
				unavailablePassengerIds={unavailableMealPassengerIds}
				initialSelectedMealPassengerId={mealDialogInitialPassengerId}
			/>
			<PriorityServiceDialog
				open={openDialogs.PRIORITY ?? false}
				onOpenChange={(open) => setOpenDialogs({ ...openDialogs, PRIORITY: open })}
				stageLabel={stageLabel}
				routeLabel={routeLabel}
				passengers={priorityServicePassengers}
				hasOutOfStockPassengers={hasOutOfStockPassengers}
				remainingStocksLabel={remainingStocksLabel}
				showTransitApplicabilityWarning={showTransitApplicabilityWarning}
				totalAmount={priorityServiceTotalAmount}
				onPassengerChange={togglePriorityPax}
				onSelectAllChange={togglePrioritySelectAll}
				onConfirmSelection={() => {
					confirmPrioritySelection();
					closeDialog("PRIORITY");
				}}
			/>
			{/* Purchase Deadline Alert - shown at top of page */}
			{/* Airport Lounge Dialog */}
			{isLoungeServiceEnabled && (
				<LoungeDialog
					open={Boolean(openDialogs.LOUNGE)}
					onOpenChange={(open) => setOpenDialogs({ ...openDialogs, LOUNGE: open })}
					originCode={selectedAncillarySegment?.origin}
					segmentLfid={selectedAncillarySegment?.lfid}
					stageLabel={stageLabel}
					transportRouteLabel={routeLabel}
					ancillaryScope={ancillaryScope}
					onConfirm={() => closeDialog("LOUNGE")}
				/>
			)}
			{isTransportServiceEnabled && !isTransportServiceDeadlinePassed && (
				<TransportService
					triggerRef={transportServiceTriggerRef}
					open={openDialogs.TRANSPORT ?? false}
					onOpenChange={(open) => setOpenDialogs({ ...openDialogs, TRANSPORT: open })}
					routeLabel={routeLabel}
					direction={direction}
					origin={selectedAncillarySegment?.origin}
					destination={selectedAncillarySegment?.destination}
					stageLabel={stageLabel}
				/>
			)}
			<ErrorDialog
				open={isUnavailableDialogOpen || isLimitedStockAlertOpen}
				onOpenChange={handleErrorDialogOpenChange}
				title={unavailableDialogTitle}
				content={unavailableDialogContent}
				buttonLabel={unavailableDialogButtonLabel}
				onReturnToTop={handleErrorDialog}
				action={errorDialogAction}
				redirectUrl={unavailableSeatSelections.length === 0 ? `/${locale}` : undefined}
			/>
			{isBundleLoading && <LoadingOverlay />}

			<BookingFooter amountValue={ancillaryTotal} onProceed={handleProceedOnClick} />
		</div>
	);
}
