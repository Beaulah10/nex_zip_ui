// File: travel-information.test.ts
// Classification: Validation
// Description: Tests for travel document and US route field validation utilities.
// Covers hasTravelDocs guard, document type, document number, expiry,
// issuing country, purpose of travel, EVUS requirement, and US route fields.

import { describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import type {
	basePassengerSchema,
	PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";
import {
	validateTravelDocuments,
	validateUSRouteFields,
} from "@/modules/utils/validations/customer-information/travel-information/travel-information";

type Passenger = z.infer<ReturnType<typeof basePassengerSchema>>;
type IssueArg = {
	code: string;
	path?: (string | number)[];
	message?: string;
};

const mockT = vi.fn((key: string, values?: Record<string, string | number>) => {
	if (values) {
		return `${key}:${JSON.stringify(values)}`;
	}

	return key;
}) as unknown as PassengerErrorLabels;

function createMockCtx() {
	const addIssue: Mock = vi.fn();
	const ctx = { addIssue, path: [] } as unknown as z.RefinementCtx;

	return { ctx, addIssue };
}

function buildBasePax(overrides: Partial<Passenger> = {}): Passenger {
	return {
		hasTravelDocs: true,
		documentType: "visa",
		documentNumber: "AB123456",
		documentExpiryDate: {
			year: "2030",
			month: "12",
			day: "31",
		},
		issuingCountry: "JPN",
		purposeOfTravel: "b1-b2-tourism",
		nationality: "USA",
		evusObtained: true,
		countryOfResidence: "USA",
		redressNumber: "",
		knownTravelerNumber: "",
		...overrides,
	} as Passenger;
}

describe("validateTravelDocuments - guard hasTravelDocs false", () => {
	it("returns early when hasTravelDocs is false", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				hasTravelDocs: false,
			}),
			ctx,
			false,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateTravelDocuments - documentType", () => {
	it("adds issue when documentType is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentType: undefined,
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("documentType");
	});
});

describe("validateTravelDocuments - documentNumber", () => {
	it("adds issue when documentNumber is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentNumber: "",
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("documentNumber");
	});

	it("adds issue when documentNumber contains non alphanumeric chars", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentNumber: "AB-123",
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("documentNumber");
	});

	it("adds issue when documentNumber is below min length", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentNumber: "A",
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("documentNumber");
		expect(
			messages.some((message) => message?.startsWith("error_document_number_min_max_length"))
		).toBe(true);
	});

	it("adds issue when documentNumber exceeds max length", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentNumber: "A".repeat(21),
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("documentNumber");
		expect(
			messages.some((message) => message?.startsWith("error_document_number_min_max_length"))
		).toBe(true);
	});
});

describe("validateTravelDocuments - documentExpiryDate", () => {
	it("adds issue when documentExpiryDate is missing any part", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentExpiryDate: {
					year: "",
					month: "01",
					day: "01",
				},
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("documentExpiryDate");
	});

	it("adds issue when expiry date is on or before firstArrivalDate", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentExpiryDate: {
					year: "2026",
					month: "09",
					day: "10",
				},
			}),
			ctx,
			false,
			mockT,
			"2026-09-16"
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("documentExpiryDate");
	});

	it("does not add expiry issue when expiry is after firstArrivalDate", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentExpiryDate: {
					year: "2030",
					month: "12",
					day: "31",
				},
			}),
			ctx,
			false,
			mockT,
			"2026-09-16"
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("documentExpiryDate");
	});

	it("skips date comparison when firstArrivalDate is undefined", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				documentExpiryDate: {
					year: "2020",
					month: "01",
					day: "01",
				},
			}),
			ctx,
			false,
			mockT,
			undefined
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("documentExpiryDate");
	});
});

describe("validateTravelDocuments - issuingCountry", () => {
	it("adds issue when issuingCountry is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				issuingCountry: "",
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("issuingCountry");
	});
});

