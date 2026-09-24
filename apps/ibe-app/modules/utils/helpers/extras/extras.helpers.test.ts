/**
 * File: extras.helpers.test.ts
 * Classification: Unit
 * Description: Tests for the extras helper functions.
 * Covers: getBundledSsrCodesForPassenger, mapAncillaryDataToProducts,
 * updateSelectedCategoryIds, getProductsByCategory, updatePassengerSelections,
 * getSelectAllSelections, getDialogSummary, getCategoriesToShow,
 * getVisibleSections, checkBundlePassenger, createPassengerItem.
 */

import { describe, expect, it, vi } from "vitest";
import {
	checkBundlePassenger,
	createPassengerItem,
	getBundledSsrCodesForPassenger,
	getCategoriesToShow,
	getDialogSummary,
	getProductsByCategory,
	getSelectAllSelections,
	getVisibleSections,
	mapAncillaryDataToProducts,
	updatePassengerSelections,
	updateSelectedCategoryIds,
} from "./extras.helpers";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/assets/images/pokemon.png", () => ({ default: { src: "/pokemon.png" } }));

vi.mock("@/modules/utils/helpers/extras/extras.data", () => ({
	ALLOWED_AMENITY_SSR_CODES: new Set(["AMEA", "AMEB", "SVDA"]),
}));

// ── Shared fixtures ────────────────────────────────────────────────────────

const makeProduct = (overrides: object = {}) => ({
	id: "amenities-1",
	categoryId: "amenities" as const,
	ssrCode: "AMEA",
	qtyAvailable: 5,
	name: "Amenity A",
	description: "Amenity A",
	price: 1000,
	imageSrc: "/pokemon.png",
	images: [],
	serviceID: 1,
	lfid: 100,
	cutOffHours: 2,
	maxCountServiceLevel: 5,
	numericCategoryId: 1,
	passengerType: "adult",
	...overrides,
});

const makePassengerForDialog = (id: string, overrides: object = {}) => ({
	id,
	name: `Passenger ${id}`,
	category: "Adult" as const,
	price: 0,
	checked: false,
	...overrides,
});

// ── getBundledSsrCodesForPassenger ─────────────────────────────────────────

describe("getBundledSsrCodesForPassenger", () => {
	it("returns an empty set when passenger has no bundles", () => {
		const result = getBundledSsrCodesForPassenger({});
		expect(result.size).toBe(0);
	});

	it("returns SSR codes from all bundles when no lfid filter is given", () => {
		const passenger = {
			bundles: [
				{
					lfid: 100,
					pfid: 1,
					bundleCode: "PREN",
					bundleCategory: {
						categories: [{ services: [{ code: "AMEA" }, { code: "AMEB" }] }],
					},
				},
				{
					lfid: 200,
					pfid: 1,
					bundleCode: "PREN",
					bundleCategory: {
						categories: [{ services: [{ code: "SVDA" }] }],
					},
				},
			],
		};

		const result = getBundledSsrCodesForPassenger(passenger as never);
		expect(result).toEqual(new Set(["AMEA", "AMEB", "SVDA"]));
	});

	it("filters bundles by lfid when provided", () => {
		const passenger = {
			bundles: [
				{
					lfid: 100,
					pfid: 1,
					bundleCode: "PREN",
					bundleCategory: { categories: [{ services: [{ code: "AMEA" }] }] },
				},
				{
					lfid: 200,
					pfid: 1,
					bundleCode: "PREN",
					bundleCategory: { categories: [{ services: [{ code: "SVDA" }] }] },
				},
			],
		};

		const result = getBundledSsrCodesForPassenger(passenger as never, 100);
		expect(result).toEqual(new Set(["AMEA"]));
		expect(result.has("SVDA")).toBe(false);
	});

	it("returns empty set when bundles exist but none match the lfid", () => {
		const passenger = {
			bundles: [
				{
					lfid: 999,
					pfid: 1,
					bundleCode: "PREN",
					bundleCategory: { categories: [{ services: [{ code: "AMEA" }] }] },
				},
			],
		};

		const result = getBundledSsrCodesForPassenger(passenger as never, 100);
		expect(result.size).toBe(0);
	});
});

