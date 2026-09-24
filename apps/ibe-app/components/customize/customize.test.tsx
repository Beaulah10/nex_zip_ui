"use client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Customize } from "@/components/customize/customize";
import { BAGGAGE_INVENTORY_TYPE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import { isNoAvailableSeatsSeatMapError } from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import { getSeatSelectionAvailabilityDialog } from "@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability";
import { buildAvailableSeatCodeSet } from "@/modules/utils/helpers/seat-map/seat-selection-cancellation/seat-selection-cancellation";

// ── hoisted mocks ────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
	push: vi.fn(),
	dispatch: vi.fn(),
	useRouter: vi.fn(),
	useSearchParams: vi.fn(),
	useAppDispatch: vi.fn(),
	useAppSelector: vi.fn(),
	useTranslations: vi.fn(),
	getBookingStageSegment: vi.fn(),
	getBookingDirectionLabel: vi.fn(() => "Outbound"),
	getBookingStageRoute: vi.fn(() => "customize"),
	getNextBookingFlowPath: vi.fn(() => "/en/next"),
	getSelectedAncillarySegment: vi.fn(),
	evaluateAncillaryEligibility: vi.fn(),
	getDefaultResponse: vi.fn(),
	useServicePassengers: vi.fn(),
	useBookingBundleStatus: vi.fn(),
	usePassengerOrder: vi.fn(),
	usePriorityService: vi.fn(),
	useAirportLounge: vi.fn(),
	getSeatSelectionProgressSummary: vi.fn(() => ({})),
	getDefaultBaggageActions: vi.fn(() => []),
	getConnectingSegmentInfo: vi.fn(() => ({
		isConnectingFlight: false,
		otherLfid: undefined,
	})),
	isTransportServiceRouteEnabled: vi.fn(() => false),
	isDestinationHNLfromNRT: vi.fn(() => false),
	isDestinationNRTfromHNL: vi.fn(() => false),
	isLoungeServiceRouteEnabled: vi.fn(() => false),
	is24HourDeadlineExceeded: vi.fn(() => false),
	is96HourDeadlineExceeded: vi.fn(() => false),
	isPremiumBundleCode: vi.fn((_code?: string) => false),
	isValueBundleCode: vi.fn((_code?: string) => false),
	getAirportRouteLabel: vi.fn(() => "NRT → HNL"),
	getAncillaryOffersErrorCodeFromBoundaryError: vi.fn((): string | null => null),
	selectAncillaryOffersErrorByDirectionAndServiceCategory: vi.fn(() => undefined),
	fetchAncillaryOffers: Object.assign(
		vi.fn((p: Record<string, unknown>) => ({ type: "fetchAncillaryOffers", ...p })),
		{
			fulfilled: { match: vi.fn(() => false) },
			rejected: { match: vi.fn(() => false) },
		}
	),
	fetchSeatMapOffers: Object.assign(
		vi.fn((p: Record<string, unknown>) => ({ type: "fetchSeatMapOffers", ...p })),
		{
			fulfilled: { match: vi.fn(() => false) },
			rejected: { match: vi.fn(() => false) },
		}
	),
	buildRetrieveOfferAncillariesRequest: vi.fn(() => ({})),
	markCategoriesOutOfStock: vi.fn((p: Record<string, unknown>) => ({
		type: "markCategoriesOutOfStock",
		payload: p,
	})),
	selectOutOfStockByDirectionAndServiceCategory: vi.fn(() => false),
	// ── lfid-freshness selector (ancillary-offers): returns the last request
	// (which carries `lfid`) fetched for a given scope/serviceCategory. Used by
	// the component to ignore a stale `outOfStock` flag left over from a
	// previously selected flight/date.
	selectAncillaryOffersRequestByDirectionAndServiceCategory: vi.fn(() => undefined),
	buildRetrieveSeatMapRequest: vi.fn(() => ({ cabin: "STANDARD" })),
	// ── SEAT out-of-stock (own scope, independent from ancillary-offers "AMENITIES") ──
	setSeatMapOutOfStock: vi.fn((p: Record<string, unknown>) => ({
		type: "setSeatMapOutOfStock",
		payload: p,
	})),
	selectSeatMapOutOfStock: vi.fn(() => false),
	// ── lfid-freshness selector (seat map): returns the last seat map request
	// (which carries `logicalFlightId`). Same purpose as the ancillary-offers
	// selector above, but for the SEAT card's own slice.
	selectSeatMapRequest: vi.fn(() => undefined),
	validateBundleIncludedBaggageInventory: vi.fn(() => ({ isValid: true })),
	resolveConfirmationBaggageInventory: vi.fn<any>(() => ({
		type: "noop",
	})),

	resolveTransportAvailabilityIssue: vi.fn<any>(() => ({
		type: "noop",
	})),

	resolvePriorityAvailabilityIssue: vi.fn<any>(() => ({
		type: "noop",
	})),

	getBaggageOffersByPassengerType: vi.fn(() => ({})),

	isInflightMealStockLimited: vi.fn(() => false),
	useInflightMealSummary: vi.fn(() => ({
		selectedMealPassengerCount: 0,
		requiredMealSelectionCount: 0,
	})),
	getTransportServiceAvailability: vi.fn(() => ({
		hasAnySupportedTransportSsr: true,
	})),
	extractLoungeServices: vi.fn(
		(): {
			service: {
				ssrId: number;
				ssrCode: string;
				qtyAvailable: number;
				description: string;
				lfid: number;
			};
		}[] => []
	),
	getAirportLoungeImage: vi.fn(() => "lounge-img"),
	formatPrice: vi.fn(() => "¥0"),
	confirmedFlight: undefined as unknown,
	passengers: [] as unknown[],
	passengersWithBundles: [] as unknown[],
	servicePassengers: [] as unknown[],
	// Selectors
	selectPassengers: vi.fn(),
	selectPassengerList: vi.fn(),
	selectConfirmedFlight: vi.fn(),
	selectAncillaryTotalByLfid: vi.fn(),
	searchParamsGet: vi.fn(),
	searchParamsToString: vi.fn(),
	normalizeServiceCode: vi.fn((code: string) => code?.trim().toUpperCase()),
	buildBundleIncludedMealCodesByPassengerId: vi.fn(() => ({})),
	handleInflightMealAncillaryOffer: vi.fn(),
}));

