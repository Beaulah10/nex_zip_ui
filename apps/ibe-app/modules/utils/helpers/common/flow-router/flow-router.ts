import { BOOKING_STAGE_SEGMENTS } from "@/modules/utils/constants/common/flow-router.constants";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";

/**
 * Canonical route keys used by the IBE booking flow.
 *
 * These keys intentionally mirror the nested Next.js route structure under
 * `app/[locale]`, so a key like `customize/outbound` resolves to:
 * `/[locale]/customize/outbound`.
 */
export type BookingFlowRoute =
	| "flight-selection"
	| "bundles/outbound"
	| "bundles/inbound"
	| "bundles/segment1"
	| "bundles/segment2"
	| "customize/outbound"
	| "customize/inbound"
	| "customize/segment1"
	| "customize/segment2"
	| "extras/outbound"
	| "extras/inbound"
	| "extras/segment1"
	| "extras/segment2"
	| "customer-information";

/**
 * High-level itinerary shape used to choose the navigation sequence.
 *
 * - `oneway`: a single direct outbound journey.
 * - `roundtrip`: outbound steps followed by inbound steps.
 * - `connecting`: two travel stages derived from multi-segment outbound data.
 */
export type BookingFlowType = "oneway" | "roundtrip" | "connecting";

/**
 * UI direction/stage used by split booking pages.
 *
 * For roundtrip this maps to outbound vs inbound.
 * For connecting this maps to segment1 vs segment2 routes while preserving the
 * same logical direction contract in UI components.
 */
export type BookingFlowDirection = "outbound" | "inbound";

export type BookingStageSegment = (typeof BOOKING_STAGE_SEGMENTS)[number];

export type BookingFlowSection = "bundles" | "customize" | "extras";

/**
 * Ordered route sequences for each supported booking flow.
 *
 * Flow summary:
 * - `oneway`
 *   flight-selection -> bundles/outbound -> customize/outbound ->
 *   extras/outbound -> customer-information
 * - `roundtrip`
 *   flight-selection -> bundles/outbound -> customize/outbound ->
 *   extras/outbound -> bundles/inbound -> customize/inbound ->
 *   extras/inbound -> customer-information
 * - `connecting`
 *   Uses segment-specific routes with stage 1 completed before stage 2.
 */
export const FLOW_ROUTE_SEQUENCE: Record<BookingFlowType, BookingFlowRoute[]> = {
	// Direct one-way journeys only need the first-stage pages.
	oneway: [
		"flight-selection",
		"bundles/outbound",
		"customize/outbound",
		"extras/outbound",
		"customer-information",
	],
	// Roundtrip journeys must complete outbound and inbound stages before passenger details.
	roundtrip: [
		"flight-selection",
		"bundles/outbound",
		"customize/outbound",
		"extras/outbound",
		"bundles/inbound",
		"customize/inbound",
		"extras/inbound",
		"customer-information",
	],
	// Connecting mirrors the same order using segment1 then segment2 routes.
	connecting: [
		"flight-selection",
		"bundles/segment1",
		"customize/segment1",
		"extras/segment1",
		"bundles/segment2",
		"customize/segment2",
		"extras/segment2",
		"customer-information",
	],
};

/**
 * Derives the booking flow type from the confirmed flight payload.
 *
 * The persisted store only saves `tripType` as oneway or roundtrip. Connecting
 * is inferred when the confirmed outbound contains more than one segment.
 */
export const getBookingFlowType = (
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">
): BookingFlowType | undefined => {
	if (!confirmedFlight) {
		return undefined;
	}

	const outboundSegments = confirmedFlight.flights.outbound.segments.length;
	if (outboundSegments > 1) {
		return "connecting";
	}

	return confirmedFlight.tripType;
};

/**
 * Returns the next logical route within the configured flow sequence.
 *
 * If the current route is not part of the detected flow, or if no confirmed
 * flight is available yet, `undefined` is returned so callers can decide how to
 * fallback safely.
 */
export const getNextBookingFlowRoute = ({
	confirmedFlight,
	currentRoute,
}: {
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	currentRoute: BookingFlowRoute;
}): BookingFlowRoute | undefined => {
	const flowType = getBookingFlowType(confirmedFlight);
	if (!flowType) {
		return undefined;
	}

	const flow = FLOW_ROUTE_SEQUENCE[flowType];
	const currentIndex = flow.indexOf(currentRoute);

	if (currentIndex === -1) {
		return undefined;
	}

	return flow[currentIndex + 1];
};

