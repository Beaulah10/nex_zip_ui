import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getTimeDiffFromDepartureTZ,
	isExpiredDate,
} from "@/modules/utils/helpers/common/date-utils/date-utils";

describe("getTimeDiffFromDepartureTZ", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("throws when departureISO is empty", () => {
		expect(() => getTimeDiffFromDepartureTZ("")).toThrow("Invalid departure datetime");
	});

	it("throws when departureISO is invalid", () => {
		expect(() => getTimeDiffFromDepartureTZ("invalid-date")).toThrow("Invalid ISO date format");
	});

	it("returns zero values when departure time is in the past", () => {
		vi.spyOn(Date, "now").mockReturnValue(new Date("2026-01-02T00:00:00Z").getTime());

		const result = getTimeDiffFromDepartureTZ("2026-01-01T00:00:00Z");

		expect(result.days).toBe(0);
		expect(result.hours).toBe(0);
		expect(result.minutes).toBe(0);
		expect(result.seconds).toBe(0);
		expect(result.totalMs).toBeLessThanOrEqual(0);
	});

	it("returns zero values when departure time equals current time", () => {
		const now = new Date("2026-01-01T00:00:00Z").getTime();

		vi.spyOn(Date, "now").mockReturnValue(now);

		const result = getTimeDiffFromDepartureTZ("2026-01-01T00:00:00Z");

		expect(result.days).toBe(0);
		expect(result.hours).toBe(0);
		expect(result.minutes).toBe(0);
		expect(result.seconds).toBe(0);
		expect(result.totalMs).toBe(0);
	});

	it("returns correct future time difference", () => {
		vi.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:00:00Z").getTime());

		const result = getTimeDiffFromDepartureTZ("2026-01-03T01:02:03Z");

		expect(result.days).toBe(2);
		expect(result.hours).toBe(49);
		expect(result.minutes).toBe(2942);
		expect(result.seconds).toBe(176523);
		expect(result.totalMs).toBeGreaterThan(0);
	});

	it("returns correct values for one hour difference", () => {
		vi.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:00:00Z").getTime());

		const result = getTimeDiffFromDepartureTZ("2026-01-01T01:00:00Z");

		expect(result.days).toBe(0);
		expect(result.hours).toBe(1);
		expect(result.minutes).toBe(60);
		expect(result.seconds).toBe(3600);
		expect(result.totalMs).toBe(3600000);
	});
});

// Existing tests
describe("isExpiredDate", () => {
	it("returns true when expiry date is after reference date (valid)", () => {
		const result = isExpiredDate({ year: "2030", month: "12", day: "31" }, new Date("2026-01-01"));
		expect(result).toBe(true);
	});

	it("returns false when expiry date is before reference date (expired)", () => {
		const result = isExpiredDate({ year: "2020", month: "01", day: "01" }, new Date("2026-01-01"));
		expect(result).toBe(false);
	});

	it("returns false when expiry date equals reference date (on same day)", () => {
		const result = isExpiredDate({ year: "2026", month: "01", day: "01" }, new Date("2026-01-01"));
		expect(result).toBe(false);
	});

	it("returns true when expiry is one day after reference date", () => {
		const result = isExpiredDate({ year: "2026", month: "01", day: "02" }, new Date("2026-01-01"));
		expect(result).toBe(true);
	});

	it("returns false when expiry is one day before reference date", () => {
		const result = isExpiredDate({ year: "2025", month: "12", day: "31" }, new Date("2026-01-01"));
		expect(result).toBe(false);
	});
});
