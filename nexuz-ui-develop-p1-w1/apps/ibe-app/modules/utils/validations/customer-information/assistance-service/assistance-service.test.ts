/**
 * File: assistance-service.test.ts
 * Classification: Validation
 * Description: Tests for assistance service validation functions.
 * Covers validateAssistanceRequirements, validateWheelchairDetails,
 * and validateWheelchairDimensions validation branches.
 */

import { describe, expect, it, type Mock, vi } from "vitest";
import type { z } from "zod";
import {
	validateAssistanceRequirements,
	validateWheelchairDetails,
	validateWheelchairDimensions,
} from "@/modules/utils/validations/customer-information/assistance-service/assistance-service";
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

function buildPax(overrides: Record<string, unknown> = {}): any {
	return {
		requestingAssistance: true,
		canManagePersonalNeeds: "yes",
		boardingWithAccompanion: "yes",
		accompanyingPersonName: "JOHN SMITH",
		assistanceReasons: ["visual"],
		canWalk: "yes",
		canGoUpDownStairs: "yes",
		needsOnboardWheelchair: "",
		reasonForWheelchair: "injury",
		bringingOwnWheelchair: "no",
		wheelchairType: "",
		wheelchairBatteryType: "",
		wheelchairBatteryRemovable: "",
		isFoldable: "",
		wheelchairHeight: "50",
		wheelchairWidth: "50",
		wheelchairDepth: "50",
		wheelchairWeight: "20",
		...overrides,
	};
}

describe("validateAssistanceRequirements - guard", () => {
	it("returns early when requestingAssistance is false", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				requestingAssistance: false,
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateAssistanceRequirements - canManagePersonalNeeds", () => {
	it("adds issue and returns early when canManagePersonalNeeds is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				canManagePersonalNeeds: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("canManagePersonalNeeds");
		expect(addIssue).toHaveBeenCalledTimes(1);
	});
});

describe("validateAssistanceRequirements - boardingWithAccompanion", () => {
	it("adds issue and returns early when boardingWithAccompanion is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("boardingWithAccompanion");
		expect(addIssue).toHaveBeenCalledTimes(1);
	});

	it("adds hard block issue and returns early when both canManage and boarding are no", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				canManagePersonalNeeds: "no",
				boardingWithAccompanion: "no",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("boardingWithAccompanion");
		expect(messages).toContain("error_boarding_with_accompanion_block_proceed");
		expect(addIssue).toHaveBeenCalledTimes(1);
	});
});

describe("validateAssistanceRequirements - accompanyingPersonName", () => {
	it("adds issue when boardingWithAccompanion is yes but name is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "yes",
				accompanyingPersonName: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("accompanyingPersonName");
	});

	it("adds issue when accompanyingPersonName contains lowercase characters", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "yes",
				accompanyingPersonName: "john smith",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("accompanyingPersonName");
	});

	it("adds issue when accompanyingPersonName exceeds max length", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "yes",
				accompanyingPersonName: "A".repeat(65),
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("accompanyingPersonName");
		expect(
			messages.some((message) => message?.startsWith("error_accompanying_person_name_length"))
		).toBe(true);
	});

	it("does not add name issue for valid uppercase name", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(buildPax(), ctx, mockT);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).not.toContain("accompanyingPersonName");
	});
});

describe("validateAssistanceRequirements - assistanceReasons", () => {
	it("adds issue when assistanceReasons array is empty", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				assistanceReasons: [],
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("assistanceReasons");
	});

	it("adds block issue when assistanceReasons contains illness", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "no",
				canManagePersonalNeeds: "yes",
				assistanceReasons: ["illness"],
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(paths).toContain("assistanceReasons");
		expect(messages).toContain("error_assistance_reason_block_proceed");
	});

	it("adds block issue when assistanceReasons contains medical-devices", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "no",
				canManagePersonalNeeds: "yes",
				assistanceReasons: ["medical-devices"],
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).toContain("error_assistance_reason_block_proceed");
	});

	it("adds block issue when assistanceReasons contains intellectual", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				boardingWithAccompanion: "no",
				canManagePersonalNeeds: "yes",
				assistanceReasons: ["intellectual"],
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).toContain("error_assistance_reason_block_proceed");
	});

	it("does not add block issue for non restricted reason", () => {
		const { ctx, addIssue } = createMockCtx();

		validateAssistanceRequirements(
			buildPax({
				assistanceReasons: ["visual"],
			}),
			ctx,
			mockT
		);

		const messages = addIssue.mock.calls.map((call) => (call[0] as IssueArg).message);

		expect(messages).not.toContain("error_assistance_reason_block_proceed");
	});
});

