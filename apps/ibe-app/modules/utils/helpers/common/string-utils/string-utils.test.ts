/**
 * File: string.utils.test.ts
 * Classification: Utility
 * Description: Tests for string validation helper functions used in customer information forms.
 */

import { describe, expect, it } from "vitest";
import {
	isHalfWidthAlphabetString,
	isHalfWidthAlphaNumericSpaceString,
	isHalfWidthAlphaNumericString,
	isOnlyNumbers,
	isUppercaseAlphabet,
	isValidEmail,
} from "@/modules/utils/helpers/common/string-utils/string-utils";

// ── isHalfWidthAlphaNumericSpaceString ────────────────────────────────────────

describe("isHalfWidthAlphaNumericSpaceString", () => {
	it("returns true for alphanumeric string", () => {
		expect(isHalfWidthAlphaNumericSpaceString("ABC123")).toBe(true);
	});

	it("returns true for string with spaces", () => {
		expect(isHalfWidthAlphaNumericSpaceString("ZIPAIR HOTEL 1")).toBe(true);
	});

	it("returns true for lowercase alphanumeric string", () => {
		expect(isHalfWidthAlphaNumericSpaceString("abc123")).toBe(true);
	});

	it("returns false for string with special characters", () => {
		expect(isHalfWidthAlphaNumericSpaceString("ABC-123")).toBe(false);
	});

	it("returns false for string with symbols", () => {
		expect(isHalfWidthAlphaNumericSpaceString("hello@world")).toBe(false);
	});

	it("returns false for Japanese characters", () => {
		expect(isHalfWidthAlphaNumericSpaceString("テスト")).toBe(false);
	});

	it("handles leading/trailing spaces via trim", () => {
		expect(isHalfWidthAlphaNumericSpaceString("  ABC  ")).toBe(true);
	});
});

// ── isHalfWidthAlphabetString ─────────────────────────────────────────────────

describe("isHalfWidthAlphabetString", () => {
	it("returns true for uppercase alphabet", () => {
		expect(isHalfWidthAlphabetString("JOHN")).toBe(true);
	});

	it("returns true for lowercase alphabet", () => {
		expect(isHalfWidthAlphabetString("john")).toBe(true);
	});

	it("returns true for alphabet with spaces", () => {
		expect(isHalfWidthAlphabetString("JOHN SMITH")).toBe(true);
	});

	it("returns false for string with numbers", () => {
		expect(isHalfWidthAlphabetString("JOHN1")).toBe(false);
	});

	it("returns false for string with special characters", () => {
		expect(isHalfWidthAlphabetString("JOHN-SMITH")).toBe(false);
	});

	it("returns false for Japanese characters", () => {
		expect(isHalfWidthAlphabetString("タナカ")).toBe(false);
	});
});

// ── isHalfWidthAlphaNumericString ─────────────────────────────────────────────

describe("isHalfWidthAlphaNumericString", () => {
	it("returns true for alphanumeric uppercase", () => {
		expect(isHalfWidthAlphaNumericString("AB123")).toBe(true);
	});

	it("returns true for alphanumeric lowercase", () => {
		expect(isHalfWidthAlphaNumericString("ab123")).toBe(true);
	});

	it("returns false for string with spaces", () => {
		expect(isHalfWidthAlphaNumericString("AB 123")).toBe(false);
	});

	it("returns false for string with special characters", () => {
		expect(isHalfWidthAlphaNumericString("AB-123")).toBe(false);
	});

	it("returns false for Japanese characters", () => {
		expect(isHalfWidthAlphaNumericString("AB123テスト")).toBe(false);
	});

	it("returns true for numbers only", () => {
		expect(isHalfWidthAlphaNumericString("123456")).toBe(true);
	});

	it("returns true for letters only", () => {
		expect(isHalfWidthAlphaNumericString("ABCDEF")).toBe(true);
	});
});

// ── isOnlyNumbers ─────────────────────────────────────────────────────────────

describe("isOnlyNumbers", () => {
	it("returns true for digit-only string", () => {
		expect(isOnlyNumbers("1234567890")).toBe(true);
	});

	it("returns false for string with letters", () => {
		expect(isOnlyNumbers("123abc")).toBe(false);
	});

	it("returns false for string with special characters", () => {
		expect(isOnlyNumbers("123-456")).toBe(false);
	});

	it("returns false for string with spaces", () => {
		expect(isOnlyNumbers("123 456")).toBe(false);
	});

	it("returns false for decimal numbers", () => {
		expect(isOnlyNumbers("1.5")).toBe(false);
	});

	it("returns false for negative numbers", () => {
		expect(isOnlyNumbers("-5")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isOnlyNumbers("")).toBe(false);
	});
});

// ── isUppercaseAlphabet ───────────────────────────────────────────────────────

describe("isUppercaseAlphabet", () => {
	it("returns true for uppercase letters only", () => {
		expect(isUppercaseAlphabet("SMITH")).toBe(true);
	});

	it("returns true for uppercase with spaces", () => {
		expect(isUppercaseAlphabet("JOHN SMITH")).toBe(true);
	});

	it("returns false for lowercase letters", () => {
		expect(isUppercaseAlphabet("smith")).toBe(false);
	});

	it("returns false for mixed case", () => {
		expect(isUppercaseAlphabet("Smith")).toBe(false);
	});

	it("returns false for numbers", () => {
		expect(isUppercaseAlphabet("JOHN1")).toBe(false);
	});

	it("handles leading/trailing spaces via trim", () => {
		expect(isUppercaseAlphabet("  JOHN  ")).toBe(true);
	});
});

// ── isValidEmail ──────────────────────────────────────────────────────────────

describe("isValidEmail", () => {
	it("returns true for valid email", () => {
		expect(isValidEmail("user@example.com")).toBe(true);
	});

	it("returns true for email with subdomain", () => {
		expect(isValidEmail("user@mail.example.com")).toBe(true);
	});

	it("returns true for email with dots in local part", () => {
		expect(isValidEmail("user.name@example.com")).toBe(true);
	});

	it("returns true for email with uppercase", () => {
		expect(isValidEmail("USER@EXAMPLE.COM")).toBe(true);
	});

	it("returns false for email without @", () => {
		expect(isValidEmail("userexample.com")).toBe(false);
	});

	it("returns false for email without domain", () => {
		expect(isValidEmail("user@")).toBe(false);
	});

	it("returns false for email with special characters not in pattern", () => {
		expect(isValidEmail("user+tag@example.com")).toBe(true);
	});

	it("returns false for email with multiple @ signs", () => {
		expect(isValidEmail("user@@example.com")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isValidEmail("")).toBe(false);
	});

	it("returns false for email without TLD", () => {
		expect(isValidEmail("user@example")).toBe(false);
	});

	it("returns false for plain string", () => {
		expect(isValidEmail("notanemail")).toBe(false);
	});
});
