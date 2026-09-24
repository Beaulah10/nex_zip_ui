/**
 * File: use-seat-map-dialog.ts
 *
 * Manages seat map dialog behavior, including seat selection,
 * validation, passenger assignments, pricing, and confirmation.
 */

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { expandCabinRows } from "@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows";
import { is48HourDeadlineExceeded } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { useSeatMapPassengerPanel } from "@/modules/hooks/seat-map/use-seat-map-passenger-panel/use-seat-map-passenger-panel";
import { useSeatSelection } from "@/modules/hooks/seat-map/use-seat-selection/use-seat-selection";
import { SPECIAL_ASSISTANCE_SSR_CODES } from "@/modules/utils/constants/customer-information/constants";
import {
	ADJACENT_FREE_SEAT_MANDATORY_ERROR,
	BUNDLE_MANDATORY_ERROR,
	EMERGENCY_EXIT_ERROR,
	SEAT_SELECTION_48_HOUR_ERROR,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { isYvrRoute } from "@/modules/utils/helpers/common/route-type/route-type";
import {
	getBundleSeatPrice,
	getBundleSeatServiceCodes,
} from "@/modules/utils/helpers/seat-map/bundle-seat-pricing/bundle-seat-pricing";
import {
	getAdjacentSeatInfoBannerMessages,
	getSeatRulesInfoMessages,
	getSeatValidationErrorMessage,
	getSeatWarningBannerMessage,
} from "@/modules/utils/helpers/seat-map/seat-map-error-message/seat-map-error-message";
import {
	getActiveSeatMapSegment,
	getPassengerBundleCodeByLfid,
} from "@/modules/utils/helpers/seat-map/seat-map-segment-utils/seat-map-segment-utils";
import {
	getAdjacentFreePassengerIds,
	getAdjacentRuleVariant,
	getSeatRecliningWarningType,
	isEmergencyExitSeat,
	isSeatRestrictedWithin48Hours,
	validateAdultSeatAgainstChildren,
	validateAllAdjacentSeatAssignments,
	validateSeatSelection,
} from "@/modules/utils/validations/seat-map/seat-validation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import { addSeat, removeSeat, selectPassengers } from "@/store/slices/passenger/passenger.slice";
import {
	clearSeatMap,
	selectBuiltSeatMap,
	selectSeatMapRequest,
} from "@/store/slices/seat-map/seat-map.slice";
import type { PassengerSeat } from "@/types/passenger/passenger.type";
import type { Assignments, ExpandedSeat, SeatLegendPrices } from "@/types/seat-map/seat-map.types";
import type {
	CabinType,
	SeatValidationError,
	SeatValidationPassenger,
	SeatWarningBanner,
} from "@/types/seat-map/seat-validation.types";

/**
 * Defines the properties required to initialize
 * and manage the seat map dialog.
 */
interface UseSeatMapDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	direction: BookingFlowDirection;
}

const EMPTY_BUNDLE_SEAT_SERVICE_CODES = new Set<string>();

function formatSeatPrice(amount: number): string {
	return `¥${amount.toLocaleString()}`;
}

/**
 * Returns the passenger ids that currently carry a special-assistance SSR.
 */
function getSpecialAssistancePassengerIds(
	passengers: Array<{
		id: string;
		services?: {
			"non-chargeable"?: Array<{ ssrCode: string }>;
		};
	}>
): Set<string> {
	const passengerIds = new Set<string>();

	for (const passenger of passengers) {
		const hasSpecialAssistance =
			passenger.services?.["non-chargeable"]?.some((service) =>
				SPECIAL_ASSISTANCE_SSR_CODES.has(service.ssrCode)
			) ?? false;

		if (hasSpecialAssistance) {
			passengerIds.add(passenger.id);
		}
	}

	return passengerIds;
}

/**
 * Returns the first passenger index that still has an emergency exit seat while
 * carrying a special-assistance SSR.
 */
function getEmergencyExitSsrFailure({
	orderedPassengersWithNames,
	assignments,
	seatByCode,
	specialAssistancePassengerIds,
}: {
	orderedPassengersWithNames: Array<{ id: string }>;
	assignments: Map<number, { seatCode: string }>;
	seatByCode: Map<string, ExpandedSeat>;
	specialAssistancePassengerIds: ReadonlySet<string>;
}): { idx: number; errorType: SeatValidationError["type"] } | undefined {
	if (specialAssistancePassengerIds.size === 0) {
		return undefined;
	}

	for (const [idx, assignment] of assignments.entries()) {
		const passenger = orderedPassengersWithNames[idx];
		if (!passenger || !specialAssistancePassengerIds.has(passenger.id)) {
			continue;
		}

		const seat = seatByCode.get(assignment.seatCode);
		if (seat && isEmergencyExitSeat(seat)) {
			return { idx, errorType: EMERGENCY_EXIT_ERROR.type };
		}
	}

	return undefined;
}

