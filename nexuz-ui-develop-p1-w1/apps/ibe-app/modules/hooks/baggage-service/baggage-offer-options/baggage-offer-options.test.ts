import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBaggageOfferOptions } from "./baggage-offer-options";

type HookArgs = Parameters<typeof useBaggageOfferOptions>[0];
type PassengerTypeOffers = HookArgs["baggageOffersByPassengerType"][string];
type BaggageOfferCategories = PassengerTypeOffers["categories"];
type SpecialService = BaggageOfferCategories["carryOn"][string];

const getCarryOnOptionsByPassengerTypeMock = vi.hoisted(() => vi.fn());
const getSportsEquipmentOptionsByPassengerTypeMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers", () => ({
	getCarryOnOptionsByPassengerType: getCarryOnOptionsByPassengerTypeMock,
	getSportsEquipmentOptionsByPassengerType: getSportsEquipmentOptionsByPassengerTypeMock,
}));

const createSpecialService = (overrides: Partial<SpecialService> = {}): SpecialService => ({
	ssrCode: "CABN",
	amount: 4000,
	currency: "JPY",
	qtyAvailable: 5,
	lfid: 1001,
	pfid: 0,
	ssrId: 1281,
	cutOffHours: 0,
	maxCountServiceLevel: 100,
	description: "Baggage service",
	startSalesDays: 0,
	...overrides,
});

const createPassengerTypeOffers = (
	passengerType: string,
	categories: Partial<BaggageOfferCategories>
): PassengerTypeOffers => ({
	passengerType,
	categories: {
		carryOn: {},
		checkedIn: {},
		sportsEquipment: {},
		...categories,
	},
});

