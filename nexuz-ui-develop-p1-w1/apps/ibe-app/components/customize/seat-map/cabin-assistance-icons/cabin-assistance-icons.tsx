/**
 * File: cabin-assistance-icons.tsx
 * Description: Renders lavatory and accessibility assistance icons within the cabin layout, with optional display of the central accessible and lavatory icon group.
 */

import Icon from "@repo/ui/components/icon";
import type { CabinAssistanceIconsProps } from "@/types/seat-map/seat-map.types";

export function CabinAssistanceIcons({ showAccessibleGroup = true }: CabinAssistanceIconsProps) {
	return (
		<div className="seat-map__assistance-icons grid h-11 grid-cols-11 items-center">
			<div className="col-start-2 flex items-center justify-center md:hidden">
				<Icon name="wc" size={16} color="text-primary-700" />
			</div>
			<div className="col-start-2 hidden items-center justify-center md:flex">
				<Icon name="wc" size={24} color="text-primary-700" />
			</div>
			{showAccessibleGroup && (
				<>
					<div className="col-start-4 flex w-25 items-center justify-center md:hidden">
						<Icon name="accessible" size={16} color="text-primary-700" />
					</div>
					<div className="col-start-4 flex hidden w-25 items-center justify-center md:flex">
						<Icon name="accessible" size={24} color="text-primary-700" />
					</div>
					<div className="col-start-8 flex w-1 items-center justify-center md:hidden">
						<Icon name="wc" size={16} color="text-primary-700" />
					</div>
					<div className="col-start-8 flex hidden w-1 items-center justify-center md:flex">
						<Icon name="wc" size={24} color="text-primary-700" />
					</div>
				</>
			)}
			<div className="col-start-10 flex items-center justify-center md:hidden">
				<Icon name="wc" size={16} color="text-primary-700" />
			</div>
			<div className="col-start-10 flex hidden items-center justify-center md:flex">
				<Icon name="wc" size={24} color="text-primary-700" />
			</div>
		</div>
	);
}
