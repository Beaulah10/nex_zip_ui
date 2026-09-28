import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaggageSelection } from "./baggage-selection";

const deadlineMock = vi.hoisted(() => vi.fn());
const carryOnChargeMock = vi.hoisted(() => vi.fn());
const checkedChargeMock = vi.hoisted(() => vi.fn());

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
		<div data-testid={`alert-${variant}`}>{children}</div>
	),
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

const radioContext = React.createContext<{
	value: string;
	onValueChange: (value: string) => void;
} | null>(null);

vi.mock("@repo/ui/components/radio-group-with-price", () => ({
	RadioGroupWithPrice: ({
		children,
		value,
		onValueChange,
		"aria-label": ariaLabel,
	}: {
		children: React.ReactNode;
		value: string;
		onValueChange: (value: string) => void;
		"aria-label": string;
	}) => (
		<fieldset aria-label={ariaLabel} data-value={value}>
			<radioContext.Provider value={{ value, onValueChange }}>{children}</radioContext.Provider>
		</fieldset>
	),
	RadioGroupWithPriceItem: ({
		label,
		value,
		price,
		disabled,
	}: {
		label: string;
		value: string;
		price: string;
		disabled?: boolean;
	}) => {
		const context = React.useContext(radioContext);
		return (
			<button type="button" disabled={disabled} onClick={() => context?.onValueChange(value)}>
				{`${label}:${price}:${context?.value === value ? "selected" : "idle"}`}
			</button>
		);
	},
}));

vi.mock(
	"@/components/customize/baggage-service/baggage-selection/baggage-counter-card/baggage-counter-card",
	() => ({
		CounterCard: ({
			label,
			description,
			price,
			count,
			onChange,
			disabled,
			incrementDisabled,
		}: {
			label: string;
			description?: string;
			price: number;
			count: number;
			onChange: (value: number) => void;
			disabled?: boolean;
			incrementDisabled?: boolean;
		}) => (
			<div>
				<span>{label}</span>
				<span>{description}</span>
				<span>{String(price)}</span>
				<span>{String(count)}</span>
				<button type="button" disabled={disabled} onClick={() => onChange(Math.max(0, count - 1))}>
					{`dec-${label}`}
				</button>
				<button
					type="button"
					disabled={disabled || incrementDisabled}
					onClick={() => onChange(count + 1)}
				>
					{`inc-${label}`}
				</button>
			</div>
		),
	})
);

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	useDepartureDeadline: deadlineMock,
}));

vi.mock("@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing", () => ({
	getCarryOnCharge: carryOnChargeMock,
	getCheckedBaggageCharge: checkedChargeMock,
}));

type SelectionProps = Parameters<typeof BaggageSelection>[0];

const createProps = (overrides: Partial<SelectionProps> = {}): SelectionProps => ({
	passengerName: "John Doe",
	bundleId: "NONE",
	bundleLabel: "No Bundle",
	carryOnOptions: [
		{ id: "7kg", label: "carry_on_light", price: 0, qtyAvailable: 10, ssrCode: "7KG" },
		{ id: "CABN", label: "carry_on_heavy", price: 4000, qtyAvailable: 5, ssrCode: "CABN" },
	],
	checkedInBaggagePrice: 7500,
	equipment: [
		{
			id: "SKII",
			icon: "downhill_skiing",
			label: "ski_equipment",
			price: 7000,
			qtyAvailable: 2,
			ssrCode: "SKII",
		},
		{
			id: "GOLF",
			icon: "golf_course",
			label: "golf_equipment",
			price: 6000,
			qtyAvailable: 3,
			ssrCode: "GOLF",
		},
	],
	value: {
		carryOnId: "7kg",
		checkedInBaggageCount: 0,
		equipmentCounts: {},
	},
	onChange: vi.fn(),
	showHeader: true,
	availableInventory: {
		CABN: 3,
		BAGN: 4,
		SKII: 2,
		GOLF: 3,
	},
	segmentValidationMessage: null,
	onValidationChange: vi.fn(),
	...overrides,
});

