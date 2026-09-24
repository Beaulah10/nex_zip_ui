/**
 * File: mrz-utils.test.ts
 * Description: Vitest test cases for MRZ utility functions used in passport scanning workflow.
 */

import { describe, expect, it } from "vitest";
import {
	extractMrzLines,
	extractPassportNumberFallback,
	parseMrzDate,
	parseMrzLine2,
	parsePassportMrz,
	validateMrzLines,
} from "./mrz-utils";

describe("mrz-utils", () => {
	describe("extractMrzLines", () => {
		it("should extract valid MRZ lines from raw OCR text", () => {
			const rawText = `
                Random OCR text
                P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
                L898902C36UTO7408122F1204159ZE184226B<<<<<10
            `;

			const result = extractMrzLines(rawText);

			expect(result).toEqual([
				"P<UT0ERIKSS0N<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
				"L898902C36UT07408122F1204159ZE184226B<<<<<10",
			]);
		});

		it("should return null when less than two MRZ candidate lines are found", () => {
			const result = extractMrzLines("SHORT\nP<UTOERIKSSON");

			expect(result).toBeNull();
		});

		it("should return null when MRZ pair is not found", () => {
			const rawText = `
                ABCDEF123456789
                XYZ987654321000
            `;

			const result = extractMrzLines(rawText);

			expect(result).toBeNull();
		});

		it("should normalize OCR text by removing invalid characters and replacing O with 0", () => {
			const rawText = `
                P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<@@@
                AO12345678UTO9001011M3001012<<<<<<<
            `;

			const result = extractMrzLines(rawText);

			expect(result?.[0]).toContain("0");
			expect(result?.[0]).not.toContain("@");
			expect(result?.[1]).toContain("A012345678UT09001011M3001012");
		});
	});

	describe("parseMrzDate", () => {
		it("should parse future MRZ expiry date in 2000s", () => {
			const result = parseMrzDate("300101", true);

			expect(result).toEqual({
				year: "2030",
				month: "01",
				day: "01",
			});
		});

		it("should parse DOB using 1900s century heuristic", () => {
			const result = parseMrzDate("900101");

			expect(result).toEqual({
				year: "1990",
				month: "01",
				day: "01",
			});
		});

		it("should parse DOB using 2000s century heuristic", () => {
			const result = parseMrzDate("250101");

			expect(result).toEqual({
				year: "2025",
				month: "01",
				day: "01",
			});
		});

		it("should replace letter O with zero before parsing date", () => {
			const result = parseMrzDate("3O0101", true);

			expect(result).toEqual({
				year: "2030",
				month: "01",
				day: "01",
			});
		});

		it("should return null for invalid date format", () => {
			expect(parseMrzDate("ABC123")).toBeNull();
			expect(parseMrzDate("12345")).toBeNull();
		});

		it("should return null for invalid month", () => {
			expect(parseMrzDate("251301")).toBeNull();
			expect(parseMrzDate("250001")).toBeNull();
		});

		it("should return null for invalid day", () => {
			expect(parseMrzDate("250132")).toBeNull();
			expect(parseMrzDate("250100")).toBeNull();
		});
	});

	describe("validateMrzLines", () => {
		it("should return true for valid MRZ lines", () => {
			const lines: [string, string] = [
				"P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
				"L898902C36UTO7408122F1204159ZE184226B<<<<<10",
			];

			expect(validateMrzLines(lines)).toBe(true);
		});

		it("should return false when first line does not start with P", () => {
			const lines: [string, string] = [
				"X<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
				"L898902C36UTO7408122F1204159ZE184226B<<<<<10",
			];

			expect(validateMrzLines(lines)).toBe(false);
		});

		it("should return false when first line does not contain name separator", () => {
			const lines: [string, string] = [
				"P<UTOERIKSSON<ANNA<MARIA",
				"L898902C36UTO7408122F1204159ZE184226B<<<<<10",
			];

			expect(validateMrzLines(lines)).toBe(false);
		});

		it("should return false when second line length is less than 30", () => {
			const lines: [string, string] = [
				"P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
				"L898902C36UTO7408122",
			];

			expect(validateMrzLines(lines)).toBe(false);
		});

		it("should return false when second line does not start with letter or number", () => {
			const lines: [string, string] = [
				"P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
				"<898902C36UTO7408122F1204159ZE184226B<<<<<10",
			];

			expect(validateMrzLines(lines)).toBe(false);
		});
	});

	describe("parsePassportMrz", () => {
		it("should parse valid passport MRZ lines", () => {
			const lines: [string, string] = [
				"P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
				"L898902C36UTO7408122F1204159ZE184226B<<<<<10",
			];

			const result = parsePassportMrz(lines);

			expect(result).toEqual({
				passportNumber: "L898902C3",
				expiryYear: "2012",
				expiryMonth: "04",
				expiryDay: "15",
				dobYear: "1974",
				dobMonth: "08",
				dobDay: "12",
			});
		});

		it("should return null for invalid MRZ lines", () => {
			const lines: [string, string] = [
				"INVALID LINE",
				"L898902C36UTO7408122F1204159ZE184226B<<<<<10",
			];

			expect(parsePassportMrz(lines)).toBeNull();
		});
	});

	describe("parseMrzLine2", () => {
		it("should parse valid MRZ line 2", () => {
			const result = parseMrzLine2("L898902C36UTO7408122F1204159ZE184226B<<<<<10");

			expect(result).toEqual({
				passportNumber: "L898902C3",
				expiryYear: "2012",
				expiryMonth: "04",
				expiryDay: "15",
				dobYear: "1974",
				dobMonth: "08",
				dobDay: "12",
			});
		});

		it("should remove trailing filler characters from passport number", () => {
			const result = parseMrzLine2("A123456<<6UTO9001011M3001012ZE184226B<<<<<10");

			expect(result?.passportNumber).toBe("A123456");
		});

		it("should return null when line 2 length is less than 30", () => {
			expect(parseMrzLine2("L898902C36UTO7408122")).toBeNull();
		});

		it("should return null when passport number contains invalid characters", () => {
			const result = parseMrzLine2("ABC-123456UTO7408122F1204159ZE184226B<<<<<10");

			expect(result).toBeNull();
		});

		it("should return null when expiry date is invalid", () => {
			const result = parseMrzLine2("L898902C36UTO7408122F9913999ZE184226B<<<<<10");

			expect(result).toBeNull();
		});

		it("should return result with undefined DOB fields when DOB is invalid", () => {
			const result = parseMrzLine2("L898902C36UTO9913992F3001019ZE184226B<<<<<10");

			expect(result).toEqual({
				passportNumber: "L898902C3",
				expiryYear: "2030",
				expiryMonth: "01",
				expiryDay: "01",
				dobYear: undefined,
				dobMonth: undefined,
				dobDay: undefined,
			});
		});
	});

	describe("extractPassportNumberFallback", () => {
		it("should extract passport number from raw OCR text", () => {
			const result = extractPassportNumberFallback("Passport No: A12345678 Expiry Date: 2030");

			expect(result).toBe("A12345678");
		});

		it("should extract passport number with seven digits", () => {
			const result = extractPassportNumberFallback("Detected value is B1234567");

			expect(result).toBe("B1234567");
		});

		it("should return null when passport number is not found", () => {
			const result = extractPassportNumberFallback("No valid passport number");

			expect(result).toBeNull();
		});
	});
});
