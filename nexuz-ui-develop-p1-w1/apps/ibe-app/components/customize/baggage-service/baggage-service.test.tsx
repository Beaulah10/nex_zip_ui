import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaggageService } from "./baggage-service";

const dialogContentCloseMock = vi.hoisted(() => vi.fn());
const useServicePassengersMock = vi.hoisted(() => vi.fn());
const useBaggageInventoryMock = vi.hoisted(() => vi.fn());
const useBaggageOfferOptionsMock = vi.hoisted(() => vi.fn());
const useBaggageSelectionStateMock = vi.hoisted(() => vi.fn());
const useSavePassengerBaggageSelectionMock = vi.hoisted(() => vi.fn());
const getBaggageOffersByPassengerTypeMock = vi.hoisted(() => vi.fn());
const calculateBaggagePriceFromSelectionMock = vi.hoisted(() => vi.fn());
const getFlightSegmentMock = vi.hoisted(() => vi.fn());
const getConnectingSegmentInfoMock = vi.hoisted(() => vi.fn());
const buildPassengerWithBaggageSelectionMock = vi.hoisted(() => vi.fn());
const buildSelectionValuesFromPassengerBaggageMock = vi.hoisted(() => vi.fn());
const getBookingStageSegmentMock = vi.hoisted(() => vi.fn());
const useAppDispatchMock = vi.hoisted(() => vi.fn());
const useAppSelectorMock = vi.hoisted(() => vi.fn());
const selectAncillaryOffersMock = vi.hoisted(() => vi.fn());

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button type="button" onClick={onClick} {...props}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		children,
		open,
		onOpenChange,
	}: {
		children: React.ReactNode;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}) => (
		<div data-testid={`dialog-${String(open)}`}>
			<button type="button" onClick={() => onOpenChange?.(!open)}>
				dialog-toggle
			</button>
			{children}
		</div>
	),
	DialogContent: ({
		children,
		onCloseAutoFocus,
	}: {
		children: React.ReactNode;
		onCloseAutoFocus?: (event: { preventDefault: () => void }) => void;
	}) => (
		<div>
			<button
				type="button"
				onClick={() => {
					const event = { preventDefault: dialogContentCloseMock };
					onCloseAutoFocus?.(event);
				}}
			>
				content-close
			</button>
			{children}
		</div>
	),
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" "),
}));

vi.mock(
	"@/components/customize/baggage-service/baggage-passenger-list/baggage-passenger-list",
	() => ({
		BaggagePassengerList: ({
			passengers,
			onPassengerClick,
		}: {
			passengers: Array<{ id: string; name: string }>;
			onPassengerClick: (id: string) => void;
		}) => (
			<div>
				<span>passenger-list</span>
				{passengers.map((passenger) => (
					<button key={passenger.id} type="button" onClick={() => onPassengerClick(passenger.id)}>
						{passenger.name}
					</button>
				))}
			</div>
		),
	})
);

vi.mock("@/components/customize/baggage-service/baggage-selection/baggage-selection", () => ({
	BaggageSelection: ({
		passengerName,
		bundleLabel,
		checkedInBaggagePrice,
		segmentValidationMessage,
		onChange,
		onValidationChange,
	}: {
		passengerName: string;
		bundleLabel: string;
		checkedInBaggagePrice: number;
		segmentValidationMessage: string | null;
		onChange: (value: {
			carryOnId: string;
			checkedInBaggageCount: number;
			equipmentCounts: Record<string, number>;
		}) => void;
		onValidationChange?: (validate: () => boolean) => void;
	}) => {
		onValidationChange?.(() => true);
		return (
			<div>
				<span>{passengerName}</span>
				<span>{bundleLabel}</span>
				<span>{String(checkedInBaggagePrice)}</span>
				<span>{segmentValidationMessage ?? "no-message"}</span>
				<button
					type="button"
					onClick={() =>
						onChange({
							carryOnId: "CABN",
							checkedInBaggageCount: 2,
							equipmentCounts: { SKII: 1 },
						})
					}
				>
					edit-selection
				</button>
			</div>
		);
	},
}));

