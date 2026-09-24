"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useCalendarNavigation from "@/modules/hooks/Calendar/use-calendar-navigation/use-calendar-navigation";
import useDateSelection from "@/modules/hooks/Calendar/use-date-selection/use-date-selection";
import { formatDateKey, startOfMonth } from "@/modules/utils/helpers/calendar/calendar.helpers";
import { shouldResetSelectionOnSeatTypeChange } from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import type { DateSelectionModalProps, SeatType } from "@/types/calendar.types";
import AlertBanner from "../alert-banner/alert-banner";
import CalendarDesktopMonths from "../calendar-desktop-months/calendar-desktop-months";
import CalendarLegendModal from "../calendar-legend-modal/calendar-legend-modal";
import CalendarMobileMonths from "../calendar-mobile-months/calendar-mobile-months";
import CalendarModalControls from "../calendar-modal-controls/calendar-modal-controls";
import CalendarModalFooter from "../calendar-modal-footer/calendar-modal-footer";
import DateResetDialog from "../date-reset-modal/date-reset-dialog";

function getRestoreTargetDate(outboundDate: Date | null, inboundDate: Date | null, minDate: Date) {
	return inboundDate ?? outboundDate ?? minDate;
}

function getRestoreMonthKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function findMonthSection(container: HTMLDivElement, date: Date) {
	return container.querySelector<HTMLElement>(`[data-month-key="${getRestoreMonthKey(date)}"]`);
}

function parseMonthKey(monthKey: string): Date | null {
	const [yearPart, monthPart] = monthKey.split("-");
	if (!yearPart || !monthPart) return null;

	const year = Number(yearPart);
	const month = Number(monthPart);

	if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
		return null;
	}

	return new Date(year, month - 1, 1);
}

