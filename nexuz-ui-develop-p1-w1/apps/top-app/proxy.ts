import {
	CoreApi,
	createSdkClientContext,
	DEFAULT_SECURITY_TOKEN_COOKIE_NAME,
	resolveBackendBaseUrl,
} from "@repo/sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./modules/utils/locales";

/**
 * CloudFront debug endpoint used to infer viewer geography from edge headers.
 *
 * Expected response includes `cloudfrontViewerCountry` (ISO-3166 alpha-2 country code).
 */
const CLOUDFRONT_DEBUG_HEADERS_URL = "/api/debug-headers";

function isLocalizedE2eRoute(pathname: string) {
	return locales.some(
		(localeOption) =>
			pathname === `/${localeOption}/e2e` || pathname.startsWith(`/${localeOption}/e2e/`)
	);
}

/**
 * Resolves application locale from CloudFront viewer country.
 *
 * Locale policy:
 * - Japan (`JP`) => `ja`
 * - Any other country => `en`
 * - On request/parsing failure => `en`
 *
 * @returns Detected locale (`ja` for Japan, otherwise `en`).
 */
async function resolveLocaleFromIp(): Promise<"en" | "ja"> {
	try {
		const response = await fetch(CLOUDFRONT_DEBUG_HEADERS_URL, {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			return "en";
		}

		const payload = (await response.json()) as {
			cloudfrontViewerCountry?: string;
		};
		const countryCode = payload.cloudfrontViewerCountry?.trim().toUpperCase();

		return countryCode === "JP" ? "ja" : "en";
	} catch {
		return "en";
	}
}

/**
 * Handles locale-aware routing for locale-prefixed requests.
 *
 * Uses `next-intl` middleware configuration with the app's supported locales
 * and default locale.
 */
const handleI18nRouting = createMiddleware({
	locales,
	defaultLocale,
});

/**
 * Use secure cookies only in production because browsers ignore `Secure` cookies
 * over plain HTTP, which would break local development sessions.
 */
const isSecurityTokenCookieSecure = process.env.NODE_ENV === "production";

/**
 * Builds cookie options for storing the backend-issued security token.
 *
 * @returns Cookie options configured for secure server-managed auth token usage.
 */
const createSecurityTokenCookieOptions = () => {
	return {
		httpOnly: true,
		secure: isSecurityTokenCookieSecure,
		path: "/",
		maxAge: 60 * 60,
		sameSite: "lax" as const,
	};
};

/**
 * Global middleware that applies locale routing and ensures a security token cookie exists.
 *
 * Behavior summary:
 * - For non-locale, non-API routes: detect locale from IP and redirect to `/{locale}/...`
 * - For locale-prefixed routes: run `next-intl` middleware
 * - For all routed pages (except standalone-error): ensure backend security token cookie exists
 *
 * If the token cookie is missing, a new token is requested from the backend and stored
 * as an httpOnly cookie on the response. If token retrieval fails, user is redirected
 * to the localized standalone error page.
 *
 * @param request Incoming Next.js request.
 * @returns Middleware response with redirect/routing and optional token cookie.
 */
export default async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
	const isE2eRoute = isLocalizedE2eRoute(pathname);
	const hasLocalePrefix = locales.some(
		(localeOption) => pathname === `/${localeOption}` || pathname.startsWith(`/${localeOption}/`)
	);

	if (!hasLocalePrefix && !isApiRoute) {
		const detectedLocale = await resolveLocaleFromIp();
		const redirectedUrl = request.nextUrl.clone();
		redirectedUrl.pathname = pathname === "/" ? `/${detectedLocale}` : `${pathname}`;

		return NextResponse.redirect(redirectedUrl);
	}

	const response = handleI18nRouting(request);

	if (isE2eRoute) {
		return response;
	}

	const existingSecurityToken = request.cookies.get(DEFAULT_SECURITY_TOKEN_COOKIE_NAME)?.value;
	const isLocaleRootRoute = locales.some(
		(localeOption) => pathname === `/${localeOption}` || pathname === `/${localeOption}/`
	);

	if (!existingSecurityToken) {
		try {
			const backendBaseUrl = resolveBackendBaseUrl();

			const context = createSdkClientContext({
				baseUrl: backendBaseUrl,
			});
			const coreApi = context.getApi(CoreApi);
			const tokenResponse = await coreApi.authTokenPost({
				cache: "no-store",
			});

			const tokenPayload = tokenResponse.data.accessToken;
			const accessToken = tokenPayload?.trim();

			if (accessToken) {
				response.cookies.set(
					DEFAULT_SECURITY_TOKEN_COOKIE_NAME,
					accessToken,
					createSecurityTokenCookieOptions()
				);
			}
		} catch {
			if (isLocaleRootRoute) {
				return response;
			}

			const locale =
				locales.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ?? defaultLocale;

			const redirectUrl = request.nextUrl.clone();
			redirectUrl.pathname = `/${locale}`;
			redirectUrl.search = "";

			return NextResponse.redirect(redirectUrl);
		}
	}

	return response;
}

/**
 * Middleware matching rules.
 *
 * Applies to all non-static, non-asset routes.
 */
export const config = {
	matcher: ["/((?!_next|api|.*\\..*).*)"],
};
