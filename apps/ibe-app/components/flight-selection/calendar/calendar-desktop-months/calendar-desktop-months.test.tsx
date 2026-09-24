import { fireEvent, render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import CalendarDesktopMonths from "./calendar-desktop-months";

const makeTranslator = (hasMonths: boolean) => {
	const translations: Record<string, string> = {
		month_july: "July",
		month_august: "August",
		calendar_previous_month_label: "Previous month",
		calendar_next_month_label: "Next month",
	};
	const t = ((key: string) => translations[key] ?? key) as {
		(key: string): string;
		has: (key: string) => boolean;
	};
	t.has = (key: string) => hasMonths && key in translations;
	return t;
};

vi.mock("next-intl", () => ({
	useTranslations: vi.fn(() => makeTranslator(true)),
}));

const calendarMonthMock = vi.fn(({ year, month }: { year: number; month: number }) => (
	<div>{`calendar-month-${year}-${month}`}</div>
));

vi.mock("@/modules/utils/helpers/calendar/calendar.helpers", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/modules/utils/helpers/calendar/calendar.helpers")>();
	return {
		...actual,
		IconChevronLeft: () => <span>left</span>,
		IconChevronRight: () => <span>right</span>,
	};
});

vi.mock("../calendar-month/calendar-month", () => ({
	default: (props: { year: number; month: number }) => calendarMonthMock(props),
}));

function buildProps(overrides: Partial<React.ComponentProps<typeof CalendarDesktopMonths>> = {}) {
	return {
		visibleMonth: new Date(2026, 6, 1),
		secondVisibleMonth: new Date(2026, 7, 1),
		canGoBack: true,
		canGoForward: true,
		setVisibleMonth: vi.fn(),
		outboundDate: null,
		inboundDate: null,
		hoverForCalendar: null,
		minDate: new Date(2026, 6, 1),
		maxDate: new Date(2026, 9, 30),
		handleDateSelect: vi.fn(),
		setHovered: vi.fn(),
		oneWay: false,
		isSelectingReturn: false,
		...overrides,
	};
}

describe("CalendarDesktopMonths", () => {
	it("passes expected month props and defaults to both month panes", () => {
		calendarMonthMock.mockClear();
		render(<CalendarDesktopMonths {...buildProps()} />);

		expect(screen.getByText("calendar-month-2026-6")).toBeDefined();
		expect(screen.getByText("calendar-month-2026-7")).toBeDefined();
		expect(calendarMonthMock).toHaveBeenCalledTimes(2);
		expect(calendarMonthMock).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				year: 2026,
				month: 6,
				showMonthTitle: false,
				isLoading: false,
				seatType: "standard",
				currencySymbol: "¥",
			})
		);
		expect(calendarMonthMock).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				year: 2026,
				month: 7,
				showMonthTitle: false,
				isLoading: false,
				seatType: "standard",
				currencySymbol: "¥",
			})
		);
	});

	it("renders two month panes and navigation buttons", () => {
		const setVisibleMonth = vi.fn();
		render(<CalendarDesktopMonths {...buildProps({ setVisibleMonth })} />);

		expect(screen.getByText("July 2026")).toBeDefined();
		expect(screen.getByText("August 2026")).toBeDefined();
		fireEvent.click(screen.getByLabelText("Previous month"));
		const backArg = setVisibleMonth.mock.calls[0]?.[0];
		if (!backArg) throw new Error("Expected previous navigation to pass updater function");
		const backUpdater = backArg as (month: Date) => Date;
		expect(backUpdater(new Date(2026, 6, 1))).toEqual(new Date(2026, 5, 1));

		fireEvent.click(screen.getByLabelText("Next month"));
		const forwardArg = setVisibleMonth.mock.calls[1]?.[0];
		if (!forwardArg) throw new Error("Expected next navigation to pass updater function");
		const forwardUpdater = forwardArg as (month: Date) => Date;
		expect(forwardUpdater(new Date(2026, 6, 1))).toEqual(new Date(2026, 7, 1));
	});

	it("disables navigation and uses fallback button labels when label keys are missing", () => {
		const setVisibleMonth = vi.fn();
		render(
			<CalendarDesktopMonths
				{...buildProps({
					canGoBack: false,
					canGoForward: false,
					setVisibleMonth,
				})}
			/>
		);

		const previousButton = screen.getByLabelText("Previous month");
		const nextButton = screen.getByLabelText("Next month");
		expect(previousButton).toHaveProperty("disabled", true);
		expect(nextButton).toHaveProperty("disabled", true);

		fireEvent.click(previousButton);
		fireEvent.click(nextButton);
		expect(setVisibleMonth).not.toHaveBeenCalled();
	});

	it("renders month headings from translations", () => {
		render(<CalendarDesktopMonths {...buildProps({})} />);

		expect(screen.getByRole("heading", { name: "July 2026" })).toBeDefined();
		expect(screen.getByRole("heading", { name: "August 2026" })).toBeDefined();
	});

	it("renders empty string for month headings when translation key is absent", () => {
		vi.mocked(useTranslations).mockReturnValueOnce(
			makeTranslator(false) as ReturnType<typeof useTranslations>
		);

		const { container } = render(<CalendarDesktopMonths {...buildProps()} />);
		const headings = container.querySelectorAll("h3");
		expect(headings[0]?.textContent?.trim()).toBe("2026");
		expect(headings[1]?.textContent?.trim()).toBe("2026");
	});
});
