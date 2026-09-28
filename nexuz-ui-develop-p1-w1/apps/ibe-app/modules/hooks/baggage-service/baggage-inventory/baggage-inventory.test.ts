import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBaggageInventory } from "./baggage-inventory";

const buildAvailableBaggageInventoryMock = vi.hoisted(() => vi.fn());
const buildBaggageInventoryMock = vi.hoisted(() => vi.fn());
const restorePassengerBaggageInventoryMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/utils/helpers/baggage-service/baggage-inventory/baggage-inventory", () => ({
	buildBaggageInventory: buildBaggageInventoryMock,
	buildAvailableBaggageInventory: buildAvailableBaggageInventoryMock,
	restorePassengerBaggageInventory: restorePassengerBaggageInventoryMock,
}));

type InventoryArgs = Parameters<typeof useBaggageInventory>[0];

const createSelectedPassenger = (
	overrides: Partial<NonNullable<InventoryArgs["selectedPassenger"]>> = {}
): NonNullable<InventoryArgs["selectedPassenger"]> => ({
	passenger: {
		id: "1",
		name: "John Doe",
		passengerTypeCode: "adult",
		bundleCode: "PRMK",
		bundleLabel: "Premium",
		mealfeatures: [],
		baggagefeatures: [],
		isIcnRoute: false,
		isValueBundle: false,
		...overrides.passenger,
	},
	baggageServices: {
		carryOn: {},
		checkedIn: {},
		sportsEquipment: {},
		...overrides.baggageServices,
	},
	categories: overrides.categories ?? [],
	totalPrice: overrides.totalPrice ?? 0,
});

const createOffer = (overrides: Record<string, unknown>) => ({
	amount: 0,
	currency: "JPY",
	qtyAvailable: 0,
	ssrCode: "",
	lfid: 1001,
	pfid: 0,
	ssrId: 1,
	cutOffHours: 24,
	maxCountServiceLevel: 1,
	description: "",
	startSalesDays: 0,
	...overrides,
});

const createAdultResponse = () => ({
	carryOn: {
		CABN: createOffer({
			amount: 4000,
			qtyAvailable: 5,
			ssrCode: "CABN",
			ssrId: 1281,
			description: "Carry-on",
		}),
	},
	checkedIn: {
		BAGN: createOffer({
			amount: 7500,
			qtyAvailable: 10,
			ssrCode: "BAGN",
			ssrId: 1221,
			maxCountServiceLevel: 3,
			description: "Checked-in",
		}),
	},
	sportsEquipment: {},
});

