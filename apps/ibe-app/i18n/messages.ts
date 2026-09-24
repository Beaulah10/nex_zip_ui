import localEn from "../messages/en.json";
import type { AppLocale } from "../modules/utils/locales";

export type IBEMessages = typeof localEn;

export const localMessages = {
	en: localEn,
} satisfies Partial<Record<AppLocale, IBEMessages>>;

export function getLocaleMessages(locale: AppLocale): IBEMessages {
	return localMessages[locale as keyof typeof localMessages] ?? localMessages.en;
}
