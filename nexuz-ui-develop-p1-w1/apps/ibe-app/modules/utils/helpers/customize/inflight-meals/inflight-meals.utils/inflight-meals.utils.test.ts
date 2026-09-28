import { describe, expect, it, vi } from "vitest";

vi.mock("@/assets/images/coke.png", () => ({ default: { src: "coke-image.png" } }));
vi.mock("@/assets/images/meal1.png", () => ({ default: { src: "meal-1.png" } }));
vi.mock("@/assets/images/meal2.png", () => ({ default: { src: "meal-2.png" } }));
vi.mock("@/assets/images/meal3.png", () => ({ default: { src: "meal-3.png" } }));
vi.mock("@/assets/images/meal4.png", () => ({ default: { src: "meal-4.png" } }));

import {
	buildMealDetailsMap,
	DRINKS_CATEGORY_TITLE,
	extractAdultMeals,
	extractMealServiceLookup,
	getBundleIncludedMealCodes,
	hasSufficientMealStock,
	INFLIGHT_MEAL_CATEGORY_TITLE,
	isInflightMealStockLimited,
	mapSpecialServiceToMealListOption,
	toPassengerService,
} from "./inflight-meals.utils";

function makeService(overrides: Partial<any> = {}) {
	return {
		lfid: 101,
		pfid: 202,
		amount: 1200,
		currency: "JPY",
		cutOffHours: 12,
		description: "Chicken meal",
		maxCountServiceLevel: 3,
		qtyAvailable: 8,
		ssrCode: "ML1",
		ssrId: 1,
		startSalesDays: 0,
		...overrides,
	};
}

function makeAncillaryData({
	adultCategories = [],
	childCategories = [],
}: {
	adultCategories?: any[];
	childCategories?: any[];
} = {}) {
	return {
		data: {
			servicesPerPassengerType: [
				{ passengerType: "childA", categories: childCategories },
				{ passengerType: "adult", categories: adultCategories },
			],
		},
	} as any;
}

describe("mapSpecialServiceToMealListOption", () => {
	it("maps bundle-included meal with free price and bundle labels", () => {
		const service = makeService({
			ssrId: 2,
			ssrCode: " ml1 ",
			amount: 1500,
			description: "Meal A",
		});

		const item = mapSpecialServiceToMealListOption(service, "meals", new Set(["ML1"]));

		expect(item.id).toBe("2");
		expect(item.name).toBe("Meal A");
		expect(item.price).toBe(0);
		expect(item.originalPrice).toBe(1500);
		expect(item.bundleLabel).toBe("Bundle");
		expect(item.category).toBe("meals");
		expect(item.qtyAvailable).toBe(8);
		expect(item.remainingQty).toBe(8);
		expect(item.imageSrc).toBe("meal-3.png");
	});

	it("maps drink service using drink image and original amount", () => {
		const service = makeService({ ssrId: 7, amount: 500, description: "Cola" });

		const item = mapSpecialServiceToMealListOption(service, "drink");

		expect(item.imageSrc).toBe("coke-image.png");
		expect(item.price).toBe(500);
		expect(item.originalPrice).toBeUndefined();
		expect(item.bundleLabel).toBeUndefined();
		expect(item.category).toBe("drink");
	});
});

describe("buildMealDetailsMap", () => {
	it("builds dialog detail entries with static allergy and nutrition info", () => {
		const map = buildMealDetailsMap(
			[
				{
					id: "1",
					name: "Meal 1",
					imageSrc: "meal-1.png",
					price: 0,
					originalPrice: 1000,
					bundleLabel: "Bundle",
					qtyAvailable: 4,
					remainingQty: 4,
					stockLabel: "remaining_quantity",
					isOutOfStock: false,
					category: "meals",
				},
			],
			"John Doe",
			"NRT -> ICN"
		);

		expect(map["1"]).toBeDefined();
		expect(map["1"]?.passengerName).toBe("John Doe");
		expect(map["1"]?.routeLabel).toBe("NRT -> ICN");
		expect(map["1"]?.allergies).toContain("Soba");
		expect(map["1"]?.nutrition).toContain("Energy");
		expect(map["1"]?.drinkOptions).toEqual([]);
		expect(map["1"]?.deliveryTimingOptions).toEqual([]);
	});
});

