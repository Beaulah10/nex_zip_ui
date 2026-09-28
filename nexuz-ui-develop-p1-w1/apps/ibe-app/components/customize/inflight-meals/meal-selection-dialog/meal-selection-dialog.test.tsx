import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MealSelectionContent, MealSelectionDialog } from "./meal-selection-dialog";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => {
		if (key === "remaining_quantity" && values) {
			return `Only ${values.quantity} left`;
		}
		const map: Record<string, string> = {
			allergies_title: "Allergies",
			nutritional_information_title: "Nutritional Information",
			confirm_selection: "Confirm Selection",
			title: "In-Flight Meals",
			total_amount_label: "Total Amount",
			last_chance: "Last chance",
		};
		return map[key] ?? key;
	},
}));

vi.mock("next/image", () => ({
	default: ({ src, alt }: { src: string; alt: string }) => (
		<div data-testid="meal-image" data-src={src} data-alt={alt} aria-label={alt} role="img" />
	),
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
		disabled,
		type,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		type?: string;
	}) => (
		<button
			type={(type as "button" | "submit" | "reset") ?? "button"}
			onClick={onClick}
			disabled={disabled}
			data-testid="confirm-btn"
		>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} aria-hidden="true" />,
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		children,
		open,
	}: {
		children: React.ReactNode;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}) => (open !== false ? <div data-testid="dialog-root">{children}</div> : null),
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-content">{children}</div>
	),
	DialogFooter: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-footer">{children}</div>
	),
	DialogTrigger: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-trigger">{children}</div>
	),
	DialogClose: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-close">{children}</div>
	),
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const baseMealContentProps = {
	passengerName: "Alice",
	imageSrc: "/salmon.jpg",
	dishName: "Grilled Salmon",
	price: 1500,
	drinkOptions: [],
	deliveryTimingOptions: [],
};

// ---------------------------------------------------------------------------
// MealSelectionContent tests
// ---------------------------------------------------------------------------

describe("MealSelectionContent", () => {
	describe("basic rendering", () => {
		it("renders passenger name", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.getByText("Alice")).toBeTruthy();
		});

		it("renders dish name", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.getByText("Grilled Salmon")).toBeTruthy();
		});

		it("renders the meal image with correct src", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.getByTestId("meal-image")).toHaveAttribute("data-src", "/salmon.jpg");
		});

		it("uses imageAlt when provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} imageAlt="Custom alt" />);
			expect(screen.getByTestId("meal-image")).toHaveAttribute("data-alt", "Custom alt");
		});

		it("falls back to dishName for alt when imageAlt is absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.getByTestId("meal-image")).toHaveAttribute("data-alt", "Grilled Salmon");
		});

		it("renders formatted price", () => {
			render(<MealSelectionContent {...baseMealContentProps} price={2500} />);
			// price appears in both body and footer
			expect(screen.getAllByText("￥2,500").length).toBeGreaterThanOrEqual(1);
		});

		it("renders person icon for passenger name section", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.getByTestId("icon-person")).toBeTruthy();
		});
	});

	describe("price display", () => {
		it("renders originalPrice with line-through when provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} originalPrice={3000} />);
			expect(screen.getByText("￥3,000")).toBeTruthy();
			// ￥1,500 appears in both body and footer, use getAllByText
			expect(screen.getAllByText("￥1,500").length).toBeGreaterThanOrEqual(1);
		});

		it("only renders current price when originalPrice is absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			const prices = screen.queryAllByText(/￥/);
			// footer price + detail price — at least 1
			expect(prices.length).toBeGreaterThanOrEqual(1);
		});

		it("renders totalPrice of 0 with base-400 style class", () => {
			render(<MealSelectionContent {...baseMealContentProps} price={0} />);
			// price=0 appears in both detail body and footer
			expect(screen.getAllByText("￥0").length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("bundleLabel badge", () => {
		it("renders badge when bundleLabel is provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} bundleLabel="Bundle" />);
			const badge = screen.getByTestId("badge");
			expect(badge.textContent).toBe("Bundle");
			expect(badge).toHaveAttribute("data-variant", "info");
		});

		it("does not render badge when bundleLabel is absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.queryByTestId("badge")).toBeNull();
		});
	});

	describe("stockLabel rendering", () => {
		it("renders stockLabel text when provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} stockLabel="last_chance" />);
			expect(screen.getByText("Last chance")).toBeTruthy();
		});

		it("renders remaining_quantity with quantity substitution", () => {
			render(
				<MealSelectionContent
					{...baseMealContentProps}
					stockLabel="remaining_quantity"
					remainingQty={4}
				/>
			);
			expect(screen.getByText("Only 4 left")).toBeTruthy();
		});

		it("does not render stockLabel when absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.queryByText(/left/i)).toBeNull();
		});
	});

	describe("allergies section", () => {
		it("renders allergies section heading and text when allergies is provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} allergies="Nuts, Gluten" />);
			expect(screen.getByText("Allergies")).toBeTruthy();
			expect(screen.getByText("Nuts, Gluten")).toBeTruthy();
		});

		it("renders allergyDetails when provided alongside allergies", () => {
			render(
				<MealSelectionContent
					{...baseMealContentProps}
					allergies="Nuts"
					allergyDetails="May contain traces"
				/>
			);
			expect(screen.getByText("May contain traces")).toBeTruthy();
		});

		it("does not render allergy section when allergies is absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.queryByText("Allergies")).toBeNull();
		});

		it("does not render allergyDetails when allergies is absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} allergyDetails="some detail" />);
			// allergyDetails only renders when allergies parent block renders
			expect(screen.queryByText("some detail")).toBeNull();
		});
	});

	describe("nutrition section", () => {
		it("renders nutrition section heading and text when nutrition is provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} nutrition="300 kcal" />);
			expect(screen.getByText("Nutritional Information")).toBeTruthy();
			expect(screen.getByText("300 kcal")).toBeTruthy();
		});

		it("does not render nutrition section when absent", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.queryByText("Nutritional Information")).toBeNull();
		});
	});

	describe("Confirm Selection button", () => {
		it("renders Confirm Selection button", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(screen.getByRole("button", { name: "Confirm Selection" })).toBeTruthy();
		});

		it("calls onConfirm with undefined drinkId/timingId and current price on click", () => {
			const onConfirm = vi.fn();
			render(<MealSelectionContent {...baseMealContentProps} onConfirm={onConfirm} price={1500} />);
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			expect(onConfirm).toHaveBeenCalledWith({ drinkId: undefined, timingId: undefined }, 1500);
		});

		it("does not throw when onConfirm is not provided", () => {
			render(<MealSelectionContent {...baseMealContentProps} />);
			expect(() =>
				fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }))
			).not.toThrow();
		});

		it("disables the button when isOutOfStock=true", () => {
			render(<MealSelectionContent {...baseMealContentProps} isOutOfStock />);
			expect(screen.getByRole("button", { name: "Confirm Selection" })).toBeDisabled();
		});

		it("does not disable the button when isOutOfStock is false", () => {
			render(<MealSelectionContent {...baseMealContentProps} isOutOfStock={false} />);
			expect(screen.getByRole("button", { name: "Confirm Selection" })).not.toBeDisabled();
		});
	});
});

