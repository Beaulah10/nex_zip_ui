import type { NEXUZR004OffersAncillaryRequestServiceCategoryEnum } from "@repo/sdk/swagger";

/**
 * Type definition for the props passed to a Next.js page component.
 * This type is used to define the shape of the `params` object that is
 * passed to the page component by Next.js during server-side rendering.
 */
export type PageProps = {
	params: Promise<{
		locale: string;
	}>;
};

export type TripType = "oneway" | "roundtrip" | "connecting";

export type UseTripTypeResult = {
	tripType?: TripType;
	oneway: boolean;
	roundtrip: boolean;
	connecting: boolean;
};

/**
 * Passenger counts used when requesting ancillary offers.
 */
export interface PassengerType {
	/** Number of adult passengers. */
	adult: number;

	/** Number of child passengers in category A. */
	childA?: number;

	/** Number of child passengers in category B. */
	childB?: number;

	/** Number of child passengers in category C. */
	childC?: number;

	/** Number of infant passengers. */
	infant?: number;
}

/**
 * Request payload for retrieving ancillary offers.
 */
export interface OffersAncillariesRequest {
	/** Currency code for pricing (for example, JPY or USD). */
	currency: string;

	/** Flight departure date. */
	departureDate: string;

	/** Logical flight identifier. */
	lfid: number;

	/** Origin airport code. */
	origin: string;

	/** Destination airport code. */
	destination: string;

	/** Ancillary service category to retrieve. */
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum;

	/** Passenger composition for the booking. */
	passengers: PassengerType;
}

/**
 * Props for rendering a promotional ancillary service card on the
 * Customize page, including image, icon, title, description,
 * and optional promotional labels.
 */
export interface ServicePromoCardProps {
	imageSrc: string;
	imageAlt?: string;
	/** Material Symbols icon name shown in the floating circular badge, e.g. "luggage". */
	icon: string;
	discountLabel?: string;
	title: string;
	description: string;
	/** e.g. "1 meal selected" */
	selectedItemsText?: string;
	/** e.g. "2 free items yet to select" */
	freeItemsText?: string;
	/** Reserve status row height when no status text is available. */
	reserveStatusSpace?: boolean;
	className?: string;
	fill?: number;
}
