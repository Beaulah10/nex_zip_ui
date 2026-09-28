import * as prismic from "@prismicio/client";
import { prismicConfig } from "./config";
import { getRepositoryName } from "./repository";

export function createPrismicClient(options?: prismic.ClientConfig) {
	return prismic.createClient(getRepositoryName(), {
		accessToken: prismicConfig.accessToken,
		routes: [...prismicConfig.routes],
		...options,
	});
}
