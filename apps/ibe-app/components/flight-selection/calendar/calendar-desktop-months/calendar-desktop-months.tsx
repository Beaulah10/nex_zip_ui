"use client";

import { useTranslations } from "next-intl";
import {
	addMonths,
	IconChevronLeft,
	IconChevronRight,
} from "@/modules/utils/helpers/calendar/calendar.helpers";
import CalendarMonth from "../calendar-month/calendar-month";

const MONTH_LABEL_KEYS = [
	"month_january",
	"month_february",
	"month_march",
	"month_april",
	"month_may",
	"month_june",
	"month_july",
	"month_august",
	"month_september",
	"month_october",
	"month_november",
	"month_december",
] as const;

type CalendarDesktopMonthsProps = {
	visibleMonth: Date;
	secondVisibleMonth: Date;
	canGoBack: boolean;
	canGoForward: boolean;
	setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>;
	outboundDate: Date | null;
	inboundDate: Date | null;
	hoverForCalendar: Date | null;
	minDate: Date;
	maxDate: Date;
	prices?: Record<string, string>;
	promoPrices?: Record<string, string>;
	isLoading?: boolean;
	handleDateSelect: (date: Date) => void;
	setHovered: (date: Date | null) => void;
	oneWay: boolean;
	isSelectingReturn: boolean;
	seatType?: "standard" | "zip";
	fareData?: Record<string, { standard?: number; zipFullFlat?: number }>;
	currencySymbol?: string;
};

type CalendarTranslate = {
	(key: string): string;
	has: (key: string) => boolean;
};

function getMonthLabel(monthIndex: number, t: CalendarTranslate) {
	const key = MONTH_LABEL_KEYS[monthIndex];
	if (!key) return "";
	return t.has(key) ? t(key) : "";
}

export default function CalendarDesktopMonths({
	visibleMonth,
	secondVisibleMonth,
	canGoBack,
	canGoForward,
	setVisibleMonth,
	outboundDate,
	inboundDate,
	hoverForCalendar,
	minDate,
	maxDate,
	prices,
	promoPrices,
	isLoading = false,
	handleDateSelect,
	setHovered,
	oneWay,
	isSelectingReturn,
	seatType = "standard",
	fareData,
	currencySymbol = "¥",
}: CalendarDesktopMonthsProps): React.ReactElement {
	const flightSelectionLabels = useTranslations("flight_selection_page");
	const previousMonthLabel = flightSelectionLabels("calendar_previous_month_label");
	const nextMonthLabel = flightSelectionLabels("calendar_next_month_label");
	return (
		<div className="hidden px-4 py-4 md:block">
			<div className="mb-3 flex items-center gap-2">
				<button
					type="button"
					onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
					disabled={!canGoBack}
					aria-label={previousMonthLabel}
					className={[
						"flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-primary-600",
						canGoBack
							? "cursor-pointer border-primary-300 bg-white hover:bg-primary-200"
							: "cursor-not-allowed border-base-200 bg-white opacity-50",
					].join(" ")}
				>
					<IconChevronLeft muted={!canGoBack} />
				</button>

				<div className="flex flex-1 items-center gap-0">
					<h3 className="flex-1 text-center font-bold text-2xl text-primary-700">
						{getMonthLabel(visibleMonth.getMonth(), flightSelectionLabels)}{" "}
						{visibleMonth.getFullYear()}
					</h3>

					<h3 className="flex-1 text-center font-bold text-2xl text-primary-700">
						{getMonthLabel(secondVisibleMonth.getMonth(), flightSelectionLabels)}{" "}
						{secondVisibleMonth.getFullYear()}
					</h3>
				</div>

				<button
					type="button"
					onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
					disabled={!canGoForward}
					aria-label={nextMonthLabel}
					className={[
						"flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-primary-600",
						canGoForward
							? "cursor-pointer border-primary-300 bg-white hover:bg-primary-200"
							: "cursor-not-allowed border-base-200 bg-white opacity-50",
					].join(" ")}
				>
					<IconChevronRight muted={!canGoForward} />
				</button>
			</div>

			<div className="flex items-start gap-2">
				<div className="flex flex-1 gap-0">
					<CalendarMonth
						year={visibleMonth.getFullYear()}
						month={visibleMonth.getMonth()}
						departure={outboundDate}
						returnDate={inboundDate}
						hovered={hoverForCalendar}
						minDate={minDate}
						maxDate={maxDate}
						prices={prices}
						promoPrices={promoPrices}
						isLoading={isLoading}
						showMonthTitle={false}
						onSelect={handleDateSelect}
						onHover={setHovered}
						oneWay={oneWay}
						isSelectingReturn={isSelectingReturn}
						seatType={seatType}
						fareData={fareData}
						currencySymbol={currencySymbol}
					/>

					<div className="mx-4 w-px shrink-0 self-stretch bg-base-200" />

					<CalendarMonth
						year={secondVisibleMonth.getFullYear()}
						month={secondVisibleMonth.getMonth()}
						departure={outboundDate}
						returnDate={inboundDate}
						hovered={hoverForCalendar}
						minDate={minDate}
						maxDate={maxDate}
						prices={prices}
						promoPrices={promoPrices}
						isLoading={isLoading}
						showMonthTitle={false}
						onSelect={handleDateSelect}
						onHover={setHovered}
						oneWay={oneWay}
						isSelectingReturn={isSelectingReturn}
						seatType={seatType}
						fareData={fareData}
						currencySymbol={currencySymbol}
					/>
				</div>
			</div>
		</div>
	);
}
