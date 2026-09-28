import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BundleOption } from "@/types/bundle/bundle.types";
import { BundleRadioCell, PassengerCell } from "./bundle-table-cells";

type RadioGroupMockProps = {
	onValueChange?: (value: string) => void;
	[key: string]: unknown;
};

const radioGroupCalls = vi.hoisted(() => [] as Array<RadioGroupMockProps>);

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
		radioGroupCalls.push(props);
		return <div data-testid="radio-group">{children}</div>;
	},
	RadioGroupItem: ({ value, ...props }: { value: string; [key: string]: unknown }) => (
		<button
			data-testid={`radio-item-${value}`}
			data-value={value}
			data-disabled={String(Boolean(props.disabled))}
			{...props}
		/>
	),
}));

vi.mock("@repo/ui/components/table", () => ({
	TableCell: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
		<td {...props}>{children}</td>
	),
}));

describe("bundle-table-cells", () => {
	it("renders passenger icon variants", () => {
		render(<PassengerCell passenger={{ id: "p1", name: "Passenger 1", icon: "person" }} />);
		expect(screen.getByTestId("icon-person")).toBeInTheDocument();
		expect(screen.getByText("Passenger 1")).toBeInTheDocument();
		expect(screen.getByText("Passenger 1").closest("td")).toHaveClass("bg-white");

		render(
			<PassengerCell
				passenger={{ id: "p2", name: "Passenger 2", icon: <span data-testid="custom-icon" /> }}
				invalid
			/>
		);
		expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
		expect(screen.getByText("Passenger 2").closest("td")).toHaveClass("bg-danger-100");
	});

	it("renders bundle radio states and guards disabled clicks", () => {
		const bundle: BundleOption = { id: "FLBF", name: "Flex", description: "Flex" };
		const onSelect = vi.fn();

		const { rerender } = render(
			<BundleRadioCell
				bundle={bundle}
				selected={null}
				onSelect={onSelect}
				disabled={false}
				invalid
				columnHighlighted
			/>
		);

		expect(screen.getByTestId("radio-item-FLBF")).toHaveAttribute("aria-label", "Flex");
		expect(screen.getByTestId("radio-item-FLBF")).toHaveAttribute("aria-invalid", "true");
		screen.getByTestId("radio-item-FLBF").closest("td")?.click();
		expect(onSelect).toHaveBeenCalledWith("FLBF");
		const onValueChange = radioGroupCalls[0]?.onValueChange;
		expect(onValueChange).toBeDefined();
		onValueChange?.("FLBF");
		expect(onSelect).toHaveBeenCalledTimes(2);

		rerender(
			<BundleRadioCell
				bundle={bundle}
				selected="FLBF"
				onSelect={onSelect}
				disabled
				invalid={false}
			/>
		);

		expect(screen.getByTestId("radio-item-FLBF")).toHaveAttribute("data-disabled", "true");
		expect(screen.getByTestId("radio-item-FLBF")).toHaveAttribute("aria-invalid", "false");
		screen.getByTestId("radio-item-FLBF").closest("td")?.click();
		expect(onSelect).toHaveBeenCalledTimes(2);
		expect(screen.getByTestId("radio-item-FLBF").closest("td")).toHaveClass("bg-base-100");

		render(
			<BundleRadioCell
				bundle={bundle}
				selected="VALB"
				onSelect={onSelect}
				disabled={false}
				invalid={false}
				columnHighlighted={false}
			/>
		);

		const radioItems = screen.getAllByTestId("radio-item-FLBF");
		const [, secondRadioItem] = radioItems;
		expect(secondRadioItem).toBeDefined();
		if (!secondRadioItem) {
			throw new Error("expected second radio item");
		}
		expect(secondRadioItem).toHaveAttribute("aria-invalid", "false");
		expect(secondRadioItem).toHaveAttribute("data-disabled", "false");
		expect(secondRadioItem.closest("td")).toHaveClass("bg-white");
	});
});
