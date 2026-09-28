import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import CalendarModalControls from "./calendar-modal-controls";

vi.mock("next-intl", () => ({
	useTranslations: (namespace?: string) => {
		const messages = {
			flight_search_page: {
				legend_button_label: "How to read the calendar",
			},
		};
		const resolve = (key: string) =>
			`${namespace ? `${namespace}.` : ""}${key}`.split(".").reduce<unknown>((value, part) => {
				if (value && typeof value === "object" && part in (value as Record<string, unknown>)) {
					return (value as Record<string, unknown>)[part];
				}
				return undefined;
			}, messages);
		const t = ((key: string) => {
			const resolved = resolve(key);
			return typeof resolved === "string" ? resolved : key;
		}) as {
			(key: string): string;
			has: (key: string) => boolean;
		};
		t.has = (key: string) => {
			return typeof resolve(key) === "string";
		};
		return t;
	},
}));

vi.mock("@/modules/utils/helpers/calendar/calendar.helpers", () => ({
	IconInfo: () => <span>info-icon</span>,
}));

vi.mock("../seat-type-selector/seat-type-selector", () => ({
	default: ({
		variant,
		onChange,
	}: {
		variant: string;
		onChange: (seatType: "standard" | "zip") => void;
	}) => (
		<button type="button" onClick={() => onChange("zip")}>
			seat-selector-{variant}
		</button>
	),
}));

vi.mock("../date-tab-navigation/date-tab-navigation", () => ({
	default: ({
		onTabChange,
		activeTab,
	}: {
		onTabChange: (tab: "outbound" | "inbound") => void;
		activeTab: "outbound" | "inbound";
	}) => (
		<div>
			<div>{`date-tabs-${activeTab}`}</div>
			<button type="button" onClick={() => onTabChange("inbound")}>
				switch-tab-inbound
			</button>
		</div>
	),
}));

describe("CalendarModalControls", () => {
	it("renders controls and opens legend", () => {
		const onOpenLegend = vi.fn();
		render(
			<CalendarModalControls
				isChild={false}
				seatType="standard"
				onSeatTypeChange={vi.fn()}
				onOpenLegend={onOpenLegend}
				legendTriggerDesktopRef={createRef<HTMLButtonElement>()}
				legendTriggerMobileRef={createRef<HTMLButtonElement>()}
				oneWay={false}
				activeTab="outbound"
				outboundDate={null}
				inboundDate={null}
				onTabChange={vi.fn()}
			/>
		);

		expect(screen.getByText("seat-selector-desktop")).toBeDefined();
		expect(screen.getByText("seat-selector-mobile")).toBeDefined();
		const legendButtons = screen.getAllByText("How to read the calendar");
		fireEvent.click(legendButtons[0] as HTMLButtonElement);
		expect(onOpenLegend).toHaveBeenCalled();
	});

	it("uses fallback legend text and wires seat/tab interactions", () => {
		const onOpenLegend = vi.fn();
		const onSeatTypeChange = vi.fn();
		const onTabChange = vi.fn();

		render(
			<CalendarModalControls
				isChild={true}
				seatType="standard"
				onSeatTypeChange={onSeatTypeChange}
				onOpenLegend={onOpenLegend}
				legendTriggerDesktopRef={createRef<HTMLButtonElement>()}
				legendTriggerMobileRef={createRef<HTMLButtonElement>()}
				oneWay={true}
				activeTab="outbound"
				outboundDate={new Date(2026, 6, 1)}
				inboundDate={null}
				onTabChange={onTabChange}
			/>
		);

		expect(screen.getAllByText("How to read the calendar")).toHaveLength(2);
		fireEvent.click(screen.getByText("seat-selector-desktop"));
		expect(onSeatTypeChange).toHaveBeenCalledWith("zip");

		fireEvent.click(screen.getAllByText("switch-tab-inbound")[0] as HTMLButtonElement);
		expect(onTabChange).toHaveBeenCalledWith("inbound");

		fireEvent.click(screen.getAllByText("How to read the calendar")[0] as HTMLButtonElement);
		expect(onOpenLegend).toHaveBeenCalled();
	});
});
