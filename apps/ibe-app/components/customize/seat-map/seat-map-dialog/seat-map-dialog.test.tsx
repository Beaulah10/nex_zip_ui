import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeatMapDialog } from "./seat-map-dialog";

const mocks = vi.hoisted(() => ({
	useSeatMapDialog: vi.fn(),
	setActivePassenger: vi.fn(),
	handleValidatedSeatSelect: vi.fn(),
	handleConfirmSeatSelection: vi.fn(),
	handleDialogOpenChange: vi.fn(),
	handleConfirmEmergencyExitSupport: vi.fn(),
	handleGoBackFromEmergencySupport: vi.fn(),
	getFirstUnselectedPassengerIndex: vi.fn(() => 0),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock(
	"@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel",
	() => ({
		getFirstUnselectedPassengerIndex: mocks.getFirstUnselectedPassengerIndex,
	})
);

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: ReactNode; variant?: string }) => (
		<div data-testid="alert" data-variant={variant}>
			{children}
		</div>
	),
	AlertDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		open,
		onOpenChange,
		children,
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		children: ReactNode;
	}) =>
		open ? (
			<div data-testid="dialog">
				<button type="button" onClick={() => onOpenChange(false)}>
					close-dialog
				</button>
				{children}
			</div>
		) : null,

	DialogContent: ({
		children,
		onOpenAutoFocus,
		onCloseAutoFocus,
	}: {
		children: ReactNode;
		onOpenAutoFocus?: (event: Event) => void;
		onCloseAutoFocus?: (event: Event) => void;
	}) => {
		const focusTarget = document.createElement("button");
		focusTarget.focus = vi.fn();

		onOpenAutoFocus?.({
			preventDefault: vi.fn(),
			target: focusTarget,
		} as unknown as Event);

		onCloseAutoFocus?.({
			preventDefault: vi.fn(),
			target: focusTarget,
		} as unknown as Event);

		return <div data-testid="dialog-content">{children}</div>;
	},

	DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: ReactNode }) => <h1>{children}</h1>,
}));

vi.mock(
	"@/components/customize/seat-map/emergency-exit-support-content/emergency-exit-support-content",
	() => ({
		EmergencyExitSupportContent: ({
			routeLabel,
			onConfirm,
			onCancel,
		}: {
			routeLabel: string;
			onConfirm: () => void;
			onCancel: () => void;
		}) => (
			<div>
				<div>EmergencyExitSupportContent</div>
				<div>{routeLabel}</div>
				<button type="button" onClick={onConfirm}>
					confirm-emergency
				</button>
				<button type="button" onClick={onCancel}>
					cancel-emergency
				</button>
			</div>
		),
	})
);

vi.mock("@/components/customize/seat-map/seat-map/seat-map", () => ({
	SeatMap: ({
		activeSeatCode,
		onSeatSelect,
	}: {
		activeSeatCode?: string;
		onSeatSelect: (seatCode: string) => void;
	}) => (
		<button type="button" onClick={() => onSeatSelect("12A")}>
			{`SeatMap:${activeSeatCode}`}
		</button>
	),
}));

vi.mock(
	"@/components/customize/seat-map/seat-map-passenger-panel/seat-map-passenger-panel",
	() => ({
		SeatMapPassengerPanel: ({
			flightCode,
			onPassengerSelect,
		}: {
			flightCode: string;
			onPassengerSelect: (index: number) => void;
		}) => (
			<button type="button" onClick={() => onPassengerSelect(1)}>
				{`SeatMapPassengerPanel:${flightCode}`}
			</button>
		),
	})
);

vi.mock("@/modules/hooks/seat-map/use-seat-map-dialog/use-seat-map-dialog", () => ({
	useSeatMapDialog: mocks.useSeatMapDialog,
}));

const createHookReturn = () => ({
	selectedCabin: "Standard" as const,
	seatMapData: [{ name: "Cabin", class: "Standard", rows: [] }],
	seatValidationError: undefined,
	seatWarningBanner: undefined,
	seatMapPassengerPanel: {
		flightCode: "NRT-BKK",
		passengers: [{ name: "ZIP TARO" }],
	},
	activePassengerIndex: 0,
	setActivePassenger: mocks.setActivePassenger,
	activePassengerComplimentaryLegendEligible: false,
	bundleInfoMessage: undefined,
	legendPrices: {},
	seatPassengers: [
		{
			name: "ZIP TARO",
			seatCode: "12A",
			seatType: "Window",
			price: "¥2,000",
		},
	],
	adjacentInfoBannerMessages: [
		{
			text: "Adjacent info",
			linkText: "Learn more",
			linkHref: "/help",
		},
		{
			text: "Adjacent info without link",
		},
	],
	seatRulesInfoMessages: ["Rule 1"],
	assignedSeatToPassengerIndex: { "12A": 0 },
	assignedSeatToPassengerLabel: { "12A": "ZT" },
	activeSeatCode: "12A",
	handleValidatedSeatSelect: mocks.handleValidatedSeatSelect,
	handleConfirmSeatSelection: mocks.handleConfirmSeatSelection,
	handleDialogOpenChange: mocks.handleDialogOpenChange,
	effectiveTotalSeatCost: 2000,
	showingEmergencyExitSupport: false,
	handleConfirmEmergencyExitSupport: mocks.handleConfirmEmergencyExitSupport,
	handleGoBackFromEmergencySupport: mocks.handleGoBackFromEmergencySupport,
});

