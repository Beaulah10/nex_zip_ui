import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaxModal from "@/components/flight-search/passenger/passenger-modal/passenger-modal";

const { mockGetMessages } = vi.hoisted(() => ({
	mockGetMessages: vi.fn(() => [] as string[]),
}));

vi.mock("@/modules/utils/validations/flight-search", () => ({
	getFlightSearchPassengerMessages: mockGetMessages,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/input-number", () => ({
	InputNumberField: ({
		label,
		value,
		onChange,
	}: {
		label: string;
		value: number;
		onChange: (next: number) => void;
	}) => (
		<button type="button" onClick={() => onChange(value + 1)}>
			{label}
		</button>
	),
}));

vi.mock("@repo/ui/components/item", () => ({
	Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/flight-search/passenger/passenger-info", () => ({
	default: () => <div>Passenger info</div>,
}));

describe("PaxModal", () => {
	beforeEach(() => {
		mockGetMessages.mockReset();
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});

	it("deduplicates errors and auto-scrolls to error section", () => {
		mockGetMessages.mockReturnValue(["Error A", "Error A", "Error B"]);

		render(
			<PaxModal
				open={true}
				origin="NRT"
				destination="YVR"
				onOpenChange={vi.fn()}
				value={{ adult: 1, childA: 0, childB: 0, childC: 0, infant: 0 }}
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByText("Please confirm the number of people below.")).toBeDefined();
		expect(screen.getAllByText("Error A")).toHaveLength(1);
		expect(screen.getAllByText("Error B")).toHaveLength(1);
		expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
	});

	it("applies draft changes on confirm", () => {
		mockGetMessages.mockReturnValue([]);
		const onChange = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<PaxModal
				open={true}
				origin="NRT"
				destination="ICN"
				onOpenChange={onOpenChange}
				value={{ adult: 1, childA: 0, childB: 0, childC: 0, infant: 0 }}
				onChange={onChange}
			/>
		);

		fireEvent.click(screen.getByRole("button", { name: "Adult" }));
		fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));

		expect(onChange).toHaveBeenCalledWith({
			adult: 2,
			childA: 0,
			childB: 0,
			childC: 0,
			infant: 0,
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("keeps confirm enabled but blocks selection when passenger count errors exist", () => {
		mockGetMessages.mockReturnValue(["Passenger count error"]);
		const onChange = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<PaxModal
				open={true}
				origin="NRT"
				destination="ICN"
				onOpenChange={onOpenChange}
				value={{ adult: 1, childA: 0, childB: 0, childC: 0, infant: 0 }}
				onChange={onChange}
			/>
		);

		const confirmButton = screen.getByRole("button", { name: "Confirm Selection" });
		expect(confirmButton.hasAttribute("disabled")).toBe(false);

		fireEvent.click(confirmButton);
		expect(onChange).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
