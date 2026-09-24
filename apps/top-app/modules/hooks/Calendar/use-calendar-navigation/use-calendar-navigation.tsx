import { useMemo } from "react";
import {
	addMonths,
	monthsBetween,
	startOfMonth,
} from "@/modules/utils/helpers/calendar/calendar.helpers";

interface UseCalendarNavigationParams {
	visibleMonth: Date;
	minDate: Date;
	maxDate: Date;
}

/**
 * Derives month-navigation state for the desktop/timeline calendar views.
 */
export default function useCalendarNavigation({
	visibleMonth,
	minDate,
	maxDate,
}: UseCalendarNavigationParams) {
	const secondVisibleMonth = useMemo(() => addMonths(visibleMonth, 1), [visibleMonth]);

	const canGoBack = useMemo(() => {
		const prev = addMonths(visibleMonth, -1);
		return prev.getTime() >= startOfMonth(minDate).getTime();
	}, [visibleMonth, minDate]);

	const canGoForward = useMemo(() => {
		// The second visible month must stay < max date's month.
		return secondVisibleMonth.getTime() < startOfMonth(maxDate).getTime();
	}, [secondVisibleMonth, maxDate]);

	const allMonths = useMemo(() => {
		const count = monthsBetween(minDate, maxDate) + 1;
		return Array.from({ length: count }, (_, i) => addMonths(startOfMonth(minDate), i));
	}, [minDate, maxDate]);

	return {
		secondVisibleMonth,
		canGoBack,
		canGoForward,
		allMonths,
	};
}
