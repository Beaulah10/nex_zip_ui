import { NEXUZR004OffersAncillaryRequestServiceCategoryEnum } from "@repo/sdk";

/**
 * Shared ancillary service settings used to keep SSR and pricing lookups consistent.
 */
export const ANCILLARY_SERVICE_CONFIG = {
	express: {
		serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum.amenities,
		ssrCode: "EXPS",
		pricingPassengerType: "adult",
	},
} as const;
