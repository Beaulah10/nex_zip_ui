import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Confirmation from "@/components/confirmation/confirmation";

const translations: Record<string, string> = {
	title: "Confirmation",
	subtitle: "Review before payment",
	taxes_label: "Taxes",
	taxes_note: "Tax note",
	toggle_summary_aria_label: "Toggle summary",
	toggle_taxes_aria_label: "Toggle taxes",
	unable_to_purchase_label: "Unable to purchase",
	add_button: "Add",
	label_total_amount: "Total Amount",
	payment_note: "Payment note",
	passenger_information_title: "Passenger Information",
	passenger_information_helper_text: "Helper",
	passenger_column_label: "Passenger",
	date_of_birth_column_label: "Date of birth",
	passport_number_column_label: "Passport number",
	expiry_date_column_label: "Expiry date",
	nationality_column_label: "Nationality",
	change_button: "Change",
	need_assistance_label: "Need assistance",
	toggle_passenger_information_aria_label: "Toggle passenger information",
	toggle_passenger_row_aria_label: "Toggle {name}",
	receipt_title: "Receipt",
	receipt_recipient_label: "Recipient",
	receipt_recipient_manual_option: "Enter manually",
	required_badge: "Required",
	optional_badge: "Optional",
	receipt_last_name_label: "Last Name",
	receipt_first_name_label: "First Name",
	receipt_middle_name_label: "Middle Name",
	receipt_half_width_alphabet_label: "Half-width alphabet",
	receipt_email_label: "Email address",
	receipt_email_confirmation_label: "Email confirmation",
	receipt_half_width_alphanumeric_label: "Half-width alphanumeric",
	receipt_email_helper_text: "Email helper",
	newsletter_label: "Newsletter",
	newsletter_caption: "Newsletter caption",
	precautions_title: "Precautions",
	precautions_purchases_title: "Purchases",
	precautions_onboarding_title: "Onboarding Rules",
	precautions_purchase_item_1: "Purchase item 1",
	precautions_purchase_item_2: "Purchase item 2",
	precautions_purchase_item_3: "Purchase item 3",
	precautions_purchase_item_4: "Purchase item 4",
	precautions_purchase_item_5: "Purchase item 5",
	precautions_purchase_item_6: "Purchase item 6",
	precautions_purchase_item_7: "Purchase item 7",
	precautions_onboarding_item_1: "Onboarding item 1",
	precautions_onboarding_item_2: "Onboarding item 2",
	precautions_onboarding_item_3: "Onboarding item 3",
	precautions_agree_label: "Agree to the notes regarding purchase and boarding",
	precautions_agree_checkbox_label: "Agree",
	precautions_agree_error_message:
		"Agreement to the important notes regarding purchase and boarding is required for your purchase.",
	purchase_agreement_required_title: "Purchase Agreement Required",
	purchase_agreement_required_message:
		"Before completing the booking, users must explicitly agree to the important notes related to purchase and boarding conditions.",
	button_proceed: "Proceed",
};

const translator = Object.assign(
	(key: string, values?: Record<string, string>) => {
		const normalizedKey = key.startsWith("error_labels.") ? key.replace("error_labels.", "") : key;

		if (key === "toggle_passenger_row_aria_label") {
			return `Toggle ${values?.name ?? ""}`.trim();
		}

		return translations[normalizedKey] ?? translations[key] ?? key;
	},
	{
		rich: (key: string) => {
			const normalizedKey = key.startsWith("error_labels.")
				? key.replace("error_labels.", "")
				: key;

			return translations[normalizedKey] ?? translations[key] ?? key;
		},
	}
);

const mockPush = vi.fn();
const mockValidateSelection = vi.fn(() => true);
const mockDispatch = vi.fn();

vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: () => translator,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/accordion", () => ({
	Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/checkbox", () => ({
	Checkbox: ({
		id,
		checked,
		onCheckedChange,
	}: {
		id: string;
		checked: boolean;
		onCheckedChange?: (checked: boolean) => void;
	}) => (
		<input
			id={id}
			type="checkbox"
			checked={checked}
			onChange={(event) => onCheckedChange?.(event.target.checked)}
		/>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: () => <div />,
}));

