/**
 * File: [locale]/page.tsx
 * Description: Locale home page with welcome message
 */

import { getTranslations } from "next-intl/server";

export default async function LocaleRoot() {
	const t = await getTranslations("flight_search_page");
	return (
		<div>
			<main>
				<h1 className="text-3xl underline">{t("label_from")}</h1>
				<h2 className="relative h-full w-64 bg-blue-400">{t("label_to")}</h2>
			</main>
		</div>
	);
}
