import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Seat } from "./seat";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: Record<string, string>) => {
		if (key === "aria_labels.seat_number") {
			return `Seat ${values?.code}`;
		}

		if (key === "aria_labels.selected_state") {
			return "selected";
		}

		return key;
	},
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Seat", () => {
	it("renders an interactive selected seat with passenger label", () => {
		const onSelect = vi.fn();

		render(
			<Seat
				seat={{
					code: "20A",
					column: "A",
					type: "Window",
					status: "central",
					isSeatAvailable: true,
					amount: 1000,
					serviceCode: "STOT",
				}}
				selected
				passengerLabel="P1"
				onSelect={onSelect}
			/>
		);

		const button = screen.getByRole("button", { name: "Seat 20A, selected" });
		expect(button.getAttribute("aria-pressed")).toBe("true");
		expect(screen.getByText("P1")).toBeTruthy();

		fireEvent.click(button);
		expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "20A",
			})
		);
	});

	it("renders tooltip content and status icon for selectable seats", () => {
		render(
			<Seat
				seat={{
					code: "18A",
					column: "A",
					type: "Window",
					status: "front-tier",
					isSeatAvailable: true,
					amount: 2000,
					serviceCode: "STFW",
				}}
			/>
		);

		expect(screen.getByRole("button", { name: "Seat 18A" })).toBeTruthy();
		expect(screen.getByText("Seat 18A")).toBeTruthy();
	});

	it("renders non-selectable seats as disabled and does not call onSelect", () => {
		const onSelect = vi.fn();

		render(
			<Seat
				seat={{
					code: "30C",
					column: "C",
					type: "Aisle",
					status: "not-selectable",
					isSeatAvailable: false,
					amount: 0,
					serviceCode: "STNA",
				}}
				onSelect={onSelect}
			/>
		);

		const button = screen.getByRole("button", { name: "Seat 30C" });
		expect(button).toBeDisabled();
		expect(screen.getByText("close")).toBeTruthy();

		fireEvent.click(button);
		expect(onSelect).not.toHaveBeenCalled();
	});
});