vi.mock("@repo/ui/components/separator", () => ({
	Separator: () => <hr />,
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/common/error-dialog/error-dialog", () => ({
	ErrorDialog: () => null,
}));

vi.mock("@/components/Arkose/simple-next", () => ({
	Arkose: () => null,
}));

vi.mock("@/components/common/booking-footer/booking-footer", () => ({
	BookingFooter: ({ onProceed }: { onProceed?: () => void }) => (
		<button type="button" onClick={onProceed}>
			Proceed
		</button>
	),
}));

vi.mock("@/components/common/loading-overlay/loading-overlay", () => ({
	LoadingOverlay: () => null,
}));

vi.mock("@/components/confirmation/flight-itinerary-card/flight-itinerary-card", () => ({
	FlightItineraryCard: () => <div>Itinerary</div>,
}));

vi.mock("@/components/confirmation/issuance-of-receipt/issuance-of-receipt", () => ({
	IssuanceOfReceipt: forwardRef<
		{ validateSelection: () => boolean; getRecipientInfo: () => object },
		object
	>(function MockReceipt(_props, ref) {
		useImperativeHandle(ref, () => ({
			validateSelection: mockValidateSelection,
			getRecipientInfo: () => ({
				firstName: "Test",
				lastName: "User",
				emailAddress: "test@example.com",
			}),
		}));
		return <div>Receipt</div>;
	}),
}));

vi.mock("@/components/confirmation/newsletter-subscription/newsletter-subscription", () => ({
	NewsletterSubscription: () => <div>Newsletter</div>,
}));

vi.mock("@/components/confirmation/precautions/precautions", () => ({
	Precautions: ({
		agreeCheckboxLabel,
		checked,
		onCheckedChange,
		showAgreementError,
		agreementCheckboxError,
	}: {
		agreeCheckboxLabel: string;
		checked: boolean;
		onCheckedChange?: (checked: boolean) => void;
		showAgreementError: boolean;
		agreementCheckboxError: string;
	}) => (
		<div>
			<label>
				{agreeCheckboxLabel}
				<input
					type="checkbox"
					aria-label={agreeCheckboxLabel}
					checked={checked}
					onChange={(event) => onCheckedChange?.(event.target.checked)}
				/>
			</label>
			{showAgreementError ? <div>{agreementCheckboxError}</div> : null}
		</div>
	),
}));

vi.mock("@/components/confirmation/passenger-information/passenger-information", () => ({
	PassengerInformation: () => <div>Passenger Information</div>,
}));

vi.mock("@/components/confirmation/passenger-summary-card/passenger-summary-card", () => ({
	PassengerSummaryCard: () => <div>Passenger Summary</div>,
}));

vi.mock("@/components/confirmation/taxes-summary-card/taxes-summary-card", () => ({
	TaxesSummaryCard: () => <div>Taxes Summary</div>,
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/passenger-info-dialog/passenger-information-dialog",
	() => ({
		PassengerInformationDialog: () => null,
	})
);

vi.mock("@/components/customize/inflight-meals/inflight-meals", () => ({
	InflightMeals: () => null,
}));

vi.mock("@/components/customize/baggage-service/baggage-service", () => ({
	BaggageService: () => null,
}));

vi.mock("@/components/customize/lounge-dialog/lounge-dialog", () => ({
	default: () => null,
}));

vi.mock("@/components/customize/priority-service/priority-service", () => ({
	PriorityServiceDialog: () => null,
}));

vi.mock("@/components/customize/seat-map/seat-map-dialog/seat-map-dialog", () => ({
	SeatMapDialog: () => null,
}));

vi.mock("@/components/customize/transport-service/transport-service", () => ({
	TransportService: () => null,
}));

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: () => ({ orderedPassengersWithNames: [] }),
}));

vi.mock("@/modules/hooks/common/priority-service/priority-service", () => ({
	usePriorityService: () => ({}),
}));

