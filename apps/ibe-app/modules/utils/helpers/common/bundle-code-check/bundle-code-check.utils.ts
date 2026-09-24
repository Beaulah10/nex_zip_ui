import { BUNDLE_CODES } from "@/modules/utils/constants/bundle-codes/bundle-codes.constants";

// Keep SSR code comparisons consistent with bundle metadata coming from API/store.
export const normalizeServiceCode = (code: string): string => code.trim().toUpperCase();

export const isValueBundleCode = (code: string): boolean =>
	BUNDLE_CODES.value.has(normalizeServiceCode(code));

export const isPremiumBundleCode = (code: string): boolean =>
	BUNDLE_CODES.premium.has(normalizeServiceCode(code));