describe("BaggageSelection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		deadlineMock.mockReturnValue({ is24HourDeadlineExceeded: false });
		carryOnChargeMock.mockImplementation((ssrCode: string, _bundleId: string, price: number) =>
			ssrCode === "CABN" ? price : 0
		);
		checkedChargeMock.mockImplementation(
			(count: number, _bundleId: string, price: number) => count * price
		);
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});

	it("renders header, bundle badge, carry-on options, and updates selection callbacks", () => {
		const onChange = vi.fn();

		render(<BaggageSelection {...createProps({ onChange })} />);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("No Bundle")).toBeInTheDocument();
		expect(screen.getByText("baggage_selection_carry_on_baggage")).toBeInTheDocument();
		expect(screen.getByText("carry_on_light:￥0:selected")).toBeInTheDocument();
		expect(screen.getByText("carry_on_heavy:￥4,000:idle")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "carry_on_heavy:￥4,000:idle" }));
		fireEvent.click(screen.getByRole("button", { name: "inc-add_baggage" }));
		fireEvent.click(screen.getByRole("button", { name: "inc-ski_equipment" }));

		expect(onChange).toHaveBeenNthCalledWith(1, {
			carryOnId: "CABN",
			checkedInBaggageCount: 0,
			equipmentCounts: {},
		});
		expect(onChange).toHaveBeenNthCalledWith(2, {
			carryOnId: "7kg",
			checkedInBaggageCount: 1,
			equipmentCounts: {},
		});
		expect(onChange).toHaveBeenNthCalledWith(3, {
			carryOnId: "7kg",
			checkedInBaggageCount: 0,
			equipmentCounts: { SKII: 1 },
		});
	});

	it("disables carry-on selection during the 24-hour deadline and for premium bundles", () => {
		deadlineMock.mockReturnValue({ is24HourDeadlineExceeded: true });
		const { rerender } = render(<BaggageSelection {...createProps()} />);

		expect(screen.getByRole("button", { name: "carry_on_light:￥0:idle" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "carry_on_heavy:￥4,000:idle" })).toBeDisabled();

		deadlineMock.mockReturnValue({ is24HourDeadlineExceeded: false });
		rerender(<BaggageSelection {...createProps({ bundleId: "PREMIUM" })} />);

		expect(screen.getByRole("button", { name: "carry_on_light:￥0:selected" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "carry_on_heavy:￥4,000:idle" })).toBeDisabled();
	});

	it("shows the hard inventory warning when carry-on is unavailable", () => {
		render(
			<BaggageSelection {...createProps({ availableInventory: { CABN: 0, BAGN: 4, SKII: 2 } })} />
		);

		expect(screen.getByTestId("alert-warning")).toHaveTextContent(
			"error_labels.error_description_out_of_stock"
		);
	});

	it("shows the limited stock warning when checked-in or some sports inventory is insufficient", () => {
		render(
			<BaggageSelection
				{...createProps({
					value: {
						carryOnId: "7kg",
						checkedInBaggageCount: 2,
						equipmentCounts: { SKII: 1, GOLF: 1 },
					},
					availableInventory: { CABN: 3, BAGN: 1, SKII: 0, GOLF: 2 },
				})}
			/>
		);

		expect(screen.getByTestId("alert-warning")).toHaveTextContent(
			"error_labels.error_description_limited_stock"
		);
	});

	it("shows a segment mismatch error when a validation message exists", () => {
		render(<BaggageSelection {...createProps({ segmentValidationMessage: "segment mismatch" })} />);

		expect(screen.getByTestId("alert-error")).toHaveTextContent("segment mismatch");
	});

	it("uses fallback defaults when value is missing and bundle includes one checked bag", () => {
		render(
			<BaggageSelection
				{...createProps({
					bundleId: "VALUE",
					value: undefined,
				})}
			/>
		);

		expect(screen.getByText("carry_on_light:￥0:selected")).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
	});

	it("shows the sold-out warning when checked-in and all sports equipment are unavailable", () => {
		render(
			<BaggageSelection
				{...createProps({
					availableInventory: { CABN: 1, BAGN: 0, SKII: 0, GOLF: 0 },
					value: {
						carryOnId: "7kg",
						checkedInBaggageCount: 1,
						equipmentCounts: { SKII: 1 },
					},
				})}
			/>
		);

		expect(screen.getByTestId("alert-warning")).toHaveTextContent(
			"error_labels.error_description_out_of_stock"
		);
		expect(screen.getByRole("button", { name: "inc-add_baggage" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "inc-ski_equipment" })).toBeDisabled();
	});

	it("disables carry-on selection for flexbiz bundles", () => {
		render(<BaggageSelection {...createProps({ bundleId: "FLEXBIZ" })} />);

		expect(screen.getByRole("button", { name: "carry_on_light:￥0:selected" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "carry_on_heavy:￥4,000:idle" })).toBeDisabled();
	});

	it("falls back to zero when checked baggage pricing returns undefined", () => {
		checkedChargeMock.mockReturnValueOnce(undefined);

		render(
			<BaggageSelection
				{...createProps({
					value: {
						carryOnId: "7kg",
						checkedInBaggageCount: 2,
						equipmentCounts: {},
					},
				})}
			/>
		);

		expect(screen.getAllByText("0").length).toBeGreaterThan(0);
	});

	it("hides the header when showHeader is false", () => {
		render(<BaggageSelection {...createProps({ showHeader: false })} />);

		expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
		expect(screen.queryByText("No Bundle")).not.toBeInTheDocument();
	});

	it("registers a validation callback and scrolls to the limit alert when the max is exceeded", () => {
		const onValidationChange = vi.fn();
		const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
		const scrollSpy = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

		render(
			<BaggageSelection
				{...createProps({
					onValidationChange,
					value: {
						carryOnId: "7kg",
						checkedInBaggageCount: 5,
						equipmentCounts: { SKII: 1 },
					},
				})}
			/>
		);

		expect(screen.getByTestId("alert-error")).toHaveTextContent(
			"error_labels.error_max_checked_in_baggage"
		);
		expect(onValidationChange).toHaveBeenCalledWith(expect.any(Function));

		const validate = onValidationChange.mock.calls[0]?.[0] as () => boolean;
		expect(validate()).toBe(false);
		expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
		expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
	});

	it("returns true from the registered validator when the selection is within limits", () => {
		const onValidationChange = vi.fn();

		render(<BaggageSelection {...createProps({ onValidationChange })} />);

		const validate = onValidationChange.mock.calls[0]?.[0] as () => boolean;
		expect(validate()).toBe(true);
	});
});
