/**
 * File: personal-information.test.ts
 * Classification: Validation
 * Description: Tests for passenger personal information validation including
 * date of birth eligibility and infant weight/height requirements.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import type { PassengerErrorLabels } from "@/modules/utils/validations/customer-information/customer-information-schema";
import {
	validatePassengerDateOfBirth,
	validateWeightAndHeight,
} from "@/modules/utils/validations/customer-information/personal-information/personal-information";

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

function buildPax(overrides: Record<string, unknown> = {}) {
	return {
		lastName: "SMITH",
		firstName: "JOHN",
		gender: "male",
		dateOfBirth: {
			year: "2000",
			month: "06",
			day: "15",
		},
		nationality: "JPN",
		countryOfResidence: "JPN",
		passportNumber: "AB123456",
		passportExpiryDate: {
			year: "2030",
			month: "01",
			day: "01",
		},
		phoneExtension: "+81",
		phoneNumber: "1234567890",
		emergencyExtension: "+1",
		emergencyNumber: "0987654321",
		email: "john@example.com",
		emailConfirmation: "john@example.com",
		hasTravelDocs: false,
		isPregnant: false,
		requestingAssistance: false,
		bodyWeight: "",
		bodyHeight: "",
		...overrides,
	} as any;
}

const DEPARTURE = new Date("2026-09-02");

describe("validatePassengerDateOfBirth", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("returns early when dateOfBirth year is empty", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "",
				month: "06",
				day: "15",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("returns early when dateOfBirth month is empty", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2000",
				month: "",
				day: "15",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("returns early when dateOfBirth day is empty", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2000",
				month: "06",
				day: "",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("returns early when all dateOfBirth parts are empty", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "",
				month: "",
				day: "",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("does not add issue for valid adult DOB", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2000",
				month: "06",
				day: "15",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when DOB does not match adult passenger type", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2016",
				month: "01",
				day: "01",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["dateOfBirth"]);
		expect(messages).toContain("error_date_of_birth_incorrect");
	});

	it("adds issue when infant is a newborn under age limit", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2026",
				month: "06",
				day: "01",
			},
		});

		validatePassengerDateOfBirth(pax, "infant", DEPARTURE, ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["dateOfBirth"]);
		expect(messages).toContain("error_date_of_birth_under_1_year");
	});

	it("does not add newborn issue for infant who is 1 year old", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2025",
				month: "09",
				day: "02",
			},
		});

		validatePassengerDateOfBirth(pax, "infant", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue for future date of birth", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2027",
				month: "01",
				day: "01",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", DEPARTURE, ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["dateOfBirth"]);
		expect(messages).toContain("error_date_of_birth_incorrect");
	});

	it("validates correctly for childA type", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2013",
				month: "01",
				day: "01",
			},
		});

		validatePassengerDateOfBirth(pax, "childA", DEPARTURE, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when childA DOB corresponds to adult age", () => {
		const pax = buildPax({
			dateOfBirth: {
				year: "2006",
				month: "01",
				day: "01",
			},
		});

		validatePassengerDateOfBirth(pax, "childA", DEPARTURE, ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["dateOfBirth"]);
		expect(messages).toContain("error_date_of_birth_incorrect");
	});

	it("does not add issue when departure date is undefined and DOB is valid for adult", () => {
		const now = new Date();
		const year = String(now.getFullYear() - 20);

		const pax = buildPax({
			dateOfBirth: {
				year,
				month: "01",
				day: "01",
			},
		});

		validatePassengerDateOfBirth(pax, "adult", undefined, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateWeightAndHeight", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("returns early for adult passenger type", () => {
		validateWeightAndHeight(
			buildPax({
				bodyWeight: "",
				bodyHeight: "",
			}),
			"adult",
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("returns early for childC passenger type", () => {
		validateWeightAndHeight(
			buildPax({
				bodyWeight: "",
				bodyHeight: "",
			}),
			"childC",
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("does not add issue for infant with both weight and height", () => {
		validateWeightAndHeight(
			buildPax({
				bodyWeight: "8kg",
				bodyHeight: "70cm",
			}),
			"infant",
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds bodyWeight issue when weight is missing for infant", () => {
		validateWeightAndHeight(
			buildPax({
				bodyWeight: "",
				bodyHeight: "70cm",
			}),
			"infant",
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["bodyWeight"]);
		expect(messages).toContain("error_body_weight_required");
	});

	it("adds bodyHeight issue when height is missing for infant", () => {
		validateWeightAndHeight(
			buildPax({
				bodyWeight: "8kg",
				bodyHeight: "",
			}),
			"infant",
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["bodyHeight"]);
		expect(messages).toContain("error_body_height_required");
	});

	it("adds both bodyWeight and bodyHeight issues when both are missing for infant", () => {
		validateWeightAndHeight(
			buildPax({
				bodyWeight: "",
				bodyHeight: "",
			}),
			"infant",
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["bodyWeight"]);
		expect(paths).toContainEqual(["bodyHeight"]);
		expect(messages).toContain("error_body_weight_required");
		expect(messages).toContain("error_body_height_required");
		expect(addIssue).toHaveBeenCalledTimes(2);
	});
});
