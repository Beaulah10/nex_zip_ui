"use client";

import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import type * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useBackNavigation } from "@/modules/hooks/common/back-navigation/use-back-navigation";
import { getAirportDisplayName, getConnectingAirportRoutes } from "@/modules/utils/helpers/airport";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import { useAppSelector } from "@/store/hooks";
import {
	selectConfirmedTotalAmount,
	selectFlightSearchRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";
import { selectCommittedPassengerSelectionsTotalValue } from "@/store/slices/passenger/passenger.slice";
import type { FlightMenuBarProps, RouteSegment } from "@/types/common/flight-menu-bar.types";

export function FlightMenuBar({ className, ...props }: FlightMenuBarProps) {
	const flightSearchRequest = useAppSelector(selectFlightSearchRequest);
	const confirmedTotalAmount = useAppSelector(selectConfirmedTotalAmount);
	const committedTotalAmount = useAppSelector(selectCommittedPassengerSelectionsTotalValue);
	const totalAmount = committedTotalAmount ?? confirmedTotalAmount;
	const handleBackButton = useBackNavigation();
	const formatCalendarSelectionDate = useCallback((date: Date) => {
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}, []);
	const routesParam = flightSearchRequest?.routes ?? "";
	const departureDateFrom = flightSearchRequest?.departureDateFrom;
	const departureDateTo = flightSearchRequest?.departureDateTo;
	const airports = routesParam?.split(",") ?? [];
	const barRef = useRef<HTMLDivElement>(null);
	let routes: RouteSegment[] = [];

	useEffect(() => {
		const header = document.querySelector("header");
		const bar = barRef.current;
		const css = document.documentElement.style;

		const observer = new ResizeObserver(() => {
			const hh = header?.getBoundingClientRect().height ?? 72;
			const bh = bar?.getBoundingClientRect().height ?? 0;
			css.setProperty("--header-height", `${hh}px`);
			css.setProperty("--fixed-bars-height", `${hh + bh}px`);
		});

		if (header) observer.observe(header);
		if (bar) observer.observe(bar);

		return () => observer.disconnect();
	}, []);

	routes = getConnectingAirportRoutes(airports, !!departureDateTo);

	const dateRange = departureDateFrom
		? departureDateTo
			? `${formatCalendarSelectionDate(new Date(departureDateFrom))} - ${formatCalendarSelectionDate(new Date(departureDateTo))}`
			: formatCalendarSelectionDate(new Date(departureDateFrom))
		: "";

	const price = formatPrice(totalAmount ?? 0);

	return (
		<nav
			ref={barRef}
			className={cn("fixed z-11 w-full bg-base-100", className)}
			style={{ top: "var(--header-height, 72px)" }}
			{...props}
		>
			<div className="flex items-center gap-4 overflow-hidden px-4 py-4 md:px-20 md:py-2">
				<div className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-4 md:px-4 md:py-2.5">
					<button
						type="button"
						aria-label="arrow_back"
						className="hidden h-6 w-6 cursor-pointer items-center justify-center md:flex"
						onClick={handleBackButton}
					>
						<Icon
							name="arrow_back"
							size={24}
							fill={1}
							wght={400}
							grad={0}
							opsz={20}
							color="text-base-900"
						/>
					</button>
					{routes.map((route) => (
						<div
							key={`${route.origin}-${route.destination}`}
							className="flex flex-col gap-0.5 md:flex-row"
						>
							<div className="flex flex-row items-center gap-1">
								<span className="font-bold text-secondary-700 text-xs leading-5 md:text-sm md:leading-6">
									{getAirportDisplayName(route.origin)}
								</span>
								<span className="font-normal text-secondary-700 text-xs leading-5 md:text-sm md:leading-6">
									-
								</span>
								<span className="font-bold text-secondary-700 text-xs leading-5 md:text-sm md:leading-6">
									{getAirportDisplayName(route.destination)}
								</span>
							</div>
							{route.via?.length ? (
								<span className="font-bold text-secondary-700 text-xs leading-5 md:pl-4 md:text-sm md:leading-6">
									Via {route.via.map((airport) => getAirportDisplayName(airport)).join(", ")}
								</span>
							) : null}
						</div>
					))}
					<div className="hidden h-6 w-px shrink-0 self-stretch bg-gray-300 md:block" />
					<span className="shrink-0 text-secondary-700 text-xs leading-5.25 md:text-sm">
						{dateRange}
					</span>
				</div>
				<div className="block w-px shrink-0 self-stretch bg-gray-300 md:hidden" />
				<div className="flex shrink-0 flex-col items-center gap-0.5 md:flex-row md:gap-4">
					<span className="font-bold text-lg text-primary-700 leading-7 md:text-[20px] md:text-xl md:leading-8">
						{price}
					</span>

					<button
						type="button"
						className="flex h-6 items-center gap-1 rounded-lg text-brand-japan-black text-sm leading-6 transition-colors hover:text-primary-700"
					>
						Summary
						<Icon name="arrow_drop_down" size={20} color="text-primary-600" />
					</button>
				</div>
			</div>
		</nav>
	);
}

/* ── FixedBarsContent ────────────────────────────────────────────────────── */
/* Consumes --fixed-bars-height (set by FlightMenuBar) so the page content   */
/* always clears both the header and the menu bar at any screen size.        */

export function FixedBarsContent({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={className} style={{ paddingTop: "var(--fixed-bars-height, 120px)" }}>
			{children}
		</div>
	);
}