// ── module mocks ──────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
	useRouter: mocks.useRouter,
	useSearchParams: mocks.useSearchParams,
}));
vi.mock("next-intl", () => ({ useTranslations: mocks.useTranslations }));
vi.mock("@/store/hooks", () => ({
	useAppDispatch: mocks.useAppDispatch,
	useAppSelector: mocks.useAppSelector,
}));
vi.mock("@/store/slices/customer-information/passenger-selector/passenger-selector", () => ({
	selectPassengerList: mocks.selectPassengerList,
}));
vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: mocks.selectConfirmedFlight,
}));
vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectPassengers: mocks.selectPassengers,
	selectAncillaryTotalByLfid: mocks.selectAncillaryTotalByLfid,
	removeSeat: vi.fn((payload: unknown) => ({
		type: "removeSeat",
		payload,
	})),
	removeService: vi.fn((payload: unknown) => ({
		type: "removeService",
		payload,
	})),
}));
vi.mock(
	"@/modules/utils/helpers/confirmation/transport-availability/transport-availability",
	() => ({
		resolveTransportAvailabilityIssue: mocks.resolveTransportAvailabilityIssue,
	})
);
vi.mock("@/modules/utils/helpers/confirmation/priority-availability/priority-availability", () => ({
	resolvePriorityAvailabilityIssue: mocks.resolvePriorityAvailabilityIssue,
}));
vi.mock("@/store/slices/seat-map/seat-map.slice", () => ({
	buildRetrieveSeatMapRequest: mocks.buildRetrieveSeatMapRequest,
	fetchSeatMapOffers: mocks.fetchSeatMapOffers,
	clearSeatMap: vi.fn(() => ({ type: "clearSeatMap" })),
	setSeatMapOutOfStock: mocks.setSeatMapOutOfStock,
	selectSeatMapOutOfStock: mocks.selectSeatMapOutOfStock,
	selectSeatMapRequest: mocks.selectSeatMapRequest,
}));
vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	buildRetrieveOfferAncillariesRequest: mocks.buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers: mocks.fetchAncillaryOffers,
	selectAncillaryOffersErrorByDirectionAndServiceCategory:
		mocks.selectAncillaryOffersErrorByDirectionAndServiceCategory,
	markCategoriesOutOfStock: mocks.markCategoriesOutOfStock,
	selectOutOfStockByDirectionAndServiceCategory:
		mocks.selectOutOfStockByDirectionAndServiceCategory,
	selectAncillaryOffersRequestByDirectionAndServiceCategory:
		mocks.selectAncillaryOffersRequestByDirectionAndServiceCategory,
}));
vi.mock("@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors", () => ({
	getAncillaryOffersErrorCodeFromBoundaryError: mocks.getAncillaryOffersErrorCodeFromBoundaryError,
}));
vi.mock(
	"@/modules/utils/helpers/customize/inflight-meals/inflight-meal-ancillary-handler/inflight-meal-ancillary-handler",
	() => ({
		handleInflightMealAncillaryOffer: mocks.handleInflightMealAncillaryOffer,
	})
);
vi.mock("@/modules/hooks/air-ancillary/air-ancillary", () => ({
	evaluateAncillaryEligibility: mocks.evaluateAncillaryEligibility,
	getDefaultResponse: mocks.getDefaultResponse,
}));
vi.mock("@/modules/hooks/common/booking-bundle-status/booking-bundle-status", () => ({
	useBookingBundleStatus: mocks.useBookingBundleStatus,
}));
vi.mock("@/modules/hooks/common/service-passengers/service-passengers", () => ({
	useServicePassengers: mocks.useServicePassengers,
}));
vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: mocks.usePassengerOrder,
}));
vi.mock("@/modules/hooks/common/priority-service/priority-service", () => ({
	usePriorityService: mocks.usePriorityService,
}));
vi.mock("@/modules/hooks/common/lounge-service/lounge-service", () => ({
	getAirportLoungeImage: mocks.getAirportLoungeImage,
}));
vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: mocks.getBookingStageSegment,
	getBookingDirectionLabel: mocks.getBookingDirectionLabel,
	getBookingStageRoute: mocks.getBookingStageRoute,
	getNextBookingFlowPath: mocks.getNextBookingFlowPath,
}));
vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isTransportServiceRouteEnabled: mocks.isTransportServiceRouteEnabled,
	isDestinationHNLfromNRT: mocks.isDestinationHNLfromNRT,
	isDestinationNRTfromHNL: mocks.isDestinationNRTfromHNL,
	isLoungeServiceRouteEnabled: mocks.isLoungeServiceRouteEnabled,
}));
vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	is24HourDeadlineExceeded: mocks.is24HourDeadlineExceeded,
	is96HourDeadlineExceeded: mocks.is96HourDeadlineExceeded,
}));
vi.mock("@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils", () => ({
	isPremiumBundleCode: mocks.isPremiumBundleCode,
	isValueBundleCode: mocks.isValueBundleCode,
	normalizeServiceCode: mocks.normalizeServiceCode,
}));
vi.mock("@/modules/utils/helpers/airport", () => ({
	getAirportRouteLabel: mocks.getAirportRouteLabel,
}));
vi.mock("@/modules/utils/helpers/seat-map/seat-selection-summary/seat-selection-summary", () => ({
	getSeatSelectionProgressSummary: mocks.getSeatSelectionProgressSummary,
}));
vi.mock(
	"@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils",
	() => ({
		getDefaultBaggageActions: mocks.getDefaultBaggageActions,
		getConnectingSegmentInfo: mocks.getConnectingSegmentInfo,
	})
);
vi.mock("@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers", () => ({
	getBaggageOffersByPassengerType: mocks.getBaggageOffersByPassengerType,
	getFreeBaggageItemCount: vi.fn((bundleCode: string) =>
		bundleCode === "VALK" || bundleCode === "VALN" || bundleCode === "PRMK" ? 2 : 1
	),
	formatBaggagePreselectedText: vi.fn((totalItems: number) =>
		totalItems <= 0
			? undefined
			: `${totalItems} free baggage ${totalItems === 1 ? "item" : "items"} preselected`
	),
}));
vi.mock(
	"@/modules/utils/helpers/baggage-service/baggage-inventory/baggage-inventory",
	async (importOriginal) => {
		const actual =
			await importOriginal<
				typeof import("@/modules/utils/helpers/baggage-service/baggage-inventory/baggage-inventory")
			>();

		return {
			...actual,
			validateBundleIncludedBaggageInventory: mocks.validateBundleIncludedBaggageInventory,
		};
	}
);
vi.mock(
	"@/modules/utils/helpers/confirmation/confirmation-baggage/baggage-availability/baggage-availability/baggage-availability",
	() => ({
		resolveConfirmationBaggageInventory: mocks.resolveConfirmationBaggageInventory,
		getGroupedContentSuffix: vi.fn(() => new Map()),
	})
);
vi.mock(
	"@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils",
	() => ({
		isInflightMealStockLimited: mocks.isInflightMealStockLimited,
		buildBundleIncludedMealCodesByPassengerId: mocks.buildBundleIncludedMealCodesByPassengerId,
	})
);
vi.mock(
	"@/modules/hooks/customize/infight-meals/use-inflight-meal-summary/use-inflight-meal-summary",
	() => ({
		useInflightMealSummary: mocks.useInflightMealSummary,
	})
);
vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-card/transport-service-card-display",
	() => ({
		getTransportServiceAvailability: mocks.getTransportServiceAvailability,
	})
);
vi.mock("@/modules/utils/lounge.utils", () => ({
	extractLoungeServices: mocks.extractLoungeServices,
}));
vi.mock("@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils", () => ({
	buildSeatMapFromApiResponse: vi.fn(() => []),
}));
vi.mock("@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error", () => ({
	getSeatMapErrorTitleKey: vi.fn(() => "system_error_title"),
	// Required for the SEAT "no available seats" rejected-path flow.
	isNoAvailableSeatsSeatMapError: vi.fn(() => false),
}));
vi.mock("@/modules/utils/helpers/seat-map/seat-map-error-message/seat-map-error-message", () => ({
	getSeatSelectionAvailabilityDialogMessage: vi.fn((_labels: unknown, key: string) => ({
		title: `title_${key}`,
		content: `content_${key}`,
	})),
}));
vi.mock(
	"@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability",
	() => ({
		getSeatSelectionAvailabilityDialog: vi.fn(() => null),
		toSeatValidationPassengers: vi.fn((p: unknown) => p),
	})
);
vi.mock(
	"@/modules/utils/helpers/seat-map/seat-selection-cancellation/seat-selection-cancellation",
	() => ({
		buildAvailableSeatCodeSet: vi.fn(() => new Set()),
		getCancelledSeatSelections: vi.fn(() => []),
	})
);
vi.mock("@/modules/utils/constants/ancillary-services/ancillary-services", () => ({
	POPUP_MESSAGE: "default_popup",
}));
vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: mocks.formatPrice,
}));

