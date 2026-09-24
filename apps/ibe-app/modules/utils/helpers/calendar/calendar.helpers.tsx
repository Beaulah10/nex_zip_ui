/** Returns a date truncated to local year-month-day. */
export function toDateOnly(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Compares two dates using local year-month-day only. */
export function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** Formats a local date as YYYY-MM-DD for fare map lookups. */
export function formatDateKey(d: Date) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns the first day of the month offset by n months from d. */
export function addMonths(d: Date, n: number) {
	return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** Returns the first day of d's month in local time. */
export function startOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Returns the number of calendar months between dates a and b. */
export function monthsBetween(a: Date, b: Date) {
	return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/** Formats tab labels as M/D when selected, otherwise uses fallback. */
export function formatTabLabel(d: Date | null, fallback: string) {
	return d ? `${d.getMonth() + 1}/${d.getDate()}` : fallback;
}

// ─── SVG icons ───────────────────────────────────────────────────────────────

export function IconClose() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M18 6L6 18M6 6l12 12"
				stroke="var(--color-brand-japan-black)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function IconChevronLeft({ muted }: { muted?: boolean }) {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path
				d="M12.5 15L7.5 10L12.5 5"
				stroke={muted ? "var(--color-green-300)" : "var(--color-green-600)"}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function IconChevronRight({ muted }: { muted?: boolean }) {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path
				d="M7.5 15L12.5 10L7.5 5"
				stroke={muted ? "var(--color-green-300)" : "var(--color-green-600)"}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function IconInfo() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
			<path
				d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM9.75 12.75H8.25V8.25H9.75V12.75ZM9.75 6.75H8.25V5.25H9.75V6.75Z"
				fill="var(--color-green-600)"
			/>
		</svg>
	);
}

export function IconSeat({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M14 20H8C7.45 20 6.975 19.8083 6.575 19.425C6.19167 19.025 6 18.55 6 18V8C6 7.71667 6.09167 7.48333 6.275 7.3C6.475 7.1 6.71667 7 7 7C7.28333 7 7.51667 7.1 7.7 7.3C7.9 7.48333 8 7.71667 8 8V18H14C14.2833 18 14.5167 18.1 14.7 18.3C14.9 18.4833 15 18.7167 15 19C15 19.2833 14.9 19.525 14.7 19.725C14.5167 19.9083 14.2833 20 14 20Z
                   M11.5 6C10.95 6 10.475 5.80833 10.075 5.425C9.69167 5.025 9.5 4.55 9.5 4C9.5 3.45 9.69167 2.98333 10.075 2.6C10.475 2.2 10.95 2 11.5 2C12.05 2 12.5167 2.2 12.9 2.6C13.3 2.98333 13.5 3.45 13.5 4C13.5 4.55 13.3 5.025 12.9 5.425C12.5167 5.80833 12.05 6 11.5 6Z
                   M16 21V17H11C10.45 17 9.975 16.8083 9.575 16.425C9.19167 16.025 9 15.55 9 15V9.5C9 8.8 9.24167 8.20833 9.725 7.725C10.2083 7.24167 10.8 7 11.5 7C12.2 7 12.7917 7.24167 13.275 7.725C13.7583 8.20833 14 8.8 14 9.5V14H16C16.55 14 17.0167 14.2 17.4 14.6C17.8 14.9833 18 15.45 18 16V21C18 21.2833 17.9 21.525 17.7 21.725C17.5167 21.9083 17.2833 22 17 22C16.7167 22 16.475 21.9083 16.275 21.725C16.0917 21.525 16 21.2833 16 21Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function IconChevronDown({ className }: { className?: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			aria-hidden="true"
			className={className}
		>
			<path
				d="M5 7.5L10 12.5L15 7.5"
				stroke="var(--color-brand-japan-black)"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/** Returns tabbable/focusable descendants for focus-trap style keyboard handling. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(
		container.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)
	).filter((el) => !el.hasAttribute("disabled"));
}
