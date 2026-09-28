import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	addMonths,
	formatDateKey,
	formatTabLabel,
	getFocusableElements,
	IconChevronDown,
	IconClose,
	IconInfo,
	IconSeat,
	isSameDay,
	monthsBetween,
	startOfMonth,
	toDateOnly,
} from "./calendar.helpers";

describe("calendar-helpers", () => {
	it("normalizes and compares dates", () => {
		const withTime = new Date(2026, 6, 9, 13, 30, 0);
		expect(toDateOnly(withTime)).toEqual(new Date(2026, 6, 9));
		expect(isSameDay(new Date(2026, 6, 9), withTime)).toBe(true);
		expect(formatDateKey(new Date(2026, 0, 2))).toBe("2026-01-02");
	});

	it("handles month calculations and tab labels", () => {
		expect(addMonths(new Date(2026, 0, 15), 2)).toEqual(new Date(2026, 2, 1));
		expect(startOfMonth(new Date(2026, 4, 31))).toEqual(new Date(2026, 4, 1));
		expect(monthsBetween(new Date(2026, 0, 1), new Date(2026, 6, 1))).toBe(6);
		expect(formatTabLabel(new Date(2026, 6, 12), "Outbound")).toBe("7/12");
		expect(formatTabLabel(null, "Outbound")).toBe("Outbound");
	});

	it("renders exported icon helpers", () => {
		const { container: close } = render(<IconClose />);
		const { container: info } = render(<IconInfo />);
		const { container: seat } = render(<IconSeat className="seat" />);
		const { container: down } = render(<IconChevronDown className="down" />);

		expect(close.querySelector("svg")).toBeTruthy();
		expect(info.querySelector("svg")).toBeTruthy();
		expect(seat.querySelector("svg.seat")).toBeTruthy();
		expect(down.querySelector("svg.down")).toBeTruthy();
	});

	it("returns focusable elements excluding disabled", () => {
		const host = document.createElement("div");
		host.innerHTML =
			'<button>ok</button><button disabled>no</button><a href="#">link</a><input /><div tabindex="0"></div>';

		const focusables = getFocusableElements(host);
		expect(focusables).toHaveLength(4);
	});
});
