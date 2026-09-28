"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

import { cn } from "../lib/utils";
import Icon from "./icon";
import { RadioGroup } from "./radio-group";

export interface RadioCheckGroupWithPriceItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
	label: string;
	price: number;
	originalPrice?: number;
	currency?: string;
}

const RadioCheckGroupWithPriceItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	RadioCheckGroupWithPriceItemProps
>(({ className, label, price, originalPrice, currency = "¥", id, disabled, ...props }, ref) => {
	const generatedId = React.useId();
	const itemId = id ?? generatedId;

	return (
		<label
			htmlFor={itemId}
			className={cn(
				"flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
				"border-base-300 bg-white hover:border-base-400",
				"has-data-[state=checked]:border-info-600 has-data-[state=checked]:bg-green-50",
				disabled && "cursor-not-allowed has-disabled:border-base-300 has-disabled:bg-base-50",
				className,
			)}
		>
			<span className="text-base text-brand-japan-black leading-6">{label}</span>
			<span className="flex items-center gap-4">
				<span className="flex items-center gap-2">
					{originalPrice !== undefined && (
						<span className="font-bold text-base text-base-400 leading-6 line-through">
							{currency}
							{originalPrice.toLocaleString()}
						</span>
					)}
					<span className="font-bold text-base text-primary-700 leading-6">
						{currency}
						{price.toLocaleString()}
					</span>
				</span>
				<RadioGroupPrimitive.Item
					ref={ref}
					id={itemId}
					disabled={disabled}
					className={cn(
						"flex aspect-square size-5 shrink-0 items-center justify-center rounded-full border border-base-300 bg-base-50 outline-none transition-colors",
						"focus-visible:ring-2 focus-visible:ring-green-400",
						"data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700",
						"disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-100",
					)}
					{...props}
				>
					<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
						<Icon name="check" size={20} color="text-white" />
					</RadioGroupPrimitive.Indicator>
				</RadioGroupPrimitive.Item>
			</span>
		</label>
	);
});
RadioCheckGroupWithPriceItem.displayName = "RadioCheckGroupWithPriceItem";

export { RadioCheckGroupWithPriceItem, RadioGroup as RadioCheckGroupWithPrice };
