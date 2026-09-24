/**
 * File: lounge-dialog.tsx
 * Description: Airport Lounge selection dialog component that allows passengers
 * to view lounge details, manage lounge eligibility, select passengers, handle
 * stock availability validation, and save lounge service selections.
 */

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SelectCustomers } from "@/components/common/select-customers/select-customers";
import { useAccompanyingSelectionHelpers } from "@/modules/hooks/common/accompanying-selection/accompanying-selection";
import {
	getAirportLoungeTotalAmount,
	getSeeMoreDescriptionText,
	useAirportLoungePassengerSelection,
} from "@/modules/hooks/common/airport-lounge/airport-lounge";
import { getAirportLoungeImage } from "@/modules/hooks/common/lounge-service/lounge-service";
import loungeConfig from "@/modules/utils/constants/lounge-dialog/lounge.config.json";
import {
	INFANT_PASSENGER_TYPES,
	loungeOriginCodeMap,
	stockWarningThreshold,
} from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import {
	appendNewPassengers,
	createSavedPassengerMap,
	getPassengerLoungeSelections,
	updateExistingPassengers,
} from "@/modules/utils/helpers/lounge-dialog/lounge-dialog.helper";
import { extractLoungeServices } from "@/modules/utils/lounge.utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAncillaryOffersDataByDirectionAndServiceCategory } from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectPassengers, setPassengerNames } from "@/store/slices/passenger/passenger.slice";
import type {
	AirportLoungeDialogProps,
	LoungeInfo,
} from "@/types/lounge-dialog/lounge-dialog.types";
import { cn } from "../../../../../packages/ui/lib/utils";

type LoungeConfigItem = (typeof loungeConfig.lounges)[number];

/**
 * Gets the lounge for an origin airport.
 * @param originCode - Airport origin code.
 * @param errorLabel - Error message to throw.
 * @returns Matching lounge .
 * @throws Error if no matching lounge is found.
 */
function getLoungeByOrigin(originCode: string, errorLabel: string): LoungeConfigItem {
	const loungeTitleKeyword = loungeOriginCodeMap[originCode];
	if (!loungeTitleKeyword) {
		throw new Error(errorLabel);
	}
	const matchedLounge = loungeConfig.lounges.find((lounge) =>
		lounge.title.toLowerCase().includes(loungeTitleKeyword.toLowerCase())
	);
	if (!matchedLounge) {
		throw new Error(errorLabel);
	}
	return matchedLounge;
}

/**
 * Returns the airport lounge information for the given origin code.
 * @param originCode - Airport origin code.
 * @param errorLabel - Error message if lounge data cannot be found.
 * @returns Airport lounge information.
 * @throws Error if no matching lounge is found.
 */
function getAirportLoungeInfoForOrigin(originCode: string, errorLabel: string): LoungeInfo {
	const selectedLounge = getLoungeByOrigin(originCode, errorLabel);
	return {
		title: selectedLounge.title,
		hours: selectedLounge.openingHours,
		amenities: selectedLounge.amenities ?? [],
		imageSrc: getAirportLoungeImage(originCode),
		description: selectedLounge.description,
	};
}

