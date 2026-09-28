import type { NEXUZR004OffersSpecialService } from "@repo/sdk";
import { describe, expect, it } from "vitest";
import type {
	BaggageOffersByPTCType,
	PassengerBaggageServices,
	PassengerWithBaggageSelection,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { PassengerService, PassengerValues } from "@/types/passenger/passenger.type";
import {
	detectBaggageAvailabilityIssue,
	resolveConfirmationBaggageInventory,
} from "./baggage-availability";

const createOffer = (overrides: Record<string, unknown>): NEXUZR004OffersSpecialService =>
	({
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
	}) as NEXUZR004OffersSpecialService;

const createPassengerService = (overrides: Record<string, unknown>): PassengerService =>
	({
		lfid: 1001,
		pfid: 0,
		amount: 0,
		categoryId: 143,
		cutOffHours: 0,
		description: "Checked-in",
		maxCountServiceLevel: 999,
		passengerType: "adult",
		qtyAvailable: 0,
		ssrCode: "BAGN",
		serviceID: 1,
		chargeComment: "",
		bundleCode: "NOBN",
		...overrides,
	}) as PassengerService;

const createBaggageOffersByPassengerType = (
	overrides: Record<string, BaggageOffersByPTCType>
): Record<string, BaggageOffersByPTCType> => overrides as Record<string, BaggageOffersByPTCType>;

const createSelection = ({
	passengerId,
	passengerName,
	passengerTypeCode = "adult",
	carryOn = [],
	checkedIn = [],
	sportsEquipment = [],
}: {
	passengerId: string;
	passengerName: string;
	passengerTypeCode?: string;
	carryOn?: Array<{ ssrCode: string; description: string }>;
	checkedIn?: Array<{ ssrCode: string; description: string; quantity: number }>;
	sportsEquipment?: Array<{ ssrCode: string; description: string; quantity: number }>;
}): PassengerWithBaggageSelection => {
	const carryOnServices: PassengerBaggageServices["carryOn"] = {};
	for (const service of carryOn) {
		carryOnServices[service.ssrCode] = createPassengerService({
			ssrCode: service.ssrCode,
			description: service.description,
			categoryId: 144,
			serviceID: 10,
		});
	}

	const checkedInServices: PassengerBaggageServices["checkedIn"] = {};
	for (const service of checkedIn) {
		checkedInServices[service.ssrCode] = {
			service: createPassengerService({
				ssrCode: service.ssrCode,
				description: service.description,
				categoryId: 143,
				serviceID: 20,
			}),
			quantity: service.quantity,
		};
	}

	const sportsEquipmentServices: PassengerBaggageServices["sportsEquipment"] = {};
	for (const service of sportsEquipment) {
		sportsEquipmentServices[service.ssrCode] = {
			service: createPassengerService({
				ssrCode: service.ssrCode,
				description: service.description,
				categoryId: 145,
				serviceID: 30,
			}),
			quantity: service.quantity,
		};
	}

	return {
		passenger: {
			id: passengerId,
			name: passengerName,
			bundleCode: "NOBN",
			bundleLabel: "",
			mealfeatures: [],
			baggagefeatures: [],
			passengerTypeCode,
			isIcnRoute: false,
			isValueBundle: false,
		},
		baggageServices: {
			carryOn: carryOnServices,
			checkedIn: checkedInServices,
			sportsEquipment: sportsEquipmentServices,
		},
		categories: [],
		totalPrice: 0,
	} as PassengerWithBaggageSelection;
};

const createStoredPassenger = ({
	id,
	passengerTypeCode = "adult",
	bundleCode = "NOBN",
	services,
}: {
	id: string;
	passengerTypeCode?: string;
	bundleCode?: string;
	services?: PassengerValues["services"];
}): PassengerValues =>
	({
		id,
		firstName: id,
		lastName: "Passenger",
		passengerTypeCode,
		services,
		bundles: [
			{
				lfid: 1001,
				bundleCode,
				bundleCategory: undefined,
			},
		],
	}) as PassengerValues;

const createServicePassenger = ({
	id,
	bundleCode = "NOBN",
	passengerTypeCode = "adult",
}: {
	id: string;
	bundleCode?: string;
	passengerTypeCode?: string;
}): ServicePassenger =>
	({
		id,
		name: id,
		bundleCode,
		bundleLabel: "",
		mealfeatures: [],
		baggagefeatures: [],
		passengerTypeCode,
		isIcnRoute: false,
		isValueBundle: false,
	}) as ServicePassenger;

describe("detectBaggageAvailabilityIssue", () => {
	it("returns noop when baggage inventory covers all stored selections", () => {
		const result = detectBaggageAvailabilityIssue({
			baggageSelectionsByPassengerId: {
				p1: createSelection({
					passengerId: "p1",
					passengerName: "First Passenger",
					checkedIn: [{ ssrCode: "BAGN", description: "Checked-in", quantity: 1 }],
				}),
			},
			orderedPassengerIds: ["p1"],
			baggageOffersByPassengerType: createBaggageOffersByPassengerType({
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 1 }),
						},
						sportsEquipment: {},
					},
				},
			}),
		});

		expect(result).toEqual({ type: "noop" });
	});

	it("cancels excess baggage in reverse booking order for the same ssrCode", () => {
		const result = detectBaggageAvailabilityIssue({
			baggageSelectionsByPassengerId: {
				p1: createSelection({
					passengerId: "p1",
					passengerName: "First Passenger",
					checkedIn: [{ ssrCode: "BAGN", description: "Checked-in", quantity: 1 }],
				}),
				p2: createSelection({
					passengerId: "p2",
					passengerName: "Second Passenger",
					checkedIn: [{ ssrCode: "BAGN", description: "Checked-in", quantity: 1 }],
				}),
			},
			orderedPassengerIds: ["p1", "p2"],
			baggageOffersByPassengerType: createBaggageOffersByPassengerType({
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 1 }),
						},
						sportsEquipment: {},
					},
				},
			}),
		});

		expect(result.type).toBe("selected-baggage-unavailable");

		if (result.type !== "selected-baggage-unavailable") {
			throw new Error("Expected baggage shortage result");
		}

		expect(result.unavailableBaggage).toEqual([
			{
				passengerId: "p2",
				passengerName: "Second Passenger",
				baggageName: "passenger_list_checked_in_baggage",
			},
		]);
		expect(result.updatedBaggageServicesByPassengerId.p1?.checkedIn.BAGN?.quantity).toBe(1);
		expect(result.updatedBaggageServicesByPassengerId.p2?.checkedIn.BAGN).toBeUndefined();
	});

	it("compares all ptc selections against adult inventory for the same ssrCode", () => {
		const result = detectBaggageAvailabilityIssue({
			baggageSelectionsByPassengerId: {
				p1: createSelection({
					passengerId: "p1",
					passengerName: "Adult Passenger",
					passengerTypeCode: "adult",
					checkedIn: [{ ssrCode: "BAGN", description: "Checked-in", quantity: 1 }],
				}),
				p2: createSelection({
					passengerId: "p2",
					passengerName: "Child Passenger",
					passengerTypeCode: "child",
					checkedIn: [{ ssrCode: "BAGN", description: "Checked-in", quantity: 1 }],
				}),
			},
			orderedPassengerIds: ["p1", "p2"],
			baggageOffersByPassengerType: createBaggageOffersByPassengerType({
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 1 }),
						},
						sportsEquipment: {},
					},
				},
				child: {
					passengerType: "child",
					categories: {
						carryOn: {},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 99 }),
						},
						sportsEquipment: {},
					},
				},
			}),
		});

		expect(result.type).toBe("selected-baggage-unavailable");

		if (result.type !== "selected-baggage-unavailable") {
			throw new Error("Expected baggage shortage result");
		}

		expect(result.unavailableBaggage).toEqual([
			{
				passengerId: "p2",
				passengerName: "Child Passenger",
				baggageName: "passenger_list_checked_in_baggage",
			},
		]);
		expect(result.updatedBaggageServicesByPassengerId.p1?.checkedIn.BAGN?.quantity).toBe(1);
		expect(result.updatedBaggageServicesByPassengerId.p2?.checkedIn.BAGN).toBeUndefined();
	});
});

