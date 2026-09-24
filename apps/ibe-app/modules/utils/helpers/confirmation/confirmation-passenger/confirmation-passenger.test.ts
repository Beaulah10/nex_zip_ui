import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories", () => ({
	buildBaggageCategories: vi.fn(() => ["built"]),
	mapBaggageCategories: vi.fn(() => [
		{
			title: "passenger_list_checked_in_baggage",
			items: [{ label: "20kg", price: 50 }],
		},
	]),
}));

vi.mock("@/modules/utils/helpers/bundle/bundle.helpers", () => ({
	getBundleName: vi.fn((code: string) => `Bundle ${code}`),
}));

vi.mock(
	"@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel",
	() => ({
		isBundleSeatEligible: vi.fn((code?: string) => code === "PREM"),
	})
);

import { CONFIRMATION_SUMMARY_ROW_IDS } from "@/modules/utils/constants/confirmation/summary-row.constants";
import {
	buildBaggageCategories,
	mapBaggageCategories,
} from "@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories";
import type { PassengerService } from "@/types/passenger/passenger.type";
import {
	buildPassengerDisplayList,
	getPassengerAgeBadge,
	getPassengerInfoRows,
	getPassengerSummaryRows,
	getPassengerTotal,
} from "./confirmation-passenger";

const labels = {
	bundleLabel: "Bundle",
	bundleUnavailableForAssociatedDependentNote: "Bundle unavailable for dependent",
	priorityAssociatedDependentIncludedNote: "Priority included with associated adult",
	infantAssociatedDependentIncludedNote: "Infant included with associated adult",
	seatTypeLabel: "Seat type",
	seatLabel: "Seat",
	baggageLabel: "Baggage",
	mealLabel: "Meal",
	priorityServicesLabel: "Priority",
	airportLoungeLabel: "Lounge",
	transportServicesLabel: "Transport",
	ancillaryOptionalServicesLabel: "Extras",
	flightChangeVoucherLabel: "Voucher",
	selectedLabel: "Selected",
	addLabel: "Add",
	changeLabel: "Change",
	standardSeatTypeLabel: "Standard",
	zipFullFlatSeatTypeLabel: "ZIP Full Flat",
	baggageTranslate: (key: string) => key,
	seatTypeNote: "Fare included",
	seatIncludedInBundleNote: "Included in bundle",
	notSelectedLabel: "Not selected",
};

function makePassenger(overrides: Record<string, unknown> = {}) {
	return {
		id: "P1",
		firstName: "John",
		middleName: "Q",
		lastName: "Doe",
		passengerTypeCode: "adult",
		bundles: [{ lfid: 1, bundleCode: "FLBF", amount: 100 }],
		seats: [
			{ lfid: 1, row: "12", column: "A", amount: 30, serviceCode: "STZF", bundleCode: "PREM" },
		],
		services: {
			baggage: [
				{
					lfid: 1,
					categoryId: 143,
					ssrCode: "BAGN",
					amount: 80,
					applicableAmount: 20,
					quantity: 1,
				},
			],
			meals: [
				{ lfid: 1, ssrCode: "ML1", description: "Veg meal", amount: 25, applicableAmount: 0 },
			],
			express: [{ lfid: 1, ssrCode: "EX1", description: "Priority lane", amount: 10 }],
			lounge: [{ lfid: 1, ssrCode: "LG1", description: "Lounge", amount: 15 }],
			travel: [{ lfid: 1, ssrCode: "TR1", description: "Transfer", amount: 18 }],
			extras: [{ lfid: 1, ssrCode: "EXTRA", description: "Wi-Fi", amount: 12 }],
			"non-chargeable": [{ lfid: 1, ssrCode: "WCHR", amount: 0 }],
		},
		apisInfo: {
			passportNumber: "AA12345",
			passportExpiryDate: { year: "2030", month: "1", day: "2" },
			nationality: "JP",
		},
		dateOfBirth: { year: "2000", month: "3", day: "4" },
		...overrides,
	} as any;
}

function makePassengerService(overrides: Partial<PassengerService> = {}): PassengerService {
	return {
		lfid: 1,
		pfid: 0,
		amount: 0,
		applicableAmount: undefined,
		categoryId: 0,
		cutOffHours: 0,
		description: "",
		maxCountServiceLevel: 0,
		passengerType: "adult",
		qtyAvailable: 0,
		ssrCode: "",
		serviceID: 0,
		chargeComment: "",
		bundleCode: "",
		...overrides,
	};
}

