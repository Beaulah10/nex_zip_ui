import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const createLoungeOption = (overrides?: { qtyAvailable?: number; price?: number }) => ({
		id: "lounge-1",
		title: "Narita Lounge",
		price: overrides?.price ?? 5000,
		ssrCode: "LNG",
		categoryId: 10,
		passengerType: "adt",
		service: {
			lfid: 100,
			pfid: 200,
			amount: overrides?.price ?? 5000,
			cutOffHours: 24,
			description: "Lounge access",
			maxCountServiceLevel: 10,
			qtyAvailable: overrides?.qtyAvailable,
			ssrCode: "LNG",
			ssrId: 300,
			currency: "JPY",
			startSalesDays: 0,
		},
	});

	return {
		createLoungeOption,
		dispatch: vi.fn(),
		onOpenChange: vi.fn(),
		onConfirm: vi.fn(),
		toggleAirportLoungePax: vi.fn(),
		toggleAirportLoungeSelectAll: vi.fn(),
		setPassengerNames: vi.fn((passengers) => ({
			type: "passenger/setPassengerNames",
			payload: passengers,
		})),

		savedPassengers: [] as any[],
		loungeServiceData: [createLoungeOption({ qtyAvailable: 5 })] as any[],
		passengerLists: [
			{
				id: "p1",
				name: "Passenger 1",
				checked: false,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
			{
				id: "p2",
				name: "Passenger 2",
				checked: false,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
			{
				id: "p3",
				name: "Infant Passenger",
				checked: false,
				disabled: true,
				category: "Infant",
				price: 0,
				passengerTypeCode: "infant",
				mappedAdultId: "p1",
			},
		] as any[],
	};
});

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
				{children}
				<button type="button" onClick={() => onOpenChange(false)}>
					Close Dialog
				</button>
			</div>
		) : null,

	DialogContent: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-content">{children}</div>
	),

	DialogFooter: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-footer">{children}</div>
	),

	DialogHeader: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-header">{children}</div>
	),

	DialogTitle: ({ children }: { children: ReactNode }) => <h1>{children}</h1>,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: ReactNode }) => <div role="alert">{children}</div>,

	AlertTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,

	AlertDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("next/image", () => ({
	default: ({ alt }: { alt: string }) => (
		<span role="img" aria-label={alt} data-testid="mock-next-image" />
	),
}));

vi.mock("next-intl", () => ({
	useTranslations: (namespace: string) => {
		const labels: Record<string, Record<string, string | ((value?: any) => string)>> = {
			extras_page: {
				select_customers: "Select customers",
			},

			lounge_service: {
				lounge_service_title: "Airport Lounge",
				lounge_confirm: "Confirm selection",
				total_amount_label: "Total Amount",
				"error_labels.loungeNotAvailableForRoute": "Lounge not available",
			},

			common: {
				infant_label: "Infant",
				exceeds_available_stock_title: "Stock warning",
				exceeds_available_stock_message: "Stock is not available",
			},

			lounge_dialog: {
				remaining_stocks_label: ({ count }: { count: number }) => `${count} seats remaining`,
				out_of_stock_message: "Out of stock",
			},
		};

		return (key: string, values?: any) => {
			const value = labels[namespace]?.[key];

			if (typeof value === "function") {
				return value(values);
			}

			return value ?? key;
		};
	},
}));

vi.mock("@/components/common/select-customers/select-customers", () => ({
	SelectCustomers: ({
		title,
		passengers,
		price,
		outOfStockLabel,
		onPassengerChange,
		onSelectAllChange,
	}: {
		title: string;
		passengers: {
			id: string;
			name?: string;
			checked?: boolean;
			disabled?: boolean;
			status?: string;
		}[];
		price?: number;
		outOfStockLabel?: string;
		onPassengerChange: (id: string, checked: boolean) => void;
		onSelectAllChange: (checked: boolean) => void;
	}) => (
		<div data-testid="select-customers">
			<p>{title}</p>
			<p data-testid="price">{price}</p>

			{outOfStockLabel && <p>{outOfStockLabel}</p>}

			{passengers.map((passenger) => (
				<div key={passenger.id}>
					<span>{passenger.name}</span>

					{passenger.status && <span>{passenger.status}</span>}

					<button type="button" onClick={() => onPassengerChange(passenger.id, true)}>
						Select {passenger.id}
					</button>
				</div>
			))}

			<button type="button" onClick={() => onSelectAllChange(true)}>
				Select All
			</button>

			<button type="button" onClick={() => onSelectAllChange(false)}>
				Clear All
			</button>
		</div>
	),
}));

