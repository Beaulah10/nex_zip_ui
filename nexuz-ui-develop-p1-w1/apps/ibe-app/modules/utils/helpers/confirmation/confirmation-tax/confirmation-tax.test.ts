import { describe, expect, it } from "vitest";
import {
	getSegmentTotalFromFareInfo,
	getTaxRows,
	getTaxRowsFromFareInfo,
	getTaxTotal,
	getTaxTotalFromFareInfo,
} from "./confirmation-tax";

const labels = {
	adult: "Adult",
	childA: "Child A",
	childB: "Child B",
	childC: "Child C",
	infant: "Infant",
};

describe("confirmation-tax", () => {
	it("builds tax rows with formatted titles and grouped passenger sub-items", () => {
		const fareInfo = {
			boundSummary: {
				totalTaxAmount: 130,
				taxBreakDown: [
					{
						taxCode: "XT",
						description: "Airport tax",
						taxAmount: 100,
						passengerWiseTaxes: [
							{ passengerType: "adult", count: 2, amount: 70 },
							{ passengerType: "adult", passengerCount: 1, amount: 20 },
							{ passengerType: "childa", count: 1, amount: 10 },
							{ passengerType: "infant", count: 1, amount: 0 },
							{ passengerType: "UNKNOWN", count: 5, amount: 999 },
							{ passengerType: "", count: 1, amount: 1 },
						],
					},
					{
						taxCode: "YQ",
						description: "YQ: Fuel surcharge",
						taxAmount: 30,
						passengerWiseTaxes: [],
					},
					{
						taxCode: "US",
						taxAmount: 0,
						passengerWiseTaxes: [],
					},
				],
			},
			fareDetails: [],
		} as any;

		expect(getTaxRowsFromFareInfo(fareInfo, labels)).toEqual([
			{
				title: "XT: Airport tax",
				price: 100,
				subItems: [
					{ label: "Adult ×3", price: 90 },
					{ label: "Child A ×1", price: 10 },
					{ label: "Infant ×1", price: 0 },
				],
			},
			{
				title: "YQ: Fuel surcharge",
				price: 30,
				subItems: [],
			},
			{
				title: "US",
				price: 0,
				subItems: [],
			},
		]);
	});

	it("returns empty rows and zero totals when fare info is missing", () => {
		expect(getTaxRowsFromFareInfo(undefined, labels)).toEqual([]);
		expect(getTaxTotalFromFareInfo(undefined)).toBe(0);
	});

	it("calculates segment totals using ptc totals when available and count fallback otherwise", () => {
		const fareInfo = {
			fareDetails: [
				{ passengerType: "ADT", ptcTotalFare: 500, fareAmtInclTax: 200 },
				{ passengerType: "CHD", fareAmtInclTax: 120 },
				{ passengerType: "INF", fareAmtInclTax: 50 },
			],
			boundSummary: {
				passengerWiseFares: [
					{ passengerType: "chd", count: 2, amount: 240 },
					{ passengerType: "inf", count: 1, amount: 50 },
				],
			},
		} as any;

		expect(getSegmentTotalFromFareInfo(fareInfo)).toBe(790);
	});

	it("reads rows and totals from the first selected fare info on a bound", () => {
		const bound = {
			selectedFareInfos: [
				{
					boundSummary: {
						totalTaxAmount: 45,
						taxBreakDown: [{ description: "Airport tax", taxAmount: 45, passengerWiseTaxes: [] }],
					},
					fareDetails: [],
				},
			],
		} as any;

		expect(getTaxRows(bound, labels)).toEqual([{ title: "Airport tax", price: 45, subItems: [] }]);
		expect(getTaxTotal(bound)).toBe(45);
	});

	it("supports child and infant aliases plus empty formatted titles", () => {
		const rows = getTaxRowsFromFareInfo(
			{
				boundSummary: {
					taxBreakDown: [
						{
							taxCode: "",
							description: "",
							taxAmount: 10,
							passengerWiseTaxes: [
								{ passengerType: "childb", count: 1, amount: 3 },
								{ passengerType: "childc", count: 1, amount: 4 },
								{ passengerType: "inf", count: 1, amount: 3 },
							],
						},
					],
				},
			} as any,
			labels
		);

		expect(rows).toEqual([
			{
				title: "",
				price: 10,
				subItems: [
					{ label: "Child B ×1", price: 3 },
					{ label: "Child C ×1", price: 4 },
				],
			},
		]);
	});
});
