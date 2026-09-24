/**
 * File: seat-map-row.tsx
 * Description: Renders a single seat map row for the selected cabin class, including seats,
 * row numbers, placeholders, and passenger seat assignments.
 */

"use client";

import { cn } from "@repo/ui/lib";
import { Seat } from "@/components/customize/seat-map/seat/seat";
import { SeatColumnGroups } from "@/components/customize/seat-map/seat-column-groups/seat-column-groups";
import {
	CABIN_COLUMN_GROUPS,
	ROW_NUMBER_CLASSES,
	SEAT_SIZE_CLASSES,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { SeatMapRowProps } from "@/types/seat-map/seat-map.types";

export function SeatMapRow({
	cabinClass,
	row,
	assignedSeatToPassengerIndex,
	assignedSeatToPassengerLabel,
	onSelectSeat,
}: SeatMapRowProps) {
	const seatsByColumn = new Map(row.seats.map((seat) => [seat.column, seat]));

	return (
		<SeatColumnGroups
			className="seat-map__row"
			columnGroups={CABIN_COLUMN_GROUPS[cabinClass]}
			renderCell={(column) => {
				const seat = seatsByColumn.get(column);
				if (!seat) {
					return (
						<div
							className={cn("seat-map__seat-placeholder aspect-square shrink-0", SEAT_SIZE_CLASSES)}
						/>
					);
				}
				const passengerIndex = assignedSeatToPassengerIndex?.[seat.code];
				return (
					<Seat
						seat={seat}
						selected={passengerIndex !== undefined}
						passengerLabel={assignedSeatToPassengerLabel?.[seat.code]}
						onSelect={onSelectSeat}
					/>
				);
			}}
			renderSpacer={() => (
				<span
					className={cn(
						"seat-map__row-number flex items-center justify-center text-brand-japan-black text-xs",
						ROW_NUMBER_CLASSES
					)}
				>
					{row.row}
				</span>
			)}
		/>
	);
}
