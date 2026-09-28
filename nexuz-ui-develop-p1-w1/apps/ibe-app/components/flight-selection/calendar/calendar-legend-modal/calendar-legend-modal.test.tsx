import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarLegendModal from "./calendar-legend-modal";

const TRANSLATIONS: Record<string, string> = {
	calendar_legend_title: "Legend title",
	calendar_legend_available: "Available seats",
	calendar_legend_promo: "Promo seats",
	calendar_legend_alt_seat: "Alternate seat types",
	calendar_legend_unavailable: "Unavailable seats",
	calendar_legend_past: "Past dates",
	calendar_legend_preview_day: "Day",
	calendar_legend_preview_available_price: "Available price",
	calendar_legend_preview_promo_original_price: "Original price",
	calendar_legend_preview_promo_price: "Promo price",
	calendar_legend_preview_alt_seat_placeholder: "-",
	calendar_close_button_label: "Close legend",
	calendar_legend_close_button_aria_label: "Close calendar legend",
};

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const t = ((key: string) => TRANSLATIONS[key] ?? key) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => key in TRANSLATIONS;
		return t;
	},
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: () => <span>close-icon</span>,
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogClose: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe("CalendarLegendModal", () => {
	it("renders translated legend content and close action", () => {
		const triggerRef = { current: { current: document.createElement("button") } };
		const onClose = vi.fn();

		render(
			<CalendarLegendModal
				isOpen={true}
				onClose={onClose}
				triggerRef={triggerRef}
				promoPrices={{ "2026-07-10": "¥10,000" }}
			/>
		);

		expect(screen.getByText("Legend title")).toBeDefined();
		expect(screen.getByText("Available seats")).toBeDefined();
		expect(screen.getByText("Promo seats")).toBeDefined();
		expect(screen.getByText("Alternate seat types")).toBeDefined();
		expect(screen.getByText("Unavailable seats")).toBeDefined();
		expect(screen.getByText("Past dates")).toBeDefined();
		expect(screen.getAllByText("Day")).toHaveLength(5);
		expect(screen.getByText("Available price")).toBeDefined();
		expect(screen.getByText("Original price")).toBeDefined();
		expect(screen.getByText("Promo price")).toBeDefined();
		expect(screen.getByText("Close legend")).toBeDefined();
		fireEvent.click(screen.getByText("Close legend"));
		expect(onClose).toHaveBeenCalled();
	});

	it("hides promo legend content when promo prices are absent", () => {
		const triggerRef = { current: { current: document.createElement("button") } };

		render(<CalendarLegendModal isOpen={true} onClose={vi.fn()} triggerRef={triggerRef} />);

		expect(screen.queryByText("Promo seats")).toBeNull();
		expect(screen.getAllByText("Day")).toHaveLength(4);
	});
});
