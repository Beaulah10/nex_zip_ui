import { describe, expect, it } from "vitest";
import {
	createLfidBySsrCodeMap,
	findSpecialService,
	getAdultServiceQtyAvailable,
	getAllTransportSpecialServices,
	getServiceStockLimit,
	hasStoredTransportServiceForPassenger,
	hasStoredTransportServiceForScope,
	mapServiceIdToSsrCode,
	passengerType,
	SERVICE_ID_TO_SSR_CODE,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";

type TransportApiResponse = Parameters<typeof getAllTransportSpecialServices>[0];
type TransportPassengers = Parameters<
	typeof hasStoredTransportServiceForPassenger
>[0]["passengers"];

const asTransportApiResponse = (value: unknown): TransportApiResponse =>
	value as TransportApiResponse;

const asTransportPassengers = (value: unknown): TransportPassengers => value as TransportPassengers;

const makeTransportationData = (
	entries: Array<{
		passengerType: string;
		ssrCode?: string;
		amount?: number;
		qtyAvailable?: number;
		lfid?: number;
	}>
): TransportApiResponse =>
	asTransportApiResponse({
		data: {
			servicesPerPassengerType: entries.reduce<
				Array<{
					passengerType: string;
					categories: Array<{ specialServices: Array<Record<string, unknown>> }>;
				}>
			>((accumulator, entry) => {
				const existing = accumulator.find((item) => item.passengerType === entry.passengerType);

				const service = {
					ssrCode: entry.ssrCode,
					amount: entry.amount,
					qtyAvailable: entry.qtyAvailable,
					lfid: entry.lfid,
				};

				if (existing) {
					const firstCategory = existing.categories[0];

					if (firstCategory) {
						firstCategory.specialServices.push(service);
					}

					return accumulator;
				}

				accumulator.push({
					passengerType: entry.passengerType,
					categories: [{ specialServices: [service] }],
				});

				return accumulator;
			}, []),
		},
	});

const emptyTransportData = asTransportApiResponse({});

const passengers = asTransportPassengers([
	{
		id: "p1",
		passengerTypeCode: "adult",
		firstName: "John",
		lastName: "Doe",
		services: {
			travel: [
				{ ssrCode: "TXIA", lfid: 10, serviceID: 100 },
				{ ssrCode: "TRLA", lfid: 20, serviceID: 200 },
			],
		},
	},
	{
		id: "p2",
		passengerTypeCode: "childA",
		firstName: "Jane",
		lastName: "Doe",
		services: {
			travel: [{ ssrCode: "TRLB", lfid: 30, serviceID: 300 }],
		},
	},
]);

describe("transport-service-api-response utilities", () => {
	it("classifies getAllTransportSpecialServices as a utility and flattens services", () => {
		const result = getAllTransportSpecialServices(
			makeTransportationData([
				{ passengerType: "adult", ssrCode: "TXIA" },
				{ passengerType: "adult", ssrCode: "TRLA" },
				{ passengerType: "childA", ssrCode: "TRLB" },
			])
		);

		expect(result).toHaveLength(3);
	});

	it("returns an empty flattened services list when data is missing", () => {
		expect(getAllTransportSpecialServices(emptyTransportData)).toEqual([]);
	});

	it("handles passenger-type entries with missing categories or specialServices arrays", () => {
		const result = getAllTransportSpecialServices(
			asTransportApiResponse({
				data: {
					servicesPerPassengerType: [
						{ passengerType: "ADT" },
						{
							passengerType: "CHD",
							categories: [
								{
									specialServices: [],
								},
							],
						},
					],
				},
			})
		);

		expect(result).toEqual([]);
	});

	it("normalizes passenger types", () => {
		expect(passengerType("ADT")).toBe("adult");
		expect(passengerType("CHD")).toBe("childa");
		expect(passengerType(undefined)).toBe("");
	});

	it("finds a special service for the exact passenger type", () => {
		const result = findSpecialService(
			makeTransportationData([
				{ passengerType: "ADT", ssrCode: "TXIA", amount: 100 },
				{ passengerType: "CHD", ssrCode: "TXIA", amount: 80 },
			]),
			"CHD",
			"TXIA"
		);

		expect(result?.amount).toBe(80);
	});

	it("falls back to adult service when requested passenger type is unavailable", () => {
		const result = findSpecialService(
			makeTransportationData([{ passengerType: "ADT", ssrCode: "TXIA", amount: 100 }]),
			"childB",
			"TXIA"
		);

		expect(result?.amount).toBe(100);
	});

	it("returns undefined when the passenger type exists but has no matching SSR entry", () => {
		const result = findSpecialService(
			makeTransportationData([{ passengerType: "ADT", ssrCode: "TRLA", amount: 100 }]),
			"ADT",
			"TXIA"
		);

		expect(result).toBeUndefined();
	});

	it("returns undefined when the matched passenger type has no specialServices array", () => {
		const result = findSpecialService(
			asTransportApiResponse({
				data: {
					servicesPerPassengerType: [
						{
							passengerType: "ADT",
							categories: [
								{
									specialServices: [],
								},
							],
						},
					],
				},
			}),
			"ADT",
			"TXIA"
		);

		expect(result).toBeUndefined();
	});

	it("returns undefined when the matched passenger type category omits specialServices", () => {
		const result = findSpecialService(
			asTransportApiResponse({
				data: {
					servicesPerPassengerType: [
						{
							passengerType: "ADT",
							categories: [{}],
						},
					],
				},
			}),
			"ADT",
			"TXIA"
		);

		expect(result).toBeUndefined();
	});

	it("returns undefined when passenger type or SSR code is missing", () => {
		expect(findSpecialService(makeTransportationData([]), undefined, "TXIA")).toBeUndefined();
		expect(findSpecialService(makeTransportationData([]), "ADT", "")).toBeUndefined();
	});

	it("returns null stock limit when no SSR code or no matching quantities exist", () => {
		expect(getServiceStockLimit(makeTransportationData([]), "")).toBeNull();

		expect(
			getServiceStockLimit(
				makeTransportationData([{ passengerType: "ADT", ssrCode: "TRLA" }]),
				"TXIA"
			)
		).toBeNull();
	});

	it("returns the highest finite stock limit for an SSR code", () => {
		const result = getServiceStockLimit(
			makeTransportationData([
				{ passengerType: "ADT", ssrCode: "TXIA", qtyAvailable: 1 },
				{ passengerType: "CHD", ssrCode: "TXIA", qtyAvailable: 5 },
				{ passengerType: "INF", ssrCode: "TXIA", qtyAvailable: Number.NaN },
			]),
			"TXIA"
		);

		expect(result).toBe(5);
	});

	it("ignores non-matching and missing SSR codes when calculating stock limit", () => {
		const result = getServiceStockLimit(
			makeTransportationData([
				{ passengerType: "ADT", ssrCode: undefined, qtyAvailable: 9 },
				{ passengerType: "ADT", ssrCode: "TRLB", qtyAvailable: 2 },
			]),
			"TXIA"
		);

		expect(result).toBeNull();
	});

	it("returns null stock limit for an empty transport payload with a valid SSR code", () => {
		expect(getServiceStockLimit(emptyTransportData, "TXIA")).toBeNull();
	});

	it("returns null stock limit when the SSR matches but qtyAvailable is undefined", () => {
		expect(
			getServiceStockLimit(
				makeTransportationData([
					{ passengerType: "ADT", ssrCode: "TXIA", qtyAvailable: undefined },
				]),
				"TXIA"
			)
		).toBeNull();
	});

	it("returns null stock limit when matching quantities are non-finite only", () => {
		expect(
			getServiceStockLimit(
				makeTransportationData([
					{ passengerType: "ADT", ssrCode: "TXIA", qtyAvailable: Number.NaN },
					{ passengerType: "CHD", ssrCode: "TXIA", qtyAvailable: Number.POSITIVE_INFINITY },
				]),
				"TXIA"
			)
		).toBeNull();
	});

	it("returns adult qtyAvailable when finite and null otherwise", () => {
		expect(
			getAdultServiceQtyAvailable(
				makeTransportationData([{ passengerType: "ADT", ssrCode: "TXIA", qtyAvailable: 4 }]),
				"TXIA"
			)
		).toBe(4);

		expect(
			getAdultServiceQtyAvailable(
				makeTransportationData([
					{ passengerType: "ADT", ssrCode: "TXIA", qtyAvailable: Number.POSITIVE_INFINITY },
				]),
				"TXIA"
			)
		).toBeNull();

		expect(getAdultServiceQtyAvailable(makeTransportationData([]), "")).toBeNull();
	});

	it("checks stored transport service presence for a specific passenger", () => {
		expect(
			hasStoredTransportServiceForPassenger({
				passengers: [...passengers],
				passengerId: "p1",
				ssrCode: "TXIA",
				lfid: 10,
				serviceID: 100,
			})
		).toBe(true);

		expect(
			hasStoredTransportServiceForPassenger({
				passengers: [...passengers],
				passengerId: "missing",
				ssrCode: "TXIA",
				lfid: 10,
				serviceID: 100,
			})
		).toBe(false);

		expect(
			hasStoredTransportServiceForPassenger({
				passengers: [...passengers],
				passengerId: "p1",
				ssrCode: "TXIA",
				lfid: 10,
				serviceID: 999,
			})
		).toBe(false);

		expect(
			hasStoredTransportServiceForPassenger({
				passengers: [
					{
						id: "p3",
						passengerTypeCode: "adult",
						firstName: "No",
						lastName: "Services",
					},
				],
				passengerId: "p3",
				ssrCode: "TXIA",
				lfid: 10,
				serviceID: 100,
			})
		).toBe(false);
	});

	it("checks stored transport service presence across scope", () => {
		expect(
			hasStoredTransportServiceForScope({
				passengers: [...passengers],
				ssrCode: "TRLB",
				lfid: 30,
			})
		).toBe(true);

		expect(
			hasStoredTransportServiceForScope({
				passengers: [...passengers],
				ssrCode: "TRLB",
				lfid: 999,
			})
		).toBe(false);

		expect(
			hasStoredTransportServiceForScope({
				passengers: [
					{
						id: "p4",
						passengerTypeCode: "adult",
						firstName: "No",
						lastName: "Travel",
					},
				],
				ssrCode: "TXIA",
				lfid: 10,
			})
		).toBe(false);
	});

	it("creates an SSR-to-LFID map and skips invalid service entries", () => {
		const result = createLfidBySsrCodeMap(
			makeTransportationData([
				{ passengerType: "ADT", ssrCode: "TXIA", lfid: 10 },
				{ passengerType: "ADT", ssrCode: "TRLA", lfid: 20 },
				{ passengerType: "CHD", ssrCode: undefined, lfid: 30 },
				{ passengerType: "INF", ssrCode: "TRLC" },
			])
		);

		expect(result.get("TXIA")).toBe(10);
		expect(result.get("TRLA")).toBe(20);
		expect(result.has("TRLC")).toBe(false);
	});

	it("maps service ids to SSR codes and exposes the shared constant map", () => {
		expect(SERVICE_ID_TO_SSR_CODE["shuttle-one-way"]).toBe("TXIA");
		expect(mapServiceIdToSsrCode("trolley-4-days")).toBe("TRLB");
		expect(mapServiceIdToSsrCode(null)).toBe("");
	});
});
