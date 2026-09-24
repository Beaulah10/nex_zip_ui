import { usePathname, useRouter } from "next/navigation";
import { handleBackNavigation } from "@/modules/utils/helpers/common/back-navigation";
import { useAppSelector } from "@/store/hooks";
import {
	selectConfirmedFlight,
	selectFlightSearchRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";

/**
 * Custom hook for handling back navigation based on booking flow.
 *
 * Returns a callback function that navigates to the previous page in the flow.
 * Handles both redirect (top-level app) and push (other pages) actions.
 */
export const useBackNavigation = () => {
	const router = useRouter();
	const pathname = usePathname();
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const flightSearchRequest = useAppSelector(selectFlightSearchRequest);

	const handleBackClick = () => {
		const locale = pathname.split("/")[1] ?? "";

		const result = handleBackNavigation({
			pathname,
			locale,
			confirmedFlight,
			flightSearchRequest,
		});

		if (result) {
			if (result.action === "redirect") {
				window.location.href = result.path;
			} else {
				router.push(result.path);
			}
		}
	};

	return handleBackClick;
};