/**
 * Builds the localized URL for the next step in the booking flow.
 *
 * This helper is used by page-level `Proceed` actions so every transition goes
 * through the same routing matrix instead of hardcoding path strings in each
 * screen.
 */
export const getNextBookingFlowPath = ({
	locale,
	confirmedFlight,
	currentRoute,
	fallbackRoute = "customer-information",
}: {
	locale: string;
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	currentRoute: BookingFlowRoute;
	fallbackRoute?: BookingFlowRoute;
}): string => {
	const nextRoute = getNextBookingFlowRoute({
		confirmedFlight,
		currentRoute,
	});

	return `/${locale}/${nextRoute ?? fallbackRoute}`;
};

/**
 * Returns the previous logical route within the configured flow sequence.
 *
 * If the current route is not part of the detected flow, or if no confirmed
 * flight is available yet, `undefined` is returned so callers can decide how to
 * fallback safely.
 */
export const getPreviousBookingFlowRoute = ({
	confirmedFlight,
	currentRoute,
}: {
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	currentRoute: BookingFlowRoute;
}): BookingFlowRoute | undefined => {
	const flowType = getBookingFlowType(confirmedFlight);
	if (!flowType) {
		return undefined;
	}

	const flow = FLOW_ROUTE_SEQUENCE[flowType];
	const currentIndex = flow.indexOf(currentRoute);

	if (currentIndex <= 0) {
		return undefined;
	}

	return flow[currentIndex - 1];
};

/**
 * Builds the localized URL for the previous step in the booking flow.
 *
 * This helper is used by back button actions so navigation goes through the
 * same routing matrix instead of hardcoding path strings.
 */
export const getPreviousBookingFlowPath = ({
	locale,
	confirmedFlight,
	currentRoute,
	fallbackRoute = "flight-selection",
}: {
	locale: string;
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	currentRoute: BookingFlowRoute;
	fallbackRoute?: BookingFlowRoute;
}): string | undefined => {
	const previousRoute = getPreviousBookingFlowRoute({
		confirmedFlight,
		currentRoute,
	});

	if (!previousRoute && fallbackRoute === "flight-selection") {
		return `/${locale}/${fallbackRoute}`;
	}

	return previousRoute ? `/${locale}/${previousRoute}` : undefined;
};

/**
 * Returns the user-facing stage label for split pages.
 *
 * - Roundtrip and direct one-way screens use Outbound / Inbound.
 * - Connecting screens use segment1/segment2 routes and display Segment 1 /
 *   Segment 2 to match the itinerary language requested by product.
 */
export const getBookingDirectionLabel = ({
	confirmedFlight,
	direction,
}: {
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	direction: BookingFlowDirection;
}): string => {
	const flowType = getBookingFlowType(confirmedFlight);

	if (flowType === "connecting") {
		return direction === "outbound" ? "Segment 1" : "Segment 2";
	}

	return direction === "outbound" ? "Outbound" : "Inbound";
};

/**
 * Resolves the stage segment string for a flow and logical direction.
 *
 * - Roundtrip/direct flows use outbound/inbound.
 * - Connecting flow uses segment1/segment2 at URL level.
 */
export const getBookingStageSegment = ({
	confirmedFlight,
	direction,
}: {
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	direction: BookingFlowDirection;
}): BookingStageSegment => {
	const flowType = getBookingFlowType(confirmedFlight);

	if (flowType === "connecting") {
		return direction === "outbound" ? "segment1" : "segment2";
	}

	return direction;
};

/**
 * Maps a route stage segment back to UI direction.
 */
export const getBookingDirectionFromStage = (stage: string): BookingFlowDirection | undefined => {
	if (stage === "outbound" || stage === "segment1") {
		return "outbound";
	}

	if (stage === "inbound" || stage === "segment2") {
		return "inbound";
	}

	return undefined;
};

/**
 * Runtime guard for validating a route stage token.
 */
export const isBookingStageSegment = (value: string): value is BookingStageSegment =>
	BOOKING_STAGE_SEGMENTS.includes(value as BookingStageSegment);

/**
 * Builds the route key used by flow sequencing for a stage-based page.
 */
export const getBookingStageRoute = ({
	section,
	confirmedFlight,
	direction,
}: {
	section: BookingFlowSection;
	confirmedFlight?: Pick<ConfirmedFlightPayload, "tripType" | "flights">;
	direction: BookingFlowDirection;
}): BookingFlowRoute => {
	const stage = getBookingStageSegment({ confirmedFlight, direction });

	return `${section}/${stage}` as BookingFlowRoute;
};
