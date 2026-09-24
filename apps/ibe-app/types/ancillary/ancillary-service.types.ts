import type {
	NEXUZR004OffersServicesPerPassengerType,
	NEXUZR004OffersSpecialService,
} from "@repo/sdk";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import type { PassengerValues } from "@/types/passenger/passenger.type";

/**
 * Minimal service shape needed to resolve an ancillary offer by segment.
 */
export type ServiceWithQuantity = {
	lfid: number;
	qtyAvailable: number;
};

/**
 * Passenger name fields used to build a display label.
 */
export type PassengerDisplayNameSource = Pick<
	PassengerValues,
	"firstName" | "middleName" | "lastName"
>;

/**
 * Input required to resolve the best ancillary offer for a passenger type.
 */
export type AncillaryServiceOfferArgs = {
	servicesPerPassengerType: NEXUZR004OffersServicesPerPassengerType[];
	passengerType: string;
	ssrCode: string;
	selectedSegmentLfid?: number;
};

/**
 * Resolved ancillary amount and remaining availability.
 */
export type AncillaryServiceOfferResult = {
	amount: number;
	qtyAvailable: number;
};

/**
 * Arguments used to build selectable customer rows for an ancillary dialog.
 */
export type BuildSelectablePassengerListArgs = {
	passengers: PassengerValues[];
	amount: number;
	quantityAvailable: number;
	selectedPassengers?: selectCustomersListItem[];
};

export type AncillaryServiceOffer = {
	amount: number;
	qtyAvailable: number;
	categoryId: number;
	passengerType: string;
	service: NEXUZR004OffersSpecialService;
};
