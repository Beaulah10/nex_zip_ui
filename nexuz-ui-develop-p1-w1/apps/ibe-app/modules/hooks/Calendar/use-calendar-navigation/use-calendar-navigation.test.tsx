import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useCalendarNavigation from "./use-calendar-navigation";

describe("useCalendarNavigation", () => {
	it("derives second month and movement bounds", () => {
		const { result } = renderHook(() =>
			useCalendarNavigation({
				visibleMonth: new Date(2026, 6, 1),
				minDate: new Date(2026, 5, 1),
				maxDate: new Date(2026, 10, 30),
			})
		);

		expect(result.current.secondVisibleMonth).toEqual(new Date(2026, 7, 1));
		expect(result.current.canGoBack).toBe(true);
		expect(result.current.canGoForward).toBe(true);
		expect(result.current.allMonths[0]).toEqual(new Date(2026, 5, 1));
		expect(result.current.allMonths.at(-1)).toEqual(new Date(2026, 10, 1));
	});

	it("disables backward and forward movement at boundaries", () => {
		const { result } = renderHook(() =>
			useCalendarNavigation({
				visibleMonth: new Date(2026, 0, 1),
				minDate: new Date(2026, 0, 1),
				maxDate: new Date(2026, 1, 28),
			})
		);

		expect(result.current.canGoBack).toBe(false);
		expect(result.current.canGoForward).toBe(false);
	});
});
