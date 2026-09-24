"use client";

import Icon from "@repo/ui/components/icon";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"peer relative flex size-4 shrink-0 items-center justify-center rounded-xs border border-base-300 bg-base-50 outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:data-checked:bg-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
				//aria invalid
				"aria-invalid:border-danger-600 aria-invalid:aria-checked:border-primary aria-invalid:aria-checked:bg-danger-600",
				//data checked
				"data-checked:border-primary-00 data-checked:bg-primary-700 data-checked:text-white",
				//disabled
				"disabled:cursor-not-allowed disabled:border-base-400 disabled:bg-base-300 disabled:opacity-50 group-has-disabled/field:opacity-50 disabled:data-checked:bg-primary-400",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
			>
				{props.checked === "indeterminate" ? (
					<Icon name="check_indeterminate_small" size={14} color="text-base-50" />
				) : (
					<CheckIcon />
				)}
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
