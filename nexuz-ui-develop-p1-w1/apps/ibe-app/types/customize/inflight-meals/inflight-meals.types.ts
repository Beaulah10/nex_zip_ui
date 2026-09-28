import type { ReactNode, RefObject } from "react";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";

/**
 * Represents a single meal item available for selection in the inflight meal list.
 * Used to populate the meal grid and pass meal data between dialog components.
 */
export interface MealListOption {
	id: string;
	name: string;
	imageSrc: string;
	imageAlt?: string;
	isHalal?: boolean;
	hasDrink?: boolean;
	bundleLabel?: string;
	price: number;
	originalPrice?: number;
	qtyAvailable: number;
	remainingQty: number;
	stockLabel?: string;
	isOutOfStock?: boolean;
	/** Category id used to filter via the category chips, e.g. "bundle" | "meals" | "drink" | "set" | "halal" | "single-item". */
	category?: string;
}

/**
 * Defines a filterable category chip displayed in the meal list header.
 * Used to group and filter available meals by type (e.g., Halal, Bundle, Drink).
 */
export interface MealListCategory {
	id: string;
	label: string;
	icon: string;
}

/**
 * Props for the MealListDialog component that renders a searchable grid of meal options for a passenger.
 * Controls the open state, available meals, selected state, and category filters.
 */
export interface MealListDialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	passengerName: string;
	routeLabel: string;
	/** Shown as a warning alert above the passenger header, e.g. an extra-charge notice. */
	warningMessage?: string;
	/** Allergen disclaimer shown under the passenger name. */
	allergyNote?: string;
	categories?: MealListCategory[];
	meals: MealListOption[];
	/** IDs of meals already chosen for this passenger; rendered with the "Selected" button state. */
	selectedMealIds?: string[];
	onSelectMeal?: (meal: MealListOption) => void;
	/** Called when user clicks an already-selected meal to remove it. */
	onRemoveMeal?: (mealId: string) => void;
	trigger?: ReactNode;
}

/**
 * Represents a selectable add-on option (e.g., drink or delivery timing) within the meal detail dialog.
 * Each option carries its own price for accurate total calculation.
 */
export interface MealSelectionOption {
	id: string;
	label: string;
	originalPrice?: number;
	price: number;
}

/**
 * Props passed to the meal detail content body, describing the selected dish and available customisations.
 * Used by both the standalone dialog and the embedded content view inside MealSelectionFlow.
 */
export interface MealSelectionContentProps {
	passengerName: string;
	imageSrc: string;
	imageAlt?: string;
	dishName: string;
	/** Show bundle extra-charge warning when a bundle-entitled passenger selects a chargeable meal. */
	showBundleChargeWarning?: boolean;
	bundleLabel?: string;
	originalPrice?: number;
	price: number;
	remainingQty?: number;
	stockLabel?: string;
	isOutOfStock?: boolean;
	allergies?: string;
	allergyDetails?: string;
	nutrition?: string;
	drinkNote?: string;
	drinkOptions: MealSelectionOption[];
	deliveryTimingOptions: MealSelectionOption[];
	defaultDrinkId?: string;
	defaultTimingId?: string;
	onConfirm?: (
		values: { drinkId?: string; timingId?: string },
		totalPrice: number
	) => false | undefined;
}

/**
 * Props for MealSelectionDialog that wraps the meal detail content in a modal with route info and an optional trigger.
 * Extends MealSelectionContentProps to include dialog-level open state and route labelling.
 */
export interface MealSelectionDialogProps extends MealSelectionContentProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	routeLabel: string;
	trigger?: ReactNode;
}

/**
 * Props for the MealCard component that renders a single meal thumbnail with name, price, and action button.
 * Controls visual state (selected, disabled, halal badge) and an optional inline meal detail dialog.
 */
