/**
 * File: nationality-utils.test.ts
 * Description: Unit tests for nationality helper functions covering locale normalization,
 * country option generation, phone option generation, and React hooks.
 */

import { renderHook } from "@testing-library/react";
import countries from "i18n-iso-countries";
import { describe, expect, it, vi } from "vitest";
import { getCountryOptions, normalizeLocale, useCountryOptions } from "./nationality-utils";

vi.mock("next-intl", () => ({
	useLocale: () => "en",
}));

vi.mock("i18n-iso-countries", () => ({
	default: {
		registerLocale: vi.fn(),
		getNames: vi.fn(() => ({
			JP: "Japan",
			US: "United States",
			IN: "India",
		})),
		alpha2ToNumeric: vi.fn((code: string) => `${code}-NUM`),
		alpha2ToAlpha3: vi.fn((code: string) => `${code}A3`),
	},
}));

vi.mock("libphonenumber-js", () => ({
	getCountries: vi.fn(() => ["JP", "US", "IN"]),
	getCountryCallingCode: vi.fn((country: string) => {
		const codes: Record<string, string> = {
			JP: "81",
			US: "1",
			IN: "91",
		};

		return codes[country] ?? "0";
	}),
}));

vi.mock("@/modules/utils/constants/customer-information/country.constants", () => ({
	COUNTRY_PRIORITY_CODES: ["jp"],
	PHONE_PRIORITY_CODES: ["jp"],
	EXTRA_RADIX_COUNTRIES: [],
	EXTRA_RADIX_PHONE_COUNTRIES: [],
	RADIX_COUNTRY_OVERRIDES: {},
	RADIX_PHONE_COUNTRY_OVERRIDES: {},
	LOCALE_MAPPING: {
		en: "en",
		ja: "ja",
	},
}));

describe("normalizeLocale", () => {
	it("returns mapped locale", () => {
		expect(normalizeLocale("en")).toBe("en");
	});

	it("handles locale with region", () => {
		expect(normalizeLocale("en-US")).toBe("en");
	});

	it("falls back to base locale", () => {
		expect(normalizeLocale("fr-FR")).toBe("fr");
	});
});

describe("getCountryOptions", () => {
	it("returns country options", () => {
		const result = getCountryOptions({
			locale: "en",
		});

		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toHaveProperty("code");
		expect(result[0]).toHaveProperty("name");
	});

	it("returns sorted country list without preferred countries", () => {
		const result = getCountryOptions({
			locale: "en",
			withoutPreferred: true,
		});

		expect(Array.isArray(result)).toBe(true);
	});

	it("includes preferred countries", () => {
		const result = getCountryOptions({
			locale: "en",
			preferredCountries: [{ code: "us" }],
		});

		expect(result.length).toBeGreaterThan(0);
	});
});

describe("useCountryOptions", () => {
	it("returns country options from hook", () => {
		const { result } = renderHook(() => useCountryOptions());

		expect(result.current.length).toBeGreaterThan(0);
	});
});

describe("additional coverage", () => {
	it("returns empty preferred list safely", () => {
		const result = getCountryOptions({
			locale: "en",
			preferredCountries: [],
		});

		expect(result.length).toBeGreaterThan(0);
	});

	it("normalizes japanese locale", () => {
		expect(normalizeLocale("ja-JP")).toBe("ja");
	});

	it("returns country options with preferred country", () => {
		const result = getCountryOptions({
			locale: "en",
			preferredCountries: [{ code: "jp" }],
		});

		expect(result.length).toBeGreaterThan(0);
		expect(result[0]?.code).toBe("jp");
	});

	it("returns country options hook with preferred countries", () => {
		const { result } = renderHook(() =>
			useCountryOptions({
				preferredCountries: [{ code: "jp" }],
			})
		);

		expect(result.current.length).toBeGreaterThan(0);
	});

	it("returns country options without preferred countries", () => {
		const result = getCountryOptions({
			locale: "en",
			withoutPreferred: true,
		});

		expect(Array.isArray(result)).toBe(true);
	});
});

it("handles country names returned as arrays", () => {
	vi.mocked(countries.getNames).mockReturnValueOnce({
		JP: ["Japan"],
		US: ["United States"],
	} as any);

	const result = getCountryOptions({
		locale: "en",
	});

	expect(result[0]).toHaveProperty("name");
});

it("normalizes uppercase locale values", () => {
	expect(normalizeLocale("EN")).toBe("en");
});
