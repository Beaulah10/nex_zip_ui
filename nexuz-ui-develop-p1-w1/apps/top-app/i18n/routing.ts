/**
 * File: i18n/routing.ts
 * Centralized i18n routing configuration.
 * Defines supported locales and the default locale used by
 * next-intl for middleware-based locale routing.
 */
import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "../modules/utils/locales";

export const { Link, redirect, useRouter, usePathname } = createNavigation({
	locales,
	defaultLocale,
});