export default function LoungeDialog({
	open,
	stageLabel,
	transportRouteLabel,
	ancillaryScope,
	originCode,
	segmentLfid,
	highlightedPassengerId,
	onOpenChange,
	onConfirm,
}: AirportLoungeDialogProps) {
	const dispatch = useAppDispatch();
	const selectCustomersTitle = useTranslations("extras_page");
	const loungeDialogLabels = useTranslations("lounge_service");
	const commonLabels = useTranslations("common");

	/**
	 * Retrieves and memoizes lounge information for the selected origin airport.
	 * Returns `undefined` when no origin is selected or no matching lounge is available.
	 */
	const airportLoungeInfo = useMemo(() => {
		if (!originCode) return undefined;
		try {
			return getAirportLoungeInfoForOrigin(
				originCode,
				loungeDialogLabels("error_labels.loungeNotAvailableForRoute", { route: originCode })
			);
		} catch {
			return undefined;
		}
	}, [originCode, loungeDialogLabels]);

	const {
		airportLoungePassengers: passengerLists,
		toggleAirportLoungePax,
		toggleAirportLoungeSelectAll,
	} = useAirportLoungePassengerSelection({ segmentLfid });
	const loungeAccompanyingSelection = useAccompanyingSelectionHelpers({
		autoSelectPassengerTypes: INFANT_PASSENGER_TYPES,
		normalizePassengerTypeCode: (passengerTypeCode) => passengerTypeCode?.toLowerCase() ?? "",
		primaryRequiresNoMappedAdult: true,
	});
	const [showFullDescription, setShowFullDescription] = useState(false);
	const isConfirmingRef = useRef(false);
	const wasOpenRef = useRef(false);
	const ancillaryServicesData = useAppSelector((state) =>
		selectAncillaryOffersDataByDirectionAndServiceCategory(state, ancillaryScope, "LOUNGE")
	);

	/** Retrieves the list of saved passengers from the Redux store. */
	const savedPassengers = useAppSelector(selectPassengers);

	// This loungeServiceData the API response / ancillary data and converts it into lounge service options.
	const loungeServiceData = useMemo(
		() => extractLoungeServices(ancillaryServicesData),
		[ancillaryServicesData]
	);

	/**
	 * Resets passenger lounge selections in the dialog to match the
	 * previously saved lounge selections for the current flight segment.
	 */
	const resetDialogSelectionsToSaved = useCallback(() => {
		const savedPassengerById = new Map(
			savedPassengers.map((passenger) => [passenger.id, passenger])
		);
		const segmentLfid = loungeServiceData[0]?.service.lfid;

		for (const passenger of passengerLists) {
			const hasSavedLoungeSelection = (
				savedPassengerById.get(passenger.id)?.services?.lounge ?? []
			).some((service) => segmentLfid === undefined || service.lfid === segmentLfid);

			if (passenger.checked !== hasSavedLoungeSelection) {
				toggleAirportLoungePax(passenger.id, hasSavedLoungeSelection);
			}
		}
	}, [savedPassengers, passengerLists, toggleAirportLoungePax, loungeServiceData]);

	useEffect(() => {
		if (open && !wasOpenRef.current) {
			resetDialogSelectionsToSaved();
		}
		wasOpenRef.current = open;
	}, [open, resetDialogSelectionsToSaved]);

	/**
	 * Maps each passenger type to its corresponding lounge option.
	 * The first available lounge option is retained for each passenger type.
	 */
	const loungeOptionByPassengerType = useMemo(() => {
		const optionsByPassengerType = new Map<string, (typeof loungeServiceData)[number]>();
		for (const option of loungeServiceData) {
			const key = option.passengerType.toLowerCase();
			if (!optionsByPassengerType.has(key)) {
				optionsByPassengerType.set(key, option);
			}
		}
		return optionsByPassengerType;
	}, [loungeServiceData]);

	/**
	 * Returns the available lounge stock quantity from the lounge service data.
	 * Returns undefined when the quantity is not available.
	 */
	const loungeQtyAvailable = useMemo(() => {
		const qtyAvailable = loungeServiceData[0]?.service.qtyAvailable;
		return typeof qtyAvailable === "number" ? qtyAvailable : undefined;
	}, [loungeServiceData]);

	/**
	 * Calculates the number of manually selected passengers eligible for lounge access.
	 *
	 * Excludes passengers whose passenger type is automatically selected by the
	 * accompanying passenger selection logic.
	 *
	 * @returns {number} Count of selected lounge passengers excluding auto-selected passenger types.
	 */
	const selectedLoungePassengerCount = useMemo(
		() =>
			passengerLists.filter(
				(passenger) =>
					passenger.checked &&
					!loungeAccompanyingSelection.isAutoSelectedPassengerType(passenger.passengerTypeCode)
			).length,
		[passengerLists, loungeAccompanyingSelection]
	);

	/*
    isStockExhausted shows banner when:
    There are MORE total passengers than available stock AND
    Selected count reaches the available stock limit
    This prevents banner when everyone fits (e.g., 2 available + 2 total passengers)
    But shows when stock is overbooked (e.g., 1 available + 3 total passengers selecting 1st)
  */
	const isStockExhausted =
		typeof loungeQtyAvailable === "number" &&
		loungeQtyAvailable < passengerLists.length &&
		loungeQtyAvailable <= selectedLoungePassengerCount;

	// shows remaining stock label only when stock is below threshold and greater than 0.
	const loungeStockLabel = useMemo(() => {
		if (typeof loungeQtyAvailable !== "number" || loungeQtyAvailable >= stockWarningThreshold) {
			return undefined;
		}

		const remainingStock = Math.max(loungeQtyAvailable - selectedLoungePassengerCount, 0);

		// Don't show label when no stock is remaining
		if (remainingStock === 0) {
			return undefined;
		}

		return loungeDialogLabels("remaining_stocks_label", { count: remainingStock });
	}, [loungeDialogLabels, loungeQtyAvailable, selectedLoungePassengerCount]);

	/**
	 * Memoized lounge price based on the first eligible passenger type.
	 * Falls back to the default lounge price when no eligible passenger is found
	 * or when a price is not configured for the passenger type.
	 */
	const airportLoungePrice = useMemo(() => {
		const firstEligiblePassenger = passengerLists.find((passenger) => {
			const passengerTypeCode = passenger.passengerTypeCode?.toLowerCase();
			return passengerTypeCode && passengerTypeCode !== "infant";
		});
		if (!firstEligiblePassenger) {
			return loungeServiceData[0]?.price ?? 0;
		}
		const passengerTypeKey = firstEligiblePassenger.passengerTypeCode?.toLowerCase() ?? "";
		return (
			loungeOptionByPassengerType.get(passengerTypeKey)?.price ?? loungeServiceData[0]?.price ?? 0
		);
	}, [passengerLists, loungeOptionByPassengerType, loungeServiceData]);

	const airportLoungeTotalAmount = getAirportLoungeTotalAmount(passengerLists, airportLoungePrice);

	const loungeMobileDescription = getSeeMoreDescriptionText(
		airportLoungeInfo?.description ?? "",
		showFullDescription,
		235
	);

	/**
	 * Prepares the passenger list for lounge selection.
	 * Automatically links dependent passengers to selected adults
	 * and applies stock-based availability rules.
	 * @returns Passenger list with updated selection and disabled states.
	 */
	const loungePassengers = useMemo(() => {
		const syncedPassengers = loungeAccompanyingSelection.syncAccompanyingPassengers(passengerLists);

		return syncedPassengers.map((passenger) => {
			const isDependentPassenger = loungeAccompanyingSelection.isAutoSelectedPassengerType(
				passenger.passengerTypeCode
			);
			if (isDependentPassenger) {
				return {
					...passenger,
					price: 0,
					disabled: true,
				};
			}
			const isDisabledByStock = isStockExhausted && !passenger.checked;
			return {
				...passenger,
				disabled: (passenger.disabled ?? false) || isDisabledByStock,
				status: isDisabledByStock ? loungeDialogLabels("out_of_stock_message") : undefined,
			};
		});
	}, [passengerLists, isStockExhausted, loungeDialogLabels, loungeAccompanyingSelection]);

	/**
	 * Updates the lounge selection status for a passenger.
	 * Prevents new lounge selections when stock is exhausted,
	 * except for eligible dependent passengers.
	 * @param id Passenger identifier.
	 * @param checked Whether the passenger is selected.
	 */
	const handlePassengerChange = (id: string, checked: boolean) => {
		const targetPassenger = passengerLists.find((passenger) => passenger.id === id);
		if (!targetPassenger) {
			return;
		}
		const isAutoSelectedPassenger = loungeAccompanyingSelection.isAutoSelectedPassengerType(
			targetPassenger.passengerTypeCode
		);
		if (checked && !targetPassenger.checked && isStockExhausted && !isAutoSelectedPassenger) {
			return;
		}
		toggleAirportLoungePax(id, checked);
	};

	// Select all eligible passengers without exceeding the available lounge stock.
	// Dependent passengers (infant) are disabled and auto-follow their adult via loungePassengers derived state.
	const handleSelectAllChange = (checked: boolean) => {
		if (!checked) {
			toggleAirportLoungeSelectAll(false);
			return;
		}
		if (typeof loungeQtyAvailable !== "number") {
			toggleAirportLoungeSelectAll(true);
			return;
		}
		let remainingSlots = Math.max(loungeQtyAvailable - selectedLoungePassengerCount, 0);
		if (remainingSlots === 0) {
			return;
		}
		for (const passenger of passengerLists) {
			if (passenger.disabled || passenger.checked) {
				continue;
			}
			if (remainingSlots <= 0) {
				break;
			}
			toggleAirportLoungePax(passenger.id, true);
			remainingSlots -= 1;
		}
	};

	/** Saves the selected lounge services and confirms the lounge selection.*/
	const handleConfirm = () => {
		isConfirmingRef.current = true;
		const savedPassengerById = createSavedPassengerMap(savedPassengers);
		const { selectedLoungeServiceByPassengerId, removableOptionsByPassengerId } =
			getPassengerLoungeSelections(
				loungePassengers,
				loungeServiceData,
				loungeOptionByPassengerType
			);
		const nextPassengers = updateExistingPassengers(
			savedPassengers,
			passengerLists,
			loungeServiceData,
			selectedLoungeServiceByPassengerId,
			removableOptionsByPassengerId
		);
		appendNewPassengers(
			nextPassengers,
			passengerLists,
			savedPassengerById,
			selectedLoungeServiceByPassengerId
		);
		dispatch(setPassengerNames(nextPassengers));
		onConfirm();
	};

	// Reset unsaved selections when the lounge dialog is closed.
	const handleDialogOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			if (isConfirmingRef.current) {
				isConfirmingRef.current = false;
			} else {
				resetDialogSelectionsToSaved();
			}
		}
		onOpenChange(nextOpen);
	};
	if (!airportLoungeInfo) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent
				desktopWidth={1024}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col gap-0"
			>
				<DialogHeader>
					<DialogTitle>{`${loungeDialogLabels("lounge_service_title")} - ${stageLabel}`}</DialogTitle>
					<span className="text-base-700 text-xs leading-5">{transportRouteLabel}</span>
				</DialogHeader>
				{isStockExhausted && (
					<div className="px-4 pt-3 md:px-6 md:pt-2">
						<Alert variant="warning" className="order-1 md:order-0">
							<AlertTitle>{commonLabels("exceeds_available_stock_title")}</AlertTitle>
							<AlertDescription>{commonLabels("exceeds_available_stock_message")}</AlertDescription>
						</Alert>
					</div>
				)}
				<div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 md:flex-row md:items-start md:px-6 md:py-6">
					{/* Airport Lounge Details */}
					<div className="flex flex-1 flex-col gap-4">
						<div className="order-3 flex flex-col gap-2 md:order-1">
							<div className="contents md:flex md:flex-col md:gap-0">
								<h2 className="font-bold text-2xl text-primary-700 leading-9 md:order-0">
									{airportLoungeInfo.title}
								</h2>
								{!isStockExhausted && loungeStockLabel && (
									<span className="text-primary-700 text-xs leading-5 md:order-0">
										{loungeStockLabel}
									</span>
								)}
							</div>

							<p className="text-base-700 text-sm leading-6 md:order-0">
								{airportLoungeInfo.hours}
							</p>
						</div>
						<div className="order-5 flex items-center gap-4 md:order-2">
							{airportLoungeInfo.amenities.map((amenity) => (
								<div key={amenity.label} className="flex flex-col items-center gap-1">
									<div className="flex items-center justify-center rounded-lg bg-info-100 p-3">
										<Icon name={amenity.icon} size={24} fill={1} className="text-primary-700" />
									</div>
									<span className="text-brand-japan-black text-xs leading-5">{amenity.label}</span>
								</div>
							))}
						</div>

						<div className="relative order-2 h-60 w-full shrink-0 overflow-hidden rounded-lg md:order-3 md:h-[15.625rem]">
							<Image
								src={airportLoungeInfo.imageSrc}
								alt={airportLoungeInfo.title}
								fill
								className="object-cover"
							/>
						</div>
						<p className="order-6 font-normal text-base-700 text-sm leading-6 md:order-4">
							<span className="md:hidden">
								{loungeMobileDescription.text}
								{loungeMobileDescription.isTruncated && (
									<button
										type="button"
										className="ml-1 inline text-primary-700 underline"
										onClick={() => setShowFullDescription(true)}
									>
										See More
									</button>
								)}
							</span>
							<span className="hidden md:block">{airportLoungeInfo.description}</span>
						</p>
					</div>

					{/* Divider */}
					<div className="order-7 h-px w-full shrink-0 bg-base-300 md:order-0 md:h-auto md:w-px md:self-stretch" />

					{/* Passenger List */}
					<div className="order-8 w-full md:order-0 md:w-[20.375rem] md:shrink-0">
						<SelectCustomers
							passengers={loungePassengers}
							highlightedPassengerId={highlightedPassengerId}
							// Control disable behavior through SelectCustomers props.
							disabledPassengerCategories={[commonLabels("infant_label")]}
							title={selectCustomersTitle("select_customers")}
							price={airportLoungePrice}
							outOfStockLabel={
								isStockExhausted ? loungeDialogLabels("out_of_stock_message") : undefined
							}
							onPassengerChange={handlePassengerChange}
							onSelectAllChange={handleSelectAllChange}
						/>
					</div>
				</div>
				<DialogFooter className="flex h-auto shrink-0 flex-col items-end justify-center gap-4 border-base-300 border-t px-4 md:h-auto md:shrink md:flex-row md:items-center md:justify-end md:gap-6 md:py-3">
					<div className="total-amount flex items-baseline gap-2">
						<span className="font-normal text-brand-japan-black text-sm leading-6">
							{loungeDialogLabels("total_amount_label")}
						</span>
						<span
							className={cn(
								"font-bold text-4xl leading-13",
								airportLoungeTotalAmount === 0 ? "text-base-400" : "text-primary-700"
							)}
						>
							{formatPrice(airportLoungeTotalAmount)}
						</span>
					</div>
					<Button
						type="button"
						variant="primary"
						size="xl"
						className="w-full rounded-lg px-[95.5px] md:w-auto md:min-w-48 md:px-5"
						onClick={handleConfirm}
					>
						{loungeDialogLabels("lounge_confirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
