/**
 * File: mrz-utils.ts
 * Description: Utilities for processing passport MRZ (Machine Readable Zone) data extracted from OCR results.
 * It provides functions for MRZ line detection, MRZ parsing, passport information extraction, date conversion, validation, and fallback passport number extraction used in the passport scanning workflow.
 */

/**
 * MRZ (Machine Readable Zone) utilities for TD3 passports.
 *
 * Processes OCR output (e.g. Tesseract.js) and extracts structured passport
 * data from the Machine Readable Zone.
 *
 * TD3 Passport MRZ Format — Line 2 (44 chars):
 *   [0–8]   Passport number
 *   [9]     Check digit
 *   [10–12] Nationality
 *   [13–18] DOB (YYMMDD)
 *   [19]    Check digit
 *   [20]    Sex
 *   [21–26] Expiry (YYMMDD)
 *   [27]    Check digit
 *
 * Extracted fields: Passport Number · Date of Birth · Expiry Date
 */

export interface MrzParseResult {
	passportNumber: string;
	expiryYear: string;
	expiryMonth: string;
	expiryDay: string;
	dobYear?: string;
	dobMonth?: string;
	dobDay?: string;
}

/** Strips any character that is not a valid MRZ character (A–Z, 0–9, <). */
const INVALID_MRZ_CHARS = /[^A-Z0-9<]/g;

function normalizeLine(line: string): string {
	return line.toUpperCase().replace(INVALID_MRZ_CHARS, "").replace(/O/g, "0");
}

// ─── extractMrzLines ─────────────────────────────────────────────────────────

/**
 * Extract the two MRZ lines from raw OCR text.
 *
 * Normalises each OCR line, filters to candidates ≥ 15 chars, then looks for a
 * pair where the first contains "<<" (TD3 name separator) and the second is
 * long enough to hold line-2 fields.
 *
 * Returns null when no valid pair is found.
 */
export function extractMrzLines(rawText: string): [string, string] | null {
	const candidates = rawText
		.split("\n")
		.map(normalizeLine)
		.filter((line) => line.length >= 15);

	if (candidates.length < 2) return null;

	for (let i = 0; i < candidates.length - 1; i++) {
		const l1 = candidates[i];
		const l2 = candidates[i + 1];
		if (!l1 || !l2) continue;
		if (l1.includes("<<") && l2.length > 25) {
			return [l1.slice(0, 44).padEnd(44, "<"), l2.slice(0, 44).padEnd(44, "<")];
		}
	}

	return null;
}

// ─── parseMrzDate ─────────────────────────────────────────────────────────────

/**
 * Parse a YYMMDD string into { year, month, day }.
 * isFuture=true forces 2000s (for expiry); false uses ICAO century heuristic (for DOB).
 */
export function parseMrzDate(
	value: string,
	isFuture = false
): { year: string; month: string; day: string } | null {
	const v = value.replace(/O/g, "0");
	if (!/^\d{6}$/.test(v)) return null;

	const yy = parseInt(v.slice(0, 2), 10);
	const mm = parseInt(v.slice(2, 4), 10);
	const dd = parseInt(v.slice(4, 6), 10);

	if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;

	const currentYY = new Date().getFullYear() % 100;
	const fullYear = isFuture ? 2000 + yy : yy >= currentYY + 1 ? 1900 + yy : 2000 + yy;

	return {
		year: String(fullYear),
		month: String(mm).padStart(2, "0"),
		day: String(dd).padStart(2, "0"),
	};
}

// ─── validateMrzLines ────────────────────────────────────────────────────────

/**
 * Validate that two MRZ lines have the expected TD3 structure.
 * Line 1 must start with "P" and contain "<<"; line 2 must be ≥ 30 chars.
 */
export function validateMrzLines(lines: [string, string]): boolean {
	const [l1, l2] = lines;
	return l1.startsWith("P") && l1.includes("<<") && l2.length >= 30 && /^[A-Z0-9]/.test(l2);
}

// ─── parsePassportMrz ────────────────────────────────────────────────────────

/**
 * Parse both MRZ lines and return structured passport data.
 * Validates structure then delegates to parseMrzLine2.
 */
export function parsePassportMrz(lines: [string, string]): MrzParseResult | null {
	if (!validateMrzLines(lines)) return null;
	return parseMrzLine2(lines[1]);
}

// ─── parseMrzLine2 ───────────────────────────────────────────────────────────

/**
 * Parse TD3 MRZ line 2 and return structured passport data.
 * Extracts passport number (0–8), DOB (13–18), expiry (21–26).
 */
export function parseMrzLine2(line2: string): MrzParseResult | null {
	if (line2.length < 30) return null;

	const passportNumber = line2.slice(0, 9).replace(/<+$/, "");
	if (!/^[A-Z0-9]+$/.test(passportNumber)) return null;

	const expiry = parseMrzDate(line2.slice(21, 27), true);
	if (!expiry) return null;

	const dob = parseMrzDate(line2.slice(13, 19), false);

	return {
		passportNumber,
		expiryYear: expiry.year,
		expiryMonth: expiry.month,
		expiryDay: expiry.day,
		dobYear: dob?.year,
		dobMonth: dob?.month,
		dobDay: dob?.day,
	};
}

// ─── extractPassportNumberFallback ───────────────────────────────────────────

/**
 * Fallback: extract a passport number directly from raw OCR text when full MRZ
 * detection fails. Matches one uppercase letter followed by 7–8 digits.
 */
export function extractPassportNumberFallback(rawText: string): string | null {
	const match = rawText.match(/\b[A-Z][0-9]{7,8}\b/);
	return match ? match[0] : null;
}