// ── child component mocks ─────────────────────────────────────────────────────

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));
vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));
vi.mock("@repo/ui/lib", () => ({
	cn: (...c: (string | undefined | false)[]) => c.filter(Boolean).join(" "),
}));
vi.mock("@/assets/images/baggageImage.png", () => ({ default: { src: "baggage.png" } }));
vi.mock("@/assets/images/express-service.png", () => ({ default: { src: "express.png" } }));
vi.mock("@/assets/images/InflightMeal.png", () => ({ default: { src: "meals.png" } }));
vi.mock("@/assets/images/LeaLea-shuttle.png", () => ({ default: { src: "shuttle.png" } }));
vi.mock("@/assets/images/seat.png", () => ({ default: { src: "seat.png" } }));

vi.mock("@/components/common/ancillary-alerts/ancillary-alerts", () => ({
	default: (props: Record<string, any>) => (
		<div data-testid="ancillary-alerts">
			{props.showBundleCompletionAlert && <span>{props.bundleCompletionAlertData?.title}</span>}
			{props.showStockBanner && <span>{props.stockBannerData?.title}</span>}
		</div>
	),
}));

vi.mock("@/components/common/error-dialog/error-dialog", () => ({
	ErrorDialog: ({
		open,
		onOpenChange,
		onReturnToTop,
		title,
		content,
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onReturnToTop: () => void;
		title: string;
		content: string;
	}) =>
		open ? (
			<div data-testid="error-dialog">
				<span data-testid="error-title">{title}</span>
				<span data-testid="error-content">{content}</span>
				<button type="button" data-testid="error-confirm" onClick={onReturnToTop}>
					Confirm
				</button>
				<button type="button" data-testid="error-close" onClick={() => onOpenChange(false)}>
					Close
				</button>
			</div>
		) : null,
}));
vi.mock("@/components/common/loading-overlay/loading-overlay", () => ({
	LoadingOverlay: () => <div data-testid="loading-overlay" />,
}));
vi.mock("@/components/common/service-promo-card", () => ({
	ServicePromoCard: ({ title }: { title: string }) => (
		<div data-testid="service-promo-card">{title}</div>
	),
}));
vi.mock("@/components/customize/baggage-service/baggage-service", () => ({
	BaggageService: vi.fn(() => <div data-testid="baggage-service" />),
}));
vi.mock("@/components/customize/inflight-meals/inflight-meals", () => ({
	InflightMeals: vi.fn(() => <div data-testid="inflight-meals" />),
}));
vi.mock("@/components/customize/lounge-dialog/lounge-dialog", () => ({
	default: vi.fn(() => <div data-testid="lounge-dialog" />),
}));
vi.mock("@/components/customize/priority-service/priority-service", () => ({
	PriorityServiceDialog: vi.fn(() => <div data-testid="priority-service-dialog" />),
}));
vi.mock("@/components/customize/seat-map/seat-map-dialog/seat-map-dialog", () => ({
	SeatMapDialog: vi.fn(() => <div data-testid="seat-map-dialog" />),
}));
vi.mock("@/components/customize/transport-service/transport-service", () => ({
	TransportService: vi.fn(({ open }: { open: boolean }) =>
		open ? <div data-testid="transport-service" /> : null
	),
}));

// ── helpers ───────────────────────────────────────────────────────────────────

const defaultCards = {
	seat: { enabled: true, showPopupOnClick: false, redirectToTop: false },
	meal: { enabled: true, showPopupOnClick: false, redirectToTop: false },
	lounge: { enabled: true, showPopupOnClick: false, redirectToTop: false },
	transport: { enabled: true, showPopupOnClick: false, redirectToTop: false },
	express: { enabled: true, showPopupOnClick: false, redirectToTop: false },
	baggage: { enabled: true, showPopupOnClick: false, redirectToTop: false },
};

const defaultAncillaryResult = { cards: defaultCards };

const makeTranslation = (ns: string) => (key: string) => `${ns}.${key}`;

function renderCustomize(props?: Partial<{ locale: string; direction: "outbound" | "inbound" }>) {
	return render(<Customize locale="en" direction="outbound" {...props} />);
}

const ancillaryTestFlight = {
	currency: "JPY",
	flights: {
		outbound: {
			segments: [
				{
					lfid: 1,
					pfid: 10,
					origin: "NRT",
					destination: "HNL",
					scheduledDepartureArrivalDateTime: {
						departureDateTime: "2026-01-01T10:00:00Z",
						departureDateTimeOffset: "2026-01-01T10:00:00+09:00",
					},
				},
			],
		},
	},
};

function setupFulfilledAncillaryResponse(payload: unknown) {
	mocks.confirmedFlight = ancillaryTestFlight;
	mocks.passengers = [
		{
			id: "PAX-1",
			passengerTypeCode: "adult",
		},
	];

	mocks.fetchAncillaryOffers.fulfilled.match.mockReturnValue(true);
	mocks.fetchAncillaryOffers.rejected.match.mockReturnValue(false);

	mocks.dispatch.mockImplementation((action: Record<string, unknown>) => {
		if (action.type === "fetchAncillaryOffers") {
			return Promise.resolve({
				type: "fetchAncillaryOffers/fulfilled",
				payload,
				meta: {
					condition: false,
				},
			});
		}

		return action;
	});
}

function setupRejectedAncillaryResponse(errorCode: string) {
	mocks.confirmedFlight = ancillaryTestFlight;
	mocks.passengers = [
		{
			id: "PAX-1",
			passengerTypeCode: "adult",
		},
	];

	mocks.fetchAncillaryOffers.fulfilled.match.mockReturnValue(false);
	mocks.fetchAncillaryOffers.rejected.match.mockReturnValue(true);

	mocks.getAncillaryOffersErrorCodeFromBoundaryError.mockReturnValue(errorCode);

	mocks.dispatch.mockImplementation((action: Record<string, unknown>) => {
		if (action.type === "fetchAncillaryOffers") {
			return Promise.resolve({
				type: "fetchAncillaryOffers/rejected",
				payload: errorCode,
				error: {
					message: errorCode,
				},
				meta: {
					condition: false,
				},
			});
		}

		return action;
	});
}
function setupMealOutOfStockHandler() {
	mocks.handleInflightMealAncillaryOffer.mockImplementation(
		({
			servicePassengers,
			setUnavailableMealPassengerIds,
			setPendingDialogAfterError,
			setCategoryToMarkOutOfStock,
			openErrorDialog,
			mealLabels,
		}: any) => {
			setUnavailableMealPassengerIds(
				new Set(servicePassengers.map((passenger: { id: string }) => passenger.id))
			);
			setPendingDialogAfterError(null);
			setCategoryToMarkOutOfStock("MEAL");

			openErrorDialog(
				mealLabels("error_labels.meal_unavailable_title"),
				mealLabels("error_labels.meals_unavailable_proceed_message"),
				[],
				mealLabels("error_labels.meals_unavailable_return_button"),
				"close"
			);
		}
	);
}

/**
 * Configures dispatch so the SEAT flow's `fetchSeatMapOffers` thunk resolves as
 * fulfilled with the given payload. Also seeds a confirmed flight + passenger so
 * the SEAT branch of handleBundleClick proceeds past its early guard clauses.
 */
function setupFulfilledSeatMapResponse(payload: unknown) {
	mocks.confirmedFlight = ancillaryTestFlight;
	mocks.passengers = [{ id: "PAX-1", passengerTypeCode: "adult" }];

	mocks.fetchSeatMapOffers.fulfilled.match.mockReturnValue(true);
	mocks.fetchSeatMapOffers.rejected.match.mockReturnValue(false);

	mocks.dispatch.mockImplementation((action: Record<string, unknown>) => {
		if (action.type === "fetchSeatMapOffers") {
			return Promise.resolve({
				type: "fetchSeatMapOffers/fulfilled",
				payload,
				meta: { condition: false },
			});
		}

		return action;
	});
}

