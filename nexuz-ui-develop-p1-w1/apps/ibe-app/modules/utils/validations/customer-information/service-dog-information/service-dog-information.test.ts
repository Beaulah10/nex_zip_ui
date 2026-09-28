/**
 * File: service-dog-information.test.ts
 * Classification: Validation
 * Description: Tests for service dog information validation validateServiceDog.
 * Covers guard, type, breed, weight, cage presence, dimensions, and size limit.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import type { PassengerErrorLabels } from "@/modules/utils/validations/customer-information/customer-information-schema";
import {
	CAGE_MAX_TOTAL_CM,
	SIZE_ERROR_MSG,
	validateServiceDog,
} from "@/modules/utils/validations/customer-information/service-dog-information/service-dog-information";

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

function buildPax(overrides: Record<string, unknown> = {}): any {
	return {
		accompaniedByServiceDog: true,
		serviceDogType: "guide-dog",
		serviceDogBreed: "LABRADOR",
		serviceDogWeight: "25",
		serviceDogCagePresence: "without-cage",
		serviceDogCageHeight: "",
		serviceDogCageWidth: "",
		serviceDogCageDepth: "",
		serviceDogCageWeight: "",
		...overrides,
	};
}

describe("validateServiceDog - guard", () => {
	it("returns early when accompaniedByServiceDog is false", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				accompaniedByServiceDog: false,
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateServiceDog - serviceDogType", () => {
	it("adds issue when serviceDogType is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogType: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogType");
	});

	it("does not add type issue when serviceDogType is set", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(buildPax(), ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("serviceDogType");
	});
});

describe("validateServiceDog - serviceDogBreed", () => {
	it("adds issue when breed is empty", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogBreed: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogBreed");
	});

	it("adds issue when breed is only whitespace", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogBreed: "   ",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogBreed");
	});

	it("adds issue when breed contains lowercase letters", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogBreed: "labrador",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogBreed");
	});

	it("adds issue when breed exceeds max length", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogBreed: "A".repeat(65),
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("serviceDogBreed");
		expect(messages).toContain('error_service_dog_breed_length:{"max":64}');
	});

	it("does not add breed issue for a valid uppercase breed name", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(buildPax(), ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("serviceDogBreed");
	});
});

describe("validateServiceDog - serviceDogWeight", () => {
	it("adds issue when weight is empty", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogWeight: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogWeight");
	});

	it("adds issue when weight contains non-numeric characters", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogWeight: "25kg",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogWeight");
	});

	it("adds issue when weight is below minimum", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogWeight: "0",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogWeight");
	});

	it("adds issue when weight exceeds maximum", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogWeight: "1000",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogWeight");
	});

	it("does not add weight issue for valid weight", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(buildPax(), ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("serviceDogWeight");
	});
});

describe("validateServiceDog - serviceDogCagePresence", () => {
	it("adds issue when cagePresence is not selected", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCagePresence");
	});

	it("does not trigger cage dimension validation when without-cage", () => {
		const { ctx, addIssue } = createMockCtx();

		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "without-cage",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("serviceDogCageHeight");
		expect(paths).not.toContain("serviceDogCageWidth");
		expect(paths).not.toContain("serviceDogCageDepth");
		expect(paths).not.toContain("serviceDogCageWeight");
	});
});

describe("validateServiceDog - cage dimensions with-cage", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("adds dimension issues when all dimensions are empty and cage is present", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "",
				serviceDogCageWidth: "",
				serviceDogCageDepth: "",
				serviceDogCageWeight: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);
		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("serviceDogCageHeight");
		expect(paths).toContain("serviceDogCageWidth");
		expect(paths).toContain("serviceDogCageDepth");
		expect(paths).toContain("serviceDogCageWeight");
		expect(messages).toContain("error_service_dog_cage_depth_required");
	});

	it("adds numbers-only issue when cage depth contains non-numeric characters", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "10",
				serviceDogCageWidth: "10",
				serviceDogCageDepth: "10cm",
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).toContain("error_service_dog_cage_depth_numbers_only");
	});

	it("adds minimum issues when cage dimensions are 0", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "0",
				serviceDogCageWidth: "0",
				serviceDogCageDepth: "0",
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).toContain('error_service_dog_cage_height_min:{"min":1}');
		expect(messages).toContain('error_service_dog_cage_width_min:{"min":1}');
		expect(messages).toContain('error_service_dog_cage_depth_min:{"min":1}');
	});

	it("adds size issue on all dimension fields when sum exceeds CAGE_MAX_TOTAL_CM", () => {
		const bigVal = String(Math.ceil(CAGE_MAX_TOTAL_CM / 3) + 1);

		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: bigVal,
				serviceDogCageWidth: bigVal,
				serviceDogCageDepth: bigVal,
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("serviceDogCageHeight");
		expect(paths).toContain("serviceDogCageWidth");
		expect(paths).toContain("serviceDogCageDepth");
		expect(messages).toContain(
			`error_service_dog_cage_dimensions_sum_exceeded:{"max":${CAGE_MAX_TOTAL_CM}}`
		);
	});

	it("does not add size issue when dimensions are within limits", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "50",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "50",
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).not.toContain(
			`error_service_dog_cage_dimensions_sum_exceeded:{"max":${CAGE_MAX_TOTAL_CM}}`
		);
	});

	it("adds non-numeric issue when cage height contains letters", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "abc",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "50",
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCageHeight");
	});

	it("adds non-numeric issue when cage width contains letters", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "50",
				serviceDogCageWidth: "abc",
				serviceDogCageDepth: "50",
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCageWidth");
	});

	it("adds non-numeric issue when cage depth contains letters", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "50",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "abc",
				serviceDogCageWeight: "10",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCageDepth");
	});

	it("adds non-numeric issue when cage weight contains letters", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "50",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "50",
				serviceDogCageWeight: "abc",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCageWeight");
	});

	it("adds range issue when cage weight is less than 1", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "50",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "50",
				serviceDogCageWeight: "0",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCageWeight");
	});

	it("adds range issue when cage weight is greater than 32", () => {
		validateServiceDog(
			buildPax({
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "50",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "50",
				serviceDogCageWeight: "33",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("serviceDogCageWeight");
	});
});

describe("service-dog constants", () => {
	it("CAGE_MAX_TOTAL_CM is 203", () => {
		expect(CAGE_MAX_TOTAL_CM).toBe(203);
	});

	it("SIZE_ERROR_MSG contains the max total", () => {
		expect(SIZE_ERROR_MSG).toContain("203");
	});
});
