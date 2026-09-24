import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarMonth from "./calendar-month";

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const translations: Record<string, string> = {
			month_july: "July",
			day_initial_sunday: "S",
			day_initial_monday: "M",
			day_initial_tuesday: "T",
			day_initial_wednesday: "W",
			day_initial_thursday: "T",
			day_initial_friday: "F",
			day_initial_saturday: "S",
		};
		const t = ((key: string) => translations[key] ?? key) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => key in translations;
		return t;
	},
}));

vi.mock("@repo/ui/components/skeleton", () => ({
	Skeleton: () => <div>loading-skeleton</div>,
}));

vi.mock("@repo/ui/components/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("CalendarMonth", () => {
	it("renders month and allows date selection", { timeout: 15000 }, () => {
		const onSelect = vi.fn();
		const onHover = vi.fn();
		render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={null}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-10": "¥12,000" }}
				onSelect={onSelect}
				onHover={onHover}
			/>
		);

		expect(screen.getByRole("heading", { name: "July 2026" })).toBeDefined();
		const dateButton = screen.getByRole("button", { name: /10.*2026/i });
		fireEvent.mouseEnter(dateButton);
		fireEvent.mouseLeave(dateButton);
		fireEvent.click(dateButton);
		expect(onSelect).toHaveBeenCalled();
		expect(onHover).toHaveBeenCalled();
		expect(onHover).toHaveBeenCalledWith(null);
	});

	it("shows loading skeleton when loading", () => {
		render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={null}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				isLoading={true}
				onSelect={vi.fn()}
				onHover={vi.fn()}
			/>
		);

		expect(screen.getAllByText("loading-skeleton").length).toBeGreaterThan(0);
	});

	it("renders a hover range between the departure and hovered dates", () => {
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={new Date(2026, 6, 10)}
				returnDate={null}
				hovered={new Date(2026, 6, 14)}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{
					"2026-07-10": "¥12,000",
					"2026-07-11": "¥11,000",
					"2026-07-12": "¥10,000",
					"2026-07-13": "¥9,000",
					"2026-07-14": "¥8,000",
				}}
				onSelect={vi.fn()}
				onHover={vi.fn()}
			/>
		);

		expect(container.querySelector('button[data-date-key="2026-07-11"]')?.className).toContain(
			"cal-cell-range"
		);
		expect(container.querySelector('button[data-date-key="2026-07-12"]')?.className).toContain(
			"cal-cell-range"
		);
	});

	it("hides the departure fare and disables earlier return dates when selecting a return date", () => {
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={new Date(2026, 6, 10)}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{
					"2026-07-09": "¥11,000",
					"2026-07-10": "¥12,000",
				}}
				onSelect={vi.fn()}
				onHover={vi.fn()}
				isSelectingReturn={true}
			/>
		);

		const earlierDate = container.querySelector<HTMLButtonElement>(
			'button[data-date-key="2026-07-09"]'
		);
		const departureDate = container.querySelector<HTMLButtonElement>(
			'button[data-date-key="2026-07-10"]'
		);

		expect(earlierDate).toBeTruthy();
		expect(earlierDate?.disabled).toBe(true);
		expect(earlierDate?.className).toContain("cursor-default");
		expect(departureDate?.textContent).toBe("10");
	});

	it("renders promotional prices with a strikethrough original price", () => {
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={null}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-15": "¥15,000" }}
				promoPrices={{ "2026-07-15": "¥9,900" }}
				onSelect={vi.fn()}
				onHover={vi.fn()}
			/>
		);

		const cell = container.querySelector<HTMLButtonElement>('button[data-date-key="2026-07-15"]');
		expect(cell).toBeTruthy();
		expect(cell?.textContent).toContain("¥9,900");
		expect(cell?.textContent).toContain("¥15,000");
		const spans = cell?.querySelectorAll("span.line-through");
		expect(spans?.length).toBeGreaterThanOrEqual(2);
	});

	it("renders promo price in white text when the date is selected as departure", () => {
		const departure = new Date(2026, 6, 20);
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={departure}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-20": "¥15,000" }}
				promoPrices={{ "2026-07-20": "¥9,900" }}
				onSelect={vi.fn()}
				onHover={vi.fn()}
				oneWay
			/>
		);

		const cell = container.querySelector<HTMLButtonElement>('button[data-date-key="2026-07-20"]');
		expect(cell).toBeTruthy();
		expect(cell?.getAttribute("aria-pressed")).toBe("true");
		const whiteSpans = cell?.querySelectorAll("span.text-white");
		expect(whiteSpans?.length).toBeGreaterThanOrEqual(1);
	});

	it("renders dash alternative-fare indicator for dates with fare display of '-'", () => {
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={null}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-08": "-" }}
				onSelect={vi.fn()}
				onHover={vi.fn()}
			/>
		);

		const cell = container.querySelector<HTMLButtonElement>('button[data-date-key="2026-07-08"]');
		expect(cell).toBeTruthy();
		expect(cell?.textContent).toContain("-");
	});

	it("hides promo price for the departure date when selecting return (hideFareForDeparture=true)", () => {
		const departure = new Date(2026, 6, 10);
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={departure}
				returnDate={null}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-10": "¥12,000", "2026-07-15": "¥10,000" }}
				promoPrices={{ "2026-07-10": "¥9,000", "2026-07-15": "¥7,000" }}
				onSelect={vi.fn()}
				onHover={vi.fn()}
				isSelectingReturn
			/>
		);

		// departure date (2026-07-10) promo should be hidden
		const departureCell = container.querySelector<HTMLButtonElement>(
			'button[data-date-key="2026-07-10"]'
		);
		expect(departureCell?.textContent).toBe("10");

		// a non-departure date (2026-07-15) should show its promo price
		const otherCell = container.querySelector<HTMLButtonElement>(
			'button[data-date-key="2026-07-15"]'
		);
		expect(otherCell?.textContent).toContain("¥7,000");
	});

	it("highlights the return date with right-rounded styling distinct from departure", () => {
		const departure = new Date(2026, 6, 5);
		const returnDate = new Date(2026, 6, 15);
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={departure}
				returnDate={returnDate}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-05": "¥10,000", "2026-07-15": "¥8,000" }}
				onSelect={vi.fn()}
				onHover={vi.fn()}
			/>
		);

		const returnCell = container.querySelector<HTMLButtonElement>(
			'button[data-date-key="2026-07-15"]'
		);
		expect(returnCell).toBeTruthy();
		expect(returnCell?.getAttribute("aria-pressed")).toBe("true");
		expect(returnCell?.className).toContain("rounded-r-xl");

		const departureCell = container.querySelector<HTMLButtonElement>(
			'button[data-date-key="2026-07-05"]'
		);
		expect(departureCell?.className).toContain("rounded-l-xl");
	});

	it("renders same-day round-trip (departure = return) with full border-radius rounded-xl", () => {
		const sameDay = new Date(2026, 6, 10);
		const { container } = render(
			<CalendarMonth
				year={2026}
				month={6}
				departure={sameDay}
				returnDate={sameDay}
				hovered={null}
				minDate={new Date(2026, 6, 1)}
				maxDate={new Date(2026, 6, 31)}
				prices={{ "2026-07-10": "¥12,000" }}
				onSelect={vi.fn()}
				onHover={vi.fn()}
			/>
		);

		const cell = container.querySelector<HTMLButtonElement>('button[data-date-key="2026-07-10"]');
		expect(cell?.getAttribute("aria-pressed")).toBe("true");
		// When isDepart && isReturn are both true, should use rounded-xl (not rounded-l-xl or rounded-r-xl)
		const cellClasses = cell?.className || "";
		const hasRoundedXl = cellClasses.includes("rounded-xl");
		const hasRoundedLeftXl = cellClasses.includes("rounded-l-xl");
		const hasRoundedRightXl = cellClasses.includes("rounded-r-xl");
		expect(hasRoundedXl).toBe(true);
		expect(hasRoundedLeftXl).toBe(false);
		expect(hasRoundedRightXl).toBe(false);
	});
});
