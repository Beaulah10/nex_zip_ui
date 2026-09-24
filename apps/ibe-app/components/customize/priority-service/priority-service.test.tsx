import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import { PriorityServiceDialog } from "@/components/customize/priority-service/priority-service";

const passengers: selectCustomersListItem[] = [
	{
		id: "p1",
		name: "Passenger 1",
		checked: false,
		disabled: false,
		category: "Adult",
		price: 1000,
	},
];

const defaultProps = {
	open: true,
	onOpenChange: vi.fn(),
	stageLabel: "Tokyo Stage",
	routeLabel: "NRT - HND",
	passengers,
	hasOutOfStockPassengers: false,
	remainingStocksLabel: "5 seats remaining",
	showTransitApplicabilityWarning: false,
	totalAmount: 12000,
	onPassengerChange: vi.fn(),
	onSelectAllChange: vi.fn(),
	onConfirmSelection: vi.fn(),
};

vi.mock("next/image", () => ({
	default: ({ alt }: { alt: string }) => (
		<span role="img" aria-label={alt} data-testid="mock-next-image" />
	),
}));

vi.mock("@/assets/images/express-service.png", () => ({
	default: "/express-service.png",
}));

vi.mock("next-intl", () => ({
	useTranslations: (namespace: string) => {
		const translations: Record<string, Record<string, string>> = {
			express_service: {
				express_title: "Express Service",
				express_dialog_title: "Express Service Dialog",
				express_bullet_1: "Bullet 1",
				express_bullet_2: "Bullet 2",
				express_bullet_3: "Bullet 3",
				express_bullet_4: "Bullet 4",
				express_bullet_5: "Bullet 5",
				express_bullet_6: "Bullet 6",
				express_note: "Express service note",
				express_confirm: "Confirm",
				express_warning_title: "Transit warning",
				express_warning_message1: "Transit warning message 1",
				express_warning_message2: "Transit warning message 2",
			},

			common: {
				exceeds_available_stock_title: "Stock warning",
				exceeds_available_stock_message: "Stock is not available",
				infant_label: "Infant",
			},

			extras_page: {
				select_customers: "Select Customers",
			},
		};

		return (key: string) => translations[namespace]?.[key] ?? key;
	},
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
		open ? <div data-testid="dialog">{children}</div> : null,

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

vi.mock("@/components/common/select-customers/select-customers", () => ({
	SelectCustomers: ({
		title,
		passengers,
		onPassengerChange,
		onSelectAllChange,
		selectAllOverride,
	}: {
		title: string;
		passengers: { id: string; checked?: boolean; disabled?: boolean }[];
		onPassengerChange: (id: string, checked: boolean) => void;
		onSelectAllChange: (checked: boolean) => void;
		selectAllOverride?: { checked: boolean; disabled: boolean };
	}) => (
		<div data-testid="select-customers">
			<p>{title}</p>
			<p data-testid="passenger-count">{passengers.length}</p>
			<p data-testid="select-all-override">{selectAllOverride ? "locked" : "unlocked"}</p>

			<button
				type="button"
				onClick={() => {
					const firstPassenger = passengers[0];
					if (firstPassenger) {
						onPassengerChange(firstPassenger.id, true);
					}
				}}
			>
				Change Passenger
			</button>

			<button type="button" onClick={() => onSelectAllChange(true)}>
				Select All
			</button>
		</div>
	),
}));

vi.mock("@/modules/hooks/common/airport-lounge/airport-lounge", () => ({
	getSeeMoreItems: <T,>(items: readonly T[], showFull: boolean, initialCount: number): T[] =>
		showFull ? [...items] : items.slice(0, Math.max(initialCount, 0)),
}));

vi.mock("../../../../../packages/ui/lib/utils", () => ({
	cn: (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" "),
}));

describe("PriorityServiceDialog", () => {
	it("renders dialog title, route, image, note, amount and confirm button", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		expect(screen.getByTestId("dialog")).toBeInTheDocument();
		expect(screen.getByText("Express Service Dialog - Tokyo Stage")).toBeInTheDocument();
		expect(screen.getByText("NRT - HND")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Express Service" })).toBeInTheDocument();
		expect(screen.getByText("Express service note")).toBeInTheDocument();
		expect(screen.getByText("￥12,000")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
	});

	it("does not render dialog when open is false", () => {
		render(<PriorityServiceDialog {...defaultProps} open={false} />);

		expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
	});

	it("renders remaining stock label when passengers are not out of stock", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		expect(screen.getByText("5 seats remaining")).toBeInTheDocument();
	});

	it("does not render remaining stock label when passengers are out of stock", () => {
		render(<PriorityServiceDialog {...defaultProps} hasOutOfStockPassengers />);

		expect(screen.queryByText("5 seats remaining")).not.toBeInTheDocument();
	});

	it("renders transit applicability warning when enabled", () => {
		render(<PriorityServiceDialog {...defaultProps} showTransitApplicabilityWarning />);

		expect(screen.getByText("Transit warning")).toBeInTheDocument();
		expect(screen.getByText("Transit warning message 1")).toBeInTheDocument();
		expect(screen.getByText("Transit warning message 2")).toBeInTheDocument();
	});

	it("renders out of stock warning when enabled", () => {
		render(<PriorityServiceDialog {...defaultProps} hasOutOfStockPassengers />);

		expect(screen.getByText("Stock warning")).toBeInTheDocument();
		expect(screen.getByText("Stock is not available")).toBeInTheDocument();
	});

	it("renders See More button initially", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		expect(screen.getByRole("button", { name: "See More" })).toBeInTheDocument();
	});

	it("hides See More button after clicking it", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "See More" }));

		expect(screen.queryByRole("button", { name: "See More" })).not.toBeInTheDocument();
	});

	it("renders all bullet texts", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		expect(screen.getAllByText("Bullet 1").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Bullet 2").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Bullet 3").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Bullet 4").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Bullet 5").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Bullet 6").length).toBeGreaterThan(0);
	});

	it("calls onConfirmSelection when confirm button is clicked", () => {
		const onConfirmSelection = vi.fn();

		render(<PriorityServiceDialog {...defaultProps} onConfirmSelection={onConfirmSelection} />);

		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

		expect(onConfirmSelection).toHaveBeenCalledTimes(1);
	});

	it("passes passenger change handler to SelectCustomers", () => {
		const onPassengerChange = vi.fn();

		render(<PriorityServiceDialog {...defaultProps} onPassengerChange={onPassengerChange} />);

		fireEvent.click(screen.getByRole("button", { name: "Change Passenger" }));

		expect(onPassengerChange).toHaveBeenCalledWith("p1", true);
	});

	it("passes locked select all override when all passengers are disabled and checked", () => {
		render(
			<PriorityServiceDialog
				{...defaultProps}
				passengers={[
					{
						id: "p1",
						name: "Passenger 1",
						checked: true,
						disabled: true,
						category: "Adult",
						price: 1000,
					},
					{
						id: "p2",
						name: "Passenger 2",
						checked: true,
						disabled: true,
						category: "Adult",
						price: 1000,
					},
				]}
			/>
		);

		expect(screen.getByTestId("select-all-override")).toHaveTextContent("locked");
	});

	it("passes select all change handler to SelectCustomers", () => {
		const onSelectAllChange = vi.fn();

		render(<PriorityServiceDialog {...defaultProps} onSelectAllChange={onSelectAllChange} />);

		fireEvent.click(screen.getByRole("button", { name: "Select All" }));

		expect(onSelectAllChange).toHaveBeenCalledWith(true);
	});

	it("does not pass select all override when passengers are not all disabled and checked", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		expect(screen.getByTestId("select-all-override")).toHaveTextContent("unlocked");
	});

	it("does not pass select all override when passenger list is empty", () => {
		render(<PriorityServiceDialog {...defaultProps} passengers={[]} />);

		expect(screen.getByTestId("select-all-override")).toHaveTextContent("unlocked");
		expect(screen.getByTestId("passenger-count")).toHaveTextContent("0");
	});

	it("renders zero amount with formatted value", () => {
		render(<PriorityServiceDialog {...defaultProps} totalAmount={0} />);

		expect(screen.getByText("￥0")).toBeInTheDocument();
	});

	it("applies primary amount color when total amount is greater than zero", () => {
		render(<PriorityServiceDialog {...defaultProps} totalAmount={12000} />);

		expect(screen.getByText("￥12,000")).toHaveClass("text-primary-700");
	});

	it("applies base amount color when total amount is zero", () => {
		render(<PriorityServiceDialog {...defaultProps} totalAmount={0} />);

		expect(screen.getByText("￥0")).toHaveClass("text-base-400");
	});

	it("renders SelectCustomers title", () => {
		render(<PriorityServiceDialog {...defaultProps} />);

		const selectCustomers = screen.getByTestId("select-customers");

		expect(within(selectCustomers).getByText("Select Customers")).toBeInTheDocument();
	});
});
