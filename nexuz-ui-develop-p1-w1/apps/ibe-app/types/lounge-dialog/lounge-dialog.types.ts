import type { StaticImageData } from "next/image";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import type { BookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { PassengerValues } from "@/types/passenger/passenger.type";

/**Airport lounge information displayed in the lounge dialog.*/
export interface LoungeInfo {
	title: string;
	stockLabel?: string;
	hours: string;
	amenities: Array<{ icon: string; label: string }>;
	imageSrc: string | StaticImageData;
	description: string;
}

/**Props for the Airport Lounge dialog component.*/
export interface AirportLoungeDialogProps {
	open: boolean;
	stageLabel: string;
	transportRouteLabel: string;
	ancillaryScope: BookingStageSegment;
	originCode: string | undefined;
	segmentLfid: number | undefined;
	highlightedPassengerId?: string;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/**Airport lounge passenger selection state and actions.*/
export type AirportLoungePassengerSelection = {
	airportLoungePassengers: selectCustomersListItem[];
	toggleAirportLoungePax: (id: string, checked: boolean) => void;
	toggleAirportLoungeSelectAll: (checked: boolean) => void;
};

/**Options used for lounge passenger selection.*/
export type AirportLoungeSelectionOptions = {
	segmentLfid?: number;
};

/**
 * Represents a passenger available for lounge selection.
 */
export interface LoungePassenger extends PassengerValues {
	/** Whether the passenger is selected. */
	checked: boolean;

	/** Whether the passenger selection is disabled. */
	disabled?: boolean;

	/** Optional passenger status. */
	status?: string;

	/** Passenger display name. */
	name: string;
}
