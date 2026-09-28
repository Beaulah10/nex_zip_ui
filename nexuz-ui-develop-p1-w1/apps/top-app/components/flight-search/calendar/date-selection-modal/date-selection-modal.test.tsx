import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { formatDateKey } from "@/modules/utils/helpers/calendar/calendar.helpers";
import DateSelectionModal from "./date-selection-modal";

vi.mock("next-intl", () => ({
	useTranslations: (namespace?: string) => {
		const messages = {
			flight_search_page: {
				dialog_title: "Date Selection",
				close_button_label: "Close date selection",
				return_date_error_message: "Kindly select the inbound date to continue.",
				child_alert_message:
					'For safety reasons, customers with children aged 6 and under cannot use the "ZIP Full-Flat".',
				error_titles: {
					travel_dates_error: "Please select a travel date.",
					validation_travel_dates_error: "Please select a travel date.",
				},
			},
			error_titles: {
				travel_dates_error: "Please select a travel date.",
				validation_travel_dates_error: "Please select a travel date.",
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

vi.mock("@repo/ui/components/icon", () => ({
	default: () => <span>icon</span>,
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogClose: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("../alert-banner/alert-banner", () => ({
	default: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("../calendar-modal-controls/calendar-modal-controls", () => ({
	default: ({
		onSeatTypeChange,
		onTabChange,
		onOpenLegend,
		activeTab,
	}: {
		onSeatTypeChange: (seatType: "standard" | "zip") => void;
		onTabChange: (tab: "outbound" | "inbound") => void;
		onOpenLegend: () => void;
		activeTab: "outbound" | "inbound";
	}) => (
		<div>
			<div>{`tab-${activeTab}`}</div>
			<button type="button" onClick={() => onSeatTypeChange("zip")}>
				Change seat type
			</button>
			<button type="button" onClick={() => onTabChange("outbound")}>
				Switch outbound
			</button>
			<button type="button" onClick={onOpenLegend}>
				Open legend
			</button>
		</div>
	),
}));

vi.mock("../calendar-desktop-months/calendar-desktop-months", () => ({
	default: ({ visibleMonth }: { visibleMonth: Date }) => (
		<div>
			<div>desktop-months</div>
			<div>{`visible-month-${visibleMonth.getFullYear()}-${visibleMonth.getMonth() + 1}`}</div>
			<button type="button" data-date-key="2026-07-12">
				hidden-desktop-inbound-date
			</button>
		</div>
	),
}));

vi.mock("../calendar-mobile-months/calendar-mobile-months", () => ({
	default: ({
		containerRef,
		outboundDate,
		inboundDate,
		isLoading,
	}: {
		containerRef?: React.Ref<HTMLDivElement>;
		outboundDate: Date | null;
		inboundDate: Date | null;
		isLoading?: boolean;
	}) => {
		const fallbackMonth = outboundDate ?? inboundDate;

		return (
			<div ref={containerRef}>
				<div data-month-key="2026-07">
					<button type="button" data-date-key="2026-07-01" disabled={isLoading}>
						fallback-date
					</button>
				</div>
				<div data-month-key="2026-08">
					<button type="button" data-date-key="2026-08-01" disabled={isLoading}>
						fallback-date-next-month
					</button>
				</div>
				{outboundDate && !isLoading ? (
					<button type="button" data-date-key={formatDateKey(outboundDate)}>
						outbound-date
					</button>
				) : null}
				{inboundDate && !isLoading ? (
					<button type="button" data-date-key={formatDateKey(inboundDate)}>
						inbound-date
					</button>
				) : null}
				{fallbackMonth ? <div>{`month-${fallbackMonth.getMonth() + 1}`}</div> : null}
			</div>
		);
	},
}));

vi.mock("../calendar-modal-footer/calendar-modal-footer", () => ({
	default: ({ onConfirm, onReset }: { onConfirm: () => void; onReset: () => void }) => (
		<div>
			<button type="button" onClick={onConfirm}>
				Confirm
			</button>
			<button type="button" onClick={onReset}>
				Reset
			</button>
		</div>
	),
}));

vi.mock("../date-reset-modal/date-reset-dialog", () => ({
	default: ({
		open,
		onConfirm,
		onCancel,
	}: {
		open: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}) =>
		open ? (
			<div>
				<button type="button" onClick={onConfirm}>
					Confirm reset
				</button>
				<button type="button" onClick={onCancel}>
					Cancel reset
				</button>
			</div>
		) : null,
}));

vi.mock("../calendar-legend-modal/calendar-legend-modal", () => ({
	default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>legend-modal</div> : null),
}));

describe("DateSelectionModal", () => {
	it("reopens on the confirmed return date and restores the inbound tab on mobile", async () => {
		const originalInnerWidth = window.innerWidth;
		const scrollIntoViewSpy = vi.fn();
		const focusSpy = vi.fn();
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
		HTMLElement.prototype.scrollIntoView = scrollIntoViewSpy;
		HTMLElement.prototype.focus = focusSpy;

		const departureDate = new Date(2026, 6, 10);
		const returnDate = new Date(2026, 6, 12);
		const { rerender } = render(
			<DateSelectionModal
				isOpen={false}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={departureDate}
				initialReturn={returnDate}
			/>
		);

		rerender(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={departureDate}
				initialReturn={returnDate}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText("tab-inbound")).toBeDefined();
			expect(scrollIntoViewSpy).toHaveBeenCalled();
			expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
		});

		Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
	});

	it("reopens on the outbound date in one-way mode on mobile", async () => {
		const originalInnerWidth = window.innerWidth;
		const scrollIntoViewSpy = vi.fn();
		const focusSpy = vi.fn();
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
		HTMLElement.prototype.scrollIntoView = scrollIntoViewSpy;
		HTMLElement.prototype.focus = focusSpy;

		const departureDate = new Date(2026, 6, 10);
		const { rerender } = render(
			<DateSelectionModal
				isOpen={false}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				oneWay={true}
				initialDeparture={departureDate}
			/>
		);

		rerender(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				oneWay={true}
				initialDeparture={departureDate}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText("tab-outbound")).toBeDefined();
			expect(scrollIntoViewSpy).toHaveBeenCalled();
			expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
		});

		Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
	});

	it("retries restore after mobile lazy loading finishes", async () => {
		const originalInnerWidth = window.innerWidth;
		const scrollIntoViewSpy = vi.fn();
		const focusSpy = vi.fn();
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
		HTMLElement.prototype.scrollIntoView = scrollIntoViewSpy;
		HTMLElement.prototype.focus = focusSpy;

		const departureDate = new Date(2026, 6, 10);
		const returnDate = new Date(2026, 6, 12);
		const { rerender } = render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={departureDate}
				initialReturn={returnDate}
				isLoading={true}
			/>
		);

		await waitFor(() => {
			expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: "start", behavior: "auto" });
		});

		scrollIntoViewSpy.mockClear();

		rerender(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={departureDate}
				initialReturn={returnDate}
				isLoading={false}
			/>
		);

		await waitFor(() => {
			expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: "center", behavior: "auto" });
			expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
		});

		Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
	});

	it("prefers the mobile selected date when desktop renders a duplicate date key", async () => {
		const originalInnerWidth = window.innerWidth;
		const scrollIntoViewSpy = vi.fn();
		const focusSpy = vi.fn();
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
		HTMLElement.prototype.scrollIntoView = scrollIntoViewSpy;
		HTMLElement.prototype.focus = focusSpy;

		const departureDate = new Date(2026, 6, 10);
		const returnDate = new Date(2026, 6, 12);
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={departureDate}
				initialReturn={returnDate}
			/>
		);

		await waitFor(() => {
			expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
			expect(screen.getByText("inbound-date")).toBeDefined();
			expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
		});

		Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
	});

	it("updates visible month from mobile scroll when IntersectionObserver is unavailable", async () => {
		const originalInnerWidth = window.innerWidth;
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });

		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
		vi.stubGlobal("IntersectionObserver", undefined);

		const onVisibleMonthChange = vi.fn();

		const { container } = render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={new Date(2026, 6, 10)}
				initialReturn={new Date(2026, 6, 12)}
				onVisibleMonthChange={onVisibleMonthChange}
			/>
		);

		const scrollContainer = container.querySelector(".overflow-y-auto") as HTMLDivElement | null;
		const julySection = container.querySelector('[data-month-key="2026-07"]') as HTMLElement | null;
		const augustSection = container.querySelector(
			'[data-month-key="2026-08"]'
		) as HTMLElement | null;

		expect(scrollContainer).toBeTruthy();
		expect(julySection).toBeTruthy();
		expect(augustSection).toBeTruthy();

		if (!scrollContainer || !julySection || !augustSection) {
			Object.defineProperty(window, "innerWidth", {
				configurable: true,
				value: originalInnerWidth,
			});
			return;
		}

		let julyTop = 0;
		let julyHeight = 240;
		let augustTop = 300;
		let augustHeight = 240;

		scrollContainer.getBoundingClientRect = () => new DOMRect(0, 0, 320, 320);
		julySection.getBoundingClientRect = () => new DOMRect(0, julyTop, 320, julyHeight);
		augustSection.getBoundingClientRect = () => new DOMRect(0, augustTop, 320, augustHeight);

		julyTop = -280;
		julyHeight = 240;
		augustTop = 0;
		augustHeight = 240;

		fireEvent.scroll(scrollContainer);

		await waitFor(() => {
			const latestCall = onVisibleMonthChange.mock.calls.at(-1) as unknown;
			expect(latestCall).toBeDefined();
			if (!latestCall) return;

			const [firstVisibleMonth, secondVisibleMonth] = latestCall as [Date, Date];
			expect(firstVisibleMonth.getFullYear()).toBe(2026);
			expect(firstVisibleMonth.getMonth()).toBe(7);
			expect(secondVisibleMonth.getFullYear()).toBe(2026);
			expect(secondVisibleMonth.getMonth()).toBe(8);
		});

		Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
	});

	it("calls round-trip confirm when both dates exist", () => {
		const onConfirm = vi.fn();
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={onConfirm}
				initialDeparture={new Date(2026, 6, 10)}
				initialReturn={new Date(2026, 6, 12)}
			/>
		);

		fireEvent.click(screen.getByText("Confirm"));
		expect(onConfirm).toHaveBeenCalled();
	});

	it("calls one-way confirm in one-way mode", () => {
		const onConfirmOneWay = vi.fn();
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				oneWay={true}
				initialDeparture={new Date(2026, 6, 10)}
				onConfirmOneWay={onConfirmOneWay}
			/>
		);

		fireEvent.click(screen.getByText("Confirm"));
		expect(onConfirmOneWay).toHaveBeenCalled();
	});

	it("shows return-date error when confirming round-trip with outbound only", () => {
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={new Date(2026, 6, 10)}
				initialReturn={null}
			/>
		);

		fireEvent.click(screen.getByText("Confirm"));
		expect(screen.getByText("Kindly select the inbound date to continue.")).toBeDefined();
	});

	it("shows travel-date error when confirming one-way without outbound", () => {
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				oneWay={true}
				initialDeparture={null}
			/>
		);

		fireEvent.click(screen.getByText("Confirm"));
		expect(screen.getByText("Please select a travel date.")).toBeDefined();
	});

	it("resets only after confirming the reset dialog", () => {
		const onReset = vi.fn();
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				onReset={onReset}
				initialDeparture={new Date(2026, 6, 10)}
				initialReturn={new Date(2026, 6, 12)}
			/>
		);

		fireEvent.click(screen.getByText("Reset"));
		expect(onReset).not.toHaveBeenCalled();

		fireEvent.click(screen.getByText("Confirm reset"));
		expect(onReset).toHaveBeenCalled();
	});

	it("keeps the selected month visible when reset clears dates", () => {
		const onReset = vi.fn();
		const { rerender } = render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				onReset={onReset}
				initialDeparture={new Date(2027, 0, 10)}
				initialReturn={new Date(2027, 0, 12)}
			/>
		);

		expect(screen.getByText("visible-month-2027-1")).toBeDefined();

		fireEvent.click(screen.getByText("Reset"));
		fireEvent.click(screen.getByText("Confirm reset"));
		rerender(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				onReset={onReset}
				initialDeparture={null}
				initialReturn={null}
			/>
		);

		expect(screen.getByText("visible-month-2027-1")).toBeDefined();
	});

	it("keeps selected dates when reset dialog is cancelled", () => {
		const onReset = vi.fn();
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				onReset={onReset}
				initialDeparture={new Date(2026, 6, 10)}
				initialReturn={new Date(2026, 6, 12)}
			/>
		);

		fireEvent.click(screen.getByText("Reset"));
		fireEvent.click(screen.getByText("Cancel reset"));

		expect(onReset).not.toHaveBeenCalled();
	});

	it("does not open reset dialog when no dates are selected", () => {
		const onReset = vi.fn();
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				onReset={onReset}
				initialDeparture={null}
				initialReturn={null}
			/>
		);

		fireEvent.click(screen.getByText("Reset"));

		expect(screen.queryByText("Confirm reset")).toBeNull();
		expect(onReset).not.toHaveBeenCalled();
	});

	it("keeps the selected fare type while clearing unavailable dates", async () => {
		const onSeatTypeChange = vi.fn();
		const date = new Date(2026, 6, 10);
		const { rerender } = render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={date}
				outboundPrices={{ "2026-07-10": "¥10,000" }}
				onSeatTypeChange={onSeatTypeChange}
			/>
		);

		fireEvent.click(screen.getByText("Change seat type"));
		rerender(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={date}
				outboundPrices={{}}
				onSeatTypeChange={onSeatTypeChange}
			/>
		);

		await waitFor(() => {
			expect(onSeatTypeChange).toHaveBeenLastCalledWith("zip");
			expect(screen.queryByText("outbound-date")).toBeNull();
		});
	});

	it("shows the child warning and reports seat type changes", async () => {
		const onSeatTypeChange = vi.fn();
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={new Date(2026, 6, 10)}
				passengerType="child"
				onSeatTypeChange={onSeatTypeChange}
			/>
		);

		await waitFor(() => {
			expect(onSeatTypeChange).toHaveBeenCalledWith("standard");
		});
		expect(
			screen.getByText(
				'For safety reasons, customers with children aged 6 and under cannot use the "ZIP Full-Flat".'
			)
		).toBeDefined();

		fireEvent.click(screen.getByText("Change seat type"));

		await waitFor(() => {
			expect(onSeatTypeChange).toHaveBeenCalledWith("zip");
		});
	});

	it("switches back to inbound and clears the return date when selecting outbound again", async () => {
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={new Date(2026, 6, 10)}
				initialReturn={new Date(2026, 6, 12)}
			/>
		);

		expect(screen.getByText("tab-inbound")).toBeDefined();
		expect(screen.getByText("inbound-date")).toBeDefined();

		fireEvent.click(screen.getByText("Switch outbound"));

		await waitFor(() => {
			expect(screen.getByText("tab-outbound")).toBeDefined();
			expect(screen.queryByText("inbound-date")).toBeNull();
		});
	});

	it("opens the legend modal when requested", () => {
		render(
			<DateSelectionModal
				isOpen={true}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				initialDeparture={new Date(2026, 6, 10)}
			/>
		);

		expect(screen.queryByText("legend-modal")).toBeNull();
		fireEvent.click(screen.getByText("Open legend"));
		expect(screen.getByText("legend-modal")).toBeDefined();
	});
});
