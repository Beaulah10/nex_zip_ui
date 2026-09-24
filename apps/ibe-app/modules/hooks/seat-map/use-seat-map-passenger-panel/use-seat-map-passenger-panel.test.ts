import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSeatMapPassengerPanel } from "./use-seat-map-passenger-panel";

const mocks = vi.hoisted(() => ({
	state: {} as Record<string, unknown>,
	formatFullName: vi.fn((firstName: string, lastName: string) => `${firstName} ${lastName}`),
	getBundleLabelFromCode: vi.fn((bundleCode?: string) =>
		bundleCode ? `bundle:${bundleCode}` : undefined
	),
	getFlightCode: vi.fn(() => "NRT-BKK"),
	getActiveSeatMapSegment: vi.fn(() => ({ lfid: 321 })),
	getPassengerBundleCodeByLfid: vi.fn((passenger: { bundleCode?: string }) => passenger.bundleCode),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: () => ({
		orderedPassengersWithNames: [
			{
				id: "p1",
				firstName: "ZIP",
				lastName: "TARO",
				passengerTypeCode: "adult",
			},
			{
				id: "p2",
				firstName: "ZIP",
				lastName: "BABY",
				passengerTypeCode: "infant",
			},
		],
	}),
}));

vi.mock(
	"@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel",
	() => ({
		formatFullName: mocks.formatFullName,
		getBundleLabelFromCode: mocks.getBundleLabelFromCode,
		getFlightCode: mocks.getFlightCode,
	})
);

vi.mock("@/modules/utils/helpers/seat-map/seat-map-segment-utils/seat-map-segment-utils", () => ({
	getActiveSeatMapSegment: mocks.getActiveSeatMapSegment,
	getPassengerBundleCodeByLfid: mocks.getPassengerBundleCodeByLfid,
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: (selector: (state: Record<string, unknown>) => unknown) => selector(mocks.state),
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: (state: Record<string, unknown>) => state.confirmedFlight,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectPassengers: (state: Record<string, unknown>) => state.passengers,
}));

vi.mock("@/store/slices/seat-map/seat-map.slice", () => ({
	selectSeatMapRequest: (state: Record<string, unknown>) => state.seatMapRequest,
}));

describe("useSeatMapPassengerPanel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.state = {
			confirmedFlight: { id: "flight-1" },
			passengers: [{ id: "p1", bundleCode: "VALB" }, { id: "p2" }],
			seatMapRequest: { logicalFlightId: 321 },
		};
	});

	it("builds panel data from ordered passengers, segment bundle codes and flight data", () => {
		const { result } = renderHook(() => useSeatMapPassengerPanel({ direction: "outbound" }));

		expect(mocks.getActiveSeatMapSegment).toHaveBeenCalledWith({
			confirmedFlight: { id: "flight-1" },
			direction: "outbound",
			logicalFlightId: 321,
		});
		expect(mocks.getFlightCode).toHaveBeenCalled();
		expect(result.current.flightCode).toBe("NRT-BKK");
		expect(result.current.passengers).toEqual([
			{
				name: "ZIP TARO",
				bundle: "bundle:VALB",
				isInfant: false,
			},
			{
				name: "ZIP BABY",
				bundle: undefined,
				isInfant: true,
			},
		]);
		expect(mocks.getPassengerBundleCodeByLfid).toHaveBeenCalledTimes(2);
		expect(mocks.getBundleLabelFromCode).toHaveBeenCalledWith("VALB", expect.any(Function));
	});
});
