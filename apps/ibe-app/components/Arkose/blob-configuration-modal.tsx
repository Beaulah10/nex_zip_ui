"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

interface BlobConfigurationModalProps {
	isOpen: boolean;
	currentBlob: string | null;
	onSave: (blob: string) => void;
	onCancel: () => void;
}

const MIN_BLOB_LENGTH = 50;

export function BlobConfigurationModal({
	isOpen,
	currentBlob,
	onSave,
	onCancel,
}: BlobConfigurationModalProps) {
	const [blob, setBlob] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	// FIX COMMENT 4: Sync draft state when modal opens or currentBlob changes
	useEffect(() => {
		if (isOpen) {
			// Reset to current blob when modal opens
			setBlob(currentBlob ?? "");
			setError(null);
		}
	}, [isOpen, currentBlob]);

	const handleValidation = useCallback((value: string): string | null => {
		if (!value || value.trim().length === 0) {
			return "Blob cannot be empty";
		}
		if (value.length < MIN_BLOB_LENGTH) {
			return `Blob must be at least ${MIN_BLOB_LENGTH} characters (current: ${value.length})`;
		}
		return null;
	}, []);

	// FIX COMMENT 3: Use ChangeEvent type (imported at top)
	const handleBlobChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			const value = e.target.value;
			setBlob(value);

			// Clear error when user starts typing again
			if (error) {
				const validationError = handleValidation(value);
				setError(validationError);
			}
		},
		[error, handleValidation]
	);

	const handleSave = useCallback(() => {
		const validationError = handleValidation(blob);
		if (validationError) {
			setError(validationError);
			return;
		}

		onSave(blob);
		setError(null);
	}, [blob, handleValidation, onSave]);

	// FIX COMMENT 10 & 4: Cancel always closes modal and resets draft
	const handleCancel = useCallback(() => {
		setBlob(currentBlob ?? "");
		setError(null);
		onCancel();
	}, [currentBlob, onCancel]);

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-40 bg-black bg-opacity-50" aria-hidden="true" />

			{/* FIX COMMENT 6: Add dialog semantics and accessibility attributes */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="blob-modal-title"
			>
				<div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
					{/* Header */}
					<h2 id="blob-modal-title" className="mb-1 font-bold text-gray-900 text-lg">
						Arkose Data Exchange Blob
					</h2>
					<p className="mb-4 text-gray-600 text-sm">
						Paste a valid Arkose Data Exchange Blob to configure the challenge
					</p>

					{/* Textarea */}
					<div className="mb-4 space-y-2">
						<label htmlFor="blob-input" className="block font-semibold text-gray-700 text-sm">
							Blob Value
						</label>
						<textarea
							id="blob-input"
							value={blob}
							onChange={handleBlobChange}
							placeholder="Paste your Data Exchange blob here..."
							className={`h-48 w-full rounded-lg border p-3 font-mono text-sm focus:outline-none focus:ring-2 ${
								error
									? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200"
							}`}
						/>
					</div>

					{/* Blob Length Info */}
					<div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
						<span className="text-gray-600 text-sm">
							Blob Length: <span className="font-mono font-semibold">{blob.length}</span>
						</span>
						{blob.length >= MIN_BLOB_LENGTH && (
							<span className="font-semibold text-green-600 text-sm">✓ Valid length</span>
						)}
						{blob.length > 0 && blob.length < MIN_BLOB_LENGTH && (
							<span className="text-sm text-yellow-600">
								Need {MIN_BLOB_LENGTH - blob.length} more characters
							</span>
						)}
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
							<p className="text-red-700 text-sm">
								<strong>Validation Error:</strong> {error}
							</p>
						</div>
					)}

					{/* Buttons */}
					<div className="flex gap-3">
						<button
							type="button"
							onClick={handleSave}
							className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition-colors ${
								error
									? "cursor-not-allowed bg-gray-400"
									: "bg-green-600 hover:bg-green-700 active:bg-green-800"
							}`}
							disabled={!!error || blob.length === 0}
						>
							Save Blob
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
						>
							Cancel
						</button>
					</div>

					{/* Help Text */}
					<div className="border-gray-200 border-t pt-4">
						<p className="text-gray-600 text-xs">
							<strong>Tip:</strong> The blob is a base64-encoded string containing challenge seed
							and biometric data. Minimum length is {MIN_BLOB_LENGTH} characters.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
