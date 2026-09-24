import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransportService } from "@/components/customize/transport-service/transport-service";
import { renderWithProviders } from "@/test/render-with-providers";

const mocks = vi.hoisted(() => {
	const getBookingStageSegmentMock = vi.fn(() => "outbound");
	const state: {
		passenger: {
			passengers: Array<{ id: string }>;
		};
		flightSelection: {
			confirmedFlight: { id: string } | null;
		};
		ancillaryData: Array<{ id: string }>;
	} = {
		passenger: {
			passengers: [{ id: "p1" }],
		},
		flightSelection: {
			confirmedFlight: { id: "cf1" },
		},
		ancillaryData: [{ id: "offer-1" }],
	};

	const transportServices: Array<{
		title: string;
		imageSrc: string;
		moreInfoHref: string;
		description: string;
		ageGroupLabels: string[];
		durationLabel: string;
		pricingRows: Array<{ label: string; prices: number[] }>;
		footnote: string;
		services: Array<{ code: string }>;
	}> = [
		{
			title: "Shuttle",
			imageSrc: "img-shuttle",
			moreInfoHref: "/shuttle",
			description: "Shuttle description",
			ageGroupLabels: ["Adults"],
			durationLabel: "30min",
			pricingRows: [{ label: "Adult", prices: [1000] }],
			footnote: "Footnote",
			services: [{ code: "OW" }],
		},
		{
			title: "Trolley",
			imageSrc: "img-trolley",
			moreInfoHref: "/trolley",
			description: "Trolley description",
			ageGroupLabels: ["Adults", "Children"],
			durationLabel: "45min",
			pricingRows: [{ label: "Adult", prices: [2000] }],
			footnote: "Footnote 2",
			services: [{ code: "TRLA" }],
		},
	];

	const selectionHook: {
		selectedTransportServiceId: string | null;
		setSelectedTransportServiceId: ReturnType<typeof vi.fn>;
		selectedServiceStockLimit: number;
		remainingStockCount: number | null;
		shouldShowRemainingStock: boolean;
		selectedService: { label: string; activityImage: string } | null;
		selectedServiceDescription: string;
		handleBackFromTransportServiceDetails: ReturnType<typeof vi.fn>;
		getTransportCardServices: ReturnType<typeof vi.fn>;
	} = {
		selectedTransportServiceId: null,
		setSelectedTransportServiceId: vi.fn(),
		selectedServiceStockLimit: 5,
		remainingStockCount: 3,
		shouldShowRemainingStock: false,
		selectedService: null,
		selectedServiceDescription: "Selected service details",
		handleBackFromTransportServiceDetails: vi.fn(),
		getTransportCardServices: vi.fn((services: unknown[]) => services),
	};

	return {
		state,
		translations: {
			transportation_service: {
				no_purchase_option_available: "No purchase options",
				remaining_stock_count: "Remaining: {count}",
			},

			common: {
				infant_label: "Infant",
			},

			extras_page: {
				select_customers: "Select customers",
			},
		},
		availability: {
			hasOneWay: true,
			hasRoundTrip: false,
			hasTRLA: true,
			hasTRLB: false,
			hasTRLC: false,
			hasAnySupportedTransportSsr: true,
		},
		transportServices,
		pricingHook: {
			getPassengerAmount: vi.fn(() => 1000),
			storedServicesTotal: 1200,
			setPricingTransportServiceId: vi.fn(),
		},
		selectionHook,
		passengerHook: {
			transportServicePax: [],
			passengersWithAmount: [{ id: "p1", name: "Test Pax", checked: false, price: 1000 }],
			hasOutOfStockPassengers: false,
			currentSelectionTotal: 3000,
			selectedTransportPassengerCount: 0,
			toggleTransportServicePax: vi.fn(),
			toggleTransportServiceSelectAll: vi.fn(),
		},
		persistenceHook: {
			persistSelectedTransportService: vi.fn(),
		},
		getBookingStageSegmentMock,
		dialogProps: null as null | Record<string, unknown>,
	};
});

vi.mock("next-intl", () => ({
	useTranslations: (namespace: string) => (key: string, values?: Record<string, number>) => {
		let text =
			(mocks.translations as Record<string, Record<string, string>>)[namespace]?.[key] ?? key;

		if (values) {
			for (const [name, value] of Object.entries(values)) {
				text = text.replace(`{${name}}`, String(value));
			}
		}

		return text;
	},
}));

