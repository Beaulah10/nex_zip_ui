/**
 * File: destination-address-information.test.ts
 * Classification: Validation
 * Description: Tests for destination address and accommodation validation.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import type { PassengerErrorLabels } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { validateAddressFields } from "@/modules/utils/validations/customer-information/destination-address-information/destination-address-information";

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
		dateOfBirth: { year: "2000", month: "01", day: "01" },
		nationality: "JPN",
		countryOfResidence: "USA",
		passportNumber: "AB123456",
		passportExpiryDate: { year: "2030", month: "01", day: "01" },
		phoneExtension: "+81",
		phoneNumber: "1234567890",
		emergencyExtension: "+1",
		emergencyNumber: "0987654321",
		email: "john@example.com",
		emailConfirmation: "john@example.com",
		hotelName: "ZIPAIR HOTEL",
		countryOfStay: "USA",
		postalCode: "96615",
		city: "HONOLULU",
		state: "HAWAII",
		hasTravelDocs: false,
		isPregnant: false,
		requestingAssistance: false,
		...overrides,
	} as any;
}

describe("validateAddressFields - requiresAccommodation false", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("returns without adding issues", () => {
		validateAddressFields(buildPax(), false, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateAddressFields - requiresAccommodation true", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("does not add issues for valid accommodation data", () => {
		validateAddressFields(buildPax(), true, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds hotelName issue for invalid characters", () => {
		validateAddressFields(
			buildPax({
				hotelName: "HOTEL@TOKYO",
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["hotelName"]);
		expect(messages).toContain("error_input_half_width_alpha_numeric_with_space");
	});

	it("adds hotelName issue when hotel name exceeds max length", () => {
		validateAddressFields(
			buildPax({
				hotelName: "A".repeat(65),
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["hotelName"]);
		expect(messages.some((message) => message?.startsWith("error_address_input_max_length"))).toBe(
			true
		);
	});

	it("does not add hotelName issue when hotelName is undefined", () => {
		validateAddressFields(
			buildPax({
				hotelName: undefined,
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).not.toContainEqual(["hotelName"]);
	});

	it("adds postalCode issue for non numeric value", () => {
		validateAddressFields(
			buildPax({
				postalCode: "ABC12",
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["postalCode"]);
		expect(messages).toContain("error_address_input_half_width_number");
	});

	it("adds postalCode issue when less than minimum length", () => {
		validateAddressFields(
			buildPax({
				postalCode: "1",
			}),
			true,
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages.some((message) => message?.startsWith("error_postal_code_length"))).toBe(true);
	});

	it("adds postalCode issue when exceeds maximum length", () => {
		validateAddressFields(
			buildPax({
				postalCode: "12345678901",
			}),
			true,
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages.some((message) => message?.startsWith("error_postal_code_length"))).toBe(true);
	});

	it("does not add postalCode issue for valid value", () => {
		validateAddressFields(
			buildPax({
				postalCode: "96615",
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).not.toContainEqual(["postalCode"]);
	});

	it("adds city issue for invalid characters", () => {
		validateAddressFields(
			buildPax({
				city: "HONO#LULU",
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["city"]);
	});

	it("adds city issue when city exceeds max length", () => {
		validateAddressFields(
			buildPax({
				city: "A".repeat(51),
			}),
			true,
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages.some((message) => message?.startsWith("error_city_length"))).toBe(true);
	});

	it("adds state issue for invalid characters", () => {
		validateAddressFields(
			buildPax({
				state: "HAW@II",
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["state"]);
	});

	it("adds state issue when state exceeds max length", () => {
		validateAddressFields(
			buildPax({
				state: "A".repeat(33),
			}),
			true,
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages.some((message) => message?.startsWith("error_state_length"))).toBe(true);
	});

	it("does not add city state postalCode issues when undefined", () => {
		validateAddressFields(
			buildPax({
				city: undefined,
				state: undefined,
				postalCode: undefined,
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).not.toContainEqual(["city"]);
		expect(paths).not.toContainEqual(["state"]);
		expect(paths).not.toContainEqual(["postalCode"]);
	});
});
