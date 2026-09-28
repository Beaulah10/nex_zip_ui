import * as prismic from "@prismicio/client";
import { getRepositoryName, prismicConfig } from "@repo/cms/prismic";

export function createPrismicWriteClient(options?: prismic.ClientConfig) {
	const writeToken = process.env.PRISMIC_WRITE_TOKEN;

	if (!writeToken) {
		throw new Error("PRISMIC_WRITE_TOKEN is required to seed Prismic content");
	}

	return prismic.createWriteClient(getRepositoryName(), {
		accessToken: prismicConfig.accessToken,
		routes: [...prismicConfig.routes],
		writeToken,
		...options,
	});
}

export function createPrismicMigration() {
	return prismic.createMigration();
}
