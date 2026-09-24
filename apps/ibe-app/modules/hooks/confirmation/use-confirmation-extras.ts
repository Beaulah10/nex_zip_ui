import type { useTranslations } from "next-intl";
import type * as React from "react";
import { useState } from "react";
import { getAncillaryOffersErrorCodeFromBoundaryError } from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import {
	type BookingFlowDirection,
	getBookingStageRoute,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import { detectExtrasAvailabilityIssue } from "@/modules/utils/helpers/confirmation/confirmation-extras/confirmation-extras";
import type { AppDispatch } from "@/store";
import { useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
	setAncillaryPrefetched,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import {
	saveConfirmationDisabledFlags,
	selectConfirmationDisabledFlags,
} from "@/store/slices/confirmation/confirmation-disabled-flags.slice";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import { removeExtrasService } from "@/store/slices/passenger/passenger.slice";
import type { ConfirmationExtrasErrorState } from "@/types/confirmation/confirmation.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

type CommonTranslations = ReturnType<typeof useTranslations<"common">>;
type ConfirmationTranslations = ReturnType<typeof useTranslations<"confirmation_page">>;
type AncillaryTranslations = ReturnType<typeof useTranslations<"ancillary_service">>;

type UseConfirmationExtrasParams = {
	dispatch: AppDispatch;
	confirmedFlight: ConfirmedFlightPayload | undefined;
	passengerList: Passenger[];
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	locale: string;
	setIsServiceLoading: React.Dispatch<React.SetStateAction<boolean>>;
	navigate: (path: string) => void;
	commonT: CommonTranslations;
	t: ConfirmationTranslations;
	ancillaryServiceT: AncillaryTranslations;
};

export function useConfirmationExtras({
	dispatch,
	confirmedFlight,
	passengerList,
	storedPassengers,
	orderedPassengerIds,
	locale,
	setIsServiceLoading,
	navigate,
	commonT,
	t,
	ancillaryServiceT,
}: UseConfirmationExtrasParams) {
	const [extrasErrorState, setExtrasErrorState] = useState<ConfirmationExtrasErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "close",
	});
	const persistedDisabledFlags = useAppSelector(selectConfirmationDisabledFlags);
	const disabledExtrasPassengersByDirection = persistedDisabledFlags.extras ?? {};
	const handleExtrasErrorDialogClose = () => {
		setExtrasErrorState((currentState) => ({
			...currentState,
			open: false,
		}));
	};

	const openReturnToTopDialog = () => {
		setExtrasErrorState({
			open: true,
			title: t("error_labels.extras_unavailable_title"),
			content: t("error_labels.extras_unavailable_content"),
			buttonLabel: t("error_labels.extras_unavailable_button") ?? "",
			action: "close",
		});
	};

	const openExtrasReturnToTopServiceUnavailableDialog = () => {
		setExtrasErrorState({
			open: true,
			title: ancillaryServiceT("service_unavailable_title"),
			content: t("error_labels.extras_service_session_unavailable_content"),
			buttonLabel: commonT("go_to_top_page"),
			action: "returnToTop",
			redirectUrl: `/${locale}`,
		});
	};

	const handleExtrasChange = async (passengerId: string, direction: BookingFlowDirection) => {
		const disabledExtrasPassengerIds = disabledExtrasPassengersByDirection?.[direction] ?? [];

		if (disabledExtrasPassengerIds.includes(passengerId)) {
			openReturnToTopDialog();
			return;
		}

		const nextPath = `/${locale}/${getBookingStageRoute({
			section: "extras",
			confirmedFlight,
			direction,
		})}?changeFlow=confirmation`;

		if (!confirmedFlight) {
			navigate(nextPath);
			return;
		}

		setIsServiceLoading(true);
		let shouldNavigate = true;

		try {
			const selectedSegment = getSelectedAncillarySegment({
				confirmedFlight,
				direction,
			});

			if (!selectedSegment) {
				return;
			}

			try {
				const request = buildRetrieveOfferAncillariesRequest({
					confirmedFlight,
					segment: selectedSegment,
					passengers: passengerList,
					serviceCategory: "AMENITIES",
				});

				const scope = getBookingStageSegment({ confirmedFlight, direction });

				const resultAction = await dispatch(
					fetchAncillaryOffers({
						scope,
						request,
					})
				);

				setAncillaryPrefetched(scope, "AMENITIES");

				const removeCurrentSegmentExtras = (
					extrasToRemove: Array<{ passengerId: string; lfid: number; ssrCode: string }>
				) => {
					for (const extraToRemove of extrasToRemove) {
						dispatch(removeExtrasService(extraToRemove));
					}
				};

				if (!fetchAncillaryOffers.fulfilled.match(resultAction)) {
					const errorMessage =
						typeof resultAction.payload === "string"
							? resultAction.payload
							: resultAction.error.message;
					const errorCode = getAncillaryOffersErrorCodeFromBoundaryError(
						errorMessage ? { message: errorMessage } : null
					);

					if (
						errorCode === "NEXUZR004E102" ||
						errorCode === "NEXUZCMNE004" ||
						errorCode === "NEXUZR004E101"
					) {
						const extrasToRemove = storedPassengers.flatMap((passenger) =>
							(passenger.services?.extras ?? [])
								.filter((service) => service.lfid === selectedSegment.lfid)
								.map((service) => ({
									passengerId: passenger.id,
									lfid: service.lfid,
									ssrCode: service.ssrCode,
								}))
						);

						removeCurrentSegmentExtras(extrasToRemove);
						dispatch(
							saveConfirmationDisabledFlags({
								extras: {
									...persistedDisabledFlags.extras,
									[direction]: orderedPassengerIds,
								},
							})
						);
						setExtrasErrorState({
							open: true,
							title: t("error_labels.extras_unavailable_title"),
							content: t("error_labels.extras_unavailable_content"),
							buttonLabel: t("error_labels.extras_unavailable_button"),
							action: "close",
						});
						shouldNavigate = false;
					}

					if (shouldNavigate) {
						shouldNavigate = false;
						openExtrasReturnToTopServiceUnavailableDialog();
					}
					return;
				}

				const hasExtrasInventoryData =
					resultAction.payload.data?.servicesPerPassengerType?.some((entry) =>
						(entry.categories ?? []).some((category) => (category.specialServices ?? []).length > 0)
					) === true;

				if (!hasExtrasInventoryData) {
					shouldNavigate = false;
					openReturnToTopDialog();
					return;
				}

				const issue = detectExtrasAvailabilityIssue({
					ancillaryData: resultAction.payload,
					storedPassengers,
					orderedPassengerIds,
					lfid: selectedSegment.lfid,
				});

				if (issue.type === "noop") {
					return;
				}

				shouldNavigate = false;

				if (issue.type === "bundle-extra-unavailable") {
					setExtrasErrorState({
						open: true,
						title: t("error_labels.extras_bundle_unavailable_title"),
						content: t("error_labels.extras_bundle_unavailable_content"),
						buttonLabel: t("error_labels.extras_bundle_unavailable_button"),
						action: "returnToTop",
						redirectUrl: `/${locale}`,
					});
					return;
				}

				if (issue.type === "all-extras-unavailable") {
					removeCurrentSegmentExtras(issue.extrasToRemove);
					dispatch(
						saveConfirmationDisabledFlags({
							extras: {
								...persistedDisabledFlags.extras,
								[direction]: orderedPassengerIds,
							},
						})
					);
					setExtrasErrorState({
						open: true,
						title: t("error_labels.extras_unavailable_title"),
						content: issue.hasExistingSelections
							? t("error_labels.extras_unavailable_with_selection_content")
							: t("error_labels.extras_unavailable_content"),
						buttonLabel: t("error_labels.extras_unavailable_button"),
						action: "close",
					});
					return;
				}

				removeCurrentSegmentExtras(issue.extrasToRemove);
				const contentSuffix = issue.unavailableExtras
					.map((entry) => `${entry.extraName} : ${entry.passengerName}`)
					.join("\n");
				setExtrasErrorState({
					open: true,
					title: t("error_labels.extras_cancelled_title"),
					content: `${t("error_labels.extras_cancelled_content")}\n\n${contentSuffix}`,
					buttonLabel: t("error_labels.extras_cancelled_button"),
					action: "close",
				});
			} catch {
				shouldNavigate = false;
				openReturnToTopDialog();
			}
		} finally {
			setIsServiceLoading(false);
			if (shouldNavigate) {
				navigate(nextPath);
			}
		}
	};

	return {
		extrasErrorState,
		disabledExtrasPassengersByDirection,
		handleExtrasChange,
		handleExtrasErrorDialogClose,
	};
}
