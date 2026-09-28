import type { useTranslations } from "next-intl";
import type { BookingFlowRoute } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { TripType } from "@/types/common.type";

export type BookingStepperRoute =
	| BookingFlowRoute
	| "bundle-selection"
	| "customize-selection"
	| "extras-selection"
	| "bundles"
	| "customize"
	| "extras"
	| "insurance-selection"
	| "review-confirm-selection"
	| "payment-selection"
	| "confirmation";

export type BookingStepperLabelSource =
	| {
			kind: "translation";
			key:
				| "flight_selection"
				| "outbound_options"
				| "inbound_options"
				| "segment1_options"
				| "segment2_options"
				| "customer_information"
				| "insurance_selection"
				| "review_confirm_selection"
				| "payment_selection";
	  }
	| {
			kind: "literal";
			value: string;
	  };

export interface BookingStepperStepDefinition {
	id: string;
	icon: string;
	label: BookingStepperLabelSource;
	routes: readonly BookingStepperRoute[];
}

export interface BookingStepperFlowDefinition {
	steps: readonly BookingStepperStepDefinition[];
}

export type BookingStepperTranslationFn = ReturnType<typeof useTranslations>;

export type BookingStepperFlowConfig = Record<TripType, BookingStepperFlowDefinition>;