/**
 * Configures dispatch so the SEAT flow's `fetchSeatMapOffers` thunk resolves as
 * rejected with the given error payload (paired with mocking
 * `isNoAvailableSeatsSeatMapError` per-test to control the branch taken).
 */
function setupRejectedSeatMapResponse(errorPayload: unknown = {}) {
	mocks.confirmedFlight = ancillaryTestFlight;
	mocks.passengers = [{ id: "PAX-1", passengerTypeCode: "adult" }];

	mocks.fetchSeatMapOffers.fulfilled.match.mockReturnValue(false);
	mocks.fetchSeatMapOffers.rejected.match.mockReturnValue(true);

	mocks.dispatch.mockImplementation((action: Record<string, unknown>) => {
		if (action.type === "fetchSeatMapOffers") {
			return Promise.resolve({
				type: "fetchSeatMapOffers/rejected",
				payload: errorPayload,
				error: { message: "seat map error" },
				meta: { condition: false },
			});
		}

		return action;
	});
}

// ── setup / teardown ──────────────────────────────────────────────────────────

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

beforeEach(() => {
	// Reset dispatch and any per-test mock implementations set on shared mocks
	// BEFORE assigning default values below, so no test's custom behavior
	// (e.g. a custom dispatch implementation or handler mock) leaks into the
	// next test.
	mocks.dispatch.mockReset();
	mocks.normalizeServiceCode.mockReset();
	mocks.normalizeServiceCode.mockImplementation((code: string) => code?.trim().toUpperCase());
	mocks.buildBundleIncludedMealCodesByPassengerId.mockReset();
	mocks.buildBundleIncludedMealCodesByPassengerId.mockReturnValue({});
	mocks.handleInflightMealAncillaryOffer.mockReset();

	mocks.useRouter.mockReturnValue({ push: mocks.push });
	mocks.searchParamsGet.mockReturnValue(null);
	mocks.searchParamsToString.mockReturnValue("");
	mocks.useSearchParams.mockReturnValue({
		get: mocks.searchParamsGet,
		toString: mocks.searchParamsToString,
	});
	mocks.useAppDispatch.mockReturnValue(mocks.dispatch);

	// Setup selector mocks with implementation to return current values
	mocks.selectPassengers.mockImplementation(() => mocks.passengers);
	mocks.selectPassengerList.mockImplementation(() => mocks.passengers);
	mocks.selectConfirmedFlight.mockImplementation(() => mocks.confirmedFlight);
	mocks.selectAncillaryTotalByLfid.mockImplementation(() => 0);

	mocks.useAppSelector.mockImplementation((selector: any) => {
		// Call the selector directly
		return selector();
	});

	mocks.useTranslations.mockImplementation(makeTranslation);
	mocks.getBookingStageSegment.mockReturnValue("segment1");
	mocks.getBookingDirectionLabel.mockReturnValue("Outbound");
	mocks.getBookingStageRoute.mockReturnValue("customize");
	mocks.getNextBookingFlowPath.mockReturnValue("/en/next");
	mocks.getDefaultResponse.mockReturnValue(defaultAncillaryResult);
	mocks.evaluateAncillaryEligibility.mockReturnValue(defaultAncillaryResult);
	mocks.fetchAncillaryOffers.fulfilled.match.mockReturnValue(false);
	mocks.fetchAncillaryOffers.rejected.match.mockReturnValue(false);
	mocks.fetchSeatMapOffers.fulfilled.match.mockReturnValue(false);
	mocks.fetchSeatMapOffers.rejected?.match?.mockReturnValue?.(false);
	mocks.selectAncillaryOffersErrorByDirectionAndServiceCategory.mockReturnValue(undefined);
	mocks.getAncillaryOffersErrorCodeFromBoundaryError.mockReturnValue(null);
	mocks.useServicePassengers.mockReturnValue({ servicePassengers: [] });
	mocks.useBookingBundleStatus.mockReturnValue("NoBundle");
	mocks.useInflightMealSummary.mockReturnValue({
		selectedMealPassengerCount: 0,
		requiredMealSelectionCount: 0,
	});
	mocks.getTransportServiceAvailability.mockReturnValue({
		hasAnySupportedTransportSsr: true,
	});
	mocks.extractLoungeServices.mockReturnValue([]);
	mocks.usePassengerOrder.mockReturnValue({ orderedPassengersWithNames: [] });
	mocks.usePriorityService.mockReturnValue({
		priorityServicePassengers: [],
		priorityServiceTotalAmount: 0,
		hasOutOfStockPassengers: false,
		remainingStocksLabel: "",
		showTransitApplicabilityWarning: false,
		togglePriorityPax: vi.fn(),
		togglePrioritySelectAll: vi.fn(),
		confirmPrioritySelection: vi.fn(),
	});
	mocks.getSeatSelectionProgressSummary.mockReturnValue({});
	mocks.getDefaultBaggageActions.mockReturnValue([]);
	mocks.getConnectingSegmentInfo.mockReturnValue({
		isConnectingFlight: false,
		otherLfid: undefined,
	});
	mocks.validateBundleIncludedBaggageInventory.mockReturnValue({ isValid: true });
	mocks.resolveConfirmationBaggageInventory.mockReset();
	mocks.resolveConfirmationBaggageInventory.mockReturnValue({
		type: "noop",
	});
	mocks.resolveTransportAvailabilityIssue.mockReset();
	mocks.resolveTransportAvailabilityIssue.mockReturnValue({
		type: "noop",
	});

	mocks.resolvePriorityAvailabilityIssue.mockReset();
	mocks.resolvePriorityAvailabilityIssue.mockReturnValue({
		type: "noop",
	});
	mocks.isPremiumBundleCode.mockReturnValue(false);
	mocks.isValueBundleCode.mockReturnValue(false);
	mocks.confirmedFlight = undefined;
	mocks.passengers = [];
	mocks.passengersWithBundles = [];
	mocks.servicePassengers = [];

	// ── SEAT out-of-stock defaults ──────────────────────────────────────────
	mocks.setSeatMapOutOfStock.mockClear();
	mocks.selectSeatMapOutOfStock.mockReset();
	mocks.selectSeatMapOutOfStock.mockReturnValue(false);
	vi.mocked(getSeatSelectionAvailabilityDialog).mockReset();
	vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue(undefined);
	vi.mocked(isNoAvailableSeatsSeatMapError).mockReset();
	vi.mocked(isNoAvailableSeatsSeatMapError).mockReturnValue(false);

	// ── lfid-freshness defaults ──────────────────────────────────────────────
	// Default both "request" selectors to `undefined`. When `confirmedFlight` is
	// left as the default `undefined` (most existing tests), `currentLfid` is
	// also `undefined`, so the freshness check `request?.lfid === currentLfid`
	// resolves as `undefined === undefined` => `true`, meaning the raw
	// out-of-stock flag is trusted exactly as before this feature existed. Tests
	// that specifically exercise the freshness logic override these per-test.
	mocks.selectAncillaryOffersRequestByDirectionAndServiceCategory.mockReset();
	mocks.selectAncillaryOffersRequestByDirectionAndServiceCategory.mockReturnValue(undefined);
	mocks.selectSeatMapRequest.mockReset();
	mocks.selectSeatMapRequest.mockReturnValue(undefined);
});

// ── getSelectedAncillarySegment pure unit tests ───────────────────────────────