// ── mapAncillaryDataToProducts ─────────────────────────────────────────────

describe("mapAncillaryDataToProducts", () => {
	it("returns empty array when data is undefined", () => {
		expect(mapAncillaryDataToProducts(undefined)).toEqual([]);
	});

	it("maps adult Amenity services to ExtrasProduct objects", () => {
		const data = {
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Amenity",
								categoryId: 1,
								specialServices: [
									{
										ssrCode: "AMEA",
										ssrId: 1,
										description: "Amenity A",
										amount: 1000,
										qtyAvailable: 5,
										lfid: 100,
										cutOffHours: 2,
										maxCountServiceLevel: 5,
									},
								],
							},
						],
					},
				],
			},
		};

		const result = mapAncillaryDataToProducts(data as never);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			id: "amenities-1",
			categoryId: "amenities",
			ssrCode: "AMEA",
			name: "Amenity A",
			price: 1000,
			qtyAvailable: 5,
		});
	});

	it("filters out non-adult passenger types", () => {
		const data = {
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "child",
						categories: [
							{
								title: "Amenity",
								categoryId: 1,
								specialServices: [
									{
										ssrCode: "AMEA",
										ssrId: 1,
										description: "A",
										amount: 100,
										qtyAvailable: 5,
										lfid: 100,
										cutOffHours: 0,
										maxCountServiceLevel: 5,
									},
								],
							},
						],
					},
				],
			},
		};

		expect(mapAncillaryDataToProducts(data as never)).toHaveLength(0);
	});

	it("filters out SSR codes not in ALLOWED_AMENITY_SSR_CODES", () => {
		const data = {
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Amenity",
								categoryId: 1,
								specialServices: [
									{
										ssrCode: "UNKNOWN",
										ssrId: 99,
										description: "X",
										amount: 500,
										qtyAvailable: 5,
										lfid: 100,
										cutOffHours: 0,
										maxCountServiceLevel: 5,
									},
								],
							},
						],
					},
				],
			},
		};

		expect(mapAncillaryDataToProducts(data as never)).toHaveLength(0);
	});

	it("sets remainingLabel to 'Out of Stock' when qtyAvailable is 0", () => {
		const data = {
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Amenity",
								categoryId: 1,
								specialServices: [
									{
										ssrCode: "AMEA",
										ssrId: 1,
										description: "A",
										amount: 100,
										qtyAvailable: 0,
										lfid: 100,
										cutOffHours: 0,
										maxCountServiceLevel: 1,
									},
								],
							},
						],
					},
				],
			},
		};

		const result = mapAncillaryDataToProducts(data as never);
		expect(result[0]?.remainingLabel).toBe("Out of Stock");
		expect(result[0]?.disabled).toBe(true);
	});

	it("sets remainingLabel to '{n} remaining' when qtyAvailable < 10", () => {
		const data = {
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Amenity",
								categoryId: 1,
								specialServices: [
									{
										ssrCode: "AMEA",
										ssrId: 1,
										description: "A",
										amount: 100,
										qtyAvailable: 3,
										lfid: 100,
										cutOffHours: 0,
										maxCountServiceLevel: 5,
									},
								],
							},
						],
					},
				],
			},
		};

		const result = mapAncillaryDataToProducts(data as never);
		expect(result[0]?.remainingLabel).toBe("3 remaining");
	});

	it("leaves remainingLabel undefined when qtyAvailable >= 10", () => {
		const data = {
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Amenity",
								categoryId: 1,
								specialServices: [
									{
										ssrCode: "AMEA",
										ssrId: 1,
										description: "A",
										amount: 100,
										qtyAvailable: 10,
										lfid: 100,
										cutOffHours: 0,
										maxCountServiceLevel: 5,
									},
								],
							},
						],
					},
				],
			},
		};

		const result = mapAncillaryDataToProducts(data as never);
		expect(result[0]?.remainingLabel).toBeUndefined();
	});
});

