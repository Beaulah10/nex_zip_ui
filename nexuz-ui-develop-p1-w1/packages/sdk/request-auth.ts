import {
	type CreateSdkClientContextOptions,
	createAuthorizedSdkClientContext,
	resolveBackendBaseUrl,
	type SdkClientContext,
} from "./sdk-client";

export const DEFAULT_SECURITY_TOKEN_COOKIE_NAME = "ibe_security_token";

type RequestCookieStore = {
	get: (name: string) =>
		| {
				value?: string;
		  }
		| undefined;
};

export type RequestAuthorizedSdkContextOptions = CreateSdkClientContextOptions & {
	cookieName?: string;
	cookieStore: RequestCookieStore | Promise<RequestCookieStore>;
};

export async function getSecurityTokenFromRequestCookies(
	cookieStore: RequestCookieStore | Promise<RequestCookieStore>,
	cookieName = DEFAULT_SECURITY_TOKEN_COOKIE_NAME,
): Promise<string | null> {
	const store = await cookieStore;
	const token = store.get(cookieName)?.value?.trim();

	return token || null;
}

export async function getAuthorizedSdkClientContextForRequest(
	options: RequestAuthorizedSdkContextOptions,
): Promise<SdkClientContext> {
	const {
		cookieName = DEFAULT_SECURITY_TOKEN_COOKIE_NAME,
		cookieStore,
		baseUrl = resolveBackendBaseUrl(),
		...sdkOptions
	} = options;

	const securityToken = await getSecurityTokenFromRequestCookies(cookieStore, cookieName);

	if (!securityToken) {
		throw new Error("Security token cookie is missing");
	}

	return createAuthorizedSdkClientContext(securityToken, {
		...sdkOptions,
		baseUrl,
	});
}