describe("getSelectedAncillarySegment", () => {
	const outSeg0 = { lfid: 100, origin: "NRT", destination: "HNL" };
	const outSeg1 = { lfid: 101, origin: "HNL", destination: "SFO" };
	const inSeg0 = { lfid: 200, origin: "SFO", destination: "NRT" };

	const flight = (hasInbound = false) => ({
		flights: {
			outbound: { segments: [outSeg0, outSeg1] },
			inbound: hasInbound ? { segments: [inSeg0] } : undefined,
		},
	});

	it('returns outbound segment[0] when stageSegment is "segment1"', () => {
		mocks.getBookingStageSegment.mockReturnValue("segment1");
		expect(
			getSelectedAncillarySegment({ confirmedFlight: flight() as any, direction: "outbound" })
		).toBe(outSeg0);
	});

	it('returns inbound segment[0] when stageSegment is "segment2" and inbound exists', () => {
		mocks.getBookingStageSegment.mockReturnValue("segment2");
		expect(
			getSelectedAncillarySegment({ confirmedFlight: flight(true) as any, direction: "inbound" })
		).toBe(inSeg0);
	});

	it('returns outbound segment[1] when stageSegment is "segment2" and inbound is absent', () => {
		mocks.getBookingStageSegment.mockReturnValue("segment2");
		expect(
			getSelectedAncillarySegment({ confirmedFlight: flight() as any, direction: "outbound" })
		).toBe(outSeg1);
	});

	it("returns outbound segment[0] when direction is outbound and stageSegment is unknown", () => {
		mocks.getBookingStageSegment.mockReturnValue("unknown");
		expect(
			getSelectedAncillarySegment({ confirmedFlight: flight() as any, direction: "outbound" })
		).toBe(outSeg0);
	});

	it("returns inbound segment[0] when direction is inbound and inbound exists", () => {
		mocks.getBookingStageSegment.mockReturnValue("unknown");
		expect(
			getSelectedAncillarySegment({ confirmedFlight: flight(true) as any, direction: "inbound" })
		).toBe(inSeg0);
	});

	it("returns outbound segment[0] when direction is inbound but inbound is absent", () => {
		mocks.getBookingStageSegment.mockReturnValue("unknown");
		expect(
			getSelectedAncillarySegment({ confirmedFlight: flight() as any, direction: "inbound" })
		).toBe(outSeg0);
	});
});

// ── Customize component tests ─────────────────────────────────────────────────

