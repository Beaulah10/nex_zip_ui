/**
 * File: contact-information.test.ts
 * Classification: Validation
 * Description: Tests for contact information validation functions including phone,
 * emergency contact, and email route-specific rules.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import {
	validateEmailForUSCanadaRoute,
	validateEmergencyContact,
	validatePhoneNumber,
} from "@/modules/utils/validations/customer-information/contact-information/contact-information";
import type { PassengerErrorLabels } from "@/modules/utils/validations/customer-information/customer-information-schema";

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
		email: "john@example.com",
		emailConfirmation: "john@example.com",
		hasTravelDocs: false,
		isPregnant: false,
		requestingAssistance: false,
		...overrides,
	} as any;
}

describe("validatePhoneNumber", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("does not add issues for valid phone on non-US route", () => {
		validatePhoneNumber(buildPax(), false, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when phoneExtension is missing", () => {
		validatePhoneNumber(
			buildPax({
				phoneExtension: "",
			}),
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["phoneExtension"]);
	});

	it("adds issue when phoneNumber is empty", () => {
		validatePhoneNumber(
			buildPax({
				phoneNumber: "",
			}),
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["phoneNumber"]);
	});

	it("adds issue when phoneNumber contains non-numeric characters", () => {
		validatePhoneNumber(
			buildPax({
				phoneNumber: "123abc",
			}),
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["phoneNumber"]);
		expect(messages).toContain("error_input_half_width_number");
	});

	it("adds issue when phoneNumber exceeds max length", () => {
		validatePhoneNumber(
			buildPax({
				phoneNumber: "1234567890123456",
			}),
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["phoneNumber"]);
		expect(
			messages.some((message) => message?.startsWith("error_phone_number_min_max_length"))
		).toBe(true);
	});

	it("accepts exactly 15-digit phone number", () => {
		validatePhoneNumber(
			buildPax({
				phoneNumber: "123456789012345",
			}),
			false,
			ctx,
			mockT
		);

		const phoneNumberIssues = addIssue.mock.calls.filter(
			(call) => JSON.stringify((call[0] as IssueArg).path) === JSON.stringify(["phoneNumber"])
		);

		expect(phoneNumberIssues).toHaveLength(0);
	});

	it("validates emergency contact when US route", () => {
		validatePhoneNumber(
			buildPax({
				emergencyExtension: "",
				emergencyNumber: "",
			}),
			true,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["emergencyExtension"]);
		expect(paths).toContainEqual(["emergencyNumber"]);
	});

	it("does not validate emergency contact for non-US route", () => {
		validatePhoneNumber(
			buildPax({
				emergencyExtension: "",
				emergencyNumber: "",
			}),
			false,
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).not.toContainEqual(["emergencyExtension"]);
		expect(paths).not.toContainEqual(["emergencyNumber"]);
	});
});

describe("validateEmergencyContact", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("does not add issues for valid emergency contact", () => {
		validateEmergencyContact(buildPax(), ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when emergencyExtension is missing", () => {
		validateEmergencyContact(
			buildPax({
				emergencyExtension: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["emergencyExtension"]);
	});

	it("adds issue when emergencyNumber is empty", () => {
		validateEmergencyContact(
			buildPax({
				emergencyNumber: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		expect(paths).toContainEqual(["emergencyNumber"]);
	});

	it("adds issue when emergencyNumber contains non-numeric characters", () => {
		validateEmergencyContact(
			buildPax({
				emergencyNumber: "abc123",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["emergencyNumber"]);
		expect(messages).toContain("error_input_half_width_number");
	});

	it("adds issue when emergencyNumber exceeds max length", () => {
		validateEmergencyContact(
			buildPax({
				emergencyNumber: "1234567890123456",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["emergencyNumber"]);
		expect(
			messages.some((message) => message?.startsWith("error_phone_number_min_max_length"))
		).toBe(true);
	});

	it("adds issue when emergency number duplicates primary phone with same extension", () => {
		validateEmergencyContact(
			buildPax({
				phoneExtension: "+81",
				phoneNumber: "1234567890",
				emergencyExtension: "+81",
				emergencyNumber: "1234567890",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContainEqual(["emergencyNumber"]);
		expect(messages).toContain("error_emergency_number_same_as_phone_number");
	});

	it("allows same number with different extension", () => {
		validateEmergencyContact(
			buildPax({
				phoneExtension: "+81",
				phoneNumber: "1234567890",
				emergencyExtension: "+1",
				emergencyNumber: "1234567890",
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).not.toContain("error_emergency_number_same_as_phone_number");
	});
});

describe("validateEmailForUSCanadaRoute", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("does not add issues when email is undefined on US route", () => {
		validateEmailForUSCanadaRoute(undefined, ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("does not add issues for valid email on US route without plus or star", () => {
		validateEmailForUSCanadaRoute("user@example.com", ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when email contains plus on US route", () => {
		validateEmailForUSCanadaRoute("user+tag@example.com", ctx, mockT);

		const call = addIssue.mock.calls[0]?.[0] as IssueArg | undefined;

		expect(addIssue).toHaveBeenCalledTimes(1);
		expect(call?.path).toEqual(["email"]);
		expect(call?.message).toBe("error_email_invalid_for_us_canada");
	});

	it("adds issue when email contains star on US route", () => {
		validateEmailForUSCanadaRoute("user*@example.com", ctx, mockT);

		const call = addIssue.mock.calls[0]?.[0] as IssueArg | undefined;

		expect(addIssue).toHaveBeenCalledTimes(1);
		expect(call?.path).toEqual(["email"]);
		expect(call?.message).toBe("error_email_invalid_for_us_canada");
	});

	it("adds issue when email contains plus on Canada route", () => {
		validateEmailForUSCanadaRoute("user+tag@example.com", ctx, mockT);

		const call = addIssue.mock.calls[0]?.[0] as IssueArg | undefined;

		expect(addIssue).toHaveBeenCalledTimes(1);
		expect(call?.path).toEqual(["email"]);
		expect(call?.message).toBe("error_email_invalid_for_us_canada");
	});

	it("adds issue when email contains star on Canada route", () => {
		validateEmailForUSCanadaRoute("user*@example.com", ctx, mockT);

		const call = addIssue.mock.calls[0]?.[0] as IssueArg | undefined;

		expect(addIssue).toHaveBeenCalledTimes(1);
		expect(call?.path).toEqual(["email"]);
		expect(call?.message).toBe("error_email_invalid_for_us_canada");
	});
});
