/**
 * File: seat-map.tsx
 * Description: Renders the interactive seat map for all cabin types, including seat layouts,
 * passenger seat assignments, emergency exits, cabin assistance facilities, sticky headers,
 * and seat selection behavior.
 */

"use client";

import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BusinessCabinHeader } from "@/components/customize/seat-map/business-cabin-header/business-cabin-header";
import { BusinessCabinRows } from "@/components/customize/seat-map/business-cabin-rows/business-cabin-rows";
import { CabinAssistanceIcons } from "@/components/customize/seat-map/cabin-assistance-icons/cabin-assistance-icons";
import { CabinHeader } from "@/components/customize/seat-map/cabin-header/cabin-header";
import { expandCabinRows } from "@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows";
import { SeatMapRow } from "@/components/customize/seat-map/seat-map-row/seat-map-row";
import { SEAT_SIZE_CLASSES_DEFAULT } from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { SeatMapProps } from "@/types/seat-map/seat-map.types";

function EmergencyExitRow({ align }: { align: "start" | "end" }) {
	const t = useTranslations("seat_service");

	return (
		<div
			className={cn(
				"seat-map__exit-row flex items-center gap-1.5 py-1 font-semibold text-primary-700 text-xs md:text-sm",
				align === "end" && "flex-row-reverse"
			)}
		>
			<span className="leading:none hidden items-center md:flex">
				<Icon
					name={align === "start" ? "arrow_back" : "arrow_forward"}
					size={24}
					color="text-primary-700"
				/>
			</span>
			<span>{t("emergency_exit")}</span>
		</div>
	);
}

export function SeatMap({
	data,
	assignedSeatToPassengerIndex,
	assignedSeatToPassengerLabel,
	activeSeatCode,
	onSeatSelect,
	className,
}: SeatMapProps) {
	const t = useTranslations("seat_service");
	const [hideFirstHeader, setHideFirstHeader] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Scroll the active passenger's seat into view whenever the active seat changes.
	useEffect(() => {
		if (!activeSeatCode || !containerRef.current) return;
		const activeSeatElement = containerRef.current.querySelector<HTMLElement>(
			`[data-seat-code="${activeSeatCode}"]`
		);
		activeSeatElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
	}, [activeSeatCode]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Walk up DOM to find the nearest scrollable ancestor (accordion body)
		const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
			if (!el || el === document.body) return null;
			const { overflowY } = window.getComputedStyle(el);
			if (overflowY === "auto" || overflowY === "scroll") return el;
			return getScrollParent(el.parentElement);
		};

		const scrollParent = getScrollParent(container.parentElement);
		const scrollTarget = scrollParent ?? window;

		const handleScroll = () => {
			const secondHeader = container.querySelector('[data-header="second"]');
			if (!secondHeader) return;
			const anchorTop = scrollParent ? scrollParent.getBoundingClientRect().top : 0;
			const secondTop = secondHeader.getBoundingClientRect().top;
			setHideFirstHeader(secondTop <= anchorTop);
		};

		scrollTarget.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => scrollTarget.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				"seat-map flex flex-col gap-6 border-y bg-white px-2 py-4 md:p-4 md:pb-14",
				className
			)}
		>
			{data.map((cabin) => {
				const isZipFullFlat = cabin.class === "ZipFullFlat";

				return (
					<div key={cabin.name} className="seat-map__cabin flex flex-col gap-4">
						{isZipFullFlat ? (
							<>
								<div className="sticky top-6 z-10 bg-white">
									<BusinessCabinHeader />
									<div className="border-base-200 border-b" />
								</div>
								<div className={cn("flex items-center justify-center", SEAT_SIZE_CLASSES_DEFAULT)}>
									<Icon name="wc" size={20} color="text-primary-700" />
								</div>
								<div className="flex items-center justify-between">
									<EmergencyExitRow align="start" />
									<EmergencyExitRow align="end" />
								</div>

								<BusinessCabinRows
									rows={expandCabinRows(cabin)}
									assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
									assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
									onSelectSeat={onSeatSelect}
								/>
								<CabinAssistanceIcons />
								<div className="flex items-center justify-between">
									<EmergencyExitRow align="start" />
									<EmergencyExitRow align="end" />
								</div>
								<p className="py-2 text-center font-semibold text-primary-700 text-xs md:text-sm">
									{t("standard_seat_area")}
								</p>
							</>
						) : (
							<>
								<div
									className={cn(
										"sticky top-6 z-10 bg-white transition-opacity",
										hideFirstHeader ? "pointer-events-none opacity-0" : "opacity-100"
									)}
									data-header="first"
								>
									<CabinHeader cabinClass={cabin.class} />
									<div className="border-base-200 border-b" />
								</div>
								<CabinAssistanceIcons />
								<div className="flex items-center justify-between">
									<EmergencyExitRow align="start" />
									<EmergencyExitRow align="end" />
								</div>

								<div className="seat-map__rows flex flex-col gap-1 md:gap-2">
									{(() => {
										const rows = expandCabinRows(cabin);
										const dividerIdx = rows.findIndex((r) => r.row === 36);
										if (dividerIdx === -1) {
											return rows.map((row) => (
												<SeatMapRow
													key={row.row}
													cabinClass={cabin.class}
													row={row}
													assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
													assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
													onSelectSeat={onSeatSelect}
												/>
											));
										}
										const firstGroup = rows.slice(0, dividerIdx + 1);
										const secondGroup = rows.slice(dividerIdx + 1);
										return (
											<>
												{firstGroup.map((row) => (
													<SeatMapRow
														key={row.row}
														cabinClass={cabin.class}
														row={row}
														assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
														assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
														onSelectSeat={onSeatSelect}
													/>
												))}
												<div className="flex items-center justify-between pt-4">
													<EmergencyExitRow align="start" />
													<EmergencyExitRow align="end" />
												</div>
												<div className="sticky top-6 z-10 bg-white py-3" data-header="second">
													<CabinHeader cabinClass={cabin.class} />
													<div className="border-base-200 border-b pt-3" />
												</div>
												{secondGroup.map((row) => (
													<SeatMapRow
														key={row.row}
														cabinClass={cabin.class}
														row={row}
														assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
														assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
														onSelectSeat={onSeatSelect}
													/>
												))}
											</>
										);
									})()}
								</div>

								<div className="flex items-center justify-between">
									<EmergencyExitRow align="start" />
									<EmergencyExitRow align="end" />
								</div>
								<CabinAssistanceIcons showAccessibleGroup={false} />
							</>
						)}
					</div>
				);
			})}
		</div>
	);
}
