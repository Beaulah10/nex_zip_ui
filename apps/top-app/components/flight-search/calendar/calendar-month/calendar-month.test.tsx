import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarMonth from "./calendar-month";

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const messages = {
			month_july: "July",
			day_initial_sunday: "S",
			day_initial_monday: "M",
			day_initial_tuesday: "T",
			day_initial_wednesday: "W",
			day_initial_thursday: "T",
			day_initial_friday: "F",
			day_initial_saturday: "S",
		};
		const t = ((key: string) => {
			return messages[key as keyof typeof messages] ?? key;
		}) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => {
			return key in messages;
		};
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
	it("renders month and allows date selection", () => {
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

		expect(screen.getByText("2026")).toBeDefined();
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
				isSelectingReturn={true}
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
});
