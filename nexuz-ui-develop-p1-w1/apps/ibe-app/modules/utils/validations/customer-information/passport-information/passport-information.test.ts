/**
 * File: passport-information.test.ts
 * Classification: Validation
 * Description: Tests for passport information validation utilities.
 */

import { describe, expect, it } from "vitest";
import { isPassportExpired } from "@/modules/utils/validations/customer-information/passport-information/passport-information";

describe("isPassportExpired", () => {
	it("returns true when passport expires after reference date", () => {
		expect(
			isPassportExpired(
				{
					year: "2030",
					month: "06",
					day: "15",
				},
				new Date("2026-09-02")
			)
		).toBe(true);
	});

	it("returns false when passport expired before reference date", () => {
		expect(
			isPassportExpired(
				{
					year: "2020",
					month: "01",
					day: "01",
				},
				new Date("2026-09-02")
			)
		).toBe(false);
	});

	it("returns false when passport expiry date equals reference date", () => {
		expect(
			isPassportExpired(
				{
					year: "2026",
					month: "09",
					day: "02",
				},
				new Date("2026-09-02")
			)
		).toBe(false);
	});

	it("returns true when passport expires one day after reference date", () => {
		expect(
			isPassportExpired(
				{
					year: "2026",
					month: "09",
					day: "03",
				},
				new Date("2026-09-02")
			)
		).toBe(true);
	});

	it("returns false when passport expires one day before reference date", () => {
		expect(
			isPassportExpired(
				{
					year: "2026",
					month: "09",
					day: "01",
				},
				new Date("2026-09-02")
			)
		).toBe(false);
	});

	it("returns true when passport expires far in the future", () => {
		expect(
			isPassportExpired(
				{
					year: "2099",
					month: "12",
					day: "31",
				},
				new Date("2026-09-02")
			)
		).toBe(true);
	});

	it("returns false when passport expired many years ago", () => {
		expect(
			isPassportExpired(
				{
					year: "2000",
					month: "01",
					day: "01",
				},
				new Date("2026-09-02")
			)
		).toBe(false);
	});
});
