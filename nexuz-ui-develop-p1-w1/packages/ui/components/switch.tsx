import * as React from "react";

import { cn } from "../lib/utils";

const Switch = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> & {
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	}
>(({ className, checked = false, onCheckedChange, onClick, type = "button", ...props }, ref) => {
	return (
		<button
			ref={ref}
			type={type}
			role="switch"
			aria-checked={checked}
			className={cn(
				"inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-50",
				checked ? "bg-primary-600" : "bg-base-200",
				className,
			)}
			onClick={(event) => {
				onCheckedChange?.(!checked);
				onClick?.(event);
			}}
			{...props}
		>
			<span
				aria-hidden="true"
				className={cn(
					"block size-5 rounded-full border border-base-300 bg-white transition-transform",
					checked ? "translate-x-5" : "translate-x-0",
				)}
			/>
		</button>
	);
});
Switch.displayName = "Switch";

export { Switch };
