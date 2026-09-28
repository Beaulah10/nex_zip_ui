import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeatMap } from "./seat-map";

const scrollIntoViewMock = vi.fn();

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{`icon:${name}`}</span>,
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" "),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/customize/seat-map/business-cabin-header/business-cabin-header", () => ({
	BusinessCabinHeader: () => <div>BusinessCabinHeader</div>,
}));

vi.mock("@/components/customize/seat-map/business-cabin-rows/business-cabin-rows", () => ({
	BusinessCabinRows: ({ rows }: { rows: Array<{ row: number }> }) => (
		<div>{`BusinessCabinRows:${rows.map((row) => row.row).join(",")}`}</div>
	),
}));

vi.mock("@/components/customize/seat-map/cabin-assistance-icons/cabin-assistance-icons", () => ({
	CabinAssistanceIcons: ({ showAccessibleGroup = true }: { showAccessibleGroup?: boolean }) => (
		<div>{`CabinAssistanceIcons:${showAccessibleGroup}`}</div>
	),
}));

vi.mock("@/components/customize/seat-map/cabin-header/cabin-header", () => ({
	CabinHeader: ({ cabinClass }: { cabinClass: string }) => <div>{`CabinHeader:${cabinClass}`}</div>,
}));

vi.mock("@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows", () => ({
	expandCabinRows: (cabin: { rows: Array<{ row: number; seats: Array<{ code: string }> }> }) =>
		cabin.rows,
}));

vi.mock("@/components/customize/seat-map/seat-map-row/seat-map-row", () => ({
	SeatMapRow: ({ row }: { row: { row: number; seats: Array<{ code: string }> } }) => (
		<div>
			<span>{`Row:${row.row}`}</span>
			{row.seats.map((seat) => (
				<div key={seat.code} data-seat-code={seat.code}>
					{seat.code}
				</div>
			))}
		</div>
	),
}));

describe("SeatMap", () => {
	it("renders the standard cabin split layout and scrolls the active seat into view", async () => {
		HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

		render(
			<SeatMap
				data={[
					{
						name: "Main Cabin",
						class: "Standard",
						rows: [
							{
								row: 35,
								layout: "3-3-3",
								seats: [
									{
										code: "35A",
										type: "Window",
										status: "front-tier",
										isSeatAvailable: true,
										amount: 1000,
										serviceCode: "STFW",
									} as any,
								],
							},
							{
								row: 36,
								layout: "3-3-3",
								seats: [
									{
										seat: "36A",
										type: "Window",
										status: "no-recline",
										isSeatAvailable: true,
										amount: 1200,
										serviceCode: "STFW",
									},
								],
							},
							{
								row: 37,
								layout: "3-3-3",
								seats: [
									{
										code: "37A",
										column: "A",
										type: "Window",
										status: "rear-tier",
										isSeatAvailable: true,
										amount: 900,
										serviceCode: "STFW",
									},
								],
							},
						],
					},
				]}
				assignedSeatToPassengerIndex={{ "37A": 0 }}
				assignedSeatToPassengerLabel={{ "37A": "ZT" }}
				activeSeatCode="37A"
			/>
		);

		expect(screen.getAllByText("CabinHeader:Standard")).toHaveLength(2);
		expect(screen.getByText("Row:35")).toBeTruthy();
		expect(screen.getByText("Row:36")).toBeTruthy();
		expect(screen.getByText("Row:37")).toBeTruthy();
		expect(screen.getByText("CabinAssistanceIcons:true")).toBeTruthy();
		expect(screen.getByText("CabinAssistanceIcons:false")).toBeTruthy();

		await waitFor(() => {
			expect(scrollIntoViewMock).toHaveBeenCalled();
		});
	});

	it("renders the ZIP Full-Flat cabin branch", () => {
		render(
			<SeatMap
				data={[
					{
						name: "Business Cabin",
						class: "ZipFullFlat",
						rows: [
							{
								row: 1,
								layout: "1-1-1",
								seats: [
									{
										code: "35A",
										type: "Window",
										status: "front-tier",
										isSeatAvailable: true,
										amount: 1000,
										serviceCode: "STFW",
									} as any,
								],
							},
						],
					},
				]}
			/>
		);

		expect(screen.getByText("BusinessCabinHeader")).toBeTruthy();
		expect(screen.getByText("BusinessCabinRows:1")).toBeTruthy();
		expect(screen.getByText("standard_seat_area")).toBeTruthy();
		expect(screen.getByText("icon:wc")).toBeTruthy();
	});
});
