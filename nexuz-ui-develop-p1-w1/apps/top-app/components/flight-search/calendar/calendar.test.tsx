import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarModal from "./calendar";

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const labels: Record<string, string> = {
			trigger_label: "Calendar",
			no_travel_date_tooltip:
				"You have not selected a travel date. Please click here to select the travel date.",
		};

		const t = ((key: string) => labels[key] ?? key) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => key in labels;
		return t;
	},
}));

vi.mock("./calendar-modal/calendar-modal", () => ({
	default: ({
		onConfirm,
		onReset,
	}: {
		onConfirm: (departure: Date, returnDate: Date | null, seatType: "standard" | "zip") => void;
		onReset?: () => void;
	}) => (
		<div>
			<button
				type="button"
				onClick={() => onConfirm(new Date("2026-11-01"), new Date("2026-11-12"), "zip")}
			>
				Confirm mock calendar
			</button>
			<button type="button" onClick={() => onReset?.()}>
				Reset mock calendar
			</button>
		</div>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, outline, variant, size, asChild, ...props }: any) => (
		<button {...props}>{children}</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/input", () => ({
	Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@repo/ui/components/item", () => ({
	Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("CalendarModal", () => {
	it("shows round-trip date label and handles confirmation", () => {
		const onChange = vi.fn();
		const onSeatTypeConfirm = vi.fn();

		render(
			<CalendarModal
				tripType="round-trip"
				outboundDate="Jun 24"
				returnDate="Jun 28"
				onChange={onChange}
				origin="NRT"
				destination="BKK"
				onSeatTypeConfirm={onSeatTypeConfirm}
			/>
		);

		expect(screen.getAllByText("6/24 - 6/28")).toHaveLength(2);

		fireEvent.click(screen.getByText("Confirm mock calendar"));

		expect(onSeatTypeConfirm).toHaveBeenCalledWith("zip");
		expect(onChange).toHaveBeenCalledWith({ outboundDate: "2026-11-01", returnDate: "2026-11-12" });
	});

	it("hides return date in one-way label and supports reset callback", () => {
		const onChange = vi.fn();
		const onSeatTypeConfirm = vi.fn();

		render(
			<CalendarModal
				tripType="one-way"
				outboundDate=""
				returnDate=""
				onChange={onChange}
				origin="NRT"
				destination="BKK"
				onSeatTypeConfirm={onSeatTypeConfirm}
			/>
		);

		expect(screen.getByText("Calendar")).toBeDefined();

		fireEvent.click(screen.getByText("Reset mock calendar"));
		expect(onSeatTypeConfirm).toHaveBeenCalledWith("standard");
		expect(onChange).toHaveBeenCalledWith({ outboundDate: "", returnDate: "" });
	});
});
