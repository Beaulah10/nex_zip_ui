import type { ApiErrorConfigEntry } from "./types";

/**
 * Resolves the localized title key for an API error code.
 * Returns the fallback key when the code is missing or unknown.
 */
export function resolveErrorTitleKey<TCode extends string>(
	code: TCode | string | null | undefined,
	config: readonly ApiErrorConfigEntry<TCode>[],
	fallbackKey = "system_error_title",
): string {
	if (!code) {
		return fallbackKey;
	}

	// Catalog match determines the translated title key for the provided code.
	const match = config.find((item) => item.code === code);
	return match?.titleKey ?? fallbackKey;
}
