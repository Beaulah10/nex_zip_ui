import { describe, expect, it, vi } from "vitest";
import {
	displayPtcAgeGroupLabels,
	displayShuttleServicePricingRows,
	displayTransportServiceApplicable,
	displayTrolleyServicePricingRows,
	displayTrolleyServices,
	getTransportServiceAvailability,
} from "./transport-service-card-display";

type TransportAvailabilityData = Parameters<typeof getTransportServiceAvailability>[0];
type ShuttlePricingData = Parameters<
	typeof displayShuttleServicePricingRows
>[0]["transportationData"];
type TrolleyPricingData = Parameters<
	typeof displayTrolleyServicePricingRows
>[0]["transportationData"];

const asTransportAvailabilityData = (value: unknown): TransportAvailabilityData =>
	value as TransportAvailabilityData;

const asShuttlePricingData = (value: unknown): ShuttlePricingData => value as ShuttlePricingData;

const asTrolleyPricingData = (value: unknown): TrolleyPricingData => value as TrolleyPricingData;

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-pricing/transport-service-pricing",
	() => ({
		getAdultAmount: vi.fn(
			(transportationData: { amounts?: Record<string, number> }, ssrCode: string) => {
				return transportationData.amounts?.[ssrCode] ?? 0;
			}
		),
	})
);

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response",
	() => ({
		getAllTransportSpecialServices: vi.fn(
			(transportationData: { allSpecialServices?: Array<{ ssrCode?: string }> }) => {
				return transportationData.allSpecialServices ?? [];
			}
		),
	})
);

const labels = (key: string) => key;
const shuttleImage = { src: "shuttle" };
const shuttleServiceImage = { src: "shuttle-service" };
const trolleyImage = { src: "trolley" };

