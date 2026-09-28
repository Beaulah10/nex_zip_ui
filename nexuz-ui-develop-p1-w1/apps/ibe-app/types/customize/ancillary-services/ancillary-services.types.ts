export type PageType = "customize" | "extras";

export interface AncillaryRuleInput {
	pageType: PageType;
	bundleType: string;
	source: string;
	destination: string;
	departureTime: string;
	t: (key: string, values?: Record<string, string | number | Date>) => string;
}

export interface CardState {
	enabled: boolean;
	showPopupOnClick: boolean;
	redirectToTop: boolean;
	popupMessage?: string;
}

export interface AncillaryRuleResponse {
	bannerTitle?: string;
	bannerDescription?: string;

	cards: {
		seat: CardState;
		meal: CardState;
		lounge: CardState;
		transport: CardState;
		express: CardState;
		baggage: CardState;
	};
}

export interface AlertBannerData {
	title?: string;
	description?: string;
}

export interface AncillaryAlertsProps {
	showAncillaryBanner?: boolean;
	ancillaryResult?: AncillaryRuleResponse;
	showBundleCompletionAlert?: boolean;
	bundleCompletionAlertData?: AlertBannerData;
	showStockBanner?: boolean;
	stockBannerData?: AlertBannerData;
	showBaggageSegmentMismatchBanner?: boolean;
	baggageSegmentMismatchBannerData?: AlertBannerData;
}