describe("confirmation-passenger", () => {
	it("maps passenger age badges for supported child and infant codes", () => {
		expect(getPassengerAgeBadge("INF")).toBe("0 - 1 year");
		expect(getPassengerAgeBadge("childc")).toBe("2 - 6 years");
		expect(getPassengerAgeBadge("childb")).toBe("7 - 11 years");
		expect(getPassengerAgeBadge("CHD")).toBe("12 - 14 years");
		expect(getPassengerAgeBadge("adult")).toBeUndefined();
	});

	it("builds summary rows with bundled seats, baggage groups, placeholders, and voucher row", () => {
		const rows = getPassengerSummaryRows(
			makePassenger({
				services: {
					baggage: [
						{ lfid: 1, categoryId: 144, ssrCode: "CABN", amount: 10, applicableAmount: 10 },
						{ lfid: 1, categoryId: 143, ssrCode: "BAGN", amount: 80, applicableAmount: 20 },
						{ lfid: 1, categoryId: 143, ssrCode: "BAGN", amount: 80, applicableAmount: 20 },
						{ lfid: 1, categoryId: 145, ssrCode: "GOLF", amount: 60, applicableAmount: 60 },
						{ lfid: 1, categoryId: 145, ssrCode: "GOLF", amount: 60, applicableAmount: 60 },
					],
					meals: [
						{ lfid: 1, ssrCode: "ML1", description: "Veg meal", amount: 25, applicableAmount: 0 },
					],
					express: [{ lfid: 1, ssrCode: "EX1", description: "Priority lane", amount: 10 }],
					lounge: [{ lfid: 1, ssrCode: "LG1", description: "Lounge", amount: 15 }],
					travel: [{ lfid: 1, ssrCode: "TR1", description: "Transfer", amount: 18 }],
					extras: [{ lfid: 1, ssrCode: "EXTRA", description: "Wi-Fi", amount: 12 }],
					"non-chargeable": [{ lfid: 1, ssrCode: "WCHR", amount: 0 }],
				},
			}),
			labels as any,
			{
				seatTypePrice: 250,
			}
		);

		expect(rows.map((row) => row.label)).toEqual([
			"Bundle",
			"Seat type",
			"Seat",
			"Baggage",
			"Meal",
			"Priority",
			"Lounge",
			"Transport",
			"Extras",
			"Voucher",
		]);
		expect(rows[0]?.groups[0]?.items).toEqual([{ label: "Bundle FLBF", price: 100 }]);
		expect(rows[1]?.groups[0]?.items[0]).toEqual({
			label: "ZIP Full Flat",
			price: 250,
			note: "Fare included",
		});
		expect(rows[2]?.groups[0]?.items[0]).toEqual({
			label: "12A",
			price: 0,
			originalPrice: 30,
			note: "Included in bundle",
		});
		expect(rows[3]?.groups[0]?.items[0]).toEqual({
			title: "passenger_list_carry_on_baggage",
			hideOriginalPrice: true,
			label: "Not selected",
		});
		expect(rows[4]?.groups[0]?.items[0]).toEqual({
			label: "Veg meal",
			price: 0,
			originalPrice: 25,
			note: "Included in bundle",
		});
		expect(vi.mocked(buildBaggageCategories)).toHaveBeenCalledWith(
			expect.objectContaining({
				baggageServices: expect.objectContaining({
					carryOn: expect.objectContaining({ CABN: expect.any(Object) }),
					checkedIn: expect.objectContaining({
						BAGN: expect.objectContaining({ quantity: 2 }),
					}),
					sportsEquipment: expect.objectContaining({
						GOLF: expect.objectContaining({ quantity: 2 }),
					}),
				}),
			})
		);
	});

	it("uses dependent notes, hides some add buttons, and disables optional route rows when requested", () => {
		const passenger = makePassenger({
			bundles: [],
			seats: [],
			services: {
				baggage: [],
				meals: [],
				express: [],
				lounge: [],
				travel: [],
				extras: [],
				"non-chargeable": [],
			},
		});
		const rows = getPassengerSummaryRows(passenger, labels as any, {
			forceNoBundleWithAssociatedDependentNote: true,
			hideAssociatedPriorityServiceAddButton: true,
			hideAssociatedInfantServiceAddButton: true,
			associatedPriorityPlaceholderServices: [
				makePassengerService({ ssrCode: "EX1", description: "Priority lane", amount: 10 }),
			],
			associatedAirportLoungePlaceholderServices: [
				makePassengerService({ ssrCode: "LG1", description: "Lounge", amount: 15 }),
			],
			associatedTransportPlaceholderServices: [
				makePassengerService({ ssrCode: "TR1", description: "Transfer", amount: 18 }),
			],
			isAirportLoungeRouteEnabled: false,
			isTransportServiceRouteEnabled: false,
			forceAssociatedAdultSeatPriceToZero: true,
		});

		expect(rows[0]?.groups[0]?.items[0]).toEqual({
			label: "Bundle NOBN",
			note: "Bundle unavailable for dependent",
		});
		expect(rows[0]?.changeLabel).toBeUndefined();
		expect(rows[2]?.changeLabel).toBe("Add");
		expect(rows[4]?.groups[0]?.items[0]).toEqual({ label: "Not selected" });
		expect(rows.some((row) => row.label === "Lounge")).toBe(false);
		expect(rows.some((row) => row.label === "Transport")).toBe(false);
	});

	it("keeps lounge and transport add buttons for associated childC passengers when not selected", () => {
		const adult = makePassenger({ id: "A1" });
		const childValues = makePassenger({
			id: "C1",
			passengerTypeCode: "childC",
			firstName: "Kid",
			middleName: "",
			lastName: "Doe",
			bundles: [],
			seats: [],
			associateWithPassengerId: "A1",
			services: {
				baggage: [],
				meals: [],
				express: [],
				lounge: [],
				travel: [],
				extras: [],
				"non-chargeable": [],
			},
		});

		const passengerDetails = [
			{
				id: "A1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "ADT",
				nonChargeable: { assistanceService: { requestingAssistance: false } },
			},
			{
				id: "C1",
				firstName: "Kid",
				lastName: "Doe",
				passengerTypeCode: "childC",
				hasAccompanyingAdult: true,
				accompanyingAdult: "A1",
				nonChargeable: { assistanceService: { requestingAssistance: false } },
			},
		] as any;

		const result = buildPassengerDisplayList(
			passengerDetails,
			[adult, childValues],
			labels as any,
			new Set([1]),
			{
				isAirportLoungeRouteEnabled: true,
				isTransportServiceRouteEnabled: true,
			}
		);

		const childRows = result[1]?.summaryRows;
		if (!childRows) {
			throw new Error("Expected child summary rows to be defined");
		}
		const priorityRow = childRows.find((row) => row.id === CONFIRMATION_SUMMARY_ROW_IDS.priority);
		const loungeRow = childRows.find((row) => row.id === CONFIRMATION_SUMMARY_ROW_IDS.lounge);
		const transportRow = childRows.find((row) => row.id === CONFIRMATION_SUMMARY_ROW_IDS.transport);

		expect(priorityRow?.changeLabel).toBeUndefined();
		expect(loungeRow?.groups[0]?.items[0]).toEqual({ label: "Not selected" });
		expect(loungeRow?.changeLabel).toBe("Add");
		expect(transportRow?.groups[0]?.items[0]).toEqual({ label: "Not selected" });
		expect(transportRow?.changeLabel).toBe("Add");
	});

	it("inherits lounge and transport placeholders only for associated infants", () => {
		const adult = makePassenger({
			id: "A1",
			services: {
				baggage: [],
				meals: [],
				express: [{ lfid: 1, ssrCode: "EX1", description: "ZIPAIR Express Service", amount: 10 }],
				lounge: [{ lfid: 1, ssrCode: "LG1", description: "Lounge", amount: 15 }],
				travel: [{ lfid: 1, ssrCode: "TR1", description: "Transfer", amount: 18 }],
				extras: [],
				"non-chargeable": [],
			},
		});
		const infantValues = makePassenger({
			id: "I1",
			passengerTypeCode: "INF",
			firstName: "Baby",
			middleName: "",
			lastName: "Doe",
			bundles: [],
			seats: [],
			associateWithPassengerId: "A1",
			services: {
				baggage: [],
				meals: [],
				express: [],
				lounge: [],
				travel: [],
				extras: [],
				"non-chargeable": [],
			},
		});

		const passengerDetails = [
			{
				id: "A1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "ADT",
				nonChargeable: { assistanceService: { requestingAssistance: false } },
			},
			{
				id: "I1",
				firstName: "Baby",
				lastName: "Doe",
				passengerTypeCode: "INF",
				hasAccompanyingAdult: true,
				accompanyingAdult: "A1",
				nonChargeable: { assistanceService: { requestingAssistance: false } },
			},
		] as any;

		const result = buildPassengerDisplayList(
			passengerDetails,
			[adult, infantValues],
			labels as any,
			new Set([1]),
			{
				isAirportLoungeRouteEnabled: true,
				isTransportServiceRouteEnabled: true,
			}
		);

		const infantRows = result[1]?.summaryRows;
		if (!infantRows) {
			throw new Error("Expected infant summary rows to be defined");
		}
		const priorityRow = infantRows.find((row) => row.id === CONFIRMATION_SUMMARY_ROW_IDS.priority);
		const loungeRow = infantRows.find((row) => row.id === CONFIRMATION_SUMMARY_ROW_IDS.lounge);
		const transportRow = infantRows.find(
			(row) => row.id === CONFIRMATION_SUMMARY_ROW_IDS.transport
		);

		expect(priorityRow?.groups[0]?.items[0]).toEqual({
			label: "ZIPAIR Express Service",
			note: "Priority included with associated adult",
		});
		expect(priorityRow?.changeLabel).toBeUndefined();
		expect(loungeRow?.groups[0]?.items[0]).toEqual({
			label: "Lounge",
			note: "Infant included with associated adult",
		});
		expect(loungeRow?.changeLabel).toBeUndefined();
		expect(transportRow?.groups[0]?.items[0]).toEqual({
			label: "Transfer",
			note: "Infant included with associated adult",
		});
		expect(transportRow?.changeLabel).toBeUndefined();
	});

	it("calculates passenger totals including fare, bundles, seats, and service applicable amounts", () => {
		expect(getPassengerTotal(makePassenger(), { fareAmount: 200 })).toBe(375);
		expect(
			getPassengerTotal(makePassenger(), {
				fareAmount: 200,
				excludeBundles: true,
				forceAssociatedAdultSeatPriceToZero: true,
			})
		).toBe(275);
	});

	it("builds passenger info rows with formatted identity and assistance flags", () => {
		expect(getPassengerInfoRows([makePassenger()], new Map([["JP", "Japan"]]))).toEqual([
			{
				id: "P1",
				name: "DOE JOHN Q",
				dateOfBirth: "Mar 4, 2000",
				passportNumber: "AA12345",
				expiryDate: "Jan 2, 2030",
				nationality: "Japan",
				needsAssistance: true,
				isInfant: false,
			},
		]);
	});

	it("builds passenger display entries with segment scoping and dependent inheritance rules", () => {
		const adult = makePassenger({ id: "A1" });
		const infantValues = makePassenger({
			id: "I1",
			passengerTypeCode: "INF",
			firstName: "Baby",
			middleName: "",
			lastName: "Doe",
			bundles: [{ lfid: 2, bundleCode: "VALB", amount: 50 }],
			seats: [],
			associateWithPassengerId: "A1",
			services: {
				baggage: [],
				meals: [],
				express: [],
				lounge: [],
				travel: [],
				extras: [],
				"non-chargeable": [],
			},
		});

		const passengerDetails = [
			{
				id: "A1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "ADT",
				nonChargeable: { assistanceService: { requestingAssistance: false } },
				dateOfBirth: "1980-01-01",
				apisInfo: { nationality: "US" },
			},
			{
				id: "I1",
				firstName: "Baby",
				lastName: "Doe",
				passengerTypeCode: "INF",
				hasAccompanyingAdult: true,
				accompanyingAdult: "A1",
				nonChargeable: { assistanceService: { requestingAssistance: true } },
				dateOfBirth: { year: "2025", month: "6", day: "1" },
				apisInfo: { passportNumber: "INF1", passportExpiryDate: "2031-01-01", nationality: "JP" },
			},
		] as any;

		const result = buildPassengerDisplayList(
			passengerDetails,
			[adult, infantValues],
			labels as any,
			new Set([1]),
			{
				fareInfo: {
					fareDetails: [
						{ passengerType: "ADT", fareAmt: 200, fareAmtInclTax: 200 },
						{ passengerType: "INF", fareAmt: 50, fareAmtInclTax: 50 },
					],
				} as any,
			}
		);

		expect(result).toHaveLength(2);
		expect(result[0]?.id).toBe("A1");
		expect(result[0]?.totalPrice).toBeGreaterThan(200);
		expect(result[0]?.summaryRows[2]?.groups[0]?.items[0]?.price).toBe(0);
		expect(result[1]).toMatchObject({
			id: "I1",
			name: "DOE BABY",
			passengerTypeCode: "INF",
			isInfant: true,
			badgeLabel: "0 - 1 year",
		});
		expect(result[1]?.summaryRows[0]?.groups[0]?.items[0]).toEqual({
			label: "Bundle NOBN",
		});
		expect(result[1]?.infoRow.needsAssistance).toBe(true);
	});

	it("keeps all ancillaries when no segment filter is provided", () => {
		vi.mocked(mapBaggageCategories).mockReturnValueOnce(undefined as any);
		const passenger = makePassenger({
			bundles: [{ lfid: 1, bundleCode: "NOBN", amount: 0 }],
			services: {
				baggage: [{ lfid: 99, categoryId: 143, ssrCode: "BAGN", amount: 80 }],
				meals: [],
				express: [],
				lounge: [],
				travel: [],
				extras: [],
				"non-chargeable": [],
			},
		});

		const result = buildPassengerDisplayList(
			[
				{
					id: "P1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "ADT",
					nonChargeable: { assistanceService: { requestingAssistance: false } },
				},
			] as any,
			[passenger],
			labels as any
		);

		expect(result[0]?.summaryRows[3]?.groups[0]?.items[0]).toEqual({
			hideOriginalPrice: true,
			label: "Not selected",
			title: "passenger_list_carry_on_baggage",
		});
	});
});
