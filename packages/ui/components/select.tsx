"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/utils";
import Icon from "./icon";

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			className={cn("divide-y divide-gray-100", className)}
			{...props}
		/>
	);
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

const selectTriggerVariants = cva("", {
	variants: {
		selectSize: {
			sm: "h-8 px-2 py-1 text-sm",
			md: "h-11 px-3 py-1 text-md",
			lg: "h-12.5 px-4 py-1 text-lg",
		},
	},
	defaultVariants: {
		selectSize: "md",
	},
});

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> &
	VariantProps<typeof selectTriggerVariants>;

function SelectTrigger({ className, selectSize = "sm", children, ...props }: SelectTriggerProps) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={selectSize}
			className={cn(
				"flex w-fit items-center justify-between gap-2 whitespace-nowrap rounded-md border border-base-300 bg-white px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] data-[size=default]:h-9 data-[size=sm]:h-8 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				// focus
				"focus-visible:border-2 focus-visible:border-primary-600",
				// aria invalid
				"aria-invalid:border-danger-600 aria-invalid:focus-visible:border-2 aria-invalid:focus-visible:border-primary-800",
				// disabled
				"placeholder:text-base-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:placeholder:text-base-300",
				selectTriggerVariants({ selectSize }),
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	position = "item-aligned",
	align = "center",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				className={cn(
					"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 relative z-50 min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-hidden rounded-lg bg-white text-base-900 shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in",
					position === "popper" &&
						"data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				align={align}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"py-1 overflow-y-auto max-h-[var(--radix-select-content-available-height)]",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn("px-4 py-2 text-xs text-muted-foreground", className)}
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex h-10 w-full cursor-default select-none items-center gap-3 px-4 py-2 text-sm font-medium leading-6 outline-hidden",
				"text-base-900",
				"focus:bg-gray-100 focus:text-base-900 focus:outline-none",
				"data-[state=checked]:text-primary-700",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				"first:rounded-t-lg",
				"last:rounded-b-lg",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<span className="ml-auto flex shrink-0 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<Icon name="check_circle" size={24} fill={1} color="text-primary-700" />
				</SelectPrimitive.ItemIndicator>
			</span>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn("pointer-events-none -mx-1 my-1 h-px bg-gray-100", className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn("flex cursor-default items-center justify-center py-1", className)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn("flex cursor-default items-center justify-center py-1", className)}
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
