import { describe, expect, it } from "vitest";
import {
	formatBaggagePreselectedText,
	getBaggageOffersByPassengerType,
	getBaggageServicesResponse,
	getCarryOnOptionsByPassengerType,
	getFreeBaggageItemCount,
	getSportsEquipmentOptionsByPassengerType,
} from "./baggage-offers";

const createSpecialService = (overrides: Record<string, unknown>) => ({
	ssrCode: "CABN",
	amount: 4000,
	currency: "JPY",
	qtyAvailable: 5,
	lfid: 1001,
	pfid: 0,
	ssrId: 1281,
	cutOffHours: 0,
	maxCountServiceLevel: 100,
	description: "Carry-on",
	startSalesDays: 0,
	...overrides,
});

const createServicesPerPassengerType = (
	passengerType: "adult" | "child" | "infant",
	categories: NonNullable<Parameters<typeof getBaggageServicesResponse>[0]>["categories"]
) =>
	({
		passengerType,
		categories,
	}) as NonNullable<Parameters<typeof getBaggageServicesResponse>[0]>;

const createAncillaryResponse = (
	servicesPerPassengerType: NonNullable<
		NonNullable<Parameters<typeof getBaggageOffersByPassengerType>[0]>["data"]
	>["servicesPerPassengerType"]
) =>
	({
		data: {
			servicesPerPassengerType,
		},
	}) as NonNullable<Parameters<typeof getBaggageOffersByPassengerType>[0]>;

