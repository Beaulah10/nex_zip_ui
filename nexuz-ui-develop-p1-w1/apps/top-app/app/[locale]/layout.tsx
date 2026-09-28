import { SiteFooter } from "@repo/ui/components/site-footer";
import { SiteHeader } from "@repo/ui/components/site-header";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { resolveLocale } from "../../i18n/load-messages";
import { locales } from "../../modules/utils/locales";

/**
 * Generates dynamic metadata for the locale-specific layout segment.
 *
 * @param params - Route segment params containing the current `locale` slug
 *   (e.g. `"en"`, `"ja"`). Passed as a Promise in Next.js App Router.
 * @returns A Next.js {@link Metadata} object with at minimum the page `title`
 *   translated into the requested locale.
 *
 * @example
 * // Result for locale "en": { title: "ZIPAIR" }
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const resolvedLocale = resolveLocale(locale);
	const t = await getTranslations({ locale: resolvedLocale, namespace: "app" });

	return {
		title: t("flight_search_title"),
	};
}

/**
 * Root layout for all locale-prefixed routes (`/[locale]/...`).
 *
 * Responsibilities:
 * - Validates that the requested locale is supported; calls `notFound()` for
 *   unknown locales so Next.js renders the nearest `not-found` boundary.
 * - Loads the full `next-intl` message catalogue for the active locale and
 *   provides it to all client components via {@link NextIntlClientProvider}.
 * - Renders the shared {@link SiteHeader} and a centred content wrapper.
 *
 * @param children - Page or nested-layout content rendered inside this layout.
 * @param params   - Route segment params; `locale` matches the `[locale]`
 *   dynamic segment (e.g. `"en"`, `"ja"`).
 */
export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Redirect to 404 for unsupported locales to prevent partially rendered pages.
	if (!hasLocale(locales, locale)) {
		notFound();
	}

	// Fetch the full message catalogue server-side and pass it to the client provider.
	const messages = await getMessages();

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<main className="flex min-h-screen flex-col">
				<SiteHeader className="static" />
				<div className="mx-auto w-full max-w-5xl flex-1 pt-8 pb-16 md:pt-14 md:pb-32">
					{children}
				</div>
				<SiteFooter className="static" />
			</main>
		</NextIntlClientProvider>
	);
}
