import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DateTabNavigation from "./date-tab-navigation";

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const translations: Record<string, string> = {
			calendar_tab_outbound: "Outbound",
			calendar_tab_return: "Return",
		};
		const t = ((key: string) => translations[key] ?? key) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => key in translations;
		return t;
	},
}));

describe("DateTabNavigation", () => {
	it("renders one-way outbound tab label", () => {
		render(
			<DateTabNavigation
				oneWay={true}
				activeTab="outbound"
				outboundDate={new Date(2026, 6, 10)}
				inboundDate={null}
				onTabChange={vi.fn()}
			/>
		);

		expect(screen.getByRole("tab", { name: "7/10" })).toBeDefined();
	});

	it("disables inbound tab until outbound date exists", () => {
		const onTabChange = vi.fn();
		render(
			<DateTabNavigation
				oneWay={false}
				activeTab="outbound"
				outboundDate={null}
				inboundDate={null}
				onTabChange={onTabChange}
			/>
		);

		const inbound = screen.getByRole("tab", { name: "Return" }) as HTMLButtonElement;
		expect(inbound.disabled).toBe(true);
		fireEvent.click(inbound);
		expect(onTabChange).not.toHaveBeenCalled();
	});

	it("switches tab when enabled", () => {
		const onTabChange = vi.fn();
		render(
			<DateTabNavigation
				oneWay={false}
				activeTab="outbound"
				outboundDate={new Date(2026, 6, 10)}
				inboundDate={null}
				onTabChange={onTabChange}
			/>
		);

		fireEvent.click(screen.getByRole("tab", { name: "Return" }));
		expect(onTabChange).toHaveBeenCalledWith("inbound");
	});
});
