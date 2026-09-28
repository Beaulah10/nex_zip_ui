import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleId } from "@/types/bundle/bundle.types";
import { areAllBaggageServicesMapped, buildBaggageCategories } from "./baggage-categories";

const getCarryOnChargeMock = vi.hoisted(() => vi.fn());
const getCheckedBaggageChargeMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing", () => ({
	getCarryOnCharge: getCarryOnChargeMock,
	getCheckedBaggageCharge: getCheckedBaggageChargeMock,
}));

describe("baggage-categories helpers", () => {
	describe("buildBaggageCategories", () => {
		const mockPassenger: ServicePassenger = {
			id: "passenger1",
			name: "John Doe",
			passengerTypeCode: "adult",
			bundleCode: "PRMK",
			bundleLabel: "Premium",
			mealfeatures: [],
			baggagefeatures: [],
			isIcnRoute: false,
			isValueBundle: false,
		};

		beforeEach(() => {
			vi.clearAllMocks();
			getCarryOnChargeMock.mockReturnValue(0);
			getCheckedBaggageChargeMock.mockReturnValue(0);
		});

		it("builds categories for carry-on baggage with CABN", () => {
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
						description: "Carry-on 15kg",
					},
				},
				checkedIn: {},
				sportsEquipment: {},
			} satisfies PassengerBaggageServices;

			getCarryOnChargeMock.mockReturnValue(4000);

			const result = buildBaggageCategories({ passenger: mockPassenger, baggageServices });

			expect(result).toHaveLength(1);
			expect(result[0]?.title).toBe("passenger_list_carry_on_baggage");
			expect(result[0]?.items).toHaveLength(1);
			expect(result[0]?.items?.[0]?.label).toBe("select_carry_on_baggage_15kg");
			expect(result[0]?.items?.[0]?.price).toBe(4000);
		});

		it("builds categories for carry-on baggage with 7kg default", () => {
			const baggageServices = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = buildBaggageCategories({ passenger: mockPassenger, baggageServices });

			expect(result).toHaveLength(1);
			expect(result[0]?.title).toBe("passenger_list_carry_on_baggage");
			expect(result[0]?.items?.[0]?.label).toBe("select_carry_on_baggage_7kg");
			expect(result[0]?.items?.[0]?.price).toBe(0);
		});

		it("builds categories for checked-in baggage", () => {
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

			getCheckedBaggageChargeMock.mockReturnValue(7500);

			const result = buildBaggageCategories({ passenger: mockPassenger, baggageServices });

			expect(result).toHaveLength(2);
			const checkedInCategory = result.find(
				(cat) => cat.title === "passenger_list_checked_in_baggage"
			);
			expect(checkedInCategory?.items).toHaveLength(1);
			expect(checkedInCategory?.items?.[0]?.count).toBe(2);
			expect(checkedInCategory?.items?.[0]?.label).toBe("select_checked_in_baggages");
		});

		it("builds categories for sports equipment", () => {
			const baggageServices = {
				carryOn: {},
				checkedIn: {},
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
							description: "Ski Equipment",
						},
						quantity: 1,
					},
					GOLF: {
						service: {
							ssrCode: "GOLF",
							amount: 7000,
							categoryId: 145,
							lfid: 1001,
							pfid: 0,
							cutOffHours: 0,
							maxCountServiceLevel: 999,
							passengerType: "adult",
							qtyAvailable: 3,
							serviceID: 183,
							chargeComment: "",
							bundleCode: "PRMK",
							description: "Golf Equipment",
						},
						quantity: 2,
					},
				},
			};

			const result = buildBaggageCategories({ passenger: mockPassenger, baggageServices });

			const sportsCategory = result.find((cat) => cat.title === "passenger_list_sports_equipment");
			expect(sportsCategory?.items).toHaveLength(2);
			expect(sportsCategory?.items?.[0]?.count).toBe(1);
			expect(sportsCategory?.items?.[1]?.count).toBe(2);
		});

		it("builds all categories for full baggage selection", () => {
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
						quantity: 1,
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

			const result = buildBaggageCategories({ passenger: mockPassenger, baggageServices });

			expect(result).toHaveLength(3);
			expect(result[0]?.title).toBe("passenger_list_carry_on_baggage");
			expect(result[1]?.title).toBe("passenger_list_checked_in_baggage");
			expect(result[2]?.title).toBe("passenger_list_sports_equipment");
		});

		it("handles single vs multiple checked-in baggage labels", () => {
			const singleBaggage = {
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
						quantity: 1,
					},
				},
				sportsEquipment: {},
			};

			const resultSingle = buildBaggageCategories({
				passenger: mockPassenger,
				baggageServices: singleBaggage,
			});

			// Find the checked-in category (not carry-on)
			const checkedInCategory = resultSingle.find(
				(cat) => cat.title === "passenger_list_checked_in_baggage"
			);
			expect(checkedInCategory?.items?.[0]?.label).toBe("select_checked_in_baggage");

			const multipleBaggage = {
				...singleBaggage,
				checkedIn: {
					BAGN: {
						...singleBaggage.checkedIn.BAGN,
						quantity: 3,
					},
				},
			};

			const resultMultiple = buildBaggageCategories({
				passenger: mockPassenger,
				baggageServices: multipleBaggage,
			});

			const multiCheckedInCategory = resultMultiple.find(
				(cat) => cat.title === "passenger_list_checked_in_baggage"
			);
			expect(multiCheckedInCategory?.items?.[0]?.label).toBe("select_checked_in_baggages");
		});

		it("handles VALUE and NONE bundle types correctly", () => {
			const valuePassenger = {
				...mockPassenger,
				bundleCode: "VALK" as BundleId,
				isValueBundle: true,
			};

			const baggageServices = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			};

			const result = buildBaggageCategories({
				passenger: valuePassenger,
				baggageServices,
			});

			expect(result).toHaveLength(1);
			expect(result[0]?.items?.[0]?.label).toBe("select_carry_on_baggage_7kg");
		});
	});

	describe("areAllBaggageServicesMapped", () => {
		it("returns true when all services have serviceID > 0", () => {
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
						quantity: 1,
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

			expect(areAllBaggageServicesMapped(baggageServices)).toBe(true);
		});

		it("returns false when service has serviceID of 0", () => {
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
						serviceID: 0,
						chargeComment: "",
						bundleCode: "PRMK",
						description: "Carry-on",
					},
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			expect(areAllBaggageServicesMapped(baggageServices)).toBe(false);
		});

		it("returns false when service has null serviceID", () => {
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
						serviceID: null as unknown as number,
						chargeComment: "",
						bundleCode: "PRMK",
						description: "Carry-on",
					},
				},
				checkedIn: {},
				sportsEquipment: {},
			};

			expect(areAllBaggageServicesMapped(baggageServices)).toBe(false);
		});

		it("returns false when there are no services selected", () => {
			const baggageServices = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			};

			expect(areAllBaggageServicesMapped(baggageServices)).toBe(false);
		});

		it("returns false when checked-in service has 0 serviceID", () => {
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
							serviceID: 0,
							chargeComment: "",
							bundleCode: "PRMK",
							description: "Checked-in",
						},
						quantity: 1,
					},
				},
				sportsEquipment: {},
			};

			expect(areAllBaggageServicesMapped(baggageServices)).toBe(false);
		});

		it("returns true with only sports equipment", () => {
			const baggageServices = {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {
					GOLF: {
						service: {
							ssrCode: "GOLF",
							amount: 7000,
							categoryId: 145,
							lfid: 1001,
							pfid: 0,
							cutOffHours: 0,
							maxCountServiceLevel: 999,
							passengerType: "adult",
							qtyAvailable: 3,
							serviceID: 183,
							chargeComment: "",
							bundleCode: "PRMK",
							description: "Golf",
						},
						quantity: 1,
					},
				},
			};

			expect(areAllBaggageServicesMapped(baggageServices)).toBe(true);
		});
	});
});
