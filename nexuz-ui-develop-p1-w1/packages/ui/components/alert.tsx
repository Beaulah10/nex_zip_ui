import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";
import Icon from "./icon";

const alertVariants = cva("flex flex-col gap-3 rounded-lg p-4", {
	variants: {
		variant: {
			default: "bg-info-100 text-info-800",
			info: "bg-info-100 text-info-800",
			success: "bg-success-100 text-success-800",
			warning: "bg-warning-100 text-warning-800",
			error: "bg-danger-100 text-danger-800",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const variantIconMap: Record<string, string> = {
	default: "info",
	info: "info",
	success: "check_circle",
	warning: "warning",
	error: "error",
};

function Alert({
	className,
	variant = "default",
	icon = true,
	children,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & { icon?: boolean }) {
	const childArray = React.Children.toArray(children);
	const actionChild = childArray.find(
		(child) => React.isValidElement(child) && child.type === AlertAction,
	);
	const bodyChildren = childArray.filter(
		(child) => !React.isValidElement(child) || child.type !== AlertAction,
	);

	const iconName = variantIconMap[variant ?? "default"] ?? "info";

	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		>
			<div className="flex items-start gap-2">
				{icon && (
					<div className="flex items-center p-0.5">
						<Icon
							name={iconName}
							size={20}
							fill={1}
							wght={400}
							grad={0}
							opsz={20}
							color=""
							className="text-current"
						/>
					</div>
				)}
				<div className="flex flex-1 flex-col gap-1">{bodyChildren}</div>
			</div>
			{actionChild && <div className="flex w-full justify-end">{actionChild}</div>}
		</div>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn("text-sm font-bold leading-6", className)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"text-sm font-normal leading-6 [&_a]:underline [&_a]:underline-offset-3",
				className,
			)}
			{...props}
		/>
	);
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="alert-action" className={cn("flex justify-end", className)} {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
