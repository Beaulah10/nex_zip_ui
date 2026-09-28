import { describe, expect, it } from "vitest";
import { nameSchema } from "@/modules/utils/validations/common/input-name-schema/input-name-schema";
import {
	passengerFormSchema,
	passengerItemSchema,
} from "@/modules/utils/validations/passenger.schema/passenger.schema";

const t = ((key: string) => key) as ReturnType<
	typeof import("next-intl").useTranslations<"passenger_name_page">
>;

describe("passenger.schema", () => {
	it("validates name schema min/max and uppercase alpha format", () => {
		const schema = nameSchema("last_name", t);

		expect(schema.safeParse("").success).toBe(false);
		expect(schema.safeParse("a").success).toBe(true);
		expect(schema.safeParse("A".repeat(65)).success).toBe(false);
		expect(schema.safeParse("ABC").success).toBe(true);
	});

	it("validates passenger item without accompanying adult when not required", () => {
		const schema = passengerItemSchema(t);

		const result = schema.safeParse({
			id: "1",
			passengerTypeCode: "adult",
			lastName: "DOE",
			firstName: "JOHN",
			hasAccompanyingAdult: false,
		});

		expect(result.success).toBe(true);
	});

	it("fails when accompanying adult is required but missing", () => {
		const schema = passengerItemSchema(t);

		const result = schema.safeParse({
			id: "2",
			passengerTypeCode: "infant",
			lastName: "DOE",
			firstName: "BABY",
			hasAccompanyingAdult: true,
			accompanyingAdult: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(
				result.error.issues.some((issue) => issue.path.join(".") === "accompanyingAdult")
			).toBe(true);
		}
	});

	it("validates full passenger form payload", () => {
		const schema = passengerFormSchema(t);

		const valid = schema.safeParse({
			passengers: [
				{
					id: "1",
					passengerTypeCode: "adult",
					lastName: "DOE",
					firstName: "JANE",
					hasAccompanyingAdult: false,
				},
			],
		});

		expect(valid.success).toBe(true);

		const invalid = schema.safeParse({
			passengers: [
				{
					id: "1",
					passengerTypeCode: "adult",
					lastName: "DOE1",
					firstName: "JANE",
					hasAccompanyingAdult: false,
				},
			],
		});

		expect(invalid.success).toBe(false);
	});
});
