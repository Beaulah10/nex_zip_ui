/**
 * File: arkose.tsx
 * Description: React component for integrating the Arkose Labs verification
 * challenge. Handles script loading, challenge initialization, token/blob
 * management, status updates, error handling, and supports both inline and
 * lightbox verification modes.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArkoseProps } from "@/types/arkose/arkose.types";
import type { ArkoseConfig, ArkoseEnforcement } from "./arkose-detector";
import { BlobConfigurationCard } from "./blob-configuration-card";
import { BlobConfigurationModal } from "./blob-configuration-modal";

export default function Arkose({
	publicKey,
	token,
	selector = "arkose-container",
	mode = "inline",
	nonce,
	onReady,
	onShown,
	onCompleted,
	onError,
}: ArkoseProps) {
	const isTokenLightboxMode = Boolean(token) && mode === "lightbox";
	const [userBlob, setUserBlob] = useState<string | null>(null);
	const [isBlobModalOpen, setIsBlobModalOpen] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const blobRef = useRef<string | null>(null);
	const scriptLoadedRef = useRef(false);
	const scriptIdRef = useRef(`arkose-script-${publicKey}`);
	const enforcementRef = useRef<ArkoseEnforcement | null>(null);
	const effectiveBlob = token ?? userBlob;

	useEffect(() => {
		blobRef.current = effectiveBlob;
	}, [effectiveBlob]);

	const handleBlobSave = useCallback((blob: string) => {
		setUserBlob(blob);
		setIsBlobModalOpen(false);
		setError(null);
	}, []);

	const handleUpdateBlob = useCallback(() => {
		setIsBlobModalOpen(true);
	}, []);

	useEffect(() => {
		if (!effectiveBlob) {
			return;
		}

		if (scriptLoadedRef.current) {
			return;
		}

		// FIX COMMENT 7: Always set status AND error when publicKey is empty
		if (!publicKey) {
			const msg = "Public key is required";
			setStatus("Error");
			setError(msg);
			onError?.(new Error(msg));
			return;
		}

		const setupEnforcementCallback = (enforcement: unknown) => {
			const arkoseEnforcement = enforcement as ArkoseEnforcement;
			enforcementRef.current = arkoseEnforcement;

			const currentBlob = blobRef.current;
			if (!currentBlob) {
				const msg = "Blob configuration lost";
				setStatus("Error");
				setError(msg);
				onError?.(new Error(msg));
				return;
			}

			const config: ArkoseConfig = {
				selector: `#${selector}`,
				mode,
				language: "en",
				data: { blob: currentBlob },
				onReady() {
					setStatus("Challenge initialized");
					onReady?.();
				},
				onShown() {
					setStatus("Challenge displayed");
					onShown?.();
				},
				// FIX COMMENT 8: Arkose passes response object, extract token string
				onCompleted(response) {
					const token = (response as { token?: string })?.token;
					if (typeof token === "string" && token.length > 0) {
						setStatus("Challenge completed");
						onCompleted?.(token);
					} else {
						const tokenError = new Error("Arkose challenge completed but no valid token received");
						setStatus("Error");
						setError(tokenError.message);
						onError?.(tokenError);
					}
				},
				onError(err: Error | string) {
					const errorMsg = err instanceof Error ? err.message : String(err);
					setStatus("Challenge error");
					setError(errorMsg);
					onError?.(new Error(errorMsg));
				},
			};

			arkoseEnforcement.setConfig(config);
			if (token) {
				arkoseEnforcement.setToken?.(token);
			}
			if (mode === "lightbox") {
				arkoseEnforcement.run?.();
			}
		};

		const windowRecord = window as unknown as Record<string, unknown>;
		windowRecord.setupEnforcement = setupEnforcementCallback;

		const existingScript = document.getElementById(scriptIdRef.current);
		if (existingScript) {
			existingScript.remove();
		}

		setStatus("Initializing");

		const script = document.createElement("script");
		script.id = scriptIdRef.current;
		script.type = "text/javascript";
		script.src = `https://zipair-api.arkoselabs.com/v2/${publicKey}/api.js`;
		script.async = true;
		script.defer = true;
		script.setAttribute("data-callback", "setupEnforcement");

		// FIX COMMENT 2: Mark script as loaded via data attribute (not readyState)
		script.onload = () => {
			script.setAttribute("data-loaded", "true");
			scriptLoadedRef.current = true;
			setStatus("Initialized");
		};

		if (nonce) {
			script.setAttribute("data-nonce", nonce);
		}

		script.onerror = () => {
			const errorMsg = "Failed to load Arkose script";
			setError(errorMsg);
			setStatus("Error");
			onError?.(new Error(errorMsg));
		};

		document.body.appendChild(script);

		// FIX COMMENT 9: Reset scriptLoadedRef on cleanup to allow re-init on blob change
		return () => {
			const windowRecord = window as unknown as Record<string, unknown>;
			if (windowRecord.setupEnforcement) {
				windowRecord.setupEnforcement = undefined;
			}
			const script = document.getElementById(scriptIdRef.current);
			if (script) {
				script.remove();
			}
			// Reset for next initialization cycle
			scriptLoadedRef.current = false;
			enforcementRef.current = null;
		};
	}, [
		effectiveBlob,
		mode,
		nonce,
		onCompleted,
		onError,
		onReady,
		onShown,
		publicKey,
		selector,
		token,
	]);

	return (
		<div className="space-y-4">
			{!token && (
				<BlobConfigurationModal
					isOpen={isBlobModalOpen}
					currentBlob={userBlob}
					onSave={handleBlobSave}
					onCancel={() => setIsBlobModalOpen(false)}
				/>
			)}

			{!token && (
				<BlobConfigurationCard
					isConfigured={!!userBlob}
					blobLength={userBlob?.length ?? 0}
					onUpdateClick={handleUpdateBlob}
				/>
			)}

			{status && !isTokenLightboxMode && (
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
					<p className="text-blue-900 text-sm">{status}</p>
					{error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
				</div>
			)}

			{mode === "inline" && effectiveBlob && (
				<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
					<div id={selector} />
				</div>
			)}
		</div>
	);
}
