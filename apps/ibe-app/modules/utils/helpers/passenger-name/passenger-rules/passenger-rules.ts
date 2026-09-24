import type { PassengerItemValues } from "@/modules/utils/validations/passenger.schema/passenger.schema";
//  Count assignments
export const getAdultAssignmentMap = (passengers: PassengerItemValues[]) =>
	passengers.reduce(
		(assignmentMap, passenger) => {
			if (!passenger.accompanyingAdult) return assignmentMap;

			const adultId = passenger.accompanyingAdult;

			if (!assignmentMap[adultId]) {
				assignmentMap[adultId] = {
					infant_Count: 0,
					CHILD_TOTAL: 0,
					childC_Count: 0,
				};
			}

			if (passenger.passengerTypeCode === "infant") {
				assignmentMap[adultId].infant_Count++;
			}

			if (passenger.passengerTypeCode === "childC") {
				assignmentMap[adultId].childC_Count++;
			}

			if (["childA", "childB", "childC"].includes(passenger.passengerTypeCode)) {
				assignmentMap[adultId].CHILD_TOTAL++;
			}

			return assignmentMap;
		},
		{} as Record<string, { infant_Count: number; CHILD_TOTAL: number; childC_Count: number }>
	);

/**
 * isValidateAdultAssignment
 *
 * Checks whether assigning a passenger of `passengerType` to `adultId`
 * is allowed given the current state of assignments (`assignmentMap`).
 *
 * Rules differ between YVR routes and standard routes:
 *
 * ── Common rule (both routes) ────────────────────────────────────────────────
 *   • 1 adult can carry at most 1 infant.
 *
 * ── YVR route rules ──────────────────────────────────────────────────────────
 *   Allowed combos per adult:
 *     • 2 children (childA / childB / childC), 0 infants
 *     • 1 child + 0 infants  (still open)
 *     • 0 children + 1 infant
 *     • 1 child + 1 infant   (max capacity)
 *   Blocked:
 *     • Adding an infant when 2 children are already assigned
 *     • Adding a child  when 1 child + 1 infant are already assigned
 *     • Adding a child  when 2 children are already assigned
 *
 * ── Standard (non-YVR) route rules ───────────────────────────────────────────
 *   Only childC (age 2–6) and infant require an accompanying adult.
 *   Max 2 total dependants (infant + childC) per adult.
 */
export const isValidateAdultAssignment = ({
	adultId,
	passengerType,
	map: assignmentMap,
	isYvr,
}: {
	adultId: string;
	passengerType: string;
	map: ReturnType<typeof getAdultAssignmentMap>;
	isYvr: boolean;
}) => {
	// Fetch current counts for this adult; default to zero if not yet assigned.
	const stats = assignmentMap[adultId] || { infant_Count: 0, CHILD_TOTAL: 0, childC_Count: 0 };

	// Common rule: every adult can hold at most 1 infant regardless of route.
	if (passengerType === "infant" && stats.infant_Count >= 1) {
		return false;
	}
	if (isYvr) {
		//  Block: 2 children already → cannot add infant
		if (passengerType === "infant" && stats.CHILD_TOTAL >= 2) {
			return false;
		}

		//  Block: already 1 child + 1 infant → cannot add more children
		if (
			["childA", "childB", "childC"].includes(passengerType) &&
			stats.CHILD_TOTAL >= 1 &&
			stats.infant_Count >= 1
		) {
			return false;
		}

		//  Block: more than 2 children
		if (["childA", "childB", "childC"].includes(passengerType) && stats.CHILD_TOTAL >= 2) {
			return false;
		}

		return true;
	}

	// Standard route: max 2 total per adult (infant + childC), no 2 infants.
	// Only childC and infant need an accompanying adult on non-YVR flights.
	const standardTotal = stats.infant_Count + stats.childC_Count;

	if (["infant", "childC"].includes(passengerType) && standardTotal >= 2) {
		return false;
	}

	return true;
};

// Determines whether a passenger type requires an accompanying adult selection
export const shouldHaveAccompanyingAdult = (type: string, yvr: boolean) => {
	if (yvr) {
		// YVR route → all child types
		return ["childA", "childB", "childC", "infant"].includes(type);
	}
	// Non-YVR route → only small kids (childC) and infants
	return ["childC", "infant"].includes(type);
};
