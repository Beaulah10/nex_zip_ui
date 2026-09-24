/**
 * File: seat-column-groups.tsx
 * Description: Renders grouped seat column layouts with configurable column cells and optional spacer elements between column groups.
 */

import { cn } from "@repo/ui/lib";
import { Fragment } from "react";
import type { SeatColumnGroupsProps } from "@/types/seat-map/seat-map.types";

export function SeatColumnGroups({
	columnGroups,
	renderCell,
	renderSpacer,
	className,
}: SeatColumnGroupsProps) {
	return (
		<div
			className={cn(
				"seat-map__column-groups flex items-center justify-center gap-1 md:gap-2",
				className
			)}
		>
			{columnGroups.map((group, groupIndex) => (
				<Fragment key={group.join("")}>
					<div className="flex shrink-0 gap-1 md:gap-4">
						{group.map((column) => (
							<Fragment key={column}>{renderCell(column, groupIndex)}</Fragment>
						))}
					</div>
					{groupIndex < columnGroups.length - 1 && renderSpacer?.(groupIndex)}
				</Fragment>
			))}
		</div>
	);
}