describe("extractAdultMeals", () => {
	it("returns empty array when data is missing", () => {
		expect(extractAdultMeals(undefined)).toEqual([]);
		expect(extractAdultMeals({} as any)).toEqual([]);
	});

	it("returns empty array when adult passenger entry is missing", () => {
		const data = {
			data: {
				servicesPerPassengerType: [{ passengerType: "childA", categories: [] }],
			},
		} as any;

		expect(extractAdultMeals(data)).toEqual([]);
	});

	it("extracts meals first and drinks second for adult passenger", () => {
		const data = makeAncillaryData({
			adultCategories: [
				{
					title: INFLIGHT_MEAL_CATEGORY_TITLE,
					categoryId: 11,
					specialServices: [
						makeService({ ssrId: 1, ssrCode: "ML1", description: "Meal 1", amount: 1000 }),
					],
				},
				{
					title: DRINKS_CATEGORY_TITLE,
					categoryId: 22,
					specialServices: [
						makeService({ ssrId: 2, ssrCode: "DR1", description: "Drink 1", amount: 300 }),
					],
				},
			],
		});

		const result = extractAdultMeals(data, { bundleIncludedMealCodes: new Set(["ML1"]) });

		expect(result).toHaveLength(2);
		expect(result[0]?.name).toBe("Meal 1");
		expect(result[0]?.category).toBe("meals");
		expect(result[0]?.price).toBe(0);
		expect(result[1]?.name).toBe("Drink 1");
		expect(result[1]?.category).toBe("drink");
		expect(result[1]?.price).toBe(300);
	});
});

describe("extractMealServiceLookup", () => {
	it("returns empty lookup when data is missing", () => {
		expect(extractMealServiceLookup(undefined)).toEqual({});
	});

	it("includes only in-flight meal and drink services", () => {
		const mealService = makeService({ ssrId: 10, description: "Meal Service" });
		const drinkService = makeService({ ssrId: 20, description: "Drink Service" });
		const ignoredService = makeService({ ssrId: 30, description: "Ignored Service" });

		const data = makeAncillaryData({
			adultCategories: [
				{ title: INFLIGHT_MEAL_CATEGORY_TITLE, categoryId: 1, specialServices: [mealService] },
				{ title: DRINKS_CATEGORY_TITLE, categoryId: 2, specialServices: [drinkService] },
				{ title: "Meal Delivery Time", categoryId: 3, specialServices: [ignoredService] },
			],
			childCategories: [
				{
					title: INFLIGHT_MEAL_CATEGORY_TITLE,
					categoryId: 4,
					specialServices: [makeService({ ssrId: 40 })],
				},
			],
		});

		const lookup = extractMealServiceLookup(data);
		expect(Object.keys(lookup).sort()).toEqual(["10", "20", "40"]);
		expect(lookup["10"]?.categoryId).toBe(1);
		expect(lookup["20"]?.categoryId).toBe(2);
		expect(lookup["40"]?.passengerType).toBe("childA");
		expect(lookup["30"]).toBeUndefined();
	});
});

describe("toPassengerService", () => {
	it("maps lookup entry to PassengerService with defaults", () => {
		const entry = {
			service: makeService({ pfid: undefined, ssrId: 99, ssrCode: " MLX " }),
			categoryId: 55,
			passengerType: "adult",
		};

		const mapped = toPassengerService(entry as any);
		expect(mapped.serviceID).toBe(99);
		expect(mapped.pfid).toBe(0);
		expect(mapped.categoryId).toBe(55);
		expect(mapped.passengerType).toBe("adult");
		expect(mapped.chargeComment).toBe("");
		expect(mapped.bundleCode).toBe("");
	});
});

describe("getBundleIncludedMealCodes", () => {
	it("returns empty set when categories are missing", () => {
		expect(getBundleIncludedMealCodes()).toEqual(new Set());
	});

	it("collects and normalizes meal codes from MEALS category only", () => {
		const result = getBundleIncludedMealCodes([
			{ category: " meals ", services: [{ code: " ml1 " }, { code: "ML2" }, {}] },
			{ category: "DRINKS", services: [{ code: "DR1" }] },
			{},
		]);

		expect(result).toEqual(new Set(["ML1", "ML2"]));
	});
});

