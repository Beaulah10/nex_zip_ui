import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DateResetDialog from "./date-reset-dialog";

const { mockUseTranslations, mockDialogProps } = vi.hoisted(() => ({
	mockUseTranslations: vi.fn((namespace: string) => (key: string) => `${namespace}.${key}`),
	mockDialogProps: {} as Record<string, unknown>,
}));

vi.mock("next-intl", () => ({
	useTranslations: mockUseTranslations,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children, ...props }: { children: React.ReactNode }) => {
		Object.assign(mockDialogProps, props);
		return <div>{children}</div>;
	},
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe("DateResetDialog", () => {
	it("renders translated content and confirms the reset", () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		render(<DateResetDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

		expect(
			screen.getByRole("heading", { name: "flight_selection_page.date_reset_dialog.date_title" })
		).toBeDefined();
		expect(
			screen.getByText("flight_selection_page.date_reset_dialog.date_description")
		).toBeDefined();

		fireEvent.click(
			screen.getByRole("button", { name: "flight_selection_page.date_reset_dialog.button_cancel" })
		);
		fireEvent.click(
			screen.getByRole("button", { name: "flight_selection_page.date_reset_dialog.button_confirm" })
		);

		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("cancels when the dialog closes", () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		render(<DateResetDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

		expect(typeof mockDialogProps.onOpenChange).toBe("function");
		(mockDialogProps.onOpenChange as (next: boolean) => void)(true);
		expect(onCancel).not.toHaveBeenCalled();

		(mockDialogProps.onOpenChange as (next: boolean) => void)(false);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
