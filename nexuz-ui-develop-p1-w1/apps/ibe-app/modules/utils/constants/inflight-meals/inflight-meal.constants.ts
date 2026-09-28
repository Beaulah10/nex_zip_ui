import type { MealListCategory } from "@/types/customize/inflight-meals/inflight-meals.types";

export const DEFAULT_INFLIGHT_MEAL_CATEGORIES: MealListCategory[] = [
	{
		id: "all",
		label: "All",
		icon: "cooking",
	},
	{
		id: "bundle",
		label: "Bundle",
		icon: "award_meal",
	},
	{
		id: "meals",
		label: "Meals",
		icon: "hand_meal",
	},
	{
		id: "drink",
		label: "Drink",
		icon: "liquor",
	},
	// set and halal sections are not in scope - future
	// { id: "set", label: "Set", icon: "set_meal" },
	// { id: "halal", label: "Halal", icon: "room_service" },
	// { id: "single-item", label: "Single Item", icon: "fork_spoon" },
];