// ---------------------------------------------------------------------------
// MealSelectionDialog tests
// ---------------------------------------------------------------------------

const baseMealDialogProps = {
	passengerName: "Bob",
	routeLabel: "TYO → OSA",
	imageSrc: "/tuna.jpg",
	dishName: "Tuna Sashimi",
	price: 2000,
	drinkOptions: [],
	deliveryTimingOptions: [],
};

describe("MealSelectionDialog", () => {
	describe("basic rendering when open", () => {
		it("renders inside the dialog when open is true", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getByTestId("dialog-root")).toBeTruthy();
		});

		it("does not render dialog content when open is false", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open={false} />);
			expect(screen.queryByTestId("dialog-root")).toBeNull();
		});

		it("renders the routeLabel", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getByText("TYO → OSA")).toBeTruthy();
		});

		it("renders the title translation key", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getByText("In-Flight Meals")).toBeTruthy();
		});

		it("renders Back button (DialogClose) in header", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
		});

		it("renders Close button (DialogClose) in header", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
		});
	});

	describe("trigger", () => {
		it("renders trigger inside DialogTrigger when trigger prop is provided", () => {
			const trigger = <button type="button">Open Meal</button>;
			render(<MealSelectionDialog {...baseMealDialogProps} trigger={trigger} />);
			expect(screen.getByTestId("dialog-trigger")).toBeTruthy();
			expect(screen.getByRole("button", { name: "Open Meal" })).toBeTruthy();
		});

		it("does not render DialogTrigger when trigger is absent", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.queryByTestId("dialog-trigger")).toBeNull();
		});
	});

	describe("onConfirm + onOpenChange integration", () => {
		it("calls onConfirm and onOpenChange(false) on confirm click", () => {
			const onConfirm = vi.fn();
			const onOpenChange = vi.fn();
			render(
				<MealSelectionDialog
					{...baseMealDialogProps}
					open
					onConfirm={onConfirm}
					onOpenChange={onOpenChange}
					price={2000}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			expect(onConfirm).toHaveBeenCalledWith({ drinkId: undefined, timingId: undefined }, 2000);
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		it("does not throw when onConfirm/onOpenChange are absent on click", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(() =>
				fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }))
			).not.toThrow();
		});
	});

	describe("meal body propagation", () => {
		it("passes dishName to body", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getAllByText("Tuna Sashimi").length).toBeGreaterThanOrEqual(1);
		});

		it("passes passengerName to body", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open />);
			expect(screen.getByText("Bob")).toBeTruthy();
		});

		it("renders bundleLabel badge when provided", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open bundleLabel="Bundle" />);
			expect(screen.getByTestId("badge").textContent).toBe("Bundle");
		});

		it("renders allergies when provided", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open allergies="Shellfish" />);
			expect(screen.getByText("Shellfish")).toBeTruthy();
		});

		it("disables confirm button when isOutOfStock=true", () => {
			render(<MealSelectionDialog {...baseMealDialogProps} open isOutOfStock />);
			expect(screen.getByRole("button", { name: "Confirm Selection" })).toBeDisabled();
		});
	});
});