vi.mock("@/modules/hooks/baggage-service/baggage-inventory/baggage-inventory", () => ({
	useBaggageInventory: useBaggageInventoryMock,
}));

vi.mock("@/modules/hooks/baggage-service/baggage-offer-options/baggage-offer-options", () => ({
	useBaggageOfferOptions: useBaggageOfferOptionsMock,
}));

vi.mock("@/modules/hooks/baggage-service/baggage-selection-state/baggage-selection-state", () => ({
	useBaggageSelectionState: useBaggageSelectionStateMock,
}));

vi.mock("@/modules/hooks/baggage-service/save-baggage-selection/save-baggage-selection", () => ({
	useSavePassengerBaggageSelection: useSavePassengerBaggageSelectionMock,
}));

vi.mock("@/modules/hooks/common/service-passengers/service-passengers", () => ({
	useServicePassengers: useServicePassengersMock,
}));

vi.mock("@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers", () => ({
	getBaggageOffersByPassengerType: getBaggageOffersByPassengerTypeMock,
}));

vi.mock("@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing", () => ({
	calculateBaggagePriceFromSelection: calculateBaggagePriceFromSelectionMock,
}));

vi.mock(
	"@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils",
	() => ({
		getConnectingSegmentInfo: getConnectingSegmentInfoMock,
		getFlightSegment: getFlightSegmentMock,
	})
);

vi.mock(
	"@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection",
	() => ({
		buildPassengerWithBaggageSelection: buildPassengerWithBaggageSelectionMock,
		buildSelectionValuesFromPassengerBaggage: buildSelectionValuesFromPassengerBaggageMock,
	})
);

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: getBookingStageSegmentMock,
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: useAppDispatchMock,
	useAppSelector: useAppSelectorMock,
}));

vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	selectAncillaryOffersDataByDirectionAndServiceCategory: selectAncillaryOffersMock,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: (state: MockState) => state.confirmedFlight,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectPassengers: (state: MockState) => state.passengers,
}));

type MockState = {
	confirmedFlight: { flights: { outbound: { segments: Array<{ lfid: number }> } } };
	passengers: Array<{ id: string }>;
	ancillaryOffers: Record<string, Record<string, unknown>>;
};

type ComponentProps = Parameters<typeof BaggageService>[0];

const mockDispatch = vi.fn();
const savePassengerBaggageSelection = vi.fn();
const setBaggageSelections = vi.fn();
const setSelectedPassengerId = vi.fn();
const setEditingSelection = vi.fn();

let mockState: MockState;
let selectionState: ReturnType<typeof useBaggageSelectionStateMock>;

const listSelections = {
	p1: {
		passenger: {
			id: "p1",
			name: "John Doe",
			bundleCode: "PRMK",
			bundleLabel: "Premium",
			passengerTypeCode: "adult",
		},
		baggageServices: { carryOn: {}, checkedIn: {}, sportsEquipment: {} },
		categories: [],
		totalPrice: 5000,
	},
	p2: {
		passenger: {
			id: "p2",
			name: "Jane Doe",
			bundleCode: "NOBN",
			bundleLabel: "No Bundle",
			passengerTypeCode: "adult",
		},
		baggageServices: { carryOn: {}, checkedIn: {}, sportsEquipment: {} },
		categories: [],
		totalPrice: 2500,
	},
};

const createProps = (overrides: Partial<ComponentProps> = {}): ComponentProps => ({
	stageLabel: "Segment 1",
	routeLabel: "Tokyo - Osaka",
	direction: "outbound",
	openBaggageDialog: true,
	onOpenBaggageDialogChange: vi.fn(),
	closeBaggageDialog: vi.fn(),
	...overrides,
});

