import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const { routeData, mockGetRoutes, mockGetIpLocation, mockFlightSearchPage } = vi.hoisted(() => {
	const data = [[{ origin: "NRT", destination: "ICN" }]];
	const getRoutes = vi.fn(async () => data);
	const getIpLocation = vi.fn(async () => "NRT");
	const flightSearchPage = vi.fn(({ data }: { data: unknown }) =>
		React.createElement("div", { "data-testid": "flight-search-page" }, JSON.stringify(data))
	);

	return {
		routeData: data,
		mockGetRoutes: getRoutes,
		mockGetIpLocation: getIpLocation,
		mockFlightSearchPage: flightSearchPage,
	};
});

vi.mock("@/modules/services/flight-search/flight-search.services", () => ({
	getRoutes: mockGetRoutes,
	getIpLocation: mockGetIpLocation,
}));

vi.mock("@/components/flight-search/flight-search", () => ({
	default: mockFlightSearchPage,
}));

import Page from "@/app/[locale]/page";

describe("locale root page", () => {
	it("fetches routes and renders FlightSearchPage with data", async () => {
		const element = await Page({
			searchParams: Promise.resolve({}),
		});
		render(element);

		expect(mockGetRoutes).toHaveBeenCalledTimes(1);
		expect(mockGetIpLocation).toHaveBeenCalledTimes(1);
		expect(mockFlightSearchPage).toHaveBeenNthCalledWith(
			1,
			{ data: routeData, initialOrigin: "NRT" },
			undefined
		);
		expect(screen.getByTestId("flight-search-page").textContent).toContain("NRT");
	});
});
