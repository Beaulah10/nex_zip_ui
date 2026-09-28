import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PassportInfoModal from "@/components/flight-search/passport/passport-info-modal";

vi.mock("next-intl", () => ({
	useTranslations: (namespace?: string) => {
		const messages = {
			flight_search_page: {
				passport_modal_heading: "Please keep your Passport ready",
				header_description:
					"Please make sure to provide following information while making a reservation.",
				item_passport_number: "Passport Number",
				item_expiry_date: "Date of Expiry",
				note_travel_period: "*Please check the remaining period of travel at your destination.",
				item_date_of_birth: "Date of Birth",
				item_nationality_region: "Nationality/Region",
				passport_modal_button_cancel: "Cancel",
				button_next: "Next",
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

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, outline, variant, size, asChild, ...props }: any) => (
		<button {...props}>{children}</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("PassportInfoModal", () => {
	it("renders instructions and fires onNext", () => {
		const onNext = vi.fn();

		render(
			<PassportInfoModal
				openPassportInfoModal={true}
				setOpenPassportInfoModal={vi.fn()}
				onNext={onNext}
			/>
		);

		expect(screen.getByText("Please keep your Passport ready")).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		expect(onNext).toHaveBeenCalledTimes(1);
	});
});
