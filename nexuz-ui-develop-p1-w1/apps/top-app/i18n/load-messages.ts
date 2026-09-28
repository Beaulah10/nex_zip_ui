import type { AppLocale } from "../modules/utils/locales";
import { getIbeLabels, getServerLabelSource, resolveLocale } from "./label-service-config";

export async function loadMessages(locale: AppLocale) {
	return getIbeLabels(locale);
}

export { getServerLabelSource, resolveLocale };
