export interface UseUnsavedChangesOptions {
	/** Message shown in the browser's native confirm dialog. */
	description: string;
	/** Called when the user confirms they want to discard unsaved changes. */
	onDiscard: () => void;
}

export interface UseUnsavedChangesReturn {
	/** Opens the browser's native confirm dialog; invokes `onDiscard` if confirmed. */
	showWarning: () => void;
}
