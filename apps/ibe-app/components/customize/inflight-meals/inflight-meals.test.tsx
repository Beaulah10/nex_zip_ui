import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render-with-providers";
import type { InflightMealPassenger } from "@/types/customize/inflight-meals/inflight-meals.types";
import { InflightMeals } from "./inflight-meals";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => {
		if (key === "outer_validation" && values?.passengers) {
			return `Mandatory passengers: ${values.passengers}`;
		}
		const map: Record<string, string> = {
			title: "In-Flight Meals",
			confirm: "Confirm",
			total_amount_label: "Total Amount",
			add_button: "Add",
			change_button: "Change",
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
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
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
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-header">{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2 data-testid="dialog-title">{children}</h2>
	),
	DialogFooter: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-footer">{children}</div>
	),
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// ---------------------------------------------------------------------------
// Heavy hook mocks — isolate the component from Redux/API complexity
// ---------------------------------------------------------------------------

const mockOnConfirmMeal = vi.fn();
const mockOnRemoveMeal = vi.fn();
const mockHandleConfirmSelection = vi.fn();
const mockHandleDialogOpenChange = vi.fn();

const defaultMealSelectionReturn = {
	mealPrices: {},
	confirmedMealIdsByPassenger: {},
	selectedMealsByPassenger: {},
	stockAwareMealListOptions: [],
	mealListDisplayOptions: [],
	selectedPassengerWarningMessage: undefined,
	mandatoryMealErrorMessage: undefined,
	outerValidationMessage: undefined,
	incompleteMandatoryPassengerNames: [],
	mealTotal: 0,
	onConfirmMeal: mockOnConfirmMeal,
	onRemoveMeal: mockOnRemoveMeal,
	handleConfirmSelection: mockHandleConfirmSelection,
	handleDialogOpenChange: mockHandleDialogOpenChange,
};

const mockUseInflightMealSelection = vi.hoisted(() => vi.fn());

vi.mock(
	"@/modules/hooks/customize/infight-meals/use-inflight-meal-options/use-inflight-meal-options",
	() => ({
		useInflightMealOptions: () => ({
			passengers: [],
			bundleIncludedMealCodesByPassengerId: {},
			mealListOptions: [],
			mealServiceMap: {},
			mealOptionNameById: {},
		}),
	})
);

vi.mock(
	"@/modules/hooks/customize/infight-meals/use-inflight-meal-selection/use-inflight-meal-selection",
	() => ({
		useInflightMealSelection: mockUseInflightMealSelection,
	})
);

beforeEach(() => {
	vi.clearAllMocks();
	mockUseInflightMealSelection.mockImplementation(() => defaultMealSelectionReturn);
});

vi.mock(
	"@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils",
	() => ({
		buildMealDetailsMap: () => ({}),
		extractAdultMeals: () => [],
		extractMealServiceLookup: () => ({}),
		getBundleIncludedMealCodes: () => new Set<string>(),
	})
);

vi.mock("@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils", () => ({
	isPremiumBundleCode: (code: string) => code === "PRMK" || code === "PREN",
	isValueBundleCode: (code: string) => code === "VALK" || code === "VALN",
}));

vi.mock("@/modules/utils/helpers/common/field-focus/field-focus", () => ({
	setFocusOnInvalidInput: vi.fn(),
}));

vi.mock("@/components/common/passenger-service/passenger-service", () => ({
	PassengerService: ({
		name,
		bundleLabelKey,
		totalPrice,
		onAdd,
		onChange,
	}: {
		name: string;
		bundleLabelKey: string;
		totalPrice?: number;
		onAdd?: () => void;
		onChange?: () => void;
	}) => (
		<div data-testid="passenger-service" data-name={name}>
			<span>{name}</span>
			<span data-testid="bundle-label">{bundleLabelKey}</span>
			{totalPrice !== undefined && <span data-testid="total-price">{totalPrice}</span>}
			{onAdd && (
				<button type="button" onClick={onAdd} data-testid="pax-add-btn">
					Add
				</button>
			)}
			{onChange && (
				<button type="button" onClick={onChange} data-testid="pax-change-btn">
					Change
				</button>
			)}
		</div>
	),
}));