// ── updateSelectedCategoryIds ──────────────────────────────────────────────

describe("updateSelectedCategoryIds", () => {
	it("keeps 'all' when 'all' is already selected and re-selected", () => {
		expect(updateSelectedCategoryIds(["all"], "all")).toEqual(["all"]);
	});

	it("adds 'all' when it is not in the current selection", () => {
		expect(updateSelectedCategoryIds(["amenities"], "all")).toEqual(["all"]);
	});

	it("replaces 'all' with the new category when a specific category is selected", () => {
		expect(updateSelectedCategoryIds(["all"], "amenities")).toEqual(["amenities"]);
	});

	it("adds a new category to existing selections", () => {
		expect(updateSelectedCategoryIds(["amenities"], "airport-services")).toEqual([
			"amenities",
			"airport-services",
		]);
	});

	it("removes a category that is already selected", () => {
		expect(updateSelectedCategoryIds(["amenities", "airport-services"], "amenities")).toEqual([
			"airport-services",
		]);
	});

	it("falls back to 'all' when the last category is deselected", () => {
		expect(updateSelectedCategoryIds(["amenities"], "amenities")).toEqual(["all"]);
	});
});

// ── getProductsByCategory ──────────────────────────────────────────────────

describe("getProductsByCategory", () => {
	const products = [
		makeProduct({ id: "p1", categoryId: "amenities" }),
		makeProduct({ id: "p2", categoryId: "airport-services" }),
		makeProduct({ id: "p3", categoryId: "amenities" }),
	];

	it("returns all products when category is 'all'", () => {
		expect(getProductsByCategory(products, "all")).toHaveLength(3);
	});

	it("filters products by the given category", () => {
		const result = getProductsByCategory(products, "amenities");
		expect(result).toHaveLength(2);
		expect(result.every((p) => p.categoryId === "amenities")).toBe(true);
	});

	it("returns empty array when no products match the category", () => {
		expect(getProductsByCategory(products, "food-souvenirs")).toHaveLength(0);
	});
});

// ── updatePassengerSelections ──────────────────────────────────────────────

describe("updatePassengerSelections", () => {
	it("selects a passenger when within available quantity", () => {
		const result = updatePassengerSelections({ p1: false, p2: false }, "p1", true, [], 5);
		expect(result.p1).toBe(true);
	});

	it("deselects a passenger", () => {
		const result = updatePassengerSelections({ p1: true, p2: false }, "p1", false, [], 5);
		expect(result.p1).toBe(false);
	});

	it("does not change selection if passenger is bundled", () => {
		const result = updatePassengerSelections({ p1: false }, "p1", true, ["p1"], 5);
		expect(result.p1).toBe(false);
	});

	it("does not select when already at max capacity", () => {
		const result = updatePassengerSelections(
			{ p1: true, p2: false },
			"p2",
			true,
			[],
			1 // availableQty = 1, p1 already selected
		);
		expect(result.p2).toBe(false);
	});

	it("allows selecting when capacity is 0 (unlimited)", () => {
		const result = updatePassengerSelections({ p1: false }, "p1", true, [], 0);
		expect(result.p1).toBe(true);
	});
});

// ── getSelectAllSelections ─────────────────────────────────────────────────