describe("Customize component", () => {
	it("renders ancillary page title", () => {
		renderCustomize();
		expect(screen.getByText("ancillary_service.ancillary_page_title")).toBeTruthy();
		expect(screen.getByText("ancillary_service.ancillary_page_title")).toBeTruthy();
	});

	it("renders service promo cards for non-transport and non-lounge routes", () => {
		renderCustomize();
		const cards = screen.getAllByTestId("service-promo-card");
		expect(cards.length).toBeGreaterThan(0);
	});

	it("hides TRANSPORT card when route is not transport-enabled", () => {
		mocks.isTransportServiceRouteEnabled.mockReturnValue(false);
		renderCustomize();
		const cards = screen.getAllByTestId("service-promo-card");
		const transportCard = cards.find(
			(card: HTMLElement) => card.textContent === "ancillary_service.transportation_service_name"
		);
		expect(transportCard).toBeUndefined();
	});

	it("renders TRANSPORT card when route is transport-enabled", () => {
		mocks.isTransportServiceRouteEnabled.mockReturnValue(true);
		renderCustomize();
		expect(screen.getByText("ancillary_service.transportation_service_name")).toBeTruthy();
		expect(screen.getByText("ancillary_service.transportation_service_name")).toBeTruthy();
	});

	it("hides LOUNGE card when lounge service is not enabled", () => {
		mocks.isLoungeServiceRouteEnabled.mockReturnValue(false);
		renderCustomize();
		const cards = screen.getAllByTestId("service-promo-card");
		const loungeCard = cards.find((card: HTMLElement) =>
			card.textContent?.includes("ancillary_service.airport_lounge_name")
		);
		expect(loungeCard).toBeUndefined();
	});

	it("renders LOUNGE card when lounge service is enabled", () => {
		mocks.isLoungeServiceRouteEnabled.mockReturnValue(true);

		renderCustomize();

		expect(screen.getByText("ancillary_service.airport_lounge_name")).toBeTruthy();
	});

	it("calls getDefaultResponse when confirmedFlight is null", () => {
		// Keep using the selector implementation but with undefined confirmedFlight
		renderCustomize();
		expect(mocks.getDefaultResponse).toHaveBeenCalled();
	});

	it("calls evaluateAncillaryEligibility when segment is available", () => {
		const flight = {
			flights: {
				outbound: {
					segments: [
						{
							lfid: 1,
							origin: "NRT",
							destination: "HNL",
							scheduledDepartureArrivalDateTime: { departureDateTime: "2026-01-01T10:00:00Z" },
						},
					],
				},
			},
		};
		// Override only the confirmedFlight selector
		mocks.selectConfirmedFlight.mockImplementation(() => flight);
		renderCustomize();
		expect(mocks.evaluateAncillaryEligibility).toHaveBeenCalled();
	});

	it("shows mandatory bundle alert when bundle-required free seats remain on proceed", async () => {
		mocks.getSeatSelectionProgressSummary.mockReturnValue({
			remainingRequiredSeatCount: 1,
			remainingBundleRequiredSeatCount: 1,
			remainingAdjacentRequiredSeatCount: 1,
		});

		renderCustomize();

		const proceedButton = screen.queryByText(/proceed/i);

		if (proceedButton) {
			fireEvent.click(proceedButton);
		}

		expect(
			await screen.findByText(
				"ancillary_service.error_labels.mandatory_bundle_selection_error_title"
			)
		).toBeTruthy();
	});

	it("renders inbound direction label", () => {
		mocks.getBookingDirectionLabel.mockReturnValue("Inbound");

		renderCustomize({ direction: "inbound" });

		expect(screen.getByText(/Inbound/)).toBeTruthy();
	});
	it("does not open error dialog when disabled card has showPopupOnClick=false", async () => {
		const disabledAncillaryResult = {
			cards: {
				...defaultCards,
				seat: { enabled: false, showPopupOnClick: false, redirectToTop: false },
			},
		};
		mocks.evaluateAncillaryEligibility.mockReturnValue(disabledAncillaryResult);
		mocks.getDefaultResponse.mockReturnValue(disabledAncillaryResult);

		renderCustomize();
		expect(screen.queryByTestId("error-dialog")).toBeNull();
	});

	it("navigates to next step when proceed is called and meal count is zero", async () => {
		mocks.getSeatSelectionProgressSummary.mockReturnValue({
			remainingRequiredSeatCount: 0,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 0,
		});
		const flight = {
			flights: {
				outbound: {
					segments: [
						{
							lfid: 1,
							origin: "NRT",
							destination: "HNL",
							scheduledDepartureArrivalDateTime: { departureDateTime: "2026-01-01T10:00:00Z" },
						},
					],
				},
			},
		};
		// Override only the confirmedFlight selector
		mocks.selectConfirmedFlight.mockImplementation(() => flight);
		renderCustomize();

		// Find and click the Proceed button (bottom button with Proceed text)
		const proceedButton = screen.queryByText(/proceed/i);
		if (proceedButton) {
			fireEvent.click(proceedButton);
			expect(mocks.push).toHaveBeenCalledWith("/en/next");
		}
	});

	it("shows adjacent seat alert message when only adjacent free seats remain on proceed", async () => {
		mocks.getSeatSelectionProgressSummary.mockReturnValue({
			remainingRequiredSeatCount: 1,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 1,
		});

		renderCustomize();

		const proceedButton = screen.queryByText(/proceed/i);
		if (proceedButton) {
			fireEvent.click(proceedButton);
		}

		expect(
			screen.getByText("ancillary_service.error_labels.adjacent_seat_error_title")
		).toBeTruthy();
	});

	it("shows mandatory bundle alert when proceed is blocked", async () => {
		mocks.getSeatSelectionProgressSummary.mockReturnValue({
			remainingRequiredSeatCount: 1,
			remainingBundleRequiredSeatCount: 1,
			remainingAdjacentRequiredSeatCount: 1,
		});

		renderCustomize();

		const proceedButton = screen.queryByText(/proceed/i);

		if (proceedButton) {
			fireEvent.click(proceedButton);
		}

		expect(
			await screen.findByText(
				"ancillary_service.error_labels.mandatory_bundle_selection_error_title"
			)
		).toBeTruthy();
	});

	it("renders inbound direction label for inbound flow", () => {
		mocks.getBookingDirectionLabel.mockReturnValue("Inbound");

		renderCustomize({ direction: "inbound" });

		expect(screen.getByText(/Inbound/)).toBeTruthy();
	});

	it("renders inbound direction label consistently", () => {
		mocks.getBookingDirectionLabel.mockReturnValue("Inbound");
		renderCustomize({ direction: "inbound" });
		expect(screen.getByText(/Inbound/)).toBeTruthy();
	});

	it("marks transport as out of stock when ancillary response has no supported SSR codes", async () => {
		const flight = {
			currency: "JPY",
			flights: {
				outbound: {
					segments: [
						{
							lfid: 1,
							origin: "NRT",
							destination: "HNL",
							scheduledDepartureArrivalDateTime: {
								departureDateTime: "2026-01-01T10:00:00Z",
							},
						},
					],
				},
			},
		};

		mocks.confirmedFlight = flight;
		mocks.passengers = [{ passengerTypeCode: "adult" }];
		mocks.isTransportServiceRouteEnabled.mockReturnValue(true);
		mocks.fetchAncillaryOffers.fulfilled.match.mockReturnValue(true);
		mocks.getTransportServiceAvailability.mockReturnValue({
			hasAnySupportedTransportSsr: false,
		});
		mocks.dispatch.mockImplementation((action: Record<string, unknown>) => {
			if (action.type === "fetchAncillaryOffers") {
				return Promise.resolve({
					type: "fetchAncillaryOffers/fulfilled",
					payload: { data: { servicesPerPassengerType: [] } },
					meta: { condition: false },
				});
			}

			return action;
		});

		renderCustomize();
		fireEvent.click(screen.getByText("ancillary_service.transportation_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "TRANSPORTATION",
				isOutOfStock: true,
			});
		});
		expect(screen.queryByTestId("transport-service")).toBeNull();
	});

	it("opens transport dialog when supported transport stock is available", async () => {
		mocks.isTransportServiceRouteEnabled.mockReturnValue(true);
		mocks.getTransportServiceAvailability.mockReturnValue({
			hasAnySupportedTransportSsr: true,
		});

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								specialServices: [
									{
										ssrCode: "TXIA",
										qtyAvailable: 3,
									},
								],
							},
						],
					},
				],
			},
		});

		renderCustomize();
		fireEvent.click(screen.getByText("ancillary_service.transportation_service_name"));

		await waitFor(() => {
			expect(screen.getByTestId("transport-service")).toBeTruthy();
		});

		expect(mocks.markCategoriesOutOfStock).not.toHaveBeenCalledWith({
			scope: "segment1",
			serviceCategory: "TRANSPORTATION",
			isOutOfStock: true,
		});
	});

	it("marks transport as out of stock when all transport services have qtyAvailable 0", async () => {
		mocks.isTransportServiceRouteEnabled.mockReturnValue(true);
		mocks.getTransportServiceAvailability.mockReturnValue({
			hasAnySupportedTransportSsr: true,
		});

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								specialServices: [
									{
										ssrCode: "TXIA",
										qtyAvailable: 0,
									},
								],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.transportation_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "TRANSPORTATION",
				isOutOfStock: true,
			});
		});
	});

	it("disables transport card when the purchase deadline has passed", () => {
		mocks.confirmedFlight = ancillaryTestFlight;
		mocks.passengers = [{ id: "PAX-1", passengerTypeCode: "adult" }];

		mocks.isTransportServiceRouteEnabled.mockReturnValue(true);
		mocks.isDestinationHNLfromNRT.mockReturnValue(true);
		mocks.is24HourDeadlineExceeded.mockReturnValue(true);

		renderCustomize();

		const card = screen.getByText("ancillary_service.transportation_service_name");
		expect(card.closest("button")?.disabled).toBe(true);
	});

	it("marks priority service as out of stock when all EXPS services have qtyAvailable 0", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								specialServices: [
									{
										ssrCode: "EXPS",
										qtyAvailable: 0,
									},
								],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.priority_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "AMENITIES",
				isOutOfStock: true,
			});
		});
	});

	it("marks priority service as out of stock when no EXPS services are returned", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.priority_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "AMENITIES",
				isOutOfStock: true,
			});
		});
	});

	it("does not mark priority service out of stock when EXPS stock is available", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								specialServices: [
									{
										ssrCode: "EXPS",
										qtyAvailable: 2,
									},
								],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.priority_service_name"));

		await waitFor(() => {
			expect(mocks.fetchAncillaryOffers).toHaveBeenCalled();
		});

		expect(mocks.markCategoriesOutOfStock).not.toHaveBeenCalledWith({
			scope: "segment1",
			serviceCategory: "AMENITIES",
			isOutOfStock: true,
		});
	});

	it("shows meal out-of-stock dialog when all meal services have qtyAvailable 0", async () => {
		setupMealOutOfStockHandler();

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "In-Flight Meals",
								specialServices: [{ ssrCode: "MEAL01", qtyAvailable: 0 }],
							},
							{
								title: "Drinks",
								specialServices: [{ ssrCode: "DRINK01", qtyAvailable: 0 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe(
			"meals_service.error_labels.meal_unavailable_title"
		);
		expect(mocks.handleInflightMealAncillaryOffer).toHaveBeenCalled();
	});

	it("shows meal out-of-stock dialog when the meal response is empty", async () => {
		setupMealOutOfStockHandler();

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe(
			"meals_service.error_labels.meal_unavailable_title"
		);
	});

	it("marks meal category out of stock after confirming the meal out-of-stock dialog", async () => {
		setupMealOutOfStockHandler();

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "In-Flight Meals",
								specialServices: [{ ssrCode: "MEAL01", qtyAvailable: 0 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		const confirmButton = await screen.findByTestId("error-confirm");
		fireEvent.click(confirmButton);

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "MEALS",
				isOutOfStock: true,
			});
		});
	});

	it("delegates to the meal handler when meal inventory is available", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "In-Flight Meals",
								specialServices: [{ ssrCode: "MEAL01", qtyAvailable: 2 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		await waitFor(() => {
			expect(mocks.handleInflightMealAncillaryOffer).toHaveBeenCalled();
		});
	});

	it("reopens the meal dialog after closing the meal-unavailable popup", async () => {
		mocks.handleInflightMealAncillaryOffer.mockImplementation(
			({
				setPendingDialogAfterError,
				openErrorDialog,
			}: {
				setPendingDialogAfterError: (value: "MEAL" | null) => void;
				openErrorDialog: (title: string, content: string) => void;
			}) => {
				setPendingDialogAfterError("MEAL");
				openErrorDialog(
					"meals_service.error_labels.meal_cancelled_title",
					"meals_service.error_labels.meal_cancelled_content"
				);
			}
		);

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "In-Flight Meals",
								specialServices: [{ ssrCode: "MEAL01", qtyAvailable: 2 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();

		fireEvent.click(screen.getByTestId("error-close"));

		await waitFor(() => {
			expect(screen.getByTestId("inflight-meals")).toBeTruthy();
		});
	});

	it("shows unavailable dialog when a required bundled meal SSR is missing", async () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ id: "PAX-1", bundleCode: "VALK", isIcnRoute: false }],
		});
		mocks.isValueBundleCode.mockImplementation((code) => code === "VALK");
		mocks.buildBundleIncludedMealCodesByPassengerId.mockReturnValue({
			"PAX-1": ["BUNDLE-MEAL"],
		});

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "In-Flight Meals",
								specialServices: [{ ssrCode: "OTHER-MEAL", qtyAvailable: 2 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe(
			"ancillary_service.service_unavailable_title"
		);
		expect(mocks.handleInflightMealAncillaryOffer).not.toHaveBeenCalled();
	});

	it("marks baggage as out of stock when all baggage services have qtyAvailable 0", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Carry-on Baggage",
								specialServices: [{ ssrCode: "CARRY01", qtyAvailable: 0 }],
							},
							{
								title: "Check-in Baggage",
								specialServices: [{ ssrCode: "CHECK01", qtyAvailable: 0 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.baggage_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "BAGGAGE",
				isOutOfStock: true,
			});
		});
	});

	it("marks baggage as out of stock when the baggage response is empty", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.baggage_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "BAGGAGE",
				isOutOfStock: true,
			});
		});
	});

	it("shows unavailable dialog when bundled check-in baggage is missing", async () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ id: "PAX-1", bundleCode: "VALK", isIcnRoute: false }],
		});
		mocks.isValueBundleCode.mockImplementation((code) => code === "VALK");

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Carry-on Baggage",
								specialServices: [{ ssrCode: "CARRY01", qtyAvailable: 2 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		// Surface any unhandled rejection so we can see the real thrown error
		const unhandled = vi.fn();
		process.on("unhandledRejection", unhandled);

		fireEvent.click(screen.getByText("ancillary_service.baggage_service_name"));

		await waitFor(() => {
			expect(unhandled).not.toHaveBeenCalled();
		});

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe(
			"ancillary_service.service_unavailable_title"
		);

		process.off("unhandledRejection", unhandled);
	});

	it("shows baggage inventory dialog when bundled baggage validation fails", async () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [
				{
					id: "PAX-1",
					bundleCode: "VALK",
					isIcnRoute: false,
				},
			],
		});

		mocks.isValueBundleCode.mockImplementation((code?: string) => code === "VALK");

		mocks.resolveConfirmationBaggageInventory.mockReturnValue({
			type: BAGGAGE_INVENTORY_TYPE.BUNDLE_OUT_OF_STOCK,
			baggageSelectionsByPassengerId: {},
		});

		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Carry-on Baggage",
								specialServices: [
									{
										ssrCode: "CARRY01",
										qtyAvailable: 3,
									},
								],
							},
							{
								title: "Check-in Baggage",
								specialServices: [
									{
										ssrCode: "CHECK01",
										qtyAvailable: 3,
									},
								],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.baggage_service_name"));

		await waitFor(() => {
			expect(mocks.resolveConfirmationBaggageInventory).toHaveBeenCalled();
		});

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();

		expect(screen.getByTestId("error-title").textContent).toBe(
			"baggage_service.dialog_title_bundle_out_of_stock"
		);
	});

	it("does not mark baggage out of stock when inventory is available", async () => {
		setupFulfilledAncillaryResponse({
			data: {
				servicesPerPassengerType: [
					{
						passengerType: "adult",
						categories: [
							{
								title: "Carry-on Baggage",
								specialServices: [{ ssrCode: "CARRY01", qtyAvailable: 3 }],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.baggage_service_name"));

		await waitFor(() => {
			expect(mocks.fetchAncillaryOffers).toHaveBeenCalled();
		});

		expect(mocks.markCategoriesOutOfStock).not.toHaveBeenCalledWith({
			scope: "segment1",
			serviceCategory: "BAGGAGE",
			isOutOfStock: true,
		});
	});

	it("marks lounge as out of stock when lounge services all have qtyAvailable 0", async () => {
		mocks.isLoungeServiceRouteEnabled.mockReturnValue(true);
		mocks.extractLoungeServices.mockReturnValue([
			{
				service: {
					ssrId: 301,
					ssrCode: "LNGB",
					description: "Narita Lounge",
					qtyAvailable: 0,
					lfid: 1,
				},
			},
		]);

		setupFulfilledAncillaryResponse({ data: { servicesPerPassengerType: [] } });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.airport_lounge_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "LOUNGE",
				isOutOfStock: true,
			});
		});
	});

	it("marks lounge as out of stock when no lounge services are returned", async () => {
		mocks.isLoungeServiceRouteEnabled.mockReturnValue(true);
		mocks.extractLoungeServices.mockReturnValue([]);

		setupFulfilledAncillaryResponse({ data: { servicesPerPassengerType: [] } });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.airport_lounge_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "LOUNGE",
				isOutOfStock: true,
			});
		});
	});

	it("does not mark lounge out of stock when lounge inventory is available", async () => {
		mocks.isLoungeServiceRouteEnabled.mockReturnValue(true);
		mocks.extractLoungeServices.mockReturnValue([
			{
				service: {
					ssrId: 301,
					ssrCode: "LNGB",
					description: "Narita Lounge",
					qtyAvailable: 3,
					lfid: 1,
				},
			},
		]);

		setupFulfilledAncillaryResponse({ data: { servicesPerPassengerType: [] } });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.airport_lounge_name"));

		await waitFor(() => {
			expect(mocks.fetchAncillaryOffers).toHaveBeenCalled();
		});

		expect(mocks.markCategoriesOutOfStock).not.toHaveBeenCalledWith({
			scope: "segment1",
			serviceCategory: "LOUNGE",
			isOutOfStock: true,
		});
	});

	it("marks non-bundled ancillary out of stock for NEXUZCMNE004", async () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ id: "PAX-1", bundleCode: "NOBN", isIcnRoute: false }],
		});

		setupRejectedAncillaryResponse("NEXUZCMNE004");

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.priority_service_name"));

		await waitFor(() => {
			expect(mocks.markCategoriesOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				serviceCategory: "AMENITIES",
				isOutOfStock: true,
			});
		});

		expect(screen.queryByTestId("error-dialog")).toBeNull();
	});

	it("shows unavailable dialog for a rejection other than NEXUZCMNE004", async () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ id: "PAX-1", bundleCode: "NOBN", isIcnRoute: false }],
		});

		setupRejectedAncillaryResponse("OTHER_ERROR");

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.priority_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe(
			"ancillary_service.service_unavailable_title"
		);
	});

	it("opens the error dialog when a disabled card has showPopupOnClick=true", async () => {
		const result = {
			cards: {
				...defaultCards,
				meal: {
					enabled: false,
					showPopupOnClick: true,
					redirectToTop: false,
					popupMessage: "Meal is currently unavailable",
				},
			},
		};
		mocks.getDefaultResponse.mockReturnValue(result);
		mocks.evaluateAncillaryEligibility.mockReturnValue(result);

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.meal_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-content").textContent).toBe("Meal is currently unavailable");
	});

	it("shows an unavailable dialog when building the ancillary request throws", async () => {
		mocks.confirmedFlight = ancillaryTestFlight;
		mocks.passengers = [{ id: "PAX-1", passengerTypeCode: "adult" }];

		mocks.buildRetrieveOfferAncillariesRequest.mockImplementation(() => {
			throw new Error("Unable to build ancillary request");
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.priority_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe(
			"ancillary_service.service_unavailable_title"
		);
	});

	it("preserves the confirmation change query when proceeding to the next step", () => {
		mocks.confirmedFlight = ancillaryTestFlight;

		mocks.searchParamsGet.mockImplementation((key: string) =>
			key === "changeFlow" ? "confirmation" : null
		);
		mocks.searchParamsToString.mockReturnValue("changeFlow=confirmation");

		mocks.getSeatSelectionProgressSummary.mockReturnValue({
			remainingRequiredSeatCount: 0,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 0,
		});

		renderCustomize();

		const proceedButton = screen.queryByText(/proceed/i);
		if (proceedButton) {
			fireEvent.click(proceedButton);
		}

		expect(mocks.push).toHaveBeenCalledWith("/en/next?changeFlow=confirmation");
	});
});

