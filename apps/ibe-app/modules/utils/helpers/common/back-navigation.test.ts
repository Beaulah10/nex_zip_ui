import { describe, expect, it, vi } from "vitest";
import {
	extractCurrentRouteFromPathname,
	handleBackNavigation,
} from "@/modules/utils/helpers/common/back-navigation";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";

const mocks = vi.hoisted(() => ({
	getPreviousBookingFlowPath: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", async () => {
	const actual = await vi.importActual<
		typeof import("@/modules/utils/helpers/common/flow-router/flow-router")
	>("@/modules/utils/helpers/common/flow-router/flow-router");
	return {
		...actual,
		getPreviousBookingFlowPath: mocks.getPreviousBookingFlowPath,
	};
});

describe("extractCurrentRouteFromPathname", () => {
	it("returns simple route for flight-selection and customer-information", () => {
		expect(extractCurrentRouteFromPathname("/en/flight-selection")).toBe("flight-selection");
		expect(extractCurrentRouteFromPathname("/en/customer-information")).toBe(
			"customer-information"
		);
	});

	it("returns nested route for section/stage pages", () => {
		expect(extractCurrentRouteFromPathname("/en/customize/outbound")).toBe("customize/outbound");
		expect(extractCurrentRouteFromPathname("/ja/bundles/segment1")).toBe("bundles/segment1");
	});

	it("returns undefined for locale-only or unknown simple path", () => {
		expect(extractCurrentRouteFromPathname("/en")).toBeUndefined();
		expect(extractCurrentRouteFromPathname("/en/unknown")).toBeUndefined();
	});
});

describe("handleBackNavigation", () => {
	it("returns redirect action to localized top-level when route is flight-selection", () => {
		expect(
			handleBackNavigation({
				pathname: "/en/flight-selection",
				locale: "en",
			})
		).toEqual({
			path: "/en",
			action: "redirect",
		});
	});

	it("builds flight-selection query params when previous path points to flight-selection", () => {
		mocks.getPreviousBookingFlowPath.mockReturnValue("/en/flight-selection");

		const result = handleBackNavigation({
			pathname: "/en/bundles/outbound",
			locale: "en",
			flightSearchRequest: {
				routes: "NRT,HNL",
				departureDateFrom: "2026-05-10",
				departureDateTo: "2026-05-15",
				adult: 2,
				childA: 1,
				childB: 0,
				childC: 0,
				infant: 1,
			},
		});

		expect(result).toEqual({
			path: "/en/flight-selection?routes=NRT%2CHNL&departureDateFrom=2026-05-10&departureDateTo=2026-05-15&adult=2&childA=1&infant=1",
			action: "push",
		});
	});

	it("returns flow previous path when confirmed flight exists and previous path is not flight-selection", () => {
		mocks.getPreviousBookingFlowPath.mockReturnValue("/en/customize/outbound");

		const confirmedFlight = {
			tripType: "oneway",
			flights: {
				outbound: {
					segments: [
						{
							pfid: 1,
							lfid: 1,
							carrierCode: "ZG",
							origin: "NRT",
							destination: "HNL",
							flightNumber: "ZG1",
							scheduledDepartureArrivalDateTime: {
								departureDateTime: "2026-07-23T10:00:00+09:00",
								departureDateTimeOffset: "+09:00",
								arrivalDateTime: "2026-07-23T15:00:00+09:00",
								arrivalDateTimeOffset: "+09:00",
							},
							flightTime: "05:00",
							selectedCabin: "economy",
							fareDetails: [],
						},
					],
					selectedFareInfos: [],
					passengerFareBreakdown: [],
					totalFlightAmount: 0,
				},
			},
		} satisfies Pick<ConfirmedFlightPayload, "tripType" | "flights">;

		const result = handleBackNavigation({
			pathname: "/en/extras/outbound",
			locale: "en",
			confirmedFlight,
			flightSearchRequest: {
				routes: "NRT,HNL",
				departureDateFrom: "2026-05-10",
			},
		});

		expect(result).toEqual({
			path: "/en/customize/outbound",
			action: "push",
		});
	});

	it("returns undefined when route cannot be resolved", () => {
		expect(
			handleBackNavigation({
				pathname: "/en",
				locale: "en",
			})
		).toBeUndefined();
	});
});
