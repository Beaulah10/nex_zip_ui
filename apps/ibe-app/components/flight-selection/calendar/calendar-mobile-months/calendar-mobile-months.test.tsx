import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarMobileMonths from "./calendar-mobile-months";

vi.mock("../calendar-month/calendar-month", () => ({
	default: ({ year, month }: { year: number; month: number }) => (
		<div>{`month-${year}-${month}`}</div>
	),
}));

describe("CalendarMobileMonths", () => {
	it("renders one calendar month per entry", () => {
		render(
			<CalendarMobileMonths
				allMonths={[new Date(2026, 6, 1), new Date(2026, 7, 1)]}
				outboundDate={null}
				inboundDate={null}
				hoverForCalendar={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 9, 30)}
				handleDateSelect={vi.fn()}
				setHovered={vi.fn()}
				oneWay={false}
				isSelectingReturn={false}
			/>
		);

		expect(screen.getByText("month-2026-6")).toBeDefined();
		expect(screen.getByText("month-2026-7")).toBeDefined();
	});
});
