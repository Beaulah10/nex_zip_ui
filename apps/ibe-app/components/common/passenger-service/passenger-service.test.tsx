import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PassengerService } from "./passenger-service";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		const map: Record<string, string> = {
			add_button: "Add",
			change_button: "Change",
			value_bundle: "Value Bundle",
			premium_bundle: "Premium Bundle",
			free_checked_bag: "Free checked bag included",
			meal_included: "Meal included",
		};
		return map[key] ?? key;
	},
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<span data-testid="badge" data-variant={variant}>
			{children}
		</span>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
		type,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: string;
	}) => (
		<button type={(type as "button" | "submit" | "reset") ?? "button"} onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} aria-hidden="true" />,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<div data-testid={`alert-${variant ?? "default"}`} role="alert">
			{children}
		</div>
	),
	AlertDescription: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="alert-description">{children}</div>
	),
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Shared props
// ---------------------------------------------------------------------------

const baseProps = {
	name: "Alice",
	bundleLabelKey: "value_bundle",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PassengerService", () => {
	describe("basic rendering", () => {
		it("renders the passenger name", () => {
			render(<PassengerService {...baseProps} />);
			expect(screen.getByText("Alice")).toBeTruthy();
		});

		it("renders the person icon", () => {
			render(<PassengerService {...baseProps} />);
			expect(screen.getByTestId("icon-person")).toBeTruthy();
		});

		it("renders the bundle label badge", () => {
			render(<PassengerService {...baseProps} />);
			const badge = screen.getByTestId("badge");
			expect(badge.textContent).toBe("Value Bundle");
			expect(badge).toHaveAttribute("data-variant", "info");
		});

		it("renders a different bundleLabelKey correctly", () => {
			render(<PassengerService {...baseProps} bundleLabelKey="premium_bundle" />);
			expect(screen.getByTestId("badge").textContent).toBe("Premium Bundle");
		});

		it("applies custom className to the outer wrapper", () => {
			const { container } = render(<PassengerService {...baseProps} className="custom-class" />);
			expect((container.firstChild as HTMLElement).className).toContain("custom-class");
		});
	});

	describe("unselected state (no totalPrice)", () => {
		it("renders the Add button when totalPrice is undefined", () => {
			render(<PassengerService {...baseProps} />);
			expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
		});

		it("does not render the Change button when unselected", () => {
			render(<PassengerService {...baseProps} />);
			expect(screen.queryByRole("button", { name: "Change" })).toBeNull();
		});

		it("does not render the total price when unselected", () => {
			render(<PassengerService {...baseProps} />);
			expect(screen.queryByText(/￥/)).toBeNull();
		});

		it("does not render the divider line when unselected", () => {
			render(<PassengerService {...baseProps} />);
			// The h-px divider only appears when isSelected
			const dividers = document.querySelectorAll(".h-px").length;
			expect(dividers).toBe(0);
		});

		it("calls onAdd when Add button is clicked", () => {
			const onAdd = vi.fn();
			render(<PassengerService {...baseProps} onAdd={onAdd} />);
			fireEvent.click(screen.getByRole("button", { name: "Add" }));
			expect(onAdd).toHaveBeenCalledTimes(1);
		});

		it("does not throw when onAdd is not provided and Add is clicked", () => {
			render(<PassengerService {...baseProps} />);
			expect(() => fireEvent.click(screen.getByRole("button", { name: "Add" }))).not.toThrow();
		});
	});

	describe("selected state (totalPrice provided)", () => {
		it("renders the Change button when totalPrice is defined", () => {
			render(<PassengerService {...baseProps} totalPrice={1500} />);
			expect(screen.getByRole("button", { name: "Change" })).toBeTruthy();
		});

		it("does not render the Add button when selected", () => {
			render(<PassengerService {...baseProps} totalPrice={1500} />);
			expect(screen.queryByRole("button", { name: "Add" })).toBeNull();
		});

		it("renders the formatted total price", () => {
			render(<PassengerService {...baseProps} totalPrice={1500} />);
			expect(screen.getByText("￥1,500")).toBeTruthy();
		});

		it("renders totalPrice of 0", () => {
			render(<PassengerService {...baseProps} totalPrice={0} />);
			expect(screen.getByText("￥0")).toBeTruthy();
		});

		it("calls onChange when Change button is clicked", () => {
			const onChange = vi.fn();
			render(<PassengerService {...baseProps} totalPrice={1500} onChange={onChange} />);
			fireEvent.click(screen.getByRole("button", { name: "Change" }));
			expect(onChange).toHaveBeenCalledTimes(1);
		});

		it("does not throw when onChange is not provided and Change is clicked", () => {
			render(<PassengerService {...baseProps} totalPrice={1500} />);
			expect(() => fireEvent.click(screen.getByRole("button", { name: "Change" }))).not.toThrow();
		});
	});

	describe("features alert", () => {
		it("renders features inside an info alert when features array is provided", () => {
			render(<PassengerService {...baseProps} features={["free_checked_bag", "meal_included"]} />);
			expect(screen.getByTestId("alert-info")).toBeTruthy();
			expect(screen.getByText("Free checked bag included")).toBeTruthy();
			expect(screen.getByText("Meal included")).toBeTruthy();
		});

		it("does not render the alert when features array is empty", () => {
			render(<PassengerService {...baseProps} features={[]} />);
			expect(screen.queryByTestId("alert-info")).toBeNull();
		});

		it("does not render the alert when features is undefined", () => {
			render(<PassengerService {...baseProps} />);
			expect(screen.queryByTestId("alert-info")).toBeNull();
		});

		it("renders each feature as a translated list item", () => {
			render(<PassengerService {...baseProps} features={["free_checked_bag"]} />);
			const items = screen.getAllByRole("listitem");
			expect(items).toHaveLength(1);
			const firstItem = items[0];
			expect(firstItem).toBeDefined();
			if (!firstItem) {
				return;
			}
			expect(firstItem.textContent).toBe("Free checked bag included");
		});

		it("renders features regardless of selected state", () => {
			render(<PassengerService {...baseProps} totalPrice={1500} features={["free_checked_bag"]} />);
			expect(screen.getByText("Free checked bag included")).toBeTruthy();
		});
	});

	describe("categories (line items)", () => {
		const categories = [
			{
				title: "Meals",
				items: [
					{ label: "Grilled Salmon", price: 1500 },
					{ label: "Beef Steak", price: 2000 },
				],
			},
		];

		it("renders categories when selected and categories are provided", () => {
			render(<PassengerService {...baseProps} totalPrice={3500} categories={categories} />);
			expect(screen.getByText("Grilled Salmon")).toBeTruthy();
			expect(screen.getByText("Beef Steak")).toBeTruthy();
		});

		it("renders formatted price for each line item", () => {
			render(<PassengerService {...baseProps} totalPrice={3500} categories={categories} />);
			expect(screen.getByText("￥1,500")).toBeTruthy();
			expect(screen.getByText("￥2,000")).toBeTruthy();
		});

		it("renders category title when provided", () => {
			render(<PassengerService {...baseProps} totalPrice={3500} categories={categories} />);
			expect(screen.getByText("Meals")).toBeTruthy();
		});

		it("does not render category title when title is omitted", () => {
			const noTitleCategories = [{ items: [{ label: "Salmon", price: 1500 }] }];
			render(<PassengerService {...baseProps} totalPrice={1500} categories={noTitleCategories} />);
			expect(screen.getByText("Salmon")).toBeTruthy();
			// No h4 heading should appear
			expect(document.querySelector("h4")).toBeNull();
		});

		it("does not render categories when not selected (no totalPrice)", () => {
			render(<PassengerService {...baseProps} categories={categories} />);
			expect(screen.queryByText("Grilled Salmon")).toBeNull();
		});

		it("does not render categories when categories array is empty", () => {
			render(<PassengerService {...baseProps} totalPrice={0} categories={[]} />);
			// No item labels from the categories
			expect(screen.queryByText("Grilled Salmon")).toBeNull();
		});

		it("renders multiple categories", () => {
			const multiCategories = [
				{
					title: "Meals",
					items: [{ label: "Salmon", price: 1500 }],
				},
				{
					title: "Drinks",
					items: [{ label: "Orange Juice", price: 500 }],
				},
			];
			render(<PassengerService {...baseProps} totalPrice={2000} categories={multiCategories} />);
			expect(screen.getByText("Meals")).toBeTruthy();
			expect(screen.getByText("Drinks")).toBeTruthy();
			expect(screen.getByText("Salmon")).toBeTruthy();
			expect(screen.getByText("Orange Juice")).toBeTruthy();
		});

		it("renders categories with no title using array index as key (no crash)", () => {
			const noTitleCategories = [
				{ items: [{ label: "Item A", price: 100 }] },
				{ items: [{ label: "Item B", price: 200 }] },
			];
			expect(() =>
				render(<PassengerService {...baseProps} totalPrice={300} categories={noTitleCategories} />)
			).not.toThrow();
			expect(screen.getByText("Item A")).toBeTruthy();
			expect(screen.getByText("Item B")).toBeTruthy();
		});
	});

	describe("divider line", () => {
		it("renders the divider line when selected", () => {
			const { container } = render(<PassengerService {...baseProps} totalPrice={1500} />);
			expect(container.querySelector(".h-px")).toBeTruthy();
		});

		it("does not render the divider line when unselected", () => {
			const { container } = render(<PassengerService {...baseProps} />);
			expect(container.querySelector(".h-px")).toBeNull();
		});
	});
});
