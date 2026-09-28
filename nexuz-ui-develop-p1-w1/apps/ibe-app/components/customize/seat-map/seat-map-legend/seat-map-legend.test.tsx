import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeatMapLegend } from "./seat-map-legend";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

describe("SeatMapLegend", () => {
	it("renders all standard legend items with formatted prices", () => {
		render(
			<SeatMapLegend
				cabinClass="Standard"
				complimentaryLegendEligible={false}
				bundleSeatServiceCodes={new Set()}
				bundleInfoMessage="bundle message"
				prices={{
					"more-legroom": 1200,
					"front-aisle-window-side": 2300,
					"reclining-not-allowed": 3400,
					"rear-aisle-window-side": 4500,
					"central-seat": 5600,
					selected: 6700,
				}}
			/>
		);

		expect(screen.getByText("seat_legend_more_legroom")).toBeTruthy();
		expect(screen.getByText("seat_legend_front_aisle_window_side")).toBeTruthy();
		expect(screen.getByText("seat_legend_reclining_not_allowed")).toBeTruthy();
		expect(screen.getByText("seat_legend_rear_aisle_window_side")).toBeTruthy();
		expect(screen.getByText("seat_legend_central_seat")).toBeTruthy();
		expect(screen.getByText("seat_legend_selected")).toBeTruthy();
		expect(screen.getByText("seat_legend_not_selectable")).toBeTruthy();
		expect(screen.getByText("¥1,200")).toBeTruthy();
		expect(screen.getByText("¥6,700")).toBeTruthy();
		expect(screen.getByText("-")).toBeTruthy();
		expect(screen.getByText("bundle message")).toBeTruthy();
	});

	it("filters zip full flat legend items and shows bundle-free pricing", () => {
		render(
			<SeatMapLegend
				cabinClass="ZipFullFlat"
				complimentaryLegendEligible
				bundleSeatServiceCodes={new Set()}
				prices={{
					"central-seat": 8900,
					selected: 9100,
				}}
			/>
		);

		expect(screen.getByText("seat_legend_zip_full_flat_central_seat")).toBeTruthy();
		expect(screen.getByText("seat_legend_selected")).toBeTruthy();
		expect(screen.getByText("seat_legend_not_selectable")).toBeTruthy();
		expect(screen.queryByText("seat_legend_more_legroom")).toBeNull();
		expect(screen.queryByText("seat_legend_front_aisle_window_side")).toBeNull();
		expect(screen.getAllByText("¥0")).toHaveLength(2);
		expect(screen.getByText("¥8,900")).toBeTruthy();
		expect(screen.getByText("¥9,100")).toBeTruthy();
	});

	it("shows selective bundle pricing only for matching legend service codes", () => {
		render(
			<SeatMapLegend
				cabinClass="Standard"
				complimentaryLegendEligible={false}
				bundleSeatServiceCodes={new Set(["STFW", "STOT"])}
				selectedServiceCode="STOT"
				prices={{
					"more-legroom": 1700,
					"front-aisle-window-side": 1700,
					"reclining-not-allowed": 1700,
					"rear-aisle-window-side": 1700,
					"central-seat": 1700,
					selected: 1700,
				}}
			/>
		);

		expect(screen.getAllByText("¥0")).toHaveLength(3);
		expect(screen.getAllByText("¥1,700")).toHaveLength(6);
	});
});
