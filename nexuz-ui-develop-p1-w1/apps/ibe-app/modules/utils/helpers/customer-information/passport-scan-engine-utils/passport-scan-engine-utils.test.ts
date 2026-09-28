/**
 * File: passport-scan-engine-utils.test.ts
 * Description: Unit tests for passport-scan-engine-utils.
 * Covers canvas pre-processing, OCR worker flow, MRZ parsing pipeline, fallback logic, and null scan result.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const tesseractMocks = vi.hoisted(() => ({
	createWorker: vi.fn(),
	setParameters: vi.fn(),
	recognize: vi.fn(),
	terminate: vi.fn(),
}));

const mrzMocks = vi.hoisted(() => ({
	extractMrzLines: vi.fn(),
	extractPassportNumberFallback: vi.fn(),
	parseMrzLine2: vi.fn(),
}));

vi.mock("tesseract.js", () => ({
	PSM: {
		SINGLE_BLOCK: 6,
	},
	createWorker: tesseractMocks.createWorker,
}));

vi.mock("@/modules/utils/helpers/customer-information/mrz-utils/mrz-utils", () => ({
	extractMrzLines: mrzMocks.extractMrzLines,
	extractPassportNumberFallback: mrzMocks.extractPassportNumberFallback,
	parseMrzLine2: mrzMocks.parseMrzLine2,
}));

import {
	MRZ_CROP_HEIGHT_RATIO,
	MRZ_CROP_START_RATIO,
	preprocessCanvas,
	runOcr,
	scanCanvasForPassport,
} from "./passport-scan-engine-utils";

const createMockCanvas = (
	contextValue: CanvasRenderingContext2D | null = null
): HTMLCanvasElement =>
	({
		width: 200,
		height: 100,
		getContext: vi.fn().mockReturnValue(contextValue),
	}) as unknown as HTMLCanvasElement;

describe("passport-scan-engine-utils", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		tesseractMocks.createWorker.mockResolvedValue({
			setParameters: tesseractMocks.setParameters,
			recognize: tesseractMocks.recognize,
			terminate: tesseractMocks.terminate,
		});
	});

	describe("constants", () => {
		it("should expose MRZ crop ratios", () => {
			expect(MRZ_CROP_START_RATIO).toBe(0.75);
			expect(MRZ_CROP_HEIGHT_RATIO).toBe(0.25);
		});
	});

	describe("preprocessCanvas", () => {
		it("should return source canvas when context is unavailable", () => {
			const sourceCanvas = createMockCanvas();
			const outputCanvas = createMockCanvas(null);

			vi.spyOn(document, "createElement").mockReturnValueOnce(outputCanvas);

			const result = preprocessCanvas(sourceCanvas);

			expect(result).toBe(sourceCanvas);
		});

		it("should apply grayscale and dark contrast enhancement", () => {
			const pixelData = [10, undefined, 30, 255] as unknown as Uint8ClampedArray;

			const imageData = {
				data: pixelData,
			} as ImageData;

			const context = {
				drawImage: vi.fn(),
				getImageData: vi.fn().mockReturnValue(imageData),
				putImageData: vi.fn(),
			} as unknown as CanvasRenderingContext2D;

			const sourceCanvas = createMockCanvas();
			const outputCanvas = createMockCanvas(context);

			vi.spyOn(document, "createElement").mockReturnValueOnce(outputCanvas);

			const result = preprocessCanvas(sourceCanvas);

			expect(result).toBe(outputCanvas);
			expect(outputCanvas.width).toBe(sourceCanvas.width);
			expect(outputCanvas.height).toBe(sourceCanvas.height);
			expect(context.drawImage).toHaveBeenCalledWith(sourceCanvas, 0, 0);
			expect(context.getImageData).toHaveBeenCalledWith(0, 0, 200, 100);
			expect(pixelData[0]).toBe(5);
			expect(pixelData[1]).toBe(5);
			expect(pixelData[2]).toBe(5);
			expect(context.putImageData).toHaveBeenCalledWith(imageData, 0, 0);
		});

		it("should apply light contrast enhancement", () => {
			const pixelData = [200, 210, 220, 255] as unknown as Uint8ClampedArray;

			const imageData = {
				data: pixelData,
			} as ImageData;

			const context = {
				drawImage: vi.fn(),
				getImageData: vi.fn().mockReturnValue(imageData),
				putImageData: vi.fn(),
			} as unknown as CanvasRenderingContext2D;

			const sourceCanvas = createMockCanvas();
			const outputCanvas = createMockCanvas(context);

			vi.spyOn(document, "createElement").mockReturnValueOnce(outputCanvas);

			preprocessCanvas(sourceCanvas);

			expect(pixelData[0]).toBe(240);
			expect(pixelData[1]).toBe(240);
			expect(pixelData[2]).toBe(240);
		});

		it("should cap enhanced light pixel value at 255", () => {
			const pixelData = [255, 255, 255, 255] as unknown as Uint8ClampedArray;

			const imageData = {
				data: pixelData,
			} as ImageData;

			const context = {
				drawImage: vi.fn(),
				getImageData: vi.fn().mockReturnValue(imageData),
				putImageData: vi.fn(),
			} as unknown as CanvasRenderingContext2D;

			const sourceCanvas = createMockCanvas();
			const outputCanvas = createMockCanvas(context);

			vi.spyOn(document, "createElement").mockReturnValueOnce(outputCanvas);

			preprocessCanvas(sourceCanvas);

			expect(pixelData[0]).toBe(255);
			expect(pixelData[1]).toBe(255);
			expect(pixelData[2]).toBe(255);
		});
	});

	describe("runOcr", () => {
		it("should run OCR with tesseract worker and terminate worker", async () => {
			const canvas = createMockCanvas();

			tesseractMocks.recognize.mockResolvedValueOnce({
				data: {
					text: "OCR TEXT",
				},
			});

			const result = await runOcr(canvas);

			expect(tesseractMocks.createWorker).toHaveBeenCalledWith("eng");
			expect(tesseractMocks.setParameters).toHaveBeenCalledWith({
				tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<",
				tessedit_pageseg_mode: 6,
			});
			expect(tesseractMocks.recognize).toHaveBeenCalledWith(canvas);
			expect(tesseractMocks.terminate).toHaveBeenCalledTimes(1);
			expect(result).toBe("OCR TEXT");
		});

		it("should terminate worker even when OCR fails", async () => {
			const canvas = createMockCanvas();

			tesseractMocks.recognize.mockRejectedValueOnce(new Error("OCR failed"));

			await expect(runOcr(canvas)).rejects.toThrow("OCR failed");

			expect(tesseractMocks.terminate).toHaveBeenCalledTimes(1);
		});
	});

	describe("scanCanvasForPassport", () => {
		it("should return parsed MRZ result from first OCR attempt", async () => {
			const canvas = createMockCanvas();
			const parsedResult = {
				passportNumber: "AB1234567",
				expiryYear: "2030",
				expiryMonth: "12",
				expiryDay: "31",
			};

			tesseractMocks.recognize.mockResolvedValueOnce({
				data: {
					text: "MRZ OCR TEXT",
				},
			});

			mrzMocks.extractMrzLines.mockReturnValueOnce(["LINE1", "LINE2"]);
			mrzMocks.parseMrzLine2.mockReturnValueOnce(parsedResult);

			const result = await scanCanvasForPassport(canvas);

			expect(mrzMocks.extractMrzLines).toHaveBeenCalledWith("MRZ OCR TEXT");
			expect(mrzMocks.parseMrzLine2).toHaveBeenCalledWith("LINE2");
			expect(result).toEqual(parsedResult);
		});

		it("should fallback to full canvas OCR when preprocessed OCR has no MRZ lines", async () => {
			const canvas = createMockCanvas();
			const parsedResult = {
				passportNumber: "CD9876543",
				expiryYear: "2029",
				expiryMonth: "10",
				expiryDay: "20",
			};

			tesseractMocks.recognize
				.mockResolvedValueOnce({
					data: {
						text: "NO MRZ TEXT",
					},
				})
				.mockResolvedValueOnce({
					data: {
						text: "FULL IMAGE MRZ TEXT",
					},
				});

			mrzMocks.extractMrzLines.mockReturnValueOnce(null).mockReturnValueOnce(["LINE1", "LINE2"]);

			mrzMocks.parseMrzLine2.mockReturnValueOnce(parsedResult);

			const result = await scanCanvasForPassport(canvas);

			expect(mrzMocks.extractMrzLines).toHaveBeenCalledWith("NO MRZ TEXT");
			expect(mrzMocks.extractMrzLines).toHaveBeenCalledWith("FULL IMAGE MRZ TEXT");
			expect(mrzMocks.parseMrzLine2).toHaveBeenCalledWith("LINE2");
			expect(result).toEqual(parsedResult);
		});

		it("should fallback to passport number extraction when MRZ parse fails", async () => {
			const canvas = createMockCanvas();

			tesseractMocks.recognize.mockResolvedValueOnce({
				data: {
					text: "RAW TEXT WITH PASSPORT NUMBER",
				},
			});

			mrzMocks.extractMrzLines.mockReturnValueOnce(["LINE1"]);
			mrzMocks.parseMrzLine2.mockReturnValueOnce(null);
			mrzMocks.extractPassportNumberFallback.mockReturnValueOnce("EF1234567");

			const result = await scanCanvasForPassport(canvas);

			expect(mrzMocks.parseMrzLine2).toHaveBeenCalledWith("");
			expect(mrzMocks.extractPassportNumberFallback).toHaveBeenCalledWith(
				"RAW TEXT WITH PASSPORT NUMBER"
			);
			expect(result).toEqual({
				passportNumber: "EF1234567",
				expiryYear: "",
				expiryMonth: "",
				expiryDay: "",
			});
		});

		it("should fallback to passport number extraction after full OCR also fails MRZ detection", async () => {
			const canvas = createMockCanvas();

			tesseractMocks.recognize
				.mockResolvedValueOnce({
					data: {
						text: "FIRST OCR TEXT",
					},
				})
				.mockResolvedValueOnce({
					data: {
						text: "SECOND OCR TEXT",
					},
				});

			mrzMocks.extractMrzLines.mockReturnValue(null);
			mrzMocks.extractPassportNumberFallback.mockReturnValueOnce("GH7654321");

			const result = await scanCanvasForPassport(canvas);

			expect(mrzMocks.extractMrzLines).toHaveBeenCalledTimes(2);
			expect(mrzMocks.extractPassportNumberFallback).toHaveBeenCalledWith("SECOND OCR TEXT");
			expect(result).toEqual({
				passportNumber: "GH7654321",
				expiryYear: "",
				expiryMonth: "",
				expiryDay: "",
			});
		});

		it("should return null when MRZ and fallback passport number are unavailable", async () => {
			const canvas = createMockCanvas();

			tesseractMocks.recognize.mockResolvedValueOnce({
				data: {
					text: "UNREADABLE TEXT",
				},
			});

			mrzMocks.extractMrzLines.mockReturnValueOnce(["LINE1", "LINE2"]);
			mrzMocks.parseMrzLine2.mockReturnValueOnce(null);
			mrzMocks.extractPassportNumberFallback.mockReturnValueOnce("");

			const result = await scanCanvasForPassport(canvas);

			expect(result).toBeNull();
		});
	});
});
