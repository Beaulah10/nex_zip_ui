import { describe, expect, it, vi } from "vitest";
import {
	getSeatSelectionAvailabilityDialog,
	toSeatValidationPassengers,
} from "./seat-selection-availability";

vi.mock("@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows", () => ({
	expandCabinRows: vi.fn((cabin: any) => cabin.rows),
}));

vi.mock("@/modules/utils/validations/seat-map/seat-validation", () => ({
	hasRequiredAdjacentSeatAvailability: vi.fn(
		({ availableSeatCodes }: { availableSeatCodes: string[] }) => availableSeatCodes.includes("1A")
	),
}));

describe("seat-selection-availability", () => {
	it("maps raw passengers to validation passengers", () => {
		expect(
			toSeatValidationPassengers([
				{ id: "p1", passengerTypeCode: null, mappedAdultId: null, associateWithPassengerId: "a1" },
			])
		).toEqual([{ id: "p1", passengerTypeCode: undefined, mappedAdultId: "a1" }]);
	});

	it("returns the correct availability dialog type", () => {
		expect(
			getSeatSelectionAvailabilityDialog({
				cabins: [{ rows: [{ seats: [] }] }] as any,
				cabinType: "STANDARD",
				passengers: [],
			})
		).toBe("NO_AVAILABLE_SEATS");

		expect(
			getSeatSelectionAvailabilityDialog({
				cabins: [{ rows: [{ seats: [{ code: "2B", isSeatAvailable: true }] }] }] as any,
				cabinType: "STANDARD",
				passengers: [],
			})
		).toBe("NO_ADJACENT_SEATS");

		expect(
			getSeatSelectionAvailabilityDialog({
				cabins: [{ rows: [{ seats: [{ code: "1A", isSeatAvailable: true }] }] }] as any,
				cabinType: "STANDARD",
				passengers: [],
			})
		).toBeUndefined();
	});
});