export interface MealCardProps {
	imageSrc: string;
	imageAlt?: string;
	dishName: string;
	isHalal?: boolean;
	hasDrink?: boolean;
	bundleLabel?: string;
	originalPrice?: number;
	price: number;
	remainingQty?: number;
	stockLabel?: string;
	disabled?: boolean;
	/** Renders the card in its chosen state: filled "Selected" button and a highlighted border. */
	selected?: boolean;
	onAdd?: () => void;
	className?: string;
	/** When true, clicking anywhere on the card triggers add/select and hides the Add button. */
	openOnCardClick?: boolean;
	/** Renders the Add button as the trigger for the meal selection modal. */
	mealDialog?: Omit<MealSelectionDialogProps, "trigger">;
}

/**
 * Props for the MealSelectionFlow orchestrator that manages navigation between the meal list and detail steps.
 * Renders as embedded content within a parent dialog.
 */
export interface MealSelectionFlowProps {
	passengerName: string;
	/** Indicates whether the selected passenger has bundle-included meal entitlement. */
	hasBundleIncludedMeal?: boolean;
	/** Shown as a warning alert above the passenger header in the meal list dialog. */
	warningMessage?: string;
	/** Shown as an error alert above the passenger header in the meal list dialog. Used to enforce mandatory meal selection for Value/Premium bundle passengers. */
	errorMessage?: string;
	/** Allergen disclaimer shown under the passenger name in the meal list dialog. */
	allergyNote?: string;
	categories?: MealListCategory[];
	meals: MealListOption[];
	/** Map meal IDs to their detail configuration (for the detail dialog). */
	mealDetailsMap: Record<
		string,
		Omit<MealSelectionDialogProps, "trigger" | "open" | "onOpenChange">
	>;
	onConfirm?: (
		mealId: string,
		values: { drinkId?: string; timingId?: string },
		totalPrice: number
	) => false | undefined;
	/** Called when navigating back past the first step (e.g. to a parent passenger list). */
	onBack?: () => void;
	/** Reports whether the meal list or the meal detail step is currently shown, so a parent footer can hide while the detail step renders its own. */
	onStepChange?: (step: "list" | "detail") => void;
	/** Optional selected meal IDs supplied by parent so selected state can persist across unmount/remount cycles. */
	initialConfirmedMealIds?: string[];
	/** Called when a user clicks on an already-selected meal to remove/unselect it. */
	onRemoveMeal?: (mealId: string) => void;
}

/**
 * Imperative handle exposed by MealSelectionFlow so a parent-owned header can drive back navigation.
 * Used via React.forwardRef and useImperativeHandle to enable external goBack control.
 */
export interface MealSelectionFlowHandle {
	goBack: () => void;
}

/**
 * Represents a passenger eligible for meal selection, including their bundle label and included features.
 * Used to render the passenger list inside InflightMealsDialog.
 */
export type InflightMealPassenger = {
	id: string;
	name: string;
	bundleCode: string;
	bundleLabel: string;
	mealfeatures: string[];
	isIcnRoute: boolean;
	isValueBundle: boolean;
};

/**
 * Tracks a confirmed meal line item for a passenger, including its display label and price.
 * Used to build the per-passenger summary and compute meal totals in InflightMealsDialog.
 */
export type SelectedMealLineItem = {
	mealId: string;
	label: string;
	price: number;
};

/**
 * Props for the top-level InflightMealsDialog that manages per-passenger meal selection state and navigation.
 * Connects Redux passenger/ancillary data with the MealSelectionFlow sub-components.
 */
export interface InflightMealsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	triggerRef?: RefObject<HTMLButtonElement | null>;
	stageLabel: string;
	routeLabel: string;
	direction: BookingFlowDirection;
	servicePassengers: InflightMealPassenger[];
	unavailablePassengerIds?: ReadonlySet<string>;
	onMealSelectionSummaryChange?: (selectedEligiblePassengerCount: number) => void;
	initialSelectedMealPassengerId?: string;
	hideHeaderBackButtonOnMealList?: boolean;
	closeOnMealConfirm?: boolean;
}
