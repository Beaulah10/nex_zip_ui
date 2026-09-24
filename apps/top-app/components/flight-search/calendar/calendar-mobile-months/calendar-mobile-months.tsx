"use client";

import CalendarMonth from "../calendar-month/calendar-month";

type CalendarMobileMonthsProps = {
	allMonths: Date[];
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
	containerRef?: React.Ref<HTMLDivElement>;
};

export default function CalendarMobileMonths({
	allMonths,
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
	containerRef,
}: CalendarMobileMonthsProps) {
	return (
		<div ref={containerRef} className="space-y-8 px-4 md:hidden" data-calendar-mobile-root>
			{allMonths.map((monthDate) => (
				<CalendarMonth
					key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
					year={monthDate.getFullYear()}
					month={monthDate.getMonth()}
					departure={outboundDate}
					returnDate={inboundDate}
					hovered={hoverForCalendar}
					minDate={minDate}
					maxDate={maxDate}
					prices={prices}
					promoPrices={promoPrices}
					isLoading={isLoading}
					showMonthTitle={true}
					onSelect={handleDateSelect}
					onHover={setHovered}
					oneWay={oneWay}
					isSelectingReturn={isSelectingReturn}
					seatType={seatType}
					fareData={fareData}
					currencySymbol={currencySymbol}
				/>
			))}
		</div>
	);
}
