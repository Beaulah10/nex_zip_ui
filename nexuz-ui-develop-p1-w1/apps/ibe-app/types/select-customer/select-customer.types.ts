export interface selectCustomersListItem {
	id: string;
	name: string;
	category: string;
	price: number;
	checked: boolean;
	disabled?: boolean;
	passengerTypeCode?: string;
	status?: string;
	mappedAdultId?: string;
}

export interface SelectCustomersProps {
	title?: string;
	hasIncluded?: boolean;
	passengers: selectCustomersListItem[];
	onPassengerChange?: (id: string, checked: boolean) => void;
	onSelectAllChange?: (checked: boolean) => void;
	highlightedPassengerId?: string;
	selectAllOverride?: {
		checked?: boolean;
		disabled?: boolean;
	};
	className?: string;
	disabledPassengerCategories?: string[];
	price?: number;
	bundledPassengerIds?: string[];
	outOfStockLabel?: string;
}
export interface SelectCustomerListPassenger {
	id: string;
	passengerTypeCode?: string;
	firstName?: string;
	lastName?: string;
	price?: number;
	mappedAdultId?: string;
}

export interface PaxCategoryLabels {
	adult?: string;
	infant?: string;
	childA?: string;
	childB?: string;
	childC?: string;
	fallback?: string;
}
