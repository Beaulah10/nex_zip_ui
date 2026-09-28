/**
 * File: seat-validation.ts
 * Description: Pure helper functions and constants for seat selection validation.
 * Covers adjacent-seat guarantee rules (standard cabin and ZIP Full-Flat cabin)
 * and emergency-exit seat eligibility.
 */

import {
	EMERGENCY_EXIT_ERROR,
	EMERGENCY_EXIT_SEAT_CODES,
	EMERGENCY_EXIT_SERVICE_CODE,
	LIMITED_RECLINING_SEATS,
	LIMITED_RECLINING_WARNING,
	NON_ADJACENT_ERROR,
	NON_RECLINING_SEATS,
	NON_RECLINING_WARNING,
	ROW_56_57_SPECIAL_ADJACENT_PAIRS,
	STANDARD_ADJACENT_PAIRS,
	STANDARD_INVALID_ACROSS_AISLE_PAIRS,
	ZIP_FULL_FLAT_ADJACENT_PAIRS,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { ExpandedSeat } from "@/types/seat-map/seat-map.types";
import type {
	AdjacentRuleVariant,
	CabinType,
	SeatValidationPassenger,
	SeatValidationResult,
	SeatWarningBannerDescriptor,
} from "@/types/seat-map/seat-validation.types";

// ── Internal helpers ───────────────────────────────────────────────────────────

function normalizePair(a: string, b: string): string {
	return [a, b].sort().join("-");
}

function isPairIncluded(pairs: [string, string][], colA: string, colB: string): boolean {
	const target = normalizePair(colA, colB);
	return pairs.some(([a, b]) => normalizePair(a, b) === target);
}

/**
 * Parses a seat code (e.g. "46A") into its numeric row and column letter.
 */
function parseSeatCode(seatCode: string): { row: number; column: string } {
	return {
		row: Number.parseInt(seatCode, 10),
		column: seatCode.replace(/^\d+/, ""),
	};
}

// ── Public helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true when the seat is classified as an emergency exit seat.
 * A seat must match both the supported row-46 seat codes and the STEX service code.
 */
export function isEmergencyExitSeat(seat: ExpandedSeat): boolean {
	return (
		EMERGENCY_EXIT_SEAT_CODES.has(seat.code) && seat.serviceCode === EMERGENCY_EXIT_SERVICE_CODE
	);
}

/**
 * Returns true when the passenger is eligible to sit in an emergency exit seat.
 * Only adult passengers (passengerTypeCode === "adult") are eligible.
 */
export function isPassengerEmergencyExitEligible(passenger: SeatValidationPassenger): boolean {
	return passenger.passengerTypeCode === "adult";
}

/**
 * Returns true when the passenger is covered by the adjacent-seat guarantee.
 * A passenger is covered when they are non-adult AND have a mapped associated adult id.
 */
export function isPassengerCoveredUnderAdjacentRule(passenger: SeatValidationPassenger): boolean {
	if (passenger.passengerTypeCode === "adult") return false;
	return !!passenger.mappedAdultId;
}

/**
 * Returns the passenger ids that are eligible for adjacent-seat free pricing.
 *
 * Pricing eligibility is mapping-based:
 * - every covered child/infant is free
 * - their mapped accompanying adult is also free
 * - one adult may qualify alongside multiple mapped children
 */
export function getAdjacentFreePassengerIds(passengers: SeatValidationPassenger[]): Set<string> {
	const passengerIds = new Set(passengers.map((passenger) => passenger.id));
	const freePassengerIds = new Set<string>();

	for (const passenger of passengers) {
		if (!isPassengerCoveredUnderAdjacentRule(passenger) || !passenger.mappedAdultId) {
			continue;
		}

		if (!passengerIds.has(passenger.mappedAdultId)) {
			continue;
		}

		freePassengerIds.add(passenger.id);
		freePassengerIds.add(passenger.mappedAdultId);
	}

	return freePassengerIds;
}

/**
 * Returns true when the current booking context can still satisfy at least one
 * required adjacent seat pair from the currently available seats.
 */
export function hasRequiredAdjacentSeatAvailability({
	passengers,
	cabinType,
	availableSeatCodes,
}: {
	passengers: SeatValidationPassenger[];
	cabinType: CabinType;
	availableSeatCodes: string[];
}): boolean {
	if (!shouldShowAdjacentSeatInfoBanner(passengers)) {
		return true;
	}

	for (let firstIndex = 0; firstIndex < availableSeatCodes.length; firstIndex++) {
		const firstSeatCode = availableSeatCodes[firstIndex];

		if (!firstSeatCode) {
			continue;
		}

		for (let secondIndex = firstIndex + 1; secondIndex < availableSeatCodes.length; secondIndex++) {
			const secondSeatCode = availableSeatCodes[secondIndex];

			if (!secondSeatCode) {
				continue;
			}

			if (areSeatCodesAdjacent(firstSeatCode, secondSeatCode, cabinType)) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Returns true when adultSeatCode and childSeatCode are adjacent in the standard cabin.
 *
 * - Rows 56/57 use special pairs: A-C and H-K.
 * - C-D and G-H always cross an aisle and are never adjacent.
 * - All other adjacency follows the standard column-group layout.
 */
export function isStandardCabinAdjacent(adultSeatCode: string, childSeatCode: string): boolean {
	const adult = parseSeatCode(adultSeatCode);
	const child = parseSeatCode(childSeatCode);

	if (adult.row !== child.row) return false;

	if (adult.row === 56 || adult.row === 57) {
		if (isPairIncluded(ROW_56_57_SPECIAL_ADJACENT_PAIRS, adult.column, child.column)) {
			return true;
		}
	}

	if (isPairIncluded(STANDARD_INVALID_ACROSS_AISLE_PAIRS, adult.column, child.column)) {
		return false;
	}

	return isPairIncluded(STANDARD_ADJACENT_PAIRS, adult.column, child.column);
}

/**
 * Returns true when adultSeatCode and childSeatCode are adjacent in the ZIP Full-Flat cabin.
 * Only A-D, D-G, and G-K column pairs within the same row are valid.
 */
export function isZipFullFlatAdjacent(adultSeatCode: string, childSeatCode: string): boolean {
	const adult = parseSeatCode(adultSeatCode);
	const child = parseSeatCode(childSeatCode);

	if (adult.row !== child.row) return false;

	return isPairIncluded(ZIP_FULL_FLAT_ADJACENT_PAIRS, adult.column, child.column);
}

/**
 * Checks adjacency between two seat codes for the given cabin type.
 */
function areSeatCodesAdjacent(seatCodeA: string, seatCodeB: string, cabinType: CabinType): boolean {
	return cabinType === "ZIP_FULL_FLAT"
		? isZipFullFlatAdjacent(seatCodeA, seatCodeB)
		: isStandardCabinAdjacent(seatCodeA, seatCodeB);
}

// ── Main validation ────────────────────────────────────────────────────────────

/**
 * Validates a single seat selection for the given passenger.
 *
 * Validation order:
 * 1. Emergency exit seat eligibility.
 * 2. Adjacent-seat guarantee (only for passengers with a mapped adult).
 *
 * When the associated adult has no seat yet, the child selection is allowed
 * provisionally — full adjacency is enforced at confirm time.
 */
export function validateSeatSelection({
	passenger,
	seat,
	cabinType,
	passengers,
	passengerSeatMap,
}: {
	passenger: SeatValidationPassenger;
	seat: ExpandedSeat;
	cabinType: CabinType;
	passengers: SeatValidationPassenger[];
	/** Maps passengerId → currently assigned seatCode for all passengers. */
	passengerSeatMap: ReadonlyMap<string, string>;
}): SeatValidationResult {
	// 1. Emergency exit check
	if (isEmergencyExitSeat(seat) && !isPassengerEmergencyExitEligible(passenger)) {
		return { isValid: false, error: EMERGENCY_EXIT_ERROR };
	}

	// 2. Skip adjacent check for adults and passengers without a mapped adult
	if (!isPassengerCoveredUnderAdjacentRule(passenger)) {
		return { isValid: true };
	}

	const associatedAdultId = passenger.mappedAdultId;
	if (!associatedAdultId) return { isValid: true };

	const associatedAdultExists = passengers.some((p) => p.id === associatedAdultId);
	if (!associatedAdultExists) {
		return { isValid: false, error: NON_ADJACENT_ERROR };
	}

	const adultSeatCode = passengerSeatMap.get(associatedAdultId);

	// Associated adult not yet seated — allow provisional child selection.
	if (!adultSeatCode) {
		return { isValid: true };
	}

	if (!areSeatCodesAdjacent(adultSeatCode, seat.code, cabinType)) {
		return { isValid: false, error: NON_ADJACENT_ERROR };
	}

	return { isValid: true };
}

/**
 * When an adult passenger changes their seat, validates that none of their
 * already-seated mapped children lose adjacency.
 */
export function validateAdultSeatAgainstChildren({
	adultPassenger,
	newAdultSeatCode,
	cabinType,
	passengers,
	passengerSeatMap,
}: {
	adultPassenger: SeatValidationPassenger;
	newAdultSeatCode: string;
	cabinType: CabinType;
	passengers: SeatValidationPassenger[];
	passengerSeatMap: ReadonlyMap<string, string>;
}): SeatValidationResult {
	const mappedChildren = passengers.filter(
		(p) => p.mappedAdultId === adultPassenger.id && isPassengerCoveredUnderAdjacentRule(p)
	);

	for (const child of mappedChildren) {
		const childSeatCode = passengerSeatMap.get(child.id);
		if (!childSeatCode) continue; // child not yet seated — skip

		if (!areSeatCodesAdjacent(newAdultSeatCode, childSeatCode, cabinType)) {
			return { isValid: false, error: NON_ADJACENT_ERROR };
		}
	}

	const nonMappedCoveredChildren = passengers.filter(
		(passenger) =>
			isPassengerCoveredUnderAdjacentRule(passenger) &&
			passenger.mappedAdultId !== adultPassenger.id
	);

	for (const child of nonMappedCoveredChildren) {
		const childSeatCode = passengerSeatMap.get(child.id);

		if (!childSeatCode || !areSeatCodesAdjacent(newAdultSeatCode, childSeatCode, cabinType)) {
			continue;
		}

		const mappedAdultSeatCode = child.mappedAdultId
			? passengerSeatMap.get(child.mappedAdultId)
			: undefined;

		if (
			!mappedAdultSeatCode ||
			!areSeatCodesAdjacent(mappedAdultSeatCode, childSeatCode, cabinType)
		) {
			return { isValid: false, error: NON_ADJACENT_ERROR };
		}
	}

	return { isValid: true };
}

/**
 * Full-state adjacency validation run before confirming the seat selection.
 * Only adult-child groups that have started seat selection are validated.
 * For those started groups, every covered child must have an assigned seat,
 * and their associated adult must be seated adjacent to them.
 */
export function validateAllAdjacentSeatAssignments({
	cabinType,
	passengers,
	passengerSeatMap,
}: {
	cabinType: CabinType;
	passengers: SeatValidationPassenger[];
	passengerSeatMap: ReadonlyMap<string, string>;
}): SeatValidationResult {
	const coveredChildren = passengers.filter(isPassengerCoveredUnderAdjacentRule);
	const startedAdultIds = new Set(
		coveredChildren.flatMap((child) => {
			const childSeatCode = passengerSeatMap.get(child.id);
			const adultSeatCode = child.mappedAdultId
				? passengerSeatMap.get(child.mappedAdultId)
				: undefined;

			if (!child.mappedAdultId || (!childSeatCode && !adultSeatCode)) {
				return [];
			}

			return [child.mappedAdultId];
		})
	);

	if (startedAdultIds.size === 0) {
		return { isValid: true };
	}

	for (const child of coveredChildren) {
		if (!child.mappedAdultId || !startedAdultIds.has(child.mappedAdultId)) {
			continue;
		}

		const childSeatCode = passengerSeatMap.get(child.id);
		const adultSeatCode = passengerSeatMap.get(child.mappedAdultId);

		if (!childSeatCode || !adultSeatCode) {
			return { isValid: false, error: NON_ADJACENT_ERROR };
		}

		if (!areSeatCodesAdjacent(adultSeatCode, childSeatCode, cabinType)) {
			return { isValid: false, error: NON_ADJACENT_ERROR };
		}
	}

	return { isValid: true };
}

/** Returns true when the seat code is classified as non-reclining. */
export function isNonRecliningSeat(seatCode: string): boolean {
	return NON_RECLINING_SEATS.has(seatCode);
}

/** Returns true when the seat code is classified as limited-reclining. */
export function isLimitedRecliningSeat(seatCode: string): boolean {
	return LIMITED_RECLINING_SEATS.has(seatCode);
}

/**
 * Returns the appropriate reclining warning banner for the given seat,
 * or undefined when no warning applies.
 */
export function getSeatRecliningWarningType(
	seat: Pick<ExpandedSeat, "code" | "serviceCode">
): SeatWarningBannerDescriptor | undefined {
	if (isNonRecliningSeat(seat.code)) return NON_RECLINING_WARNING;
	if (isLimitedRecliningSeat(seat.code)) return LIMITED_RECLINING_WARNING;
	if (seat.serviceCode === "STUN") return NON_RECLINING_WARNING;
	return undefined;
}

/**
 * Returns true when at least one passenger in the booking is subject to the
 * adjacent-seat guarantee and the info banner should be displayed.
 */
export function shouldShowAdjacentSeatInfoBanner(passengers: SeatValidationPassenger[]): boolean {
	return passengers.some(isPassengerCoveredUnderAdjacentRule);
}

/**
 * Derives the adjacent-seat rule variant for the current booking context.
 * Returns undefined when no adjacent rule applies.
 */
export function getAdjacentRuleVariant(
	passengers: SeatValidationPassenger[],
	isVancouverRoute: boolean,
	cabinType: CabinType
): AdjacentRuleVariant | undefined {
	if (!shouldShowAdjacentSeatInfoBanner(passengers)) return undefined;

	if (isVancouverRoute && cabinType === "ZIP_FULL_FLAT") {
		return "SEVEN_TO_FOURTEEN_ZIP_FULL_FLAT";
	}

	if (isVancouverRoute) {
		return "ZERO_TO_FOURTEEN_VANCOUVER";
	}

	return "ZERO_TO_SIX";
}

/**
 * Returns true when the seat is restricted by the 48-hour cutoff.
 * If API sends STEX for emergency exit/front row restricted seats,
 * no hardcoded row/column check is needed.
 */
export function isSeatRestrictedWithin48Hours(seat: ExpandedSeat): boolean {
	return seat.serviceCode === EMERGENCY_EXIT_SERVICE_CODE;
}
