import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BusinessCabinRows } from "./business-cabin-rows";

vi.mock("@/components/customize/seat-map/seat/seat", () => ({
	Seat: ({ seat, selected, passengerLabel, size }: any) => (
		<div>{`${seat.code}-${selected ? passengerLabel : "plain"}-${size}`}</div>
	),
}));

describe("BusinessCabinRows", () => {
	it("renders seats, placeholders, row numbers, and large seat props", () => {
		render(
			<BusinessCabinRows
				rows={[
					{
						row: 1,
						layout: "1-1",
						seats: [
							{
								code: "1A",
								column: "A",
								type: "Window",
								status: "front-tier",
								isSeatAvailable: true,
								amount: 1,
								serviceCode: "STFW",
							},
							{
								code: "1D",
								column: "D",
								type: "Aisle",
								status: "front-tier",
								isSeatAvailable: true,
								amount: 1,
								serviceCode: "STFW",
							},
						],
					},
					{
						row: 2,
						layout: "1-1",
						seats: [],
					},
				]}
				assignedSeatToPassengerIndex={{ "1A": 0 }}
				assignedSeatToPassengerLabel={{ "1A": "AA" }}
			/>
		);

		expect(screen.getByText("1A-AA-large")).toBeTruthy();
		expect(screen.getByText("1D-plain-large")).toBeTruthy();
		expect(screen.getAllByText("1").length).toBeGreaterThan(0);
		expect(screen.getAllByText("2").length).toBeGreaterThan(0);
	});
});
