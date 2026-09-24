import { describe, expect, it } from "vitest";
import {
	buildSelectablePassengerList,
	getAncillaryServiceOffer,
	getPassengerDisplayName,
	resolveAncillaryServiceOffer,
	resolveServiceBySegment,
} from "./ancillary-service";

const serviceWithStock = {
	lfid: 100,
	pfid: 200,
	amount: 5000,
	cutOffHours: 24,
	description: "Service with stock",
	maxCountServiceLevel: 10,
	qtyAvailable: 5,
	ssrCode: "LNG",
	ssrId: 300,
	currency: "JPY",
	startSalesDays: 0,
};

const serviceWithoutStock = {
	lfid: 200,
	pfid: 201,
	amount: 3000,
	cutOffHours: 24,
	description: "Service without stock",
	maxCountServiceLevel: 10,
	qtyAvailable: 0,
	ssrCode: "LNG",
	ssrId: 301,
	currency: "JPY",
	startSalesDays: 0,
};

const otherSsrService = {
	lfid: 300,
	pfid: 202,
	amount: 1000,
	cutOffHours: 24,
	description: "Other SSR service",
	maxCountServiceLevel: 10,
	qtyAvailable: 3,
	ssrCode: "ABC",
	ssrId: 302,
	currency: "JPY",
	startSalesDays: 0,
};

const servicesPerPassengerType = [
	{
		passengerType: "ADT",
		categories: [
			{
				categoryId: 10,
				specialServices: [serviceWithStock, serviceWithoutStock, otherSsrService],
			},
		],
	},
];

describe("getPassengerDisplayName", () => {
	it("returns full passenger name", () => {
		const result = getPassengerDisplayName({
			firstName: "John",
			middleName: "A",
			lastName: "Doe",
		});
		expect(result).toBe("John A Doe");
	});

	it("ignores empty middle name", () => {
		const result = getPassengerDisplayName({
			firstName: "John",
			middleName: "",
			lastName: "Doe",
		});

		expect(result).toBe("John Doe");
	});

	it("returns only available name values", () => {
		const result = getPassengerDisplayName({
			firstName: "John",
			middleName: "",
			lastName: "",
		});

		expect(result).toBe("John");
	});

	it("returns empty string when no name values are available", () => {
		const result = getPassengerDisplayName({
			firstName: "",
			middleName: "",
			lastName: "",
		});

		expect(result).toBe("");
	});
});

describe("resolveServiceBySegment", () => {
	it("returns service matching selected segment LFID", () => {
		const result = resolveServiceBySegment([serviceWithStock, serviceWithoutStock], 100);

		expect(result).toEqual(serviceWithStock);
	});

	it("returns first service with available quantity when segment does not match", () => {
		const result = resolveServiceBySegment([serviceWithoutStock, serviceWithStock], 999);

		expect(result).toEqual(serviceWithStock);
	});

	it("returns first service when no segment match and no available quantity", () => {
		const result = resolveServiceBySegment([serviceWithoutStock], 999);

		expect(result).toEqual(serviceWithoutStock);
	});

	it("returns undefined when service list is empty", () => {
		const result = resolveServiceBySegment([], 100);

		expect(result).toBeUndefined();
	});
});

describe("getAncillaryServiceOffer", () => {
	it("returns amount and quantity for matching passenger type, SSR code, and segment", () => {
		const result = getAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "ADT",
			ssrCode: "LNG",
			selectedSegmentLfid: 100,
		});

		expect(result).toEqual({
			amount: 5000,
			qtyAvailable: 5,
		});
	});

	it("matches passenger type case-insensitively", () => {
		const result = getAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "adt",
			ssrCode: "LNG",
			selectedSegmentLfid: 100,
		});

		expect(result).toEqual({
			amount: 5000,
			qtyAvailable: 5,
		});
	});

	it("falls back to available service when selected segment does not match", () => {
		const result = getAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "ADT",
			ssrCode: "LNG",
			selectedSegmentLfid: 999,
		});

		expect(result).toEqual({
			amount: 5000,
			qtyAvailable: 5,
		});
	});

	it("returns zero amount and quantity when passenger type is not found", () => {
		const result = getAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "CHD",
			ssrCode: "LNG",
			selectedSegmentLfid: 100,
		});

		expect(result).toEqual({
			amount: 0,
			qtyAvailable: 0,
		});
	});

	it("returns zero amount and quantity when SSR code is not found", () => {
		const result = getAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "ADT",
			ssrCode: "XYZ",
			selectedSegmentLfid: 100,
		});

		expect(result).toEqual({
			amount: 0,
			qtyAvailable: 0,
		});
	});
});

