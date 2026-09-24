"use client";

import { cn } from "../lib/utils";
import Icon from "./icon";

const CheckCircleIcon = () => <Icon name="check_circle" fill={1} />;

export interface MenuListProps {
	title: string;
	description?: string;
	selected?: boolean;
	empty?: boolean;
	onClick?: () => void;
	className?: string;
}

export function MenuList({
	title,
	description,
	selected = false,
	empty = false,
	onClick,
	className,
}: MenuListProps) {
	return (
		<div
			role="option"
			tabIndex={0}
			aria-selected={selected}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
			className={cn(
				"flex min-h-19 w-full cursor-pointer items-start gap-3 rounded-lg p-3 outline-none transition-colors duration-150",
				// Default
				"bg-white",
				// Hover
				"hover:border-base-300 hover:bg-base-50",
				// Focus-visible (keyboard)
				"focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-0",
				// Selected
				selected &&
					"border-primary-500 bg-primary-100 hover:border-primary-500 hover:bg-primary-100",
				// Empty / placeholder
				empty && "cursor-default opacity-60",
				className,
			)}
		>
			<div className="flex flex-1 flex-col gap-1">
				<span
					className={cn("font-bold text-lg text-primary-700 leading-7", empty && "text-base-400")}
				>
					{title}
				</span>
				{description && (
					<span
						className={cn(
							"font-normal text-base-700 text-xs leading-5 max-w-[15.25rem]",
							empty && "text-base-300",
						)}
					>
						{description}
					</span>
				)}
			</div>

			{selected && (
				<div className="size-6 shrink-0 self-center">
					<CheckCircleIcon />
				</div>
			)}
		</div>
	);
}
