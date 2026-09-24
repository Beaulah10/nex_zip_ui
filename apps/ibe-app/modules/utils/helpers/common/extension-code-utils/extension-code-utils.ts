/**
 * File: extension-code-utils.ts
 * Description: Helper functions for handling extension codes used across customer information forms.
 */

import { type CountryCode, getCountries, getCountryCallingCode } from "libphonenumber-js";
import { useLocale } from "next-intl";
import {
	COUNTRY_PRIORITY_CODES,
	EXTRA_RADIX_PHONE_COUNTRIES,
	RADIX_PHONE_COUNTRY_OVERRIDES,
} from "@/modules/utils/constants/customer-information/country.constants";
import {
	type BaseCountry,
	getCountryNameMap,
	getUniqueCountries,
	mergePreferred,
	resolveName,
	sortByLocale,
} from "@/modules/utils/helpers/common/nationality-utils/nationality-utils";

/**
 * Phone country option for phone/emergency contact dropdowns
 */
export type PhoneCountryOption = BaseCountry & {
	dialCode: string;
};

/**
 * -------------------------------------------------------
 * PHONE COUNTRY LIST (Dial + Name + Code)
 * -------------------------------------------------------
 */
export function getPhoneCountryOptions({
	locale,
	preferredCountries = [],
	withoutPreferred = false,
}: {
	locale: string;
	preferredCountries?: { code: string }[];
	withoutPreferred?: boolean;
}): PhoneCountryOption[] {
	const countryNames = getCountryNameMap(locale);

	const phoneCountries = getCountries().map((countryCode) => {
		const lowerCode = countryCode.toLowerCase();
		const radixOverride = RADIX_PHONE_COUNTRY_OVERRIDES[lowerCode];

		return {
			code: lowerCode,
			name: radixOverride?.name ?? resolveName(countryNames[countryCode], countryCode),
			dialCode: radixOverride?.dialCode ?? `+${getCountryCallingCode(countryCode)}`,
		};
	});

	const all: PhoneCountryOption[] = [...phoneCountries, ...EXTRA_RADIX_PHONE_COUNTRIES];

	const uniqueCountries = getUniqueCountries(all);
	const sorted = sortByLocale(uniqueCountries, locale);

	if (withoutPreferred) {
		return sorted;
	}

	const priorityCodes = new Set([
		...COUNTRY_PRIORITY_CODES,
		...preferredCountries.map((country) => country.code.toLowerCase()),
	]);

	const preferred: PhoneCountryOption[] = Array.from(priorityCodes).reduce<PhoneCountryOption[]>(
		(result, countryCode) => {
			const extraCountry = EXTRA_RADIX_PHONE_COUNTRIES.find(
				(country) => country.code === countryCode
			);

			if (extraCountry) {
				result.push(extraCountry);
				return result;
			}

			const code = countryCode.toUpperCase() as CountryCode;

			if (!getCountries().includes(code)) return result;

			const radixOverride = RADIX_PHONE_COUNTRY_OVERRIDES[countryCode];

			result.push({
				code: countryCode,
				name: radixOverride?.name ?? resolveName(countryNames[code], countryCode),
				dialCode: radixOverride?.dialCode ?? `+${getCountryCallingCode(code)}`,
			});

			return result;
		},
		[]
	);

	return mergePreferred(preferred, sorted);
}

/**
 * -------------------------------------------------------
 * HOOKS (next-intl)
 * -------------------------------------------------------
 */

export function usePhoneOptions(options?: {
	preferredCountries?: { code: string }[];
	withoutPreferred?: boolean;
}): PhoneCountryOption[] {
	const locale = useLocale();

	return getPhoneCountryOptions({
		locale,
		...options,
	});
}