function getFirstVisibleMonthSection(
	sections: HTMLElement[],
	rootRect: DOMRect
): HTMLElement | undefined {
	return sections.find((section) => {
		const rect = section.getBoundingClientRect();
		return rect.bottom > rootRect.top && rect.top < rootRect.bottom;
	});
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DateSelectionModal({
	isOpen,
	onClose,
	onConfirm,
	onReset,
	minDate: minDateProp,
	maxDate: maxDateProp,
	initialDeparture = null,
	initialReturn = null,
	initialSeatType = "standard",
	outboundPrices,
	outboundPromoPrices,
	inboundPrices,
	inboundPromoPrices,
	oneWay = false,
	onConfirmOneWay,
	passengerType = "adult",
	onVisibleMonthChange,
	onSeatTypeChange,
	isLoading = false,
	outboundFareData,
	inboundFareData,
	currencySymbol = "¥",
}: DateSelectionModalProps) {
	const isChild = passengerType === "child";
	const flightSelectionLabels = useTranslations("flight_selection_page");
	// ── Dates ──
	const today = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const minDate = useMemo(() => minDateProp ?? today, [minDateProp, today]);

	const maxDate = useMemo(() => {
		if (maxDateProp) return maxDateProp;
		const d = new Date(today);
		d.setDate(d.getDate() + 364);
		return d;
	}, [maxDateProp, today]);

	// ── State ──
	const {
		activeTab,
		outboundDate,
		hovered,
		inboundDate,
		setActiveTab,
		setInboundDate,
		setHovered,
		handleDateSelect,
		handleReset,
		syncFromInitialValues,
	} = useDateSelection({
		initialDeparture,
		initialReturn,
		oneWay,
	});
	const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
		const restoreTarget = getRestoreTargetDate(initialDeparture, initialReturn, minDate);
		return startOfMonth(restoreTarget);
	});
	const [seatType, setSeatType] = useState<SeatType>("standard");
	const shouldValidateSeatTypeChangeRef = useRef(false);
	const [dateErrorType, setDateErrorType] = useState<"travel" | "return" | null>(null);
	const [openDateResetDialog, setOpenDateResetDialog] = useState(false);
	const shouldRestoreMobilePositionRef = useRef(false);

	const [isLegendOpen, setIsLegendOpen] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		setSeatType(initialSeatType);
	}, [initialSeatType, isOpen]);

	const mobileScrollRef = useRef<HTMLDivElement>(null);
	const mobileMonthsRef = useRef<HTMLDivElement>(null);
	const visibleMobileMonthKeyRef = useRef<string | null>(null);
	const mobileScrollSyncFrameRef = useRef<number | null>(null);
	const legendTriggerDesktopRef = useRef<HTMLButtonElement>(null);
	const legendTriggerMobileRef = useRef<HTMLButtonElement>(null);

	// Combined ref — picks the currently visible trigger for focus return
	const legendTriggerRef = useRef({
		get current() {
			if (typeof window !== "undefined" && window.innerWidth < 768) {
				return legendTriggerMobileRef.current;
			}
			return legendTriggerDesktopRef.current;
		},
	});

	// Determine which prices to display based on active tab
	const prices = useMemo(() => {
		if (activeTab === "inbound") {
			return inboundPrices ?? {};
		}
		return outboundPrices ?? {};
	}, [activeTab, outboundPrices, inboundPrices]);

	const promoPrices = useMemo(() => {
		const activePromoPrices = activeTab === "inbound" ? inboundPromoPrices : outboundPromoPrices;
		if (!activePromoPrices || Object.keys(activePromoPrices).length === 0) {
			return undefined;
		}

		if (activeTab === "inbound") {
			return inboundPromoPrices;
		}
		return outboundPromoPrices;
	}, [activeTab, outboundPromoPrices, inboundPromoPrices]);

	const fareData = useMemo(() => {
		if (activeTab === "inbound") {
			return inboundFareData;
		}
		return outboundFareData;
	}, [activeTab, outboundFareData, inboundFareData]);

	// ── Derived ──
	const { secondVisibleMonth, canGoBack, canGoForward, allMonths } = useCalendarNavigation({
		visibleMonth,
		minDate,
		maxDate,
	});

	// ── Handlers ──
	const handleConfirm = useCallback(() => {
		if (oneWay) {
			if (outboundDate) {
				onConfirmOneWay?.(outboundDate);
				onClose();
				return;
			}
			setDateErrorType("travel");
			return;
		}
		if (outboundDate && inboundDate) {
			onConfirm(outboundDate, inboundDate);
			onClose();
			return;
		}
		if (outboundDate) {
			setDateErrorType("return");
			return;
		}
		setDateErrorType("travel");
	}, [outboundDate, inboundDate, onConfirm, onClose, oneWay, onConfirmOneWay]);

	const handleResetSelection = useCallback(() => {
		setSeatType("standard");
		handleReset();
		setDateErrorType(null);
		onReset?.();
		setOpenDateResetDialog(false);
	}, [handleReset, onReset]);

	const handleOpenResetDialog = useCallback(() => {
		if (!outboundDate && !inboundDate) {
			return;
		}
		setOpenDateResetDialog(true);
	}, [outboundDate, inboundDate]);

	const handleCancelResetDialog = useCallback(() => {
		setOpenDateResetDialog(false);
	}, []);

	const handleSeatTypeChange = useCallback(
		(nextSeatType: SeatType) => {
			if (nextSeatType === seatType) return;
			shouldValidateSeatTypeChangeRef.current = true;
			setSeatType(nextSeatType);
			onSeatTypeChange?.(nextSeatType);
		},
		[seatType, onSeatTypeChange]
	);

	const handleTabChange = useCallback(
		(tab: "outbound" | "inbound") => {
			if (!oneWay && tab === "outbound" && outboundDate && inboundDate) {
				setInboundDate(null);
				setHovered(null);
				setActiveTab("outbound");
				return;
			}

			setActiveTab(tab);
		},
		[oneWay, outboundDate, inboundDate, setActiveTab, setInboundDate, setHovered]
	);

	// ── Effects ──
	// Dialog handles Escape key and focus automatically via Radix Dialog

	useLayoutEffect(() => {
		if (!isOpen) return;
		syncFromInitialValues();
		setVisibleMonth(startOfMonth(getRestoreTargetDate(initialDeparture, initialReturn, minDate)));
		setDateErrorType(null);
		shouldRestoreMobilePositionRef.current = true;
	}, [isOpen, initialDeparture, initialReturn, minDate, syncFromInitialValues]);

	useEffect(() => {
		if (isOpen) return;
		syncFromInitialValues();
		setVisibleMonth(startOfMonth(getRestoreTargetDate(initialDeparture, initialReturn, minDate)));
		setDateErrorType(null);
		shouldRestoreMobilePositionRef.current = false;
	}, [isOpen, initialDeparture, initialReturn, minDate, syncFromInitialValues]);

	useEffect(() => {
		if (oneWay ? outboundDate : outboundDate && inboundDate) {
			setDateErrorType(null);
		}
	}, [oneWay, outboundDate, inboundDate]);

	// Dialog handles body scroll lock automatically

	useEffect(() => {
		if (!isOpen || typeof window === "undefined" || window.innerWidth >= 768) return;
		if (!shouldRestoreMobilePositionRef.current) return;
		const mobileContainer = mobileMonthsRef.current;
		if (!mobileScrollRef.current || !mobileContainer) return;

		const prioritizedDates = [inboundDate, outboundDate].filter(
			(date): date is Date => date !== null
		);
		const fallbackMonthDate = outboundDate ?? prioritizedDates[0] ?? visibleMonth;

		if (prioritizedDates.length === 0 && !fallbackMonthDate) return;

		const selectedKeys = prioritizedDates
			.filter((d): d is Date => d !== null)
			.map((d) => formatDateKey(d));

		let frameId = 0;
		let attempts = 0;

		const restoreSelectionPosition = () => {
			const targetButton = selectedKeys
				.map((dateKey) =>
					mobileContainer.querySelector<HTMLButtonElement>(`button[data-date-key="${dateKey}"]`)
				)
				.find((el): el is HTMLButtonElement => el !== null);

			if (targetButton) {
				shouldRestoreMobilePositionRef.current = false;
				targetButton.scrollIntoView({ block: "center", behavior: "auto" });
				targetButton.focus({ preventScroll: true });
				return;
			}

			const fallbackMonthSection = findMonthSection(mobileContainer, fallbackMonthDate);
			const fallbackButton =
				fallbackMonthSection?.querySelector<HTMLButtonElement>("button:not([disabled])");

			if (fallbackButton) {
				shouldRestoreMobilePositionRef.current = false;
				fallbackButton.scrollIntoView({ block: "center", behavior: "auto" });
				fallbackButton.focus({ preventScroll: true });
				return;
			}

			if (fallbackMonthSection) {
				if (!isLoading) {
					shouldRestoreMobilePositionRef.current = false;
				}
				fallbackMonthSection.scrollIntoView({ block: "start", behavior: "auto" });
				return;
			}

			if (attempts >= 2) return;

			attempts += 1;
			frameId = requestAnimationFrame(restoreSelectionPosition);
		};

		frameId = requestAnimationFrame(restoreSelectionPosition);

		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [isOpen, outboundDate, inboundDate, visibleMonth, isLoading]);

	useEffect(() => {
		if (!isOpen) {
			visibleMobileMonthKeyRef.current = null;
			setOpenDateResetDialog(false);
			if (mobileScrollSyncFrameRef.current !== null) {
				cancelAnimationFrame(mobileScrollSyncFrameRef.current);
				mobileScrollSyncFrameRef.current = null;
			}
		}
	}, [isOpen]);

	const syncVisibleMobileMonth = useCallback(() => {
		if (!isOpen || typeof window === "undefined" || window.innerWidth >= 768) return;

		const scrollContainer = mobileScrollRef.current;
		const mobileContainer = mobileMonthsRef.current;
		if (!scrollContainer || !mobileContainer) return;

		const monthSections = Array.from(
			mobileContainer.querySelectorAll<HTMLElement>("[data-month-key]")
		);
		if (monthSections.length === 0) return;

		const rootRect = scrollContainer.getBoundingClientRect();
		const firstVisible = getFirstVisibleMonthSection(monthSections, rootRect);
		if (!firstVisible) return;

		const monthKey = firstVisible.dataset.monthKey;
		if (!monthKey || visibleMobileMonthKeyRef.current === monthKey) return;

		const parsedMonth = parseMonthKey(monthKey);
		if (!parsedMonth) return;

		visibleMobileMonthKeyRef.current = monthKey;
		setVisibleMonth((prev) => {
			if (
				prev.getFullYear() === parsedMonth.getFullYear() &&
				prev.getMonth() === parsedMonth.getMonth()
			) {
				return prev;
			}
			return parsedMonth;
		});
	}, [isOpen]);

	const handleMobileScroll = useCallback(() => {
		if (!isOpen || typeof window === "undefined" || window.innerWidth >= 768) return;
		if (mobileScrollSyncFrameRef.current !== null) {
			cancelAnimationFrame(mobileScrollSyncFrameRef.current);
		}

		mobileScrollSyncFrameRef.current = requestAnimationFrame(() => {
			mobileScrollSyncFrameRef.current = null;
			syncVisibleMobileMonth();
		});
	}, [isOpen, syncVisibleMobileMonth]);

	useEffect(() => {
		if (!isOpen || typeof window === "undefined" || window.innerWidth >= 768) return;

		const frameId = requestAnimationFrame(() => {
			syncVisibleMobileMonth();
		});

		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [isOpen, syncVisibleMobileMonth]);

	// Notify when visible month changes (for lazy loading)
	useEffect(() => {
		if (!isOpen || !onVisibleMonthChange) return;
		onVisibleMonthChange(visibleMonth, secondVisibleMonth);
	}, [isOpen, visibleMonth, secondVisibleMonth, onVisibleMonthChange]);

	// Notify when seat type changes
	useEffect(() => {
		if (!isOpen || !onSeatTypeChange) return;
		onSeatTypeChange(seatType);
	}, [isOpen, seatType, onSeatTypeChange]);

	useEffect(() => {
		if (!isOpen || !shouldValidateSeatTypeChangeRef.current) return;

		const shouldReset = shouldResetSelectionOnSeatTypeChange({
			oneWay,
			outboundDate,
			inboundDate,
			outboundPrices,
			inboundPrices,
		});

		shouldValidateSeatTypeChangeRef.current = false;

		if (shouldReset) {
			handleReset();
			setDateErrorType(null);
		}
	}, [isOpen, oneWay, outboundDate, inboundDate, outboundPrices, inboundPrices, handleReset]);

	// ── Render ──
	// Hover preview only while selecting inbound date (not applicable in one-way mode)
	const hoverForCalendar = oneWay || inboundDate ? null : hovered;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent
					desktopWidth={1024}
					mobileOuterSpacing={16}
					gap={0}
					showCloseButton={true}
					aria-describedby="Date selection modal for choosing outbound and return dates"
					className="flex max-h-[90vh] flex-col p-0"
				>
					{/* ── Header ── */}
					{/* <div className="flex shrink-0 items-center gap-2 rounded-t-2xl border-base-300 border-b bg-white px-4 py-4 md:gap-4 md:px-6">
						<DialogTitle className="flex-1">{labels.dialog_title || "Date Selection"}</DialogTitle>
						<DialogClose
							className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-base-300 bg-white text-brand-japan-black transition-colors hover:border-base-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary-600"
							aria-label={labels.close_button_label || "Close date selection"}
						>
							<Icon name="close" size={24} color="" className="text-current" />
						</DialogClose>
					</div> */}
					<DialogHeader showCloseButton={true}>
						<DialogTitle className="flex-1">
							{flightSelectionLabels("calendar_dialog_title")}
						</DialogTitle>
					</DialogHeader>

					{/* ── Body ── */}
					<div className="flex flex-1 flex-col overflow-hidden">
						{/* ── ALERT: top on both desktop and mobile ── */}
						<div className="shrink-0 space-y-3 px-6 pt-4">
							{dateErrorType && (
								<AlertBanner
									variant="error"
									message={
										dateErrorType === "return"
											? flightSelectionLabels("calendar_return_date_error_message")
											: flightSelectionLabels("calendar_travel_dates_error")
									}
								/>
							)}
							{isChild && (
								<AlertBanner message={flightSelectionLabels("calendar_child_alert_message")} />
							)}
						</div>
						<CalendarModalControls
							isChild={isChild}
							seatType={seatType}
							onSeatTypeChange={handleSeatTypeChange}
							onOpenLegend={() => setIsLegendOpen(true)}
							legendTriggerDesktopRef={legendTriggerDesktopRef}
							legendTriggerMobileRef={legendTriggerMobileRef}
							oneWay={oneWay}
							activeTab={activeTab}
							outboundDate={outboundDate}
							inboundDate={inboundDate}
							onTabChange={handleTabChange}
						/>

						{/* ── Scrollable area (both breakpoints) ── */}
						<div
							ref={mobileScrollRef}
							className="flex-1 overflow-y-auto"
							onScroll={handleMobileScroll}
						>
							<CalendarDesktopMonths
								visibleMonth={visibleMonth}
								secondVisibleMonth={secondVisibleMonth}
								canGoBack={canGoBack}
								canGoForward={canGoForward}
								setVisibleMonth={setVisibleMonth}
								outboundDate={outboundDate}
								inboundDate={inboundDate}
								hoverForCalendar={hoverForCalendar}
								minDate={minDate}
								maxDate={maxDate}
								prices={prices}
								promoPrices={promoPrices}
								isLoading={isLoading}
								handleDateSelect={handleDateSelect}
								setHovered={setHovered}
								oneWay={oneWay}
								isSelectingReturn={activeTab === "inbound"}
								seatType={seatType}
								fareData={fareData}
								currencySymbol={currencySymbol}
							/>

							<CalendarMobileMonths
								containerRef={mobileMonthsRef}
								allMonths={allMonths}
								outboundDate={outboundDate}
								inboundDate={inboundDate}
								hoverForCalendar={hoverForCalendar}
								minDate={minDate}
								maxDate={maxDate}
								prices={prices}
								promoPrices={promoPrices}
								isLoading={isLoading}
								handleDateSelect={handleDateSelect}
								setHovered={setHovered}
								oneWay={oneWay}
								isSelectingReturn={activeTab === "inbound"}
								seatType={seatType}
								fareData={fareData}
								currencySymbol={currencySymbol}
							/>
						</div>
					</div>

					<CalendarModalFooter onConfirm={handleConfirm} onReset={handleOpenResetDialog} />
				</DialogContent>
			</Dialog>
			<DateResetDialog
				open={openDateResetDialog}
				onConfirm={handleResetSelection}
				onCancel={handleCancelResetDialog}
			/>
			<CalendarLegendModal
				isOpen={isLegendOpen}
				onClose={() => setIsLegendOpen(false)}
				triggerRef={legendTriggerRef}
				promoPrices={promoPrices}
			/>
		</>
	);
}
