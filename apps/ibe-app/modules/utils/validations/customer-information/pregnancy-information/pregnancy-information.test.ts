/**
 * File: pregnancy-information.test.ts
 * Classification: Validation
 * Description: Tests for pregnancy information validation rules.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import type { PassengerErrorLabels } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { validatePregnancy } from "@/modules/utils/validations/customer-information/pregnancy-information/pregnancy-information";

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
		firstName: "JANE",
		gender: "female",
		dateOfBirth: {
			year: "1990",
			month: "01",
			day: "01",
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
		email: "jane@example.com",
		emailConfirmation: "jane@example.com",
		hasTravelDocs: false,
		isPregnant: false,
		pregnancyWeeks: "",
		requestingAssistance: false,
		...overrides,
	} as any;
}

describe("validatePregnancy", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("returns early when isPregnant is false and no issues are added", () => {
		validatePregnancy(
			buildPax({
				isPregnant: false,
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when isPregnant is true but pregnancyWeeks is empty", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(messages).toContain("error_pregnancy_gestational_weeks_required");
	});

	it("adds issue when pregnancyWeeks is undefined", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: undefined,
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(messages).toContain("error_pregnancy_gestational_weeks_required");
	});

	it("adds issue when pregnancyWeeks contains non numeric characters", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "abc",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(messages).toContain("error_pregnany_gestational_weeks_only_numbers");
	});

	it("adds issue when pregnancyWeeks is 0", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "0",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(
			messages.some((message) => message?.startsWith("error_pregnancy_gestational_weeks_length"))
		).toBe(true);
	});

	it("does not add issue when pregnancyWeeks is 1 minimum valid", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "1",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("does not add issue when pregnancyWeeks is 42", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "42",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when pregnancyWeeks is 99 above maximum", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "99",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(
			messages.some((message) => message?.startsWith("error_pregnancy_gestational_weeks_length"))
		).toBe(true);
	});

	it("adds issue when pregnancyWeeks is 100 above maximum", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "100",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(
			messages.some((message) => message?.startsWith("error_pregnancy_gestational_weeks_length"))
		).toBe(true);
	});

	it("adds issue when pregnancyWeeks is a decimal value", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "12.5",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(messages).toContain("error_pregnany_gestational_weeks_only_numbers");
	});

	it("adds issue when pregnancyWeeks is negative", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "-5",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(messages).toContain("error_pregnany_gestational_weeks_only_numbers");
	});

	it("adds issue when pregnancyWeeks contains special characters", () => {
		validatePregnancy(
			buildPax({
				isPregnant: true,
				pregnancyWeeks: "12!",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["pregnancyWeeks"]);
		expect(messages).toContain("error_pregnany_gestational_weeks_only_numbers");
	});
});
