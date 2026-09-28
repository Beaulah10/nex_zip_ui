import { describe, expect, it } from "vitest";
import {
	buildAvailableBaggageInventory,
	buildBaggageInventory,
	restorePassengerBaggageInventory,
	validateBundleIncludedBaggageInventory,
} from "./baggage-inventory";

type BundlePassenger = Parameters<typeof validateBundleIncludedBaggageInventory>[0]["passengers"];

type BundlePassengerItem = NonNullable<BundlePassenger>[number];

const createOffer = (overrides: Record<string, unknown>) => ({
	amount: 0,
	currency: "JPY",
	qtyAvailable: 0,
	ssrCode: "",
	lfid: 1001,
	pfid: 0,
	ssrId: 1,
	cutOffHours: 0,
	maxCountServiceLevel: 999,
	description: "",
	startSalesDays: 0,
	...overrides,
});

const createPassengerService = (overrides: Record<string, unknown>) => ({
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
	...overrides,
});

const createPassenger = (overrides: Record<string, unknown>) => ({
	id: "passenger1",
	firstName: "John",
	lastName: "Doe",
	passengerTypeCode: "adult",
	...overrides,
});

const createBundlePassenger = (
	overrides: Partial<BundlePassengerItem> = {}
): BundlePassengerItem => ({
	id: "1",
	name: "John Doe",
	bundleCode: "NOBN",
	bundleLabel: "None",
	mealfeatures: [],
	baggagefeatures: [],
	passengerTypeCode: "adult",
	...overrides,
	isIcnRoute: overrides.isIcnRoute ?? false,
	isValueBundle: overrides.isValueBundle ?? overrides.bundleCode === "VALK",
});

