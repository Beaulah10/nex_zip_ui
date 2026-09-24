import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeatTypeSelector from "./seat-type-selector";

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const translations: Record<string, string> = {
			standard_cabin_label: "Standard",
			zip_full_flat_label: "ZIP Full-Flat",
		};
		const t = ((key: string) => translations[key] ?? key) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => key in translations;
		return t;
	},
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	RadioGroupBorderedItem: ({
		label,
		disabled,
		value,
	}: {
		label: string;
		disabled?: boolean;
		value: string;
	}) => (
		<button type="button" disabled={disabled} data-value={value}>
			{label}
		</button>
	),
}));

vi.mock("@repo/ui/components/select", () => ({
	Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => (
		<button type="button">{children}</button>
	),
	SelectValue: () => <span>value</span>,
	SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectItem: ({
		children,
		disabled,
		value,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		value: string;
	}) => (
		<button type="button" disabled={disabled} data-value={value}>
			{children}
		</button>
	),
}));

describe("SeatTypeSelector", () => {
	it("renders desktop options and disables zip for child", () => {
		render(
			<SeatTypeSelector seatType="standard" onChange={vi.fn()} isChild={true} variant="desktop" />
		);

		const zipButton = screen.getByRole("button", { name: "ZIP Full-Flat" }) as HTMLButtonElement;
		expect(zipButton.disabled).toBe(true);
	});

	it("renders mobile select mode", () => {
		render(
			<SeatTypeSelector seatType="standard" onChange={vi.fn()} isChild={false} variant="mobile" />
		);

		expect(screen.getByText("Seat Type")).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: /value/i }));
	});
});
