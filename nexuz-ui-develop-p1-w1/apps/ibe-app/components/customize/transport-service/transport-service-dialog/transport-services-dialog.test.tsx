/**
 * File: transport-services-dialog.test.tsx
 * Classification: Component
 * Description: Tests for TransportServiceDialog – back button visibility, out-of-stock alert,
 * confirm/back action wiring, TotalAmountDisplay integration, and onCloseAutoFocus
 * branch coverage (focus call and null-current guard).
 */
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransportServiceDialog } from "@/components/customize/transport-service/transport-service-dialog/transport-services-dialog";

// ── Capture onCloseAutoFocus for cross-test assertions ────────────────────────

const dialogInternals = vi.hoisted(() => ({
	onCloseAutoFocus: undefined as ((e: { preventDefault: () => void }) => void) | undefined,
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		open,
		children,
	}: {
		open: boolean;
		onOpenChange: (v: boolean) => void;
		children: ReactNode;
	}) => (open ? <div data-testid="dialog">{children}</div> : null),

	DialogContent: ({
		children,
		onCloseAutoFocus,
	}: {
		children: ReactNode;
		onCloseAutoFocus?: (e: { preventDefault: () => void }) => void;
		desktopWidth?: number;
		className?: string;
	}) => {
		dialogInternals.onCloseAutoFocus = onCloseAutoFocus;
		return <div data-testid="dialog-content">{children}</div>;
	},

	DialogHeader: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-header">{children}</div>
	),

	DialogTitle: ({ children }: { children: ReactNode }) => (
		<h2 data-testid="dialog-title">{children}</h2>
	),

	DialogFooter: ({ children }: { children: ReactNode }) => (
		<div data-testid="dialog-footer">{children}</div>
	),
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: ReactNode; variant?: string }) => (
		<div data-testid="alert" data-variant={variant}>
			{children}
		</div>
	),
	AlertDescription: ({ children }: { children: ReactNode }) => (
		<div data-testid="alert-description">{children}</div>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
		<button type="button" data-testid="confirm-button" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@/components/customize/transport-service/total-amount/total-amount-display", () => ({
	TotalAmountDisplay: ({ amount }: { amount: number }) => (
		<div data-testid="total-amount-display">{amount}</div>
	),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

// ── Default props ─────────────────────────────────────────────────────────────

const defaultProps = {
	open: true,
	onOpenChange: vi.fn(),
	routeLabel: "NRT → HNL",
	selectedTransportServiceId: null as string | null,
	totalAmount: 5000,
	onBack: vi.fn(),
	onConfirm: vi.fn(),
	children: <div data-testid="dialog-children">children</div>,
	stageLabel: "Outbound",
	hasOutOfStockPassengers: false,
	triggerRef: { current: null as HTMLButtonElement | null },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TransportServiceDialog – rendering", () => {
	beforeEach(() => {
		dialogInternals.onCloseAutoFocus = undefined;
		defaultProps.onOpenChange = vi.fn();
		defaultProps.onBack = vi.fn();
		defaultProps.onConfirm = vi.fn();
	});

	it("renders the dialog when open is true", () => {
		render(<TransportServiceDialog {...defaultProps} />);

		expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
	});

	it("does not render dialog content when open is false", () => {
		render(<TransportServiceDialog {...defaultProps} open={false} />);

		expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
	});

	it("renders the dialog title containing transport_services and stageLabel", () => {
		render(<TransportServiceDialog {...defaultProps} />);

		expect(screen.getByTestId("dialog-title").textContent).toContain("transport_services");
		expect(screen.getByTestId("dialog-title").textContent).toContain("Outbound");
	});

	it("renders the route label", () => {
		render(<TransportServiceDialog {...defaultProps} />);

		expect(screen.getByText("NRT → HNL")).toBeInTheDocument();
	});

	it("renders children inside the dialog", () => {
		render(<TransportServiceDialog {...defaultProps} />);

		expect(screen.getByTestId("dialog-children")).toBeInTheDocument();
	});

	it("passes totalAmount to TotalAmountDisplay", () => {
		render(<TransportServiceDialog {...defaultProps} totalAmount={12000} />);

		expect(screen.getByTestId("total-amount-display")).toHaveTextContent("12000");
	});

	it("renders the confirm button", () => {
		render(<TransportServiceDialog {...defaultProps} />);

		expect(screen.getByTestId("confirm-button")).toBeInTheDocument();
	});
});

