/**
 * File: cabin-header.tsx
 * Description: Renders the seat map header for a cabin by displaying seat column labels based on the cabin class configuration.
 */

import { cn } from "@repo/ui/lib";
import { SeatColumnGroups } from "@/components/customize/seat-map/seat-column-groups/seat-column-groups";
import {
	CABIN_COLUMN_GROUPS,
	ROW_NUMBER_CLASSES,
	SEAT_SIZE_CLASSES,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { CabinHeaderProps } from "@/types/seat-map/seat-map.types";

export function CabinHeader({ cabinClass }: CabinHeaderProps) {
	const columnGroups = CABIN_COLUMN_GROUPS[cabinClass];

	return (
		<div className="seat-map__header flex flex-col gap-1 md:gap-2">
			<SeatColumnGroups
				columnGroups={columnGroups}
				renderCell={(column) => (
					<div
						className={cn(
							"flex shrink-0 items-center justify-center font-medium text-brand-japan-black text-sm uppercase",
							SEAT_SIZE_CLASSES
						)}
					>
						{column}
					</div>
				)}
				renderSpacer={() => <span className={ROW_NUMBER_CLASSES} />}
			/>
		</div>
	);
}