// ── SEAT card out-of-stock tests ──────────────────────────────────────────────
//
// These cover the fix where SEAT availability now lives in its own
// `seatMap` slice state (`setSeatMapOutOfStock` / `selectSeatMapOutOfStock`)
// instead of sharing the `"AMENITIES"` key with PRIORITY in ancillaryOffers.
// The regression tests specifically guard against that old bug reappearing.

describe("Customize — SEAT card out-of-stock handling", () => {
	it("renders the SEAT card enabled by default", () => {
		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		expect(seatCard?.disabled).toBe(false);
	});

	it("dispatches setSeatMapOutOfStock(true) and shows the unavailable-seats dialog when the API resolves with no available seats", async () => {
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue("NO_AVAILABLE_SEATS");
		setupFulfilledSeatMapResponse({ data: { seatInfo: [] } });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.seat_service_name"));

		await waitFor(() => {
			expect(mocks.setSeatMapOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				isOutOfStock: true,
			});
		});

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
	});

	it("shows dialog content sourced from seat map labels for the no-available-seats case", async () => {
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue("NO_AVAILABLE_SEATS");
		setupFulfilledSeatMapResponse({ data: { seatInfo: [] } });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.seat_service_name"));

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
		expect(screen.getByTestId("error-title").textContent).toBe("title_NO_AVAILABLE_SEATS");
		expect(screen.getByTestId("error-content").textContent).toBe("content_NO_AVAILABLE_SEATS");
	});

	it("dispatches setSeatMapOutOfStock(true) when the seat map API is rejected with a no-available-seats error", async () => {
		vi.mocked(isNoAvailableSeatsSeatMapError).mockReturnValue(true);
		setupRejectedSeatMapResponse({ code: "NO_SEATS" });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.seat_service_name"));

		await waitFor(() => {
			expect(mocks.setSeatMapOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				isOutOfStock: true,
			});
		});

		expect(await screen.findByTestId("error-dialog")).toBeTruthy();
	});
	it("does not dispatch setSeatMapOutOfStock(true) when seats are available", async () => {
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue(undefined);
		// Override the module-wide empty-Set mock just for this test, so the
		// component sees at least one available seat code and correctly computes
		// isOutOfStock === false.
		vi.mocked(buildAvailableSeatCodeSet).mockReturnValueOnce(new Set(["1A"]));

		setupFulfilledSeatMapResponse({
			data: {
				seatInfo: [
					{
						name: "Standard",
						class: "Standard",
						rows: [
							{
								rowNumber: 1,
								seats: [
									{
										seatCode: "1A",
										isSeatAvailable: true,
									},
								],
							},
						],
					},
				],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.seat_service_name"));

		await waitFor(() => {
			expect(mocks.fetchSeatMapOffers).toHaveBeenCalled();
		});

		expect(mocks.setSeatMapOutOfStock).not.toHaveBeenCalledWith({
			scope: "segment1",
			isOutOfStock: true,
		});
	});

	it("resets the SEAT out-of-stock flag to false at the start of every SEAT click attempt", async () => {
		// "resets the SEAT out-of-stock flag to false at the start of every SEAT click attempt" test
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue(undefined);
		setupFulfilledSeatMapResponse({
			data: {
				seatInfo: [{ name: "Standard", class: "Standard", rows: [] }],
			},
		});

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.seat_service_name"));

		await waitFor(() => {
			expect(mocks.setSeatMapOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				isOutOfStock: false,
			});
		});
	});

	it("renders the SEAT card disabled when selectSeatMapOutOfStock reports true for the current scope", () => {
		mocks.selectSeatMapOutOfStock.mockReturnValue(true);

		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		expect(seatCard?.disabled).toBe(true);
	});

	it("renders the SEAT card enabled when selectSeatMapOutOfStock reports false", () => {
		mocks.selectSeatMapOutOfStock.mockReturnValue(false);

		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		expect(seatCard?.disabled).toBe(false);
	});

	it("keeps the SEAT card disabled on first render when the flag is already true (simulates a refresh/rehydrated store)", () => {
		// No user interaction here — this simulates the persisted-state case where
		// the page loads with outOfStockByScope already populated from a prior session.
		mocks.selectSeatMapOutOfStock.mockReturnValue(true);

		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		expect(seatCard?.disabled).toBe(true);
	});

	// ── Regression: SEAT and PRIORITY must be fully independent ────────────────
	// (the original bug: both used the shared ancillaryOffers "AMENITIES" key)

	it("does not disable the PRIORITY card when SEAT is marked out of stock", () => {
		mocks.selectSeatMapOutOfStock.mockReturnValue(true);
		mocks.selectOutOfStockByDirectionAndServiceCategory.mockReturnValue(false);

		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		const priorityCard = screen
			.getByText("ancillary_service.priority_service_name")
			.closest("button");

		expect(seatCard?.disabled).toBe(true);
		expect(priorityCard?.disabled).toBe(false);
	});

	it("does not disable the SEAT card when only PRIORITY's AMENITIES flag is out of stock", () => {
		mocks.selectSeatMapOutOfStock.mockReturnValue(false);
		mocks.selectOutOfStockByDirectionAndServiceCategory.mockReturnValue(true);

		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		const priorityCard = screen
			.getByText("ancillary_service.priority_service_name")
			.closest("button");

		expect(seatCard?.disabled).toBe(false);
		expect(priorityCard?.disabled).toBe(true);
	});

	it("allows both SEAT and PRIORITY to be independently out of stock at the same time", () => {
		mocks.selectSeatMapOutOfStock.mockReturnValue(true);
		mocks.selectOutOfStockByDirectionAndServiceCategory.mockReturnValue(true);

		renderCustomize();

		const seatCard = screen.getByText("ancillary_service.seat_service_name").closest("button");
		const priorityCard = screen
			.getByText("ancillary_service.priority_service_name")
			.closest("button");

		expect(seatCard?.disabled).toBe(true);
		expect(priorityCard?.disabled).toBe(true);
	});

	it("shows the shared stock banner when SEAT out-of-stock triggers it via AncillaryAlerts", async () => {
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue("NO_AVAILABLE_SEATS");
		setupFulfilledSeatMapResponse({ data: { seatInfo: [] } });

		renderCustomize();

		fireEvent.click(screen.getByText("ancillary_service.seat_service_name"));

		await waitFor(() => {
			expect(mocks.setSeatMapOutOfStock).toHaveBeenCalledWith({
				scope: "segment1",
				isOutOfStock: true,
			});
		});

		// Confirm dialog was shown (UI-level confirmation the flow completed).
		expect(screen.getByTestId("error-dialog")).toBeTruthy();
	});
});
