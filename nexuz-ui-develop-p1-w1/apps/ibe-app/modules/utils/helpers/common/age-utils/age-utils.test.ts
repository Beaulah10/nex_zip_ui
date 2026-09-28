/**
 * File: age-utils.test.ts
 * Classification: Utility
 * Description: Tests for passenger age eligibility helper functions used in customer information validation.
 */

import { describe, expect, it } from "vitest";
import {
	isNewbornUnderAgeLimit,
	isValidAgeForPassengerType,
} from "@/modules/utils/helpers/common/age-utils/age-utils";

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Creates a departure date for tests. */
function departureDate(year: number, month: number, day: number): Date {
	return new Date(year, month - 1, day);
}

/** Returns DOB that makes the passenger exactly `age` years old on departure. */
function dobAtAge(age: number, refDate: Date): { year: string; month: string; day: string } {
	const dob = new Date(refDate);
	dob.setFullYear(refDate.getFullYear() - age);
	return {
		year: String(dob.getFullYear()),
		month: String(dob.getMonth() + 1).padStart(2, "0"),
		day: String(dob.getDate()).padStart(2, "0"),
	};
}

const DEPARTURE = departureDate(2026, 9, 2);

// ── isValidAgeForPassengerType ────────────────────────────────────────────────

describe("isValidAgeForPassengerType - adult (≥15 years)", () => {
	it("returns true for passenger exactly 15 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(15, DEPARTURE), "adult", DEPARTURE)).toBe(true);
	});

	it("returns true for passenger 30 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(30, DEPARTURE), "adult", DEPARTURE)).toBe(true);
	});

	it("returns false for passenger 14 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(14, DEPARTURE), "adult", DEPARTURE)).toBe(false);
	});

	it("returns false for passenger 0 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(0, DEPARTURE), "adult", DEPARTURE)).toBe(false);
	});
});

describe("isValidAgeForPassengerType - childA (12-14 years)", () => {
	it("returns true for passenger exactly 12 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(12, DEPARTURE), "childA", DEPARTURE)).toBe(true);
	});

	it("returns true for passenger 13 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(13, DEPARTURE), "childA", DEPARTURE)).toBe(true);
	});

	it("returns true for passenger 14 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(14, DEPARTURE), "childA", DEPARTURE)).toBe(true);
	});

	it("returns false for passenger 11 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(11, DEPARTURE), "childA", DEPARTURE)).toBe(false);
	});

	it("returns false for passenger 15 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(15, DEPARTURE), "childA", DEPARTURE)).toBe(false);
	});
});

describe("isValidAgeForPassengerType - childB (7-11 years)", () => {
	it("returns true for passenger exactly 7 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(7, DEPARTURE), "childB", DEPARTURE)).toBe(true);
	});

	it("returns true for passenger 11 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(11, DEPARTURE), "childB", DEPARTURE)).toBe(true);
	});

	it("returns false for passenger 6 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(6, DEPARTURE), "childB", DEPARTURE)).toBe(false);
	});

	it("returns false for passenger 12 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(12, DEPARTURE), "childB", DEPARTURE)).toBe(false);
	});
});

describe("isValidAgeForPassengerType - childC (2-6 years)", () => {
	it("returns true for passenger exactly 2 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(2, DEPARTURE), "childC", DEPARTURE)).toBe(true);
	});

	it("returns true for passenger 6 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(6, DEPARTURE), "childC", DEPARTURE)).toBe(true);
	});

	it("returns false for passenger 1 year old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(1, DEPARTURE), "childC", DEPARTURE)).toBe(false);
	});

	it("returns false for passenger 7 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(7, DEPARTURE), "childC", DEPARTURE)).toBe(false);
	});
});

describe("isValidAgeForPassengerType - infant (<2 years)", () => {
	it("returns true for passenger 1 year old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(1, DEPARTURE), "infant", DEPARTURE)).toBe(true);
	});

	it("returns false for passenger 2 years old", () => {
		expect(isValidAgeForPassengerType(dobAtAge(2, DEPARTURE), "infant", DEPARTURE)).toBe(false);
	});
});

describe("isValidAgeForPassengerType - unknown type", () => {
	it("returns false for unrecognised passenger type", () => {
		expect(isValidAgeForPassengerType(dobAtAge(25, DEPARTURE), "unknown" as any, DEPARTURE)).toBe(
			false
		);
	});
});

