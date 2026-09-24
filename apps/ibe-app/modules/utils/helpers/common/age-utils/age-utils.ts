/**
 * File: age-utils.ts
 * Description: Helper functions for validating passenger age eligibility based on passenger type and travel requirements.
 * It provides age-related validation utilities for adult, child, and infant passengers, including infant age limit checks using the flight departure date.
 */

//............. valid Age check for passenger Type ..................//
import type { PassengerType } from "@/modules/utils/validations/customer-information/customer-information-schema";

export const isValidAgeForPassengerType = (
	dob: { year: string; month: string; day: string },
	passengerType: PassengerType,
	departureDate?: Date
): boolean => {
	const dobDate = new Date(`${dob.year}-${dob.month}-${dob.day}`);
	const checkDate = departureDate || new Date();
	let age = checkDate.getFullYear() - dobDate.getFullYear();
	const monthDiff = checkDate.getMonth() - dobDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && checkDate.getDate() < dobDate.getDate())) {
		age--;
	}
	switch (passengerType) {
		case "adult":
			return age >= 15;
		case "childA":
			return age >= 12 && age < 15;
		case "childB":
			return age >= 7 && age < 12;
		case "childC":
			return age >= 2 && age < 7;
		case "infant":
			return age < 2;
		default:
			return false;
	}
};

//............. valid Age Limit for Infant Type ..................//
// minimum age limit for infant is 1 year old, This function checks if the infant is under 1 year old.
export const isNewbornUnderAgeLimit = (
	dob: { year: string; month: string; day: string },
	departureDate?: Date
): boolean => {
	const dobDate = new Date(`${dob.year}-${dob.month}-${dob.day}`);
	const checkDate = departureDate || new Date();
	let age = checkDate.getFullYear() - dobDate.getFullYear();
	const monthDiff = checkDate.getMonth() - dobDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && checkDate.getDate() < dobDate.getDate())) {
		age--;
	}
	return age < 1;
};

// const isNewbornUnder8Days = (
// 	dob: { year: string; month: string; day: string },
// 	departureDate?: Date
// ): boolean => {
// 	const dobDate = new Date(`${dob.year}-${dob.month}-${dob.day}`);
// 	const checkDate = departureDate || new Date();
// 	const diffTime = Math.abs(checkDate.getTime() - dobDate.getTime());
// 	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// 	return diffDays < 8;
// };
