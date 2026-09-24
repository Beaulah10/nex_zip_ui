import path from "node:path";
import { createLabelContractFromCustomTypes } from "@repo/cms/prismic";
import {
	createLabelService,
	getServerLabelSource,
	type LabelSource,
} from "@repo/cms/services/label-service";
import { type AppLocale, routing } from "../modules/utils/locales";
import { type IBEMessages, localMessages } from "./messages";

export type { LabelSource };

const customTypesRoot = path.resolve(process.cwd(), "../../packages/cms/customtypes");

const labelMessagesContract = createLabelContractFromCustomTypes<IBEMessages>({
	customTypesRoot,
	parentDocumentType: "ibe",
});

const labelService = createLabelService<IBEMessages>({
	applicationName: "ibe-app",
	defaultLocale: routing.defaultLocale,
	locales: routing.locales,
	localMessages,
	labelContract: labelMessagesContract,
	parentDocumentType: "ibe",
	prismicLocaleMap: {
		en: "en-us",
		ja: "ja-jp",
	},
});

export const getIbeLabels = labelService.getLabels;
export { getServerLabelSource };

export function resolveLocale(locale: string | undefined): AppLocale {
	return labelService.resolveLocale(locale) as AppLocale;
}
