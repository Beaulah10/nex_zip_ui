/**
 * File: unsaved-changes-dialog.tsx
 * Description: Reusable unsaved-changes warning — uses the browser's native
 * confirm dialog so consumers only need a single import.
 */

"use client";

import type {
	UseUnsavedChangesOptions,
	UseUnsavedChangesReturn,
} from "@/types/common/unsaved-changes-dialog.types";

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useUnsavedChanges({
	description,
	onDiscard,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
	const showWarning = () => {
		const confirmed = window.confirm(description);
		if (confirmed) {
			onDiscard();
		}
	};

	return { showWarning };
}
