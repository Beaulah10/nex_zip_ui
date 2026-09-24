import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/utils";

const buttonVariants = cva(
	"inline-flex h-13.5 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				primary:
					"bg-primary-600 text-white hover:bg-primary-800 focus-visible:bg-primary-600 focus-visible:text-white focus-visible:ring-primary-300 disabled:bg-primary-disabled",
				secondary:
					"bg-secondary-700 text-primary-foreground hover:bg-secondary-800 focus-visible:bg-secondary-600 focus-visible:ring-secondary-300 disabled:bg-secondary-disabled",
				danger:
					"bg-danger-700 text-primary-foreground hover:bg-danger-800 focus-visible:bg-danger-600 focus-visible:ring-danger-300 disabled:bg-danger-disabled dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
				ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				base: "bg-base-50 text-primary-700 border border-base-300 hover:bg-base-100 focus-visible:bg-base-50 focus-visible:ring-base-300 disabled:bg-base-disabled",
			},
			outline: {
				true: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
				false: "",
			},
			size: {
				xs: "h-8 gap-2 rounded-md px-3 py-1.5 text-xs leading-5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-9 gap-2 rounded-md px-5 py-1.5 text-sm leading-6 [&_svg:not([class*='size-'])]:size-3",
				md: "h-10 gap-2 rounded-md px-5 py-2 text-sm leading-6 [&_svg:not([class*='size-'])]:size-3",
				base: "h-11 gap-2 rounded-md px-5 py-2.5 text-base leading-6 [&_svg:not([class*='size-'])]:size-5",
				lg: "h-12 gap-2 rounded-md px-5 py-3 text-base leading-6 [&_svg:not([class*='size-'])]:size-5",
				xl: "h-13 gap-2 rounded-md px-5 py-3.5 text-base leading-6 [&_svg:not([class*='size-'])]:size-5",
				icon: "size-9",
				"icon-xs": "size-5 rounded-md [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		compoundVariants: [
			{
				variant: "primary",
				outline: true,
				class:
					"border-primary-700 bg-transparent text-primary-700 hover:bg-primary-800 hover:text-primary-foreground",
			},
			{
				variant: "secondary",
				outline: true,
				class:
					"border-secondary-700 bg-transparent text-secondary-700 hover:bg-secondary-800 hover:text-primary-foreground",
			},
			{
				variant: "danger",
				outline: true,
				class:
					"border-danger-700 bg-transparent text-danger-700 hover:bg-danger-800 hover:text-primary-foreground",
			},
			{
				variant: "base",
				outline: true,
				class: "border-base-300 bg-transparent text-primary-700",
			},
		],
		defaultVariants: {
			variant: "primary",
			size: "md",
			outline: false,
		},
	},
);

function Button({
	className,
	variant = "primary",
	size = "md",
	outline = false,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, outline, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
