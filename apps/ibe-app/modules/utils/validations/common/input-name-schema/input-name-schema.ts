import { z } from "zod";
import { isUppercaseAlphabet } from "@/modules/utils/helpers/common/string-util/string-util";
import type { PassengerNameLabels } from "@/types/passenger/passenger.type";

export const MAX_INPUT_LENGTH = 64;
export const nameSchema = (label: string, passengerLabel: PassengerNameLabels) =>
	z
		.string()
		.trim()
		.nonempty(passengerLabel("min_length", { label }))
		.max(MAX_INPUT_LENGTH, passengerLabel("max_length"))
		.transform((value) => value.toUpperCase())
		.refine(isUppercaseAlphabet, passengerLabel("uppercase_alpha"));