describe("getSelectAllSelections", () => {
	const passengers = [
		makePassengerForDialog("p1"),
		makePassengerForDialog("p2"),
		makePassengerForDialog("p3"),
	];

	it("deselects all non-bundled passengers when selectAll is false", () => {
		const result = getSelectAllSelections(passengers, ["p1"], 5, false);
		expect(result.p1).toBe(true); // bundled → stays selected
		expect(result.p2).toBe(false);
		expect(result.p3).toBe(false);
	});

	it("selects all passengers up to availableQty when selectAll is true", () => {
		const result = getSelectAllSelections(passengers, [], 2, true);
		expect(result.p1).toBe(true);
		expect(result.p2).toBe(true);
		expect(result.p3).toBe(false); // 3rd exceeds qty limit of 2
	});

	it("always keeps bundled passengers selected when selecting all", () => {
		const result = getSelectAllSelections(passengers, ["p1"], 1, true);
		expect(result.p1).toBe(true); // bundled
		expect(result.p2).toBe(true); // first selectable
		expect(result.p3).toBe(false); // exceeds qty
	});

	it("selects all when availableQty exceeds passenger count", () => {
		const result = getSelectAllSelections(passengers, [], 10, true);
		expect(Object.values(result).every(Boolean)).toBe(true);
	});
});

// ── getDialogSummary ───────────────────────────────────────────────────────

describe("getDialogSummary", () => {
	const product = makeProduct({ price: 1000, qtyAvailable: 2 });

	it("returns zero total when no product is provided", () => {
		const result = getDialogSummary(null, { p1: true }, [], 2);
		expect(result.dialogTotal).toBe(0);
	});

	it("calculates total for selected non-bundled passengers", () => {
		const result = getDialogSummary(product, { p1: true, p2: true }, [], 2);
		expect(result.dialogTotal).toBe(2000);
	});

	it("excludes bundled passengers from the total", () => {
		const result = getDialogSummary(product, { p1: true, p2: true }, ["p1"], 2);
		expect(result.dialogTotal).toBe(1000); // only p2 is paid
	});

	it("sets isDialogSelectionFull when selected count reaches qtyAvailable", () => {
		const result = getDialogSummary(product, { p1: true, p2: true }, [], 3);
		expect(result.isDialogSelectionFull).toBe(true);
	});

	it("does not set isDialogSelectionFull when selected count is below qtyAvailable", () => {
		const result = getDialogSummary(product, { p1: true }, [], 3);
		expect(result.isDialogSelectionFull).toBe(false);
	});

	it("sets shouldShowOutOfStockAlert when selection is full but not all passengers selected", () => {
		// 2 paid selected, qtyAvailable=2 → full; 3 total non-bundled → alert
		const result = getDialogSummary(product, { p1: true, p2: true }, [], 3);
		expect(result.shouldShowOutOfStockAlert).toBe(true);
	});

	it("does not set shouldShowOutOfStockAlert when all non-bundled passengers are selected", () => {
		const result = getDialogSummary(product, { p1: true, p2: true }, [], 2);
		expect(result.shouldShowOutOfStockAlert).toBe(false);
	});
});

// ── getCategoriesToShow ────────────────────────────────────────────────────

describe("getCategoriesToShow", () => {
	const sections = [{ id: "amenities" }, { id: "airport-services" }, { id: "others" }];

	it("returns all section ids when 'all' is selected", () => {
		const result = getCategoriesToShow(["all"], sections);
		expect(result).toEqual(["amenities", "airport-services", "others"]);
	});

	it("returns the selected ids when 'all' is not included", () => {
		const result = getCategoriesToShow(["amenities", "others"], sections);
		expect(result).toEqual(["amenities", "others"]);
	});
});

// ── getVisibleSections ─────────────────────────────────────────────────────

