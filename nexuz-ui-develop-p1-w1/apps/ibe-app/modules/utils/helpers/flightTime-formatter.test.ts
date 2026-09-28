import { describe, expect, it } from "vitest";
import formatFlightTime, { formatDuration } from "./flightTime-formatter";

describe("formatFlightTime", () => {
	it("formats a valid HH:mm time token", () => {
		expect(formatFlightTime("08:30")).toBe("08H30M");
	});

	it("returns an empty string for a falsy time", () => {
		expect(formatFlightTime("")).toBe("");
	});
});

describe("formatDuration", () => {
	it("renders a compact hours and minutes label", () => {
		expect(formatDuration("02:45")).toBe("2h 45m");
	});

	it("returns an empty string for missing, malformed, or non-numeric inputs", () => {
		expect(formatDuration(undefined)).toBe("");
		expect(formatDuration("0245")).toBe("");
		expect(formatDuration("aa:10")).toBe("");
	});
});
