/**
 * File: passport-information.ts
 * Description: Validation utilities for passport information used within the Customer Information workflow.
 */

import { isExpiredDate } from "@/modules/utils/helpers/common/date-utils/date-utils";

//............... Validate Passport Expiry Date ...............//
export const isPassportExpired = (
	dateObj: { year: string; month: string; day: string },
	referenceDate: Date
): boolean => {
	return isExpiredDate(dateObj, referenceDate);
};
