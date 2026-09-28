/**
 * File: baggage-counter-card.tsx
 * Description: Component that displays a baggage counter card with increment and decrement functionality.
 */

"use client";
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import * as React from "react";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type {
	BaggageCounterProps,
	CounterCardProps,
} from "@/types/baggage-selection/baggage-selection.types";

const BaggageCounter = React.forwardRef<HTMLDivElement, BaggageCounterProps>(
	(
		{
			value: controlledValue,
			defaultValue = 0,
			min = 0,
			onChange,
			className,
			disabled = false,
			incrementDisabled,
		},
		ref
	) => {
		const baggageServiceLabels = useTranslations("baggage_service");
		const [internalValue, setInternalValue] = React.useState(defaultValue);

		const isControlled = controlledValue !== undefined;
		const value = isControlled ? controlledValue : internalValue;

		const handleChange = (nextValue: number) => {
			if (!isControlled) {
				setInternalValue(nextValue);
			}

			onChange?.(nextValue);
		};

		const handleDecrement = () => {
			if (disabled || value <= min) {
				return;
			}

			handleChange(Math.max(min, value - 1));
		};

		const handleIncrement = () => {
			if (disabled || incrementDisabled) {
				return;
			}

			handleChange(value + 1);
		};

		return (
			<div ref={ref} className={cn("flex w-27.5 shrink-0 items-center gap-2 py-0.5", className)}>
				<Button
					type="button"
					variant="primary"
					size="icon-xs"
					outline
					aria-label={baggageServiceLabels("aria_labels.label_decrease_quantity")}
					disabled={disabled || value <= min}
					onClick={handleDecrement}
					className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
				>
					<Icon name="remove" size={20} color="text-primary-700" />
				</Button>

				<span
					role="status"
					aria-live="polite"
					aria-atomic="true"
					aria-label={baggageServiceLabels("aria_labels.selected_amount", { value })}
					className={cn(
						"flex-1 text-center font-medium text-xl leading-8",
						value > 0 ? "text-brand-japan-black" : "text-base-400"
					)}
				>
					{value}
				</span>

				<Button
					type="button"
					variant="primary"
					size="icon-xs"
					aria-label={baggageServiceLabels("aria_labels.label_increase_quantity")}
					disabled={disabled || incrementDisabled}
					onClick={handleIncrement}
					className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700"
				>
					<Icon name="add" size={20} color="text-white" />
				</Button>
			</div>
		);
	}
);

BaggageCounter.displayName = "BaggageCounter";

function CounterCard({
	icon,
	label,
	description,
	price,
	count,
	min = 0,
	incrementDisabled,
	disabled,
	onChange,
	className,
}: CounterCardProps) {
	const selected = count > 0;

	const textColorClass = disabled ? "text-base-400" : "text-primary-700";

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-3 rounded-lg border p-4 md:px-4 md:py-5",
				"md:min-h-19 md:flex-row md:items-center md:justify-between",
				selected ? "border-info-600 bg-green-50" : "border-base-300 bg-white",
				disabled && "cursor-not-allowed has-disabled:border-base-300 has-disabled:bg-base-50",
				className
			)}
		>
			<div className="flex min-w-0 items-start gap-2">
				<Icon name={icon} fill={1} className={cn("shrink-0")} color={textColorClass} />

				<div className="min-w-0 flex-1">
					<span
						className={cn(
							"block break-words font-bold text-base leading-6",
							disabled ? "text-base-400" : "font-bold text-brand-japan-black"
						)}
					>
						{label}
					</span>

					{description && <span className="text-primary-700 text-xs leading-5">{description}</span>}
				</div>
			</div>

			<div className="ml-auto flex items-center gap-4 self-end md:self-auto">
				<span
					className={cn(
						"shrink-0 font-bold text-2xl leading-8",
						disabled ? "text-base-400" : "text-primary-700"
					)}
				>
					{formatPrice(price)}
				</span>

				<div className="h-8 w-px bg-base-300" />

				<BaggageCounter
					value={count}
					min={min}
					incrementDisabled={incrementDisabled}
					disabled={disabled}
					onChange={onChange}
				/>
			</div>
		</div>
	);
}

export { BaggageCounter, CounterCard };
