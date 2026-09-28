"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

import { cn } from "../lib/utils";
import Icon from "./icon";

const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
	return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

interface RadioGroupItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
	label?: string;
	indicator?: "dot" | "check";
}

const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	RadioGroupItemProps
>(({ className, label, id, indicator = "dot", ...props }, ref) => {
	const generatedId = React.useId();
	const itemId = id ?? generatedId;

	const circle = (
		<RadioGroupPrimitive.Item
			ref={ref}
			className={cn(
				//basic
				"aspect-square size-4 shrink-0 rounded-full border text-primary shadow-xs outline-none transition-[color,box-shadow]-800 cursor-pointer",
				//disabled
				// disabled
				"disabled:cursor-not-allowed",
				"disabled:border-gray-400",
				"disabled:bg-gray-300",
				//dark
				"dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
				//aria invalid
				"aria-invalid:border-danger-600 aria-invalid:ring-danger-600 aria-invalid:data-[state=checked]:border-danger-600 aria-invalid:data-[state=checked]:bg-danger-600",
				//focus
				"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
				// Default state
				"border-base-300 bg-base-50",
				// Checked state (green circle)
				"data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600",
				// Focus styles
				"focus-visible:ring-2 focus-visible:ring-green-400",
				className,
			)}
			id={itemId}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
				{indicator === "check" ? (
					<Icon name="check" size={12} color="text-white" />
				) : (
					<span className="size-1.5 rounded-full bg-white" />
				)}
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);

	// If no label, just return the circle
	if (!label) {
		return circle;
	}

	// If label provided, wrap in container like RadioGroupBorderedItem but without border
	return (
		<div className="flex cursor-pointer select-none items-center gap-2 transition-colors">
			{circle}
			<label
				htmlFor={itemId}
				className="font-medium text-brand-japan-black text-sm leading-6 cursor-pointer"
			>
				{label}
			</label>
		</div>
	);
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

interface RadioGroupBorderedItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
	label: string;
}

const RadioGroupBorderedItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	RadioGroupBorderedItemProps
>(({ className, label, id, ...props }, ref) => {
	const generatedId = React.useId();
	const itemId = id ?? generatedId;

	return (
		<label
			htmlFor={itemId}
			className={cn(
				"flex cursor-pointer select-none items-center gap-2 px-4 py-2 h-11 transition-colors",
				"rounded-[0.5rem] border bg-white",
				// ── Default (no aria-invalid) ──
				"border-base-300",
				// "has-data-[state=checked]:border-2 has-data-[state=checked]:border-primary-600 focus-within:border-2 focus-within:border-primary-600",

				// ── Parent has aria-invalid ──
				"has-[button[aria-invalid=true]]:border-destructive has-[button[aria-invalid=true]]:border-danger-600 has-[button[aria-invalid=true]]:focus-within:border-2 has-[button[aria-invalid=true]]:focus-within:border-primary-600",

				// ── Hover states ──
				"hover:bg-base-50",
				"[aria-invalid=true]:hover:border-error-400 [aria-invalid=true]:hover:bg-base-50",

				// ── Disabled ──
				"has-disabled:cursor-not-allowed",
				"has-disabled:bg-white",
				"has-disabled:border-base-300",
				className,
			)}
		>
			<RadioGroupItem id={itemId} ref={ref} {...props} />
			<span
				className={cn(
					"flex w-full font-medium text-base leading-6",
					props.disabled
						? "text-base-500 cursor-not-allowed"
						: "text-brand-japan-black cursor-pointer",
				)}
			>
				{label}
			</span>
		</label>
	);
});
RadioGroupBorderedItem.displayName = "RadioGroupBorderedItem";

export { RadioGroup, RadioGroupBorderedItem, RadioGroupItem };
