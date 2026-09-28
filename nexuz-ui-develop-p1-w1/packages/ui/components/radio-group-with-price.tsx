"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import { cn } from "../lib/utils";
import Icon from "./icon";
import { RadioGroup } from "./radio-group";

export interface RadioGroupWithPriceItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
	icon: string;
	label: string;
	price: string;
	description?: string;
	currency?: string;
}

const RadioGroupWithPriceItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	RadioGroupWithPriceItemProps
>(({ className, icon, label, price, currency = "¥", id, description, disabled, ...props }, ref) => {
	const generatedId = React.useId();
	const itemId = id ?? generatedId;

	return (
		<label
			htmlFor={itemId}
			className={cn(
				"flex w-full cursor-pointer justify-center flex-col gap-1 rounded-lg border px-4 py-5 transition-colors md:max-w-[300px]",
				"border-base-300 bg-white hover:border-base-400",
				"has-data-[state=checked]:border-info-600 has-data-[state=checked]:bg-green-50",
				disabled &&
					"cursor-not-allowed has-disabled:border-base-300 has-disabled:bg-base-50 has-disabled:has-data-[state=checked]:border-base-300 has-disabled:has-data-[state=checked]:bg-base-50",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="flex items-center gap-2">
					<RadioGroupPrimitive.Item
						aria-label={label}
						ref={ref}
						id={itemId}
						disabled={disabled}
						className={cn(
							"flex aspect-square size-5 shrink-0 items-center justify-center rounded-full border border-base-300 bg-base-50 outline-none transition-colors",
							"focus-visible:ring-2 focus-visible:ring-green-400",
							"data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700",
							"disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-400 disabled:data-[state=checked]:bg-base-300 disabled:data-[state=checked]:border-base-400 disabled:data-[state=unchecked]:bg-base-300 disabled:data-[state=unchecked]:border-base-400",
						)}
						{...props}
					>
						<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
							<Icon name="check" size={20} color="text-white" />
						</RadioGroupPrimitive.Indicator>
					</RadioGroupPrimitive.Item>

					<Icon
						name={icon}
						fill={1}
						color={disabled ? "text-base-400" : "text-primary-700"}
						className={`shrink-0 ${disabled ? "text-base-400" : "text-primary-700"}`}
					/>

					<div className="flex flex-col">
						<span
							className={`break-words font-bold text-base leading-6 ${
								disabled ? "text-base-400" : "text-brand-japan-black"
							}`}
						>
							{label}
						</span>

						{description && (
							<span
								className={`text-xs leading-5 ${disabled ? "text-base-400" : "text-primary-700"}`}
							>
								{description}
							</span>
						)}
					</div>
				</span>

				<span
					className={`shrink-0 ${disabled ? "text-base-400" : "font-bold  text-primary-700"} text-2xl leading-9`}
				>
					{price}
				</span>
			</div>
		</label>
	);
});
RadioGroupWithPriceItem.displayName = "RadioGroupWithPriceItem";

export { RadioGroup as RadioGroupWithPrice, RadioGroupWithPriceItem };
