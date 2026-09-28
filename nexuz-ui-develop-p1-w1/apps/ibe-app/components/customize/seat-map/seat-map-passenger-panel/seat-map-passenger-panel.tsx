/**
 * File: seat-map-passenger-panel.tsx
 * Description: Renders the passenger selection panel, including assigned seat details, seat legend,
 * bundle information, and seat selection guidance banners.
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { InfantIcon } from "@/assets/images/infant-icon";
import { SeatMapLegend } from "@/components/customize/seat-map/seat-map-legend/seat-map-legend";
import type { SeatCellProps, SeatMapPassengerPanelProps } from "@/types/seat-map/seat-map.types";

function SeatCell({ seatType, seatCode, price, isSelectedRow }: SeatCellProps) {
	if (!seatCode) {
		return (
			<div className="flex h-25 w-18.5 shrink-0 items-center justify-center gap-2 border-base-300 bg-primary-50 py-2">
				<div
					className={cn(
						"size-8 rounded-md border bg-white",
						isSelectedRow ? "border-primary-600" : "border-base-300"
					)}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-25 w-18.5 shrink-0 flex-col items-center justify-center gap-2 border-base-300 bg-primary-50 py-2">
			<span className="text-center text-brand-japan-black text-xs leading-5">{seatType}</span>
			<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-600">
				<span className="text-center font-bold text-sm text-white leading-6">{seatCode}</span>
			</div>
			<span className="text-center font-bold text-primary-700 text-xs leading-5">{price}</span>
		</div>
	);
}

export function SeatMapPassengerPanel({
	flightCode,
	cabinClass,
	activePassengerComplimentaryLegendEligible,
	activePassengerBundleSeatServiceCodes,
	activePassengerSelectedSeatServiceCode,
	bundleInfoMessage,
	legendPrices,
	passengers,
	activePassengerIndex,
	onPassengerSelect,
	adjacentInfoBannerMessages,
	seatRulesInfoMessages,
	className,
}: SeatMapPassengerPanelProps) {
	const t = useTranslations("seat_service");
	// Manages passenger selection state and
	// updates the currently selected passenger using controlled or internal state.
	const [internalIndex, setInternalIndex] = useState<number>(0);
	const selectedIndex = activePassengerIndex ?? internalIndex;

	// Refs for each passenger row so we can scroll the active one into view.
	const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Scroll the active passenger row into view whenever the active index changes.
	useEffect(() => {
		rowRefs.current[selectedIndex]?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
		});
	}, [selectedIndex]);

	const handleSelect = (index: number) => {
		if (onPassengerSelect) {
			onPassengerSelect(index);
		} else {
			setInternalIndex(index);
		}
	};

	return (
		<div className={cn("flex flex-col rounded-xl bg-white", className)}>
			<div
				role="region"
				aria-label={t("passengers")}
				className={cn(
					"seat-map-passenger-panel flex flex-col rounded-lg border border-base-300 bg-white",
					className
				)}
			>
				<div className="flex items-center gap-4 rounded-t-xl border-base-300 border-b bg-white">
					<div className="flex min-h-10 flex-1 items-center rounded-tl-xl px-4">
						<p className="font-bold text-2xl text-brand-japan-black leading-9">{t("passengers")}</p>
					</div>
					<div className="flex w-18.5 shrink-0 flex-col items-center gap-0.5 rounded-tr-xl border-primary-600 border-b-4 bg-primary-50 py-2">
						<Icon name="flight_takeoff" size={24} color="text-primary-700" />
						<span className="text-center font-bold text-primary-700 text-sm leading-6">
							{flightCode}
						</span>
					</div>
				</div>

				{passengers.map((passenger, index) => (
					<button
						// biome-ignore lint/suspicious/noArrayIndexKey: passenger rows have no stable id
						key={`${passenger.name}-${index}`}
						ref={(el) => {
							rowRefs.current[index] = el;
						}}
						type="button"
						tabIndex={0}
						onClick={() => handleSelect(index)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") handleSelect(index);
						}}
						className="selected-passenger flex cursor-pointer items-center gap-4 border-base-300 border-b bg-white last:border-b-0"
					>
						<div className="flex flex-1 items-center self-stretch">
							<div
								className={cn(
									"w-1 self-stretch",
									selectedIndex === index ? "bg-primary-700" : "bg-transparent"
								)}
							/>
							<div className="flex min-h-10 flex-1 items-center gap-2.5 px-2">
								{passenger.isInfant ? (
									<InfantIcon
										ariaLabel="Infant icon"
										width={24}
										height={24}
										className="text-primary-600"
									/>
								) : (
									<Icon name="person" size={24} fill={1} color="" className="text-primary-600" />
								)}
								<div className="flex flex-1 flex-col items-start gap-1">
									<span className="font-bold text-base text-brand-japan-black leading-6">
										{passenger.name}
									</span>
									{passenger.bundle && <Badge variant="info">{passenger.bundle}</Badge>}
								</div>
							</div>
						</div>
						<SeatCell {...passenger} isSelectedRow={selectedIndex === index} />
					</button>
				))}

				<SeatMapLegend
					cabinClass={cabinClass}
					complimentaryLegendEligible={activePassengerComplimentaryLegendEligible}
					bundleSeatServiceCodes={activePassengerBundleSeatServiceCodes}
					selectedServiceCode={activePassengerSelectedSeatServiceCode}
					bundleInfoMessage={bundleInfoMessage}
					prices={legendPrices}
				/>
			</div>
			{adjacentInfoBannerMessages && adjacentInfoBannerMessages.length > 0 && (
				<div className="hidden pt-4 md:block">
					<Alert variant="warning">
						<AlertTitle>{t("adjacent_seat_information")}</AlertTitle>
						<AlertDescription>
							<ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
								{adjacentInfoBannerMessages.map((message) => (
									<li
										key={`${message.text}-${message.linkHref ?? ""}`}
										className="text-sm leading-5"
									>
										{message.text}
										{message.linkText && message.linkHref ? (
											<>
												{" "}
												<a
													href={message.linkHref}
													target={message.linkTarget}
													rel="noopener noreferrer"
													className="text-primary-700 underline underline-offset-2"
												>
													{message.linkText}
												</a>
											</>
										) : null}
									</li>
								))}
							</ul>
						</AlertDescription>
					</Alert>
				</div>
			)}
			{seatRulesInfoMessages && seatRulesInfoMessages.length > 0 && (
				<div className="hidden py-4 md:block">
					<Alert variant="info" icon={false} className="gap-3 bg-base-100 text-base-700">
						<AlertDescription>
							<ul className="flex list-disc flex-col gap-1 pl-4">
								{seatRulesInfoMessages.map((message) => (
									<li key={message} className="text-sm leading-6">
										{message}
									</li>
								))}
							</ul>
						</AlertDescription>
					</Alert>
				</div>
			)}
		</div>
	);
}
