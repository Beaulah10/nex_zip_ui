import { describe, expect, it } from "vitest";
import {
	getAdultAmount,
	getAmountByPassengerTypeAndSsrCode,
	getChildAmount,
	getOlderAmount,
	getPassengerAmountByPricingSsr,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-pricing/transport-service-pricing";

type TransportationData = Parameters<typeof getAdultAmount>[0];
type PricingParams = Parameters<typeof getPassengerAmountByPricingSsr>[0];

const asTransportationData = (value: unknown): TransportationData => value as TransportationData;
const asPricingParams = (value: unknown): PricingParams => value as PricingParams;

const makeTransportationData = (
	entries: Array<{
		passengerType: string;
		ssrCode: string;
		amount?: number;
	}>
): TransportationData =>
	asTransportationData({
		data: {
			servicesPerPassengerType: entries.reduce<
				Array<{
					passengerType: string;
					categories: Array<{ specialServices: Array<{ ssrCode: string; amount?: number }> }>;
				}>
			>((accumulator, entry) => {
				const existing = accumulator.find((item) => item.passengerType === entry.passengerType);
				if (existing) {
					existing.categories[0]?.specialServices?.push({
						ssrCode: entry.ssrCode,
						amount: entry.amount,
					});
					return accumulator;
				}

				accumulator.push({
					passengerType: entry.passengerType,
					categories: [
						{
							specialServices: [{ ssrCode: entry.ssrCode, amount: entry.amount }],
						},
					],
				});
				return accumulator;
			}, []),
		},
	});

describe("transport-service-pricing utilities", () => {
	it("classifies getAdultAmount as a utility and returns direct adult pricing", () => {
		const result = getAdultAmount(
			makeTransportationData([{ passengerType: "adult", ssrCode: "TXIA", amount: 1000 }]),
			"TXIA"
		);

		expect(result).toBe(1000);
	});

	it("returns 0 when adult pricing is missing", () => {
		expect(getAdultAmount(makeTransportationData([]), "TXIA")).toBe(0);
	});

	it("returns the first older-passenger pricing match across adult and childA", () => {
		const result = getOlderAmount(
			makeTransportationData([{ passengerType: "CHD", ssrCode: "TRLA", amount: 800 }]),
			"TRLA"
		);

		expect(result).toBe(800);
	});

	it("falls through the first older-passenger type before matching the second", () => {
		const result = getOlderAmount(
			makeTransportationData([{ passengerType: "childA", ssrCode: "TRLB", amount: 810 }]),
			"TRLB"
		);

		expect(result).toBe(810);
	});

	it("returns the first child pricing match across childB and childC", () => {
		const result = getChildAmount(
			makeTransportationData([{ passengerType: "childc", ssrCode: "TRLB", amount: 300 }]),
			"TRLB"
		);

		expect(result).toBe(300);
	});

	it("returns 0 when no older-passenger pricing matches any configured passenger type", () => {
		expect(getOlderAmount(makeTransportationData([]), "TRLA")).toBe(0);
	});

	it("returns 0 when no child-passenger pricing matches any configured passenger type", () => {
		expect(getChildAmount(makeTransportationData([]), "TRLB")).toBe(0);
	});

	it("normalizes passenger type and SSR code when getting amount by type and code", () => {
		const result = getAmountByPassengerTypeAndSsrCode(
			makeTransportationData([{ passengerType: " ADT ", ssrCode: "TRLC", amount: 150 }]),
			" adult ",
			" trlc "
		);

		expect(result).toBe(150);
	});

	it("returns 0 when passenger type or SSR code is empty", () => {
		expect(getAmountByPassengerTypeAndSsrCode(makeTransportationData([]), "", "TRLC")).toBe(0);
		expect(getAmountByPassengerTypeAndSsrCode(makeTransportationData([]), "adult", "")).toBe(0);
		expect(
			getAmountByPassengerTypeAndSsrCode(makeTransportationData([]), "adult", undefined as never)
		).toBe(0);
	});

	it("returns 0 when transport data has no passenger-type list", () => {
		expect(getAmountByPassengerTypeAndSsrCode(asTransportationData({}), "adult", "TRLC")).toBe(0);
	});

	it("returns 0 when matching passenger type has no categories or specialServices", () => {
		expect(
			getAmountByPassengerTypeAndSsrCode(
				asTransportationData({
					data: {
						servicesPerPassengerType: [{ passengerType: "adult", categories: [{}] }],
					},
				}),
				"adult",
				"TRLC"
			)
		).toBe(0);
		expect(
			getAmountByPassengerTypeAndSsrCode(
				asTransportationData({
					data: {
						servicesPerPassengerType: [{ passengerType: "adult" }],
					},
				}),
				"adult",
				"TRLC"
			)
		).toBe(0);
	});

	it("returns direct passenger pricing when available", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([
					{ passengerType: "childb", ssrCode: "TRLC", amount: 275 },
				]),
				pricingSsrCode: "TRLC",
				passengerTypeCode: "childb",
			})
		);

		expect(result).toBe(275);
	});

	it("returns direct 0 for non-trolley SSR when no direct pricing exists", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([]),
				pricingSsrCode: "TXIA",
				passengerTypeCode: "adult",
			})
		);

		expect(result).toBe(0);
	});

	it("falls back between adult and childA for trolley older-passenger pricing", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([
					{ passengerType: "adult", ssrCode: "TRLA", amount: 900 },
				]),
				pricingSsrCode: "TRLA",
				passengerTypeCode: "CHD",
			})
		);

		expect(result).toBe(900);
	});

	it("falls back to childA pricing when adult pricing is unavailable for older trolley passengers", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([
					{ passengerType: "childA", ssrCode: "TRLA", amount: 910 },
				]),
				pricingSsrCode: "TRLA",
				passengerTypeCode: "adult",
			})
		);

		expect(result).toBe(910);
	});

	it("falls back between childB and childC for trolley child pricing", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([
					{ passengerType: "childc", ssrCode: "TRLB", amount: 350 },
				]),
				pricingSsrCode: "TRLB",
				passengerTypeCode: "childb",
			})
		);

		expect(result).toBe(350);
	});

	it("falls back to childB pricing when childC has no direct trolley pricing", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([
					{ passengerType: "childb", ssrCode: "TRLB", amount: 360 },
				]),
				pricingSsrCode: "TRLB",
				passengerTypeCode: "childc",
			})
		);

		expect(result).toBe(360);
	});

	it("returns 0 when a matching SSR exists but the amount is not numeric", () => {
		const result = getAmountByPassengerTypeAndSsrCode(
			makeTransportationData([{ passengerType: "adult", ssrCode: "TRLC", amount: undefined }]),
			"adult",
			"TRLC"
		);

		expect(result).toBe(0);
	});

	it("returns 0 for unsupported normalized passenger types when no pricing exists", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([]),
				pricingSsrCode: "TRLC",
				passengerTypeCode: "inf",
			})
		);

		expect(result).toBe(0);
	});

	it("returns 0 for trolley pricing when passenger type is missing and no direct amount exists", () => {
		const result = getPassengerAmountByPricingSsr(
			asPricingParams({
				transportationData: makeTransportationData([]),
				pricingSsrCode: "TRLA",
				passengerTypeCode: undefined,
			})
		);

		expect(result).toBe(0);
	});
});
