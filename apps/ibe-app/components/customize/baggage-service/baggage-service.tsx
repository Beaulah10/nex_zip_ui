/**
 * File: baggage-service.tsx
 * Description: main Component for managing baggage services.
 */

"use client";
import { NEXUZR004OffersAncillaryRequestServiceCategoryEnum } from "@repo/sdk/swagger";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BaggagePassengerList } from "@/components/customize/baggage-service/baggage-passenger-list/baggage-passenger-list";
import { BaggageSelection } from "@/components/customize/baggage-service/baggage-selection/baggage-selection";
import { useBaggageInventory } from "@/modules/hooks/baggage-service/baggage-inventory/baggage-inventory";
import { useBaggageOfferOptions } from "@/modules/hooks/baggage-service/baggage-offer-options/baggage-offer-options";
import { useBaggageSelectionState } from "@/modules/hooks/baggage-service/baggage-selection-state/baggage-selection-state";
import { useSavePassengerBaggageSelection } from "@/modules/hooks/baggage-service/save-baggage-selection/save-baggage-selection";
import { useServicePassengers } from "@/modules/hooks/common/service-passengers/service-passengers";
import { bundleCodeToBundleIdMap } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import { getBaggageOffersByPassengerType } from "@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers";
import { calculateBaggagePriceFromSelection } from "@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing";
import {
	getConnectingSegmentInfo,
	getFlightSegment,
} from "@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils";
import {
	buildPassengerWithBaggageSelection,
	buildSelectionValuesFromPassengerBaggage,
} from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAncillaryOffersDataByDirectionAndServiceCategory } from "@/store/slices/common/ancillary-offers/ancillary-offers";
import {
	type ConfirmedFlightPayload,
	selectConfirmedFlight,
} from "@/store/slices/flight-selection/flight-selection.slice";
import { selectPassengers } from "@/store/slices/passenger/passenger.slice";
import type { BaggageSelectionValues } from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode, PassengerServiceCategory } from "@/types/passenger/passenger.type";