vi.mock("@/modules/hooks/common/airport-lounge/airport-lounge", () => ({
	getSeeMoreDescriptionText: (description: string, showFull: boolean, previewLength: number) => {
		if (showFull || description.length <= previewLength) {
			return {
				text: description,
				isTruncated: false,
			};
		}

		return {
			text: `${description.substring(0, previewLength)}...`,
			isTruncated: true,
		};
	},

	getAirportLoungeTotalAmount: (passengers: any[], price: number) =>
		passengers.filter(
			(passenger) => passenger.checked && passenger.passengerTypeCode?.toLowerCase() !== "infant"
		).length * price,

	useAirportLoungePassengerSelection: () => ({
		airportLoungePassengers: mocks.passengerLists,
		toggleAirportLoungePax: mocks.toggleAirportLoungePax,
		toggleAirportLoungeSelectAll: mocks.toggleAirportLoungeSelectAll,
	}),
}));

vi.mock("@/modules/hooks/common/lounge-service/lounge-service", () => ({
	getAirportLoungeImage: () => "/narita-lounge.png",

	useAccompanyingSelectionHelpers: () => ({
		isAutoSelectedPassengerType: (type?: string) => type?.toLowerCase() === "infant",

		getSelectedPrimaryPassengerCount: (passengers: any[]) =>
			passengers.filter(
				(passenger: any) =>
					passenger.checked && passenger.passengerTypeCode?.toLowerCase() !== "infant"
			).length,

		syncAccompanyingPassengers: (passengers: any[]) => passengers,

		togglePrimaryPassengerSelection: ({ passengers, targetId, nextChecked }: any) =>
			passengers.map((passenger: any) =>
				passenger.id === targetId
					? {
							...passenger,
							checked: nextChecked,
						}
					: passenger
			),

		toggleSelectAllPrimaryPassengers: ({ passengers, nextChecked }: any) =>
			passengers.map((passenger: any) => ({
				...passenger,
				checked: passenger.passengerTypeCode?.toLowerCase() === "infant" ? false : nextChecked,
			})),
	}),
}));

vi.mock("@/modules/utils/constants/lounge-dialog/lounge.config.json", () => ({
	default: {
		lounges: [
			{
				title: "Narita Lounge",
				openingHours: "Open 08:00 - 22:00",
				description:
					"This is a long lounge description used for testing the see more behavior. ".repeat(10),
				amenities: [
					{
						label: "Wi-Fi",
						icon: "wifi",
					},
					{
						label: "Food",
						icon: "food",
					},
				],
			},
		],
	},
}));

vi.mock("@/modules/utils/constants/priority-service/passenger-types.constants", () => ({
	loungeOriginCodeMap: {
		NRT: "Narita",
	},

	stockWarningThreshold: 10,

	UNDER_SIX_DEPENDENT_TYPES: new Set(["infant"]),

	INFANT_PASSENGER_TYPES: new Set(["infant"]),
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `¥${amount.toLocaleString()}`,
}));

vi.mock("@/modules/utils/helpers/lounge-dialog/lounge-dialog.helper", () => ({
	createSavedPassengerMap: vi.fn(() => new Map()),

	getPassengerLoungeSelections: vi.fn(() => ({
		selectedLoungeServiceByPassengerId: new Map(),
		removableOptionsByPassengerId: new Map(),
	})),

	updateExistingPassengers: vi.fn(() => []),

	appendNewPassengers: vi.fn(),
}));

vi.mock("@/modules/utils/lounge.utils", () => ({
	extractLoungeServices: vi.fn(() => mocks.loungeServiceData),
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mocks.dispatch,
	useAppSelector: (selector: any) => selector({}),
}));

vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	selectAncillaryOffersDataByDirectionAndServiceCategory: vi.fn(() => []),
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectPassengers: vi.fn(() => mocks.savedPassengers),
	setPassengerNames: mocks.setPassengerNames,
}));

vi.mock("../../../../../packages/ui/lib/utils", () => ({
	cn: (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" "),
}));

import {
	appendNewPassengers,
	createSavedPassengerMap,
	getPassengerLoungeSelections,
	updateExistingPassengers,
} from "@/modules/utils/helpers/lounge-dialog/lounge-dialog.helper";
import LoungeDialog from "./lounge-dialog";

const defaultProps = {
	open: true,
	stageLabel: "Outbound",
	transportRouteLabel: "Tokyo Narita - Seoul",
	ancillaryScope: "outbound" as any,
	originCode: "NRT",
	segmentLfid: 100,
	onOpenChange: mocks.onOpenChange,
	onConfirm: mocks.onConfirm,
};

