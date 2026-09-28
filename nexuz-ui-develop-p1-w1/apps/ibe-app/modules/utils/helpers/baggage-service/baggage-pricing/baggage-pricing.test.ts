import { describe, expect, it } from "vitest";
import {
	calculateBaggagePriceFromSelection,
	calculatePassengerBaggagePrice,
	getCarryOnCharge,
	getCheckedBaggageCharge,
	getSportsEquipmentCharge,
} from "./baggage-pricing";

type BaggagePriceSelectionArgs = Parameters<typeof calculateBaggagePriceFromSelection>[0];
type PassengerPriceArgs = Parameters<typeof calculatePassengerBaggagePrice>[0];

const createPassenger = (
	overrides: Partial<PassengerPriceArgs["passenger"]>
): PassengerPriceArgs["passenger"] => ({
	id: "passenger1",
	name: "John Doe",
	passengerTypeCode: "adult",
	bundleCode: "PRMK",
	bundleLabel: "Premium",
	mealfeatures: [],
	baggagefeatures: [],
	...overrides,
	isIcnRoute: overrides.isIcnRoute ?? false,
	isValueBundle: overrides.isValueBundle ?? overrides.bundleCode === "VALK",
});

describe("baggage-pricing helpers", () => {
	describe("getCarryOnCharge", () => {
		it("returns amount for CABN when bundleType is NONE", () => {
			const result = getCarryOnCharge("CABN", "NONE", 4000);

			expect(result).toBe(4000);
		});

		it("returns amount for CABN when bundleType is VALUE", () => {
			const result = getCarryOnCharge("CABN", "VALUE", 4000);

			expect(result).toBe(4000);
		});

		it("returns 0 for 7KG when bundleType is VALUE", () => {
			const result = getCarryOnCharge("7KG", "VALUE", 0);

			expect(result).toBe(0);
		});

		it("returns 0 for PREMIUM bundle", () => {
			const result = getCarryOnCharge("CABN", "PREMIUM", 4000);

			expect(result).toBe(0);
		});

		it("returns 0 for FLEXBIZ bundle", () => {
			const result = getCarryOnCharge("CABN", "FLEXBIZ", 4000);

			expect(result).toBe(0);
		});

		it("returns 0 for 7KG regardless of bundle", () => {
			expect(getCarryOnCharge("7KG", "NONE", 1000)).toBe(0);
			expect(getCarryOnCharge("7KG", "VALUE", 1000)).toBe(0);
			expect(getCarryOnCharge("7KG", "PREMIUM", 1000)).toBe(0);
		});
	});

	describe("getCheckedBaggageCharge", () => {
		it("charges for all bags except first when VALUE bundle", () => {
			const result = getCheckedBaggageCharge(3, "VALUE", 7500);

			expect(result).toBe(7500 * 2);
		});

		it("charges for all bags except first when PREMIUM bundle", () => {
			const result = getCheckedBaggageCharge(2, "PREMIUM", 7500);

			expect(result).toBe(7500 * 1);
		});

		it("returns 0 when 1 bag selected for VALUE", () => {
			const result = getCheckedBaggageCharge(1, "VALUE", 7500);

			expect(result).toBe(0);
		});

		it("returns 0 when 1 bag selected for PREMIUM", () => {
			const result = getCheckedBaggageCharge(1, "PREMIUM", 7500);

			expect(result).toBe(0);
		});

		it("charges for all bags when NONE bundle", () => {
			const result = getCheckedBaggageCharge(2, "NONE", 7500);

			expect(result).toBe(7500 * 2);
		});

		it("charges for all bags when FLEXBIZ bundle", () => {
			const result = getCheckedBaggageCharge(3, "FLEXBIZ", 7500);

			expect(result).toBe(7500 * 3);
		});

		it("returns 0 when quantity is 0", () => {
			const result = getCheckedBaggageCharge(0, "VALUE", 7500);

			expect(result).toBe(0);
		});

		it("handles negative quantity gracefully", () => {
			const result = getCheckedBaggageCharge(-1, "VALUE", 7500);

			expect(result).toBe(0);
		});
	});

	describe("getSportsEquipmentCharge", () => {
		it("calculates total charge for multiple equipment", () => {
			const equipment = [
				{ id: "SKII", price: 7000, ssrCode: "SKII", label: "Ski", icon: "", qtyAvailable: 0 },
				{ id: "GOLF", price: 7000, ssrCode: "GOLF", label: "Golf", icon: "", qtyAvailable: 0 },
				{
					id: "BIKE",
					price: 11000,
					ssrCode: "BIKE",
					label: "Bike",
					icon: "",
					qtyAvailable: 0,
				},
			];

			const equipmentCounts = { SKII: 1, GOLF: 1, BIKE: 2 };

			const result = getSportsEquipmentCharge(equipment, equipmentCounts);

			expect(result).toBe(7000 + 7000 + 11000 * 2);
		});

		it("returns 0 when no equipment is selected", () => {
			const equipment = [
				{ id: "SKII", price: 7000, ssrCode: "SKII", label: "Ski", icon: "", qtyAvailable: 0 },
			];

			const equipmentCounts = {};

			const result = getSportsEquipmentCharge(equipment, equipmentCounts);

			expect(result).toBe(0);
		});

		it("handles zero quantity correctly", () => {
			const equipment = [
				{ id: "SKII", price: 7000, ssrCode: "SKII", label: "Ski", icon: "", qtyAvailable: 0 },
			];

			const equipmentCounts = { SKII: 0 };

			const result = getSportsEquipmentCharge(equipment, equipmentCounts);

			expect(result).toBe(0);
		});

		it("ignores equipment not in counts", () => {
			const equipment = [
				{ id: "SKII", price: 7000, ssrCode: "SKII", label: "Ski", icon: "", qtyAvailable: 0 },
				{ id: "GOLF", price: 7000, ssrCode: "GOLF", label: "Golf", icon: "", qtyAvailable: 0 },
			];

			const equipmentCounts = { SKII: 1 };

			const result = getSportsEquipmentCharge(equipment, equipmentCounts);

			expect(result).toBe(7000);
		});
	});

	describe("calculateBaggagePriceFromSelection", () => {
		it("calculates total price for VALUE bundle", () => {
			const selection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 2,
				equipmentCounts: { SKII: 1 },
			};

			const carryOnOptions = [
				{ id: "CABN", label: "15kg", price: 4000, ssrCode: "CABN", qtyAvailable: 5 },
			];

			const equipmentOptions = [
				{
					id: "SKII",
					label: "Ski",
					price: 7000,
					ssrCode: "SKII",
					icon: "",
					qtyAvailable: 2,
				},
			];

			const result = calculateBaggagePriceFromSelection({
				selection,
				carryOnOptions,
				equipmentOptions,
				packageType: "VALUE",
				checkedInBaggagePrice: 7500,
			});

			// VALUE: CABN=4000, checked-in=7500*1 (2-1), SKII=7000*1 = 18500
			expect(result).toBe(18500);
		});

		it("calculates total price for PREMIUM bundle", () => {
			const selection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 2,
				equipmentCounts: { GOLF: 1 },
			};

			const carryOnOptions = [
				{ id: "CABN", label: "15kg", price: 4000, ssrCode: "CABN", qtyAvailable: 5 },
			];

			const equipmentOptions = [
				{
					id: "GOLF",
					label: "Golf",
					price: 7000,
					ssrCode: "GOLF",
					icon: "",
					qtyAvailable: 3,
				},
			];

			const result = calculateBaggagePriceFromSelection({
				selection,
				carryOnOptions,
				equipmentOptions,
				packageType: "PREMIUM",
				checkedInBaggagePrice: 7500,
			});

			// PREMIUM: CABN=0, checked-in=7500*1 (2-1), GOLF=7000*1 = 14500
			expect(result).toBe(14500);
		});

		it("calculates price with 7kg carry-on", () => {
			const selection = {
				carryOnId: "7kg",
				checkedInBaggageCount: 0,
				equipmentCounts: {},
			};

			const carryOnOptions: BaggagePriceSelectionArgs["carryOnOptions"] = [
				{ id: "7kg", label: "7kg", price: 0, ssrCode: "7KG", qtyAvailable: 0 },
			];

			const equipmentOptions: BaggagePriceSelectionArgs["equipmentOptions"] = [];

			const result = calculateBaggagePriceFromSelection({
				selection,
				carryOnOptions,
				equipmentOptions,
				packageType: "VALUE",
				checkedInBaggagePrice: 7500,
			});

			expect(result).toBe(0);
		});

		it("calculates price for NONE bundle with all items", () => {
			const selection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 3,
				equipmentCounts: { SKII: 1, BIKE: 2 },
			};

			const carryOnOptions: BaggagePriceSelectionArgs["carryOnOptions"] = [
				{ id: "CABN", label: "15kg", price: 4000, ssrCode: "CABN", qtyAvailable: 5 },
			];

			const equipmentOptions: BaggagePriceSelectionArgs["equipmentOptions"] = [
				{
					id: "SKII",
					label: "Ski",
					price: 7000,
					ssrCode: "SKII",
					icon: "",
					qtyAvailable: 2,
				},
				{
					id: "BIKE",
					label: "Bike",
					price: 11000,
					ssrCode: "BIKE",
					icon: "",
					qtyAvailable: 3,
				},
			];

			const result = calculateBaggagePriceFromSelection({
				selection,
				carryOnOptions,
				equipmentOptions,
				packageType: "NONE",
				checkedInBaggagePrice: 7500,
			});

			// NONE: CABN=4000, checked-in=7500*3, SKII=7000*1, BIKE=11000*2
			expect(result).toBe(4000 + 7500 * 3 + 7000 + 11000 * 2);
		});

		it("handles missing carry-on option", () => {
			const selection = {
				carryOnId: "UNKNOWN",
				checkedInBaggageCount: 0,
				equipmentCounts: {},
			};

			const carryOnOptions: BaggagePriceSelectionArgs["carryOnOptions"] = [];
			const equipmentOptions: BaggagePriceSelectionArgs["equipmentOptions"] = [];

			const result = calculateBaggagePriceFromSelection({
				selection,
				carryOnOptions,
				equipmentOptions,
				packageType: "VALUE",
				checkedInBaggagePrice: 7500,
			});

			expect(result).toBe(0);
		});
	});

	describe("calculatePassengerBaggagePrice", () => {
		it("calculates total price for passenger baggage services", () => {
			const passenger: PassengerPriceArgs["passenger"] = createPassenger({});

			const baggageServices = {
				carryOn: {
					CABN: {
						ssrCode: "CABN",
						amount: 4000,
						categoryId: 144,
						lfid: 1001,
						pfid: 0,
						cutOffHours: 0,
						maxCountServiceLevel: 100,
						passengerType: "adult",
						qtyAvailable: 5,
						serviceID: 1281,
						chargeComment: "",
						bundleCode: "PRMK",
						description: "Carry-on",
					},
				},
				checkedIn: {
					BAGN: {
						service: {
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							lfid: 1001,
							pfid: 0,
							cutOffHours: 0,
							maxCountServiceLevel: 999,
							passengerType: "adult",
							qtyAvailable: 10,
							serviceID: 1221,
							chargeComment: "",
							bundleCode: "PRMK",
							description: "Checked-in",
						},
						quantity: 2,
					},
				},
				sportsEquipment: {
					SKII: {
						service: {
							ssrCode: "SKII",
							amount: 7000,
							categoryId: 145,
							lfid: 1001,
							pfid: 0,
							cutOffHours: 0,
							maxCountServiceLevel: 999,
							passengerType: "adult",
							qtyAvailable: 2,
							serviceID: 184,
							chargeComment: "",
							bundleCode: "PRMK",
							description: "Ski",
						},
						quantity: 1,
					},
				},
			};

			const result = calculatePassengerBaggagePrice({ passenger, baggageServices });

			// PREMIUM: CABN=0 (free), checked-in=7500*1 (2-1), SKII=7000*1
			expect(result).toBe(14500);
		});

		it("calculates price with only carry-on", () => {
			const passenger: PassengerPriceArgs["passenger"] = createPassenger({
				bundleCode: "VALK",
				bundleLabel: "Value",
			});

			const baggageServices = {
				carryOn: {
					CABN: {
						ssrCode: "CABN",
						amount: 4000,
						categoryId: 144,
						lfid: 1001,
						pfid: 0,
						cutOffHours: 0,
						maxCountServiceLevel: 100,
						passengerType: "adult",
						qtyAvailable: 5,
						serviceID: 1281,
						chargeComment: "",
						bundleCode: "VALK",
						description: "Carry-on",
					},
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = calculatePassengerBaggagePrice({ passenger, baggageServices });

			// VALUE + CABN = 4000
			expect(result).toBe(4000);
		});

		it("calculates price with no baggage", () => {
			const passenger: PassengerPriceArgs["passenger"] = createPassenger({
				bundleCode: "NOBN",
				bundleLabel: "None",
			});

			const baggageServices = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = calculatePassengerBaggagePrice({ passenger, baggageServices });

			expect(result).toBe(0);
		});
	});
});