vi.mock("@/modules/hooks/common/service-passengers/service-passengers", () => ({
	useServicePassengers: () => ({ servicePassengers: [] }),
}));

vi.mock("@/modules/hooks/confirmation/use-confirmation-bundle-change", () => ({
	useConfirmationBundleChange: () => ({
		bundleErrorState: { open: false, title: "", content: "", buttonLabel: "", action: "close" },
		disabledBundleDirections: {},
		handleBundleChange: vi.fn(),
		handleBundleErrorOpenChange: vi.fn(),
		handleBundleErrorReturnToTop: vi.fn(),
	}),
}));

vi.mock("@/modules/hooks/confirmation/use-confirmation-baggage/use-confirmation-baggage", () => ({
	useConfirmationBaggage: () => ({
		handleBaggageChange: vi.fn(),
		handleBaggageErrorDialogClose: vi.fn(),
	}),
}));

vi.mock("@/modules/hooks/confirmation/use-confirmation-data", () => ({
	useConfirmationData: () => ({
		pageData: {
			outbound: {
				itinerary: { legLabel: "Outbound" },
				legLabel: "Outbound",
				passengers: [],
				totalAmount: 100,
				taxRows: [],
				taxTotalAmount: 0,
			},
			grandTotalAmount: 100,
			passengerInfoRows: [],
		},
		deadlineValidation: {
			type: "none",
			cleanupInstructions: [],
			modal: { title: "", message: "", buttonLabel: "", redirectPath: "/" },
		},
	}),
}));

vi.mock("@/modules/utils/helpers/airport", () => ({
	getAirportRouteLabel: () => "NRT - SFO",
}));

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingDirectionLabel: () => "Outbound",
	getBookingFlowType: () => "oneway",
	getBookingStageSegment: () => "segment1",
}));

vi.mock("@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment", () => ({
	getSelectedAncillarySegment: () => null,
}));

vi.mock("@/modules/utils/helpers/confirmation/confirmation", () => ({
	buildConfirmationCreateOrderRequest: vi.fn(),
	buildConfirmationOrderPrepareRequest: vi.fn(() => ({ passengers: [] })),
	buildConfirmationPassengerNameMap: vi.fn(() => new Map()),
	buildConfirmationSeatErrorState: vi.fn(),
	buildConfirmationSeatRouteLabel: () => "NRT - SFO",
	buildConfirmationSeatUnavailableErrorState: vi.fn(),
	getConfirmationAdjacentRequiredSeatPassengerIds: vi.fn(() => []),
	getConfirmationEmergencyExitRestrictedPassengerIds: () => [],
	getConfirmationSeatSegment: vi.fn(),
	getMissingConfirmationMealPassengerNames: vi.fn(() => []),
	getMissingConfirmationSeatPassengerNames: vi.fn(() => []),
	getUniquePassengerNames: vi.fn((...passengerNameGroups: string[][]) =>
		passengerNameGroups.flat()
	),
	prepareConfirmationSeatDialog: vi.fn(),
	resolveConfirmationTopProceedIssue: vi.fn(
		({ hasAgreementIssue }: { hasAgreementIssue?: boolean }) =>
			hasAgreementIssue ? "agreement" : "none"
	),
}));

vi.mock("@/modules/utils/helpers/confirmation/confirmation-lounge/confirmation-lounge", () => ({
	prepareConfirmationLoungeDialog: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/confirmation/confirmation-meal/confirmation-meal", () => ({
	detectMealAvailabilityIssue: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/confirmation/confirmation-priority/confirmation-priority", () => ({
	prepareConfirmationPriorityDialog: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/confirmation/lounge-availability/lounge-availability", () => ({
	resolveLoungeAvailabilityIssue: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/confirmation/priority-availability/priority-availability", () => ({
	resolvePriorityAvailabilityIssue: vi.fn(),
}));

vi.mock(
	"@/modules/utils/helpers/confirmation/transport-availability/transport-availability",
	() => ({
		resolveTransportAvailabilityIssue: vi.fn(),
	})
);

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `$${amount}`,
}));

vi.mock(
	"@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils",
	() => ({
		getBundleIncludedMealCodes: vi.fn(() => []),
	})
);

