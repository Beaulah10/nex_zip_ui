/**
 * File: extension-code-utils.test.ts
 * Description: Unit tests for extension code helper functions covering locale normalization,
 *  phone option generation,
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getPhoneCountryOptions, usePhoneOptions } from "./extension-code-utils";

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

describe("getPhoneCountryOptions", () => {
	it("returns phone country options", () => {
		const result = getPhoneCountryOptions({
			locale: "en",
		});

		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toHaveProperty("dialCode");
	});

	it("returns phone options without preferred countries", () => {
		const result = getPhoneCountryOptions({
			locale: "en",
			withoutPreferred: true,
		});

		expect(Array.isArray(result)).toBe(true);
	});

	it("includes preferred phone countries", () => {
		const result = getPhoneCountryOptions({
			locale: "en",
			preferredCountries: [{ code: "us" }],
		});

		expect(result.length).toBeGreaterThan(0);
	});
});

it("returns phone country options with preferred country", () => {
	const result = getPhoneCountryOptions({
		locale: "en",
		preferredCountries: [{ code: "jp" }],
	});

	expect(result.length).toBeGreaterThan(0);
	expect(result[0]?.code).toBe("jp");
});

it("returns phone options hook with preferred countries", () => {
	const { result } = renderHook(() =>
		usePhoneOptions({
			preferredCountries: [{ code: "jp" }],
		})
	);

	expect(result.current.length).toBeGreaterThan(0);
});

it("returns phone options without preferred countries", () => {
	const result = getPhoneCountryOptions({
		locale: "en",
		withoutPreferred: true,
	});

	expect(Array.isArray(result)).toBe(true);
});

it("ignores invalid preferred phone country", () => {
	const result = getPhoneCountryOptions({
		locale: "en",
		preferredCountries: [
			{
				code: "xx",
			},
		],
	});

	expect(result.some((c) => c.code === "xx")).toBe(false);
});

it("adds valid preferred phone country", () => {
	const result = getPhoneCountryOptions({
		locale: "en",
		preferredCountries: [
			{
				code: "us",
			},
		],
	});

	expect(result.some((c) => c.code === "us")).toBe(true);
});