export function BaggageService({
	ref,
	stageLabel,
	routeLabel,
	direction,
	openBaggageDialog,
	onOpenBaggageDialogChange,
	closeBaggageDialog,
	initialSelectedPassengerId,
	closeOnBaggageConfirm = false,
	hideHeaderBackButtonOnPassengerSelection = false,
}: Readonly<{
	ref?: RefObject<HTMLButtonElement | null>;
	stageLabel: string;
	routeLabel: string;
	direction: BookingFlowDirection;
	openBaggageDialog: boolean;
	onOpenBaggageDialogChange: (open: boolean) => void;
	closeBaggageDialog: () => void;
	initialSelectedPassengerId?: string | null;
	closeOnBaggageConfirm?: boolean;
	hideHeaderBackButtonOnPassengerSelection?: boolean;
}>) {
	const baggageServiceLabels = useTranslations("baggage_service");
	// Service category for baggage to get the service details from store and SDK response
	const serviceCategory = "baggage" as PassengerServiceCategory;
	const serviceCategoryForOffers =
		NEXUZR004OffersAncillaryRequestServiceCategoryEnum[
			serviceCategory as keyof typeof NEXUZR004OffersAncillaryRequestServiceCategoryEnum
		];
	const dispatch = useAppDispatch();
	// Get the list of passengers with selected bundle details in the current direction : ordered passeneger
	const selectedBundlePassengers = useServicePassengers(direction).servicePassengers;
	// Get the confirmed flight details from the store to determine the current stage and segment
	const confirmedFlight = useAppSelector(selectConfirmedFlight) as ConfirmedFlightPayload;
	// stageSegment : outbound | inbound | segment1 | segment2 to get the baggage offers for the current stage and segment from the store
	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });
	// get baggageOffersResponse from the store for the current stage and segment and service category
	const baggageOffersResponse = useAppSelector((state) =>
		selectAncillaryOffersDataByDirectionAndServiceCategory(
			state,
			stageSegment,
			serviceCategoryForOffers
		)
	);
	// get passenger list with selected services from the store to build the baggage selection for all passengers
	const passengerList = useAppSelector(selectPassengers);
	// Get the baggage offers grouped by passenger type from the baggageOffersResponse
	const baggageOffersByPassengerType = useMemo(
		() => getBaggageOffersByPassengerType(baggageOffersResponse),
		[baggageOffersResponse]
	);
	// For inventory Validation
	const adultBaggageResponse = baggageOffersByPassengerType["adult"]?.categories;
	// currentLfid : current flight segment lfid
	const currentLfid = getFlightSegment({ confirmedFlight, direction })?.lfid;

	// connecting flight info : isConnectingFlight, otherLfid
	const { isConnectingFlight, otherLfid } = useMemo(
		() =>
			confirmedFlight
				? getConnectingSegmentInfo({
						confirmedFlight,
						direction,
					})
				: { isConnectingFlight: false, otherLfid: undefined },
		[confirmedFlight, direction]
	);
	const baggageSelectionsForAllPassengers = useMemo(
		() =>
			buildPassengerWithBaggageSelection({
				passengerList,
				selectedBundlePassengers,
				serviceCategory,
				currentLfid,
				baggageOffersByPassengerType,
			}),
		[
			passengerList,
			selectedBundlePassengers,
			serviceCategory,
			currentLfid,
			baggageOffersByPassengerType,
		]
	);
	const otherSegmentSelections = useMemo(
		() =>
			otherLfid
				? buildPassengerWithBaggageSelection({
						passengerList,
						selectedBundlePassengers,
						serviceCategory,
						currentLfid: otherLfid,
						baggageOffersByPassengerType,
					})
				: {},
		[
			passengerList,
			selectedBundlePassengers,
			serviceCategory,
			otherLfid,
			baggageOffersByPassengerType,
		]
	);
	// State for managing the baggage selection dialog and passenger selection
	const {
		baggageSelections,
		setBaggageSelections,
		selectedPassengerId,
		setSelectedPassengerId,
		editingSelection,
		setEditingSelection,
	} = useBaggageSelectionState(baggageSelectionsForAllPassengers, openBaggageDialog);
	const [isSegmentMismatchDialogOpen, setIsSegmentMismatchDialogOpen] = useState(false);
	const [segmentValidationMessage, setSegmentValidationMessage] = useState<string | null>(null);
	const [acknowledgedSegmentMismatch, setAcknowledgedSegmentMismatch] = useState(false);
	const [focusPassengerId, setFocusPassengerId] = useState<string | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const savedScrollTopRef = useRef(0);
	const segmentMismatchRef = useRef<HTMLDivElement>(null);
	const hasAppliedInitialPassengerRef = useRef(false);

	// Save scroll position when entering Screen 2; restore it when returning to Screen 1
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		if (selectedPassengerId !== null) {
			savedScrollTopRef.current = container.scrollTop;
			container.scrollTop = 0;
		} else {
			container.scrollTop = savedScrollTopRef.current;
		}
	}, [selectedPassengerId]);
	useEffect(() => {
		if (segmentValidationMessage) {
			segmentMismatchRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});

			segmentMismatchRef.current?.focus({
				preventScroll: true,
			});
		}
	}, [segmentValidationMessage]);
	// Selected passenger details for the currently selected passenger in the dialog
	const selectedPassenger = useMemo(
		() => (selectedPassengerId ? baggageSelections[selectedPassengerId] : null),
		[selectedPassengerId, baggageSelections]
	);
	// Inventory available to the passenger currently being edited.
	const selectedPassengerAvailableInventory = useBaggageInventory({
		adultBaggageResponse,
		passengerList,
		currentLfid,
		selectedPassenger,
	});
	const passengerTypeCode = selectedPassenger?.passenger?.passengerTypeCode;
	const { carryOnOptions, sportsEquipmentOptions, priceForCheckedInBaggage } =
		useBaggageOfferOptions({
			baggageOffersByPassengerType,
			passengerTypeCode,
			availableInventory: selectedPassengerAvailableInventory,
		});
	// Calculate the total baggage price for all passengers and the currently editing passenger
	const baggageTotal = useMemo(
		() => Object.values(baggageSelections).reduce((sum, item) => sum + item.totalPrice, 0),
		[baggageSelections]
	);
	// Calculate the price for the currently editing passenger's selection
	const editingSelectionPrice = useMemo(() => {
		if (!editingSelection || !selectedPassenger) {
			return 0;
		}
		const selectedPackageType =
			bundleCodeToBundleIdMap[selectedPassenger.passenger.bundleCode as BundleCode];
		return calculateBaggagePriceFromSelection({
			selection: editingSelection,
			carryOnOptions,
			equipmentOptions: sportsEquipmentOptions,
			packageType: selectedPackageType,
			checkedInBaggagePrice: priceForCheckedInBaggage,
		});
	}, [
		editingSelection,
		selectedPassenger,
		carryOnOptions,
		sportsEquipmentOptions,
		priceForCheckedInBaggage,
	]);
	const handleEditingSelectionChange = useCallback(
		(newSelection: BaggageSelectionValues) => {
			setEditingSelection(newSelection);
		},
		[setEditingSelection]
	);
	// Handle opening the baggage selection for a specific passenger
	const openPassengerDetail = useCallback(
		(passengerId: string, selections = baggageSelections) => {
			const selectedItem = selections[passengerId];
			if (!selectedItem) {
				return;
			}
			setSegmentValidationMessage(null);
			setAcknowledgedSegmentMismatch(false);
			setIsSegmentMismatchDialogOpen(false);
			setEditingSelection(
				buildSelectionValuesFromPassengerBaggage(selectedItem, sportsEquipmentOptions)
			);
			setSelectedPassengerId(passengerId);
		},
		[baggageSelections, sportsEquipmentOptions, setSelectedPassengerId, setEditingSelection]
	);

	const handleOpenPassengerDetail = useCallback(
		(passengerId: string) => {
			openPassengerDetail(passengerId);
		},
		[openPassengerDetail]
	);

	useEffect(() => {
		if (!openBaggageDialog) {
			hasAppliedInitialPassengerRef.current = false;
			return;
		}

		if (hasAppliedInitialPassengerRef.current || !initialSelectedPassengerId) {
			return;
		}

		if (!baggageSelectionsForAllPassengers[initialSelectedPassengerId]) {
			return;
		}

		setBaggageSelections(baggageSelectionsForAllPassengers);
		openPassengerDetail(initialSelectedPassengerId, baggageSelectionsForAllPassengers);
		hasAppliedInitialPassengerRef.current = true;
	}, [
		openBaggageDialog,
		initialSelectedPassengerId,
		baggageSelectionsForAllPassengers,
		openPassengerDetail,
		setBaggageSelections,
	]);
	// Handle going back to the passenger list view from a specific passenger's baggage selection
	const handleBackToPassengerList = useCallback(() => {
		if (selectedPassengerId) {
			setFocusPassengerId(selectedPassengerId);
		}
		setSelectedPassengerId(null);
		setEditingSelection(null);
		setSegmentValidationMessage(null);
		setAcknowledgedSegmentMismatch(false);
		setIsSegmentMismatchDialogOpen(false);
	}, [setSelectedPassengerId, selectedPassengerId, setEditingSelection]);
	const handlePassengerSelectionComplete = useCallback(() => {
		if (closeOnBaggageConfirm) {
			setSelectedPassengerId(null);
			setEditingSelection(null);
			setSegmentValidationMessage(null);
			setAcknowledgedSegmentMismatch(false);
			setIsSegmentMismatchDialogOpen(false);
			closeBaggageDialog();
			return;
		}

		handleBackToPassengerList();
	}, [
		closeOnBaggageConfirm,
		closeBaggageDialog,
		handleBackToPassengerList,
		setSelectedPassengerId,
		setEditingSelection,
	]);
	const handlePassengerFocusRestored = useCallback(() => {
		setFocusPassengerId(null);
	}, []);
	// Determine the total amount to display in the footer based on whether a passenger is currently selected
	const footerTotalAmount = selectedPassenger === null ? baggageTotal : editingSelectionPrice;
	// Save the baggage selection for the currently selected passenger and handle inventory validation and updates
	const { savePassengerBaggageSelection, baggageValidationRef } = useSavePassengerBaggageSelection({
		selectedPassengerId,
		selectedPassenger,
		editingSelection,
		currentLfid,
		baggageOffersByPassengerType,
		editingSelectionPrice,
		isConnectingFlight,
		stageLabel,
		otherSegmentSelections,
		acknowledgedSegmentMismatch,
		dispatch,
		handleBackToPassengerList: handlePassengerSelectionComplete,
		setBaggageSelections,
		setSegmentValidationMessage,
		setIsSegmentMismatchDialogOpen,
		setAcknowledgedSegmentMismatch,
	});
	const handleValidationChange = useCallback(
		(validate: () => boolean) => {
			baggageValidationRef.current = validate;
		},
		[baggageValidationRef]
	);
	// Confirm the baggage selections for all passengers and dispatch changes to the store
	const handleConfirmPassengerList = useCallback(() => {
		closeBaggageDialog();
	}, [closeBaggageDialog]);
	// Handle the footer button click based on whether a passenger is currently selected or not
	const currentFooterHandler = useCallback(() => {
		if (selectedPassenger === null) {
			handleConfirmPassengerList();
		} else {
			savePassengerBaggageSelection();
		}
	}, [selectedPassenger, handleConfirmPassengerList, savePassengerBaggageSelection]);
	const handleOpenBaggageDialog = useCallback(() => {
		onOpenBaggageDialogChange(true);
	}, [onOpenBaggageDialogChange]);
	const handleCloseBaggageDialog = useCallback(() => {
		setSelectedPassengerId(null);
		setEditingSelection(null);
		setSegmentValidationMessage(null);
		setAcknowledgedSegmentMismatch(false);
		setIsSegmentMismatchDialogOpen(false);

		closeBaggageDialog();
	}, [setSelectedPassengerId, setEditingSelection, closeBaggageDialog]);
	const handleDialogStateChange = useCallback(
		() => (openBaggageDialog ? handleCloseBaggageDialog() : handleOpenBaggageDialog()),
		[openBaggageDialog, handleCloseBaggageDialog, handleOpenBaggageDialog]
	);
	const showHeaderBackButton =
		selectedPassengerId !== null && !hideHeaderBackButtonOnPassengerSelection;
	// Render the content based on whether a passenger is selected or not
	let contentElement = null;
	if (selectedPassenger === null) {
		contentElement = (
			<BaggagePassengerList
				passengers={selectedBundlePassengers}
				baggageSelections={baggageSelections}
				onPassengerClick={handleOpenPassengerDetail}
				focusPassengerId={focusPassengerId}
				onFocusRestored={handlePassengerFocusRestored}
				translate={baggageServiceLabels}
			/>
		);
	} else if (selectedPassenger?.passenger && editingSelection !== null) {
		contentElement = (
			<BaggageSelection
				passengerName={selectedPassenger.passenger.name}
				bundleId={bundleCodeToBundleIdMap[selectedPassenger.passenger.bundleCode as BundleCode]}
				bundleLabel={selectedPassenger.passenger.bundleLabel}
				carryOnOptions={carryOnOptions}
				checkedInBaggagePrice={priceForCheckedInBaggage}
				equipment={sportsEquipmentOptions}
				value={editingSelection}
				onChange={handleEditingSelectionChange}
				availableInventory={selectedPassengerAvailableInventory}
				segmentValidationMessage={segmentValidationMessage}
				onValidationChange={handleValidationChange}
				adultType={selectedPassenger.passenger.passengerTypeCode}
				showHeader
			/>
		);
	}

	return (
		<Dialog open={openBaggageDialog} onOpenChange={handleDialogStateChange}>
			<DialogContent
				desktopWidth={1024}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					ref?.current?.focus({ preventScroll: true });
				}}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col"
			>
				<DialogHeader className="border-base-300 bg-white">
					<div className={`flex items-center ${showHeaderBackButton ? "gap-2 md:gap-6" : ""}`}>
						{showHeaderBackButton && (
							<button
								type="button"
								aria-label={baggageServiceLabels("aria_labels.label_back")}
								onClick={handleBackToPassengerList}
								className="shrink-0 text-base-950"
							>
								<Icon name="arrow_back" size={24} color="text-base-900" />
							</button>
						)}
						<div className="flex flex-col gap-1">
							<DialogTitle className="text-brand-japan-black">
								{baggageServiceLabels("title_baggage_services", { stageLabel })}
							</DialogTitle>
							<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
						</div>
					</div>
				</DialogHeader>

				<div
					ref={scrollContainerRef}
					className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-0 md:gap-4 md:px-6 md:py-2"
				>
					{contentElement}
				</div>
				<DialogFooter className="mt-1 flex flex-col gap-4 border-base-300 bg-white md:mt-0 md:items-center md:justify-end md:gap-6 md:px-4 md:py-3">
					<div
						className="flex items-center justify-end gap-2"
						role="status"
						aria-live="polite"
						aria-label={`${baggageServiceLabels("baggage_total_amount")}: ${formatPrice(footerTotalAmount).toLocaleString()}`}
					>
						<span className="pt-6 pb-1 text-brand-japan-black text-sm leading-6">
							{baggageServiceLabels("baggage_total_amount")}
						</span>
						<span
							className={`item-center font-bold text-4xl leading-13 ${footerTotalAmount === 0 ? "text-base-400" : "text-primary-700"}`}
						>
							{formatPrice(footerTotalAmount).toLocaleString()}
						</span>
					</div>
					<Button
						type="button"
						variant="primary"
						className="bg-primary-600"
						size="xl"
						onClick={currentFooterHandler}
					>
						{baggageServiceLabels("baggage_confirm_selection")}
					</Button>
				</DialogFooter>
			</DialogContent>
			<Dialog open={isSegmentMismatchDialogOpen} onOpenChange={setIsSegmentMismatchDialogOpen}>
				<DialogContent gap={6} mobileOuterSpacing={16}>
					<DialogHeader>
						<DialogTitle className="text-2xl leading-9">
							{baggageServiceLabels("error_labels.error_title_segment_mismatch")}
						</DialogTitle>
					</DialogHeader>
					<p className="px-8 text-base-700 text-sm leading-6">
						{baggageServiceLabels("segment_mismatch_dialog_description")}
					</p>
					<div className="flex flex-col items-end gap-3 px-8 py-8 md:flex-row">
						<Button
							variant="primary"
							size="lg"
							className="h-auto flex-1 whitespace-normal bg-primary-600 py-3 text-center"
							onClick={() => {
								setIsSegmentMismatchDialogOpen(false);
								setAcknowledgedSegmentMismatch(true);
							}}
						>
							{baggageServiceLabels("button_ok")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}