describe("validateTravelDocuments - purposeOfTravel US visa", () => {
	it("adds issue when purposeOfTravel missing on US route with visa", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				purposeOfTravel: undefined,
				evusObtained: false,
			}),
			ctx,
			true,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("purposeOfTravel");
	});

	it("does not add purposeOfTravel issue on non US route", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				purposeOfTravel: undefined,
			}),
			ctx,
			false,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("purposeOfTravel");
	});
});

describe("validateTravelDocuments - EVUS requirement CHN US B1B2", () => {
	it("adds evusObtained issue when Chinese national on US route with B1B2 visa has not confirmed EVUS", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				nationality: "CHN",
				documentType: "visa",
				purposeOfTravel: "b1-b2-tourism",
				evusObtained: false,
			}),
			ctx,
			true,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("evusObtained");
	});

	it("does not add evusObtained issue when evusObtained is true", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				nationality: "CHN",
				evusObtained: true,
			}),
			ctx,
			true,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("evusObtained");
	});

	it("does not add evusObtained issue for non Chinese national", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				nationality: "USA",
				evusObtained: false,
			}),
			ctx,
			true,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("evusObtained");
	});
});

describe("validateTravelDocuments - valid document", () => {
	it("produces no issues for a complete valid non US document", () => {
		const { ctx, addIssue } = createMockCtx();

		validateTravelDocuments(
			buildBasePax({
				nationality: "JPN",
				documentType: "visa",
				purposeOfTravel: undefined,
			}),
			ctx,
			false,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateUSRouteFields - non US route guard", () => {
	it("returns early when isUsRoute is false", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				countryOfResidence: "",
			}),
			false,
			false,
			false,
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateUSRouteFields - countryOfResidence", () => {
	it("adds issue when countryOfResidence is empty on US route", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				countryOfResidence: "",
			}),
			true,
			false,
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("countryOfResidence");
	});

	it("does not add issue when countryOfResidence is filled", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				countryOfResidence: "USA",
			}),
			true,
			false,
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("countryOfResidence");
	});
});

describe("validateUSRouteFields - redressNumber", () => {
	it("adds issue when redressNumber contains non alphanumeric characters", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				redressNumber: "A B-CD",
			}),
			true,
			true,
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("redressNumber");
	});

	it("adds issue when redressNumber exceeds max length", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				redressNumber: "A".repeat(26),
			}),
			true,
			true,
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("redressNumber");
		expect(messages.some((message) => message?.startsWith("error_redress_number_length"))).toBe(
			true
		);
	});

	it("does not add issue when redressNumber is empty optional", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				redressNumber: "",
			}),
			true,
			true,
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("redressNumber");
	});

	it("does not add issue when redressNumber is valid alphanumeric", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				redressNumber: "ABC123",
			}),
			true,
			true,
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("redressNumber");
	});
});

describe("validateUSRouteFields - knownTravelerNumber", () => {
	it("adds issue when knownTravelerNumber contains non alphanumeric characters", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				knownTravelerNumber: "AB-123",
			}),
			true,
			false,
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("knownTravelerNumber");
	});

	it("adds issue when knownTravelerNumber is not exactly 9 digits", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				knownTravelerNumber: "12345678",
			}),
			true,
			false,
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("knownTravelerNumber");
		expect(
			messages.some((message) => message?.startsWith("error_known_traveler_number_length"))
		).toBe(true);
	});

	it("does not add issue when knownTravelerNumber is exactly 9 alphanumeric chars", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				knownTravelerNumber: "123456789",
			}),
			true,
			false,
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("knownTravelerNumber");
	});

	it("does not add issue when knownTravelerNumber is empty optional", () => {
		const { ctx, addIssue } = createMockCtx();

		validateUSRouteFields(
			buildBasePax({
				knownTravelerNumber: "",
			}),
			true,
			false,
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("knownTravelerNumber");
	});
});