describe("resolveConfirmationBaggageInventory", () => {
	it("returns no-bundle-out-of-stock with disabled passenger ids when all inventory is unavailable", () => {
		const result = resolveConfirmationBaggageInventory({
			passengerList: [
				createStoredPassenger({
					id: "p1",
					services: {
						baggage: [createPassengerService({ categoryId: 143, ssrCode: "BAGN" })],
					},
				}),
			],
			servicePassengers: [createServicePassenger({ id: "p1", bundleCode: "NOBN" })],
			currentLfid: 1001,
			orderedPassengerIds: ["p1"],
			baggageOffersByPassengerType: createBaggageOffersByPassengerType({
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {
							CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 0 }),
						},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 0 }),
						},
						sportsEquipment: {},
					},
				},
			}),
		});

		expect(result.type).toBe("no-bundle-out-of-stock");

		if (result.type !== "no-bundle-out-of-stock") {
			throw new Error("Expected no-bundle-out-of-stock result");
		}

		expect(result.disabledPassengerIds).toEqual(["p1"]);
		expect(Object.keys(result.baggageSelectionsByPassengerId)).toEqual(["p1"]);
	});

	it("returns bundle-out-of-stock before selected baggage shortage handling", () => {
		const result = resolveConfirmationBaggageInventory({
			passengerList: [
				createStoredPassenger({
					id: "p1",
					bundleCode: "PREM",
					services: {
						baggage: [createPassengerService({ categoryId: 144, ssrCode: "CABN" })],
					},
				}),
			],
			servicePassengers: [createServicePassenger({ id: "p1", bundleCode: "PREM" })],
			currentLfid: 1001,
			orderedPassengerIds: ["p1"],
			baggageOffersByPassengerType: createBaggageOffersByPassengerType({
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {
							CABN: createOffer({ ssrCode: "CABN", qtyAvailable: 0 }),
						},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 0 }),
						},
						sportsEquipment: {},
					},
				},
			}),
		});

		expect(result).toMatchObject({ type: "bundle-out-of-stock" });
	});

	it("returns selected-baggage-unavailable with first affected passenger from booking order", () => {
		const result = resolveConfirmationBaggageInventory({
			passengerList: [
				createStoredPassenger({
					id: "p1",
					services: {
						baggage: [createPassengerService({ categoryId: 143, ssrCode: "BAGN" })],
					},
				}),
				createStoredPassenger({
					id: "p2",
					services: {
						baggage: [createPassengerService({ categoryId: 143, ssrCode: "BAGN" })],
					},
				}),
			],
			servicePassengers: [
				createServicePassenger({ id: "p1" }),
				createServicePassenger({ id: "p2" }),
			],
			currentLfid: 1001,
			orderedPassengerIds: ["p1", "p2"],
			baggageOffersByPassengerType: createBaggageOffersByPassengerType({
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {
							BAGN: createOffer({ ssrCode: "BAGN", qtyAvailable: 1 }),
						},
						sportsEquipment: {},
					},
				},
			}),
		});

		expect(result.type).toBe("selected-baggage-unavailable");

		if (result.type !== "selected-baggage-unavailable") {
			throw new Error("Expected selected-baggage-unavailable result");
		}

		expect(result.firstAffectedPassengerId).toBe("p2");
		expect(result.unavailableBaggage).toEqual([
			{
				passengerId: "p2",
				passengerName: "p2",
				baggageName: "passenger_list_checked_in_baggage",
			},
		]);
	});
});
