/**
 * File: use-confirmation-bundle-change.ts
 * Description: Manages confirmation-page bundle change flow including bundle
 * availability fetches, no-bundle persistence, disable state, and dialog state.
 */

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import {
	getAvailableBundleIds,
	getBundleCapacities,
	getBundleSegment,
	isAllBundlesUnavailable,
} from "@/modules/utils/helpers/bundle/bundle.helpers";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import {
	buildBundleSelectionUnavailableDialogState,
	buildConfirmationBundleChangePath,
	buildNoBundleSelectionState,
	buildNoBundlesAvailableDialogState,
	getBundleDirectionDisabled,
	hasInvalidConfirmationBundleSelection,
	isNoBundlesAvailableErrorCode,
} from "@/modules/utils/helpers/confirmation/confirmation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferBundlesRequest,
	fetchBundleOffers,
	setSelectedBundles,
} from "@/store/slices/bundle-offers/bundle-offers.slice";
import {
	saveConfirmationDisabledFlags,
	selectConfirmationDisabledFlags,
} from "@/store/slices/confirmation/confirmation-disabled-flags.slice";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	clearSeatsForPassengers,
	clearServicesForPassengers,
	selectPassengers,
	setBundles,
} from "@/store/slices/passenger/passenger.slice";
import type { ConfirmationBundleErrorState } from "@/types/confirmation/confirmation.types";

type UseConfirmationBundleChangeArgs = {
	setIsServiceLoading: Dispatch<SetStateAction<boolean>>;
};

type UseConfirmationBundleChangeResult = {
	bundleErrorState: ConfirmationBundleErrorState;
	disabledBundleDirections: Partial<Record<BookingFlowDirection, boolean>>;
	handleBundleChange: (direction: BookingFlowDirection) => Promise<void>;
	handleBundleErrorOpenChange: (open: boolean) => void;
	handleBundleErrorReturnToTop: () => void;
};

export function useConfirmationBundleChange({
	setIsServiceLoading,
}: UseConfirmationBundleChangeArgs): UseConfirmationBundleChangeResult {
	const t = useTranslations("confirmation_page");
	const dispatch = useAppDispatch();
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const passengerList = useAppSelector(selectPassengerList);
	const storedPassengers = useAppSelector(selectPassengers);
	const router = useRouter();
	const locale = useLocale();
	const [bundleErrorState, setBundleErrorState] = useState<ConfirmationBundleErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "returnToTop",
	});
	const persistedDisabledFlags = useAppSelector(selectConfirmationDisabledFlags);
	const disabledBundleDirections = persistedDisabledFlags.bundle ?? {};

	const noBundlesAvailableDialogLabels = useMemo(
		() => ({
			title: t("bundle_no_bundles_available_title"),
			content: t("bundle_no_bundles_available_description"),
			buttonLabel: t("bundle_no_bundles_available_button"),
		}),
		[t]
	);
	const bundleSelectionUnavailableDialogLabels = useMemo(
		() => ({
			title: t("bundle_selection_unavailable_title"),
			content: t("bundle_selection_unavailable_description"),
			buttonLabel: t("bundle_selection_unavailable_button"),
		}),
		[t]
	);

	const openNoBundlesAvailableDialog = () => {
		setBundleErrorState(buildNoBundlesAvailableDialogState(noBundlesAvailableDialogLabels));
	};

	const openBundleSelectionUnavailableDialog = () => {
		setBundleErrorState(
			buildBundleSelectionUnavailableDialogState(
				bundleSelectionUnavailableDialogLabels,
				`/${locale}`
			)
		);
	};

	const persistNoBundleSelectionForDirection = (direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		const segment = getBundleSegment(confirmedFlight, direction);
		if (!segment) {
			return;
		}

		const passengerIds = passengerList.map((passenger) => passenger.id);
		const { selections, bundlesByPassenger } = buildNoBundleSelectionState({
			passengerIds,
			lfid: segment.lfid,
			pfid: segment.pfid,
		});

		dispatch(clearSeatsForPassengers({ passengerIds, lfid: segment.lfid }));
		dispatch(clearServicesForPassengers({ passengerIds, lfid: segment.lfid }));
		dispatch(
			setSelectedBundles({
				lfid: segment.lfid,
				selections,
			})
		);

		for (const { passengerId, bundles } of bundlesByPassenger) {
			dispatch(
				setBundles({
					passengerId,
					lfid: segment.lfid,
					bundles,
				})
			);
		}
	};

	const handleBundleChange = async (direction: BookingFlowDirection) => {
		if (
			!confirmedFlight ||
			passengerList.length === 0 ||
			getBundleDirectionDisabled(disabledBundleDirections, direction)
		) {
			return;
		}

		let request: ReturnType<typeof buildRetrieveOfferBundlesRequest>;

		try {
			request = buildRetrieveOfferBundlesRequest({
				confirmedFlight,
				passengers: passengerList,
			});
		} catch {
			openBundleSelectionUnavailableDialog();
			return;
		}

		setIsServiceLoading(true);

		try {
			const resultAction = await dispatch(fetchBundleOffers({ locale, request }));

			if (fetchBundleOffers.rejected.match(resultAction)) {
				const errorCode = resultAction.payload?.code?.toUpperCase() ?? "";

				if (isNoBundlesAvailableErrorCode(errorCode)) {
					persistNoBundleSelectionForDirection(direction);
					dispatch(
						saveConfirmationDisabledFlags({
							bundle: {
								...persistedDisabledFlags.bundle,
								[direction]: true,
							},
						})
					);
					openNoBundlesAvailableDialog();
					return;
				}

				openBundleSelectionUnavailableDialog();
				return;
			}

			const offersData = resultAction.payload;
			const availableBundleIds = getAvailableBundleIds(offersData, confirmedFlight, direction);
			const bundleCapacities = getBundleCapacities(offersData, confirmedFlight, direction);
			const segment = getBundleSegment(confirmedFlight, direction);

			if (!segment) {
				openBundleSelectionUnavailableDialog();
				return;
			}

			if (isAllBundlesUnavailable(offersData, availableBundleIds)) {
				persistNoBundleSelectionForDirection(direction);
				dispatch(
					saveConfirmationDisabledFlags({
						bundle: {
							...persistedDisabledFlags.bundle,
							[direction]: true,
						},
					})
				);
				openNoBundlesAvailableDialog();
				return;
			}

			if (
				hasInvalidConfirmationBundleSelection({
					storedPassengers,
					segmentLfid: segment.lfid,
					availableBundleIds,
					bundleCapacities,
				})
			) {
				openBundleSelectionUnavailableDialog();
				return;
			}

			const stage = getBookingStageSegment({ confirmedFlight, direction });
			router.push(buildConfirmationBundleChangePath({ locale, stage }));
		} finally {
			setIsServiceLoading(false);
		}
	};

	const handleBundleErrorOpenChange = (open: boolean) => {
		setBundleErrorState((currentState) => ({ ...currentState, open }));
	};

	const handleBundleErrorReturnToTop = () => {
		setBundleErrorState((currentState) => ({ ...currentState, open: false }));
	};

	return {
		bundleErrorState,
		disabledBundleDirections,
		handleBundleChange,
		handleBundleErrorOpenChange,
		handleBundleErrorReturnToTop,
	};
}
