export const defaultLocale = "en" as const;
export const locales = ["en", "ja", "zh-cn", "zh-tw", "ko", "th"] as const;
export type AppLocale = (typeof locales)[number];
export type LabelSource = "local" | "prismic" | "backend";
export const routing = {
	locales: ["en", "ja"] as const,
	defaultLocale: "en" as const,
};