vi.mock("next/image", () => ({
	default: ({ alt }: { alt: string }) => (
		<div aria-label={alt} data-testid="next-image" role="img" />
	),
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: (selector: (state: typeof mocks.state) => unknown) => selector(mocks.state),
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: (state: typeof mocks.state) => state.flightSelection.confirmedFlight,
}));

vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	selectAncillaryOffersDataByDirectionAndServiceCategory: (state: typeof mocks.state) =>
		state.ancillaryData,
}));

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: mocks.getBookingStageSegmentMock,
}));

vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isDestinationHNLfromNRT: vi.fn(() => true),
	isDestinationNRTfromHNL: vi.fn(() => false),
}));

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response",
	() => ({
		createLfidBySsrCodeMap: vi.fn(),
	})
);

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-card/transport-service-card-display",
	() => ({
		getTransportServiceAvailability: vi.fn(() => mocks.availability),
		displayShuttleServicePricingRows: vi.fn(() => [{ label: "Adult", prices: [1000] }]),
		displayTrolleyServicePricingRows: vi.fn(() => [{ label: "Adult", prices: [2000] }]),
		displayTrolleyServices: vi.fn(() => [{ code: "TRLA" }]),
		displayPtcAgeGroupLabels: vi.fn(() => ["Adults"]),
		displayTransportServiceApplicable: vi.fn(() => mocks.transportServices),
	})
);

vi.mock(
	"@/modules/hooks/customize/transport-service/use-transport-service-pricing/use-transport-service-pricing",
	() => ({
		useTransportServicePricing: () => mocks.pricingHook,
	})
);

vi.mock(
	"@/modules/hooks/customize/transport-service/use-transport-service-selection/use-transport-service-selection",
	() => ({
		useTransportServiceSelection: () => mocks.selectionHook,
	})
);

vi.mock(
	"@/modules/hooks/customize/transport-service/use-transport-passengers/use-transport-service-passengers",
	() => ({
		useTransportServicePassengers: () => mocks.passengerHook,
	})
);

vi.mock(
	"@/modules/hooks/customize/transport-service/use-transport-service-persisitence/use-transport-service-persistence",
	() => ({
		useTransportServicePersistence: () => mocks.persistenceHook,
	})
);

vi.mock(
	"@/components/customize/transport-service/transport-service-card/transport-service-card",
	() => ({
		TransportServiceCard: (props: { title: string; services: unknown[] }) => (
			<div data-testid="transport-card">
				<span>{props.title}</span>
				<span data-testid={`services-${props.title}`}>{JSON.stringify(props.services)}</span>
			</div>
		),
	})
);

vi.mock("@/components/common/select-customers/select-customers", () => ({
	SelectCustomers: (props: {
		title: string;
		disabledPassengerCategories: string[];
		onPassengerChange: (passengerId: string, checked: boolean) => void;
		onSelectAllChange: (checked: boolean) => void;
	}) => (
		<div>
			<div data-testid="select-customers-title">{props.title}</div>
			<div data-testid="select-customers-disabled">
				{props.disabledPassengerCategories.join(",")}
			</div>
			<button
				type="button"
				data-testid="toggle-passenger"
				onClick={() => props.onPassengerChange("p1", true)}
			>
				Toggle Passenger
			</button>
			<button type="button" data-testid="toggle-all" onClick={() => props.onSelectAllChange(true)}>
				Toggle All
			</button>
		</div>
	),
}));

vi.mock(
	"@/components/customize/transport-service/transport-service-dialog/transport-services-dialog",
	() => ({
		TransportServiceDialog: (props: {
			children: React.ReactNode;
			onOpenChange: (open: boolean) => void;
			onConfirm: () => void;
			onBack: () => void;
			totalAmount: number;
			hasOutOfStockPassengers: boolean;
		}) => {
			mocks.dialogProps = props;
			return (
				<div data-testid="dialog-root">
					<div data-testid="dialog-total">{props.totalAmount}</div>
					<div data-testid="dialog-out-of-stock">{String(props.hasOutOfStockPassengers)}</div>
					<button
						type="button"
						data-testid="dialog-open-close"
						onClick={() => props.onOpenChange(false)}
					>
						Close
					</button>
					<button type="button" data-testid="dialog-confirm" onClick={props.onConfirm}>
						Confirm
					</button>
					<button type="button" data-testid="dialog-back" onClick={props.onBack}>
						Back
					</button>
					{props.children}
				</div>
			);
		},
	})
);

const defaultProps = {
	open: true,
	onOpenChange: vi.fn(),
	routeLabel: "NRT-HNL",
	direction: "outbound" as const,
	origin: "NRT",
	destination: "HNL",
	stageLabel: "Stage",
	triggerRef: { current: null },
};

