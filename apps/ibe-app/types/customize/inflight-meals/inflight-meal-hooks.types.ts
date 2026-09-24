import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { extractMealServiceLookup } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import type { AppDispatch } from "@/store";
import type { PassengerValues } from "@/store/slices/passenger/passenger.slice";
import type {
	InflightMealPassenger,
	MealListOption,
	SelectedMealLineItem,
} from "@/types/customize/inflight-meals/inflight-meals.types";

export type MealServiceMap = ReturnType<typeof extractMealServiceLookup>;

export interface UseInflightMealOptionsParams {
	direction: BookingFlowDirection;
	selectedMealPassengerId: string | null;
	servicePassengers: InflightMealPassenger[];
}

export interface UseInflightMealStockParams {
	passengers: PassengerValues[];
	mealListOptions: MealListOption[];
	mealServiceMap: MealServiceMap;
	pendingRemovalsByPassenger: Record<string, string[]>;
	confirmedMealIdsByPassenger: Record<string, string[]>;
	selectedMealPassengerId: string | null;
}

export interface UseInflightMealValidationParams {
	selectedMealPassengerId: string | null;
	servicePassengers: InflightMealPassenger[];
	unavailablePassengerIds?: ReadonlySet<string>;
	selectedMealsByPassenger: Record<string, SelectedMealLineItem[]>;
	confirmedMealIdsByPassenger: Record<string, string[]>;
	pendingRemovalsByPassenger: Record<string, string[]>;
	bundleIncludedMealCodesByPassengerId: Record<string, ReadonlySet<string>>;
	mealServiceMap: MealServiceMap;
}

export interface UseInflightMealSelectionParams {
	open: boolean;
	servicePassengers: InflightMealPassenger[];
	unavailablePassengerIds?: ReadonlySet<string>;
	onOpenChange: (open: boolean) => void;
	closeOnMealConfirm?: boolean;
	selectedMealPassengerId: string | null;
	setSelectedMealPassengerId: (id: string | null) => void;
	mealFlowStep: "list" | "detail";
	setMealFlowStep: (step: "list" | "detail") => void;
	passengers: PassengerValues[];
	bundleIncludedMealCodesByPassengerId: Record<string, ReadonlySet<string>>;
	mealListOptions: MealListOption[];
	mealServiceMap: MealServiceMap;
	mealOptionNameById: Record<string, string>;
	dispatch: AppDispatch;
}

export interface UseInflightMealHydrationParams {
	open: boolean;
	servicePassengers: InflightMealPassenger[];
	passengers: PassengerValues[];
	mealOptionNameById: Record<string, string>;
	bundleIncludedMealCodesByPassengerId: Record<string, ReadonlySet<string>>;
	mealServiceMap: MealServiceMap;
	setConfirmedMealIdsByPassenger: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
	setSelectedMealsByPassenger: React.Dispatch<
		React.SetStateAction<Record<string, SelectedMealLineItem[]>>
	>;
	setMealPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
	setPendingRemovalsByPassenger: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
	hasHydratedSelectionStateRef: React.RefObject<boolean>;
}
