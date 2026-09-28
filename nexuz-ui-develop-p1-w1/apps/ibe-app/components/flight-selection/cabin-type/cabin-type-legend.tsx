import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import type { CabinTypeLegendProps } from "@/types/flight-selection/flight-selection.types";

export function CabinTypeLegend({
	cabinTypes,
	infoText,
	infoLinkText,
	infoLinkHref,
	onInfoLinkClick,
	className,
	...props
}: CabinTypeLegendProps) {
	return (
		<div
			className={cn("cabin-type-legend flex w-full justify-end md:gap-4 md:pr-4", className)}
			{...props}
		>
			{/* Info icon + text + link + cabin types - all right side */}
			{(infoText || infoLinkText) && (
				<div className="cabin-type-legend__info flex items-center justify-center gap-1">
					<Icon
						name="info"
						size={16}
						fill={1}
						wght={400}
						grad={0}
						opsz={20}
						color="text-base-600"
						className="shrink-0"
					/>
					<div className="cabin-type-legend__info-text-group flex items-center gap-1">
						{infoText && (
							<span className="cabin-type-legend__info-text whitespace-nowrap font-medium text-base-700 text-xs leading-5">
								{infoText}
							</span>
						)}
						{infoLinkText && (
							<a
								href={infoLinkHref}
								target="_blank"
								onClick={onInfoLinkClick}
								className="cabin-type-legend__info-link whitespace-nowrap text-primary-700 text-xs leading-5 underline underline-offset-2 transition-colors hover:text-primary-700"
								rel="noopener"
							>
								{infoLinkText}
							</a>
						)}
					</div>
				</div>
			)}

			{/* Cabin type items */}
			{cabinTypes.map((cabin) => (
				<div
					key={cabin.label}
					className={cn(
						"cabin-type-legend__item hidden min-w-[15.4375rem] items-center justify-center gap-2 whitespace-nowrap bg-base-50 py-2 md:flex"
					)}
				>
					<Icon
						name={cabin.icon ?? "airline_seat_recline_extra"}
						size={30}
						fill={1}
						wght={400}
						grad={0}
						opsz={24}
						color="text-primary-700"
						className="shrink-0"
					/>
					<span className="cabin-type-legend__label font-semibold text-primary-700 text-xl leading-8">
						{cabin.label}
					</span>
				</div>
			))}
		</div>
	);
}
