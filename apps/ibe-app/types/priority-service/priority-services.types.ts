import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";

/**
 * Props for the PriorityServiceDialog component.
 * Includes dialog state, passenger selection data,
 * stock availability information, pricing, and event handlers.
 */
export type PriorityServiceDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	stageLabel: string;
	routeLabel: string;
	passengers: selectCustomersListItem[];
	highlightedPassengerId?: string;
	hasOutOfStockPassengers: boolean;
	remainingStocksLabel?: string;
	showTransitApplicabilityWarning: boolean;
	totalAmount: number;
	onPassengerChange: (id: string, checked: boolean) => void;
	onSelectAllChange: (checked: boolean) => void;
	onConfirmSelection: () => void;
};

export type PriorityServiceSelection = {
	priorityServicePassengers: selectCustomersListItem[];
	priorityServiceTotalAmount: number;
	hasOutOfStockPassengers: boolean;
	remainingStocksLabel?: string;
	showTransitApplicabilityWarning: boolean;
	togglePriorityPax: (id: string, checked: boolean) => void;
	togglePrioritySelectAll: (checked: boolean) => void;
	confirmPrioritySelection: () => void;
};

export type PriorityServicePassenger = {
	id: string;
	firstName?: string;
	lastName?: string;
	passengerTypeCode?: string;
	mappedAdultId?: string;
};
