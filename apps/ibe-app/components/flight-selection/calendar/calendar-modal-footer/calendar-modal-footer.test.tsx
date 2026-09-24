import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarModalFooter from "./calendar-modal-footer";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			calendar_footer_notice: "Prices may vary depending on stock availability.",
			calendar_footer_reset_button_label: "Reset",
			calendar_footer_confirm_button_label: "Confirm",
		};

		return translations[key] ?? key;
	},
}));

describe("CalendarModalFooter", () => {
	it("calls confirm and reset handlers", () => {
		const onConfirm = vi.fn();
		const onReset = vi.fn();
		render(<CalendarModalFooter onConfirm={onConfirm} onReset={onReset} />);

		const confirmButtons = screen.getAllByText("Confirm");
		const resetButtons = screen.getAllByText("Reset");

		fireEvent.click(confirmButtons[0] as HTMLButtonElement);
		fireEvent.click(resetButtons[0] as HTMLButtonElement);

		expect(onConfirm).toHaveBeenCalled();
		expect(onReset).toHaveBeenCalled();
	});
});
