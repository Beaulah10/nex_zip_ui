/**
 * File: date.helper.ts
 * Description: Date utility functions used across customer information and travel-related validations.
 * It provides helpers for validating date conditions such as expiry date eligibility.
 */
//............... Get Time Difference ...............//
export type TimeDiff = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	totalMs: number;
};

/**
 * Returns time difference strictly aligned to departure timezone
 * @param departureISO - ISO datetime string WITH timezone
 */
export function getTimeDiffFromDepartureTZ(departureISO: string): TimeDiff {
	if (!departureISO) {
		throw new Error("Invalid departure datetime");
	}

	const departureTime: number = new Date(departureISO).getTime();

	if (Number.isNaN(departureTime)) {
		throw new Error("Invalid ISO date format");
	}

	// Current time (UTC internally)
	const nowTime: number = Date.now();

	const diffMs: number = departureTime - nowTime;

	if (diffMs <= 0) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			totalMs: diffMs,
		};
	}

	const seconds: number = Math.floor(diffMs / 1000);
	const minutes: number = Math.floor(diffMs / (1000 * 60));
	const hours: number = Math.floor(diffMs / (1000 * 60 * 60));
	const days: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	return {
		days,
		hours,
		minutes,
		seconds,
		totalMs: diffMs,
	};
}

//.................. Expired Date Check Function ..................//
export const isExpiredDate = (
	dateObj: { year: string; month: string; day: string },
	referenceDate: Date
): boolean => {
	const expiryDate = new Date(`${dateObj.year}-${dateObj.month}-${dateObj.day}`);
	return expiryDate > referenceDate;
};