describe("baggage-offers helpers", () => {
	describe("getBaggageServicesResponse", () => {
		it("transforms API response to organized categories", () => {
			const response = createServicesPerPassengerType("adult", [
				{
					categoryId: 144,
					title: "Carry-on",
					specialServices: [
						createSpecialService({
							ssrCode: "CABN",
							amount: 4000,
							ssrId: 1281,
							description: "Carry-on 15kg",
						}),
					],
				},
				{
					categoryId: 143,
					title: "Checked-in",
					specialServices: [
						createSpecialService({
							ssrCode: "BAGN",
							amount: 7500,
							qtyAvailable: 10,
							ssrId: 1221,
							maxCountServiceLevel: 999,
							description: "Checked-in Baggage",
						}),
					],
				},
				{
					categoryId: 145,
					title: "Sports",
					specialServices: [
						createSpecialService({
							ssrCode: "SKII",
							amount: 7000,
							qtyAvailable: 2,
							ssrId: 184,
							maxCountServiceLevel: 999,
							description: "Ski Equipment",
						}),
					],
				},
			]);

			const result = getBaggageServicesResponse(response);

			expect(result.carryOn.CABN?.ssrCode).toBe("CABN");
			expect(result.checkedIn.BAGN?.ssrCode).toBe("BAGN");
			expect(result.sportsEquipment.SKII?.ssrCode).toBe("SKII");
		});

		it("returns empty structure when response is undefined", () => {
			const result = getBaggageServicesResponse(undefined);

			expect(result).toEqual({
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			});
		});

		it("handles missing categories", () => {
			const response = createServicesPerPassengerType("adult", [
				{
					categoryId: 144,
					title: "Carry-on",
					specialServices: [createSpecialService({ ssrCode: "CABN", description: "Carry-on" })],
				},
			]);

			const result = getBaggageServicesResponse(response);

			expect(result.carryOn.CABN).toBeDefined();
			expect(result.checkedIn).toEqual({});
			expect(result.sportsEquipment).toEqual({});
		});

		it("handles services with multiple items per category", () => {
			const response = createServicesPerPassengerType("adult", [
				{
					categoryId: 145,
					title: "Sports",
					specialServices: [
						createSpecialService({
							ssrCode: "SKII",
							amount: 7000,
							qtyAvailable: 2,
							ssrId: 184,
							maxCountServiceLevel: 999,
							description: "Ski",
						}),
						createSpecialService({
							ssrCode: "GOLF",
							amount: 7000,
							qtyAvailable: 3,
							ssrId: 183,
							maxCountServiceLevel: 999,
							description: "Golf",
						}),
					],
				},
			]);

			const result = getBaggageServicesResponse(response);

			expect(Object.keys(result.sportsEquipment)).toHaveLength(2);
			expect(result.sportsEquipment.SKII).toBeDefined();
			expect(result.sportsEquipment.GOLF).toBeDefined();
		});
	});

	describe("getBaggageOffersByPassengerType", () => {
		it("transforms API response by passenger type", () => {
			const response = createAncillaryResponse([
				createServicesPerPassengerType("adult", [
					{
						categoryId: 144,
						title: "Carry-on",
						specialServices: [createSpecialService({ ssrCode: "CABN", amount: 4000, ssrId: 1281 })],
					},
					{ categoryId: 143, title: "Checked-in", specialServices: [] },
					{ categoryId: 145, title: "Sports", specialServices: [] },
				]),
				createServicesPerPassengerType("child", [
					{
						categoryId: 144,
						title: "Carry-on",
						specialServices: [createSpecialService({ ssrCode: "CABN", amount: 2000, ssrId: 1281 })],
					},
					{ categoryId: 143, title: "Checked-in", specialServices: [] },
					{ categoryId: 145, title: "Sports", specialServices: [] },
				]),
			]);

			const result = getBaggageOffersByPassengerType(response);

			expect(result.adult).toBeDefined();
			expect(result.child).toBeDefined();
			expect(result.adult?.categories.carryOn.CABN?.amount).toBe(4000);
			expect(result.child?.categories.carryOn.CABN?.amount).toBe(2000);
		});

		it("returns empty object when response is undefined", () => {
			const result = getBaggageOffersByPassengerType(undefined);

			expect(result).toEqual({});
		});

		it("returns empty object when data is undefined", () => {
			const response = { data: undefined } as unknown as Parameters<
				typeof getBaggageOffersByPassengerType
			>[0];

			const result = getBaggageOffersByPassengerType(response);

			expect(result).toEqual({});
		});

		it("returns empty object when servicesPerPassengerType is undefined", () => {
			const response = { data: { servicesPerPassengerType: undefined } } as unknown as Parameters<
				typeof getBaggageOffersByPassengerType
			>[0];

			const result = getBaggageOffersByPassengerType(response);

			expect(result).toEqual({});
		});

		it("handles multiple passenger types correctly", () => {
			const response = createAncillaryResponse([
				createServicesPerPassengerType("adult", [
					{
						categoryId: 144,
						title: "Carry-on",
						specialServices: [createSpecialService({ ssrCode: "CABN", amount: 4000, ssrId: 1281 })],
					},
					{ categoryId: 143, title: "Checked-in", specialServices: [] },
					{ categoryId: 145, title: "Sports", specialServices: [] },
				]),
				createServicesPerPassengerType("infant", [
					{ categoryId: 144, title: "Carry-on", specialServices: [] },
					{ categoryId: 143, title: "Checked-in", specialServices: [] },
					{ categoryId: 145, title: "Sports", specialServices: [] },
				]),
			]);

			const result = getBaggageOffersByPassengerType(response);

			expect(Object.keys(result)).toHaveLength(2);
			expect(result.adult?.passengerType).toBe("adult");
			expect(result.infant?.passengerType).toBe("infant");
		});
	});

	describe("getCarryOnOptionsByPassengerType", () => {
		it("returns default options when passenger offers not found", () => {
			const baggageOffersByPassengerType = {};

			const result = getCarryOnOptionsByPassengerType(baggageOffersByPassengerType, "unknown", {});

			expect(result).toHaveLength(2);
			expect(result[0]?.id).toBe("7kg");
			expect(result[1]?.id).toBe("CABN");
			expect(result[0]?.qtyAvailable).toBe(0);
			expect(result[1]?.qtyAvailable).toBe(0);
		});

		it("returns carry-on options with inventory", () => {
			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {
							CABN: createSpecialService({
								ssrCode: "CABN",
								amount: 4000,
								qtyAvailable: 5,
								ssrId: 1281,
							}),
						},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
			};

			const availableInventory = { CABN: 3 };

			const result = getCarryOnOptionsByPassengerType(
				baggageOffersByPassengerType,
				"adult",
				availableInventory
			);

			expect(result).toHaveLength(2);
			expect(result[1]?.price).toBe(4000);
			expect(result[1]?.qtyAvailable).toBe(3);
		});

		it("defaults to adult when passenger type undefined", () => {
			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {
							CABN: createSpecialService({
								ssrCode: "CABN",
								amount: 4000,
								qtyAvailable: 5,
								ssrId: 1281,
							}),
						},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
			};

			const result = getCarryOnOptionsByPassengerType(baggageOffersByPassengerType, undefined, {});

			expect(result[1]?.price).toBe(4000);
		});
	});

	describe("getSportsEquipmentOptionsByPassengerType", () => {
		it("returns sports equipment options with availability", () => {
			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {},
						sportsEquipment: {
							SKII: createSpecialService({
								ssrCode: "SKII",
								amount: 7000,
								qtyAvailable: 2,
								ssrId: 184,
								maxCountServiceLevel: 999,
								description: "Ski",
							}),
							GOLF: createSpecialService({
								ssrCode: "GOLF",
								amount: 7000,
								qtyAvailable: 3,
								ssrId: 183,
								maxCountServiceLevel: 999,
								description: "Golf",
							}),
						},
					},
				},
			};

			const availableInventory = { SKII: 1, GOLF: 2 };

			const result = getSportsEquipmentOptionsByPassengerType(
				baggageOffersByPassengerType,
				"adult",
				availableInventory
			);

			const skiOption = result.find((item) => item.id === "SKII");
			const golfOption = result.find((item) => item.id === "GOLF");

			expect(skiOption?.qtyAvailable).toBe(1);
			expect(skiOption?.price).toBe(7000);
			expect(golfOption?.qtyAvailable).toBe(2);
			expect(golfOption?.price).toBe(7000);
		});

		it("returns default options when category not found", () => {
			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
			};

			const result = getSportsEquipmentOptionsByPassengerType(
				baggageOffersByPassengerType,
				"adult",
				{}
			);

			// Should return default SPORTS_EQUIPMENT_MAP items
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]?.qtyAvailable).toBe(0);
			expect(result[0]?.price).toBe(0);
		});

		it("returns default sports equipment when passenger not found", () => {
			const baggageOffersByPassengerType = {};

			const result = getSportsEquipmentOptionsByPassengerType(
				baggageOffersByPassengerType,
				"adult",
				{}
			);

			expect(result.length).toBeGreaterThan(0);
			expect(result[0]?.id).toBeDefined();
		});

		it("matches available inventory to equipment items", () => {
			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {},
						sportsEquipment: {
							BIKE: createSpecialService({
								ssrCode: "BIKE",
								amount: 11000,
								qtyAvailable: 5,
								ssrId: 185,
								maxCountServiceLevel: 999,
								description: "Bike",
							}),
						},
					},
				},
			};

			const availableInventory = { BIKE: 4 };

			const result = getSportsEquipmentOptionsByPassengerType(
				baggageOffersByPassengerType,
				"adult",
				availableInventory
			);

			const bikeOption = result.find((item) => item.id === "BIKE");
			expect(bikeOption?.qtyAvailable).toBe(4);
		});
	});

	describe("getFreeBaggageItemCount", () => {
		it("returns 2 for value bundle codes", () => {
			expect(getFreeBaggageItemCount("VALK")).toBe(2);
		});

		it("returns 2 for premium bundle codes", () => {
			expect(getFreeBaggageItemCount("PRMK")).toBe(2);
		});

		it("returns 1 for no-bundle and flex-biz bundle codes", () => {
			expect(getFreeBaggageItemCount("NOBN")).toBe(1);
			expect(getFreeBaggageItemCount("FLBF")).toBe(1);
		});
	});

	describe("formatBaggagePreselectedText", () => {
		it("returns undefined when total items is zero or less", () => {
			expect(formatBaggagePreselectedText(0)).toBeUndefined();
			expect(formatBaggagePreselectedText(-1)).toBeUndefined();
		});

		it("formats singular item text", () => {
			expect(formatBaggagePreselectedText(1)).toBe("1 free baggage item preselected");
		});

		it("formats plural items text", () => {
			expect(formatBaggagePreselectedText(5)).toBe("5 free baggage items preselected");
		});
	});
});
