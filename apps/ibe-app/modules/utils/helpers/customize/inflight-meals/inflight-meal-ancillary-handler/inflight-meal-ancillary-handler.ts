/**
 * File: inflight-meal-ancillary-handler.ts
 * Description: Shared helper for handling successful inflight meal ancillary offers.
 * It centralizes the meal-only validation, stock checks, removal dispatches, and
 * dialog state updates used by the Customize page.
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import type { ErrorDialogAction } from "@/components/common/error-dialog/error-dialog";
import { detectMealAvailabilityIssue } from "@/modules/utils/helpers/confirmation/confirmation-meal/confirmation-meal";
import {
	buildBundleIncludedMealCodesByPassengerId,
	isInflightMealStockLimited,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import type { AppDispatch } from "@/store";
import { removeService } from "@/store/slices/passenger/passenger.slice";
import type { InflightMealPassenger } from "@/types/customize/inflight-meals/inflight-meals.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";
import type { CancelledSeatSelection } from "@/types/seat-map/seat-map.types";

type MealStockLimitedParams = Parameters<typeof isInflightMealStockLimited>[0];

type MealLabelsFn = (key: string) => string;

type OpenErrorDialogFn = (
	title: string,
	content: string,
	seatSelectionsToRemove?: CancelledSeatSelection[],
	buttonLabel?: string,
	action?: ErrorDialogAction
) => void;

export type HandleInflightMealAncillaryOfferParams = {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	bundledMealPassengerCount: number;
	direction: MealStockLimitedParams["direction"];
	confirmedFlight: MealStockLimitedParams["confirmedFlight"];
	servicePassengers: InflightMealPassenger[];
	passengersWithBundles: MealStockLimitedParams["passengersWithBundles"];
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	selectedSegmentLfid: number;
	dispatch: AppDispatch;
	openMealDialog: () => void;
	openErrorDialog: OpenErrorDialogFn;
	markMealOutOfStock: () => void;
	setUnavailableMealPassengerIds: (ids: ReadonlySet<string>) => void;
	setPendingDialogAfterError: (value: "MEAL" | null) => void;
	setCategoryToMarkOutOfStock: (category: "MEAL" | null) => void;
	mealLabels: MealLabelsFn;
};

export function handleInflightMealAncillaryOffer({
	ancillaryData,
	bundledMealPassengerCount,
	direction,
	confirmedFlight,
	servicePassengers,
	passengersWithBundles,
	storedPassengers,
	orderedPassengerIds,
	selectedSegmentLfid,
	dispatch,
	openMealDialog,
	openErrorDialog,
	markMealOutOfStock,
	setUnavailableMealPassengerIds,
	setPendingDialogAfterError,
	setCategoryToMarkOutOfStock,
	mealLabels,
}: HandleInflightMealAncillaryOfferParams): void {
	if (
		isInflightMealStockLimited({
			ancillaryData,
			bundledMealPassengerCount,
			direction,
			confirmedFlight,
			servicePassengers,
			isICNRoute: servicePassengers.some((passenger) => passenger.isIcnRoute),
			passengersWithBundles,
		})
	) {
		setUnavailableMealPassengerIds(new Set());
		openErrorDialog(
			mealLabels("error_labels.bundle_meal_unavailable_title"),
			mealLabels("error_labels.bundle_meal_unavailable_content"),
			[],
			mealLabels("error_labels.bundle_meal_unavailable_button"),
			"returnToTop"
		);
		return;
	}

	const bundleIncludedMealCodesByPassengerId = buildBundleIncludedMealCodesByPassengerId({
		passengers: storedPassengers,
		directionSegmentLfids: new Set([selectedSegmentLfid]),
		servicePassengers,
	});
	const issue = detectMealAvailabilityIssue({
		ancillaryData,
		storedPassengers,
		orderedPassengerIds,
		lfid: selectedSegmentLfid,
		bundleIncludedMealCodesByPassengerId,
	});

	if (issue.type === "bundle-meal-unavailable") {
		setUnavailableMealPassengerIds(new Set());
		openErrorDialog(
			mealLabels("error_labels.bundle_meal_unavailable_title"),
			mealLabels("error_labels.bundle_meal_unavailable_content"),
			[],
			mealLabels("error_labels.bundle_meal_unavailable_button"),
			"returnToTop"
		);
		return;
	}

	if (issue.type === "all-meals-unavailable") {
		if (bundledMealPassengerCount > 0) {
			setUnavailableMealPassengerIds(new Set());
			openErrorDialog(
				mealLabels("error_labels.bundle_meal_unavailable_title"),
				mealLabels("error_labels.bundle_meal_unavailable_content"),
				[],
				mealLabels("error_labels.bundle_meal_unavailable_button"),
				"returnToTop"
			);
			return;
		}

		for (const mealToRemove of issue.mealsToRemove) {
			dispatch(removeService(mealToRemove));
		}
		markMealOutOfStock();
		setUnavailableMealPassengerIds(new Set(servicePassengers.map((passenger) => passenger.id)));
		setCategoryToMarkOutOfStock("MEAL");
		openErrorDialog(
			mealLabels("error_labels.meal_unavailable_title"),
			issue.hasExistingSelections
				? mealLabels("error_labels.proceed_without_meal_message")
				: mealLabels("error_labels.meals_unavailable_proceed_message"),
			[],
			mealLabels("error_labels.meals_unavailable_return_button"),
			"close"
		);
		return;
	}

	if (issue.type === "selected-meal-unavailable") {
		for (const mealToRemove of issue.mealsToRemove) {
			dispatch(removeService(mealToRemove));
		}
		setUnavailableMealPassengerIds(new Set());
		setPendingDialogAfterError("MEAL");
		openErrorDialog(
			mealLabels("error_labels.meal_cancelled_title"),
			`${mealLabels("error_labels.meal_cancelled_content")}\n\n${issue.unavailableMeals
				.map((meal) => `${meal.mealName} : ${meal.passengerName}`)
				.join("\n")}`,
			[],
			mealLabels("error_labels.meal_cancelled_ok_button"),
			"close"
		);
		return;
	}

	if (issue.type === "partial-meals-unavailable") {
		for (const mealToRemove of issue.mealsToRemove) {
			dispatch(removeService(mealToRemove));
		}
		setUnavailableMealPassengerIds(new Set(issue.affectedPassengerIds));
		setPendingDialogAfterError("MEAL");
		openErrorDialog(
			mealLabels("error_labels.meal_unavailable_title"),
			mealLabels("error_labels.proceed_without_meal_message"),
			[],
			mealLabels("error_labels.meals_unavailable_return_button"),
			"close"
		);
		return;
	}

	setUnavailableMealPassengerIds(new Set());
	openMealDialog();
}
