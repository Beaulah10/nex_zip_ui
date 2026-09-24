import { describe, expect, it } from "vitest";
import type { PassengerWithBaggageSelection } from "@/types/baggage-selection/baggage-selection.types";
import {
	collectBaggageSegmentMismatchPassengerIds,
	compareBaggageServices,
	compareSegmentSelections,
	getQuantity,
	hasAnyBaggageSelection,
	hasCabn,
} from "./baggage-validation";

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
	description: "Carry-on 15kg",
	...overrides,
});

const createQuantityService = (overrides: Record<string, unknown>) => ({
	service: createPassengerService({
		ssrCode: "BAGN",
		amount: 7500,
		categoryId: 143,
		maxCountServiceLevel: 999,
		serviceID: 1221,
		description: "Checked-in",
		...overrides,
	}),
	quantity: 1,
});

const createPassengerWithBaggage = (
	carryOn: Parameters<typeof hasCabn>[0],
	checkedIn: Parameters<typeof getQuantity>[0],
	sports: Parameters<typeof getQuantity>[0]
) =>
	({
		passenger: {
			id: "passenger1",
			name: "John Doe",
			passengerTypeCode: "adult",
			bundleCode: "PRMK",
			bundleLabel: "Premium",
			mealfeatures: [],
			baggagefeatures: [],
			isIcnRoute: false,
			isValueBundle: false,
		},
		baggageServices: {
			carryOn,
			checkedIn,
			sportsEquipment: sports,
		},
		categories: [],
		totalPrice: 0,
	}) as PassengerWithBaggageSelection;

const createSelection = (
	carryOn: Parameters<typeof hasCabn>[0],
	checkedIn: Parameters<typeof getQuantity>[0],
	sports: Parameters<typeof getQuantity>[0]
) =>
	({
		passenger: {
			id: "passenger1",
			name: "John Doe",
			passengerTypeCode: "adult",
			bundleCode: "PRMK",
			bundleLabel: "Premium",
			mealfeatures: [],
			baggagefeatures: [],
			isIcnRoute: false,
			isValueBundle: false,
		},
		baggageServices: {
			carryOn,
			checkedIn,
			sportsEquipment: sports,
		},
		categories: [],
		totalPrice: 0,
	}) as PassengerWithBaggageSelection;