/**
 * Creates a passengers to-seat mapping using the current
 * passenger order and selected seat assignments.
 */
function buildPassengerSeatMap(
	orderedPassengers: Array<{ id: string }>,
	assignments: Map<number, { seatCode: string }>
): Map<string, string> {
	const map = new Map<string, string>();
	for (const [idx, assignment] of assignments.entries()) {
		const passenger = orderedPassengers[idx];
		if (passenger) {
			map.set(passenger.id, assignment.seatCode);
		}
	}
	return map;
}

/**
 * Generates passenger initials from the first and
 * last name for seat assignment labels.
 */
function getPassengerInitials(firstName: string, lastName: string): string {
	return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}

/**
 * Returns the first seat amount matching the specified
 * seat status from the available seat collection.
 */
function findFirstSeatAmountByStatus(
	seats: ExpandedSeat[],
	status: ExpandedSeat["status"]
): number | undefined {
	return seats.find((seat) => seat.status === status)?.amount;
}

/**
 * Builds legend pricing data based on available seats
 * and the currently selected seat assignment.
 */
function buildSeatLegendPrices({
	seats,
	activeAssignment,
}: {
	seats: ExpandedSeat[];
	activeAssignment: { amount: number } | undefined;
}): SeatLegendPrices {
	const firstSelectableAmount = seats.find((seat) => seat.status !== "not-selectable")?.amount;

	return {
		"more-legroom": findFirstSeatAmountByStatus(seats, "exit-row"),
		"front-aisle-window-side": findFirstSeatAmountByStatus(seats, "front-tier"),
		"reclining-not-allowed": findFirstSeatAmountByStatus(seats, "no-recline"),
		"rear-aisle-window-side": findFirstSeatAmountByStatus(seats, "rear-tier"),
		"central-seat": findFirstSeatAmountByStatus(seats, "central"),
		selected: activeAssignment?.amount ?? firstSelectableAmount,
		"not-selectable": 0,
	};
}

/**
 * Creates a seat code from row and column values.
 * Example: row 12 and column A become 12A.
 */
function getStoredSeatCode(seat: PassengerSeat): string {
	return `${seat.row}${seat.column}`;
}

function getNextAssignments({
	assignments,
	activePassengerIndex,
	seat,
	seatOwnerIndex,
}: {
	assignments: Assignments;
	activePassengerIndex: number;
	seat: ExpandedSeat;
	seatOwnerIndex: number | undefined;
}): Assignments {
	const nextAssignments = new Map(assignments);

	if (seatOwnerIndex !== undefined && seatOwnerIndex !== activePassengerIndex) {
		nextAssignments.delete(seatOwnerIndex);
		return nextAssignments;
	}

	if (assignments.get(activePassengerIndex)?.seatCode === seat.code) {
		nextAssignments.delete(activePassengerIndex);
		return nextAssignments;
	}

	nextAssignments.set(activePassengerIndex, {
		seatCode: seat.code,
		amount: seat.amount,
		serviceCode: seat.serviceCode,
		seatType: seat.type,
	});

	return nextAssignments;
}

function getSeatWarningBannerFromAssignments({
	assignments,
	seatByCode,
	toSeatWarningBanner,
}: {
	assignments: Assignments;
	seatByCode: Map<string, ExpandedSeat>;
	toSeatWarningBanner: (warningType: SeatWarningBanner["type"]) => SeatWarningBanner;
}): SeatWarningBanner | undefined {
	for (const assignment of assignments.values()) {
		const seat = seatByCode.get(assignment.seatCode);
		if (!seat) {
			continue;
		}

		const warningBanner = getSeatRecliningWarningType(seat);
		if (warningBanner) {
			return toSeatWarningBanner(warningBanner.type);
		}
	}

	return undefined;
}

/**
 * Runs the shared seat-selection validation sequence.
 * Returns the first blocking validation error with its passenger index,
 * or `undefined` when the current assignments are valid.
 */
