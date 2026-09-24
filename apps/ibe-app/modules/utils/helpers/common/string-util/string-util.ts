// export const UPPERCASE_ALPHA_REGEX = /^[A-Z]+$/;
export const convertToUppercase = (value: string) => value.toUpperCase();
export const isUppercaseAlphabet = (value: string): boolean => {
	return /^[A-Z\s]+$/.test(value);
};
