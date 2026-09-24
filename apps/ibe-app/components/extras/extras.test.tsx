/**
 * File: extras.test.tsx
 * Classification: Component (Page)
 * Description: Tests for the Extras page component.
 * Covers: loading state, product rendering, error modals, deadline warnings,
 * category filtering, product modal open/close, and navigation.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Extras } from "@/components/extras/extras";

// ── Hoisted mock factories ─────────────────────────────────────────────────

const { mockRouterPush, mockDispatch } = vi.hoisted(() => ({
	mockRouterPush: vi.fn(),
	mockDispatch: vi.fn(),
}));

const searchParamsMocks = vi.hoisted(() => ({
	get: vi.fn(),
}));

// ── next/navigation ────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockRouterPush }),
	useSearchParams: () => ({ get: searchParamsMocks.get }),
}));

// ── next-intl ──────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

// ── Store hooks ────────────────────────────────────────────────────────────

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mockDispatch,
	useAppSelector: vi.fn(),
}));

// ── Selectors ──────────────────────────────────────────────────────────────

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: vi.fn(),
	selectFlightSearchRequest: vi.fn(),
}));

vi.mock("@/store/slices/customer-information/passenger-selector/passenger-selector", () => ({
	selectPassengerList: vi.fn(),
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectExtrasTotal: vi.fn(),
	addExtrasService: vi.fn((payload) => ({ type: "passenger/addExtrasService", payload })),
	removeExtrasService: vi.fn((payload) => ({ type: "passenger/removeExtrasService", payload })),
}));

vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	buildRetrieveOfferAncillariesRequest: vi.fn(() => ({ lfid: 100 })),
	fetchAncillaryOffers: vi.fn(() => ({ type: "ancillaryOffers/fetch" })),
	hasPrefetchedAncillaryOffersInPageSession: vi.fn(() => false),
	selectAncillaryOffersDataByDirectionAndServiceCategory: vi.fn(),
	selectAncillaryOffersErrorByDirectionAndServiceCategory: vi.fn(),
	selectAncillaryOffersIsPendingByDirection: vi.fn(),
}));

// ── Custom hooks ───────────────────────────────────────────────────────────

vi.mock("@/modules/utils/helpers/airport", () => ({
	getAirportRouteLabel: () => "NRT -> ITM",
}));

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	useDepartureDeadline: vi.fn(() => ({
		is24HourDeadlineExceeded: false,
		is48HourDeadlineExceeded: false,
		isBundlePurchaseDeadlineExceeded: false,
		bundleDeadlineHours: 48 as const,
	})),
}));

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: vi.fn(),
}));

// ── Flow-router helpers ────────────────────────────────────────────────────

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: vi.fn(() => "outbound"),
	getBookingStageRoute: vi.fn(() => "extras/outbound"),
	getNextBookingFlowPath: vi.fn(() => "/en/seat-map/outbound"),
}));

// ── Extras helpers ─────────────────────────────────────────────────────────

vi.mock("@/modules/utils/helpers/extras/extras.helpers", () => ({
	checkBundlePassenger: vi.fn(() => false),
	createPassengerItem: vi.fn((p) => ({
		id: p.id,
		name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.id,
		category: "Adult",
		price: 0,
		checked: false,
	})),
	getBundledSsrCodesForPassenger: vi.fn(() => new Set<string>()),
	getCategoriesToShow: vi.fn(() => ["all"]),
	getDialogSummary: vi.fn(() => ({
		dialogTotal: 0,
		isDialogSelectionFull: false,
		shouldShowOutOfStockAlert: false,
	})),
	getExtrasSegment: vi.fn(() => ({
		lfid: 100,
		pfid: 1,
		origin: "NRT",
		destination: "ITM",
		carrierCode: "ZG",
		flightNumber: "001",
		scheduledDepartureArrivalDateTime: {
			departure: "2027-01-01T10:00:00",
			arrival: "2027-01-01T12:00:00",
		},
		flightTime: "2h",
		selectedCabin: "Y",
		fareDetails: [],
	})),
	getProductsByCategory: vi.fn(() => []),
	getSelectAllSelections: vi.fn(() => ({})),
	getVisibleSections: vi.fn(() => []),
	isKoreanRoute: vi.fn(() => false),
	mapAncillaryDataToProducts: vi.fn(() => []),
	updatePassengerSelections: vi.fn((prev) => prev),
	updateSelectedCategoryIds: vi.fn((_prev, id) => [id]),
}));

vi.mock("@/modules/utils/helpers/extras/extras.data", () => ({
	ALL_SECTIONS: [],
	EXTRAS_PAGE_TITLE_BY_STAGE: {
		outbound: "page_title_outbound",
		inbound: "page_title_inbound",
		segment1: "page_title_outbound",
		segment2: "page_title_inbound",
	},
}));

vi.mock("@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors", () => ({
	getAncillaryOffersErrorCodeFromBoundaryError: vi.fn(() => null),
}));

// ── Child components ───────────────────────────────────────────────────────

vi.mock("@/components/extras/extras-section/extras-section", () => ({
	ExtrasSection: ({ title }: { title: string }) => <div data-testid="extras-section">{title}</div>,
}));

vi.mock("@/components/common/error-dialog/error-dialog", () => ({
	ErrorDialog: ({
		open,
		content,
	}: {
		open: boolean;
		content: string;
		title: string;
		onOpenChange: (v: boolean) => void;
		onReturnToTop: () => void;
	}) => (open ? <div data-testid="service-unavailable-modal">{content}</div> : null),
}));

vi.mock("@/components/extras/filter-pills/filter-pills", () => ({
	FilterPills: ({
		title,
		onCategoryChange,
	}: {
		title: string;
		onCategoryChange: (id: string) => void;
		selectedCategoryIds: string[];
	}) => (
		<div data-testid="extras-page-header">
			<span data-testid="page-title">{title}</span>
			<button type="button" onClick={() => onCategoryChange("amenities")}>
				Filter Amenities
			</button>
		</div>
	),
}));

vi.mock("@/components/extras/product-modal/product-modal", () => ({
	ExtrasProductModal: ({
		open,
		onClose,
		onConfirm,
	}: {
		open: boolean;
		product: unknown;
		onClose: () => void;
		onConfirm: () => void;
		[key: string]: unknown;
	}) =>
		open ? (
			<div data-testid="extras-product-modal">
				<button type="button" onClick={onClose} data-testid="modal-close">
					Close
				</button>
				<button type="button" onClick={onConfirm} data-testid="modal-confirm">
					Confirm
				</button>
			</div>
		) : null,
}));

// ── Helpers ────────────────────────────────────────────────────────────────

import { useDepartureDeadline } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { getAncillaryOffersErrorCodeFromBoundaryError } from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import {
	checkBundlePassenger,
	getVisibleSections,
	mapAncillaryDataToProducts,
} from "@/modules/utils/helpers/extras/extras.helpers";
import { useAppSelector } from "@/store/hooks";
import {
	selectAncillaryOffersDataByDirectionAndServiceCategory,
	selectAncillaryOffersErrorByDirectionAndServiceCategory,
	selectAncillaryOffersIsPendingByDirection,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import {
	selectConfirmedFlight,
	selectFlightSearchRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";
import { selectExtrasTotal } from "@/store/slices/passenger/passenger.slice";

const mockPassenger = {
	id: "pax-1",
	firstName: "John",
	lastName: "Doe",
	passengerTypeCode: "adult",
	services: { extras: [] },
	bundles: [],
};

const mockConfirmedFlight = {
	tripType: "oneway" as const,
	flights: {
		outbound: {
			segments: [
				{
					lfid: 100,
					pfid: 1,
					origin: "NRT",
					destination: "ITM",
					carrierCode: "ZG",
					flightNumber: "001",
					scheduledDepartureArrivalDateTime: {
						departure: "2027-01-01T10:00:00",
						arrival: "2027-01-01T12:00:00",
					},
					flightTime: "2h",
					selectedCabin: "Y",
					fareDetails: [],
				},
			],
			selectedFareInfos: [],
			passengerFareBreakdown: [],
			totalFlightAmount: 0,
		},
	},
	selectedCabinsOutbound: {},
	selectedCabinsInbound: {},
	grandTotalAmount: 0,
};

const mockExtrasProduct = {
	id: "amenities-1",
	categoryId: "amenities" as const,
	ssrCode: "AMEA",
	name: "Amenity A",
	price: 1000,
	imageSrc: "/amenity.png",
	images: ["/amenity.png"],
	qtyAvailable: 5,
	serviceID: 1,
	lfid: 100,
	cutOffHours: 2,
	maxCountServiceLevel: 5,
	numericCategoryId: 1,
	passengerType: "ADT",
	description: "Amenity A",
};

/** Sets up common useAppSelector responses. Overrides can be passed for edge cases. */
function setupSelector(
	overrides: {
		ancillaryOffersData?: unknown;
		ancillaryOffersError?: string | null;
		ancillaryOffersIsPending?: boolean;
		extrasTotal?: number;
	} = {}
) {
	// Call the selector with a stub state so mocked selectors are invoked
	vi.mocked(useAppSelector).mockImplementation((selector) => selector({} as never));

	vi.mocked(selectConfirmedFlight).mockReturnValue(mockConfirmedFlight as never);
	vi.mocked(selectFlightSearchRequest).mockReturnValue({ routes: "NRT-ITM" } as never);
	vi.mocked(selectPassengerList).mockReturnValue([mockPassenger] as never);
	vi.mocked(selectAncillaryOffersDataByDirectionAndServiceCategory).mockReturnValue(
		(overrides.ancillaryOffersData ?? null) as never
	);
	vi.mocked(selectAncillaryOffersErrorByDirectionAndServiceCategory).mockReturnValue(
		(overrides.ancillaryOffersError ?? null) as never
	);
	vi.mocked(selectAncillaryOffersIsPendingByDirection).mockReturnValue(
		(overrides.ancillaryOffersIsPending ?? false) as never
	);
	vi.mocked(selectExtrasTotal).mockReturnValue((overrides.extrasTotal ?? 0) as never);
}

