/**
 * File: passport-scan-engine-utils.ts
 * Description: Passport scanning and OCR processing utilities used for extracting passport information from camera or uploaded images.
 * It provides MRZ detection, image preprocessing, OCR execution, and passport data parsing functions to support the Customer Information passport scanning workflow.
 */

"use client";

import { createWorker, PSM } from "tesseract.js";
import type { MrzParseResult } from "@/modules/utils/helpers/customer-information/mrz-utils/mrz-utils";
import {
	extractMrzLines,
	extractPassportNumberFallback,
	parseMrzLine2,
} from "@/modules/utils/helpers/customer-information/mrz-utils/mrz-utils";

export type { MrzParseResult };

export type ScannerState =
	| "permission_prompt"
	| "scanning"
	| "processing"
	| "permission_denied"
	| "scan_failed"
	| "scan_complete";

export type ScanSource = "camera" | "upload";

/** Fraction of image height at which the MRZ band starts (bottom ~25%). */
export const MRZ_CROP_START_RATIO = 0.75;
/** Height of the MRZ crop region as a fraction of the full image height. */
export const MRZ_CROP_HEIGHT_RATIO = 0.25;

// ─── Image pre-processing ─────────────────────────────────────────────────────

/**
 * Apply grayscale + mild contrast boost to improve Tesseract OCR accuracy on
 * the MRZ band. Returns the processed canvas (or source if ctx unavailable).
 */
export function preprocessCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
	const out = document.createElement("canvas");
	out.width = source.width;
	out.height = source.height;
	const ctx = out.getContext("2d");
	if (!ctx) return source;
	ctx.drawImage(source, 0, 0);
	const imageData = ctx.getImageData(0, 0, out.width, out.height);
	const { data } = imageData;
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i] ?? 0;
		const g = data[i + 1] ?? 0;
		const b = data[i + 2] ?? 0;
		const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
		const enhanced =
			gray < 128
				? Math.max(0, Math.round(gray * 0.85))
				: Math.min(255, Math.round(128 + (gray - 128) * 1.4));
		data[i] = enhanced;
		data[i + 1] = enhanced;
		data[i + 2] = enhanced;
	}
	ctx.putImageData(imageData, 0, 0);
	return out;
}

// ─── OCR ────────

export async function runOcr(canvas: HTMLCanvasElement): Promise<string> {
	const worker = await createWorker("eng");
	try {
		await worker.setParameters({
			tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<",
			tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
		});
		const {
			data: { text },
		} = await worker.recognize(canvas);
		return text;
	} finally {
		await worker.terminate();
	}
}

// ─── Full OCR pipeline ───────────────────

/**
 * End-to-end pipeline:
 *   canvas → grayscale/contrast preprocess → Tesseract OCR → extract MRZ lines
 *   → parse line 2 → structured MrzParseResult
 *
 * Falls back to full-image OCR if the cropped attempt fails, then falls back
 * to regex passport-number extraction if MRZ detection still fails.
 * Returns null when no passport data can be extracted.
 */
export async function scanCanvasForPassport(
	canvas: HTMLCanvasElement
): Promise<MrzParseResult | null> {
	const preprocessed = preprocessCanvas(canvas);
	let rawText = await runOcr(preprocessed);

	let lines = extractMrzLines(rawText);

	if (!lines) {
		rawText = await runOcr(canvas);
		lines = extractMrzLines(rawText);
	}

	if (lines) {
		const parsed = parseMrzLine2(lines[1] ?? "");
		if (parsed) {
			return parsed;
		}
	}

	const passportNumber = extractPassportNumberFallback(rawText);
	if (!passportNumber) {
		return null;
	}

	return { passportNumber, expiryYear: "", expiryMonth: "", expiryDay: "" };
}