describe("LoungeDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mocks.savedPassengers = [];

		mocks.loungeServiceData = [
			mocks.createLoungeOption({
				qtyAvailable: 5,
				price: 5000,
			}),
		];
		mocks.passengerLists = [
			{
				id: "p1",
				name: "Passenger 1",
				checked: false,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
			{
				id: "p2",
				name: "Passenger 2",
				checked: false,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
			{
				id: "p3",
				name: "Infant Passenger",
				checked: false,
				disabled: true,
				category: "Infant",
				price: 0,
				passengerTypeCode: "infant",
				mappedAdultId: "p1",
			},
		];
	});

	it("renders lounge dialog details", () => {
		render(<LoungeDialog {...defaultProps} />);
		expect(screen.getByTestId("dialog")).toBeInTheDocument();
		expect(screen.getByText("Airport Lounge - Outbound")).toBeInTheDocument();
		expect(screen.getByText("Tokyo Narita - Seoul")).toBeInTheDocument();
		expect(screen.getByText("Narita Lounge")).toBeInTheDocument();
		expect(screen.getByText("Open 08:00 - 22:00")).toBeInTheDocument();
		expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
		expect(screen.getByText("Food")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Narita Lounge" })).toBeInTheDocument();
		expect(screen.getByText("Select customers")).toBeInTheDocument();
		expect(screen.getByText("Confirm selection")).toBeInTheDocument();
	});

	it("returns null when origin code is not available", () => {
		render(<LoungeDialog {...defaultProps} originCode={undefined} />);

		expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
	});

	it("shows remaining stock label when stock is below threshold and not exhausted", () => {
		render(<LoungeDialog {...defaultProps} />);

		expect(screen.getByText("remaining_stocks_label")).toBeInTheDocument();
	});

	it("shows stock warning when stock is exhausted", () => {
		mocks.loungeServiceData = [
			mocks.createLoungeOption({
				qtyAvailable: 1,
				price: 5000,
			}),
		];

		mocks.passengerLists = [
			{
				id: "p1",
				name: "Passenger 1",
				checked: true,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
			{
				id: "p2",
				name: "Passenger 2",
				checked: false,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
		];

		render(<LoungeDialog {...defaultProps} />);

		expect(screen.getByText("Stock warning")).toBeInTheDocument();
		expect(screen.getByText("Stock is not available")).toBeInTheDocument();
		expect(screen.getAllByText("out_of_stock_message").length).toBeGreaterThan(0);
	});

	it("calls passenger toggle when passenger is selected", () => {
		render(<LoungeDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Select p1" }));

		expect(mocks.toggleAirportLoungePax).toHaveBeenCalledWith("p1", true);
	});

	it("does not select new adult passenger when stock is exhausted", () => {
		mocks.loungeServiceData = [
			mocks.createLoungeOption({
				qtyAvailable: 1,
				price: 5000,
			}),
		];

		mocks.passengerLists = [
			{
				id: "p1",
				name: "Passenger 1",
				checked: true,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
			{
				id: "p2",
				name: "Passenger 2",
				checked: false,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
		];

		render(<LoungeDialog {...defaultProps} />);

		mocks.toggleAirportLoungePax.mockClear();

		fireEvent.click(screen.getByRole("button", { name: "Select p2" }));

		expect(mocks.toggleAirportLoungePax).not.toHaveBeenCalledWith("p2", true);
	});

	it("clears all passenger selections when Clear All is clicked", () => {
		render(<LoungeDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Clear All" }));

		expect(mocks.toggleAirportLoungeSelectAll).toHaveBeenCalledWith(false);
	});

	it("selects all passengers when stock quantity is not available", () => {
		mocks.loungeServiceData = [
			mocks.createLoungeOption({
				qtyAvailable: undefined,
				price: 5000,
			}),
		];

		render(<LoungeDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Select All" }));

		expect(mocks.toggleAirportLoungeSelectAll).toHaveBeenCalledWith(true);
	});

	it("selects passengers one by one when stock is available", () => {
		render(<LoungeDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Select All" }));

		expect(mocks.toggleAirportLoungePax).toHaveBeenCalledWith("p1", true);
		expect(mocks.toggleAirportLoungePax).toHaveBeenCalledWith("p2", true);
	});

	it("dispatches updated passengers and calls onConfirm when confirm button is clicked", () => {
		render(<LoungeDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Confirm selection" }));

		expect(createSavedPassengerMap).toHaveBeenCalled();
		expect(getPassengerLoungeSelections).toHaveBeenCalled();
		expect(updateExistingPassengers).toHaveBeenCalled();
		expect(appendNewPassengers).toHaveBeenCalled();
		expect(mocks.dispatch).toHaveBeenCalled();
		expect(mocks.onConfirm).toHaveBeenCalledTimes(1);
	});

	it("calls onOpenChange when dialog is closed", () => {
		render(<LoungeDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "Close Dialog" }));

		expect(mocks.onOpenChange).toHaveBeenCalledWith(false);
	});

	it("shows zero amount color when no passenger is selected", () => {
		render(<LoungeDialog {...defaultProps} />);

		expect(screen.getByText("¥0")).toHaveClass("text-base-400");
	});

	it("shows primary amount color when passenger is selected", () => {
		mocks.passengerLists = [
			{
				id: "p1",
				name: "Passenger 1",
				checked: true,
				disabled: false,
				category: "Adult",
				price: 5000,
				passengerTypeCode: "adt",
			},
		];

		render(<LoungeDialog {...defaultProps} />);

		expect(screen.getByText("¥5,000")).toHaveClass("text-primary-700");
	});
});
