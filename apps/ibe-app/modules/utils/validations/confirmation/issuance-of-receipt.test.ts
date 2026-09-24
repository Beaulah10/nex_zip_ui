import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isAnyUSRoute: vi.fn(),
	isAnyCANADARoute: vi.fn(),
}));

import {
	isAnyCANADARoute,
	isAnyUSRoute,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	hasUsCanadaItinerary,
	RECEIPT_MAX_NAME_LENGTH,
	validateReceiptEmail,
	validateReceiptEmailConfirmation,
	validateReceiptName,
} from "./issuance-of-receipt";

const nameOptions = {
	required: true,
	requiredMessage: "name required",
	maxLengthMessage: "too long",
	invalidMessage: "invalid name",
};

const emailOptions = {
	requiredMessage: "email required",
	invalidMessage: "invalid email",
	isUsCanadaRoute: false,
};

describe("validateReceiptName", () => {
	it("returns required message for blank required values", () => {
		expect(validateReceiptName("   ", nameOptions)).toBe("name required");
	});

	it("returns max-length message when the trimmed name is too long", () => {
		expect(validateReceiptName("A".repeat(RECEIPT_MAX_NAME_LENGTH + 1), nameOptions)).toBe(
			"too long"
		);
	});

	it("returns invalid message for non alphabetic names", () => {
		expect(validateReceiptName("John1", nameOptions)).toBe("invalid name");
	});

	it("allows optional blank values", () => {
		expect(
			validateReceiptName("   ", {
				...nameOptions,
				required: false,
			})
		).toBeUndefined();
	});

	it("accepts valid alphabetic names after trimming", () => {
		expect(validateReceiptName("  John Smith  ", nameOptions)).toBeUndefined();
	});
});

describe("validateReceiptEmail", () => {
	it("returns required message for blank email", () => {
		expect(validateReceiptEmail("   ", emailOptions)).toBe("email required");
	});

	it("returns invalid message for malformed email", () => {
		expect(validateReceiptEmail("not-an-email", emailOptions)).toBe("invalid email");
	});

	it("rejects plus or star aliases on US or Canada routes", () => {
		expect(
			validateReceiptEmail("user+tag@example.com", {
				...emailOptions,
				isUsCanadaRoute: true,
			})
		).toBe("invalid email");
		expect(
			validateReceiptEmail("user*tag@example.com", {
				...emailOptions,
				isUsCanadaRoute: true,
			})
		).toBe("invalid email");
	});

	it("accepts valid email outside US or Canada route restrictions", () => {
		expect(validateReceiptEmail("  user+tag@example.com  ", emailOptions)).toBeUndefined();
	});
});

describe("validateReceiptEmailConfirmation", () => {
	it("returns required message for blank confirmation email", () => {
		expect(
			validateReceiptEmailConfirmation({
				emailConfirmation: "   ",
				emailAddress: "user@example.com",
				requiredMessage: "required",
				invalidMessage: "invalid",
				mismatchMessage: "mismatch",
				isUsCanadaRoute: false,
			})
		).toBe("required");
	});

	it("returns invalid message for invalid confirmation email", () => {
		expect(
			validateReceiptEmailConfirmation({
				emailConfirmation: "bad",
				emailAddress: "user@example.com",
				requiredMessage: "required",
				invalidMessage: "invalid",
				mismatchMessage: "mismatch",
				isUsCanadaRoute: false,
			})
		).toBe("invalid");
	});

	it("returns mismatch message when values differ after trimming", () => {
		expect(
			validateReceiptEmailConfirmation({
				emailConfirmation: "other@example.com",
				emailAddress: " user@example.com ",
				requiredMessage: "required",
				invalidMessage: "invalid",
				mismatchMessage: "mismatch",
				isUsCanadaRoute: false,
			})
		).toBe("mismatch");
	});

	it("applies US and Canada alias restrictions to confirmation email", () => {
		expect(
			validateReceiptEmailConfirmation({
				emailConfirmation: "user+tag@example.com",
				emailAddress: "user+tag@example.com",
				requiredMessage: "required",
				invalidMessage: "invalid",
				mismatchMessage: "mismatch",
				isUsCanadaRoute: true,
			})
		).toBe("invalid");
	});

	it("returns undefined for a matching valid confirmation email", () => {
		expect(
			validateReceiptEmailConfirmation({
				emailConfirmation: " user@example.com ",
				emailAddress: "user@example.com",
				requiredMessage: "required",
				invalidMessage: "invalid",
				mismatchMessage: "mismatch",
				isUsCanadaRoute: false,
			})
		).toBeUndefined();
	});
});

describe("hasUsCanadaItinerary", () => {
	it("returns true when any segment is a US route", () => {
		vi.mocked(isAnyUSRoute).mockReturnValue(true);
		vi.mocked(isAnyCANADARoute).mockReturnValue(false);

		expect(hasUsCanadaItinerary([{ origin: "NRT", destination: "LAX" }])).toBe(true);
	});

	it("returns true when any segment is a Canada route", () => {
		vi.mocked(isAnyUSRoute).mockReturnValue(false);
		vi.mocked(isAnyCANADARoute).mockReturnValue(true);

		expect(hasUsCanadaItinerary([{ origin: "NRT", destination: "YVR" }])).toBe(true);
	});

	it("returns false when neither helper matches", () => {
		vi.mocked(isAnyUSRoute).mockReturnValue(false);
		vi.mocked(isAnyCANADARoute).mockReturnValue(false);

		expect(hasUsCanadaItinerary([{ origin: "NRT", destination: "SIN" }])).toBe(false);
	});
});