describe("hasSufficientMealStock", () => {
	it("returns true when bundled passenger count is zero or no meal codes", () => {
		expect(hasSufficientMealStock(undefined, new Set(["ML1"]), 0)).toBe(true);
		expect(hasSufficientMealStock(undefined, new Set(), 2)).toBe(true);
	});

	it("returns true when adult entry is missing", () => {
		const data = {
			data: { servicesPerPassengerType: [{ passengerType: "childA", categories: [] }] },
		} as any;
		expect(hasSufficientMealStock(data, new Set(["ML1"]), 3)).toBe(true);
	});

	it("checks summed qtyAvailable for matching bundle meal codes", () => {
		const data = makeAncillaryData({
			adultCategories: [
				{
					title: INFLIGHT_MEAL_CATEGORY_TITLE,
					categoryId: 1,
					specialServices: [
						makeService({ ssrCode: "ML1", qtyAvailable: 1 }),
						makeService({ ssrCode: " ml2 ", qtyAvailable: 2 }),
						makeService({ ssrCode: "DR1", qtyAvailable: 100 }),
					],
				},
			],
		});

		expect(hasSufficientMealStock(data, new Set(["ML1", "ML2"]), 3)).toBe(true);
		expect(hasSufficientMealStock(data, new Set(["ML1", "ML2"]), 4)).toBe(false);
	});
});

describe("isInflightMealStockLimited", () => {
	const ancillaryData = makeAncillaryData({
		adultCategories: [
			{
				title: INFLIGHT_MEAL_CATEGORY_TITLE,
				categoryId: 1,
				specialServices: [
					makeService({ ssrCode: "ML1", qtyAvailable: 1 }),
					makeService({ ssrCode: "ML2", qtyAvailable: 1 }),
				],
			},
		],
	});

	const confirmedFlight = {
		flights: {
			outbound: { segments: [{ lfid: 111 }] },
			inbound: { segments: [{ lfid: 222 }] },
		},
	};

	it("returns false when bundled passenger count is zero", () => {
		const result = isInflightMealStockLimited({
			ancillaryData,
			bundledMealPassengerCount: 0,
			direction: "outbound",
			confirmedFlight,
			servicePassengers: [],
			isICNRoute: false,
			passengersWithBundles: [],
		});

		expect(result).toBe(false);
	});

	it("returns true when included bundle-meal stock is insufficient", () => {
		const result = isInflightMealStockLimited({
			ancillaryData,
			bundledMealPassengerCount: 3,
			direction: "outbound",
			confirmedFlight,
			servicePassengers: [
				{ id: "p1", bundleCode: "VALB" },
				{ id: "p2", bundleCode: "PREM" },
				{ id: "p3", bundleCode: "NOBN" },
			],
			isICNRoute: false,
			passengersWithBundles: [
				{
					id: "p1",
					bundles: [
						{
							lfid: 111,
							bundleCategory: {
								categories: [{ category: "MEALS", services: [{ code: "ML1" }] }],
							},
						},
					],
				},
				{
					id: "p2",
					bundles: [
						{
							lfid: 111,
							bundleCategory: {
								categories: [{ category: "MEALS", services: [{ code: "ML2" }] }],
							},
						},
					],
				},
			],
		});

		expect(result).toBe(true);
	});

	it("applies ICN route rule by counting premium bundles only", () => {
		const result = isInflightMealStockLimited({
			ancillaryData,
			bundledMealPassengerCount: 1,
			direction: "inbound",
			confirmedFlight,
			servicePassengers: [
				{ id: "p1", bundleCode: "VALB" },
				{ id: "p2", bundleCode: "PREM" },
			],
			isICNRoute: true,
			passengersWithBundles: [
				{
					id: "p1",
					bundles: [
						{
							lfid: 222,
							bundleCategory: {
								categories: [{ category: "MEALS", services: [{ code: "ML1" }] }],
							},
						},
					],
				},
				{
					id: "p2",
					bundles: [
						{
							lfid: 222,
							bundleCategory: {
								categories: [{ category: "MEALS", services: [{ code: "ML2" }] }],
							},
						},
					],
				},
			],
		});

		expect(result).toBe(false);
	});
});