vi.mock("@/modules/utils/validations/confirmation/issuance-of-receipt", () => ({
	hasUsCanadaItinerary: () => false,
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mockDispatch,
	useAppSelector: (selector: (state?: unknown) => unknown) =>
		selector({ orderCreate: { isPending: false }, orderPrepare: { token: undefined } }),
}));

vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	buildRetrieveOfferAncillariesRequest: vi.fn(),
	fetchAncillaryOffers: { fulfilled: { match: () => false } },
}));

vi.mock("@/store/slices/confirmation/confirmation-disabled-flags.slice", () => ({
	saveConfirmationDisabledFlags: vi.fn(),
	selectConfirmationDisabledFlags: () => ({
		seat: {},
		baggage: {},
		extras: {},
		lounge: {},
		transport: {},
		priority: {},
		meal: [],
		bundle: {},
	}),
}));

vi.mock("@/store/slices/customer-information/passenger-selector/passenger-selector", () => ({
	selectPassengerList: () => [],
	selectPrimaryPassengerId: () => "pax-1",
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: () => ({
		currency: "JPY",
		language: "en",
		flights: { outbound: { segments: [] }, inbound: null },
	}),
}));

vi.mock("@/store/slices/order-create/order-create.slice", () => ({
	clearOrderCreate: vi.fn(() => ({ type: "orderCreate/clear" })),
	createOrder: Object.assign(vi.fn(), {
		fulfilled: { match: (action: { type?: string }) => action?.type === "orderCreate/fulfilled" },
	}),
	selectOrderCreateIsPending: (state: { orderCreate: { isPending: boolean } }) =>
		state.orderCreate.isPending,
}));

vi.mock("@/store/slices/order-prepare/order-prepare.slice", () => ({
	clearOrderPrepare: vi.fn(() => ({ type: "orderPrepare/clear" })),
	prepareOrder: Object.assign(
		vi.fn(() => ({ type: "orderPrepare/request" })),
		{
			fulfilled: {
				match: (action: { type?: string }) => action?.type === "orderPrepare/fulfilled",
			},
			rejected: {
				match: (action: { type?: string }) => action?.type === "orderPrepare/rejected",
			},
		}
	),
	selectOrderPrepareToken: (state: { orderPrepare: { token?: string } }) =>
		state.orderPrepare.token,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	removeSeat: vi.fn(),
	removeService: vi.fn(),
	removeExtrasService: vi.fn(),
	selectPassengers: () => [],
	setCommittedPassengerSelectionsTotal: vi.fn((amount: number) => ({
		type: "passenger/setCommittedPassengerSelectionsTotal",
		payload: amount,
	})),
}));

describe("Confirmation", () => {
	beforeEach(() => {
		mockPush.mockReset();
		mockValidateSelection.mockClear();
		mockDispatch.mockReset();
		mockDispatch.mockResolvedValue({
			type: "orderPrepare/fulfilled",
			payload: { data: { token: "arkose-token" } },
		});
	});

	it("blocks proceed and shows consent errors when agreement is unchecked", () => {
		render(<Confirmation />);

		fireEvent.click(screen.getByRole("button", { name: "Proceed" }));

		expect(screen.getByRole("alert")).toBeTruthy();
		expect(screen.getByText("Purchase Agreement Required")).toBeTruthy();
		expect(
			screen.getByText(
				"Agreement to the important notes regarding purchase and boarding is required for your purchase."
			)
		).toBeTruthy();
		expect(mockValidateSelection).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});
	it("dispatches prepare-order after agreement is checked", async () => {
		render(<Confirmation />);

		fireEvent.click(screen.getByLabelText("Agree"));
		fireEvent.click(screen.getByRole("button", { name: "Proceed" }));

		expect(
			screen.queryByText(
				"Agreement to the important notes regarding purchase and boarding is required for your purchase."
			)
		).toBeFalsy();

		expect(mockValidateSelection).toHaveBeenCalledTimes(1);

		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalled();
		});

		expect(mockPush).not.toHaveBeenCalled();
	});
});
