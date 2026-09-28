import { getRequestConfig } from "next-intl/server";
import { loadMessages, resolveLocale } from "./load-messages";

export default getRequestConfig(async ({ requestLocale }) => {
	const locale = await requestLocale;
	const resolvedLocale = resolveLocale(locale);

	return {
		locale: resolvedLocale,
		messages: await loadMessages(resolvedLocale),
	};
});
