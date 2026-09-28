"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { FieldDescription, FieldTitle, FieldWrapper } from "./field";
import Icon from "./icon";

// ─── InputNumber (base stepper) ────────────────────────────────────────────

export interface InputNumberProps {
	value?: number;
	defaultValue?: number;
	min?: number;
	max?: number;
	onChange?: (value: number) => void;
	className?: string;
	disabled?: boolean;
}

const InputNumber = React.forwardRef<HTMLDivElement, InputNumberProps>(
	(
		{
			value: controlledValue,
			defaultValue = 0,
			min = 0,
			max = 9,
			onChange,
			className,
			disabled = false,
		},
		ref,
	) => {
		const [internalValue, setInternalValue] = React.useState(defaultValue);

		const value = controlledValue !== undefined ? controlledValue : internalValue;
		const hasValue = value > 0;

		const handleDecrement = () => {
			if (disabled || value <= min) return;
			const next = Math.max(min, value - 1);
			setInternalValue(next);
			onChange?.(next);
		};

		const handleIncrement = () => {
			if (disabled) return;
			const next = max !== undefined ? Math.min(max, value + 1) : value + 1;
			setInternalValue(next);
			onChange?.(next);
		};

		const isDecrementDisabled = disabled || value <= min;
		const isIncrementDisabled = disabled || (max !== undefined && value >= max);

		return (
			<div
				ref={ref}
				className={cn("flex h-12 w-full items-center justify-center gap-2 p-2", className)}
			>
				{/* Decrement — outline pill */}
				<button
					type="button"
					onClick={handleDecrement}
					disabled={isDecrementDisabled}
					aria-label="Decrease quantity"
					className={cn(
						"flex shrink-0 items-center justify-center rounded-full border border-primary-600 bg-white p-1 cursor-pointer",
						"transition-colors hover:bg-primary-50",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1",
						isDecrementDisabled && "pointer-events-none opacity-50",
					)}
				>
					<Icon name="remove" size={24} color="text-primary-600" />
				</button>

				{/* Numeric value */}
				<div
					className={cn(
						"flex h-8 flex-1 items-center justify-center font-['Inter'] text-xl font-normal leading-5 min-w-8",
						hasValue ? "text-brand-japan-black" : "text-secondary-400",
					)}
					aria-live="polite"
					aria-atomic="true"
				>
					{value}
				</div>

				{/* Increment — filled pill */}
				<button
					type="button"
					onClick={handleIncrement}
					disabled={isIncrementDisabled}
					aria-label="Increase quantity"
					className={cn(
						"flex shrink-0 items-center justify-center rounded-full bg-primary-600 p-1 cursor-pointer",
						"transition-colors hover:bg-primary-700",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1",
						"disabled:pointer-events-none disabled:opacity-50",
					)}
				>
					<Icon name="add" size={24} color="text-white" />
				</button>
			</div>
		);
	},
);

InputNumber.displayName = "InputNumber";

// ─── InputNumberField (labeled row with separator) ─────────────────────────

export interface InputNumberFieldProps extends InputNumberProps {
	label: string;
	description?: string;
}

function InputNumberField({
	label,
	description,
	className,
	...stepperProps
}: InputNumberFieldProps) {
	return (
		<FieldWrapper
			className={cn(
				"flex items-center justify-between gap-4 py-4 px-0 rounded-none border-0 border-b border-base-200",
				className,
			)}
		>
			{/* Left: label + description */}
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<FieldTitle className="text-base font-bold leading-6 text-primary-700">{label}</FieldTitle>
				{description && (
					<FieldDescription className="text-xs text-secondary-700 leading-5">
						{description}
					</FieldDescription>
				)}
			</div>

			{/* Right: stepper — fixed width so it stays compact */}
			<InputNumber className="w-48 shrink-0" {...stepperProps} />
		</FieldWrapper>
	);
}

export { InputNumber, InputNumberField };
