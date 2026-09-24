import { z } from "zod";
import { nameSchema } from "@/modules/utils/validations/common/input-name-schema/input-name-schema";
import type { PassengerNameLabels } from "@/types/passenger/passenger.type";

// ── Per-passenger item schema ─────────────────────────────────────────────────
export const passengerItemSchema = (passengerLabel: PassengerNameLabels) =>
	z
		.object({
			id: z.string(),
			passengerTypeCode: z.string(),
			lastName: nameSchema(passengerLabel("last_name"), passengerLabel),
			firstName: nameSchema(passengerLabel("first_name"), passengerLabel),
			accompanyingAdult: z.string().min(1, passengerLabel("accompany_adult")).optional(),
			hasAccompanyingAdult: z.boolean(),
		})
		.superRefine((data, ctx) => {
			if (data.hasAccompanyingAdult && !data.accompanyingAdult?.trim()) {
				ctx.addIssue({
					code: "custom",
					message: passengerLabel("accompany_adult"),
					path: ["accompanyingAdult"],
				});
			}
		});

// ── Top-level form schema ─────────────────────────────────────────────────────

export const passengerFormSchema = (t: PassengerNameLabels) =>
	z.object({
		passengers: z.array(passengerItemSchema(t)),
	});

// ── Inferred types ────────────────────────────────────────────────────────────

export type PassengerItemValues = z.infer<ReturnType<typeof passengerItemSchema>>;
export type PassengerFormValues = z.infer<ReturnType<typeof passengerFormSchema>>;
