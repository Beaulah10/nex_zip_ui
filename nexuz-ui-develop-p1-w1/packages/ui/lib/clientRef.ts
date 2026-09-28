const SESSION_STORAGE_NAME = "nexuz-client-ref";

/**
 * Generates a per-tab prefix used as the stable part of a client reference.
 *
 * Format: "<uuid>--"
 */
function newTabPrefix(): string {
	// Example format: "<uuid>--"
	return `${crypto.randomUUID()}--`;
}

/**
 * Returns a tab-scoped client reference prefix.
 *
 * In the browser, the value is persisted in `sessionStorage` so all calls in the
 * same tab share the same prefix. On the server, this returns an empty string.
 *
 * @returns The existing or newly generated tab prefix, or an empty string in SSR.
 */
export function getClientRefPrefix(): string {
	if (typeof window === "undefined") return "";

	const existing = window.sessionStorage.getItem(SESSION_STORAGE_NAME);
	if (existing) return existing;

	const prefix = newTabPrefix();
	window.sessionStorage.setItem(SESSION_STORAGE_NAME, prefix);
	return prefix;
}

/**
 * Removes the persisted tab-scoped client reference prefix from `sessionStorage`.
 *
 * No-op during server-side rendering.
 */
export function clearClientRefPrefix(): void {
	if (typeof window === "undefined") return;

	window.sessionStorage.removeItem(SESSION_STORAGE_NAME);
}

/**
 * Generates a new UUID to be used as the variable (per-call) part of a client ref.
 *
 * @returns A random UUID string.
 */
export function newVariableUuid(): string {
	return crypto.randomUUID();
}

/**
 * Builds a full client reference by combining:
 * 1. A tab-scoped prefix (stable within the tab), and
 * 2. A fresh UUID (unique per invocation).
 *
 * @returns A client reference in the format "<tab-uuid>--<call-uuid>" in the browser.
 * In SSR, the value is just a UUID because the prefix is empty.
 */
export function buildClientRef(): string {
	const prefix = getClientRefPrefix();
	const variable = newVariableUuid();
	return `${prefix}${variable}`;
}