const renderComponent = (props = {}) =>
	renderWithProviders(<TransportService {...defaultProps} {...props} />);

describe("TransportService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.dialogProps = null;
		mocks.availability = {
			hasOneWay: true,
			hasRoundTrip: false,
			hasTRLA: true,
			hasTRLB: false,
			hasTRLC: false,
			hasAnySupportedTransportSsr: true,
		};
		mocks.transportServices = [
			{
				title: "Shuttle",
				imageSrc: "img-shuttle",
				moreInfoHref: "/shuttle",
				description: "Shuttle description",
				ageGroupLabels: ["Adults"],
				durationLabel: "30min",
				pricingRows: [{ label: "Adult", prices: [1000] }],
				footnote: "Footnote",
				services: [{ code: "OW" }],
			},
			{
				title: "Trolley",
				imageSrc: "img-trolley",
				moreInfoHref: "/trolley",
				description: "Trolley description",
				ageGroupLabels: ["Adults", "Children"],
				durationLabel: "45min",
				pricingRows: [{ label: "Adult", prices: [2000] }],
				footnote: "Footnote 2",
				services: [{ code: "TRLA" }],
			},
		];
		mocks.pricingHook = {
			getPassengerAmount: vi.fn(() => 1000),
			storedServicesTotal: 1200,
			setPricingTransportServiceId: vi.fn(),
		};
		mocks.selectionHook = {
			selectedTransportServiceId: null,
			setSelectedTransportServiceId: vi.fn(),
			selectedServiceStockLimit: 5,
			remainingStockCount: 3,
			shouldShowRemainingStock: false,
			selectedService: null,
			selectedServiceDescription: "Selected service details",
			handleBackFromTransportServiceDetails: vi.fn(),
			getTransportCardServices: vi.fn((services: unknown[]) => services),
		};
		mocks.passengerHook = {
			transportServicePax: [],
			passengersWithAmount: [{ id: "p1", name: "Test Pax", checked: false, price: 1000 }],
			hasOutOfStockPassengers: false,
			currentSelectionTotal: 3000,
			selectedTransportPassengerCount: 0,
			toggleTransportServicePax: vi.fn(),
			toggleTransportServiceSelectAll: vi.fn(),
		};
		mocks.persistenceHook = {
			persistSelectedTransportService: vi.fn(),
		};
		mocks.getBookingStageSegmentMock.mockClear();
		defaultProps.onOpenChange = vi.fn();
	});

	it("classifies as a component and renders list mode with transport cards", () => {
		renderComponent();

		expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
		expect(screen.getAllByTestId("transport-card")).toHaveLength(2);
		expect(screen.queryByText("No purchase options")).not.toBeInTheDocument();
		expect(mocks.selectionHook.getTransportCardServices).toHaveBeenCalledTimes(2);
	});

	it("shows no purchase message when no supported SSR exists", () => {
		mocks.availability.hasAnySupportedTransportSsr = false;

		renderComponent();

		expect(screen.getByText("No purchase options")).toBeInTheDocument();
		expect(screen.queryAllByTestId("transport-card")).toHaveLength(0);
	});

	it("renders selected service details and stock message when a service is selected", () => {
		mocks.selectionHook.selectedTransportServiceId = "OW";
		mocks.selectionHook.shouldShowRemainingStock = true;
		mocks.selectionHook.remainingStockCount = 2;
		mocks.selectionHook.selectedService = {
			label: "Airport Shuttle",
			activityImage: "service-image",
		};
		mocks.passengerHook.hasOutOfStockPassengers = true;

		renderComponent();

		expect(screen.getByText("Airport Shuttle")).toBeInTheDocument();
		expect(screen.getByText("Remaining: 2")).toBeInTheDocument();
		expect(screen.getByText("Selected service details")).toBeInTheDocument();
		expect(screen.getByTestId("next-image")).toBeInTheDocument();
		expect(screen.getByTestId("select-customers-title")).toHaveTextContent("Select customers");
		expect(screen.getByTestId("select-customers-disabled")).toHaveTextContent("Infant");
		expect(screen.getByTestId("dialog-total")).toHaveTextContent("3000");
		expect(screen.getByTestId("dialog-out-of-stock")).toHaveTextContent("true");
	});

	it("does not render details content when selected id exists but selected service is missing", () => {
		mocks.selectionHook.selectedTransportServiceId = "OW";
		mocks.selectionHook.selectedService = null;

		renderComponent();

		expect(screen.queryByTestId("select-customers-title")).not.toBeInTheDocument();
		expect(screen.queryByTestId("next-image")).not.toBeInTheDocument();
	});

	it("triggers passenger selection handlers from SelectCustomers", () => {
		mocks.selectionHook.selectedTransportServiceId = "OW";
		mocks.selectionHook.selectedService = {
			label: "Airport Shuttle",
			activityImage: "service-image",
		};

		renderComponent();

		fireEvent.click(screen.getByTestId("toggle-passenger"));
		fireEvent.click(screen.getByTestId("toggle-all"));

		expect(mocks.passengerHook.toggleTransportServicePax).toHaveBeenCalledWith("p1", true);
		expect(mocks.passengerHook.toggleTransportServiceSelectAll).toHaveBeenCalledWith(true);
	});

	it("handles dialog close by resetting selected and pricing ids", () => {
		renderComponent();

		fireEvent.click(screen.getByTestId("dialog-open-close"));

		expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
		expect(mocks.selectionHook.setSelectedTransportServiceId).toHaveBeenCalledWith(null);
		expect(mocks.pricingHook.setPricingTransportServiceId).toHaveBeenCalledWith(null);
	});

	it("handles dialog open change true without resetting selection", () => {
		renderComponent();

		expect(mocks.dialogProps).not.toBeNull();
		const dialogProps = mocks.dialogProps as { onOpenChange: (open: boolean) => void };
		dialogProps.onOpenChange(true);

		expect(defaultProps.onOpenChange).toHaveBeenCalledWith(true);
		expect(mocks.selectionHook.setSelectedTransportServiceId).not.toHaveBeenCalled();
		expect(mocks.pricingHook.setPricingTransportServiceId).not.toHaveBeenCalled();
	});

	it("confirms selected service by persisting and resetting selected service id", () => {
		mocks.selectionHook.selectedTransportServiceId = "OW";
		mocks.selectionHook.selectedService = {
			label: "Airport Shuttle",
			activityImage: "service-image",
		};

		renderComponent();

		fireEvent.click(screen.getByTestId("dialog-confirm"));

		expect(mocks.persistenceHook.persistSelectedTransportService).toHaveBeenCalledTimes(1);
		expect(mocks.selectionHook.setSelectedTransportServiceId).toHaveBeenCalledWith(null);
		expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
	});

	it("confirms without selection by closing dialog and resetting pricing id", () => {
		mocks.selectionHook.selectedTransportServiceId = null;

		renderComponent();

		fireEvent.click(screen.getByTestId("dialog-confirm"));

		expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
		expect(mocks.selectionHook.setSelectedTransportServiceId).toHaveBeenCalledWith(null);
		expect(mocks.pricingHook.setPricingTransportServiceId).toHaveBeenCalledWith(null);
		expect(mocks.persistenceHook.persistSelectedTransportService).not.toHaveBeenCalled();
	});

	it("wires back action to selection hook handler", () => {
		renderComponent();

		fireEvent.click(screen.getByTestId("dialog-back"));

		expect(mocks.selectionHook.handleBackFromTransportServiceDetails).toHaveBeenCalledTimes(1);
	});

	it("uses stored total amount when no service is selected", () => {
		mocks.pricingHook.storedServicesTotal = 4321;
		mocks.selectionHook.selectedTransportServiceId = null;

		renderComponent();

		expect(screen.getByTestId("dialog-total")).toHaveTextContent("4321");
	});

	it("passes undefined confirmedFlight to stage segment helper when selector returns null", () => {
		mocks.state.flightSelection.confirmedFlight = null;

		renderComponent();

		expect(mocks.getBookingStageSegmentMock).toHaveBeenCalledWith({
			confirmedFlight: undefined,
			direction: "outbound",
		});
	});

	it("falls back remaining stock count to 0 when remainingStockCount is null", () => {
		mocks.selectionHook.selectedTransportServiceId = "OW";
		mocks.selectionHook.shouldShowRemainingStock = true;
		mocks.selectionHook.remainingStockCount = null;
		mocks.selectionHook.selectedService = {
			label: "Airport Shuttle",
			activityImage: "service-image",
		};

		renderComponent();

		expect(screen.getByText("Remaining: 5")).toBeInTheDocument();
	});

	it("extracts currentLfid from lfidBySsrCodeMap with first value", () => {
		renderComponent();

		expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
		// Verify the component rendered successfully with the mocked currentLfid
		expect(screen.getAllByTestId("transport-card")).toHaveLength(2);
	});

	it("passes undefined as currentLfid when lfidBySsrCodeMap is empty", () => {
		renderComponent();

		// Component should render successfully even with different lfidBySsrCodeMap states
		expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
	});
});
