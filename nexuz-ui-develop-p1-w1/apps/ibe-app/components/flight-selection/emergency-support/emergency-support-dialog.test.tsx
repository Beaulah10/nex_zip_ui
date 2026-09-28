import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { forwardRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmergencySupportDialog } from "./emergency-support-dialog";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: forwardRef<
		HTMLButtonElement,
		{ children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" | "reset" }
	>(({ children, onClick, type = "button" }, ref) => (
		<button ref={ref} onClick={onClick} type={type}>
			{children}
		</button>
	)),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		children,
		open,
		onOpenChange,
	}: {
		children: React.ReactNode;
		open: boolean;
		onOpenChange?: (isOpen: boolean) => void;
	}) =>
		open ? (
			<div data-testid="dialog-root">
				<button
					type="button"
					data-testid="dialog-close-trigger"
					onClick={() => onOpenChange?.(false)}
				>
					close
				</button>
				<button
					type="button"
					data-testid="dialog-open-trigger"
					onClick={() => onOpenChange?.(true)}
				>
					reopen
				</button>
				{children}
			</div>
		) : null,
	DialogContent: ({
		children,
		onOpenAutoFocus,
	}: {
		children: React.ReactNode;
		onOpenAutoFocus?: (event: { preventDefault: () => void }) => void;
	}) => {
		onOpenAutoFocus?.({ preventDefault: vi.fn() });
		return <div>{children}</div>;
	},
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe("EmergencySupportDialog", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders translated content and fires both actions", () => {
		const onAgree = vi.fn();
		const onClose = vi.fn();

		render(<EmergencySupportDialog open onClose={onClose} onAgree={onAgree} />);

		expect(screen.getByRole("heading", { name: "emergency_support_dialog_title" })).toBeTruthy();
		expect(screen.getByText("emergency_support_dialog_description")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "close_button_label" }));
		fireEvent.click(screen.getByRole("button", { name: "agree_and_proceed_button_label" }));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onAgree).toHaveBeenCalledTimes(1);
	});

	it("calls onClose when dialog open state changes to closed", () => {
		const onClose = vi.fn();

		render(<EmergencySupportDialog open onClose={onClose} onAgree={vi.fn()} />);
		fireEvent.click(screen.getByTestId("dialog-close-trigger"));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("does not call onClose when dialog open state changes to open (no-op branch)", () => {
		const onClose = vi.fn();

		render(<EmergencySupportDialog open onClose={onClose} onAgree={vi.fn()} />);
		fireEvent.click(screen.getByTestId("dialog-open-trigger"));

		expect(onClose).not.toHaveBeenCalled();
	});

	it("renders nothing when closed", () => {
		render(<EmergencySupportDialog open={false} onClose={vi.fn()} onAgree={vi.fn()} />);

		expect(screen.queryByTestId("dialog-root")).toBeNull();
	});
});
