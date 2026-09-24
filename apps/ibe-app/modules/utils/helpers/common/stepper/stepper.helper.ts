import type { StepItem } from "@repo/ui/components/stepper";
import type {
	BookingStepperFlowConfig,
	BookingStepperLabelSource,
	BookingStepperRoute,
	BookingStepperTranslationFn,
} from "@/types/common/stepper.types";
import type { TripType } from "@/types/common.type";

type TranslationFn = BookingStepperTranslationFn;

const OUTBOUND_OPTION_ROUTES = [
	"bundles",
	"bundles/outbound",
	"customize",
	"customize/outbound",
	"extras",
	"extras/outbound",
] as const satisfies readonly BookingStepperRoute[];

const INBOUND_OPTION_ROUTES = [
	"bundles/inbound",
	"customize/inbound",
	"extras/inbound",
] as const satisfies readonly BookingStepperRoute[];

const CONNECTING_SEGMENT_1_OPTION_ROUTES = [
	"bundles/segment1",
	"customize/segment1",
	"extras/segment1",
] as const satisfies readonly BookingStepperRoute[];

const CONNECTING_SEGMENT_2_OPTION_ROUTES = [
	"bundles/segment2",
	"customize/segment2",
	"extras/segment2",
] as const satisfies readonly BookingStepperRoute[];

const BOOKING_STEPPER_FLOW_CONFIG = {
	oneway: {
		steps: [
			{
				id: "flight-selection",
				icon: "flight",
				label: { kind: "translation", key: "flight_selection" },
				routes: ["flight-selection"],
			},
			{
				id: "outbound-options",
				icon: "cards_stack",
				label: { kind: "translation", key: "outbound_options" },
				routes: OUTBOUND_OPTION_ROUTES,
			},
			{
				id: "passenger-details",
				icon: "person",
				label: { kind: "translation", key: "customer_information" },
				routes: ["customer-information"],
			},
			{
				id: "insurance",
				icon: "shield_with_heart",
				label: { kind: "translation", key: "insurance_selection" },
				routes: ["insurance-selection"],
			},
			{
				id: "review-confirm",
				icon: "fact_check",
				label: { kind: "translation", key: "review_confirm_selection" },
				routes: ["confirmation"],
			},
			{
				id: "payment",
				icon: "shopping_cart",
				label: { kind: "translation", key: "payment_selection" },
				routes: ["payment-selection"],
			},
		],
	},
	roundtrip: {
		steps: [
			{
				id: "flight-selection",
				icon: "flight",
				label: { kind: "translation", key: "flight_selection" },
				routes: ["flight-selection"],
			},
			{
				id: "outbound-options",
				icon: "cards_stack",
				label: { kind: "translation", key: "outbound_options" },
				routes: OUTBOUND_OPTION_ROUTES,
			},
			{
				id: "inbound-options",
				icon: "cards_stack",
				label: { kind: "translation", key: "inbound_options" },
				routes: INBOUND_OPTION_ROUTES,
			},
			{
				id: "passenger-details",
				icon: "person",
				label: { kind: "translation", key: "customer_information" },
				routes: ["customer-information"],
			},
			{
				id: "insurance",
				icon: "shield_with_heart",
				label: { kind: "translation", key: "insurance_selection" },
				routes: ["insurance-selection"],
			},
			{
				id: "review-confirm",
				icon: "fact_check",
				label: { kind: "translation", key: "review_confirm_selection" },
				routes: ["confirmation"],
			},
			{
				id: "payment",
				icon: "shopping_cart",
				label: { kind: "translation", key: "payment_selection" },
				routes: ["payment-selection"],
			},
		],
	},
	connecting: {
		steps: [
			{
				id: "flight-selection",
				icon: "flight",
				label: { kind: "translation", key: "flight_selection" },
				routes: ["flight-selection"],
			},
			{
				id: "segment-1-options",
				icon: "cards_stack",
				label: { kind: "translation", key: "segment1_options" },
				routes: CONNECTING_SEGMENT_1_OPTION_ROUTES,
			},
			{
				id: "segment-2-options",
				icon: "cards_stack",
				label: { kind: "translation", key: "segment2_options" },
				routes: CONNECTING_SEGMENT_2_OPTION_ROUTES,
			},
			{
				id: "passenger-details",
				icon: "person",
				label: { kind: "translation", key: "customer_information" },
				routes: ["customer-information"],
			},
			{
				id: "insurance",
				icon: "shield_with_heart",
				label: { kind: "translation", key: "insurance_selection" },
				routes: ["insurance-selection"],
			},
			{
				id: "review-confirm",
				icon: "fact_check",
				label: { kind: "translation", key: "review_confirm_selection" },
				routes: ["confirmation"],
			},
			{
				id: "payment",
				icon: "shopping_cart",
				label: { kind: "translation", key: "payment_selection" },
				routes: ["payment-selection"],
			},
		],
	},
} as const satisfies BookingStepperFlowConfig;

export const resolveBookingStepperRoute = (pathname: string): BookingStepperRoute | undefined => {
	const segments = pathname.split("/").filter(Boolean);
	const primaryRoute = segments[1] ?? "";
	const secondaryRoute = segments[2] ?? "";
	const route = secondaryRoute ? `${primaryRoute}/${secondaryRoute}` : primaryRoute;

	return (route || undefined) as BookingStepperRoute | undefined;
};

export const resolveBookingStepperFlowType = ({
	route,
	tripType,
}: {
	route?: string;
	tripType?: TripType;
}): TripType => {
	if (tripType) {
		return tripType;
	}

	if (route?.includes("segment1") || route?.includes("segment2")) {
		return "connecting";
	}

	if (route?.includes("inbound")) {
		return "roundtrip";
	}

	return "oneway";
};

const resolveStepLabel = (t: TranslationFn, label: BookingStepperLabelSource): string => {
	if (label.kind === "translation") {
		return t(label.key);
	}

	return label.value;
};

export const getFlowSteps = (t: TranslationFn, flowType: TripType): StepItem[] =>
	BOOKING_STEPPER_FLOW_CONFIG[flowType].steps.map((step) => ({
		id: step.id,
		label: resolveStepLabel(t, step.label),
		icon: step.icon,
	}));

export const getBookingStepperCurrentStep = ({
	route,
	flowType,
}: {
	route?: BookingStepperRoute;
	flowType: TripType;
}): number | undefined => {
	if (!route) {
		return undefined;
	}

	const flow = BOOKING_STEPPER_FLOW_CONFIG[flowType].steps;
	const currentStep = flow.findIndex((step) => {
		const stepRoutes = step.routes as readonly BookingStepperRoute[];

		return stepRoutes.some((stepRoute) => stepRoute === route);
	});

	return currentStep === -1 ? undefined : currentStep;
};
