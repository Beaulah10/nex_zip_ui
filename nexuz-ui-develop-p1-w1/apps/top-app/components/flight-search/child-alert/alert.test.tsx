import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AlertComponent from "@/components/flight-search/child-alert/alert";

vi.mock("next-intl", () => ({
	useTranslations: (namespace?: string) => {
		const messages = {
			flight_search_page: {
				child_alert_heading: "Regarding Boarding for Passengers Under 2 Years Old",
				child_alert_bullet1:
					"Customers weighing less than 9 kg cannot make reservations online. Please contact the call center to make your reservation. (Depending on availability, it may not be possible to secure a ticket.)",
				child_alert_bullet2:
					"If there is a change in weight to 9 kg or more (or less than 9 kg) between the reservation and boarding, please inform the call center or at check-in.",
				child_alert_bullet3:
					"To protect children from sudden turbulence, please use the child seat provided by our company at all times. Children under 9 kg must be seated facing backward, while those over 9 kg must be seated facing forward.",
				child_alert_bullet4:
					"If all backward-facing seats are full, you will need to secure your child's seat next to an adult, who will then hold the child on their lap.",
				button_child_seat: "About the Use of Child Seats",
				button_contact_center: "Contact Center Inquiries",
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

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertAction: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, outline, variant, size, asChild, ...props }: any) => (
		<button type="button" {...props}>
			{children}
		</button>
	),
}));

vi.mock("next/link", () => ({
	default: ({ href, children }: { href: string; children: React.ReactNode }) => (
		<a href={href}>{children}</a>
	),
}));

describe("AlertComponent", () => {
	it("renders infant notice and action links", () => {
		render(<AlertComponent />);

		expect(screen.getByText("Regarding Boarding for Passengers Under 2 Years Old")).toBeDefined();
		const childSeatsLink = screen.getByRole("link", { name: "About the Use of Child Seats" });
		const contactLink = screen.getByRole("link", { name: "Contact Center Inquiries" });
		expect(childSeatsLink.getAttribute("href")).toBe("https://www.zipair.net/en/ticket/u6");
		expect(contactLink.getAttribute("href")).toBe("https://www.zipair.net/en/help#contact");
	});
});
