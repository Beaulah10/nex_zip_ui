/**
 * File: validate-number-range-field.test.ts
 * Classification: Validation
 * Description: Tests for the reusable numeric range field validation utility.
 * Covers required, non-numeric, out-of-range, and valid value paths.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import type { PassengerErrorLabels } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { validateNumberRangeField } from "@/modules/utils/validations/customer-information/validate-number-range-field/validate-number-range-field";

type IssueArg = { code: string; path?: (string | number)[]; message?: string };

function createMockCtx() {
	const addIssue: Mock = vi.fn();
	const ctx = { addIssue, path: [] } as unknown as z.RefinementCtx;
	return { ctx, addIssue };
}

function getIssue(addIssue: Mock): IssueArg {
	const firstCall = addIssue.mock.calls[0];

	if (!firstCall) {
		throw new Error("Expected addIssue to be called");
	}

	return firstCall[0] as IssueArg;
}

const mockT = vi.fn((key: string, values?: Record<string, string | number>) => {
	switch (key) {
		case "error_wheel_chair_dimension_required":
			return `${values?.label} required`;

		case "error_wheel_chair_dimension_only_numbers":
			return `${values?.label} numbers only`;

		case "error_wheel_chair_dimension_min_max":
			return `${values?.label} must be between ${values?.min} and ${values?.max}`;

		default:
			return key;
	}
}) as unknown as PassengerErrorLabels;

describe("validateNumberRangeField - missing value", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("adds required issue when value is undefined", () => {
		validateNumberRangeField(undefined, "wheelchairHeight", "height", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);

		const issue = getIssue(addIssue);

		expect(issue.message).toMatch(/height/i);
		expect(issue.path).toEqual(["wheelchairHeight"]);
	});

	it("adds required issue when value is empty string", () => {
		validateNumberRangeField("", "wheelchairWidth", "width", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);

		const issue = getIssue(addIssue);

		expect(issue.path).toEqual(["wheelchairWidth"]);
	});

	it("returns early (no further issues) after required issue", () => {
		validateNumberRangeField(undefined, "field", "field", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);
	});
});

describe("validateNumberRangeField - non-numeric value", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("adds non-numeric issue when value contains letters", () => {
		validateNumberRangeField("abc", "wheelchairDepth", "depth", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);

		const issue = getIssue(addIssue);

		expect(issue.message).toMatch(/numbers/i);
		expect(issue.path).toEqual(["wheelchairDepth"]);
	});

	it("adds non-numeric issue when value contains special characters", () => {
		validateNumberRangeField("12.5", "field", "label", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);
	});

	it("returns early after non-numeric issue", () => {
		validateNumberRangeField("xyz", "field", "label", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);
	});
});

describe("validateNumberRangeField - out of range", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("adds range issue when value is 0 (below minimum of 1)", () => {
		validateNumberRangeField("0", "wheelchairWeight", "weight", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);

		const issue = getIssue(addIssue);

		expect(issue.message).toMatch(/1 and 999/i);
	});

	it("adds range issue when value is 1000 (above maximum of 999)", () => {
		validateNumberRangeField("1000", "wheelchairWeight", "weight", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);
	});

	it("adds range issue for negative number", () => {
		validateNumberRangeField("-5", "field", "label", ctx, mockT);

		expect(addIssue).toHaveBeenCalledTimes(1);
	});
});

describe("validateNumberRangeField - valid values", () => {
	let addIssue: Mock;
	let ctx: z.RefinementCtx;

	beforeEach(() => {
		({ ctx, addIssue } = createMockCtx());
	});

	it("does not add any issue for value of 1 (minimum boundary)", () => {
		validateNumberRangeField("1", "field", "label", ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("does not add any issue for value of 999 (maximum boundary)", () => {
		validateNumberRangeField("999", "field", "label", ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("does not add any issue for a typical mid-range value", () => {
		validateNumberRangeField("50", "wheelchairHeight", "height", ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("capitalises the label in the non-numeric message", () => {
		validateNumberRangeField("abc", "field", "weight", ctx, mockT);

		const issue = getIssue(addIssue);

		expect(issue.message).toMatch(/^Weight/);
	});
});
