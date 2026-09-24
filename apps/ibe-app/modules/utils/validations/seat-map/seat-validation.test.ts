import { describe, expect, it } from "vitest";
import {
	EMERGENCY_EXIT_ERROR,
	EMERGENCY_EXIT_SERVICE_CODE,
	LIMITED_RECLINING_WARNING,
	NON_ADJACENT_ERROR,
	NON_RECLINING_WARNING,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { ExpandedSeat } from "@/types/seat-map/seat-map.types";
import type { SeatValidationPassenger } from "@/types/seat-map/seat-validation.types";
import {
	getAdjacentFreePassengerIds,
	getAdjacentRuleVariant,
	getSeatRecliningWarningType,
	hasRequiredAdjacentSeatAvailability,
	isEmergencyExitSeat,
	isLimitedRecliningSeat,
	isNonRecliningSeat,
	isPassengerCoveredUnderAdjacentRule,
	isPassengerEmergencyExitEligible,
	isSeatRestrictedWithin48Hours,
	isStandardCabinAdjacent,
	isZipFullFlatAdjacent,
	shouldShowAdjacentSeatInfoBanner,
	validateAdultSeatAgainstChildren,
	validateAllAdjacentSeatAssignments,
	validateSeatSelection,
} from "./seat-validation";

function makePassenger(
	overrides: Partial<SeatValidationPassenger> & Pick<SeatValidationPassenger, "id">
): SeatValidationPassenger {
	return {
		passengerTypeCode: "adult",
		mappedAdultId: undefined,
		...overrides,
	};
}

function makeSeat(overrides: Partial<ExpandedSeat> & Pick<ExpandedSeat, "code">): ExpandedSeat {
	const seatCode = overrides.code;

	return {
		column: seatCode.replace(/^\d+/, "") || "A",
		type: "Window",
		status: "front-tier",
		isSeatAvailable: true,
		amount: 1000,
		serviceCode: "STFW",
		...overrides,
	};
}

describe("seat-validation", () => {
	it("detects emergency exit seats only when code and service code both match", () => {
		expect(
			isEmergencyExitSeat(makeSeat({ code: "46A", serviceCode: EMERGENCY_EXIT_SERVICE_CODE }))
		).toBe(true);
		expect(isEmergencyExitSeat(makeSeat({ code: "46A", serviceCode: "STFW" }))).toBe(false);
		expect(
			isEmergencyExitSeat(makeSeat({ code: "10A", serviceCode: EMERGENCY_EXIT_SERVICE_CODE }))
		).toBe(false);
		expect(isEmergencyExitSeat(makeSeat({ code: "10A", serviceCode: "STFW" }))).toBe(false);
	});

	it("checks emergency exit eligibility and adjacent-rule coverage", () => {
		expect(isPassengerEmergencyExitEligible(makePassenger({ id: "adult-1" }))).toBe(true);
		expect(
			isPassengerEmergencyExitEligible(makePassenger({ id: "child-1", passengerTypeCode: "child" }))
		).toBe(false);

		expect(isPassengerCoveredUnderAdjacentRule(makePassenger({ id: "adult-2" }))).toBe(false);
		expect(
			isPassengerCoveredUnderAdjacentRule(
				makePassenger({ id: "child-2", passengerTypeCode: "child", mappedAdultId: undefined })
			)
		).toBe(false);
		expect(
			isPassengerCoveredUnderAdjacentRule(
				makePassenger({ id: "child-3", passengerTypeCode: "child", mappedAdultId: "adult-3" })
			)
		).toBe(true);
	});

	it("returns adjacent-seat free passenger ids only for valid adult-child mappings", () => {
		const passengers = [
			makePassenger({ id: "adult-1" }),
			makePassenger({ id: "child-1", passengerTypeCode: "child", mappedAdultId: "adult-1" }),
			makePassenger({ id: "child-2", passengerTypeCode: "child", mappedAdultId: "missing-adult" }),
		];

		expect(getAdjacentFreePassengerIds(passengers)).toEqual(new Set(["adult-1", "child-1"]));
	});

	it("checks required adjacent-seat availability for covered passengers", () => {
		expect(
			hasRequiredAdjacentSeatAvailability({
				passengers: [makePassenger({ id: "adult-1" })],
				cabinType: "STANDARD",
				availableSeatCodes: [],
			})
		).toBe(true);

		expect(
			hasRequiredAdjacentSeatAvailability({
				passengers: [
					makePassenger({ id: "adult-1" }),
					makePassenger({
						id: "child-1",
						passengerTypeCode: "child",
						mappedAdultId: "adult-1",
					}),
				],
				cabinType: "STANDARD",
				availableSeatCodes: ["", "20A", "21C"],
			})
		).toBe(false);

		expect(
			hasRequiredAdjacentSeatAvailability({
				passengers: [
					makePassenger({ id: "adult-2" }),
					makePassenger({
						id: "child-2",
						passengerTypeCode: "child",
						mappedAdultId: "adult-2",
					}),
				],
				cabinType: "ZIP_FULL_FLAT",
				availableSeatCodes: ["10A", "10D"],
			})
		).toBe(true);
	});

	it("evaluates standard cabin adjacency rules", () => {
		expect(isStandardCabinAdjacent("56A", "56C")).toBe(true);
		expect(isStandardCabinAdjacent("20C", "20D")).toBe(false);
		expect(isStandardCabinAdjacent("20D", "20E")).toBe(true);
		expect(isStandardCabinAdjacent("20A", "21B")).toBe(false);
	});

	it("evaluates ZIP Full-Flat adjacency rules", () => {
		expect(isZipFullFlatAdjacent("10A", "10D")).toBe(true);
		expect(isZipFullFlatAdjacent("10A", "10G")).toBe(false);
		expect(isZipFullFlatAdjacent("10D", "11G")).toBe(false);
	});

	it("validates seat selection across emergency-exit and adjacent-seat scenarios", () => {
		const adult = makePassenger({ id: "adult-1" });
		const child = makePassenger({
			id: "child-1",
			passengerTypeCode: "child",
			mappedAdultId: "adult-1",
		});
		const otherAdult = makePassenger({ id: "adult-2" });
		const regularSeat = makeSeat({ code: "20A" });
		const emergencySeat = makeSeat({ code: "46A", serviceCode: EMERGENCY_EXIT_SERVICE_CODE });

		expect(
			validateSeatSelection({
				passenger: child,
				seat: emergencySeat,
				cabinType: "STANDARD",
				passengers: [adult, child],
				passengerSeatMap: new Map(),
			})
		).toEqual({ isValid: false, error: EMERGENCY_EXIT_ERROR });

		expect(
			validateSeatSelection({
				passenger: adult,
				seat: regularSeat,
				cabinType: "STANDARD",
				passengers: [adult],
				passengerSeatMap: new Map(),
			})
		).toEqual({ isValid: true });

		expect(
			validateSeatSelection({
				passenger: child,
				seat: regularSeat,
				cabinType: "STANDARD",
				passengers: [child],
				passengerSeatMap: new Map(),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateSeatSelection({
				passenger: child,
				seat: makeSeat({ code: "20B" }),
				cabinType: "STANDARD",
				passengers: [adult, child, otherAdult],
				passengerSeatMap: new Map([["adult-2", "20A"]]),
			})
		).toEqual({ isValid: true });

		expect(
			validateSeatSelection({
				passenger: child,
				seat: makeSeat({ code: "20E" }),
				cabinType: "STANDARD",
				passengers: [adult, child, otherAdult],
				passengerSeatMap: new Map([["adult-2", "20A"]]),
			})
		).toEqual({ isValid: true });

		expect(
			validateSeatSelection({
				passenger: child,
				seat: makeSeat({ code: "20D" }),
				cabinType: "STANDARD",
				passengers: [adult, child],
				passengerSeatMap: new Map([["adult-1", "20A"]]),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateSeatSelection({
				passenger: child,
				seat: makeSeat({ code: "20B" }),
				cabinType: "STANDARD",
				passengers: [adult, child],
				passengerSeatMap: new Map([["adult-1", "20A"]]),
			})
		).toEqual({ isValid: true });
	});

	it("validates adult seat changes against mapped children and unrelated-child adjacency", () => {
		const adult = makePassenger({ id: "adult-1" });
		const mappedChild = makePassenger({
			id: "child-1",
			passengerTypeCode: "child",
			mappedAdultId: "adult-1",
		});
		const otherAdult = makePassenger({ id: "adult-2" });
		const otherChild = makePassenger({
			id: "child-2",
			passengerTypeCode: "child",
			mappedAdultId: "adult-2",
		});

		expect(
			validateAdultSeatAgainstChildren({
				adultPassenger: adult,
				newAdultSeatCode: "20D",
				cabinType: "STANDARD",
				passengers: [adult, mappedChild],
				passengerSeatMap: new Map([["child-1", "20B"]]),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateAdultSeatAgainstChildren({
				adultPassenger: adult,
				newAdultSeatCode: "20B",
				cabinType: "STANDARD",
				passengers: [adult, mappedChild, otherChild],
				passengerSeatMap: new Map([
					["child-1", "20A"],
					["child-2", "20C"],
				]),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateAdultSeatAgainstChildren({
				adultPassenger: adult,
				newAdultSeatCode: "20B",
				cabinType: "STANDARD",
				passengers: [adult, mappedChild],
				passengerSeatMap: new Map([["child-1", "20A"]]),
			})
		).toEqual({ isValid: true });

		expect(
			validateAdultSeatAgainstChildren({
				adultPassenger: adult,
				newAdultSeatCode: "20B",
				cabinType: "STANDARD",
				passengers: [adult, otherAdult, otherChild],
				passengerSeatMap: new Map([["child-2", "20A"]]),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateAdultSeatAgainstChildren({
				adultPassenger: adult,
				newAdultSeatCode: "20B",
				cabinType: "STANDARD",
				passengers: [adult, otherAdult, otherChild],
				passengerSeatMap: new Map([
					["child-2", "20A"],
					["adult-2", "20C"],
				]),
			})
		).toEqual({
			isValid: false,
			error: {
				type: "NON_ADJACENT_OR_WRONG_ADULT",
			},
		});
	});

	it("validates full adjacent-seat assignments at confirm time", () => {
		const adult = makePassenger({ id: "adult-1" });
		const child = makePassenger({
			id: "child-1",
			passengerTypeCode: "child",
			mappedAdultId: "adult-1",
		});

		expect(
			validateAllAdjacentSeatAssignments({
				cabinType: "STANDARD",
				passengers: [adult],
				passengerSeatMap: new Map(),
			})
		).toEqual({ isValid: true });

		expect(
			validateAllAdjacentSeatAssignments({
				cabinType: "STANDARD",
				passengers: [adult, child],
				passengerSeatMap: new Map([["adult-1", "20A"]]),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateAllAdjacentSeatAssignments({
				cabinType: "STANDARD",
				passengers: [adult, child],
				passengerSeatMap: new Map([
					["adult-1", "20A"],
					["child-1", "20D"],
				]),
			})
		).toEqual({ isValid: false, error: NON_ADJACENT_ERROR });

		expect(
			validateAllAdjacentSeatAssignments({
				cabinType: "STANDARD",
				passengers: [adult, child],
				passengerSeatMap: new Map([
					["adult-1", "20A"],
					["child-1", "20B"],
				]),
			})
		).toEqual({ isValid: true });
	});

	it("classifies reclining warnings and 48-hour restrictions", () => {
		expect(isNonRecliningSeat("36A")).toBe(true);
		expect(isNonRecliningSeat("20A")).toBe(false);
		expect(isLimitedRecliningSeat("57A")).toBe(true);
		expect(isLimitedRecliningSeat("20A")).toBe(false);

		expect(getSeatRecliningWarningType(makeSeat({ code: "20A", serviceCode: "STUN" }))).toBe(
			NON_RECLINING_WARNING
		);
		expect(getSeatRecliningWarningType(makeSeat({ code: "57A", serviceCode: "STUN" }))).toBe(
			LIMITED_RECLINING_WARNING
		);
		expect(getSeatRecliningWarningType(makeSeat({ code: "36A", serviceCode: "STFW" }))).toBe(
			NON_RECLINING_WARNING
		);
		expect(getSeatRecliningWarningType(makeSeat({ code: "57A", serviceCode: "STFW" }))).toBe(
			LIMITED_RECLINING_WARNING
		);
		expect(
			getSeatRecliningWarningType(makeSeat({ code: "20A", serviceCode: "STFW" }))
		).toBeUndefined();

		expect(
			isSeatRestrictedWithin48Hours(
				makeSeat({ code: "20A", serviceCode: EMERGENCY_EXIT_SERVICE_CODE })
			)
		).toBe(true);
		expect(isSeatRestrictedWithin48Hours(makeSeat({ code: "20A", serviceCode: "STFW" }))).toBe(
			false
		);
	});

	it("derives adjacent-seat banner visibility and rule variants", () => {
		const plainAdult = makePassenger({ id: "adult-1" });
		const coveredChild = makePassenger({
			id: "child-1",
			passengerTypeCode: "child",
			mappedAdultId: "adult-1",
		});

		expect(shouldShowAdjacentSeatInfoBanner([plainAdult])).toBe(false);
		expect(shouldShowAdjacentSeatInfoBanner([plainAdult, coveredChild])).toBe(true);

		expect(getAdjacentRuleVariant([plainAdult], false, "STANDARD")).toBeUndefined();
		expect(getAdjacentRuleVariant([plainAdult, coveredChild], true, "ZIP_FULL_FLAT")).toBe(
			"SEVEN_TO_FOURTEEN_ZIP_FULL_FLAT"
		);
		expect(getAdjacentRuleVariant([plainAdult, coveredChild], true, "STANDARD")).toBe(
			"ZERO_TO_FOURTEEN_VANCOUVER"
		);
		expect(getAdjacentRuleVariant([plainAdult, coveredChild], false, "STANDARD")).toBe(
			"ZERO_TO_SIX"
		);
	});
});