describe("useBaggageOfferOptions", () => {
	const mockCarryOnOptions = [
		{ id: "7kg", label: "7kg", price: 0, ssrCode: "7KG", qtyAvailable: 0 },
		{ id: "CABN", label: "15kg", price: 4000, ssrCode: "CABN", qtyAvailable: 5 },
	];

	const mockSportsEquipment = [
		{
			id: "SKII",
			icon: "downhill_skiing",
			label: "Ski Equipment",
			price: 7000,
			ssrCode: "SKII",
			qtyAvailable: 2,
		},
		{
			id: "GOLF",
			icon: "golf_course",
			label: "Golf Equipment",
			price: 7000,
			ssrCode: "GOLF",
			qtyAvailable: 3,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns carry-on options, checked-in price, and sports equipment options", () => {
		getCarryOnOptionsByPassengerTypeMock.mockReturnValue(mockCarryOnOptions);
		getSportsEquipmentOptionsByPassengerTypeMock.mockReturnValue(mockSportsEquipment);

		const baggageOffersByPassengerType = {
			adult: createPassengerTypeOffers("adult", {
				carryOn: {
					CABN: createSpecialService({
						ssrCode: "CABN",
						amount: 4000,
						description: "Carry-on 15kg",
					}),
				},
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 7500,
						qtyAvailable: 10,
						ssrId: 1221,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
					}),
				},
				sportsEquipment: {
					SKII: createSpecialService({
						ssrCode: "SKII",
						amount: 7000,
						qtyAvailable: 2,
						ssrId: 184,
						maxCountServiceLevel: 999,
						description: "Ski Equipment",
					}),
				},
			}),
		};

		const availableInventory = { CABN: 3, BAGN: 8, SKII: 1 };

		const { result } = renderHook(() =>
			useBaggageOfferOptions({
				baggageOffersByPassengerType,
				passengerTypeCode: "adult",
				availableInventory,
			})
		);

		expect(result.current.carryOnOptions).toEqual(mockCarryOnOptions);
		expect(result.current.priceForCheckedInBaggage).toBe(7500);
		expect(result.current.sportsEquipmentOptions).toEqual(mockSportsEquipment);
	});

	it("calculates priceForCheckedInBaggage from correct passenger type", () => {
		getCarryOnOptionsByPassengerTypeMock.mockReturnValue(mockCarryOnOptions);
		getSportsEquipmentOptionsByPassengerTypeMock.mockReturnValue(mockSportsEquipment);

		const baggageOffersByPassengerType = {
			adult: createPassengerTypeOffers("adult", {
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 7500,
						qtyAvailable: 10,
						ssrId: 1221,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
					}),
				},
			}),
			child: createPassengerTypeOffers("child", {
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 5000,
						qtyAvailable: 5,
						ssrId: 1222,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage Child",
					}),
				},
			}),
		};

		const { result } = renderHook(() =>
			useBaggageOfferOptions({
				baggageOffersByPassengerType,
				passengerTypeCode: "child",
				availableInventory: {},
			})
		);

		expect(result.current.priceForCheckedInBaggage).toBe(5000);
	});

	it("defaults to 0 for priceForCheckedInBaggage when not found", () => {
		getCarryOnOptionsByPassengerTypeMock.mockReturnValue(mockCarryOnOptions);
		getSportsEquipmentOptionsByPassengerTypeMock.mockReturnValue(mockSportsEquipment);

		const baggageOffersByPassengerType = {
			adult: createPassengerTypeOffers("adult", {}),
		};

		const { result } = renderHook(() =>
			useBaggageOfferOptions({
				baggageOffersByPassengerType,
				passengerTypeCode: "adult",
				availableInventory: {},
			})
		);

		expect(result.current.priceForCheckedInBaggage).toBe(0);
	});

	it("updates carry-on options when baggageOffersByPassengerType changes", () => {
		const updatedCarryOnOptions = [
			{ id: "7kg", label: "7kg", price: 0, ssrCode: "7KG", qtyAvailable: 0 },
			{ id: "CABN", label: "15kg", price: 5000, ssrCode: "CABN", qtyAvailable: 10 },
		];

		getCarryOnOptionsByPassengerTypeMock
			.mockReturnValueOnce(mockCarryOnOptions)
			.mockReturnValueOnce(updatedCarryOnOptions);
		getSportsEquipmentOptionsByPassengerTypeMock.mockReturnValue(mockSportsEquipment);

		const baggageOffersByPassengerType1 = {
			adult: createPassengerTypeOffers("adult", {
				carryOn: {
					CABN: createSpecialService({
						ssrCode: "CABN",
						amount: 4000,
						description: "Carry-on 15kg",
					}),
				},
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 7500,
						qtyAvailable: 10,
						ssrId: 1221,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
					}),
				},
			}),
		};

		const baggageOffersByPassengerType2 = {
			adult: createPassengerTypeOffers("adult", {
				carryOn: {
					CABN: createSpecialService({
						ssrCode: "CABN",
						amount: 5000,
						qtyAvailable: 10,
						description: "Carry-on 15kg updated",
					}),
				},
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 7500,
						qtyAvailable: 10,
						ssrId: 1221,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
					}),
				},
			}),
		};

		const { result, rerender } = renderHook((props: HookArgs) => useBaggageOfferOptions(props), {
			initialProps: {
				baggageOffersByPassengerType: baggageOffersByPassengerType1,
				passengerTypeCode: "adult",
				availableInventory: {},
			},
		});

		expect(result.current.carryOnOptions).toEqual(mockCarryOnOptions);

		rerender({
			baggageOffersByPassengerType: baggageOffersByPassengerType2,
			passengerTypeCode: "adult",
			availableInventory: {},
		});

		expect(result.current.carryOnOptions).toEqual(updatedCarryOnOptions);
	});

	it("updates sports equipment options when availableInventory changes", () => {
		getCarryOnOptionsByPassengerTypeMock.mockReturnValue(mockCarryOnOptions);
		getSportsEquipmentOptionsByPassengerTypeMock
			.mockReturnValueOnce(mockSportsEquipment)
			.mockReturnValueOnce([
				{
					id: "SKII",
					icon: "downhill_skiing",
					label: "Ski Equipment",
					price: 7000,
					ssrCode: "SKII",
					qtyAvailable: 0,
				},
			]);

		const baggageOffersByPassengerType = {
			adult: createPassengerTypeOffers("adult", {
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 7500,
						qtyAvailable: 10,
						ssrId: 1221,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
					}),
				},
				sportsEquipment: {
					SKII: createSpecialService({
						ssrCode: "SKII",
						amount: 7000,
						qtyAvailable: 2,
						ssrId: 184,
						maxCountServiceLevel: 999,
						description: "Ski Equipment",
					}),
				},
			}),
		};

		const { result, rerender } = renderHook((props: HookArgs) => useBaggageOfferOptions(props), {
			initialProps: {
				baggageOffersByPassengerType,
				passengerTypeCode: "adult",
				availableInventory: { SKII: 2 },
			},
		});

		expect(result.current.sportsEquipmentOptions).toEqual(mockSportsEquipment);

		rerender({
			baggageOffersByPassengerType,
			passengerTypeCode: "adult",
			availableInventory: { SKII: 0 },
		});

		expect(getSportsEquipmentOptionsByPassengerTypeMock).toHaveBeenCalledTimes(2);
	});

	it("defaults to 'adult' when passengerTypeCode is undefined", () => {
		getCarryOnOptionsByPassengerTypeMock.mockReturnValue(mockCarryOnOptions);
		getSportsEquipmentOptionsByPassengerTypeMock.mockReturnValue(mockSportsEquipment);

		const baggageOffersByPassengerType = {
			adult: createPassengerTypeOffers("adult", {
				carryOn: {
					CABN: createSpecialService({
						ssrCode: "CABN",
						amount: 4000,
						description: "Carry-on 15kg",
					}),
				},
				checkedIn: {
					BAGN: createSpecialService({
						ssrCode: "BAGN",
						amount: 7500,
						qtyAvailable: 10,
						ssrId: 1221,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
					}),
				},
			}),
		};

		renderHook(() =>
			useBaggageOfferOptions({
				baggageOffersByPassengerType,
				passengerTypeCode: undefined,
				availableInventory: {},
			})
		);

		expect(getCarryOnOptionsByPassengerTypeMock).toHaveBeenCalledWith(
			baggageOffersByPassengerType,
			undefined,
			expect.any(Object)
		);
	});
});
