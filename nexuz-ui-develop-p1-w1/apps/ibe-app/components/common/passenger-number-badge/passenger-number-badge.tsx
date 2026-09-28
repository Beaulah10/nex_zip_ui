import { cn } from "@repo/ui/lib";

type PassengerNumberBadgeProps = { number: string | number; className?: string };

/** Circular numbered badge (teal green) used as passenger index indicator */
export const PassengerNumberBadge = ({ number, className }: PassengerNumberBadgeProps) => (
	<span
		aria-hidden="true"
		className={cn(
			"flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 font-bold text-2xl text-white leading-9",
			className
		)}
	>
		{number}
	</span>
);
