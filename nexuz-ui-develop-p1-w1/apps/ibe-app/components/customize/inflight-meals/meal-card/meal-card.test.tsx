import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MealCard } from "./meal-card";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => {
		if (key === "remaining_quantity" && values) {
			return `Only ${values.quantity} left`;
		}
		const map: Record<string, string> = {
			out_of_stock: "Out of stock",
			selected: "Selected",
			add: "Add",
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
			data-testid="action-button"
		>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name, className }: { name: string; className?: string }) => (
		<span data-testid={`icon-${name}`} className={className} />
	),
}));

// MealSelectionDialog is used when mealDialog prop is provided
vi.mock(
	"@/components/customize/inflight-meals/meal-selection-dialog/meal-selection-dialog",
	() => ({
		MealSelectionDialog: ({
			trigger,
			dishName,
		}: {
			trigger: React.ReactNode;
			dishName?: string;
		}) => (
			<div data-testid="meal-selection-dialog" data-dish={dishName}>
				{trigger}
			</div>
		),
	})
);

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseProps = {
	imageSrc: "/test-meal.jpg",
	imageAlt: "Test Meal Alt",
	dishName: "Grilled Salmon",
	price: 1500,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MealCard", () => {
	describe("basic rendering", () => {
		it("renders the dish name", () => {
			render(<MealCard {...baseProps} />);
			expect(screen.getByText("Grilled Salmon")).toBeTruthy();
		});

		it("renders the meal image with the given src and alt", () => {
			render(<MealCard {...baseProps} />);
			const img = screen.getByTestId("meal-image");
			expect(img).toHaveAttribute("data-src", "/test-meal.jpg");
			expect(img).toHaveAttribute("data-alt", "Test Meal Alt");
		});

		it("falls back to dishName for alt when imageAlt is omitted", () => {
			render(<MealCard {...baseProps} imageAlt={undefined} />);
			expect(screen.getByTestId("meal-image")).toHaveAttribute("data-alt", "Grilled Salmon");
		});

		it("renders the formatted price", () => {
			render(<MealCard {...baseProps} />);
			// formatPrice(1500) → "￥1,500"
			expect(screen.getByText("￥1,500")).toBeTruthy();
		});

		it("renders as a div (non-clickable) by default", () => {
			const { container } = render(<MealCard {...baseProps} />);
			// The outer wrapper should be a div, not a button
			expect(container.firstChild?.nodeName).toBe("DIV");
		});
	});

	describe("Add button states", () => {
		it('shows "Add" button when not selected and not disabled', () => {
			render(<MealCard {...baseProps} />);
			expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
		});

		it('shows "Selected" button when selected=true', () => {
			render(<MealCard {...baseProps} selected />);
			expect(screen.getByRole("button", { name: "Selected" })).toBeTruthy();
		});

		it("does not render any action button when disabled=true", () => {
			render(<MealCard {...baseProps} disabled />);
			// The button block is guarded by !disabled — no button should appear
			expect(screen.queryByRole("button")).toBeNull();
		});

		it("button is enabled when disabled is false", () => {
			render(<MealCard {...baseProps} disabled={false} />);
			expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
		});

		it("calls onAdd when Add button is clicked", () => {
			const onAdd = vi.fn();
			render(<MealCard {...baseProps} onAdd={onAdd} />);
			fireEvent.click(screen.getByRole("button", { name: "Add" }));
			expect(onAdd).toHaveBeenCalledTimes(1);
		});

		it("does not call onAdd when card is disabled (no button rendered)", () => {
			const onAdd = vi.fn();
			render(<MealCard {...baseProps} disabled onAdd={onAdd} />);
			// Button is not rendered at all when disabled — onAdd can never fire
			expect(screen.queryByRole("button")).toBeNull();
			expect(onAdd).not.toHaveBeenCalled();
		});
	});

	describe("price rendering", () => {
		it("renders originalPrice with strikethrough when provided", () => {
			render(<MealCard {...baseProps} originalPrice={2000} />);
			expect(screen.getByText("￥2,000")).toBeTruthy();
			expect(screen.getByText("￥1,500")).toBeTruthy();
		});

		it("does not render originalPrice when not provided", () => {
			render(<MealCard {...baseProps} />);
			// Only one price element should appear
			const prices = screen.queryAllByText(/￥/);
			expect(prices).toHaveLength(1);
		});

		it("hides prices section when disabled=true", () => {
			render(<MealCard {...baseProps} disabled price={1500} />);
			// Price spans are inside !disabled guard
			expect(screen.queryByText("￥1,500")).toBeNull();
		});
	});

	describe("bundleLabel badge", () => {
		it("renders badge when bundleLabel is provided", () => {
			render(<MealCard {...baseProps} bundleLabel="Bundle" />);
			const badge = screen.getByTestId("badge");
			expect(badge).toBeTruthy();
			expect(badge).toHaveAttribute("data-variant", "info");
			expect(badge.textContent).toBe("Bundle");
		});

		it("does not render badge when bundleLabel is absent", () => {
			render(<MealCard {...baseProps} />);
			expect(screen.queryByTestId("badge")).toBeNull();
		});
	});

	describe("stockLabel rendering", () => {
		it("renders stockLabel when disabled=true and stockLabel provided", () => {
			render(<MealCard {...baseProps} disabled stockLabel="last_chance" />);
			expect(screen.getByText("last_chance")).toBeTruthy();
		});

		it("renders remaining_quantity with quantity substitution when disabled=true", () => {
			render(<MealCard {...baseProps} disabled stockLabel="remaining_quantity" remainingQty={3} />);
			expect(screen.getByText("Only 3 left")).toBeTruthy();
		});

		it("renders stockLabel below price when not disabled", () => {
			render(<MealCard {...baseProps} stockLabel="limited_time" />);
			expect(screen.getByText("limited_time")).toBeTruthy();
		});

		it("renders remaining_quantity without disabling the card (low stock but available)", () => {
			render(<MealCard {...baseProps} stockLabel="remaining_quantity" remainingQty={2} />);
			expect(screen.getByText("Only 2 left")).toBeTruthy();
			expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
		});
	});

	describe("selected state visual", () => {
		it("renders the check icon overlay when selected", () => {
			render(<MealCard {...baseProps} selected />);
			expect(screen.getByTestId("icon-check")).toBeTruthy();
		});

		it("does not render check icon when not selected", () => {
			render(<MealCard {...baseProps} />);
			expect(screen.queryByTestId("icon-check")).toBeNull();
		});
	});

	describe("openOnCardClick mode", () => {
		it("renders as a button when openOnCardClick=true and onAdd is provided", () => {
			const onAdd = vi.fn();
			const { container } = render(<MealCard {...baseProps} openOnCardClick onAdd={onAdd} />);
			// The outer wrapper should now be a <button>
			expect(container.firstChild?.nodeName).toBe("BUTTON");
		});

		it("calls onAdd when the card-button is clicked in openOnCardClick mode", () => {
			const onAdd = vi.fn();
			const { container } = render(<MealCard {...baseProps} openOnCardClick onAdd={onAdd} />);
			fireEvent.click(container.firstChild as HTMLElement);
			expect(onAdd).toHaveBeenCalledTimes(1);
		});

		it("does NOT render the inner Add button in openOnCardClick mode", () => {
			const onAdd = vi.fn();
			render(<MealCard {...baseProps} openOnCardClick onAdd={onAdd} />);
			// There should be no separate Add button inside
			expect(screen.queryByRole("button", { name: "Add" })).toBeNull();
		});

		it("renders as div (not button) when openOnCardClick=true but disabled", () => {
			const onAdd = vi.fn();
			const { container } = render(
				<MealCard {...baseProps} openOnCardClick onAdd={onAdd} disabled />
			);
			// disabled cards fall through to the div branch
			expect(container.firstChild?.nodeName).toBe("DIV");
		});

		it("renders as div when openOnCardClick=true but onAdd is absent", () => {
			const { container } = render(<MealCard {...baseProps} openOnCardClick />);
			expect(container.firstChild?.nodeName).toBe("DIV");
		});
	});

	describe("mealDialog prop", () => {
		const mealDialogProps = {
			passengerName: "John Doe",
			routeLabel: "TYO → OSA",
			imageSrc: "/test-meal.jpg",
			dishName: "Salmon",
			price: 1500,
			drinkOptions: [],
			deliveryTimingOptions: [],
			onConfirm: vi.fn(),
		};

		it("renders MealSelectionDialog when mealDialog is provided (not openOnCardClick)", () => {
			render(<MealCard {...baseProps} mealDialog={mealDialogProps} />);
			expect(screen.getByTestId("meal-selection-dialog")).toBeTruthy();
		});

		it("does NOT render MealSelectionDialog when openOnCardClick + onAdd are both set", () => {
			const onAdd = vi.fn();
			render(
				<MealCard {...baseProps} openOnCardClick onAdd={onAdd} mealDialog={mealDialogProps} />
			);
			expect(screen.queryByTestId("meal-selection-dialog")).toBeNull();
		});

		it("does NOT render MealSelectionDialog when card is disabled", () => {
			render(<MealCard {...baseProps} disabled mealDialog={mealDialogProps} />);
			expect(screen.queryByTestId("meal-selection-dialog")).toBeNull();
		});

		it("renders plain Add button when mealDialog is not provided and not openOnCardClick", () => {
			render(<MealCard {...baseProps} />);
			expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
			expect(screen.queryByTestId("meal-selection-dialog")).toBeNull();
		});
	});

	describe("className prop", () => {
		it("applies custom className to the outer wrapper", () => {
			const { container } = render(<MealCard {...baseProps} className="my-custom-class" />);
			expect((container.firstChild as HTMLElement).className).toContain("my-custom-class");
		});
	});
});