describe("BaggageService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockState = {
			confirmedFlight: { flights: { outbound: { segments: [{ lfid: 1001 }] } } },
			passengers: [{ id: "p1" }, { id: "p2" }],
			ancillaryOffers: { outbound: { baggage: { data: [] } } },
		};
		selectionState = {
			baggageSelections: listSelections,
			setBaggageSelections,
			selectedPassengerId: null,
			setSelectedPassengerId,
			editingSelection: null,
			setEditingSelection,
		};

		useAppDispatchMock.mockReturnValue(mockDispatch);
		useAppSelectorMock.mockImplementation((selector: (state: MockState) => unknown) =>
			selector(mockState)
		);
		useServicePassengersMock.mockReturnValue({
			servicePassengers: [
				{
					id: "p1",
					name: "John Doe",
					bundleCode: "PRMK",
					bundleLabel: "Premium",
					baggagefeatures: [],
					passengerTypeCode: "adult",
				},
				{
					id: "p2",
					name: "Jane Doe",
					bundleCode: "NOBN",
					bundleLabel: "No Bundle",
					baggagefeatures: [],
					passengerTypeCode: "adult",
				},
			],
		});
		getBookingStageSegmentMock.mockReturnValue("outbound");
		selectAncillaryOffersMock.mockImplementation(
			(state: MockState, stage: string, category: string) =>
				state.ancillaryOffers[stage]?.[category]
		);
		getBaggageOffersByPassengerTypeMock.mockReturnValue({ adult: { categories: {} } });
		getFlightSegmentMock.mockReturnValue({ lfid: 1001 });
		getConnectingSegmentInfoMock.mockReturnValue({
			isConnectingFlight: false,
			otherLfid: undefined,
		});
		buildPassengerWithBaggageSelectionMock.mockImplementation(
			({ currentLfid }: { currentLfid?: number }) => (currentLfid === 1001 ? listSelections : {})
		);
		useBaggageSelectionStateMock.mockImplementation(() => selectionState);
		useBaggageInventoryMock.mockReturnValue({ CABN: 3, BAGN: 2, SKII: 1 });
		useBaggageOfferOptionsMock.mockReturnValue({
			carryOnOptions: [{ id: "7kg" }, { id: "CABN" }],
			sportsEquipmentOptions: [{ id: "SKII" }],
			priceForCheckedInBaggage: 7500,
		});
		calculateBaggagePriceFromSelectionMock.mockReturnValue(12000);
		buildSelectionValuesFromPassengerBaggageMock.mockReturnValue({
			carryOnId: "7kg",
			checkedInBaggageCount: 1,
			equipmentCounts: {},
		});
		useSavePassengerBaggageSelectionMock.mockReturnValue({
			savePassengerBaggageSelection,
			baggageValidationRef: { current: null },
		});
	});

	it("renders the passenger list view, opens passenger detail, and closes from the footer", () => {
		const closeBaggageDialog = vi.fn();

		render(<BaggageService {...createProps({ closeBaggageDialog })} />);

		expect(screen.getByText("title_baggage_services")).toBeInTheDocument();
		expect(screen.getByText("Tokyo - Osaka")).toBeInTheDocument();
		expect(screen.getByText("passenger-list")).toBeInTheDocument();
		expect(screen.getByText("￥7,500")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Jane Doe" }));
		expect(buildSelectionValuesFromPassengerBaggageMock).toHaveBeenCalledWith(listSelections.p2, [
			{ id: "SKII" },
		]);
		expect(setEditingSelection).toHaveBeenCalledWith({
			carryOnId: "7kg",
			checkedInBaggageCount: 1,
			equipmentCounts: {},
		});
		expect(setSelectedPassengerId).toHaveBeenCalledWith("p2");

		fireEvent.click(screen.getByRole("button", { name: "baggage_confirm_selection" }));
		expect(closeBaggageDialog).toHaveBeenCalled();
	});

	it("renders the passenger detail view, updates editing state, and saves from the footer", () => {
		selectionState = {
			...selectionState,
			selectedPassengerId: "p1",
			editingSelection: {
				carryOnId: "7kg",
				checkedInBaggageCount: 1,
				equipmentCounts: {},
			},
		};
		useBaggageSelectionStateMock.mockImplementation(() => selectionState);

		render(<BaggageService {...createProps()} />);

		expect(screen.getAllByText("John Doe")).not.toHaveLength(0);
		expect(screen.getByText("Premium")).toBeInTheDocument();
		expect(screen.getByText("7500")).toBeInTheDocument();
		expect(screen.getByText("￥12,000")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "edit-selection" }));
		expect(setEditingSelection).toHaveBeenCalledWith({
			carryOnId: "CABN",
			checkedInBaggageCount: 2,
			equipmentCounts: { SKII: 1 },
		});

		fireEvent.click(screen.getByRole("button", { name: "baggage_confirm_selection" }));
		expect(savePassengerBaggageSelection).toHaveBeenCalled();
	});

	it("returns to the passenger list from detail view and restores focus state", () => {
		selectionState = {
			...selectionState,
			selectedPassengerId: "p1",
			editingSelection: {
				carryOnId: "7kg",
				checkedInBaggageCount: 1,
				equipmentCounts: {},
			},
		};
		useBaggageSelectionStateMock.mockImplementation(() => selectionState);

		render(<BaggageService {...createProps()} />);

		fireEvent.click(screen.getByRole("button", { name: "aria_labels.label_back" }));

		expect(setSelectedPassengerId).toHaveBeenCalledWith(null);
		expect(setEditingSelection).toHaveBeenCalledWith(null);
	});

	it("ignores passenger clicks when that passenger has no baggage selection", () => {
		useServicePassengersMock.mockReturnValue({
			servicePassengers: [
				{
					id: "p3",
					name: "Missing Passenger",
					bundleCode: "NOBN",
					bundleLabel: "No Bundle",
					baggagefeatures: [],
					passengerTypeCode: "adult",
				},
			],
		});

		render(<BaggageService {...createProps()} />);

		fireEvent.click(screen.getByRole("button", { name: "Missing Passenger" }));

		expect(buildSelectionValuesFromPassengerBaggageMock).not.toHaveBeenCalled();
		expect(setSelectedPassengerId).not.toHaveBeenCalledWith("p3");
	});

	it("renders no detail content when a passenger id exists without an editing selection and handles mismatch acknowledgement", () => {
		selectionState = {
			...selectionState,
			selectedPassengerId: "p1",
			editingSelection: null,
		};
		useBaggageSelectionStateMock.mockImplementation(() => selectionState);

		render(<BaggageService {...createProps()} />);

		expect(screen.queryByText("7500")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "button_ok" }));
		expect(screen.getByText("segment_mismatch_dialog_description")).toBeInTheDocument();
	});

	it("closes the dialog when already open and restores focus to the trigger ref", () => {
		const refFocus = vi.fn();
		const closeBaggageDialog = vi.fn();

		render(
			<BaggageService
				{...createProps({
					closeBaggageDialog,
					ref: { current: { focus: refFocus } as unknown as HTMLButtonElement },
				})}
			/>
		);

		fireEvent.click(
			screen.getAllByRole("button", { name: "dialog-toggle" })[0] as HTMLButtonElement
		);
		expect(setSelectedPassengerId).toHaveBeenCalledWith(null);
		expect(setEditingSelection).toHaveBeenCalledWith(null);
		expect(closeBaggageDialog).toHaveBeenCalled();

		fireEvent.click(
			screen.getAllByRole("button", { name: "content-close" })[0] as HTMLButtonElement
		);
		expect(dialogContentCloseMock).toHaveBeenCalled();
		expect(refFocus).toHaveBeenCalledWith({ preventScroll: true });
	});

	it("opens the dialog when closed", () => {
		const onOpenBaggageDialogChange = vi.fn();

		render(
			<BaggageService
				{...createProps({
					openBaggageDialog: false,
					onOpenBaggageDialogChange,
				})}
			/>
		);

		fireEvent.click(
			screen.getAllByRole("button", { name: "dialog-toggle" })[0] as HTMLButtonElement
		);
		expect(onOpenBaggageDialogChange).toHaveBeenCalledWith(true);
	});
});
