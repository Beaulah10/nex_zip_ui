import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import type { FlightInfoProps } from "@/types/flight-selection/flight-selection.types";

export function FlightInfo({
	departureTime,
	departureCity,
	arrivalTime,
	arrivalCity,
	flightNumber,
	duration,
	previousDayIndicator,
	nextDayIndicator,
	className,
	...props
}: FlightInfoProps) {
	const flightSelectionLabels = useTranslations("flight_selection_page");
	return (
		<div
			className={cn("flight-info flex w-full items-center justify-center gap-4 py-2", className)}
			{...props}
		>
			{/* Departure */}
			<div className="flight-info__departure flex flex-1 flex-col items-center justify-center gap-3">
				<span className="flight-info__time text-4xl text-brand-japan-black leading-14">
					{departureTime}
				</span>
				<span className="flight-info__city text-center text-base-700 text-xs leading-5">
					{departureCity}
				</span>
			</div>

			{/* Middle — flight number · icon/dividers · duration */}
			<div className="flight-info__middle flex flex-1 flex-col items-center justify-center gap-2.5">
				<span className="flight-info__flight-number text-base-700 text-xs leading-3">
					{flightNumber}
				</span>

				{/* Divider line + flight icon */}
				<div className="flight-info__route flex h-4 w-full items-center gap-1">
					<div className="flight-info__line h-px flex-1 bg-base-200" />
					<Icon
						name="flight"
						size={20}
						fill={0}
						wght={400}
						grad={0}
						opsz={20}
						className="rotate-90 text-primary-600"
					/>
					<div className="flight-info__line h-px flex-1 bg-base-200" />
				</div>

				<span className="flight-info__duration text-base-700 text-xs leading-3">{duration}</span>
			</div>

			{/* Arrival */}
			<div className="flight-info__arrival flex flex-1 flex-col items-center justify-center gap-3">
				<div className="flight-info__arrival-time-wrapper flex items-baseline gap-0.5">
					<span className="flight-info__time text-4xl text-brand-japan-black leading-14">
						{arrivalTime}
					</span>

					{previousDayIndicator && (
						<span className="flight-info__day-offset text-brand-japan-black text-xs leading-5">
							{flightSelectionLabels("previous_day_indicator_label")}
						</span>
					)}

					{nextDayIndicator && (
						<span className="flight-info__day-offset text-brand-japan-black text-xs leading-5">
							{flightSelectionLabels("next_day_indicator_label")}
						</span>
					)}
				</div>
				<span className="flight-info__city text-center text-base-700 text-xs leading-5">
					{arrivalCity}
				</span>
			</div>
		</div>
	);
}
