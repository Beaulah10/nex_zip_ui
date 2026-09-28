"use client";

import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
import { Input } from "@repo/ui/components/input";
import type * as React from "react";
import { cn } from "../lib/utils";

export type DimensionUnit = "cm" | "kg" | "week";

export interface DimensionInputProps
	extends Omit<React.ComponentProps<"input">, "type" | "size" | "min" | "max"> {
	/** Active unit — "cm" (default), "kg", or "week" */
	unit?: DimensionUnit;
	/**
	 * Called when the unit button is clicked.
	 * When provided the button is interactive and cycles cm ↔ kg.
	 * When omitted the button is display-only.
	 */
	onUnitChange?: (unit: DimensionUnit) => void;
	/** Show/hide the unit suffix button */
	showUnit?: boolean;
	/** Minimum allowed value (default: 0) */
	min?: number;
	/** Maximum allowed value (default: 9999) */
	max?: number;
	/** Extra classes applied to the ButtonGroup wrapper (e.g. to override width) */
	buttonGroupClassName?: string;
}

function DimensionInput({
	unit = "cm",
	onUnitChange,
	showUnit = true,
	className,
	value,
	defaultValue,
	min = 0,
	max = 9999,
	buttonGroupClassName,
	...props
}: DimensionInputProps) {
	const isControlled = value !== undefined;
	const nextUnit: DimensionUnit = unit === "cm" ? "kg" : "cm";

	const inputEl = (
		<Input
			inputMode="decimal"
			inputSize="md"
			{...(isControlled ? { value } : { defaultValue: defaultValue ?? 0 })}
			className={cn("flex-1", showUnit && "rounded-r-none", className)}
			{...props}
		/>
	);

	if (!showUnit) {
		return inputEl;
	}

	return (
		<ButtonGroup className={cn(buttonGroupClassName)}>
			{inputEl}

			<Button
				type="button"
				variant="base"
				outline
				aria-label={
					onUnitChange && unit !== "week"
						? `Unit: ${unit}. Click to switch to ${nextUnit}`
						: `Unit: ${unit}`
				}
				onClick={onUnitChange && unit !== "week" ? () => onUnitChange(nextUnit) : undefined}
				className={cn(
					// Match Figma suffix: base-50 background, primary-700 bold text, 16px
					"h-auto min-h-10 self-stretch border-l-0 px-4 py-1 text-base font-bold leading-6",
					"bg-base-50 text-primary-700",
					// Non-interactive when no handler is provided
					(!onUnitChange || unit === "week") && "cursor-default pointer-events-none select-none",
				)}
			>
				{unit}
			</Button>
		</ButtonGroup>
	);
}

export { DimensionInput };