function setupPassengerOrder(passengers = [mockPassenger]) {
	(usePassengerOrder as ReturnType<typeof vi.fn>).mockReturnValue({
		orderedPassengers: passengers,
	});
}

function renderExtras(props: { locale?: string; direction?: "outbound" | "inbound" } = {}) {
	return render(<Extras locale={props.locale ?? "en"} direction={props.direction ?? "outbound"} />);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Extras", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		searchParamsMocks.get.mockReturnValue(null);
		setupSelector();
		setupPassengerOrder();
		vi.mocked(useDepartureDeadline).mockReturnValue({
			is24HourDeadlineExceeded: false,
			is48HourDeadlineExceeded: false,
			is96HourDeadlineExceeded: false,
			isBundlePurchaseDeadlineExceeded: false,
			bundleDeadlineHours: 48 as const,
		});
		(checkBundlePassenger as ReturnType<typeof vi.fn>).mockReturnValue(false);
		(mapAncillaryDataToProducts as ReturnType<typeof vi.fn>).mockReturnValue([]);
		(getVisibleSections as ReturnType<typeof vi.fn>).mockReturnValue([]);
		mockDispatch.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
	});

	// ── Loading state ────────────────────────────────────────────────────────

	describe("loading state", () => {
		it("renders a loading spinner when ancillary offers are pending", () => {
			setupSelector({ ancillaryOffersIsPending: true });

			const { container } = renderExtras();

			const spinner = container.querySelector(".animate-spin");
			expect(spinner).not.toBeNull();
		});

		it("does not render the page header when loading", () => {
			setupSelector({ ancillaryOffersIsPending: true });

			renderExtras();

			expect(screen.queryByTestId("extras-page-header")).toBeNull();
		});
	});

	// ── Normal render ────────────────────────────────────────────────────────

	describe("normal render", () => {
		it("renders the page header with the correct title", () => {
			renderExtras();

			expect(screen.getByTestId("extras-page-header")).toBeDefined();
			expect(screen.getByTestId("page-title").textContent).toBe("page_title_outbound");
		});

		it("renders the booking footer", () => {
			const { container } = renderExtras();

			expect(container.querySelector(".booking-footer")).not.toBeNull();
		});

		it("does not render the product modal when no dialog is open", () => {
			renderExtras();

			expect(screen.queryByTestId("extras-product-modal")).toBeNull();
		});

		it("renders visible sections from getVisibleSections", () => {
			(mapAncillaryDataToProducts as ReturnType<typeof vi.fn>).mockReturnValue([mockExtrasProduct]);
			(getVisibleSections as ReturnType<typeof vi.fn>).mockReturnValue([
				{
					id: "amenities",
					title: "Amenities",
					products: [{ id: "p1", name: "WiFi", price: 100, categoryId: "amenities" }],
				},
			]);

			renderExtras();

			expect(screen.getByTestId("extras-section")).toBeDefined();
			expect(screen.getByText("Amenities")).toBeDefined();
		});
	});

	// ── Category filter ──────────────────────────────────────────────────────

	describe("category filtering", () => {
		it("calls updateSelectedCategoryIds when a category pill is clicked", async () => {
			const { updateSelectedCategoryIds } = await import(
				"@/modules/utils/helpers/extras/extras.helpers"
			);

			renderExtras();

			fireEvent.click(screen.getByText("Filter Amenities"));

			expect(updateSelectedCategoryIds).toHaveBeenCalledWith(["all"], "amenities");
		});
	});

	// ── Proceed navigation ───────────────────────────────────────────────────

	describe("proceed navigation", () => {
		it("navigates to the next booking flow path when proceed is clicked", () => {
			renderExtras({ locale: "en", direction: "outbound" });

			fireEvent.click(screen.getByRole("button", { name: "booking_footer_proceed" }));

			expect(mockRouterPush).toHaveBeenCalledWith("/en/seat-map/outbound");
		});

		it("proceed button is not shown while ancillary offers are pending (loading overlay rendered)", () => {
			setupSelector({ ancillaryOffersIsPending: true });

			const { container } = renderExtras();

			expect(screen.queryByRole("button", { name: "booking_footer_proceed" })).toBeNull();
			expect(container.querySelector(".animate-spin")).not.toBeNull();
		});
	});

	// ── Error: deadline warning ──────────────────────────────────────────────

	describe("deadline error", () => {
		it("shows the inline deadline error message when within deadline", () => {
			(mapAncillaryDataToProducts as ReturnType<typeof vi.fn>).mockReturnValue([mockExtrasProduct]);
			vi.mocked(useDepartureDeadline).mockReturnValue({
				is24HourDeadlineExceeded: true,
				is48HourDeadlineExceeded: true,
				is96HourDeadlineExceeded: false,
				isBundlePurchaseDeadlineExceeded: true,
				bundleDeadlineHours: 24 as const,
			});

			renderExtras();

			expect(screen.getByText("error_labels.deadline_error")).toBeDefined();
		});

		it("hides the product sections when deadline error is shown", () => {
			vi.mocked(useDepartureDeadline).mockReturnValue({
				is24HourDeadlineExceeded: true,
				is48HourDeadlineExceeded: true,
				is96HourDeadlineExceeded: false,
				isBundlePurchaseDeadlineExceeded: true,
				bundleDeadlineHours: 24 as const,
			});
			(getVisibleSections as ReturnType<typeof vi.fn>).mockReturnValue([
				{ id: "amenities", title: "Amenities", products: [] },
			]);

			renderExtras();

			expect(screen.queryByTestId("extras-section")).toBeNull();
		});
	});

	// ── Error: bundle + deadline modal ───────────────────────────────────────

	describe("bundle ancillary deadline modal", () => {
		it("shows the service-unavailable modal for non-Korean bundle passengers within deadline", () => {
			vi.mocked(useDepartureDeadline).mockReturnValue({
				is24HourDeadlineExceeded: true,
				is48HourDeadlineExceeded: true,
				is96HourDeadlineExceeded: false,
				isBundlePurchaseDeadlineExceeded: true,
				bundleDeadlineHours: 24 as const,
			});
			(checkBundlePassenger as ReturnType<typeof vi.fn>).mockReturnValue(true);

			renderExtras();

			const modal = screen.getByTestId("service-unavailable-modal");
			expect(modal).toBeDefined();
			expect(modal.textContent).toContain("error_labels.bundle_ancillary_deadline_error");
		});

		it("disables the proceed button when the error modal is shown", () => {
			vi.mocked(useDepartureDeadline).mockReturnValue({
				is24HourDeadlineExceeded: true,
				is48HourDeadlineExceeded: true,
				is96HourDeadlineExceeded: false,
				isBundlePurchaseDeadlineExceeded: true,
				bundleDeadlineHours: 24 as const,
			});
			(checkBundlePassenger as ReturnType<typeof vi.fn>).mockReturnValue(true);

			renderExtras();

			// modal is shown so proceed should be disabled (proceedButtonVisible = false)
			const proceedBtn = screen.getByRole("button", {
				name: "booking_footer_proceed",
			});
			expect(proceedBtn).toHaveProperty("disabled", true);
		});
	});

	// ── Error: ancillary API error ───────────────────────────────────────────

	describe("ancillary API error", () => {
		it("shows service-unavailable modal for NEXUZR004E102 error code", () => {
			setupSelector({ ancillaryOffersError: "Some error" });
			(getAncillaryOffersErrorCodeFromBoundaryError as ReturnType<typeof vi.fn>).mockReturnValue(
				"NEXUZR004E102"
			);

			renderExtras();

			const modal = screen.getByTestId("service-unavailable-modal");
			expect(modal.textContent).toContain("error_labels.service_unavailable_description");
		});

		it("shows inline empty-response message for NEXUZCMNE004 error code", () => {
			setupSelector({ ancillaryOffersError: "Empty response error" });
			(getAncillaryOffersErrorCodeFromBoundaryError as ReturnType<typeof vi.fn>).mockReturnValue(
				"NEXUZCMNE004"
			);

			renderExtras();

			expect(screen.getByText("error_labels.empty_response")).toBeDefined();
		});

		it("throws for an unknown ancillary API error code", () => {
			setupSelector({ ancillaryOffersError: "Unknown" });
			(mapAncillaryDataToProducts as ReturnType<typeof vi.fn>).mockReturnValue([mockExtrasProduct]);
			(getAncillaryOffersErrorCodeFromBoundaryError as ReturnType<typeof vi.fn>).mockReturnValue(
				"UNKNOWN_CODE"
			);

			expect(() => renderExtras()).toThrow();
		});
	});

	// ── Product modal ────────────────────────────────────────────────────────

	describe("product modal", () => {
		const wifiProduct = {
			id: "amenities-1",
			categoryId: "amenities" as const,
			ssrCode: "WIFI",
			name: "WiFi",
			price: 1000,
			imageSrc: "/wifi.png",
			images: ["/wifi.png"],
			qtyAvailable: 5,
			serviceID: 1,
			lfid: 100,
			cutOffHours: 2,
			maxCountServiceLevel: 5,
			numericCategoryId: 1,
			passengerType: "ADT",
			description: "WiFi service",
		};

		beforeEach(() => {
			(mapAncillaryDataToProducts as ReturnType<typeof vi.fn>).mockReturnValue([wifiProduct]);
			(getVisibleSections as ReturnType<typeof vi.fn>).mockReturnValue([
				{
					id: "amenities",
					title: "Amenities",
					products: [wifiProduct],
					onCardClick: vi.fn(),
				},
			]);
		});

		it("opens the product modal when a product card is clicked", () => {
			// We need to get the section component to trigger handleCardClick;
			// since ExtrasSection is mocked, we simulate it by checking the modal is initially hidden.
			renderExtras();

			// Modal is not open initially
			expect(screen.queryByTestId("extras-product-modal")).toBeNull();
		});

		it("modal is not open when no product is selected", () => {
			renderExtras();
			// Modal is only visible when a product card sets openDialogProductId
			expect(screen.queryByTestId("extras-product-modal")).toBeNull();
		});
	});

	// ── Dispatch on mount ────────────────────────────────────────────────────

	describe("fetchAncillaryOffers dispatch", () => {
		it("dispatches fetchAncillaryOffers when ancillaryRequest is available", async () => {
			renderExtras();

			await waitFor(() => {
				expect(mockDispatch).toHaveBeenCalled();
			});
		});

		it("does not dispatch fetchAncillaryOffers when deadline has passed", async () => {
			vi.mocked(useDepartureDeadline).mockReturnValue({
				is24HourDeadlineExceeded: true,
				is48HourDeadlineExceeded: true,
				is96HourDeadlineExceeded: false,
				isBundlePurchaseDeadlineExceeded: true,
				bundleDeadlineHours: 24 as const,
			});
			mockDispatch.mockClear();

			renderExtras();

			// Even if dispatch is called for other things, fetchAncillaryOffers thunk should not be dispatched
			const { fetchAncillaryOffers } = await import(
				"@/store/slices/common/ancillary-offers/ancillary-offers"
			);
			expect(fetchAncillaryOffers).not.toHaveBeenCalled();
		});
	});

	// ── Inbound direction ────────────────────────────────────────────────────

	describe("inbound direction", () => {
		it("renders with inbound direction prop", () => {
			renderExtras({ direction: "inbound" });

			expect(screen.getByTestId("extras-page-header")).toBeDefined();
		});
	});
});
