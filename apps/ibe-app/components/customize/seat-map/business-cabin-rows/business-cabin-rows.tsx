/**
 * File: business-cabin-rows.tsx
 * Description: Renders business cabin seat rows with seat cells, row numbers, placeholders, aisle divider, and assigned passenger indicators.
 */

"use client";

import { cn } from "@repo/ui/lib";
import { Seat } from "@/components/customize/seat-map/seat/seat";
import {
	ROW_START_CLASSES,
	SEAT_SIZE_CLASSES_LARGE,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { BusinessCabinRowsProps, ExpandedSeat } from "@/types/seat-map/seat-map.types";

function SeatCell({
	seat,
	column,
	rowStartClass,
	assignedSeatToPassengerIndex,
	assignedSeatToPassengerLabel,
	onSelectSeat,
}: {
	seat: ExpandedSeat | undefined;
	column: number;
	rowStartClass: string;
	assignedSeatToPassengerIndex?: Record<string, number>;
	assignedSeatToPassengerLabel?: Record<string, string>;
	onSelectSeat?: (seat: ExpandedSeat) => void;
}) {
	if (!seat) {
		return (
			<div
				className={cn(
					"seat-map__seat-placeholder aspect-square",
					SEAT_SIZE_CLASSES_LARGE,
					rowStartClass
				)}
				style={{ gridColumn: column }}
			/>
		);
	}
	const passengerIndex = assignedSeatToPassengerIndex?.[seat.code];
	return (
		<div
			className={cn(rowStartClass, "justify-self-center", "px-3.5 md:px-7")}
			style={{ gridColumn: column }}
		>
			<Seat
				seat={seat}
				selected={passengerIndex !== undefined}
				passengerLabel={assignedSeatToPassengerLabel?.[seat.code]}
				onSelect={onSelectSeat}
				size="large"
			/>
		</div>
	);
}

function RowNumberCell({
	row,
	column,
	rowStartClass,
}: {
	row: number;
	column: number;
	rowStartClass: string;
}) {
	return (
		<span
			className={cn(
				"seat-map__row-number flex h-11 w-7 items-center justify-center gap-y-4 text-center text-brand-japan-black text-xs md:w-11",
				rowStartClass
			)}
			style={{ gridColumn: column }}
		>
			{row}
		</span>
	);
}

export function BusinessCabinRows({
	rows,
	assignedSeatToPassengerIndex,
	assignedSeatToPassengerLabel,
	onSelectSeat,
}: BusinessCabinRowsProps) {
	return (
		<div className="relative flex flex-col gap-4">
			<div
				aria-hidden="true"
				className="seat-map__aisle-divider pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-base-200"
			/>

			{rows.map((row, index) => {
				const seatsByColumn = new Map(row.seats.map((seat) => [seat.column, seat]));
				const rowStartClass = ROW_START_CLASSES[index] ?? "row-start-1";

				return (
					<div className="flex" key={row.row}>
						<SeatCell
							seat={seatsByColumn.get("A")}
							column={2}
							rowStartClass={rowStartClass}
							assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
							assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
							onSelectSeat={onSelectSeat}
						/>
						<RowNumberCell row={row.row} column={3} rowStartClass={rowStartClass} />
						<SeatCell
							seat={seatsByColumn.get("D")}
							column={4}
							rowStartClass={rowStartClass}
							assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
							assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
							onSelectSeat={onSelectSeat}
						/>
						<div className="flex-1"></div>
						<SeatCell
							seat={seatsByColumn.get("G")}
							column={8}
							rowStartClass={rowStartClass}
							assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
							assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
							onSelectSeat={onSelectSeat}
						/>
						<RowNumberCell row={row.row} column={9} rowStartClass={rowStartClass} />
						<SeatCell
							seat={seatsByColumn.get("K")}
							column={10}
							rowStartClass={rowStartClass}
							assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
							assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
							onSelectSeat={onSelectSeat}
						/>
					</div>
				);
			})}
		</div>
	);
}
