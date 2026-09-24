import type {
	NEXUZR004OffersAncillaryRequestServiceCategoryEnum,
	NEXUZR004OffersAncillaryResponse,
} from "@repo/sdk";
import type { BookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { OffersAncillariesRequest } from "@/types/common.type";

/** Ancillary requests keyed by SDK service category. */
export type AncillaryOffersRequestByServiceCategory = Partial<
	Record<NEXUZR004OffersAncillaryRequestServiceCategoryEnum, OffersAncillariesRequest>
>;

/** Ancillary responses keyed by SDK service category. */
export type AncillaryOffersResponseByServiceCategory = Partial<
	Record<NEXUZR004OffersAncillaryRequestServiceCategoryEnum, NEXUZR004OffersAncillaryResponse>
>;

/** Ancillary errors keyed by SDK service category. */
export type AncillaryOffersErrorByServiceCategory = Partial<
	Record<NEXUZR004OffersAncillaryRequestServiceCategoryEnum, string>
>;

/** Direction- or segment-scoped ancillary offers state. */
export type AncillaryOffersDirectionState = {
	requestByServiceCategory: AncillaryOffersRequestByServiceCategory;
	dataByServiceCategory: AncillaryOffersResponseByServiceCategory;
	errorByServiceCategory: AncillaryOffersErrorByServiceCategory;
	isPending: boolean;
};

/** Booking-flow scope keys used to store ancillary offers. */
export type AncillaryOffersScope = BookingStageSegment;

/** Root ancillary offers state keyed by booking flow scope. */
export type AncillaryOffersState = Partial<
	Record<AncillaryOffersScope, AncillaryOffersDirectionState>
>;
