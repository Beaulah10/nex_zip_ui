import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeatMapRow } from "./seat-map-row";

vi.mock("@/components/customize/seat-map/seat/seat", () => ({
	Seat: ({ seat, selected, passengerLabel }: any) => (
		<div>{`${seat.code}-${selected ? passengerLabel : "unselected"}`}</div>
	),
}));

describe("SeatMapRow", () => {
	it("renders placeholders, row numbers, and selected seats", () => {
		render(
			<SeatMapRow
				cabinClass="Standard"
				row={{
					row: 12,
					layout: "3-3-3",
					seats: [
						{
							code: "12A",
							column: "A",
							type: "Window",
							status: "front-tier",
							isSeatAvailable: true,
							amount: 10,
							serviceCode: "STFW",
						},
					],
				}}
				assignedSeatToPassengerIndex={{ "12A": 0 }}
				assignedSeatToPassengerLabel={{ "12A": "PA" }}
			/>
		);

		expect(screen.getAllByText("12").length).toBeGreaterThan(0);
		expect(screen.getByText("12A-PA")).toBeTruthy();
	});
});
