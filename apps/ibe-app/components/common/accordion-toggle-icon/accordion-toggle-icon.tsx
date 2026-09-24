/**
 * File: accordion-toggle-icon.tsx
 * Description: Reusable accordion toggle icon component that provides a consistent
 * expand and collapse indicator across confirmation page accordions. Supports
 * customizable sizing and styling while automatically reflecting accordion state.
 */
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";

import type { AccordionToggleIconProps } from "@/types/confirmation/confirmation.types";

/** Shared expand/collapse indicator used across the confirmation screen. */
export function AccordionToggleIcon({
	className,
	iconClassName,
	iconSize = 24,
	wrapperClassName,
}: AccordionToggleIconProps) {
	const icon = (
		<Icon
			name="expand_less"
			size={iconSize}
			className={cn(
				"text-primary-700 transition-transform group-data-[state=closed]:rotate-180",
				iconClassName,
				className
			)}
		/>
	);

	if (!wrapperClassName) return icon;

	return <span className={cn("shrink-0", wrapperClassName)}>{icon}</span>;
}
