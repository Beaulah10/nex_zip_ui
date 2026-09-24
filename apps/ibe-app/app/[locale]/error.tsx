"use client";

import ErrorPage from "@repo/ui/components/error";
import { clearClientRefPrefix } from "@repo/ui/lib";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { getBundleErrorCodeFromBoundaryError } from "@/modules/utils/helpers/bundle/bundle-api-error/bundle-api-error";
import {
	getCalendarFaresErrorCodeFromBoundaryError,
	getCalendarFaresErrorTitleKey,
} from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import {
	getAncillaryOffersErrorCodeFromBoundaryError,
	getAncillaryOffersErrorTitleKey,
} from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import { getPrepareOrderErrorCodeFromBoundaryError } from "@/modules/utils/helpers/confirmation/order-prepare/prepare-order-api-error/prepare-order-api-error";
import {
	getFlightSelectionErrorCodeFromBoundaryError,
	getFlightSelectionErrorTitleKey,
} from "@/modules/utils/helpers/flight-selection/flight-selection-api-error/flight-selection-api-error";
import {
	getSeatMapErrorCodeFromBoundaryError,
	getSeatMapErrorTitleKey,
} from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import { useAppDispatch } from "@/store/hooks";
import { resetCalendarFares } from "@/store/slices/calendar-fares/calendar-fares.slice";

const ErrorComponent = ({ error }: Readonly<{ error: Error }>) => {
	const t = useTranslations();
	const bundleT = useTranslations("bundle_page");
	const confirmationT = useTranslations("confirmation_page");
	const locale = useLocale();
	const hasRunCleanupRef = useRef<string | null>(null);
	const dispatch = useAppDispatch();
	useEffect(() => {
		const errorSignature = `${error.name}:${error.message}`;

		if (hasRunCleanupRef.current === errorSignature) {
			return;
		}
		hasRunCleanupRef.current = errorSignature;
		dispatch(resetCalendarFares());
		clearClientRefPrefix();
	}, [dispatch, error.name, error.message]);

	const bundleErrorCode = getBundleErrorCodeFromBoundaryError(error);
	const flightSelectionErrorCode = getFlightSelectionErrorCodeFromBoundaryError(error);

	const calendarFareErrorCode = getCalendarFaresErrorCodeFromBoundaryError(error);
	const ancillaryOffersErrorCode = getAncillaryOffersErrorCodeFromBoundaryError(error);

	const seatMapErrorCode = getSeatMapErrorCodeFromBoundaryError(error);
	const prepareOrderErrorCode = getPrepareOrderErrorCodeFromBoundaryError(error);
	const title = prepareOrderErrorCode
		? confirmationT(`error_labels.${prepareOrderErrorCode}_title`)
		: bundleErrorCode
			? bundleT(`error_labels.${bundleErrorCode}`)
			: flightSelectionErrorCode
				? t(`flight_selection_page.${getFlightSelectionErrorTitleKey(flightSelectionErrorCode)}`)
				: seatMapErrorCode
					? t(`seat_service.${getSeatMapErrorTitleKey(seatMapErrorCode)}`)
					: calendarFareErrorCode
						? t(`flight_selection_page.${getCalendarFaresErrorTitleKey(calendarFareErrorCode)}`)
						: ancillaryOffersErrorCode
							? t(getAncillaryOffersErrorTitleKey(ancillaryOffersErrorCode))
							: t("flight_selection_page.system_error_title");

	const description = prepareOrderErrorCode
		? confirmationT(`error_labels.${prepareOrderErrorCode}_message`)
		: t("flight_selection_page.error_description");

	return (
		<div className="mx-auto max-w-5xl">
			<ErrorPage
				title={title}
				description={description}
				reloadLabel={
					prepareOrderErrorCode
						? confirmationT("bundle_selection_unavailable_button")
						: t("flight_selection_page.error_reload")
				}
				redirectUrl={prepareOrderErrorCode ? `/${locale}` : undefined}
			/>
		</div>
	);
};

export default ErrorComponent;