describe("validateWheelchairDetails - guard", () => {
	it("returns early when requestingAssistance is false", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				requestingAssistance: false,
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("returns early when wheelchair is not in assistanceReasons", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["visual"],
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateWheelchairDetails - walking questions", () => {
	it("adds issue and returns early when canWalk is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("canWalk");
		expect(addIssue).toHaveBeenCalledTimes(1);
	});

	it("adds issue when canWalk is yes but canGoUpDownStairs is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("canGoUpDownStairs");
	});

	it("adds issue when canWalk is no but needsOnboardWheelchair is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "no",
				needsOnboardWheelchair: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("needsOnboardWheelchair");
	});

	it("adds reasonForWheelchair issue when canWalk is no and needsOnboardWheelchair is set", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "no",
				needsOnboardWheelchair: "yes",
				reasonForWheelchair: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("reasonForWheelchair");
	});

	it("does not add issues for valid wheelchair data when canWalk is no", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "no",
				needsOnboardWheelchair: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "manual",
				isFoldable: "yes",
				wheelchairHeight: "50",
				wheelchairWidth: "50",
				wheelchairDepth: "50",
				wheelchairWeight: "20",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds bringingOwnWheelchair issue when canWalk is no and needsOnboardWheelchair is set", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "no",
				needsOnboardWheelchair: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("bringingOwnWheelchair");
	});

	it("returns early after bringingOwnWheelchair is no when canWalk is no", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "no",
				needsOnboardWheelchair: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "no",
				wheelchairType: "",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateWheelchairDetails - required wheelchair flow", () => {
	it("adds issue when reasonForWheelchair is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("reasonForWheelchair");
	});

	it("adds issue when bringingOwnWheelchair is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("bringingOwnWheelchair");
	});

	it("returns after bringingOwnWheelchair is no", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "no",
				wheelchairType: "",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});

	it("adds issue when bringingOwnWheelchair is yes but wheelchairType is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("wheelchairType");
	});
});

describe("validateWheelchairDetails - manual wheelchair", () => {
	it("adds issue when manual wheelchair isFoldable is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "manual",
				isFoldable: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("isFoldable");
	});

	it("does not add issue for valid manual wheelchair dimensions", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "manual",
				isFoldable: "yes",
				wheelchairHeight: "50",
				wheelchairWidth: "50",
				wheelchairDepth: "50",
				wheelchairWeight: "20",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateWheelchairDetails - electric wheelchair", () => {
	it("adds issue when electric wheelchair battery removable is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("wheelchairBatteryRemovable");
	});

	it("adds issue when electric wheelchair battery type is missing", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
				wheelchairBatteryType: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("wheelchairBatteryType");
	});

	it("does not add issue for valid electric wheelchair dimensions", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDetails(
			buildPax({
				assistanceReasons: ["wheelchair"],
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "injury",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
				wheelchairBatteryType: "dry-cell",
				wheelchairHeight: "50",
				wheelchairWidth: "50",
				wheelchairDepth: "50",
				wheelchairWeight: "20",
			}),
			ctx,
			mockT
		);

		expect(addIssue).not.toHaveBeenCalled();
	});
});

describe("validateWheelchairDimensions", () => {
	it("delegates to validateNumberRangeField for all missing dimension fields", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDimensions(
			buildPax({
				wheelchairHeight: "",
				wheelchairWidth: "",
				wheelchairDepth: "",
				wheelchairWeight: "",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("wheelchairHeight");
		expect(paths).toContain("wheelchairWidth");
		expect(paths).toContain("wheelchairDepth");
		expect(paths).toContain("wheelchairWeight");
	});

	it("adds issue when wheelchair height is non numeric", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDimensions(
			buildPax({
				wheelchairHeight: "abc",
			}),
			ctx,
			mockT
		);

		const paths = addIssue.mock.calls.map((call) => (call[0] as IssueArg).path?.[0]);

		expect(paths).toContain("wheelchairHeight");
	});

	it("does not add issues when all dimensions are valid", () => {
		const { ctx, addIssue } = createMockCtx();

		validateWheelchairDimensions(buildPax(), ctx, mockT);

		expect(addIssue).not.toHaveBeenCalled();
	});
});