describe("baggage-validation helpers", () => {
	describe("hasCabn", () => {
		it("returns true when CABN service exists", () => {
			const carryOn = {
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
					description: "Carry-on 15kg",
				},
			};

			expect(hasCabn(carryOn)).toBe(true);
		});

		it("returns false when CABN service does not exist", () => {
			const carryOn = {};

			expect(hasCabn(carryOn)).toBe(false);
		});

		it("returns false for empty carry-on object", () => {
			expect(hasCabn({})).toBe(false);
		});

		it("returns false when CABN has falsy value", () => {
			const carryOn = { CABN: null } as unknown as Parameters<typeof hasCabn>[0];

			expect(hasCabn(carryOn)).toBe(false);
		});
	});

	describe("getQuantity", () => {
		it("returns quantity when service exists", () => {
			const services = {
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
					quantity: 3,
				},
			};

			expect(getQuantity(services, "BAGN")).toBe(3);
		});

		it("returns 0 when service does not exist", () => {
			const services = {};

			expect(getQuantity(services, "BAGN")).toBe(0);
		});

		it("returns 0 when quantity is undefined", () => {
			const services = {
				BAGN: {
					service: createPassengerService({
						ssrCode: "BAGN",
						amount: 7500,
						categoryId: 143,
						maxCountServiceLevel: 999,
						serviceID: 1221,
						description: "Checked-in",
					}),
					quantity: undefined,
				},
			} as unknown as Parameters<typeof getQuantity>[0];

			expect(getQuantity(services, "BAGN")).toBe(0);
		});

		it("handles multiple services correctly", () => {
			const services = {
				BAGN: {
					service: createPassengerService({
						ssrCode: "BAGN",
						amount: 7500,
						categoryId: 143,
						maxCountServiceLevel: 999,
						serviceID: 1221,
						description: "Checked-in",
					}),
					quantity: 2,
				},
				SKII: {
					service: createPassengerService({
						ssrCode: "SKII",
						amount: 7000,
						categoryId: 145,
						maxCountServiceLevel: 999,
						serviceID: 184,
						description: "Ski",
					}),
					quantity: 1,
				},
				GOLF: {
					service: createPassengerService({
						ssrCode: "GOLF",
						amount: 7000,
						categoryId: 145,
						maxCountServiceLevel: 999,
						serviceID: 183,
						description: "Golf",
					}),
					quantity: 2,
				},
			};

			expect(getQuantity(services, "BAGN")).toBe(2);
			expect(getQuantity(services, "SKII")).toBe(1);
			expect(getQuantity(services, "GOLF")).toBe(2);
			expect(getQuantity(services, "BIKE")).toBe(0);
		});
	});

	describe("compareSegmentSelections", () => {
		it("returns comparison with current having more baggage", () => {
			const current = createPassengerWithBaggage(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 3,
					},
				},
				{}
			);

			const other = createPassengerWithBaggage(
				{},
				{
					BAGN: createQuantityService({
						ssrCode: "BAGN",
						amount: 7500,
						categoryId: 143,
						serviceID: 1221,
						description: "Checked-in",
						maxCountServiceLevel: 999,
					}),
				},
				{}
			);

			const result = compareSegmentSelections(current, other);

			expect(result.hasCurrentGreater).toBe(true);
			expect(result.hasOtherGreater).toBe(false);
			expect(result.currentGreater).toContain("CABN");
			expect(result.currentGreater).toContain("BAGN");
		});

		it("returns comparison with other having more baggage", () => {
			const current = createPassengerWithBaggage({}, {}, {});

			const other = createPassengerWithBaggage(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 2,
					},
				},
				{
					SKII: {
						...createQuantityService({
							ssrCode: "SKII",
							amount: 7000,
							categoryId: 145,
							serviceID: 184,
							description: "Ski",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				}
			);

			const result = compareSegmentSelections(current, other);

			expect(result.hasOtherGreater).toBe(true);
			expect(result.hasCurrentGreater).toBe(false);
			expect(result.otherGreater).toContain("CABN");
		});

		it("returns equal when both have same baggage", () => {
			const current = createPassengerWithBaggage(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 2,
					},
				},
				{}
			);

			const other = createPassengerWithBaggage(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 2,
					},
				},
				{}
			);

			const result = compareSegmentSelections(current, other);

			expect(result.hasCurrentGreater).toBe(false);
			expect(result.hasOtherGreater).toBe(false);
			expect(result.currentGreater).toEqual([]);
			expect(result.otherGreater).toEqual([]);
		});

		it("handles sports equipment in comparison", () => {
			const current = createPassengerWithBaggage(
				{},
				{},
				{
					SKII: {
						...createQuantityService({
							ssrCode: "SKII",
							amount: 7000,
							categoryId: 145,
							serviceID: 184,
							description: "Ski",
							maxCountServiceLevel: 999,
						}),
						quantity: 2,
					},
					GOLF: {
						...createQuantityService({
							ssrCode: "GOLF",
							amount: 7000,
							categoryId: 145,
							serviceID: 183,
							description: "Golf",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				}
			);

			const other = createPassengerWithBaggage(
				{},
				{},
				{
					SKII: {
						...createQuantityService({
							ssrCode: "SKII",
							amount: 7000,
							categoryId: 145,
							serviceID: 184,
							description: "Ski",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				}
			);

			const result = compareSegmentSelections(current, other);

			expect(result.hasCurrentGreater).toBe(true);
			expect(result.currentGreater).toContain("SKII");
			expect(result.currentGreater).toContain("GOLF");
		});

		it("handles mixed baggage types correctly", () => {
			const current = createPassengerWithBaggage(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 2,
					},
				},
				{
					SKII: {
						...createQuantityService({
							ssrCode: "SKII",
							amount: 7000,
							categoryId: 145,
							serviceID: 184,
							description: "Ski",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				}
			);

			const other = createPassengerWithBaggage(
				{},
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 3,
					},
				},
				{}
			);

			const result = compareSegmentSelections(current, other);

			expect(result.hasCurrentGreater).toBe(true);
			expect(result.hasOtherGreater).toBe(true);
			expect(result.currentGreater).toContain("CABN");
			expect(result.currentGreater).toContain("SKII");
			expect(result.otherGreater).toContain("BAGN");
		});
	});

	describe("hasAnyBaggageSelection", () => {
		it("returns true when carry-on is selected", () => {
			const selection = createSelection(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{},
				{}
			);

			expect(hasAnyBaggageSelection(selection)).toBe(true);
		});

		it("returns true when checked-in baggage is selected", () => {
			const selection = createSelection(
				{},
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 2,
					},
				},
				{}
			);

			expect(hasAnyBaggageSelection(selection)).toBe(true);
		});

		it("returns true when sports equipment is selected", () => {
			const selection = createSelection(
				{},
				{},
				{
					SKII: {
						...createQuantityService({
							ssrCode: "SKII",
							amount: 7000,
							categoryId: 145,
							serviceID: 184,
							description: "Ski",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				}
			);

			expect(hasAnyBaggageSelection(selection)).toBe(true);
		});

		it("returns false when no baggage is selected", () => {
			const selection = createSelection({}, {}, {});

			expect(hasAnyBaggageSelection(selection)).toBe(false);
		});

		it("returns true when multiple baggage types are selected", () => {
			const selection = createSelection(
				{ CABN: createPassengerService({ ssrCode: "CABN" }) },
				{
					BAGN: {
						...createQuantityService({
							ssrCode: "BAGN",
							amount: 7500,
							categoryId: 143,
							serviceID: 1221,
							description: "Checked-in",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				},
				{
					GOLF: {
						...createQuantityService({
							ssrCode: "GOLF",
							amount: 7000,
							categoryId: 145,
							serviceID: 183,
							description: "Golf",
							maxCountServiceLevel: 999,
						}),
						quantity: 1,
					},
				}
			);

			expect(hasAnyBaggageSelection(selection)).toBe(true);
		});
	});

	describe("compareBaggageServices", () => {
		it("returns current greater when current has more baggage", () => {
			const current = {
				carryOn: {
					CABN: createPassengerService({ ssrCode: "CABN" }),
				},
				checkedIn: {
					BAGN: {
						...createQuantityService({}),
						quantity: 2,
					},
				},
				sportsEquipment: {},
			};

			const other = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = compareBaggageServices(current, other);

			expect(result.hasCurrentGreater).toBe(true);
			expect(result.hasOtherGreater).toBe(false);
			expect(result.currentGreater).toContain("CABN");
			expect(result.currentGreater).toContain("BAGN");
		});

		it("returns other greater when other has more baggage", () => {
			const current = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			};

			const other = {
				carryOn: {
					CABN: createPassengerService({ ssrCode: "CABN" }),
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = compareBaggageServices(current, other);

			expect(result.hasOtherGreater).toBe(true);
			expect(result.otherGreater).toContain("CABN");
		});

		it("returns equal when baggage services match", () => {
			const current = {
				carryOn: {
					CABN: createPassengerService({ ssrCode: "CABN" }),
				},
				checkedIn: {
					BAGN: {
						...createQuantityService({}),
						quantity: 2,
					},
				},
				sportsEquipment: {},
			};

			const other = structuredClone(current);

			const result = compareBaggageServices(current, other);

			expect(result.hasCurrentGreater).toBe(false);
			expect(result.hasOtherGreater).toBe(false);
			expect(result.currentGreater).toEqual([]);
			expect(result.otherGreater).toEqual([]);
		});

		it("handles sports equipment differences", () => {
			const current = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {
					SKII: {
						...createQuantityService({ ssrCode: "SKII" }),
						quantity: 2,
					},
				},
			};

			const other = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {
					SKII: {
						...createQuantityService({ ssrCode: "SKII" }),
						quantity: 1,
					},
				},
			};

			const result = compareBaggageServices(current, other);

			expect(result.hasCurrentGreater).toBe(true);
			expect(result.currentGreater).toContain("SKII");
		});
		it("handles SSR codes present only in current selection", () => {
			const result = compareBaggageServices(
				{
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {
						BIKE: {
							...createQuantityService({ ssrCode: "BIKE" }),
							quantity: 1,
						},
					},
				},
				{
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				}
			);

			expect(result.currentGreater).toContain("BIKE");
		});
	});

	describe("collectBaggageSegmentMismatchPassengerIds", () => {
		it("collects passengers where segment2 has more baggage", () => {
			const result = collectBaggageSegmentMismatchPassengerIds({
				passengerIds: ["p1"],
				segment1Selections: {
					p1: {
						carryOn: {},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
				segment2Selections: {
					p1: {
						carryOn: {
							CABN: createPassengerService({}),
						},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
			});

			expect(result.segment1LessThanSegment2PassengerIds).toEqual(["p1"]);
			expect(result.segment1GreaterThanSegment2PassengerIds).toEqual([]);
		});
		it("collects passengers where segment1 has more baggage", () => {
			const result = collectBaggageSegmentMismatchPassengerIds({
				passengerIds: ["p1"],
				segment1Selections: {
					p1: {
						carryOn: {
							CABN: createPassengerService({}),
						},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
				segment2Selections: {
					p1: {
						carryOn: {},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
			});

			expect(result.segment1GreaterThanSegment2PassengerIds).toEqual(["p1"]);
			expect(result.segment1LessThanSegment2PassengerIds).toEqual([]);
		});
		it("collects passengers in both mismatch directions", () => {
			const result = collectBaggageSegmentMismatchPassengerIds({
				passengerIds: ["p1"],
				segment1Selections: {
					p1: {
						carryOn: {
							CABN: createPassengerService({}),
						},
						checkedIn: {},
						sportsEquipment: {},
					},
				},
				segment2Selections: {
					p1: {
						carryOn: {},
						checkedIn: {
							BAGN: {
								...createQuantityService({}),
								quantity: 1,
							},
						},
						sportsEquipment: {},
					},
				},
			});

			expect(result.segment1GreaterThanSegment2PassengerIds).toEqual(["p1"]);
			expect(result.segment1LessThanSegment2PassengerIds).toEqual(["p1"]);
		});
		it("skips passengers with missing segment selections", () => {
			const result = collectBaggageSegmentMismatchPassengerIds({
				passengerIds: ["p1"],
				segment1Selections: {},
				segment2Selections: {},
			});

			expect(result.segment1LessThanSegment2PassengerIds).toEqual([]);
			expect(result.segment1GreaterThanSegment2PassengerIds).toEqual([]);
		});
	});
});
