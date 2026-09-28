import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { BookingFlowRoute } from "./flow-router/flow-router";
import { getPreviousBookingFlowPath } from "./flow-router/flow-router";

/**
 * Extracts the current booking flow route from a pathname.
 *
 * Examples:
 * - "/en/flight-selection" -> "flight-selection"
 * - "/en/customize/outbound" -> "customize/outbound"
 * - "/en/customer-information" -> "customer-information"
 * - "/en" -> undefined
 */
export const extractCurrentRouteFromPathname = (pathname: string): BookingFlowRoute | undefined => {
	const pathSegments = pathname.split("/").filter(Boolean).slice(1); // Remove locale

	if (pathSegments.length === 1) {
		// Simple routes like "flight-selection", "customer-information"
		const segment = pathSegments[0];
		if (segment === "flight-selection" || segment === "customer-information") {
			return segment as BookingFlowRoute;
		}
	} else if (pathSegments.length >= 2) {
		// Nested routes like "customize/outbound" or "bundles/inbound"
		const section = pathSegments[0];
		const stage = pathSegments[1];
		const route = `${section}/${stage}`;
		return route as BookingFlowRoute;
	}

	return undefined;
};

/**
 * Handles back navigation based on the booking flow sequence.
 *
 * Returns the path to navigate to, or undefined if no valid previous route exists.
 * This includes:
 * - Routing to top-level app when at flight-selection
 * - Preserving flight search params when navigating back to flight-selection
 * - Flow-based navigation for all other pages
 */
export const handleBackNavigation = ({
	pathname,
	locale,
	confirmedFlight,
	flightSearchRequest,
}: {
	pathname: string;
	locale: string;
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	flightSearchRequest?: Record<string, unknown> | null;
}):
	| {
			path: string;
			action: "push" | "redirect";
	  }
	| undefined => {
	const currentRoute = extractCurrentRouteFromPathname(pathname);

	// If at flight-selection page, navigate to top-level app
	if (currentRoute === "flight-selection") {
		return {
			path: `/${locale}`,
			action: "redirect",
		};
	}

	// Preserve flight search params when navigating back to flight-selection
	if (flightSearchRequest && currentRoute) {
		const previousPath = getPreviousBookingFlowPath({
			locale,
			confirmedFlight,
			currentRoute,
		});

		if (previousPath === `/${locale}/flight-selection`) {
			const params = new URLSearchParams();
			params.set("routes", flightSearchRequest.routes as string);
			params.set("departureDateFrom", flightSearchRequest.departureDateFrom as string);

			if (flightSearchRequest.departureDateTo) {
				params.set("departureDateTo", flightSearchRequest.departureDateTo as string);
			}

			if (flightSearchRequest.adult) {
				params.set("adult", String(flightSearchRequest.adult));
			}

			if (flightSearchRequest.childA) {
				params.set("childA", String(flightSearchRequest.childA));
			}

			if (flightSearchRequest.childB) {
				params.set("childB", String(flightSearchRequest.childB));
			}

			if (flightSearchRequest.childC) {
				params.set("childC", String(flightSearchRequest.childC));
			}

			if (flightSearchRequest.infant) {
				params.set("infant", String(flightSearchRequest.infant));
			}

			return {
				path: `/${locale}/flight-selection?${params.toString()}`,
				action: "push",
			};
		}
	}

	// Use flow-based navigation if we have a confirmed flight
	if (confirmedFlight && currentRoute) {
		const previousPath = getPreviousBookingFlowPath({
			locale,
			confirmedFlight,
			currentRoute,
		});

		if (previousPath) {
			return {
				path: previousPath,
				action: "push",
			};
		}
	}

	return undefined;
};
