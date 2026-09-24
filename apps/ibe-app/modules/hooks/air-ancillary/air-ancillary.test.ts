import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	evaluateAncillaryEligibility,
	getDefaultResponse,
} from "@/modules/hooks/air-ancillary/air-ancillary";
import type { AncillaryRuleInput } from "@/types/customize/ancillary-services/ancillary-services.types";

const mocks = vi.hoisted(() => ({
	getRemainingHours: vi.fn(),
	isKoreanFlight: vi.fn(),
	isKoreanFlightNrtDeparture: vi.fn(),
}));

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	getRemainingHours: mocks.getRemainingHours,
}));

vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isKoreanFlight: mocks.isKoreanFlight,
	isKoreanFlightNrtDeparture: mocks.isKoreanFlightNrtDeparture,
}));

const makeTFn = () => (key: string, values?: Record<string, unknown>) => {
	if (values) return `${key}:${JSON.stringify(values)}`;
	return key;
};

const makeInput = (overrides: Partial<AncillaryRuleInput> = {}): AncillaryRuleInput => ({
	pageType: "customize",
	bundleType: "NoBundle",
	source: "NRT",
	destination: "HNL",
	departureTime: "2026-01-01T00:00:00Z",
	t: makeTFn(),
	...overrides,
});

beforeEach(() => {
	mocks.getRemainingHours.mockReturnValue(100);
	mocks.isKoreanFlight.mockReturnValue(false);
	mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
});

describe("getDefaultResponse", () => {
	it("returns all cards enabled with no banner", () => {
		const response = getDefaultResponse();
		for (const card of Object.values(response.cards)) {
			expect(card.enabled).toBe(true);
			expect(card.showPopupOnClick).toBe(false);
			expect(card.redirectToTop).toBe(false);
		}
		expect(response.bannerTitle).toBeUndefined();
		expect(response.bannerDescription).toBeUndefined();
	});

	it("has all six card slots", () => {
		const { cards } = getDefaultResponse();
		expect(Object.keys(cards)).toEqual([
			"seat",
			"meal",
			"lounge",
			"transport",
			"express",
			"baggage",
		]);
	});
});