function getSeatAssignmentValidationFailure({
	orderedPassengersWithNames,
	adjacentFreePassengerIndexes,
	bundleFreePassengerIndexes,
	assignments,
	seatValidationPassengers,
	seatByCode,
	isDepartureWithin48Hours,
	validationCabinType,
	passengerSeatMap,
}: {
	orderedPassengersWithNames: Array<{ id: string }>;
	adjacentFreePassengerIndexes: Set<number>;
	bundleFreePassengerIndexes: Set<number>;
	assignments: Map<number, { seatCode: string }>;
	seatValidationPassengers: SeatValidationPassenger[];
	seatByCode: Map<string, ExpandedSeat>;
	isDepartureWithin48Hours: boolean;
	validationCabinType: CabinType;
	passengerSeatMap: Map<string, string>;
}): { idx?: number; errorType?: SeatValidationError["type"] } | undefined {
	const unassignedAdjacentFreeIdx = orderedPassengersWithNames.findIndex(
		(_, idx) => adjacentFreePassengerIndexes.has(idx) && !assignments.has(idx)
	);

	if (unassignedAdjacentFreeIdx !== -1) {
		return {
			idx: unassignedAdjacentFreeIdx,
			errorType: ADJACENT_FREE_SEAT_MANDATORY_ERROR.type,
		};
	}

	const unassignedBundleIdx = orderedPassengersWithNames.findIndex(
		(_, idx) => bundleFreePassengerIndexes.has(idx) && !assignments.has(idx)
	);

	if (unassignedBundleIdx !== -1) {
		return { idx: unassignedBundleIdx, errorType: BUNDLE_MANDATORY_ERROR.type };
	}

	for (const [idx, assignment] of assignments.entries()) {
		const passenger = seatValidationPassengers[idx];

		if (!passenger) {
			continue;
		}

		const seat = seatByCode.get(assignment.seatCode);

		if (!seat) {
			continue;
		}

		if (isDepartureWithin48Hours && isSeatRestrictedWithin48Hours(seat)) {
			return { idx, errorType: SEAT_SELECTION_48_HOUR_ERROR.type };
		}

		const childResult = validateSeatSelection({
			passenger,
			seat,
			cabinType: validationCabinType,
			passengers: seatValidationPassengers,
			passengerSeatMap,
		});

		if (!childResult.isValid) {
			return { idx, errorType: childResult.error?.type };
		}

		if (passenger.passengerTypeCode === "adult") {
			const adultResult = validateAdultSeatAgainstChildren({
				adultPassenger: passenger,
				newAdultSeatCode: seat.code,
				cabinType: validationCabinType,
				passengers: seatValidationPassengers,
				passengerSeatMap,
			});

			if (!adultResult.isValid) {
				return { idx, errorType: adultResult.error?.type };
			}
		}
	}

	const adjacentResult = validateAllAdjacentSeatAssignments({
		cabinType: validationCabinType,
		passengers: seatValidationPassengers,
		passengerSeatMap,
	});

	if (!adjacentResult.isValid) {
		return { errorType: adjacentResult.error?.type };
	}

	return undefined;
}

/**
 * Handles seat map dialog state, seat validation,
 * passenger assignments, and seat confirmation actions.
 */