describe("resolveAncillaryServiceOffer", () => {
	it("returns exact ancillary service offer for passenger type, SSR code, and segment", () => {
		const result = resolveAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "ADT",
			ssrCode: "LNG",
			selectedSegmentLfid: 100,
		});

		expect(result).toEqual({
			amount: 5000,
			qtyAvailable: 5,
			categoryId: 10,
			passengerType: "ADT",
			service: serviceWithStock,
		});
	});

	it("returns undefined when passenger type is not found", () => {
		const result = resolveAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "CHD",
			ssrCode: "LNG",
			selectedSegmentLfid: 100,
		});

		expect(result).toBeUndefined();
	});

	it("returns undefined when matching category is not found", () => {
		const result = resolveAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "ADT",
			ssrCode: "XYZ",
			selectedSegmentLfid: 100,
		});

		expect(result).toBeUndefined();
	});

	it("returns undefined when SSR code matches but segment does not match", () => {
		const result = resolveAncillaryServiceOffer({
			servicesPerPassengerType: servicesPerPassengerType as any,
			passengerType: "ADT",
			ssrCode: "LNG",
			selectedSegmentLfid: 999,
		});

		expect(result).toBeUndefined();
	});

	it("returns undefined when matching service is not found inside matching category", () => {
		const result = resolveAncillaryServiceOffer({
			servicesPerPassengerType: [
				{
					passengerType: "ADT",
					categories: [
						{
							categoryId: 10,
							specialServices: [
								{
									...serviceWithStock,
									ssrCode: "LNG",
									lfid: 999,
								},
							],
						},
					],
				},
			] as any,
			passengerType: "ADT",
			ssrCode: "LNG",
			selectedSegmentLfid: 100,
		});

		expect(result).toBeUndefined();
	});
});

describe("buildSelectablePassengerList", () => {
	const passengers = [
		{
			id: "p1",
			firstName: "John",
			middleName: "A",
			lastName: "Doe",
			passengerTypeCode: "ADT",
		},
		{
			id: "p2",
			firstName: "Jane",
			middleName: "",
			lastName: "Smith",
			passengerTypeCode: "CHD",
		},
	];

	it("builds selectable passenger list", () => {
		const result = buildSelectablePassengerList({
			passengers: passengers as any,
			amount: 5000,
			quantityAvailable: 10,
			selectedPassengers: [],
		});

		expect(result).toEqual([
			{
				id: "p1",
				name: "John A Doe",
				category: "ADT",
				price: 5000,
				checked: false,
				disabled: false,
				passengerTypeCode: "ADT",
			},
			{
				id: "p2",
				name: "Jane Smith",
				category: "CHD",
				price: 5000,
				checked: false,
				disabled: false,
				passengerTypeCode: "CHD",
			},
		]);
	});

	it("marks already selected passenger as checked", () => {
		const result = buildSelectablePassengerList({
			passengers: passengers as any,
			amount: 5000,
			quantityAvailable: 10,
			selectedPassengers: [
				{
					id: "p1",
					checked: true,
				},
			] as any,
		});

		expect(result[0]?.checked).toBe(true);
		expect(result[0]?.disabled).toBe(false);
		expect(result[1]?.checked).toBe(false);
	});

	it("keeps selected passenger enabled when selection limit is reached", () => {
		const result = buildSelectablePassengerList({
			passengers: passengers as any,
			amount: 5000,
			quantityAvailable: 1,
			selectedPassengers: [
				{
					id: "p1",
					checked: true,
				},
			] as any,
		});

		expect(result[0]?.checked).toBe(true);
		expect(result[0]?.disabled).toBe(false);
	});

	it("disables unselected passengers when selection limit is reached", () => {
		const result = buildSelectablePassengerList({
			passengers: passengers as any,
			amount: 5000,
			quantityAvailable: 1,
			selectedPassengers: [
				{
					id: "p1",
					checked: true,
				},
			] as any,
		});

		expect(result[1]?.checked).toBe(false);
		expect(result[1]?.disabled).toBe(true);
	});

	it("disables all passengers when quantity is zero", () => {
		const result = buildSelectablePassengerList({
			passengers: passengers as any,
			amount: 5000,
			quantityAvailable: 0,
			selectedPassengers: [],
		});

		expect(result.every((passenger) => passenger.disabled)).toBe(true);
	});

	it("uses Passenger as fallback category when passenger type code is missing", () => {
		const result = buildSelectablePassengerList({
			passengers: [
				{
					id: "p1",
					firstName: "John",
					lastName: "Doe",
				},
			] as any,
			amount: 5000,
			quantityAvailable: 1,
			selectedPassengers: [],
		});

		expect(result[0]?.category).toBe("Passenger");
	});

	it("handles undefined selectedPassengers", () => {
		const result = buildSelectablePassengerList({
			passengers: passengers as any,
			amount: 5000,
			quantityAvailable: 10,
		});

		expect(result[0]?.checked).toBe(false);
		expect(result[0]?.disabled).toBe(false);
		expect(result[1]?.checked).toBe(false);
		expect(result[1]?.disabled).toBe(false);
	});
});