describe("evaluateAncillaryEligibility", () => {
	describe("RULE 4 — HNL<->NRT route within 96 hours", () => {
		it("disables transport for HNL->NRT when <96h remaining", () => {
			mocks.getRemainingHours.mockReturnValue(50);
			const result = evaluateAncillaryEligibility(
				makeInput({ source: "HNL", destination: "NRT", bundleType: "NoBundle" })
			);
			expect(result.cards.transport.enabled).toBe(false);
			expect(result.bannerTitle).toBe(
				'error_labels.alerts_deadline_title:{"disabledServiceName":"transportation_service_name"}'
			);
			expect(result.bannerDescription).toBe(
				'error_labels.alerts_deadline_description:{"remainingHours":96}'
			);
		});

		it("keeps transport enabled for NRT->HNL when between 24h and 96h remaining", () => {
			mocks.getRemainingHours.mockReturnValue(50);

			const result = evaluateAncillaryEligibility(
				makeInput({
					source: "NRT",
					destination: "HNL",
					bundleType: "NoBundle",
				})
			);

			expect(result.cards.transport.enabled).toBe(true);
			expect(result.bannerTitle).toBeUndefined();
		});

		it("does NOT disable transport for HNL->NRT when >=96h remaining", () => {
			mocks.getRemainingHours.mockReturnValue(100);
			const result = evaluateAncillaryEligibility(
				makeInput({ source: "HNL", destination: "NRT", bundleType: "NoBundle" })
			);
			expect(result.cards.transport.enabled).toBe(true);
		});
	});

	describe("RULE 1 — Bundle + Korean flight (Korea departure) <= 48h", () => {
		it("sets all cards to popup when <=48h remain", () => {
			mocks.isKoreanFlight.mockReturnValue(true);
			mocks.getRemainingHours.mockReturnValue(40);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "Bundle", source: "ICN", destination: "NRT" })
			);
			for (const card of Object.values(result.cards)) {
				expect(card.enabled).toBe(false);
				expect(card.showPopupOnClick).toBe(true);
			}
		});

		it("does NOT set all cards to popup when >48h remain", () => {
			mocks.isKoreanFlight.mockReturnValue(true);
			mocks.getRemainingHours.mockReturnValue(60);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "Bundle", source: "ICN", destination: "NRT" })
			);
			expect(result.cards.seat.enabled).toBe(true);
		});
	});

	describe("RULE 2 — Bundle + Korean NRT departure <24h", () => {
		it("sets all cards to popup when <24h remain", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(true);
			mocks.getRemainingHours.mockReturnValue(10);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "Bundle", source: "NRT", destination: "ICN" })
			);
			for (const card of Object.values(result.cards)) {
				expect(card.enabled).toBe(false);
				expect(card.showPopupOnClick).toBe(true);
			}
		});

		it("does NOT disable all cards when >=24h remain", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(true);
			mocks.getRemainingHours.mockReturnValue(30);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "Bundle", source: "NRT", destination: "ICN" })
			);
			expect(result.cards.seat.enabled).toBe(true);
		});
	});

	describe("RULE 3 — No bundle, 24 <= hours < 48", () => {
		it("disables meal when source is not NRT", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(30);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "SFO", destination: "NRT" })
			);
			expect(result.cards.meal.enabled).toBe(false);
			expect(result.bannerTitle).toBeDefined();
		});

		it("does NOT disable meal when source is NRT", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(30);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "NRT", destination: "BKK" })
			);
			expect(result.cards.meal.enabled).toBe(true);
		});

		it("disables lounge when source is HNL", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(30);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "HNL", destination: "NRT" })
			);
			expect(result.cards.lounge.enabled).toBe(false);
			expect(result.bannerTitle).toBeDefined();
		});

		it("does not add banner when neither meal nor lounge is disabled", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(30);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "NRT", destination: "ICN" })
			);
			expect(result.bannerTitle).toBeUndefined();
		});
	});

	describe("RULE 3 — No bundle, <24h", () => {
		it("disables seat, express and meal while keeping transport enabled for NRT->ICN", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(10);

			const result = evaluateAncillaryEligibility(
				makeInput({
					bundleType: "NoBundle",
					source: "NRT",
					destination: "ICN",
				})
			);

			expect(result.cards.seat.enabled).toBe(false);
			expect(result.cards.transport.enabled).toBe(true);
			expect(result.cards.express.enabled).toBe(false);
			expect(result.cards.meal.enabled).toBe(false);
			expect(result.cards.lounge.enabled).toBe(true);
			expect(result.cards.baggage.enabled).toBe(true);
			expect(result.bannerTitle).toBeDefined();
		});

		it("disables lounge when source is BKK", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(10);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "BKK", destination: "NRT" })
			);
			expect(result.cards.lounge.enabled).toBe(false);
		});

		it("disables lounge when source is SIN", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(10);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "SIN", destination: "NRT" })
			);
			expect(result.cards.lounge.enabled).toBe(false);
		});

		it("disables lounge when source is HNL", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(10);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "HNL", destination: "NRT" })
			);
			expect(result.cards.lounge.enabled).toBe(false);
		});

		it("keeps lounge enabled when source is NRT", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(10);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "NRT", destination: "ICN" })
			);
			expect(result.cards.lounge.enabled).toBe(true);
		});
	});

	describe("RULE 3 — No bundle, >=48h (no restrictions)", () => {
		it("all cards remain enabled when >=48h remain", () => {
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(72);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "NRT", destination: "ICN" })
			);
			for (const card of Object.values(result.cards)) {
				expect(card.enabled).toBe(true);
			}
			expect(result.bannerTitle).toBeUndefined();
		});
	});

	describe("banner description", () => {
		it("includes remaining hours in description when not all services are disabled", () => {
			// NoBundle + HNL source + <24h: baggage stays enabled, so description is non-empty
			mocks.isKoreanFlight.mockReturnValue(false);
			mocks.isKoreanFlightNrtDeparture.mockReturnValue(false);
			mocks.getRemainingHours.mockReturnValue(10);
			const result = evaluateAncillaryEligibility(
				makeInput({ bundleType: "NoBundle", source: "HNL", destination: "NRT" })
			);
			expect(result.bannerDescription).toContain("alerts_deadline_description");
			expect(result.cards.baggage.enabled).toBe(true);
		});
	});
});