describe("TransportServiceDialog – back button", () => {
	beforeEach(() => {
		defaultProps.onBack = vi.fn();
	});

	it("renders back button when selectedTransportServiceId is not null", () => {
		render(
			<TransportServiceDialog {...defaultProps} selectedTransportServiceId="shuttle-one-way" />
		);

		expect(screen.getByLabelText("aria_labels.back")).toBeInTheDocument();
	});

	it("does not render back button when selectedTransportServiceId is null", () => {
		render(<TransportServiceDialog {...defaultProps} selectedTransportServiceId={null} />);

		expect(screen.queryByLabelText("aria_labels.back")).not.toBeInTheDocument();
	});

	it("calls onBack when the back button is clicked", () => {
		render(
			<TransportServiceDialog {...defaultProps} selectedTransportServiceId="shuttle-one-way" />
		);

		fireEvent.click(screen.getByLabelText("aria_labels.back"));

		expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
	});

	it("renders the arrow_back icon inside the back button", () => {
		render(
			<TransportServiceDialog {...defaultProps} selectedTransportServiceId="shuttle-one-way" />
		);

		expect(screen.getByTestId("icon-arrow_back")).toBeInTheDocument();
	});
});

describe("TransportServiceDialog – out-of-stock alert", () => {
	it("shows alert when selectedTransportServiceId is set and hasOutOfStockPassengers is true", () => {
		render(
			<TransportServiceDialog
				{...defaultProps}
				selectedTransportServiceId="shuttle-one-way"
				hasOutOfStockPassengers={true}
			/>
		);

		expect(screen.getByTestId("alert")).toBeInTheDocument();
	});

	it("hides alert when selectedTransportServiceId is set but hasOutOfStockPassengers is false", () => {
		render(
			<TransportServiceDialog
				{...defaultProps}
				selectedTransportServiceId="shuttle-one-way"
				hasOutOfStockPassengers={false}
			/>
		);

		expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
	});

	it("hides alert when selectedTransportServiceId is null even if hasOutOfStockPassengers is true", () => {
		render(
			<TransportServiceDialog
				{...defaultProps}
				selectedTransportServiceId={null}
				hasOutOfStockPassengers={true}
			/>
		);

		expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
	});

	it("alert carries the warning variant", () => {
		render(
			<TransportServiceDialog
				{...defaultProps}
				selectedTransportServiceId="shuttle-one-way"
				hasOutOfStockPassengers={true}
			/>
		);

		expect(screen.getByTestId("alert")).toHaveAttribute("data-variant", "warning");
	});
});

describe("TransportServiceDialog – confirm action", () => {
	beforeEach(() => {
		defaultProps.onConfirm = vi.fn();
	});

	it("calls onConfirm when confirm button is clicked", () => {
		render(<TransportServiceDialog {...defaultProps} />);

		fireEvent.click(screen.getByTestId("confirm-button"));

		expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
	});
});

describe("TransportServiceDialog – onCloseAutoFocus callback", () => {
	it("calls event.preventDefault and focuses triggerRef.current on close auto focus", () => {
		const focusMock = vi.fn();
		const triggerRef = { current: { focus: focusMock } as unknown as HTMLButtonElement };

		render(<TransportServiceDialog {...defaultProps} triggerRef={triggerRef} />);

		const mockEvent = { preventDefault: vi.fn() };

		dialogInternals.onCloseAutoFocus?.(mockEvent);

		expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
		expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });
	});

	it("calls event.preventDefault but does not throw when triggerRef.current is null", () => {
		const triggerRef = { current: null as HTMLButtonElement | null };

		render(<TransportServiceDialog {...defaultProps} triggerRef={triggerRef} />);

		const mockEvent = { preventDefault: vi.fn() };

		expect(() => dialogInternals.onCloseAutoFocus?.(mockEvent)).not.toThrow();
		expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
	});
});
