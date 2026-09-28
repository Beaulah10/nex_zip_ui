/**
 * File: seat.tsx
 * Description: Renders an interactive seat within the seat map, including seat status styling,
 * passenger assignments, accessibility labels, tooltips, and seat selection behavior.
 */

"use client";

import Icon from "@repo/ui/components/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import {
	FRONT_TIER_LINE_ROW_END,
	FRONT_TIER_LINE_ROW_START,
	SEAT_SIZE_CLASSES,
	SEAT_SIZE_CLASSES_LARGE,
	SELECTED_CLASSES,
	STATUS_CLASSES,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { SeatProps } from "@/types/seat-map/seat-map.types";

export function Seat({
	seat,
	selected = false,
	passengerLabel,
	size = "default",
	onSelect,
}: SeatProps) {
	const t = useTranslations("seat_service");
	const isInteractive = seat.status !== "not-selectable";
	const isSelected = isInteractive && selected;
	const seatTooltip = t("aria_labels.seat_number", {
		code: seat.code,
	});

	const seatAriaLabel = isSelected
		? `${seatTooltip}, ${t("aria_labels.selected_state")}`
		: seatTooltip;
	const rowNumber = Number.parseInt(seat.code, 10);
	const showFrontTierLine =
		seat.status === "front-tier" &&
		rowNumber >= FRONT_TIER_LINE_ROW_START &&
		rowNumber <= FRONT_TIER_LINE_ROW_END;
	const showRearTierLine = seat.status === "rear-tier";
	const hasLine = showFrontTierLine || showRearTierLine;
	const seatButton = (
		<button
			type="button"
			disabled={!isInteractive}
			data-seat-code={seat.code}
			aria-pressed={isInteractive ? selected : undefined}
			aria-label={seatAriaLabel}
			onClick={() => isInteractive && onSelect?.(seat)}
			className={cn(
				"seat-map__seat flex justify-center p-1 font-medium text-[10px] transition-colors",
				size === "large"
					? "rounded-t-xl rounded-b-xs border-[1.5px] border-primary-500"
					: "rounded-t-md rounded-b-xs",
				showFrontTierLine && "items-start pt-1",
				showRearTierLine && "items-end pb-1",
				!hasLine && "items-center",
				size === "large" ? SEAT_SIZE_CLASSES_LARGE : SEAT_SIZE_CLASSES,
				isSelected ? SELECTED_CLASSES : STATUS_CLASSES[seat.status],
				!isSelected && seat.status === "central" && "bg-primary-300",
				isInteractive && "cursor-pointer"
			)}
		>
			{isSelected ? (
				<span className="font-semibold text-xs">{passengerLabel ?? ""}</span>
			) : (
				<>
					{seat.status === "exit-row" && (
						<Icon name="open_in_full" size={24} color="text-warning-800" />
					)}
					{seat.status === "no-recline" && (
						<Icon name="unfold_less" size={24} color="text-primary-700" />
					)}
					{seat.status === "rear-tier" && (
						<span className="block h-0.5 w-3 rounded-full bg-success-800" />
					)}
					{showFrontTierLine && <span className="block h-0.5 w-3 rounded-full bg-primary-700" />}
					{seat.status === "not-selectable" && (
						<Icon name="close" size={14} color="text-base-400" />
					)}
				</>
			)}
		</button>
	);

	if (!isInteractive) {
		return seatButton;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{seatButton}</TooltipTrigger>
			<TooltipContent
				side="bottom"
				align="start"
				sideOffset={4}
				avoidCollisions={false}
				className="w-auto max-w-none whitespace-nowrap"
			>
				{seatTooltip}
			</TooltipContent>
		</Tooltip>
	);
}
