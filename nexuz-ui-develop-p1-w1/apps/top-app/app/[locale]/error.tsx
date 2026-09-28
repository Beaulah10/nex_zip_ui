"use client";

import ErrorPage from "@repo/ui/components/error";
import { clearClientRefPrefix } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import {
	getAirportRoutesErrorCodeFromBoundaryError,
	getAirportRoutesErrorTitleKey,
} from "@/modules/utils/helpers/airport-routes/airport-routes-utils";
import {
	getAuthTokenErrorCodeFromBoundaryError,
	getAuthTokenErrorTitleKey,
} from "@/modules/utils/helpers/auth-token/auth-token-utils";
import {
	getCalendarFaresErrorCodeFromBoundaryError,
	getCalendarFaresErrorTitleKey,
} from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import { persistor } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { resetCalendarFares } from "@/store/slices/calendar-fares/calendar-fares.slice";
import { clearFormData } from "@/store/slices/flight-search-form/flight-search-form.slice";

const ErrorComponent = ({ error }: { error: Error }) => {
	const dispatch = useAppDispatch();
	const t = useTranslations("flight_search_page");
	const hasRunCleanupRef = useRef<string | null>(null);

	useEffect(() => {
		const errorSignature = `${error.name}:${error.message}`;

		if (hasRunCleanupRef.current === errorSignature) {
			return;
		}

		hasRunCleanupRef.current = errorSignature;
		dispatch(clearFormData());
		dispatch(resetCalendarFares());
		clearClientRefPrefix();
		void fetch("/api/clear-auth-token", {
			method: "POST",
			cache: "no-store",
		});

		persistor.purge();
	}, [dispatch, error.name, error.message]);

	const airportRoutesErrorCode = getAirportRoutesErrorCodeFromBoundaryError(error);
	const authTokenErrorCode = getAuthTokenErrorCodeFromBoundaryError(error);
	const calendarFareErrorCode = getCalendarFaresErrorCodeFromBoundaryError(error);

	const title = airportRoutesErrorCode
		? t(getAirportRoutesErrorTitleKey(airportRoutesErrorCode))
		: authTokenErrorCode
			? t(getAuthTokenErrorTitleKey(authTokenErrorCode))
			: calendarFareErrorCode
				? t(getCalendarFaresErrorTitleKey(calendarFareErrorCode))
				: t("system_error_title");

	return (
		<ErrorPage
			title={title}
			description={t("error_titles.error_description")}
			reloadLabel={t("error_titles.error_reload")}
		/>
	);
};

export default ErrorComponent;
