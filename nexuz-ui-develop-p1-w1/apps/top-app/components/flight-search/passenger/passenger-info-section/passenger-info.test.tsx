import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PassengerInfo from "@/components/flight-search/passenger/passenger-info-section/passenger-info";

vi.mock("next-intl", () => ({
	useTranslations: (namespace?: string) => {
		const messages = {
			flight_search_page: {
				passenger_modal_bullet1:
					"Passengers who require special assistance will not be able to reserve via this Website.",
				passenger_modal_bullet2:
					"Passengers who require assistance or use of two seats (by physical reason), please see here Passengers who require assistance.",
				passenger_modal_bullet3:
					"For customers under 6 years old, some reservation deadlines are different, please kindly see FAQ.",
				passenger_modal_bullet4:
					"If a child under 1 year old or weighing less than 9kg is traveling, reservations cannot be made through our website. Please contact us to make a reservation.",
				link_assistance: "Passengers who require assistance.",
				link_faq: "FAQ.",
			},
		};
		const namespacedMessages: any = namespace ? (messages as any)[namespace] : messages;
		const t = ((key: string) => {
			const parts = key.split(".");
			let current: any = namespacedMessages;
			for (const part of parts) {
				current = current?.[part];
			}
			return current ?? key;
		}) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => {
			const parts = key.split(".");
			let current: any = namespacedMessages;
			for (const part of parts) {
				current = current?.[part];
			}
			return current !== undefined;
		};
		return t;
	},
}));

describe("PassengerInfo", () => {
	it("renders passenger guidance and links", () => {
		render(<PassengerInfo />);

		expect(screen.getByText(/Passengers who require special assistance/)).toBeDefined();
		const assistanceLink = screen.getByRole("link", {
			name: "Passengers who require assistance.",
		});
		const faqLink = screen.getByRole("link", { name: "FAQ." });
		expect(assistanceLink.getAttribute("href")).toBe("https://www.zipair.net/en/boarding/support");
		expect(faqLink.getAttribute("href")).toBe("https://www.zipair.net/en/faq/kids");
	});
});