describe("isValidAgeForPassengerType - uses current date when no departure provided", () => {
	it("returns true when no departure date given for valid adult DOB", () => {
		const now = new Date();
		const dob = dobAtAge(20, now);
		expect(isValidAgeForPassengerType(dob, "adult")).toBe(true);
	});
});

describe("isValidAgeForPassengerType - age boundary month/day comparison", () => {
	it("returns false for adult who turns 15 one day after departure", () => {
		// One day before their birthday — still 14
		const dep = departureDate(2026, 9, 2);
		// DOB: Sep 3, 2011 → 14 years old on Sep 2, 2026
		const dob = { year: "2011", month: "09", day: "03" };
		expect(isValidAgeForPassengerType(dob, "adult", dep)).toBe(false);
	});

	it("returns true for adult who turned 15 exactly on departure day", () => {
		const dep = departureDate(2026, 9, 2);
		// DOB: Sep 2, 2011 → turns 15 on departure
		const dob = { year: "2011", month: "09", day: "02" };
		expect(isValidAgeForPassengerType(dob, "adult", dep)).toBe(true);
	});
});

// ── isNewbornUnderAgeLimit ────────────────────────────────────────────────────

describe("isNewbornUnderAgeLimit", () => {
	it("returns true when infant is under 1 year (newborn)", () => {
		const dob = dobAtAge(0, DEPARTURE);
		expect(isNewbornUnderAgeLimit(dob, DEPARTURE)).toBe(true);
	});

	it("returns false when infant is exactly 1 year old", () => {
		const dob = dobAtAge(1, DEPARTURE);
		expect(isNewbornUnderAgeLimit(dob, DEPARTURE)).toBe(false);
	});

	it("uses current date when no departure date provided", () => {
		const now = new Date();
		const dob = dobAtAge(0, now);
		expect(isNewbornUnderAgeLimit(dob)).toBe(true);
	});

	it("returns false for a 1-year-old when using current date", () => {
		const now = new Date();
		const dob = dobAtAge(1, now);
		expect(isNewbornUnderAgeLimit(dob)).toBe(false);
	});
});

// ── Line 49 coverage: isNewbornUnderAgeLimit monthDiff < 0 branch ─────────────
// Line 49 is the `if (monthDiff < 0 || ...)` condition inside isNewbornUnderAgeLimit.
// Existing tests use dobAtAge() which produces DOBs where monthDiff === 0 (same month),
// so the decrement path is never taken. The tests below trigger monthDiff < 0.
describe("isNewbornUnderAgeLimit - birthday has not occurred yet (monthDiff branch)", () => {
	it("returns true when infant birthday falls in a later month than the departure month", () => {
		// DOB: October 15, 2025  → month index 9
		// checkDate: September 2, 2026 → month index 8
		// Δyear = 1, monthDiff = 8 - 9 = -1 (< 0) → age-- → 0
		// 0 < 1 → true
		const dob = { year: "2025", month: "10", day: "15" };
		const checkDate = new Date(2026, 8, 2); // September 2, 2026
		expect(isNewbornUnderAgeLimit(dob, checkDate)).toBe(true);
	});

	it("returns true when infant birthday is later in the same departure month", () => {
		// DOB: September 15, 2025
		// checkDate: September 2, 2026
		// monthDiff = 0, checkDate.getDate() = 2 < dobDate.getDate() = 15 → age--
		// age = 0 → 0 < 1 → true
		const dob = { year: "2025", month: "09", day: "15" };
		const checkDate = new Date(2026, 8, 2); // September 2, 2026
		expect(isNewbornUnderAgeLimit(dob, checkDate)).toBe(true);
	});

	it("returns false for a 2-year-old even when birthday has not occurred yet this year", () => {
		// DOB: October 1, 2024 → month index 9
		// checkDate: September 2, 2026 → month index 8
		// Δyear = 2, monthDiff = -1 → age-- → 1
		// 1 < 1 → false (not a newborn)
		const dob = { year: "2024", month: "10", day: "01" };
		const checkDate = new Date(2026, 8, 2); // September 2, 2026
		expect(isNewbornUnderAgeLimit(dob, checkDate)).toBe(false);
	});
});
