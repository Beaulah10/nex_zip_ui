import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: Record<string, string>) => {
		const map: Record<string, string> = {
			flight_selection: "Select Flights",
			bundle_selection: "Bundles",
			customize_selection: "Customize",
			extras_selection: "Extras",
			customer_information: "Passenger Details",
			insurance_selection: "Insurance",
			review_confirm_selection: "Review & Confirm",
			payment_selection: "Payment",
		};

		let text = map[key] ?? key;
		if (values) {
			for (const [k, v] of Object.entries(values)) {
				text = text.replace(`{${k}}`, String(v));
			}
		}

		return text;
	},
}));

if (!window.scrollTo) {
	Object.defineProperty(window, "scrollTo", {
		configurable: true,
		writable: true,
		value: vi.fn(),
	});
} else {
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
}

if (!HTMLElement.prototype.scrollIntoView) {
	Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
		configurable: true,
		writable: true,
		value: vi.fn(),
	});
}

afterEach(() => {
	cleanup();
});