describe("SeatMapDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.useSeatMapDialog.mockReturnValue(createHookReturn());
	});

	it("renders the main seat-map dialog content and delegates actions to the hook", () => {
		const restoreFocusElement = document.createElement("button");
		restoreFocusElement.focus = vi.fn();

		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
				restoreFocusElement={restoreFocusElement}
			/>
		);

		expect(screen.getByText("seat_selection - Stage 1")).toBeTruthy();
		expect(screen.getByText("NRT-BKK")).toBeTruthy();
		expect(screen.getByText("SeatMapPassengerPanel:NRT-BKK")).toBeTruthy();
		expect(screen.getByText("SeatMap:12A")).toBeTruthy();
		expect(screen.getByText("¥2,000")).toBeTruthy();

		expect(mocks.getFirstUnselectedPassengerIndex).toHaveBeenCalledWith([
			{
				name: "ZIP TARO",
				seatCode: "12A",
				seatType: "Window",
				price: "¥2,000",
			},
		]);

		expect(mocks.setActivePassenger).toHaveBeenCalledWith(0);

		fireEvent.click(screen.getByText("SeatMapPassengerPanel:NRT-BKK"));

		expect(mocks.setActivePassenger).toHaveBeenLastCalledWith(1);
		fireEvent.click(screen.getByText("SeatMap:12A"));
		expect(mocks.handleValidatedSeatSelect).toHaveBeenCalledWith("12A");

		fireEvent.click(screen.getByRole("button", { name: "confirm_selection" }));
		expect(mocks.handleConfirmSeatSelection).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: "close-dialog" }));
		expect(mocks.handleDialogOpenChange).toHaveBeenCalledWith(false);

		expect(restoreFocusElement.focus).toHaveBeenCalledTimes(1);
	});

	it("shows validation error banner", () => {
		mocks.useSeatMapDialog.mockReturnValue({
			...createHookReturn(),
			seatValidationError: {
				type: "NON_ADJACENT_ERROR",
				title: "Seat error",
				body: "Passengers must be adjacent.",
			},
			seatWarningBanner: {
				title: "Warning title",
				body: "Warning body",
			},
		});

		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(screen.getByText("Seat error")).toBeTruthy();
		expect(screen.getByText("Passengers must be adjacent.")).toBeTruthy();
		const alerts = screen.getAllByTestId("alert");

		expect(alerts[0]).toHaveAttribute("data-variant", "error");
	});

	it("shows warning banner when validation error is not available", () => {
		mocks.useSeatMapDialog.mockReturnValue({
			...createHookReturn(),
			seatValidationError: undefined,
			seatWarningBanner: {
				title: "Warning title",
				body: "Warning body",
			},
		});

		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="inbound"
				stageLabel="Stage 2"
				routeLabel=""
			/>
		);

		expect(screen.getByText("Warning title")).toBeTruthy();
		expect(screen.getByText("Warning body")).toBeTruthy();
		const alerts = screen.getAllByTestId("alert");

		expect(alerts[0]).toHaveAttribute("data-variant", "warning");
	});

	it("renders adjacent and seat rule information banners", () => {
		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(screen.getByText("adjacent_seat_information")).toBeTruthy();
		expect(screen.getByText("Adjacent info")).toBeTruthy();
		expect(screen.getByText("Learn more")).toBeTruthy();
		expect(screen.getByText("Adjacent info without link")).toBeTruthy();
		expect(screen.getByText("Rule 1")).toBeTruthy();
	});

	it("renders zero amount and hides SeatMap when seatMapData is not available", () => {
		mocks.useSeatMapDialog.mockReturnValue({
			...createHookReturn(),
			seatMapData: null,
			effectiveTotalSeatCost: 0,
		});

		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(screen.queryByText("SeatMap:12A")).toBeNull();
		expect(screen.getByText("¥0")).toBeTruthy();
	});

	it("renders emergency support content and delegates emergency actions", () => {
		mocks.useSeatMapDialog.mockReturnValue({
			...createHookReturn(),
			showingEmergencyExitSupport: true,
		});

		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(screen.getByText("EmergencyExitSupportContent")).toBeTruthy();
		expect(screen.getByText("NRT-BKK")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "confirm-emergency" }));
		expect(mocks.handleConfirmEmergencyExitSupport).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: "cancel-emergency" }));
		expect(mocks.handleGoBackFromEmergencySupport).toHaveBeenCalledTimes(1);
	});

	it("sets the first unselected passenger when the dialog opens", () => {
		render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(mocks.getFirstUnselectedPassengerIndex).toHaveBeenCalled();
		expect(mocks.setActivePassenger).toHaveBeenCalledWith(0);
	});

	it("does not reset focus while the dialog remains open", () => {
		mocks.useSeatMapDialog
			.mockReturnValueOnce({
				...createHookReturn(),
				seatPassengers: [
					{
						name: "ZIP TARO",
						seatCode: "12A",
						seatType: "Window",
						price: "¥2,000",
					},
					{ name: "ZIP HANAKO" },
				],
			})
			.mockReturnValueOnce({
				...createHookReturn(),
				seatPassengers: [
					{
						name: "ZIP TARO",
						seatCode: "12A",
						seatType: "Window",
						price: "¥2,000",
					},
					{
						name: "ZIP HANAKO",
						seatCode: "12B",
						seatType: "Middle",
						price: "¥2,500",
					},
				],
			});

		const { rerender } = render(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(mocks.setActivePassenger).toHaveBeenCalledTimes(1);

		rerender(
			<SeatMapDialog
				open
				onOpenChange={vi.fn()}
				direction="outbound"
				stageLabel="Stage 1"
				routeLabel="NRT-BKK"
			/>
		);

		expect(mocks.setActivePassenger).toHaveBeenCalledTimes(1);
	});
});