describe("getVisibleSections", () => {
	const allSections = [
		{ id: "amenities", name: "Amenities" },
		{ id: "airport-services", name: "Airport Services" },
		{ id: "others", name: "Others" },
	];

	const productA = makeProduct({ id: "p1", categoryId: "amenities" });
	const productB = makeProduct({ id: "p2", categoryId: "airport-services" });

	it("returns only sections included in categoriesToShow", () => {
		const result = getVisibleSections(allSections, ["amenities"], () => []);
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("amenities");
	});

	it("maps section name to title", () => {
		const result = getVisibleSections(allSections, ["amenities"], () => []);
		expect(result[0]?.title).toBe("Amenities");
	});

	it("calls getProductsFn with the section id and attaches the result", () => {
		const getProductsFn = vi.fn((id: string) => (id === "amenities" ? [productA] : [productB]));

		const result = getVisibleSections(
			allSections,
			["amenities", "airport-services"],
			getProductsFn
		);

		expect(getProductsFn).toHaveBeenCalledWith("amenities");
		expect(getProductsFn).toHaveBeenCalledWith("airport-services");
		expect(result[0]?.products).toEqual([productA]);
		expect(result[1]?.products).toEqual([productB]);
	});

	it("returns empty array when no sections match categoriesToShow", () => {
		const result = getVisibleSections(allSections, ["food-souvenirs"], () => []);
		expect(result).toHaveLength(0);
	});
});

// ── checkBundlePassenger ───────────────────────────────────────────────────

describe("checkBundlePassenger", () => {
	it("returns false when passengers have no bundles", () => {
		expect(checkBundlePassenger([{ id: "p1", bundles: [] } as never])).toBe(false);
	});

	it("returns true when a passenger has a PREN bundle", () => {
		const passengers = [{ id: "p1", bundles: [{ bundleCode: "PREN", lfid: 100 }] }];
		expect(checkBundlePassenger(passengers as never)).toBe(true);
	});

	it("returns false when no passenger has a PREN bundle", () => {
		const passengers = [{ id: "p1", bundles: [{ bundleCode: "OTHER", lfid: 100 }] }];
		expect(checkBundlePassenger(passengers as never)).toBe(false);
	});

	it("filters by lfid when provided", () => {
		const passengers = [{ id: "p1", bundles: [{ bundleCode: "PREN", lfid: 200 }] }];
		expect(checkBundlePassenger(passengers as never, 100)).toBe(false);
		expect(checkBundlePassenger(passengers as never, 200)).toBe(true);
	});
});

// ── createPassengerItem ────────────────────────────────────────────────────

describe("createPassengerItem", () => {
	const t = (key: string) => {
		switch (key) {
			case "infant_label":
				return "0 - 1 year old";
			default:
				return key;
		}
	};

	it("combines first, middle, and last name", () => {
		const result = createPassengerItem(
			{
				id: "p1",
				firstName: "John",
				middleName: "A",
				lastName: "Doe",
				passengerTypeCode: "adult",
			} as never,
			t
		);
		expect(result.name).toBe("John A Doe");
	});

	it("handles missing middle name", () => {
		const result = createPassengerItem(
			{
				id: "p1",
				firstName: "Jane",
				lastName: "Smith",
				passengerTypeCode: "adult",
			} as never,
			t
		);
		expect(result.name).toBe("Jane Smith");
	});

	it("uses the passenger type code for non-translated categories", () => {
		const result = createPassengerItem(
			{
				id: "p1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "adult",
			} as never,
			t
		);
		expect(result.category).toBe("adult");
	});

	it("sets category to '0 - 1 year old' for infant passengers", () => {
		const result = createPassengerItem(
			{
				id: "p1",
				firstName: "Baby",
				lastName: "Doe",
				passengerTypeCode: "infant",
			} as never,
			t
		);
		expect(result.category).toBe("0 - 1 year old");
	});

	it("sets price to 0 and checked to false", () => {
		const result = createPassengerItem(
			{
				id: "p1",
				firstName: "X",
				lastName: "Y",
				passengerTypeCode: "adult",
			} as never,
			t
		);
		expect(result.price).toBe(0);
		expect(result.checked).toBe(false);
	});

	it("returns the correct id", () => {
		const result = createPassengerItem(
			{
				id: "pax-42",
				firstName: "A",
				lastName: "B",
				passengerTypeCode: "adult",
			} as never,
			t
		);
		expect(result.id).toBe("pax-42");
	});
});
