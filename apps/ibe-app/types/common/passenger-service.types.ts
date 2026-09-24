interface PaxCardLineItem {
	label: string;
	price: number;
	/** Optional serving-time hint rendered under the item, e.g. "Approximately 4 hours after takeoff". */
	servingTime?: string;
}

interface PaxCardCategory {
	/** Omit to render a flat list of items with no category heading. */
	title?: string;
	items: PaxCardLineItem[];
}

export interface PaxCardProps {
	name: string;
	showAddButton?: boolean;
	bundleLabelKey: string;
	features?: string[];
	totalPrice?: number;
	categories?: PaxCardCategory[];
	onAdd?: () => void;
	onChange?: () => void;
	className?: string;
	adultType?: string;
}
