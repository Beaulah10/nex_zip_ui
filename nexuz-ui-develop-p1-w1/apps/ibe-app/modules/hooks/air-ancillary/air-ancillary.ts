import { getRemainingHours } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import {
	isKoreanFlight,
	isKoreanFlightNrtDeparture,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import type {
	AncillaryRuleInput,
	AncillaryRuleResponse,
	CardState,
} from "@/types/customize/ancillary-services/ancillary-services.types";

/** Creates a card state representing an enabled, clickable ancillary service. */
const createEnabledCard = (): CardState => ({
	enabled: true,
	showPopupOnClick: false,
	redirectToTop: false,
});

/** Creates a card state representing a disabled service that shows an error popup on click. */
const createPopupCard = (
	t: (key: string, values?: Record<string, string | number | Date>) => string
): CardState => ({
	enabled: false,
	showPopupOnClick: true,
	redirectToTop: true,
	popupMessage: t("error_labels.popup_error_message"),
});

/** Creates a card state representing a disabled service with no interactive behavior. */
const createDisabledCard = (): CardState => ({
	enabled: false,
	showPopupOnClick: false,
	redirectToTop: false,
});

/** Returns the default ancillary response with all services enabled. */
export const getDefaultResponse = (): AncillaryRuleResponse => ({
	cards: {
		seat: createEnabledCard(),
		meal: createEnabledCard(),
		lounge: createEnabledCard(),
		transport: createEnabledCard(),
		express: createEnabledCard(),
		baggage: createEnabledCard(),
	},
});

/** Builds a banner title and description listing services disabled by deadline cutoffs. */
const getDisabledServicesMessage = (
	cards: AncillaryRuleResponse["cards"],
	remainingHours: number,
	t: (key: string, values?: Record<string, string | number | Date>) => string
) => {
	const serviceLabels: [keyof typeof cards, string][] = [
		["seat", t("seat_service_name")],
		["meal", t("meal_service_name")],
		["transport", t("transportation_service_name")],
		["express", t("priority_service_name")],
		["lounge", t("airport_lounge_name")],
		["baggage", t("baggage_service_name")],
	];
	const services = serviceLabels.filter(([key]) => !cards[key].enabled).map(([, label]) => label);

	// If all services are disabled, return only title with no description
	if (services.length === serviceLabels.length) {
		return {
			title: t("error_labels.all_ancillary_services_disabled"),
			description: "",
		};
	}

	return {
		title: t("error_labels.alerts_deadline_title", {
			disabledServiceName: services.join(", "),
		}),
		description: t("error_labels.alerts_deadline_description", {
			remainingHours,
		}),
	};
};

/** Converts all card states to popup-on-click disabled states. */
const setAllCardsToPopup = (
	response: AncillaryRuleResponse,
	t: (key: string, values?: Record<string, string | number | Date>) => string
): AncillaryRuleResponse => {
	for (const key of Object.keys(response.cards) as (keyof typeof response.cards)[]) {
		response.cards[key] = createPopupCard(t);
	}
	return response;
};

/** Attaches a warning banner to the response based on disabled services and remaining hours. */
const applyBanner = (
	response: AncillaryRuleResponse,
	hours: number,
	t: (key: string, values?: Record<string, string | number | Date>) => string
): void => {
	const banner = getDisabledServicesMessage(response.cards, hours, t);
	response.bannerTitle = banner.title;

	response.bannerDescription = banner.description;
};

/** Evaluates ancillary service eligibility by applying deadline and route-based rules, returning card states and optional banner. */
export function evaluateAncillaryEligibility(input: AncillaryRuleInput): AncillaryRuleResponse {
	const { bundleType, source, destination, departureTime, t } = input;

	const response = getDefaultResponse();
	const remainingHours = getRemainingHours(departureTime);
	const hasBundle = bundleType !== "NoBundle";
	const koreanFlight = isKoreanFlight(source, destination);
	const koreanFlightNrtDeparture = isKoreanFlightNrtDeparture(source, destination);
	// RULE 1: Bundle + Korean flight (Korea departure), <48h
	if (hasBundle && koreanFlight) {
		if (remainingHours < 48) setAllCardsToPopup(response, t);
		return response;
	}

	// RULE 2: Bundle + Korean flight NRT departure, <24h
	if (hasBundle && koreanFlightNrtDeparture) {
		if (remainingHours < 24) setAllCardsToPopup(response, t);
		return response;
	}

	// RULE 3: No bundle
	if (!hasBundle) {
		// Edge case: HNL to NRT with < 96 hours — disable transport early
		if (source === "HNL" && destination === "NRT" && remainingHours < 96) {
			response.cards.transport = createDisabledCard();
			applyBanner(response, 96, t);
		}

		// 24 < hours < 48
		if (remainingHours < 48 && remainingHours > 24) {
			if (source !== "NRT") response.cards.meal = createDisabledCard();
			if (source === "HNL") response.cards.lounge = createDisabledCard();
			const anyDisabled = !response.cards.meal.enabled || !response.cards.lounge.enabled;
			if (anyDisabled) applyBanner(response, 48, t);
			return response;
		}

		// < 24h
		if (remainingHours < 24) {
			response.cards.seat = createDisabledCard();
			if (
				(source === "HNL" && destination === "NRT") ||
				(source === "NRT" && destination === "HNL")
			)
				response.cards.transport = createDisabledCard();
			response.cards.express = createDisabledCard();
			response.cards.meal = createDisabledCard();
			if (source === "BKK" || source === "SIN" || source === "HNL")
				response.cards.lounge = createDisabledCard();
			applyBanner(response, 24, t);
			return response;
		}
	}

	return response;
}
