import * as prismic from "@prismicio/client";

export const repositoryName =
	process.env.PRISMIC_REPOSITORY_NAME || process.env.PRISMIC_REPOSITORY_NAME || "zipair-dev";
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

export function createClient(config: prismic.ClientConfig = {}) {
	const client = prismic.createClient(repositoryName, {
		accessToken,
		...config,
	});

	client.enableAutoPreviews();

	return client;
}
