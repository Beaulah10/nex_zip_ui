import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	PassengerWithBaggageSelection,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleId } from "@/types/bundle/bundle.types";
import {
	buildPassengerBaggageServicesFromSelection,
	buildPassengerWithBaggageSelection,
	buildSelectionValuesFromPassengerBaggage,
	getStoredBaggageByLfid,
} from "./build-baggage-selection";

const buildBaggageCategoriesMock = vi.hoisted(() => vi.fn());
const calculatePassengerBaggagePriceMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories", () => ({
	buildBaggageCategories: buildBaggageCategoriesMock,
}));

vi.mock("@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing", () => ({
	calculatePassengerBaggagePrice: calculatePassengerBaggagePriceMock,
}));

describe("build-baggage-selection helpers", () => {
	describe("buildPassengerWithBaggageSelection", () => {
		beforeEach(() => {
			vi.clearAllMocks();
			buildBaggageCategoriesMock.mockReturnValue([]);
			calculatePassengerBaggagePriceMock.mockReturnValue(0);
		});

		it("builds baggage selection for all passengers", () => {
			const passengerList = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							{
								lfid: 76407,
								pfid: 0,
								categoryId: 144,
								cutOffHours: 0,
								maxCountServiceLevel: 100,
								passengerType: "adult",
								qtyAvailable: 5,
								serviceID: 1281,
								chargeComment: "",
								bundleCode: "PRMK",
								ssrCode: "CABN",
								description: "Carry-on",
								amount: 4000,
							},
						],
					},
				},
			];

			const selectedBundlePassengers = [
				{
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
			] as ServicePassenger[];

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {},
						checkedIn: {
							BAGN: {
								amount: 7500,
								currency: "JPY",
								qtyAvailable: 10,
								ssrCode: "BAGN",
								lfid: 1001,
								cutOffHours: 24,
								description: "Checked-in baggage",
								maxCountServiceLevel: 3,
								startSalesDays: 0,
								ssrId: 1221,
							},
						},
						sportsEquipment: {},
					},
				},
			};

			const result = buildPassengerWithBaggageSelection({
				passengerList,
				selectedBundlePassengers,
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType,
			});

			expect(result).toHaveProperty("passenger1");
			expect(result.passenger1?.passenger.id).toBe("passenger1");
		});

		it("returns empty object when no selected bundle passengers", () => {
			const passengerList = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: { baggage: [] },
				},
			];

			const selectedBundlePassengers: any[] = [];

			const result = buildPassengerWithBaggageSelection({
				passengerList,
				selectedBundlePassengers,
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {},
			});

			expect(result).toEqual({});
		});

		it("filters services by currentLfid", () => {
			const passengerList = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							{
								lfid: 76407,
								ssrCode: "CABN",
								categoryId: 144,
								serviceID: 1281,
								amount: 4000,
								pfid: 0,
								cutOffHours: 0,
								maxCountServiceLevel: 100,
								passengerType: "adult",
								qtyAvailable: 5,
								chargeComment: "",
								bundleCode: "PRMK",
								description: "Carry-on",
							},
							{
								lfid: 76408,
								ssrCode: "BAGN",
								categoryId: 143,
								serviceID: 1221,
								amount: 7500,
								pfid: 0,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								passengerType: "adult",
								qtyAvailable: 10,
								chargeComment: "",
								bundleCode: "PRMK",
								description: "Checked-in",
							},
						],
					},
				},
			];

			const selectedBundlePassengers = [
				{
					id: "passenger1",
					name: "John Doe",
					passengerTypeCode: "adult",
					bundleCode: "PRMK" as BundleId,
					bundleLabel: "Premium",
					mealfeatures: [],
					baggagefeatures: [],
					isIcnRoute: false,
					isValueBundle: false,
				},
			] as ServicePassenger[];

			const result = buildPassengerWithBaggageSelection({
				passengerList,
				selectedBundlePassengers,
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {},
							checkedIn: {
								BAGN: {
									amount: 7500,
									currency: "JPY",
									qtyAvailable: 10,
									ssrCode: "BAGN",
									lfid: 1001,
									cutOffHours: 24,
									description: "Checked-in",
									maxCountServiceLevel: 3,
									startSalesDays: 0,
									ssrId: 1221,
								},
							},
							sportsEquipment: {},
						},
					},
				},
			});

			expect(result.passenger1?.baggageServices.carryOn).toBeDefined();
			expect(result.passenger1?.baggageServices.checkedIn).toEqual({});
		});

		it("aggregates multiple checked-in baggage quantities", () => {
			const passengerList = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							{
								lfid: 76407,
								ssrCode: "BAGN",
								categoryId: 143,
								serviceID: 1221,
								amount: 7500,
								pfid: 0,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								passengerType: "adult",
								qtyAvailable: 10,
								chargeComment: "",
								bundleCode: "PRMK",
								description: "Checked-in",
							},
							{
								lfid: 76407,
								ssrCode: "BAGN",
								categoryId: 143,
								serviceID: 1221,
								amount: 7500,
								pfid: 0,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								passengerType: "adult",
								qtyAvailable: 10,
								chargeComment: "",
								bundleCode: "PRMK",
								description: "Checked-in",
							},
						],
					},
				},
			];

			const selectedBundlePassengers = [
				{
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
			] as ServicePassenger[];

			const result = buildPassengerWithBaggageSelection({
				passengerList,
				selectedBundlePassengers,
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {},
							checkedIn: {
								BAGN: {
									amount: 7500,
									currency: "JPY",
									qtyAvailable: 10,
									ssrCode: "BAGN",
									lfid: 1001,
									cutOffHours: 24,
									description: "Checked-in",
									maxCountServiceLevel: 3,
									startSalesDays: 0,
									ssrId: 1221,
								},
							},
							sportsEquipment: {},
						},
					},
				},
			});

			expect(result.passenger1?.baggageServices.checkedIn.BAGN?.quantity).toBe(2);
		});
		it("skips a passenger when no matching selected bundle passenger exists", () => {
			const result = buildPassengerWithBaggageSelection({
				passengerList: [
					{
						id: "passenger1",
						firstName: "John",
						lastName: "Doe",
						passengerTypeCode: "adult",
						services: {
							baggage: [],
						},
					},
				],
				selectedBundlePassengers: [
					{
						id: "anotherPassenger",
						name: "Jane Doe",
						passengerTypeCode: "adult",
						bundleCode: "PRMK",
						bundleLabel: "Premium",
						mealfeatures: [],
						baggagefeatures: [],
						isIcnRoute: false,
						isValueBundle: false,
					},
				] as ServicePassenger[],
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {},
			});

			expect(result).toEqual({});
			expect(buildBaggageCategoriesMock).not.toHaveBeenCalled();
			expect(calculatePassengerBaggagePriceMock).not.toHaveBeenCalled();
		});

		it("handles undefined passenger services", () => {
			const selectedPassenger = {
				id: "passenger1",
				name: "John Doe",
				passengerTypeCode: "adult",
				bundleCode: "PRMK",
				bundleLabel: "Premium",
				mealfeatures: [],
				baggagefeatures: [],
				isIcnRoute: false,
				isValueBundle: false,
			} as ServicePassenger;

			const result = buildPassengerWithBaggageSelection({
				passengerList: [
					{
						id: "passenger1",
						firstName: "John",
						lastName: "Doe",
						passengerTypeCode: "adult",
						services: undefined,
					},
				],
				selectedBundlePassengers: [selectedPassenger],
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {},
			});

			expect(result.passenger1?.baggageServices).toEqual({
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			});
		});

		it("includes services from every lfid when currentLfid is undefined", () => {
			const selectedPassenger = {
				id: "passenger1",
				name: "John Doe",
				passengerTypeCode: "adult",
				bundleCode: "PRMK",
				bundleLabel: "Premium",
				mealfeatures: [],
				baggagefeatures: [],
				isIcnRoute: false,
				isValueBundle: false,
			} as ServicePassenger;

			const result = buildPassengerWithBaggageSelection({
				passengerList: [
					{
						id: "passenger1",
						firstName: "John",
						lastName: "Doe",
						passengerTypeCode: "adult",
						services: {
							baggage: [
								{
									lfid: 76407,
									pfid: 0,
									categoryId: 144,
									cutOffHours: 0,
									maxCountServiceLevel: 100,
									passengerType: "adult",
									qtyAvailable: 5,
									serviceID: 1281,
									chargeComment: "",
									bundleCode: "PRMK",
									ssrCode: "CABN",
									description: "Carry-on",
									amount: 4000,
								},
								{
									lfid: 76408,
									pfid: 0,
									categoryId: 145,
									cutOffHours: 0,
									maxCountServiceLevel: 10,
									passengerType: "adult",
									qtyAvailable: 3,
									serviceID: 184,
									chargeComment: "",
									bundleCode: "PRMK",
									ssrCode: "SKII",
									description: "Ski equipment",
									amount: 7000,
								},
							],
						},
					},
				],
				selectedBundlePassengers: [selectedPassenger],
				serviceCategory: "baggage",
				currentLfid: undefined,
				baggageOffersByPassengerType: {},
			});

			expect(result.passenger1?.baggageServices.carryOn.CABN).toBeDefined();
			expect(result.passenger1?.baggageServices.sportsEquipment.SKII?.quantity).toBe(1);
		});

		it("aggregates duplicate sports equipment quantities", () => {
			const sportsService = {
				lfid: 76407,
				pfid: 0,
				categoryId: 145,
				cutOffHours: 0,
				maxCountServiceLevel: 10,
				passengerType: "adult",
				qtyAvailable: 3,
				serviceID: 184,
				chargeComment: "",
				bundleCode: "PRMK",
				ssrCode: "SKII",
				description: "Ski equipment",
				amount: 7000,
			};

			const result = buildPassengerWithBaggageSelection({
				passengerList: [
					{
						id: "passenger1",
						firstName: "John",
						lastName: "Doe",
						passengerTypeCode: "adult",
						services: {
							baggage: [{ ...sportsService }, { ...sportsService }],
						},
					},
				],
				selectedBundlePassengers: [
					{
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
				] as ServicePassenger[],
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {},
			});

			expect(result.passenger1?.baggageServices.sportsEquipment.SKII?.quantity).toBe(2);
		});

		it("uses zero checked-in amount when the passenger has no baggage offer", () => {
			const result = buildPassengerWithBaggageSelection({
				passengerList: [
					{
						id: "passenger1",
						firstName: "John",
						lastName: "Doe",
						passengerTypeCode: "adult",
						services: {
							baggage: [
								{
									lfid: 76407,
									pfid: 0,
									categoryId: 143,
									cutOffHours: 0,
									maxCountServiceLevel: 999,
									passengerType: "adult",
									qtyAvailable: 10,
									serviceID: 1221,
									chargeComment: "",
									bundleCode: "PRMK",
									ssrCode: "BAGN",
									description: "Checked-in baggage",
									amount: 7500,
								},
							],
						},
					},
				],
				selectedBundlePassengers: [
					{
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
				] as ServicePassenger[],
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {},
			});

			expect(result.passenger1?.baggageServices.checkedIn.BAGN?.service.amount).toBe(0);
		});

		it("ignores services with an unsupported baggage category", () => {
			const result = buildPassengerWithBaggageSelection({
				passengerList: [
					{
						id: "passenger1",
						firstName: "John",
						lastName: "Doe",
						passengerTypeCode: "adult",
						services: {
							baggage: [
								{
									lfid: 76407,
									pfid: 0,
									categoryId: 999,
									cutOffHours: 0,
									maxCountServiceLevel: 1,
									passengerType: "adult",
									qtyAvailable: 1,
									serviceID: 999,
									chargeComment: "",
									bundleCode: "PRMK",
									ssrCode: "UNKNOWN",
									description: "Unknown service",
									amount: 1000,
								},
							],
						},
					},
				],
				selectedBundlePassengers: [
					{
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
				] as ServicePassenger[],
				serviceCategory: "baggage",
				currentLfid: 76407,
				baggageOffersByPassengerType: {},
			});

			expect(result.passenger1?.baggageServices).toEqual({
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			});
		});
	});

	describe("buildSelectionValuesFromPassengerBaggage", () => {
		it("builds selection values from passenger baggage services", () => {
			const selectedItem = {
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
					carryOn: {
						CABN: {
							ssrCode: "CABN",
							amount: 4000,
							categoryId: 144,
							lfid: 76407,
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
								lfid: 76407,
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
								lfid: 76407,
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
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const sportsEquipmentOptions = [
				{
					id: "SKII",
					icon: "downhill_skiing",
					label: "Ski",
					price: 7000,
					ssrCode: "SKII",
					qtyAvailable: 2,
				},
			];

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, sportsEquipmentOptions);

			expect(result.carryOnId).toBe("CABN");
			expect(result.checkedInBaggageCount).toBe(2);
			expect(result.equipmentCounts.SKII).toBe(1);
		});

		it("defaults to 7kg for VALUE bundle without CABN", () => {
			const selectedItem = {
				passenger: {
					id: "passenger1",
					name: "John Doe",
					passengerTypeCode: "adult",
					bundleCode: "VALK",
					bundleLabel: "Value",
					mealfeatures: [],
					baggagefeatures: [],
					isIcnRoute: false,
					isValueBundle: true,
				},
				baggageServices: {
					carryOn: {},
					checkedIn: {
						BAGN: {
							service: {
								lfid: 1001,
								pfid: 0,
								amount: 7500,
								categoryId: 143,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								passengerType: "adult",
								qtyAvailable: 10,
								serviceID: 1221,
								chargeComment: "",
								bundleCode: "PRMK",
								description: "Checked-in",
								ssrCode: "BAGN",
							},
							quantity: 1,
						},
					},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, []);

			expect(result.carryOnId).toBe("7kg");
		});

		it("defaults to 0 checked-in for NONE bundle", () => {
			const selectedItem = {
				passenger: {
					id: "passenger1",
					name: "John Doe",
					passengerTypeCode: "adult",
					bundleCode: "NOBN",
					bundleLabel: "None",
					mealfeatures: [],
					baggagefeatures: [],
					isIcnRoute: false,
					isValueBundle: false,
				},
				baggageServices: {
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, []);

			expect(result.checkedInBaggageCount).toBe(0);
		});

		it("uses CABN and one checked-in bag by default for PREMIUM bundle", () => {
			const selectedItem = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, []);

			expect(result).toEqual({
				carryOnId: "CABN",
				checkedInBaggageCount: 1,
				equipmentCounts: {},
			});
		});

		it("uses CABN as the default carry-on for FLEXBIZ bundle", () => {
			const selectedItem = {
				passenger: {
					id: "passenger1",
					name: "John Doe",
					passengerTypeCode: "adult",
					bundleCode: "FLBF" as BundleId,
					bundleLabel: "FlexBiz",
					mealfeatures: [],
					baggagefeatures: [],
					isIcnRoute: false,
					isValueBundle: false,
				},
				baggageServices: {
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, []);

			expect(result.carryOnId).toBe("CABN");
			expect(result.checkedInBaggageCount).toBe(0);
		});

		it("ignores stored sports equipment that is not available in the options", () => {
			const selectedItem = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {
						SKII: {
							service: {
								lfid: 76407,
								pfid: 0,
								categoryId: 145,
								cutOffHours: 0,
								maxCountServiceLevel: 10,
								passengerType: "adult",
								qtyAvailable: 2,
								serviceID: 184,
								chargeComment: "",
								bundleCode: "PRMK",
								ssrCode: "SKII",
								description: "Ski equipment",
								amount: 7000,
							},
							quantity: 2,
						},
					},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, []);

			expect(result.equipmentCounts).toEqual({});
		});

		it("uses the bundle default when the stored carry-on is not CABN", () => {
			const selectedItem = {
				passenger: {
					id: "passenger1",
					name: "John Doe",
					passengerTypeCode: "adult",
					bundleCode: "NOBN",
					bundleLabel: "None",
					mealfeatures: [],
					baggagefeatures: [],
					isIcnRoute: false,
					isValueBundle: false,
				},
				baggageServices: {
					carryOn: {
						OTHER: {
							lfid: 76407,
							pfid: 0,
							categoryId: 144,
							cutOffHours: 0,
							maxCountServiceLevel: 10,
							passengerType: "adult",
							qtyAvailable: 1,
							serviceID: 999,
							chargeComment: "",
							bundleCode: "NOBN",
							ssrCode: "OTHER",
							description: "Other carry-on",
							amount: 0,
						},
					},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildSelectionValuesFromPassengerBaggage(selectedItem, []);

			expect(result.carryOnId).toBe("7kg");
		});
	});

	describe("buildPassengerBaggageServicesFromSelection", () => {
		it("builds baggage services from selection values", () => {
			const selection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 2,
				equipmentCounts: { SKII: 1, GOLF: 2 },
			};

			const selectedPassenger = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const baggageOffersByPassengerType = {
				adult: {
					passengerType: "adult",
					categories: {
						carryOn: {
							CABN: {
								amount: 4000,
								currency: "JPY",
								qtyAvailable: 5,
								ssrCode: "CABN",
								lfid: 76407,
								pfid: 0,
								ssrId: 1281,
								cutOffHours: 0,
								maxCountServiceLevel: 100,
								description: "Carry-on",
								startSalesDays: 0,
							},
						},
						checkedIn: {
							BAGN: {
								amount: 7500,
								currency: "JPY",
								qtyAvailable: 10,
								ssrCode: "BAGN",
								lfid: 76407,
								pfid: 0,
								ssrId: 1221,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								description: "Checked-in",
								startSalesDays: 0,
							},
						},
						sportsEquipment: {
							SKII: {
								amount: 7000,
								currency: "JPY",
								qtyAvailable: 2,
								ssrCode: "SKII",
								lfid: 76407,
								pfid: 0,
								ssrId: 184,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								description: "Ski",
								startSalesDays: 0,
							},
							GOLF: {
								amount: 7000,
								currency: "JPY",
								qtyAvailable: 3,
								ssrCode: "GOLF",
								lfid: 76407,
								pfid: 0,
								ssrId: 183,
								cutOffHours: 0,
								maxCountServiceLevel: 999,
								description: "Golf",
								startSalesDays: 0,
							},
						},
					},
				},
			};

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType,
				selection,
				selectedPassenger,
			});

			expect(result.carryOn.CABN?.ssrCode).toBe("CABN");
			expect(result.checkedIn.BAGN?.quantity).toBe(2);
			expect(result.sportsEquipment.SKII?.quantity).toBe(1);
			expect(result.sportsEquipment.GOLF?.quantity).toBe(2);
		});

		it("returns empty carryOn when selecting 7kg", () => {
			const selection = {
				carryOnId: "7KG",
				checkedInBaggageCount: 0,
				equipmentCounts: {},
			};

			const selectedPassenger = {
				passenger: {
					id: "passenger1",
					name: "John Doe",
					passengerTypeCode: "adult",
					bundleCode: "VALK",
					bundleLabel: "Value",
					mealfeatures: [],
					baggagefeatures: [],
					isIcnRoute: false,
					isValueBundle: true,
				},
				baggageServices: {
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {
								"7KG": {
									ssrCode: "7KG",
									amount: 0,
									currency: "JPY",
									qtyAvailable: 0,
									lfid: 0,
									cutOffHours: 0,
									description: "",
									maxCountServiceLevel: 0,
									startSalesDays: 0,
									ssrId: 0,
								},
							},
							checkedIn: {},
							sportsEquipment: {},
						},
					},
				},
				selection,
				selectedPassenger,
			});

			expect(result.carryOn).toEqual({});
		});

		it("returns empty checkedIn when count is 0", () => {
			const selection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 0,
				equipmentCounts: {},
			};

			const selectedPassenger = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {
								CABN: {
									amount: 4000,
									ssrCode: "CABN",
									lfid: 76407,
									pfid: 0,
									ssrId: 1281,
									cutOffHours: 0,
									maxCountServiceLevel: 100,
									description: "Carry-on",
									currency: "JPY",
									qtyAvailable: 5,
									startSalesDays: 0,
								},
							},
							checkedIn: {
								BAGN: {
									amount: 7500,
									ssrCode: "BAGN",
									lfid: 1,
									pfid: 0,
									ssrId: 1221,
									currency: "JPY",
									qtyAvailable: 10,
									cutOffHours: 0,
									maxCountServiceLevel: 999,
									description: "Checked-in",
									startSalesDays: 0,
								},
							},
							sportsEquipment: {},
						},
					},
				},
				selection,
				selectedPassenger,
			});

			expect(result.checkedIn).toEqual({});
		});

		it("filters sports equipment with 0 quantity", () => {
			const selection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 1,
				equipmentCounts: { SKII: 1, GOLF: 0, BIKE: 2 },
			};

			const selectedPassenger = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {
								CABN: {
									amount: 4000,
									ssrCode: "CABN",
									lfid: 1,
									ssrId: 1,
									currency: "JPY",
									qtyAvailable: 5,
									cutOffHours: 0,
									maxCountServiceLevel: 100,
									description: "Carry-on",
									startSalesDays: 0,
								},
							},
							checkedIn: {
								BAGN: {
									amount: 7500,
									ssrCode: "BAGN",
									lfid: 1,
									ssrId: 1,
									currency: "JPY",
									qtyAvailable: 10,
									cutOffHours: 0,
									maxCountServiceLevel: 999,
									description: "Checked-in",
									startSalesDays: 0,
								},
							},
							sportsEquipment: {
								SKII: {
									amount: 7000,
									ssrCode: "SKII",
									lfid: 1,
									ssrId: 1,
									currency: "JPY",
									qtyAvailable: 2,
									cutOffHours: 0,
									maxCountServiceLevel: 999,
									description: "Ski",
									startSalesDays: 0,
								},
								GOLF: {
									amount: 7000,
									ssrCode: "GOLF",
									lfid: 1,
									ssrId: 1,
									currency: "JPY",
									qtyAvailable: 3,
									cutOffHours: 0,
									maxCountServiceLevel: 999,
									description: "Golf",
									startSalesDays: 0,
								},
								BIKE: {
									amount: 11000,
									ssrCode: "BIKE",
									lfid: 1,
									ssrId: 1,
									currency: "JPY",
									qtyAvailable: 3,
									cutOffHours: 0,
									maxCountServiceLevel: 999,
									description: "Bike",
									startSalesDays: 0,
								},
							},
						},
					},
				},
				selection,
				selectedPassenger,
			});

			expect(result.sportsEquipment.SKII).toBeDefined();
			expect(result.sportsEquipment.GOLF).toBeUndefined();
			expect(result.sportsEquipment.BIKE).toBeDefined();
		});

		it("uses fallback values when baggage offers do not exist for the passenger type", () => {
			const selectedPassenger = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType: {},
				selection: {
					carryOnId: "CABN",
					checkedInBaggageCount: 2,
					equipmentCounts: {},
				},
				selectedPassenger,
			});

			expect(result.carryOn.CABN).toMatchObject({
				lfid: 0,
				ssrCode: "CABN",
				amount: 0,
				passengerType: "adult",
			});

			expect(result.checkedIn.BAGN).toMatchObject({
				quantity: 2,
				service: {
					ssrCode: "BAGN",
					amount: 0,
					passengerType: "adult",
				},
			});

			expect(result.sportsEquipment).toEqual({});
		});

		it("uses sports equipment fallback values for optional offer properties", () => {
			const selectedPassenger = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {},
							checkedIn: {},
							sportsEquipment: {
								SKII: {
									ssrCode: "SKII",
									lfid: 76407,
									ssrId: 184,
									currency: "JPY",
									qtyAvailable: 2,
									cutOffHours: 0,
									maxCountServiceLevel: 3,
									description: "Ski equipment",
									startSalesDays: 0,
									amount: 0,
								},
							},
						},
					},
				},
				selection: {
					carryOnId: "7kg",
					checkedInBaggageCount: 0,
					equipmentCounts: {
						SKII: 2,
					},
				},
				selectedPassenger,
			});

			expect(result.sportsEquipment.SKII).toEqual({
				service: expect.objectContaining({
					pfid: 0,
					amount: 0,
					ssrCode: "SKII",
				}),
				quantity: 2,
			});
		});

		it("treats missing equipmentCounts as zero for all equipment", () => {
			const selectedPassenger = {
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
					carryOn: {},
					checkedIn: {},
					sportsEquipment: {},
				},
				categories: [],
				totalPrice: 0,
			} as PassengerWithBaggageSelection;

			const result = buildPassengerBaggageServicesFromSelection({
				baggageOffersByPassengerType: {
					adult: {
						passengerType: "adult",
						categories: {
							carryOn: {},
							checkedIn: {},
							sportsEquipment: {
								SKII: {
									ssrCode: "SKII",
									lfid: 76407,
									ssrId: 184,
									amount: 7000,
									currency: "JPY",
									qtyAvailable: 2,
									cutOffHours: 0,
									maxCountServiceLevel: 3,
									description: "Ski equipment",
									startSalesDays: 0,
								},
							},
						},
					},
				},
				selection: {
					carryOnId: "7kg",
					checkedInBaggageCount: 0,
					equipmentCounts: undefined,
				} as unknown as Parameters<
					typeof buildPassengerBaggageServicesFromSelection
				>[0]["selection"],
				selectedPassenger,
			});

			expect(result.sportsEquipment).toEqual({});
		});
	});

	describe("getStoredBaggageByLfid", () => {
		const createService = (
			overrides: Partial<{
				lfid: number;
				pfid: number;
				categoryId: number;
				cutOffHours: number;
				maxCountServiceLevel: number;
				passengerType: string;
				qtyAvailable: number;
				serviceID: number;
				chargeComment: string;
				bundleCode: string;
				ssrCode: string;
				description: string;
				amount: number;
			}> = {}
		) => ({
			lfid: 76407,
			pfid: 0,
			categoryId: 144,
			cutOffHours: 0,
			maxCountServiceLevel: 100,
			passengerType: "adult",
			qtyAvailable: 5,
			serviceID: 1281,
			chargeComment: "",
			bundleCode: "PRMK",
			ssrCode: "CABN",
			description: "Carry-on",
			amount: 4000,
			...overrides,
		});

		it("returns an empty object when lfid is undefined", () => {
			const result = getStoredBaggageByLfid({
				passengers: [] as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"],
				lfid: undefined,
				serviceCategory: "baggage",
			});

			expect(result).toEqual({});
		});

		it("returns empty baggage categories when passenger services are undefined", () => {
			const passengers = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: undefined,
				},
			] as unknown as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"];

			const result = getStoredBaggageByLfid({
				passengers,
				lfid: 76407,
				serviceCategory: "baggage",
			});

			expect(result.passenger1).toEqual({
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			});
		});

		it("filters stored services by lfid", () => {
			const passengers = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							createService({
								lfid: 76407,
								categoryId: 144,
								ssrCode: "CABN",
							}),
							createService({
								lfid: 76408,
								categoryId: 143,
								ssrCode: "BAGN",
								serviceID: 1221,
							}),
						],
					},
				},
			] as unknown as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"];

			const result = getStoredBaggageByLfid({
				passengers,
				lfid: 76407,
				serviceCategory: "baggage",
			});

			expect(result.passenger1?.carryOn.CABN).toBeDefined();
			expect(result.passenger1?.checkedIn).toEqual({});
		});

		it("builds carry-on, checked-in, and sports equipment services", () => {
			const passengers = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							createService({
								categoryId: 144,
								ssrCode: "CABN",
							}),
							createService({
								categoryId: 143,
								ssrCode: "BAGN",
								serviceID: 1221,
								description: "Checked-in baggage",
							}),
							createService({
								categoryId: 145,
								ssrCode: "SKII",
								serviceID: 184,
								description: "Ski equipment",
							}),
						],
					},
				},
			] as unknown as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"];

			const result = getStoredBaggageByLfid({
				passengers,
				lfid: 76407,
				serviceCategory: "baggage",
			});

			expect(result.passenger1?.carryOn.CABN).toBeDefined();
			expect(result.passenger1?.checkedIn.BAGN?.quantity).toBe(1);
			expect(result.passenger1?.sportsEquipment.SKII?.quantity).toBe(1);
		});

		it("aggregates duplicate checked-in and sports equipment services", () => {
			const checkedIn = createService({
				categoryId: 143,
				ssrCode: "BAGN",
				serviceID: 1221,
				description: "Checked-in baggage",
			});

			const sportsEquipment = createService({
				categoryId: 145,
				ssrCode: "SKII",
				serviceID: 184,
				description: "Ski equipment",
			});

			const passengers = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							{ ...checkedIn },
							{ ...checkedIn },
							{ ...sportsEquipment },
							{ ...sportsEquipment },
						],
					},
				},
			] as unknown as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"];

			const result = getStoredBaggageByLfid({
				passengers,
				lfid: 76407,
				serviceCategory: "baggage",
			});

			expect(result.passenger1?.checkedIn.BAGN?.quantity).toBe(2);
			expect(result.passenger1?.sportsEquipment.SKII?.quantity).toBe(2);
		});

		it("ignores services with unsupported category ids", () => {
			const passengers = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							createService({
								categoryId: 999,
								ssrCode: "UNKNOWN",
							}),
						],
					},
				},
			] as unknown as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"];

			const result = getStoredBaggageByLfid({
				passengers,
				lfid: 76407,
				serviceCategory: "baggage",
			});

			expect(result.passenger1).toEqual({
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			});
		});

		it("builds stored baggage independently for multiple passengers", () => {
			const passengers = [
				{
					id: "passenger1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							createService({
								categoryId: 144,
								ssrCode: "CABN",
							}),
						],
					},
				},
				{
					id: "passenger2",
					firstName: "Jane",
					lastName: "Doe",
					passengerTypeCode: "adult",
					services: {
						baggage: [
							createService({
								categoryId: 143,
								ssrCode: "BAGN",
								serviceID: 1221,
							}),
						],
					},
				},
			] as unknown as Parameters<typeof getStoredBaggageByLfid>[0]["passengers"];

			const result = getStoredBaggageByLfid({
				passengers,
				lfid: 76407,
				serviceCategory: "baggage",
			});

			expect(result.passenger1?.carryOn.CABN).toBeDefined();
			expect(result.passenger1?.checkedIn).toEqual({});

			expect(result.passenger2?.carryOn).toEqual({});
			expect(result.passenger2?.checkedIn.BAGN?.quantity).toBe(1);
		});
	});
});
