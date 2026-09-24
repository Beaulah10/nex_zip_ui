export const setFocusOnInvalidInput = (): void => {
	// Scope to the topmost open dialog if one exists, so fields hidden behind
	// a dialog overlay are never scrolled into view or focused.
	const openDialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][data-state="open"]');
	const lastDialog = openDialogs.length > 0 ? openDialogs[openDialogs.length - 1] : null;
	const scope: Element = lastDialog ?? document.documentElement;

	const invalidFields = scope.querySelectorAll('[aria-invalid="true"]');

	if (invalidFields.length > 0) {
		const first = invalidFields[0] as HTMLElement;

		first.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		const focusable = first.matches("input, button, select, textarea")
			? first
			: first.querySelector<HTMLElement>(
					'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
				);

		focusable?.focus();
	}
};