export function useSeatMapDialog({ open, onOpenChange, direction }: UseSeatMapDialogProps) {
	const t = useTranslations("seat_service");
	const dispatch = useAppDispatch();
	const reduxPassengers = useAppSelector(selectPassengers);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const seatMapRequest = useAppSelector(selectSeatMapRequest);
	const selectedCabin: "ZipFullFlat" | "Standard" =
		seatMapRequest?.cabin === "ZIPFULLFLAT" ? "ZipFullFlat" : "Standard";
	const seatMapData = useAppSelector((state) => selectBuiltSeatMap(state, selectedCabin));
	const seatMapPassengerPanel = useSeatMapPassengerPanel({ direction });
	const {
		activePassengerIndex,
		assignments,
		assignedSeatToPassengerIndex,
		handleSeatSelect,
		setActivePassenger,
		resetAssignments,
		setInitialAssignments,
	} = useSeatSelection(seatMapPassengerPanel.passengers.length);
	const seatConfirmedRef = useRef(false);
	const seatHydratedRef = useRef(false);
	const [seatValidationError, setSeatValidationError] = useState<SeatValidationError | undefined>();
	const [seatWarningBanner, setSeatWarningBanner] = useState<SeatWarningBanner | undefined>();
	const [pendingEmergencyExitSeat, setPendingEmergencyExitSeat] = useState<
		ExpandedSeat | undefined
	>();
	const [showingEmergencyExitSupport, setShowingEmergencyExitSupport] = useState(false);
	const { orderedPassengersWithNames } = usePassengerOrder();
	const selectedSegment = useMemo(
		() =>
			getActiveSeatMapSegment({
				confirmedFlight,
				direction,
				logicalFlightId: seatMapRequest?.logicalFlightId,
			}),
		[confirmedFlight, direction, seatMapRequest?.logicalFlightId]
	);

	const passengerById = useMemo(() => {
		const map = new Map<string, (typeof reduxPassengers)[number]>();
		for (const passenger of reduxPassengers) {
			map.set(passenger.id, passenger);
		}
		return map;
	}, [reduxPassengers]);

	const specialAssistancePassengerIds = useMemo(
		() => getSpecialAssistancePassengerIds(reduxPassengers),
		[reduxPassengers]
	);

	const bundleByPassengerId = useMemo(() => {
		const map = new Map<string, string>();
		for (const passenger of reduxPassengers) {
			const bundleCode = getPassengerBundleCodeByLfid(passenger, selectedSegment?.lfid);
			if (bundleCode) {
				map.set(passenger.id, bundleCode);
			}
		}
		return map;
	}, [reduxPassengers, selectedSegment?.lfid]);

	const bundleSeatServiceCodesByPassengerId = useMemo(() => {
		const map = new Map<string, ReadonlySet<string>>();

		for (const passenger of reduxPassengers) {
			map.set(passenger.id, getBundleSeatServiceCodes(passenger, selectedSegment?.lfid));
		}

		return map;
	}, [reduxPassengers, selectedSegment?.lfid]);

	const seatValidationPassengers = useMemo<SeatValidationPassenger[]>(
		() =>
			orderedPassengersWithNames.map((passenger) => ({
				id: passenger.id,
				passengerTypeCode: passenger.passengerTypeCode ?? undefined,
				mappedAdultId: passenger.mappedAdultId || undefined,
			})),
		[orderedPassengersWithNames]
	);

	const validationCabinType = useMemo<CabinType>(
		() => (selectedCabin === "ZipFullFlat" ? "ZIP_FULL_FLAT" : "STANDARD"),
		[selectedCabin]
	);

	const passengerSeatMap = useMemo(
		() => buildPassengerSeatMap(orderedPassengersWithNames, assignments),
		[orderedPassengersWithNames, assignments]
	);

	const seatOwnerMap = useMemo(() => {
		const map = new Map<string, number>();
		for (const [idx, assignment] of assignments.entries()) {
			map.set(assignment.seatCode, idx);
		}
		return map;
	}, [assignments]);

	const assignedSeatToPassengerLabel = useMemo<Record<string, string>>(() => {
		const labels: Record<string, string> = {};
		for (const [idx, assignment] of assignments.entries()) {
			const passenger = orderedPassengersWithNames[idx];
			if (!passenger || !assignment?.seatCode) {
				continue;
			}
			labels[assignment.seatCode] = getPassengerInitials(passenger.firstName, passenger.lastName);
		}
		return labels;
	}, [assignments, orderedPassengersWithNames]);

	const adjacentFreePassengerIndexes = useMemo(() => {
		const freePassengerIds = new Set(getAdjacentFreePassengerIds(seatValidationPassengers));
		for (const passenger of seatValidationPassengers) {
			if (passenger.mappedAdultId) {
				freePassengerIds.add(passenger.mappedAdultId);
			}
		}
		const freeSet = new Set<number>();
		for (const [idx, passenger] of orderedPassengersWithNames.entries()) {
			if (freePassengerIds.has(passenger.id)) {
				freeSet.add(idx);
			}
		}
		return freeSet;
	}, [seatValidationPassengers, orderedPassengersWithNames]);

	const bundleFreePassengerIndexes = useMemo(() => {
		const freeSet = new Set<number>();
		for (const [idx, passenger] of orderedPassengersWithNames.entries()) {
			if (
				(bundleSeatServiceCodesByPassengerId.get(passenger.id) ?? EMPTY_BUNDLE_SEAT_SERVICE_CODES)
					.size > 0
			) {
				freeSet.add(idx);
			}
		}
		return freeSet;
	}, [orderedPassengersWithNames, bundleSeatServiceCodesByPassengerId]);

	const activePassengerComplimentaryLegendEligible = useMemo(() => {
		return adjacentFreePassengerIndexes.has(activePassengerIndex);
	}, [activePassengerIndex, adjacentFreePassengerIndexes]);

	const activePassengerBundleSeatServiceCodes = useMemo(() => {
		const activePassenger = orderedPassengersWithNames[activePassengerIndex];

		if (!activePassenger) {
			return EMPTY_BUNDLE_SEAT_SERVICE_CODES;
		}

		return (
			bundleSeatServiceCodesByPassengerId.get(activePassenger.id) ?? EMPTY_BUNDLE_SEAT_SERVICE_CODES
		);
	}, [orderedPassengersWithNames, activePassengerIndex, bundleSeatServiceCodesByPassengerId]);

	const bundleInfoMessage = useMemo(
		() =>
			orderedPassengersWithNames.some(
				(passenger) =>
					(bundleSeatServiceCodesByPassengerId.get(passenger.id) ?? EMPTY_BUNDLE_SEAT_SERVICE_CODES)
						.size > 0
			)
				? t("bundle_info_message")
				: undefined,
		[orderedPassengersWithNames, bundleSeatServiceCodesByPassengerId, t]
	);

	const toSeatValidationError = useCallback(
		(errorType: SeatValidationError["type"]) => getSeatValidationErrorMessage(t, errorType),
		[t]
	);

	const toSeatWarningBanner = useCallback(
		(warningType: SeatWarningBanner["type"]) => getSeatWarningBannerMessage(t, warningType),
		[t]
	);

	const failValidation = useCallback(
		(idx: number | undefined, errorType?: SeatValidationError["type"]) => {
			if (idx !== undefined) {
				setActivePassenger(idx);
			}

			setSeatWarningBanner(undefined);

			setSeatValidationError(errorType ? toSeatValidationError(errorType) : undefined);
		},
		[setActivePassenger, toSeatValidationError]
	);

	const effectiveTotalSeatCost = useMemo(() => {
		let total = 0;
		for (const [idx, assignment] of assignments.entries()) {
			if (adjacentFreePassengerIndexes.has(idx)) {
				continue;
			}

			const passenger = orderedPassengersWithNames[idx];
			const bundleSeatPrice = getBundleSeatPrice({
				amount: assignment.amount,
				serviceCode: assignment.serviceCode,
				bundleSeatServiceCodes: passenger
					? (bundleSeatServiceCodesByPassengerId.get(passenger.id) ??
						EMPTY_BUNDLE_SEAT_SERVICE_CODES)
					: EMPTY_BUNDLE_SEAT_SERVICE_CODES,
			});

			total += bundleSeatPrice.effectiveAmount;
		}
		return total;
	}, [
		assignments,
		adjacentFreePassengerIndexes,
		orderedPassengersWithNames,
		bundleSeatServiceCodesByPassengerId,
	]);

	const isDepartureWithin48Hours = useMemo(() => {
		const departureDateTime =
			selectedSegment?.scheduledDepartureArrivalDateTime?.departureDateTimeOffset ??
			selectedSegment?.scheduledDepartureArrivalDateTime?.departureDateTime;
		return departureDateTime ? is48HourDeadlineExceeded(departureDateTime) : false;
	}, [selectedSegment]);

	const expandedSeats = useMemo(
		() =>
			(seatMapData ?? []).flatMap((cabin) => expandCabinRows(cabin)).flatMap((row) => row.seats),
		[seatMapData]
	);

	/**
	 * Creates a quick lookup map for seats by seat code.
	 * Used during confirm validation to find selected seat details.
	 */
	const seatByCode = useMemo(() => {
		const map = new Map<string, ExpandedSeat>();

		for (const seat of expandedSeats) {
			map.set(seat.code, seat);
		}

		return map;
	}, [expandedSeats]);

	const emergencyExitSsrFailure = useMemo(
		() =>
			getEmergencyExitSsrFailure({
				orderedPassengersWithNames,
				assignments,
				seatByCode,
				specialAssistancePassengerIds,
			}),
		[orderedPassengersWithNames, assignments, seatByCode, specialAssistancePassengerIds]
	);

	const seatAssignmentValidationFailure = useMemo(
		() =>
			getSeatAssignmentValidationFailure({
				orderedPassengersWithNames,
				adjacentFreePassengerIndexes,
				bundleFreePassengerIndexes,
				assignments,
				seatValidationPassengers,
				seatByCode,
				isDepartureWithin48Hours,
				validationCabinType,
				passengerSeatMap,
			}),
		[
			orderedPassengersWithNames,
			adjacentFreePassengerIndexes,
			bundleFreePassengerIndexes,
			assignments,
			seatValidationPassengers,
			seatByCode,
			isDepartureWithin48Hours,
			validationCabinType,
			passengerSeatMap,
		]
	);

	const confirmValidationFailure = emergencyExitSsrFailure ?? seatAssignmentValidationFailure;

	/**
	 * Keeps an already visible validation banner in sync with the
	 * current confirm-time validation result.
	 *
	 * Important:
	 * - This does not show errors on seat click.
	 * - It only updates or removes an already visible error banner.
	 */
	useEffect(() => {
		if (!seatValidationError) {
			return;
		}

		if (!confirmValidationFailure) {
			setSeatValidationError(undefined);
			return;
		}

		if (seatValidationError.type !== confirmValidationFailure.errorType) {
			failValidation(confirmValidationFailure.idx, confirmValidationFailure.errorType);
		}
	}, [seatValidationError, confirmValidationFailure, failValidation]);
	/**
	 * Resets the hydration flag when the dialog opens.
	 * Allows stored seat selections to be restored again.
	 */
	useEffect(() => {
		if (open) {
			seatHydratedRef.current = false;
		}
	}, [open]);

	/**
	 * Restores previously selected seats from Redux.
	 * Rehydrates local assignments after seat map data loads.
	 */
	useEffect(() => {
		const lfid = selectedSegment?.lfid;
		const pfid = selectedSegment?.pfid ?? 0;

		if (!open || !seatMapData || lfid === undefined || seatHydratedRef.current) {
			return;
		}

		const nextAssignments = new Map<
			number,
			{
				seatCode: string;
				amount: number;
				serviceCode: string;
				seatType?: "Window" | "Middle" | "Aisle";
			}
		>();

		orderedPassengersWithNames.forEach((passenger, index) => {
			const reduxPassenger = passengerById.get(passenger.id);

			const storedSeat = reduxPassenger?.seats?.find(
				(seat) => seat.lfid === lfid && seat.pfid === pfid
			);

			if (!storedSeat) {
				return;
			}

			const seatCode = getStoredSeatCode(storedSeat);
			const seatDetails = seatByCode.get(seatCode);

			nextAssignments.set(index, {
				seatCode,
				amount: seatDetails?.amount ?? storedSeat.amount,
				serviceCode: seatDetails?.serviceCode ?? storedSeat.serviceCode,
				seatType: seatDetails?.type,
			});
		});

		setInitialAssignments(nextAssignments);
		setSeatWarningBanner(
			getSeatWarningBannerFromAssignments({
				assignments: nextAssignments,
				seatByCode,
				toSeatWarningBanner,
			})
		);

		seatHydratedRef.current = true;
	}, [
		open,
		seatMapData,
		passengerById,
		orderedPassengersWithNames,
		selectedSegment?.lfid,
		selectedSegment?.pfid,
		setInitialAssignments,
		seatByCode,
		toSeatWarningBanner,
	]);

	/**
	 * Handles seat click without showing validation errors.
	 * The selected seat is validated only on Confirm Selection.
	 */
	const handleValidatedSeatSelect = useCallback(
		(seat: Parameters<typeof handleSeatSelect>[0]) => {
			if (!seat.isSeatAvailable) return;

			const seatOwnerIndex = seatOwnerMap.get(seat.code);
			const nextAssignments = getNextAssignments({
				assignments,
				activePassengerIndex,
				seat,
				seatOwnerIndex,
			});
			const isOtherPassengerDeselect =
				seatOwnerIndex !== undefined && seatOwnerIndex !== activePassengerIndex;
			const isActivePassengerDeselect =
				assignments.get(activePassengerIndex)?.seatCode === seat.code;

			if (isOtherPassengerDeselect || isActivePassengerDeselect) {
				handleSeatSelect(seat);
				setSeatWarningBanner(
					getSeatWarningBannerFromAssignments({
						assignments: nextAssignments,
						seatByCode,
						toSeatWarningBanner,
					})
				);
				return;
			}

			if (isEmergencyExitSeat(seat)) {
				setPendingEmergencyExitSeat(seat);
				setShowingEmergencyExitSupport(true);
				return;
			}

			setSeatWarningBanner(
				getSeatWarningBannerFromAssignments({
					assignments: nextAssignments,
					seatByCode,
					toSeatWarningBanner,
				})
			);
			handleSeatSelect(seat);
		},
		[
			handleSeatSelect,
			seatOwnerMap,
			assignments,
			activePassengerIndex,
			seatByCode,
			toSeatWarningBanner,
		]
	);

	/**
	 * Clears the pending emergency-exit seat state.
	 * Optionally closes the emergency support screen when the caller
	 * is leaving that sub-flow entirely.
	 */
	const clearPendingEmergencyExitSeat = useCallback((closeSupport: boolean) => {
		setPendingEmergencyExitSeat(undefined);
		if (closeSupport) {
			setShowingEmergencyExitSupport(false);
		}
	}, []);

	/**
	 * Confirms the pending emergency-exit seat selection.
	 * Applies any reclining warning before delegating to the shared
	 * seat selection handler, then clears temporary dialog state.
	 */
	const confirmPendingEmergencyExitSeat = useCallback(
		(closeSupport: boolean) => {
			if (!pendingEmergencyExitSeat) return;

			const nextAssignments = getNextAssignments({
				assignments,
				activePassengerIndex,
				seat: pendingEmergencyExitSeat,
				seatOwnerIndex: seatOwnerMap.get(pendingEmergencyExitSeat.code),
			});
			setSeatWarningBanner(
				getSeatWarningBannerFromAssignments({
					assignments: nextAssignments,
					seatByCode,
					toSeatWarningBanner,
				})
			);
			handleSeatSelect(pendingEmergencyExitSeat);
			clearPendingEmergencyExitSeat(closeSupport);
		},
		[
			pendingEmergencyExitSeat,
			assignments,
			activePassengerIndex,
			seatOwnerMap,
			seatByCode,
			toSeatWarningBanner,
			handleSeatSelect,
			clearPendingEmergencyExitSeat,
		]
	);

	/**
	 * Shows the emergency exit support content screen.
	 */
	const handleShowEmergencyExitSupport = useCallback((seat: ExpandedSeat) => {
		setPendingEmergencyExitSeat(seat);
		setShowingEmergencyExitSupport(true);
	}, []);

	/**
	 * Confirms emergency exit seat selection and assigns the seat.
	 */
	const handleConfirmEmergencyExitSupport = useCallback(
		() => confirmPendingEmergencyExitSeat(true),
		[confirmPendingEmergencyExitSeat]
	);

	/**
	 * Cancels emergency exit support and returns to seat map.
	 */
	const handleGoBackFromEmergencySupport = useCallback(
		() => clearPendingEmergencyExitSeat(true),
		[clearPendingEmergencyExitSeat]
	);

	/**
	 * Confirms emergency exit seat selection (for backward compatibility).
	 */
	const handleConfirmEmergencyExitSeat = useCallback(
		() => confirmPendingEmergencyExitSeat(false),
		[confirmPendingEmergencyExitSeat]
	);

	/**
	 * Cancels emergency exit seat selection (for backward compatibility).
	 */
	const handleCancelEmergencyExitSeat = useCallback(
		() => clearPendingEmergencyExitSeat(false),
		[clearPendingEmergencyExitSeat]
	);

	/**
	 * Validates selected seats on Confirm Selection.
	 * Shows validation error banner only after confirm button click.
	 */
	const handleConfirmSeatSelection = useCallback(() => {
		if (confirmValidationFailure) {
			failValidation(confirmValidationFailure.idx, confirmValidationFailure.errorType);
			return;
		}

		const lfid = selectedSegment?.lfid;
		const pfid = selectedSegment?.pfid ?? 0;
		if (lfid !== undefined) {
			for (const passenger of orderedPassengersWithNames) {
				dispatch(removeSeat({ passengerId: passenger.id, lfid, pfid }));
			}

			for (const [idx, assignment] of assignments.entries()) {
				const passenger = orderedPassengersWithNames[idx];
				if (!passenger) continue;
				const match = /^(\d+)([A-Z]+)$/i.exec(assignment.seatCode);
				if (!match) continue;
				const [, row, column] = match;
				if (!row || !column) continue;
				const bundleSeatPrice = getBundleSeatPrice({
					amount: assignment.amount,
					serviceCode: assignment.serviceCode,
					bundleSeatServiceCodes:
						bundleSeatServiceCodesByPassengerId.get(passenger.id) ??
						EMPTY_BUNDLE_SEAT_SERVICE_CODES,
				});
				const bundleCode = bundleByPassengerId.get(passenger.id);
				const seat: PassengerSeat = {
					lfid,
					pfid,
					row,
					column,
					serviceCode: assignment.serviceCode,
					amount: adjacentFreePassengerIndexes.has(idx) ? 0 : bundleSeatPrice.effectiveAmount,
					applicableAmount: adjacentFreePassengerIndexes.has(idx)
						? 0
						: bundleSeatPrice.effectiveAmount,
					...(bundleCode && bundleCode !== "NOBN" ? { bundleCode } : {}),
				};
				dispatch(addSeat({ passengerId: passenger.id, lfid, seat }));
			}
		}

		setSeatValidationError(undefined);
		seatConfirmedRef.current = true;
		onOpenChange(false);
	}, [
		orderedPassengersWithNames,
		assignments,
		confirmValidationFailure,
		selectedSegment,
		adjacentFreePassengerIndexes,
		bundleSeatServiceCodesByPassengerId,
		bundleByPassengerId,
		dispatch,
		onOpenChange,
		failValidation,
	]);

	const adjacentInfoBannerMessages = useMemo(() => {
		const adjacentRuleVariant = getAdjacentRuleVariant(
			seatValidationPassengers,
			isYvrRoute(seatMapRequest?.routes ?? ""),
			validationCabinType
		);
		return adjacentRuleVariant
			? getAdjacentSeatInfoBannerMessages(t, adjacentRuleVariant)
			: undefined;
	}, [seatValidationPassengers, seatMapRequest?.routes, validationCabinType, t]);

	const seatRulesInfoMessages = useMemo(
		() => getSeatRulesInfoMessages(t, validationCabinType),
		[validationCabinType, t]
	);

	const activePassengerSelectedSeatServiceCode = assignments.get(activePassengerIndex)?.serviceCode;

	const legendPrices = useMemo(
		() =>
			buildSeatLegendPrices({
				seats: expandedSeats,
				activeAssignment: assignments.get(activePassengerIndex),
			}),
		[expandedSeats, assignments, activePassengerIndex]
	);

	const seatPassengers = useMemo(
		() =>
			seatMapPassengerPanel.passengers.map((passenger, index) => {
				const assignment = assignments.get(index);
				const orderedPassenger = orderedPassengersWithNames[index];
				const bundleSeatPrice = assignment
					? getBundleSeatPrice({
							amount: assignment.amount,
							serviceCode: assignment.serviceCode,
							bundleSeatServiceCodes: orderedPassenger
								? (bundleSeatServiceCodesByPassengerId.get(orderedPassenger.id) ??
									EMPTY_BUNDLE_SEAT_SERVICE_CODES)
								: EMPTY_BUNDLE_SEAT_SERVICE_CODES,
						})
					: undefined;
				return {
					...passenger,
					seatCode: assignment?.seatCode,
					seatType: assignment?.seatType,
					price: assignment
						? adjacentFreePassengerIndexes.has(index)
							? "¥0"
							: formatSeatPrice(bundleSeatPrice?.effectiveAmount ?? assignment.amount)
						: undefined,
				};
			}),
		[
			seatMapPassengerPanel.passengers,
			assignments,
			adjacentFreePassengerIndexes,
			orderedPassengersWithNames,
			bundleSeatServiceCodesByPassengerId,
		]
	);

	const handleDialogOpenChange = useCallback(
		(isOpen: boolean) => {
			onOpenChange(isOpen);
			if (!isOpen && !seatConfirmedRef.current) {
				resetAssignments();
				dispatch(clearSeatMap());
			}
			if (!isOpen) {
				seatConfirmedRef.current = false;
				seatHydratedRef.current = false;
				setSeatValidationError(undefined);
				setSeatWarningBanner(undefined);
				setPendingEmergencyExitSeat(undefined);
				setShowingEmergencyExitSupport(false);
			}
		},
		[onOpenChange, resetAssignments, dispatch]
	);

	return {
		selectedCabin,
		seatMapData,
		seatValidationError,
		seatWarningBanner,
		seatMapPassengerPanel,
		activePassengerIndex,
		setActivePassenger,
		activePassengerComplimentaryLegendEligible,
		activePassengerBundleSeatServiceCodes,
		activePassengerSelectedSeatServiceCode,
		bundleInfoMessage,
		legendPrices,
		seatPassengers,
		adjacentInfoBannerMessages,
		seatRulesInfoMessages,
		assignedSeatToPassengerIndex,
		assignedSeatToPassengerLabel,
		activeSeatCode: assignments.get(activePassengerIndex)?.seatCode,
		handleValidatedSeatSelect,
		handleConfirmSeatSelection,
		handleDialogOpenChange,
		effectiveTotalSeatCost,
		emergencyExitSeatDialogOpen: !!pendingEmergencyExitSeat,
		handleConfirmEmergencyExitSeat,
		handleCancelEmergencyExitSeat,
		showingEmergencyExitSupport,
		handleShowEmergencyExitSupport,
		handleConfirmEmergencyExitSupport,
		handleGoBackFromEmergencySupport,
		pendingEmergencyExitSeat,
	};
}
