/**
 * File: app/middleware.ts
 * Description: Global middleware for locale-based routing using next-intl.
 */

import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./modules/utils/locales";

export default createMiddleware({
	locales,
	defaultLocale,
});

/**
 * Apply middleware to all routes except:
 * - Next.js internals
 * - Static assets
 */
export const config = {
	matcher: ["/((?!_next|api|.*\\..*).*)"],
};
