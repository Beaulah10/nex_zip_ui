/**
 * File: flight-itinerary-card.tsx
 * Description: Displays a summarized view of a flight itinerary leg, including departure and arrival
 * airport details, travel schedule, flight duration, and flight number information.
 * Used on the booking confirmation page to help passengers review selected flight segments.
 */
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { forwardRef } from "react";
import type { FlightItineraryCardProps } from "@/types/confirmation/confirmation.types";

/** Flight leg summary card used to review itinerary details before confirming a booking. */
export const FlightItineraryCard = forwardRef<HTMLDivElement, FlightItineraryCardProps>(
	(
		{
			departureAirportCode,
			departureAirportName,
			arrivalAirportCode,
			arrivalAirportName,
			departureTime,
			departureDate,
			arrivalTime,
			arrivalDate,
			duration,
			legLabel,
			flightNumber,
			className,
			...props
		},
		ref
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flight-itinerary-card flex w-full flex-col gap-4 rounded-lg border border-base-300 bg-white p-4",
					className
				)}
				{...props}
			>
				<div className="flight-itinerary-card__airports flex items-start justify-between gap-4">
					<div className="flight-itinerary-card__departure-airport flex min-w-0 flex-col items-start gap-1">
						<span className="font-bold text-2xl text-brand-japan-black leading-9">
							{departureAirportCode}
						</span>
						<span className="text-base-700 text-sm leading-6">({departureAirportName})</span>
					</div>
					<div className="flight-itinerary-card__arrival-airport flex min-w-0 flex-col items-end gap-1 text-right">
						<span className="font-bold text-2xl text-brand-japan-black leading-9">
							{arrivalAirportCode}
						</span>
						<span className="text-base-700 text-sm leading-6">({arrivalAirportName})</span>
					</div>
				</div>

				<div className="flight-itinerary-card__schedule grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 sm:flex sm:gap-10">
					<div className="flight-itinerary-card__departure flex min-w-0 flex-col items-start gap-1">
						<span className="font-bold text-2xl text-brand-japan-black leading-9 sm:text-3xl sm:leading-12">
							{departureTime}
						</span>
						<span className="font-bold text-primary-700 text-sm leading-6 sm:text-base">
							{departureDate}
						</span>
					</div>

					<div className="flight-itinerary-card__route flex flex-1 flex-col items-center gap-1 pt-3.5">
						<div className="flight-itinerary-card__route-line flex w-full items-center">
							<Icon name="flight" size={24} className="shrink-0 rotate-90 text-primary-700" />
							<span className="relative h-px flex-1 bg-primary-700">
								<span className="absolute top-1/2 right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-700" />
							</span>
						</div>
						<span className="text-center text-primary-700 text-sm leading-6">{duration}</span>
					</div>

					<div className="flight-itinerary-card__arrival flex min-w-0 flex-col items-end gap-1 text-right">
						<span className="font-bold text-2xl text-brand-japan-black leading-9 sm:text-3xl sm:leading-12">
							{arrivalTime}
						</span>
						<span className="font-bold text-primary-700 text-sm leading-6 sm:text-base">
							{arrivalDate}
						</span>
					</div>
				</div>

				<div className="flight-itinerary-card__badges flex items-center justify-between gap-2">
					<span className="flight-itinerary-card__leg-badge inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-1 text-sm text-white leading-6">
						<svg
							width="6"
							height="6"
							viewBox="0 0 6 6"
							fill="none"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="3" cy="3" r="3" fill="white" />
						</svg>
						{legLabel}
					</span>
					<span className="flight-itinerary-card__flight-number-badge inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-1 text-sm text-white leading-6">
						{flightNumber}
					</span>
				</div>
			</div>
		);
	}
);

FlightItineraryCard.displayName = "FlightItineraryCard";
