/**
 * File: nationality-utils.ts
 * Description: Helper functions for generating localized country and phone country options used across customer information forms.
 * It provides country and phone code mappings, supports priority ordering, and applies locale-based sorting for country selection lists.
 */

import countries from "i18n-iso-countries";
import { useLocale } from "next-intl";
import {
	COUNTRY_PRIORITY_CODES,
	EXTRA_RADIX_COUNTRIES,
	LOCALE_MAPPING,
	RADIX_COUNTRY_OVERRIDES,
} from "@/modules/utils/constants/customer-information/country.constants";

// Track registered locales
const registeredLocales = new Set<string>();

function ensureLocaleRegistered(locale: string): void {
	if (registeredLocales.has(locale)) return;

	try {
		const localeData = require(`i18n-iso-countries/langs/${locale}.json`);
		countries.registerLocale(localeData);
		registeredLocales.add(locale);
	} catch {
		if (!registeredLocales.has("en")) {
			const enData = require("i18n-iso-countries/langs/en.json");
			countries.registerLocale(enData);
			registeredLocales.add("en");
		}
	}
}

/**
 * Map app locale → ISO locale
 */
export function normalizeLocale(appLocale: string): string {
	const normalizedLocale = appLocale.toLowerCase();
	const [baseLocale = "en"] = normalizedLocale.split("-");

	return LOCALE_MAPPING[normalizedLocale] ?? LOCALE_MAPPING[baseLocale] ?? baseLocale;
}

/**
 * Common base country structure
 */
export type BaseCountry = {
	code: string;
	name: string;
};

/**
 * Country option for nationality/country dropdowns
 */
export type CountryOption = BaseCountry & {
	iso?: string;
	alpha3?: string;
};

/**
 * Internal: Get localized country names
 */
export function getCountryNameMap(locale: string): Record<string, string | string[]> {
	const isoLocale = normalizeLocale(locale);

	ensureLocaleRegistered(isoLocale);

	const localizedNames = countries.getNames(isoLocale, { select: "official" });

	if (Object.keys(localizedNames).length > 0) {
		return localizedNames;
	}

	ensureLocaleRegistered("en");

	return countries.getNames("en", { select: "official" });
}

/**
 * Internal: Normalize country name value
 */
export function resolveName(value: unknown, fallback: string): string {
	if (Array.isArray(value)) return value[0] ?? fallback;
	return (value as string) ?? fallback;
}

/**
 * Internal: Sort list based on locale
 * - ja → Japanese aiueo order
 * - others → alphabetical order
 */
export function sortByLocale<T extends { name: string }>(items: T[], locale: string): T[] {
	const isoLocale = normalizeLocale(locale);

	const collator = new Intl.Collator(isoLocale === "ja" ? "ja" : isoLocale || "en", {
		sensitivity: "base",
		numeric: true,
	});

	return [...items].sort((a, b) => collator.compare(a.name, b.name));
}

/**
 * -------------------------------------------------------
 * COUNTRY LIST (Name + ISO + Code)
 * -------------------------------------------------------
 */
export function getCountryOptions({
	locale,
	preferredCountries = [],
	withoutPreferred = false,
}: {
	locale: string;
	preferredCountries?: { code: string }[];
	withoutPreferred?: boolean;
}): CountryOption[] {
	const countryNames = getCountryNameMap(locale);

	const all: CountryOption[] = Object.keys(countryNames).map((code) => {
		const lowerCode = code.toLowerCase();
		const radixOverride = RADIX_COUNTRY_OVERRIDES[lowerCode];

		return {
			code: lowerCode,
			name: radixOverride?.name ?? resolveName(countryNames[code], code),
			iso: countries.alpha2ToNumeric(code),
			alpha3: radixOverride?.alpha3 ?? countries.alpha2ToAlpha3(code),
		};
	});

	all.push(...EXTRA_RADIX_COUNTRIES);

	const uniqueCountries = getUniqueCountries(all);
	const sorted = sortByLocale(uniqueCountries, locale);

	if (withoutPreferred) {
		return sorted;
	}

	const priorityCodes = new Set([
		...COUNTRY_PRIORITY_CODES,
		...preferredCountries.map((country) => country.code.toLowerCase()),
	]);

	const preferred: CountryOption[] = Array.from(priorityCodes).reduce<CountryOption[]>(
		(result, countryCode) => {
			const extraCountry = EXTRA_RADIX_COUNTRIES.find((country) => country.code === countryCode);

			if (extraCountry) {
				result.push(extraCountry);
				return result;
			}

			const code = countryCode.toUpperCase();
			const countryName = countryNames[code];

			if (!countryName) return result;

			const radixOverride = RADIX_COUNTRY_OVERRIDES[countryCode];

			result.push({
				code: countryCode,
				name: radixOverride?.name ?? resolveName(countryName, countryCode),
				iso: countries.alpha2ToNumeric(code),
				alpha3: radixOverride?.alpha3 ?? countries.alpha2ToAlpha3(code),
			});

			return result;
		},
		[]
	);

	return mergePreferred(preferred, sorted);
}

export function getUniqueCountries<T extends { code: string }>(countriesList: T[]): T[] {
	return Array.from(new Map(countriesList.map((country) => [country.code, country])).values());
}

export function mergePreferred<T extends { code: string }>(preferred: T[], all: T[]): T[] {
	const preferredCodes = new Set(preferred.map((country) => country.code));
	const remaining = all.filter((country) => !preferredCodes.has(country.code));

	return [...preferred, ...remaining];
}

/**
 * -------------------------------------------------------
 * HOOKS (next-intl)
 * -------------------------------------------------------
 */

export function useCountryOptions(options?: {
	preferredCountries?: { code: string }[];
	withoutPreferred?: boolean;
}): CountryOption[] {
	const locale = useLocale();

	return getCountryOptions({
		locale,
		...options,
	});
}