vi.mock("@/components/customize/inflight-meals/meal-selection-flow/meal-selection-flow", () => ({
	MealSelectionFlow: ({
		passengerName,
		onBack,
		onConfirm,
		onRemoveMeal,
		warningMessage,
		errorMessage,
	}: {
		passengerName: string;
		onBack?: () => void;
		onConfirm?: (mealId: string, values: object, price: number) => void;
		onRemoveMeal?: (mealId: string) => void;
		warningMessage?: string;
		errorMessage?: string;
	}) => (
		<div data-testid="meal-selection-flow">
			<span data-testid="flow-passenger-name">{passengerName}</span>
			{warningMessage && <p data-testid="flow-warning">{warningMessage}</p>}
			{errorMessage && <p data-testid="flow-error">{errorMessage}</p>}
			<button type="button" onClick={() => onBack?.()} data-testid="flow-back-btn">
				Back
			</button>
			<button
				type="button"
				data-testid="flow-confirm-btn"
				onClick={() => onConfirm?.("meal-1", {}, 1500)}
			>
				Confirm
			</button>
			<button type="button" data-testid="flow-remove-btn" onClick={() => onRemoveMeal?.("meal-1")}>
				Remove
			</button>
		</div>
	),
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => vi.fn(),
	useAppSelector: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

const makePassenger = (overrides?: Partial<InflightMealPassenger>): InflightMealPassenger => ({
	id: "pax-1",
	name: "Alice",
	bundleCode: "VALK",
	bundleLabel: "value_bundle",
	mealfeatures: [],
	isIcnRoute: false,
	isValueBundle: true,
	...overrides,
});

const baseProps = {
	open: true,
	onOpenChange: vi.fn(),
	stageLabel: "Outbound",
	routeLabel: "TYO → OSA",
	direction: "outbound" as const,
	servicePassengers: [makePassenger()],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("InflightMeals", () => {
	describe("dialog rendering", () => {
		it("renders the dialog when open=true", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByTestId("dialog-root")).toBeTruthy();
		});

		it("does not render dialog when open=false", () => {
			renderWithProviders(<InflightMeals {...baseProps} open={false} />);
			expect(screen.queryByTestId("dialog-root")).toBeNull();
		});

		it("renders the dialog title with stageLabel", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByTestId("dialog-title").textContent).toContain("Outbound");
		});

		it("renders the routeLabel subtitle", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByText("TYO → OSA")).toBeTruthy();
		});

		it("renders the total amount label in footer", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByText("Total Amount")).toBeTruthy();
		});
	});

	describe("passenger list view", () => {
		it("renders PassengerService for each servicePassenger", () => {
			const passengers = [
				makePassenger({ id: "pax-1", name: "Alice" }),
				makePassenger({ id: "pax-2", name: "Bob", bundleCode: "PRMK" }),
			];
			renderWithProviders(<InflightMeals {...baseProps} servicePassengers={passengers} />);
			const cards = screen.getAllByTestId("passenger-service");
			expect(cards).toHaveLength(2);
		});

		it("renders passenger name in PassengerService card", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByText("Alice")).toBeTruthy();
		});

		it("renders bundle label key in PassengerService card", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByTestId("bundle-label").textContent).toBe("value_bundle");
		});

		it("does not render MealSelectionFlow when no passenger is selected", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.queryByTestId("meal-selection-flow")).toBeNull();
		});
	});

	describe("selecting a passenger", () => {
		it("renders MealSelectionFlow when passenger Add is clicked", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.getByTestId("meal-selection-flow")).toBeTruthy();
		});

		it("passes passenger name to MealSelectionFlow", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.getByTestId("flow-passenger-name").textContent).toBe("Alice");
		});

		it("hides passenger list when MealSelectionFlow is shown", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.queryByTestId("passenger-service")).toBeNull();
		});

		it("renders back button in header when a passenger is selected", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.getByLabelText("Back")).toBeTruthy();
		});

		it("does not render back button when no passenger is selected", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
		});
	});

	describe("back navigation", () => {
		it("returns to passenger list when flow-back-btn is clicked (onBack)", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			fireEvent.click(screen.getByTestId("flow-back-btn"));
			// Should show passenger list again
			expect(screen.getByTestId("passenger-service")).toBeTruthy();
			expect(screen.queryByTestId("meal-selection-flow")).toBeNull();
		});
	});

	describe("outer validation error alert", () => {
		it("does not render error alert when no outerValidationMessage or incompleteMandatoryPassengerNames", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.queryByTestId("alert-error")).toBeNull();
		});

		it("renders error alert when outerValidationMessage and incompleteMandatoryPassengerNames are set", async () => {
			mockUseInflightMealSelection.mockReturnValue({
				...defaultMealSelectionReturn,
				outerValidationMessage: "outer_validation",
				incompleteMandatoryPassengerNames: ["Alice"],
			});
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByTestId("alert-error")).toBeTruthy();
		});
	});

	describe("footer visibility", () => {
		it("renders the footer when passenger list is shown (not detail step)", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByTestId("dialog-footer")).toBeTruthy();
		});
	});

	describe("onMealSelectionSummaryChange callback", () => {
		it("calls onMealSelectionSummaryChange with 0 when no meals are selected", () => {
			const onMealSelectionSummaryChange = vi.fn();
			renderWithProviders(
				<InflightMeals {...baseProps} onMealSelectionSummaryChange={onMealSelectionSummaryChange} />
			);
			expect(onMealSelectionSummaryChange).toHaveBeenCalledWith(0);
		});

		it("does not throw when onMealSelectionSummaryChange is not provided", () => {
			expect(() => renderWithProviders(<InflightMeals {...baseProps} />)).not.toThrow();
		});

		it("counts only eligible passengers (value/premium bundle) for summary", async () => {
			mockUseInflightMealSelection.mockReturnValue({
				...defaultMealSelectionReturn,
				selectedMealsByPassenger: {
					"pax-1": [{ mealId: "m1", label: "Salmon", price: 1500 }],
				},
			});

			const onMealSelectionSummaryChange = vi.fn();
			const passengers = [makePassenger({ id: "pax-1", name: "Alice", bundleCode: "VALK" })];
			renderWithProviders(
				<InflightMeals
					{...baseProps}
					servicePassengers={passengers}
					onMealSelectionSummaryChange={onMealSelectionSummaryChange}
				/>
			);
			expect(onMealSelectionSummaryChange).toHaveBeenCalledWith(1);
		});

		it("counts only premium bundle passengers on ICN routes", async () => {
			mockUseInflightMealSelection.mockReturnValue({
				...defaultMealSelectionReturn,
				selectedMealsByPassenger: {
					"pax-1": [{ mealId: "m1", label: "Salmon", price: 1500 }],
					"pax-2": [{ mealId: "m2", label: "Tuna", price: 2000 }],
				},
			});

			const onMealSelectionSummaryChange = vi.fn();
			const passengers = [
				makePassenger({ id: "pax-1", name: "Alice", bundleCode: "PRMK", isIcnRoute: true }),
				makePassenger({ id: "pax-2", name: "Bob", bundleCode: "VALK", isIcnRoute: true }),
			];
			renderWithProviders(
				<InflightMeals
					{...baseProps}
					servicePassengers={passengers}
					onMealSelectionSummaryChange={onMealSelectionSummaryChange}
				/>
			);
			// Only PRMK (premium) counts on ICN route
			expect(onMealSelectionSummaryChange).toHaveBeenCalledWith(1);
		});
	});

	describe("meal flow interactions", () => {
		it("calls onConfirmMeal when flow confirm button is clicked", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			fireEvent.click(screen.getByTestId("flow-confirm-btn"));
			expect(mockOnConfirmMeal).toHaveBeenCalled();
		});

		it("calls onRemoveMeal when flow remove button is clicked", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			fireEvent.click(screen.getByTestId("flow-remove-btn"));
			expect(mockOnRemoveMeal).toHaveBeenCalledWith("meal-1");
		});
	});

	describe("warning and error message translation", () => {
		it("passes translated warningMessage to MealSelectionFlow", async () => {
			mockUseInflightMealSelection.mockReturnValue({
				...defaultMealSelectionReturn,
				selectedPassengerWarningMessage: true,
			});
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.getByTestId("flow-warning").textContent).toBe("service_not_included_in_bundle");
		});

		it("passes translated errorMessage to MealSelectionFlow", async () => {
			mockUseInflightMealSelection.mockReturnValue({
				...defaultMealSelectionReturn,
				mandatoryMealErrorMessage: "meal_required_error",
			});
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.getByTestId("flow-error").textContent).toBe("meal_required_error");
		});

		it("does not pass warningMessage when selectedPassengerWarningMessage is undefined", async () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			fireEvent.click(screen.getByTestId("pax-add-btn"));
			expect(screen.queryByTestId("flow-warning")).toBeNull();
		});
	});

	describe("selected meals display in passenger list", () => {
		it("shows total price for a passenger when meals are selected", async () => {
			mockUseInflightMealSelection.mockReturnValue({
				...defaultMealSelectionReturn,
				selectedMealsByPassenger: {
					"pax-1": [{ mealId: "m1", label: "Salmon", price: 1500 }],
				},
				mealPrices: { "pax-1": 1500 },
			});
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.getByTestId("total-price").textContent).toBe("1500");
		});

		it("does not show total price when no meals are selected for passenger", () => {
			renderWithProviders(<InflightMeals {...baseProps} />);
			expect(screen.queryByTestId("total-price")).toBeNull();
		});
	});
});
