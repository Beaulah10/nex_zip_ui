/**
 * File: seat-validation.types.ts
 * Description: TypeScript types used by the adjacent-seat guarantee and
 * emergency-exit validation logic in the Seat Map selection flow.
 */

export type CabinType = "STANDARD" | "ZIP_FULL_FLAT";

export type AdjacentRuleVariant =
	| "ZERO_TO_SIX"
	| "ZERO_TO_FOURTEEN_VANCOUVER"
	| "SEVEN_TO_FOURTEEN_ZIP_FULL_FLAT";

export type SeatColumn = "A" | "B" | "C" | "D" | "E" | "G" | "H" | "J" | "K";

/** Minimal passenger shape required for seat validation checks. */
export interface SeatValidationPassenger {
	id: string;
	passengerTypeCode?: string;
	/** Id of the associated adult passenger for child/infant passengers requiring adjacent seating. */
	mappedAdultId?: string;
}

export type SeatValidationErrorType =
	| "NON_ADJACENT_OR_WRONG_ADULT"
	| "EMERGENCY_EXIT_INELIGIBLE"
	| "ADJACENT_FREE_SEAT_MANDATORY"
	| "BUNDLE_SEAT_MANDATORY"
	| "SEAT_SELECTION_48_HOUR_UNAVAILABLE";

export type SeatWarningBannerType = "NON_RECLINING" | "LIMITED_RECLINING";

export interface SeatValidationErrorDescriptor {
	type: SeatValidationErrorType;
}

export interface SeatValidationError extends SeatValidationErrorDescriptor {
	title: string;
	body: string;
}

export interface SeatValidationResult {
	isValid: boolean;
	error?: SeatValidationErrorDescriptor;
}

/** Informational warning banner for reclining-seat notifications. */
export interface SeatWarningBannerDescriptor {
	type: SeatWarningBannerType;
}

export interface SeatWarningBanner extends SeatWarningBannerDescriptor {
	title: string;
	body: string;
}