const makeTransportationData = (
	entries: Array<{
		passengerType: string;
		ssrCode: string;
		amount?: number;
	}>
): TrolleyPricingData =>
	asTrolleyPricingData({
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

describe("transport-service-card-display utilities", () => {
	it("classifies getTransportServiceAvailability as a utility and returns all false for missing services", () => {
		const result = getTransportServiceAvailability(asTransportAvailabilityData({}));

		expect(result).toEqual({
			hasOneWay: false,
			hasRoundTrip: false,
			hasTRLA: false,
			hasTRLB: false,
			hasTRLC: false,
			hasAnySupportedTransportSsr: false,
		});
	});

	it("detects all supported service SSR codes", () => {
		const result = getTransportServiceAvailability(
			asTransportAvailabilityData({
				allSpecialServices: [
					{ ssrCode: "TXIA" },
					{ ssrCode: "TXIB" },
					{ ssrCode: "TRLA" },
					{ ssrCode: "TRLB" },
					{ ssrCode: "TRLC" },
				],
			})
		);

		expect(result).toEqual({
			hasOneWay: true,
			hasRoundTrip: true,
			hasTRLA: true,
			hasTRLB: true,
			hasTRLC: true,
			hasAnySupportedTransportSsr: true,
		});
	});

	it("builds age-group labels for older and child trolley pricing", () => {
		const result = displayPtcAgeGroupLabels({
			transportationData: makeTransportationData([
				{ passengerType: "adult", ssrCode: "TRLA", amount: 100 },
				{ passengerType: "childB", ssrCode: "TRLA", amount: 50 },
			]),
			hasTRLA: true,
			hasTRLB: false,
			hasTRLC: false,
			transportServiceLabels: labels,
		});

		expect(result).toEqual(["adult_12_years_and_older", "child_2_to_11_years_old"]);
	});

	it("returns no age-group labels when no pricing exists for enabled trolley codes", () => {
		const result = displayPtcAgeGroupLabels({
			transportationData: asTrolleyPricingData({
				data: {
					servicesPerPassengerType: [{ passengerType: "adult", categories: [{}] }],
				},
			}),
			hasTRLA: false,
			hasTRLB: true,
			hasTRLC: true,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([]);
	});

	it("builds only the older age-group label when child pricing is missing", () => {
		const result = displayPtcAgeGroupLabels({
			transportationData: makeTransportationData([
				{ passengerType: "adult", ssrCode: "TRLB", amount: 100 },
			]),
			hasTRLA: false,
			hasTRLB: true,
			hasTRLC: false,
			transportServiceLabels: labels,
		});

		expect(result).toEqual(["adult_12_years_and_older"]);
	});

	it("builds only the child age-group label when older pricing is missing", () => {
		const result = displayPtcAgeGroupLabels({
			transportationData: makeTransportationData([
				{ passengerType: "childB", ssrCode: "TRLC", amount: 80 },
			]),
			hasTRLA: false,
			hasTRLB: false,
			hasTRLC: true,
			transportServiceLabels: labels,
		});

		expect(result).toEqual(["child_2_to_11_years_old"]);
	});

	it("builds shuttle pricing rows for one-way and round-trip", () => {
		const transportationData = asShuttlePricingData({
			amounts: {
				TXIA: 1200,
				TXIB: 2200,
			},
		});

		const result = displayShuttleServicePricingRows({
			transportationData,
			hasOneWay: true,
			hasRoundTrip: true,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([
			{ label: "shuttle_one_way", prices: [1200] },
			{ label: "shuttle_round_trip", prices: [2200] },
		]);
	});

	it("returns no shuttle pricing rows when no shuttle products are enabled", () => {
		const result = displayShuttleServicePricingRows({
			transportationData: asShuttlePricingData({ amounts: { TXIA: 100 } }),
			hasOneWay: false,
			hasRoundTrip: false,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([]);
	});

	it("builds trolley pricing rows and skips rows with no prices", () => {
		const result = displayTrolleyServicePricingRows({
			transportationData: makeTransportationData([
				{ passengerType: "adult", ssrCode: "TRLA", amount: 700 },
				{ passengerType: "childC", ssrCode: "TRLA", amount: 300 },
				{ passengerType: "adult", ssrCode: "TRLC", amount: 100 },
			]),
			hasTRLA: true,
			hasTRLB: true,
			hasTRLC: true,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([
			{ label: "trolley_7_days", prices: [700, 300] },
			{ label: "trolley_1_day", prices: [100] },
		]);
	});

	it("creates trolley service rows only for enabled service ids", () => {
		const result = displayTrolleyServices({
			hasTRLA: true,
			hasTRLB: false,
			hasTRLC: true,
			transportServiceLabels: labels,
			trolleyImage: trolleyImage as never,
		});

		expect(result).toEqual([
			{ id: "trolley-7-days", label: "trolley_service_7_days", imageSrc: trolleyImage },
			{ id: "trolley-1-day", label: "trolley_service_1_day", imageSrc: trolleyImage },
		]);
	});

	it("creates the 4-day trolley service row when only TRLB is enabled", () => {
		const result = displayTrolleyServices({
			hasTRLA: false,
			hasTRLB: true,
			hasTRLC: false,
			transportServiceLabels: labels,
			trolleyImage: trolleyImage as never,
		});

		expect(result).toEqual([
			{ id: "trolley-4-days", label: "trolley_service_4_days", imageSrc: trolleyImage },
		]);
	});

	it("builds shuttle and trolley sections for NRT to HNL with both shuttle variants", () => {
		const result = displayTransportServiceApplicable({
			isNrtToHnlRoute: true,
			isHnlToNrtRoute: false,
			hasOneWay: true,
			hasRoundTrip: true,
			transportServiceLabels: labels,
			shuttleImage: shuttleImage as never,
			shuttleServiceImage: shuttleServiceImage as never,
			trolleyImage: trolleyImage as never,
			shuttlePricingRows: [{ label: "one-way", prices: [1000] }],
			trolleyPricingRows: [{ label: "7 days", prices: [700] }],
			trolleyServices: [{ id: "trolley-7-days", label: "T7", imageSrc: trolleyImage as never }],
			trolleyAgeGroupLabels: ["Adults"],
		});

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			imageSrc: shuttleImage,
			mobileImageClassName: "object-[-25px_-65px] scale-[1.2]",
			desktopImageClassName: "object-[-15px_-90px] scale-[1.45]",
			title: "lealea_airport_shuttle",
			moreInfoHref: "#",
			description: "lealea_airport_shuttle_description",
			ageGroupLabels: [],
			durationLabel: "trip_type",
			pricingRows: [{ label: "one-way", prices: [1000] }],
			footnote: "free_for_children",
			services: [
				{ id: "shuttle-one-way", label: "shuttle_service_one_way", imageSrc: shuttleServiceImage },
				{
					id: "shuttle-round-trip",
					label: "shuttle_service_round_trip",
					imageSrc: shuttleServiceImage,
				},
			],
		});
		expect(result[1]?.title).toBe("lealea_trolley");
	});

	it("builds a 4-day trolley pricing row when TRLB has valid pricing", () => {
		const result = displayTrolleyServicePricingRows({
			transportationData: makeTransportationData([
				{ passengerType: "childB", ssrCode: "TRLB", amount: 450 },
			]),
			hasTRLA: false,
			hasTRLB: true,
			hasTRLC: false,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([{ label: "trolley_4_days", prices: [450] }]);
	});

	it("builds a 1-day trolley pricing row when TRLC has valid pricing", () => {
		const result = displayTrolleyServicePricingRows({
			transportationData: makeTransportationData([
				{ passengerType: "adult", ssrCode: "TRLC", amount: 150 },
			]),
			hasTRLA: false,
			hasTRLB: false,
			hasTRLC: true,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([{ label: "trolley_1_day", prices: [150] }]);
	});

	it("skips TRLA and TRLC rows when enabled but no prices are available", () => {
		const result = displayTrolleyServicePricingRows({
			transportationData: makeTransportationData([]),
			hasTRLA: true,
			hasTRLB: false,
			hasTRLC: true,
			transportServiceLabels: labels,
		});

		expect(result).toEqual([]);
	});

	it("builds shuttle section for HNL to NRT but excludes trolley", () => {
		const result = displayTransportServiceApplicable({
			isNrtToHnlRoute: false,
			isHnlToNrtRoute: true,
			hasOneWay: true,
			hasRoundTrip: false,
			transportServiceLabels: labels,
			shuttleImage: shuttleImage as never,
			shuttleServiceImage: shuttleServiceImage as never,
			trolleyImage: trolleyImage as never,
			shuttlePricingRows: [],
			trolleyPricingRows: [{ label: "7 days", prices: [700] }],
			trolleyServices: [{ id: "trolley-7-days", label: "T7", imageSrc: trolleyImage as never }],
			trolleyAgeGroupLabels: ["Adults"],
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.title).toBe("lealea_airport_shuttle");
	});

	it("builds a shuttle section with only round-trip service when one-way is unavailable", () => {
		const result = displayTransportServiceApplicable({
			isNrtToHnlRoute: true,
			isHnlToNrtRoute: false,
			hasOneWay: false,
			hasRoundTrip: true,
			transportServiceLabels: labels,
			shuttleImage: shuttleImage as never,
			shuttleServiceImage: shuttleServiceImage as never,
			trolleyImage: trolleyImage as never,
			shuttlePricingRows: [],
			trolleyPricingRows: [],
			trolleyServices: [],
			trolleyAgeGroupLabels: [],
		});

		expect(result[0]?.mobileImageClassName).toBe("object-[-25px_-65px] scale-[1.2]");
		expect(result[0]?.desktopImageClassName).toBe("object-[0px_-290px] scale-[1.45]");
		expect(result[0]?.services).toEqual([
			{
				id: "shuttle-round-trip",
				label: "shuttle_service_round_trip",
				imageSrc: shuttleServiceImage,
			},
		]);
	});

	it("builds a trolley-only section when the route supports trolley but no shuttle is available", () => {
		const result = displayTransportServiceApplicable({
			isNrtToHnlRoute: true,
			isHnlToNrtRoute: false,
			hasOneWay: false,
			hasRoundTrip: false,
			transportServiceLabels: labels,
			shuttleImage: shuttleImage as never,
			shuttleServiceImage: shuttleServiceImage as never,
			trolleyImage: trolleyImage as never,
			shuttlePricingRows: [],
			trolleyPricingRows: [{ label: "7 days", prices: [700] }],
			trolleyServices: [{ id: "trolley-7-days", label: "T7", imageSrc: trolleyImage as never }],
			trolleyAgeGroupLabels: ["Adults"],
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.title).toBe("lealea_trolley");
	});

	it("returns no applicable transport sections when routes or services do not match", () => {
		const result = displayTransportServiceApplicable({
			isNrtToHnlRoute: false,
			isHnlToNrtRoute: false,
			hasOneWay: false,
			hasRoundTrip: false,
			transportServiceLabels: labels,
			shuttleImage: shuttleImage as never,
			shuttleServiceImage: shuttleServiceImage as never,
			trolleyImage: trolleyImage as never,
			shuttlePricingRows: [],
			trolleyPricingRows: [],
			trolleyServices: [],
			trolleyAgeGroupLabels: [],
		});

		expect(result).toEqual([]);
	});
});
