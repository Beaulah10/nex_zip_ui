/**
 * File: string.utils.ts
 * Description: String utility functions for validating customer information inputs.
 * It includes functions for checking half-width alphanumeric, alphabet, numeric, and email formats used across customer information forms.
 */

//............ Half Width Alpha Numeric Space Check Function ..................//
export const isHalfWidthAlphaNumericSpaceString = (value: string): boolean => {
	return /^[A-Za-z0-9\s]+$/.test(value);
};

//......... Half Width Alphabet Check Function ..................//
export const isHalfWidthAlphabetString = (value: string): boolean => {
	return /^[A-Za-z\s]+$/.test(value);
};

//......... Half Width Numeric Check Function ..................//
export const isHalfWidthAlphaNumericString = (value: string): boolean => {
	return /^[A-Za-z0-9]+$/.test(value);
};

//........... only Numbers Check Function ..................//
export const isOnlyNumbers = (value: string): boolean => {
	return /^\d+$/.test(value);
};

//........... only Alphabets Uppercase check Function ..................//
export const isUppercaseAlphabet = (value: string): boolean => {
	return /^[A-Z\s]+$/.test(value);
};

//.................. convert To Uppercase Function ..................//
export const convertToUppercase = (value: string): string => {
	return value.toUpperCase();
};

//........... valid email check function ..................//
export const isValidEmail = (value: string): boolean => {
	return /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(
		value
	);
};
