import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";

export type PassengerSelections = Record<string, Record<string, boolean>>;

export type ExtrasCategoryId = "amenities" | "airport-services";

export type ExtrasProduct = {
	id: string;
	categoryId: ExtrasCategoryId;
	ssrCode: string;
	qtyAvailable: number;
	name: string;
	description?: string;
	price: number;
	imageSrc: string;
	images: string[];
	serviceID: number;
	lfid: number;
	pfid?: number;
	cutOffHours: number;
	maxCountServiceLevel: number;
	numericCategoryId: number;
	passengerType: string;
	remainingLabel?: string;
	imageAlt?: string;
	disabled?: boolean;
	infoLink?: string;
	inPremiumBundle?: boolean;
};

export type PassengerForDialog = {
	id: string;
	name: string;
	category: string;
	price: number;
	checked: boolean;
};

export type DialogSummary = {
	selectedPaidPassengerCount: number;
	dialogTotal: number;
	isDialogSelectionFull: boolean;
	shouldShowOutOfStockAlert: boolean;
};

export type ExtrasSectionProps = {
	title: string;
	bundledPassengerIdsByProductId: Record<string, string[]>;
	products: ExtrasProduct[];
	selectedProductIds?: string[];
	onSelectProduct?: (productId: string) => void;
	onCardClick?: (productId: string) => void;
};

export type ExtrasProductModalProps = {
	open: boolean;
	product: ExtrasProduct | null;
	routeLabel: string;
	currentImageIndex: number;
	passengers: selectCustomersListItem[];
	passengerSelections: Record<string, boolean>;
	bundledPassengerIds: string[];
	isDialogSelectionFull: boolean;
	dialogTotal: number;
	shouldShowOutOfStockAlert: boolean;
	onClose: () => void;
	onCloseAutoFocus?: (event: Event) => void;
	onPreviousImage: () => void;
	onNextImage: () => void;
	onPassengerChange: (passengerId: string, checked: boolean) => void;
	onSelectAllChange: (checked: boolean) => void;
	onConfirm: () => void;
};

export interface Category {
	id: string;
	name: string;
	icon: string;
}

export interface FilterPillsProps {
	title: string;
	description?: string;
	onCategoryChange: (categoryId: string) => void;
	selectedCategoryIds?: string[];
}
