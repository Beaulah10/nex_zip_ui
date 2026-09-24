import {
	Configuration,
	type ConfigurationParameters,
	type HTTPHeaders,
	type Middleware,
} from "./swagger";

type AnyApiInstance = object;

export type SdkApiClass<TApi extends AnyApiInstance = AnyApiInstance> = new (
	configuration?: Configuration,
) => TApi;

export type SdkClientContext = {
	baseUrl: string;
	configuration: Configuration;
	getApi: <TApi extends AnyApiInstance>(ApiClass: SdkApiClass<TApi>) => TApi;
};

export type CreateSdkClientContextOptions = Omit<
	ConfigurationParameters,
	"basePath" | "headers"
> & {
	baseUrl?: string;
	headers?: HTTPHeaders;
	middleware?: Middleware[];
};

export class SdkRequestError extends Error {
	readonly name = "SdkRequestError";
	readonly status: number | null;
	readonly method: string;
	readonly url: string;
	readonly responseBody: string | null;
	readonly cause: unknown;

	constructor(options: {
		cause?: unknown;
		message: string;
		method: string;
		responseBody?: string | null;
		status?: number | null;
		url: string;
	}) {
		super(options.message);
		this.status = options.status ?? null;
		this.method = options.method;
		this.url = options.url;
		this.responseBody = options.responseBody ?? null;
		this.cause = options.cause;
	}
}

export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.trim().replace(/\/+$/, "");
}

function getEnvValue(name: string): string | undefined {
	return (
		globalThis as {
			process?: {
				env?: Record<string, string | undefined>;
			};
		}
	).process?.env?.[name];
}

function isTruthyEnvValue(value: string | undefined): boolean {
	if (!value) {
		return false;
	}

	return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function isSdkDebugEnabled(): boolean {
	return isTruthyEnvValue(getEnvValue("SDK_DEBUG"));
}

function debugSdkLog(message: string, details?: Record<string, unknown>): void {
	if (!isSdkDebugEnabled()) {
		return;
	}

	if (details) {
		console.info("[sdk]", message, details);
		return;
	}

	console.info("[sdk]", message);
}

export function resolveBackendBaseUrl(
	env = (
		globalThis as {
			process?: {
				env?: Record<string, string | undefined>;
			};
		}
	).process?.env?.BACKEND_API_BASE_URL,
): string {
	if (!env?.trim()) {
		throw new Error("BACKEND_API_BASE_URL is not configured");
	}

	const normalizedBaseUrl = normalizeBaseUrl(env);
	debugSdkLog("Resolved BACKEND_API_BASE_URL", {
		normalizedBaseUrl,
	});

	return normalizedBaseUrl;
}

async function readResponseBody(response: Response): Promise<string | null> {
	try {
		return await response.text();
	} catch {
		return null;
	}
}

export function createSdkErrorInterceptor(): Middleware {
	return {
		post: async ({ init, response, url }) => {
			if (response.ok) {
				return response;
			}

			const responseBody = await readResponseBody(response.clone());
			const method = init.method ?? "GET";
			const message = `SDK request failed with status ${response.status} for ${method} ${url}`;
			debugSdkLog("HTTP response returned non-OK status", {
				method,
				responseBodyPreview: responseBody?.slice(0, 200),
				status: response.status,
				url,
			});

			throw new SdkRequestError({
				message,
				method,
				responseBody,
				status: response.status,
				url,
			});
		},
		onError: async ({ error, init, response, url }) => {
			const method = init.method ?? "GET";
			const responseBody = response ? await readResponseBody(response.clone()) : null;
			const errorMessage = error instanceof Error ? error.message : null;
			const message =
				error instanceof Error
					? `SDK request failed for ${method} ${url}: ${error.message}`
					: `SDK request failed for ${method} ${url}`;

			debugSdkLog("Network/transport error before receiving successful response", {
				errorMessage,
				method,
				responseBody,
				status: response?.status ?? null,
				url,
			});

			throw new SdkRequestError({
				cause: error,
				message,
				method,
				responseBody,
				status: response?.status ?? null,
				url,
			});
		},
	};
}

export function createSdkConfiguration(options: CreateSdkClientContextOptions = {}): Configuration {
	const { baseUrl = resolveBackendBaseUrl(), headers, middleware, ...configuration } = options;
	const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

	debugSdkLog("Creating SDK configuration", {
		hasCustomHeaders: Boolean(headers && Object.keys(headers).length > 0),
		hasCustomMiddleware: Boolean(middleware && middleware.length > 0),
		normalizedBaseUrl,
	});

	return new Configuration({
		...configuration,
		basePath: normalizedBaseUrl,
		headers: {
			Accept: "application/json",
			...headers,
		},
		middleware: [createSdkErrorInterceptor(), ...(middleware ?? [])],
	});
}

export function createAuthorizedSdkConfiguration(
	securityToken: string,
	options: CreateSdkClientContextOptions = {},
): Configuration {
	return createSdkConfiguration({
		...options,
		headers: {
			...options.headers,
			"Cache-Control": "no-store",
			"x-security-token": securityToken,
		},
	});
}

export function createSdkClientContext(
	options: CreateSdkClientContextOptions = {},
): SdkClientContext {
	const configuration = createSdkConfiguration(options);
	const apiInstances = new Map<SdkApiClass, AnyApiInstance>();

	return {
		baseUrl: configuration.basePath,
		configuration,
		getApi: <TApi extends AnyApiInstance>(ApiClass: SdkApiClass<TApi>): TApi => {
			const cachedApi = apiInstances.get(ApiClass);

			if (cachedApi) {
				return cachedApi as TApi;
			}

			const api = new ApiClass(configuration);
			apiInstances.set(ApiClass, api);
			return api;
		},
	};
}

export function createAuthorizedSdkClientContext(
	securityToken: string,
	options: CreateSdkClientContextOptions = {},
): SdkClientContext {
	const configuration = createAuthorizedSdkConfiguration(securityToken, options);
	const apiInstances = new Map<SdkApiClass, AnyApiInstance>();

	return {
		baseUrl: configuration.basePath,
		configuration,
		getApi: <TApi extends AnyApiInstance>(ApiClass: SdkApiClass<TApi>): TApi => {
			const cachedApi = apiInstances.get(ApiClass);

			if (cachedApi) {
				return cachedApi as TApi;
			}

			const api = new ApiClass(configuration);
			apiInstances.set(ApiClass, api);
			return api;
		},
	};
}