describe("baggage-inventory helpers", () => {
	describe("buildBaggageInventory", () => {
		it("creates inventory from baggage offer response", () => {
			const response = {
				carryOn: {
					CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 5, amount: 4000, ssrId: 1281 }),
					"7KG": createOffer({ ssrCode: "7KG", qtyAvailable: 0, amount: 0, ssrId: 1280 }),
				},
				checkedIn: {
					BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 10, amount: 7500, ssrId: 1221 }),
				},
				sportsEquipment: {
					SKII: createOffer({ ssrCode: "SKII", qtyAvailable: 2, amount: 7000, ssrId: 184 }),
					GOLF: createOffer({ ssrCode: "GOLF", qtyAvailable: 3, amount: 7000, ssrId: 183 }),
				},
			};

			const result = buildBaggageInventory(response);

			expect(result.CABN).toBe(5);
			expect(result["7KG"]).toBe(0);
			expect(result.BAGN).toBe(10);
			expect(result.SKII).toBe(2);
			expect(result.GOLF).toBe(3);
		});

		it("returns empty object when response is undefined", () => {
			const result = buildBaggageInventory(undefined);

			expect(result).toEqual({});
		});

		it("handles missing categories gracefully", () => {
			const response = {
				carryOn: {
					CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 5, amount: 4000, ssrId: 1281 }),
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = buildBaggageInventory(response);

			expect(result.CABN).toBe(5);
			expect(Object.keys(result)).toHaveLength(1);
		});

		it("handles null qtyAvailable as 0", () => {
			const response = {
				carryOn: {
					CABN: createOffer({ ssrCode: "CABN", qtyAvailable: null, amount: 4000, ssrId: 1281 }),
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = buildBaggageInventory(response);

			expect(result.CABN).toBe(0);
		});
	});

	describe("buildAvailableBaggageInventory", () => {
		it("reduces inventory based on existing passenger services", () => {
			const baseInventory = { CABN: 10, BAGN: 20, SKII: 5 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: {
						baggage: [
							{ lfid: 1001, ssrCode: "CABN", categoryId: 144 },
							{ lfid: 1001, ssrCode: "BAGN", categoryId: 143 },
							{ lfid: 1001, ssrCode: "BAGN", categoryId: 143 },
						],
					},
				}),
				createPassenger({
					id: "passenger2",
					services: {
						baggage: [{ lfid: 1001, ssrCode: "SKII", categoryId: 145 }],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: 1001,
			});

			expect(result.CABN).toBe(9);
			expect(result.BAGN).toBe(18);
			expect(result.SKII).toBe(4);
		});

		it("ignores services from different lfid", () => {
			const baseInventory = { CABN: 10, BAGN: 20 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: {
						baggage: [
							{ lfid: 2001, ssrCode: "CABN", categoryId: 144 },
							{ lfid: 1001, ssrCode: "BAGN", categoryId: 143 },
						],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: 1001,
			});

			expect(result.CABN).toBe(10); // Unchanged
			expect(result.BAGN).toBe(19);
		});

		it("returns base inventory when currentLfid is undefined", () => {
			const baseInventory = { CABN: 10, BAGN: 20 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: {
						baggage: [{ lfid: 1001, ssrCode: "CABN", categoryId: 144 }],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: undefined,
			});

			expect(result).toEqual(baseInventory);
		});

		it("prevents inventory from going negative", () => {
			const baseInventory = { CABN: 2, BAGN: 5 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: {
						baggage: [
							{ lfid: 1001, ssrCode: "CABN", categoryId: 144 },
							{ lfid: 1001, ssrCode: "CABN", categoryId: 144 },
							{ lfid: 1001, ssrCode: "CABN", categoryId: 144 },
						],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: 1001,
			});

			expect(result.CABN).toBe(0);
		});

		it("ignores services with undefined ssrCode", () => {
			const baseInventory = { CABN: 10, BAGN: 20 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: {
						baggage: [
							{ lfid: 1001, ssrCode: undefined, categoryId: 144 },
							{ lfid: 1001, ssrCode: "BAGN", categoryId: 143 },
						],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: 1001,
			});

			expect(result.CABN).toBe(10);
			expect(result.BAGN).toBe(19);
		});

		it("ignores services with ssrCode not in base inventory", () => {
			const baseInventory = { CABN: 10, BAGN: 20 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: {
						baggage: [
							{ lfid: 1001, ssrCode: "UNKNOWN", categoryId: 999 },
							{ lfid: 1001, ssrCode: "CABN", categoryId: 144 },
						],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: 1001,
			});

			expect(result.CABN).toBe(9);
			expect(result.UNKNOWN).toBeUndefined();
		});

		it("handles passengers without baggage services", () => {
			const baseInventory = { CABN: 10, BAGN: 20 };
			const passengerList = [
				createPassenger({
					id: "passenger1",
					services: undefined,
				}),
				createPassenger({
					id: "passenger2",
					services: {
						other: [],
					},
				}),
			];

			const result = buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid: 1001,
			});

			expect(result).toEqual(baseInventory);
		});
	});

	describe("restorePassengerBaggageInventory", () => {
		it("adds back passenger's existing baggage services to available inventory", () => {
			const availableInventory = { CABN: 5, BAGN: 8, SKII: 2 };
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

			const result = restorePassengerBaggageInventory({
				availableInventory,
				baggageServices,
			});

			expect(result.CABN).toBe(6);
			expect(result.BAGN).toBe(10);
			expect(result.SKII).toBe(3);
		});

		it("returns available inventory unchanged when baggageServices is undefined", () => {
			const availableInventory = { CABN: 5, BAGN: 8 };

			const result = restorePassengerBaggageInventory({
				availableInventory,
				baggageServices: undefined,
			});

			expect(result).toEqual(availableInventory);
		});

		it("ignores services with undefined ssrCode", () => {
			const availableInventory = { CABN: 5 };
			const baggageServices = {
				carryOn: {
					CABN: {
						...createPassengerService({
							ssrCode: undefined as unknown as string,
						}),
					},
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = restorePassengerBaggageInventory({
				availableInventory,
				baggageServices,
			});

			expect(result.CABN).toBe(5);
		});

		it("creates new inventory keys if needed", () => {
			const availableInventory = {};
			const baggageServices = {
				carryOn: {},
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
				sportsEquipment: {},
			};

			const result = restorePassengerBaggageInventory({
				availableInventory,
				baggageServices,
			});

			expect(result.BAGN).toBe(2);
		});
	});

	describe("validateBundleIncludedBaggageInventory", () => {
		it("returns valid when no bundle passengers", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "NOBN" }),
				createBundlePassenger({ id: "2", bundleCode: "NOBN", name: "Jane Doe" }),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: { CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 0, ssrId: 1281 }) },
						checkedIn: { BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 0, ssrId: 1221 }) },
						sportsEquipment: {},
					},
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(true);
		});

		it("returns invalid when carry-on inventory is insufficient for PREMIUM/FLEXBIZ", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "PRMK", bundleLabel: "Premium" }),
				createBundlePassenger({
					id: "2",
					name: "Jane Doe",
					bundleCode: "FLBS",
					bundleLabel: "FlexBiz",
				}),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: { CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 1, ssrId: 1281 }) },
						checkedIn: { BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 10, ssrId: 1221 }) },
						sportsEquipment: {},
					},
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(false);
			expect(result.reason).toContain("Carry-on");
		});

		it("returns valid for VALUE-only passengers when carry-on inventory is unavailable", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "VALK", bundleLabel: "Value" }),
				createBundlePassenger({ id: "2", bundleCode: "VALK", name: "Jane Doe" }),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: { CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 0, ssrId: 1281 }) },
						checkedIn: { BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 2, ssrId: 1221 }) },
						sportsEquipment: {},
					},
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(true);
		});

		it("returns invalid when checked-in inventory is insufficient for VALUE/PREMIUM", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "VALK", bundleLabel: "Value" }),
				createBundlePassenger({
					id: "2",
					name: "Jane Doe",
					bundleCode: "PRMK",
					bundleLabel: "Premium",
				}),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: { CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 10, ssrId: 1281 }) },
						checkedIn: { BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 1, ssrId: 1221 }) },
						sportsEquipment: {},
					},
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(false);
			expect(result.reason).toContain("Checked-in");
		});

		it("validates carry-on and checked-in counts independently for mixed bundles", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "PRMK", bundleLabel: "Premium" }),
				createBundlePassenger({ id: "2", bundleCode: "VALK", name: "Jane Doe" }),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: { CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 1, ssrId: 1281 }) },
						checkedIn: { BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 2, ssrId: 1221 }) },
						sportsEquipment: {},
					},
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(true);
		});

		it("returns valid when all inventory requirements are met", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "VALK", bundleLabel: "Value" }),
				createBundlePassenger({
					id: "2",
					name: "Jane Doe",
					bundleCode: "PRMK",
					bundleLabel: "Premium",
				}),
				createBundlePassenger({
					id: "3",
					name: "Jack Doe",
					bundleCode: "FLBS",
					bundleLabel: "FlexBiz",
				}),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: { CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 10, ssrId: 1281 }) },
						checkedIn: { BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 10, ssrId: 1221 }) },
						sportsEquipment: {},
					},
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(true);
		});

		it("handles missing categories gracefully", () => {
			const passengers = [
				createBundlePassenger({ id: "1", bundleCode: "PRMK", bundleLabel: "Premium" }),
			];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {} as never,
				},
			};

			const result = validateBundleIncludedBaggageInventory({
				passengers,
				baggageOffersByPassengerType,
			});

			expect(result.isValid).toBe(false);
		});
	});
});
