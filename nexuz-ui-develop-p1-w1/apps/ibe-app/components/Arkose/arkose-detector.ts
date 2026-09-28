/**
 * Arkose Labs API Detection & Configuration Utility
 *
 * FIX COMMENT 1: Enforcement instance is the ONLY source of truth.
 * Passed directly via setupEnforcement(enforcement) callback.
 * Do NOT scan globals by name - that is unsafe and breaks type safety.
 *
 * FIX COMMENT 2: Track load completion via data-loaded attribute,
 * not legacy readyState (undefined in modern browsers).
 */

export interface ArkoseConfig {
	selector: string;
	mode: "inline" | "lightbox";
	language: string;
	data: {
		blob: string;
	};
	onReady?: () => void;
	onShown?: () => void;
	onCompleted?: (response: { token?: string }) => void;
	onError?: (error: Error | string) => void;
}

export interface ArkoseEnforcement {
	show?: () => void;
	execute?: () => void;
	run?: () => void;
	setConfig: (config: ArkoseConfig) => void;
	setToken?: (token: string) => void;
	token?: string;
	[key: string]: unknown;
}

/**
 * Validates if an object has the required ArkoseEnforcement interface
 * FIX COMMENT 1: Only for strict validation, never used for detection
 */
export function isValidEnforcement(obj: unknown): obj is ArkoseEnforcement {
	if (typeof obj !== "object" || obj === null) return false;
	const enforcement = obj as Record<string, unknown>;
	return typeof enforcement.setConfig === "function";
}

/**
 * Checks if Arkose script is loaded via data-loaded attribute
 * FIX COMMENT 2: Uses data-loaded instead of legacy readyState
 */
export function isArkoseScriptLoaded(publicKey: string): boolean {
	const scriptId = `arkose-script-${publicKey}`;
	const script = document.getElementById(scriptId);
	const isLoaded = script?.getAttribute("data-loaded") === "true";
	return isLoaded;
}

/**
 * Stores the enforcement instance in a way that's accessible throughout lifecycle
 * FIX COMMENT 1: Direct reference, not global scanning
 */
let storedEnforcement: ArkoseEnforcement | null = null;

export function setStoredEnforcement(enforcement: ArkoseEnforcement | null): void {
	storedEnforcement = enforcement;
}

export function getStoredEnforcement(): ArkoseEnforcement | null {
	return storedEnforcement;
}

export function clearStoredEnforcement(): void {
	storedEnforcement = null;
}
