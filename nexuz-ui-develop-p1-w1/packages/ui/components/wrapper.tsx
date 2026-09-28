import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "../lib/utils";

const wrapperVariants = cva("w-auto h-auto", {
	variants: {
		bg: {
			white: "bg-white",
			"gray-1": "bg-gray-50",
			"gray-2": "bg-gray-100",
			"gray-3": "bg-gray-200",
			"gray-4": "bg-gray-300",
		},
		border: {
			default: "border border-gray-300",
			none: "border-0",
		},
		padding: {
			none: "p-0",
			sm: "p-3",
			default: "md:p-6 p-4",
			lg: "p-8",
			xl: "p-12",
		},
	},
	defaultVariants: {
		padding: "default",
		border: "default",
	},
});

export type WrapperVariants = VariantProps<typeof wrapperVariants>;

export interface WrapperProps extends React.HTMLAttributes<HTMLDivElement>, WrapperVariants {
	asChild?: boolean;
}

const Wrapper = React.forwardRef<HTMLDivElement, WrapperProps>(
	({ className, bg, padding, border, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : "div";

		return (
			<Comp
				ref={ref}
				data-slot="wrapper"
				className={cn(wrapperVariants({ bg, padding, border, className }))}
				{...props}
			/>
		);
	},
);

Wrapper.displayName = "Wrapper";

export { Wrapper, wrapperVariants };
