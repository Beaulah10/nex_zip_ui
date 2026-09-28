import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
	MealListOption,
	MealSelectionDialogProps,
	MealSelectionFlowHandle,
} from "@/types/customize/inflight-meals/inflight-meals.types";
import { MealSelectionFlow } from "./meal-selection-flow";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		const map: Record<string, string> = {
			choose_by_category: "Choose by Category",
			no_option_available: "No options available",
			default_inflight_meal_allergy_note: "Please inform us of any allergies.",
			add: "Add",
			selected: "Selected",
			out_of_stock: "Out of stock",
			confirm_selection: "Confirm Selection",
			total_amount_label: "Total",
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
		>
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
	AlertTitle: ({ children }: { children: React.ReactNode }) => (
		<p data-testid="alert-title">{children}</p>
	),
	AlertDescription: ({ children }: { children: React.ReactNode }) => (
		<p data-testid="alert-description">{children}</p>
	),
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildMeal = (overrides?: Partial<MealListOption>): MealListOption => ({
	id: "meal-1",
	name: "Grilled Salmon",
	imageSrc: "/salmon.jpg",
	price: 1500,
	qtyAvailable: 5,
	remainingQty: 5,
	...overrides,
});

const buildMealDetailsMap = (
	meal: MealListOption,
	passengerName = "Alice"
): Record<string, Omit<MealSelectionDialogProps, "trigger" | "open" | "onOpenChange">> => ({
	[meal.id]: {
		passengerName,
		imageSrc: meal.imageSrc,
		dishName: meal.name,
		price: meal.price,
		drinkOptions: [],
		deliveryTimingOptions: [],
		routeLabel: "TYO → OSA",
	},
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MealSelectionFlow", () => {
	describe("meal list view (detailOpen = false)", () => {
		it("renders passenger name in the list view", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			expect(screen.getByText("Alice")).toBeTruthy();
		});

		it("renders allergy note text", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			expect(screen.getByText("Please inform us of any allergies.")).toBeTruthy();
		});

		it("renders category chips", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			expect(screen.getByText("Choose by Category")).toBeTruthy();
			// Default categories: All, Bundle, Meals, Drink
			expect(screen.getByText("All")).toBeTruthy();
			expect(screen.getByText("Bundle")).toBeTruthy();
			expect(screen.getByText("Meals")).toBeTruthy();
		});

		it("renders meal card for each meal in the list", () => {
			const meals = [
				buildMeal({ id: "m1", name: "Salmon" }),
				buildMeal({ id: "m2", name: "Tuna" }),
			];
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={meals}
					mealDetailsMap={{
						m1: {
							passengerName: "Alice",
							imageSrc: "/s.jpg",
							dishName: "Salmon",
							price: 1000,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
						m2: {
							passengerName: "Alice",
							imageSrc: "/t.jpg",
							dishName: "Tuna",
							price: 1200,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
					}}
				/>
			);
			expect(screen.getByText("Salmon")).toBeTruthy();
			expect(screen.getByText("Tuna")).toBeTruthy();
		});

		it("renders 'no options available' when meals array is empty", () => {
			render(<MealSelectionFlow passengerName="Alice" meals={[]} mealDetailsMap={{}} />);
			expect(screen.getByText("No options available")).toBeTruthy();
		});

		it("renders warning message alert when warningMessage is provided", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					warningMessage="Extra charge applies"
				/>
			);
			expect(screen.getByTestId("alert-warning")).toBeTruthy();
			expect(screen.getByText("Extra charge applies")).toBeTruthy();
		});

		it("does not render warning alert when warningMessage is absent", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			expect(screen.queryByTestId("alert-warning")).toBeNull();
		});

		it("renders error message alert when errorMessage is provided", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					errorMessage="Meal selection is required"
				/>
			);
			expect(screen.getByTestId("alert-error")).toBeTruthy();
			expect(screen.getByText("Meal selection is required")).toBeTruthy();
		});

		it("does not render error alert when errorMessage is absent", () => {
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			expect(screen.queryByTestId("alert-error")).toBeNull();
		});
	});

	describe("category filtering", () => {
		it("filters to bundle meals when Bundle chip is clicked", () => {
			const meals: MealListOption[] = [
				buildMeal({ id: "m1", name: "Bundle Meal", bundleLabel: "Bundle", category: "meals" }),
				buildMeal({ id: "m2", name: "Regular Meal", category: "meals" }),
			];
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={meals}
					mealDetailsMap={{
						m1: {
							passengerName: "Alice",
							imageSrc: "/b.jpg",
							dishName: "Bundle Meal",
							price: 0,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
						m2: {
							passengerName: "Alice",
							imageSrc: "/r.jpg",
							dishName: "Regular Meal",
							price: 1000,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
					}}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: "Bundle" }));
			expect(screen.getByText("Bundle Meal")).toBeTruthy();
			expect(screen.queryByText("Regular Meal")).toBeNull();
		});

		it("shows no options available when filtering yields empty result", () => {
			const meals: MealListOption[] = [
				buildMeal({ id: "m1", name: "Meal Only", category: "meals" }),
			];
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={meals}
					mealDetailsMap={{
						m1: {
							passengerName: "Alice",
							imageSrc: "/m.jpg",
							dishName: "Meal Only",
							price: 1000,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
					}}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: "Bundle" }));
			expect(screen.getByText("No options available")).toBeTruthy();
		});

		it("filters by category id (meals) when Meals chip clicked", () => {
			const meals: MealListOption[] = [
				buildMeal({ id: "m1", name: "Salmon Meal", category: "meals" }),
				buildMeal({ id: "m2", name: "Orange Juice", category: "drink" }),
			];
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={meals}
					mealDetailsMap={{
						m1: {
							passengerName: "Alice",
							imageSrc: "/s.jpg",
							dishName: "Salmon Meal",
							price: 1000,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
						m2: {
							passengerName: "Alice",
							imageSrc: "/o.jpg",
							dishName: "Orange Juice",
							price: 500,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
					}}
				/>
			);
			fireEvent.click(screen.getByText("Meals"));
			expect(screen.getByText("Salmon Meal")).toBeTruthy();
			expect(screen.queryByText("Orange Juice")).toBeNull();
		});

		it("shows all meals when All chip is clicked after filtering", () => {
			const meals: MealListOption[] = [
				buildMeal({ id: "m1", name: "Salmon Meal", category: "meals" }),
				buildMeal({ id: "m2", name: "Orange Juice", category: "drink" }),
			];
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={meals}
					mealDetailsMap={{
						m1: {
							passengerName: "Alice",
							imageSrc: "/s.jpg",
							dishName: "Salmon Meal",
							price: 1000,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
						m2: {
							passengerName: "Alice",
							imageSrc: "/o.jpg",
							dishName: "Orange Juice",
							price: 500,
							drinkOptions: [],
							deliveryTimingOptions: [],
							routeLabel: "TYO",
						},
					}}
				/>
			);
			fireEvent.click(screen.getByText("Meals"));
			fireEvent.click(screen.getByText("All"));
			expect(screen.getByText("Salmon Meal")).toBeTruthy();
			expect(screen.getByText("Orange Juice")).toBeTruthy();
		});
	});

	describe("meal selection → detail view transition", () => {
		it("switches to detail view when a meal card is clicked (openOnCardClick mode)", () => {
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			// Click the card (rendered as button in openOnCardClick mode)
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			// After click, detail view should show Confirm Selection button
			expect(screen.getByRole("button", { name: "Confirm Selection" })).toBeTruthy();
		});

		it("calls onStepChange('detail') when meal card is clicked", () => {
			const onStepChange = vi.fn();
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onStepChange={onStepChange}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			expect(onStepChange).toHaveBeenCalledWith("detail");
		});
	});

	describe("detail view → confirm meal", () => {
		it("calls onConfirm with meal id, empty values, and price on Confirm Selection click", () => {
			const onConfirm = vi.fn();
			const meal = buildMeal({ id: "m1", name: "Salmon", price: 1500 });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onConfirm={onConfirm}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			expect(onConfirm).toHaveBeenCalledWith(
				"m1",
				{ drinkId: undefined, timingId: undefined },
				1500
			);
		});

		it("calls onBack after confirming a meal selection", () => {
			const onBack = vi.fn();
			const onConfirm = vi.fn();
			const meal = buildMeal({ id: "m1", name: "Salmon", price: 1500 });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onConfirm={onConfirm}
					onBack={onBack}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			expect(onBack).toHaveBeenCalled();
		});

		it("adds confirmed meal id to local state after confirmation", () => {
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			// Confirm meal — id should be added to confirmedMealIds
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			// After confirmation, the list view should not show the detail
			expect(screen.queryByRole("button", { name: "Confirm Selection" })).toBeNull();
		});

		it("does not call onBack when onConfirm returns false", () => {
			const onBack = vi.fn();
			const onConfirm = vi.fn().mockReturnValue(false);
			const meal = buildMeal({ id: "m1", name: "Salmon", price: 1500 });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onConfirm={onConfirm}
					onBack={onBack}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			expect(onBack).not.toHaveBeenCalled();
		});

		it("stays on detail view when onConfirm returns false", () => {
			const onConfirm = vi.fn().mockReturnValue(false);
			const meal = buildMeal({ id: "m1", name: "Salmon", price: 1500 });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onConfirm={onConfirm}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			fireEvent.click(screen.getByRole("button", { name: "Confirm Selection" }));
			// Still on detail
			expect(screen.getByRole("button", { name: "Confirm Selection" })).toBeTruthy();
		});
	});

	describe("remove meal", () => {
		it("calls onRemoveMeal when an already-selected meal card is clicked", () => {
			const onRemoveMeal = vi.fn();
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					initialConfirmedMealIds={["m1"]}
					onRemoveMeal={onRemoveMeal}
				/>
			);
			// Card is selected → click should trigger removal
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			expect(onRemoveMeal).toHaveBeenCalledWith("m1");
		});

		it("removes the meal id from local confirmedMealIds on removal", () => {
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			const { rerender } = render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					initialConfirmedMealIds={["m1"]}
				/>
			);
			// Initially the meal is selected
			const selectedCard = screen.getByRole("button", { name: /Salmon Salmon ￥1,500/ });
			expect(selectedCard.className).toContain("bg-green-50");
			// Click to remove
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			rerender(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					initialConfirmedMealIds={[]}
				/>
			);
			const unselectedCard = screen.getByRole("button", { name: /Salmon Salmon ￥1,500/ });
			expect(unselectedCard.className).toContain("bg-white");
		});
	});

	describe("initialConfirmedMealIds", () => {
		it("marks initially confirmed meals as selected", () => {
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					initialConfirmedMealIds={["m1"]}
				/>
			);
			const mealCard = screen.getByRole("button", { name: /Salmon Salmon ￥1,500/ });
			expect(mealCard.className).toContain("bg-green-50");
			expect(mealCard.className).toContain("border-primary-700");
		});

		it("syncs confirmedMealIds when initialConfirmedMealIds changes", () => {
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			const { rerender } = render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					initialConfirmedMealIds={[]}
				/>
			);
			let mealCard = screen.getByRole("button", { name: /Salmon Salmon ￥1,500/ });
			expect(mealCard.className).toContain("bg-white");
			expect(mealCard.className).toContain("border-base-300");
			rerender(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					initialConfirmedMealIds={["m1"]}
				/>
			);
			mealCard = screen.getByRole("button", { name: /Salmon Salmon ￥1,500/ });
			expect(mealCard.className).toContain("bg-green-50");
			expect(mealCard.className).toContain("border-primary-700");
		});
	});

	describe("imperativeHandle (goBack via ref)", () => {
		it("calls onBack when goBack is invoked and not in detail view", () => {
			const onBack = vi.fn();
			const ref = createRef<MealSelectionFlowHandle>();
			const meal = buildMeal();
			render(
				<MealSelectionFlow
					ref={ref}
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onBack={onBack}
				/>
			);
			ref.current?.goBack();
			expect(onBack).toHaveBeenCalled();
		});

		it("goes back to list view when goBack is called from detail view", () => {
			const ref = createRef<MealSelectionFlowHandle>();
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					ref={ref}
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			// Now in detail view
			expect(screen.getByRole("button", { name: "Confirm Selection" })).toBeTruthy();
			act(() => {
				ref.current?.goBack();
			});
			// Back to list
			expect(screen.queryByRole("button", { name: "Confirm Selection" })).toBeNull();
		});

		it("calls onStepChange('list') after goBack from detail view", () => {
			const onStepChange = vi.fn();
			const ref = createRef<MealSelectionFlowHandle>();
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			render(
				<MealSelectionFlow
					ref={ref}
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					onStepChange={onStepChange}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			onStepChange.mockClear();
			act(() => {
				ref.current?.goBack();
			});
			expect(onStepChange).toHaveBeenCalledWith("list");
		});
	});

	describe("detail view returns null when mealDetailsMap has no entry", () => {
		it("renders null when selected meal has no mealDetailsMap entry", () => {
			// A meal exists in meals list but NOT in mealDetailsMap
			const meal = buildMeal({ id: "m1", name: "Salmon" });
			const { container } = render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={{}} // empty — no details for m1
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /Salmon/i }));
			// With detailOpen=true but no mealDetails, component returns null
			// The meal list content should no longer be visible
			expect(screen.queryByText("Choose by Category")).toBeNull();
			expect(container.firstChild).toBeNull();
		});
	});

	describe("custom categories", () => {
		it("uses provided categories instead of defaults", () => {
			const meal = buildMeal({ id: "m1", name: "Beef Steak", category: "premium" });
			render(
				<MealSelectionFlow
					passengerName="Alice"
					meals={[meal]}
					mealDetailsMap={buildMealDetailsMap(meal)}
					categories={[
						{ id: "all", label: "All Items", icon: "apps" },
						{ id: "premium", label: "Premium", icon: "star" },
					]}
				/>
			);
			expect(screen.getByText("All Items")).toBeTruthy();
			expect(screen.getByText("Premium")).toBeTruthy();
			// Default "Bundle" chip should not appear
			expect(screen.queryByText("Bundle")).toBeNull();
		});
	});
});