describe("useBaggageInventory", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns empty object when adultBaggageResponse is undefined", () => {
		buildBaggageInventoryMock.mockReturnValue({});
		buildAvailableBaggageInventoryMock.mockReturnValue({});
		restorePassengerBaggageInventoryMock.mockReturnValue({});

		const { result } = renderHook(() =>
			useBaggageInventory({
				adultBaggageResponse: undefined,
				passengerList: [],
				currentLfid: 1,
				selectedPassenger: null,
			})
		);

		expect(result.current).toEqual({});
	});

	it("builds inventory from adultBaggageResponse and restores passenger selection", () => {
		const mockBaseInventory = { CABN: 5, BAGN: 10 };
		const mockAvailableInventory = { CABN: 3, BAGN: 8 };
		const mockRestoredInventory = { CABN: 4, BAGN: 9 };

		buildBaggageInventoryMock.mockReturnValue(mockBaseInventory);
		buildAvailableBaggageInventoryMock.mockReturnValue(mockAvailableInventory);
		restorePassengerBaggageInventoryMock.mockReturnValue(mockRestoredInventory);

		const adultResponse = createAdultResponse();

		const passengerList = [
			{
				id: "1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "adult",
				services: {
					baggage: [],
				},
			},
		];

		const selectedPassenger = createSelectedPassenger();

		const { result } = renderHook(() =>
			useBaggageInventory({
				adultBaggageResponse: adultResponse,
				passengerList,
				currentLfid: 1,
				selectedPassenger,
			})
		);

		expect(buildBaggageInventoryMock).toHaveBeenCalledWith(adultResponse);
		expect(buildAvailableBaggageInventoryMock).toHaveBeenCalledWith({
			baseInventory: mockBaseInventory,
			passengerList,
			currentLfid: 1,
		});
		expect(restorePassengerBaggageInventoryMock).toHaveBeenCalledWith({
			availableInventory: mockAvailableInventory,
			baggageServices: selectedPassenger.baggageServices,
		});
		expect(result.current).toEqual(mockRestoredInventory);
	});

	it("returns empty inventory when passengerList is empty", () => {
		const mockBaseInventory = { CABN: 5, BAGN: 10 };
		const mockAvailableInventory = { CABN: 3, BAGN: 8 };
		const mockRestoredInventory = { CABN: 3, BAGN: 8 };

		buildBaggageInventoryMock.mockReturnValue(mockBaseInventory);
		buildAvailableBaggageInventoryMock.mockReturnValue(mockAvailableInventory);
		restorePassengerBaggageInventoryMock.mockReturnValue(mockRestoredInventory);

		const adultResponse = createAdultResponse();

		const { result } = renderHook(() =>
			useBaggageInventory({
				adultBaggageResponse: adultResponse,
				passengerList: [],
				currentLfid: 1,
				selectedPassenger: null,
			})
		);

		expect(result.current).toEqual(mockRestoredInventory);
	});

	it("recalculates when currentLfid changes", () => {
		const mockBaseInventory = { CABN: 5, BAGN: 10 };
		const mockAvailableInventory1 = { CABN: 3, BAGN: 8 };
		const mockAvailableInventory2 = { CABN: 4, BAGN: 9 };
		const mockRestoredInventory = { CABN: 4, BAGN: 9 };

		buildBaggageInventoryMock.mockReturnValue(mockBaseInventory);
		buildAvailableBaggageInventoryMock
			.mockReturnValueOnce(mockAvailableInventory1)
			.mockReturnValueOnce(mockAvailableInventory2);
		restorePassengerBaggageInventoryMock.mockReturnValue(mockRestoredInventory);

		const adultResponse = createAdultResponse();

		const passengerList = [
			{ id: "1", firstName: "John", lastName: "Doe", passengerTypeCode: "adult" },
		];

		const { rerender } = renderHook(
			({ lfid }: { lfid: number }) =>
				useBaggageInventory({
					adultBaggageResponse: adultResponse,
					passengerList,
					currentLfid: lfid,
					selectedPassenger: null,
				}),
			{ initialProps: { lfid: 1 } }
		);

		expect(buildAvailableBaggageInventoryMock).toHaveBeenCalledTimes(1);

		rerender({ lfid: 2 });

		expect(buildAvailableBaggageInventoryMock).toHaveBeenCalledTimes(2);
		expect(buildAvailableBaggageInventoryMock).toHaveBeenLastCalledWith({
			baseInventory: mockBaseInventory,
			passengerList,
			currentLfid: 2,
		});
	});

	it("handles undefined currentLfid gracefully", () => {
		const mockBaseInventory = { CABN: 5, BAGN: 10 };
		const mockAvailableInventory = { CABN: 5, BAGN: 10 };
		const mockRestoredInventory = { CABN: 5, BAGN: 10 };

		buildBaggageInventoryMock.mockReturnValue(mockBaseInventory);
		buildAvailableBaggageInventoryMock.mockReturnValue(mockAvailableInventory);
		restorePassengerBaggageInventoryMock.mockReturnValue(mockRestoredInventory);

		const adultResponse = createAdultResponse();

		const { result } = renderHook(() =>
			useBaggageInventory({
				adultBaggageResponse: adultResponse,
				passengerList: [],
				currentLfid: undefined,
				selectedPassenger: null,
			})
		);

		expect(result.current).toEqual(mockRestoredInventory);
	});
});
