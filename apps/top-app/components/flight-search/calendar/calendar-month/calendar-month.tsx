import { Skeleton } from "@repo/ui/components/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { useTranslations } from "next-intl";
import {
	formatDateKey,
	isSameDay,
	toDateOnly,
} from "@/modules/utils/helpers/calendar/calendar.helpers";
import { getFareDisplay } from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import { generateTooltipText } from "../../../../modules/utils/helpers/calendar-tooltip/calendar-tooltip.helpers";
import type { CalendarMonthProps } from "../../../../types/flight-search/calendar.types";

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
];

const DAY_INITIAL_KEYS = [
	"day_initial_sunday",
	"day_initial_monday",
	"day_initial_tuesday",
	"day_initial_wednesday",
	"day_initial_thursday",
	"day_initial_friday",
	"day_initial_saturday",
];

type CalendarTranslate = {
	(key: string): string;
	has: (key: string) => boolean;
};

function getMonthLabel(monthIndex: number, t: CalendarTranslate) {
	const key = MONTH_LABEL_KEYS[monthIndex];
	if (!key) return "";
	return t.has(key) ? t(key) : "";
}

function getDayInitialLabel(dayIndex: number, t: CalendarTranslate) {
	const key = DAY_INITIAL_KEYS[dayIndex];
	if (!key) return "";
	return t.has(key) ? t(key) : "";
}

export default function CalendarMonth({
	year,
	month,
	departure,
	returnDate,
	hovered,
	minDate,
	maxDate,
	prices,
	promoPrices,
	showMonthTitle = true,
	onSelect,
	onHover,
	oneWay = false,
	isSelectingReturn = false,
	isLoading = false,
	seatType = "standard",
	fareData,
	currencySymbol = "¥",
}: CalendarMonthProps): React.ReactElement {
	const t = useTranslations("flight_search_page");
	const firstDayOfWeek = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	// Effective end for hover preview — only extend forward from departure when selecting return
	const hoveredForward =
		isSelectingReturn && departure && hovered && toDateOnly(hovered) > toDateOnly(departure)
			? hovered
			: null;
	const effectiveEnd = isSelectingReturn
		? (returnDate ?? (departure ? hoveredForward : null))
		: null;

	let rangeStart: Date | null = null;
	let rangeEnd: Date | null = null;

	if (departure && effectiveEnd && !isSameDay(departure, effectiveEnd)) {
		const depOnly = toDateOnly(departure);
		const endOnly = toDateOnly(effectiveEnd);
		if (depOnly < endOnly) {
			rangeStart = departure;
			rangeEnd = effectiveEnd;
		}
		// backward effectiveEnd is intentionally excluded — no reverse range
	}

	// Build grid: leading empty slots + day dates
	const cells: (Date | null)[] = [
		...Array<null>(firstDayOfWeek).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
	];

	const minOnly = toDateOnly(minDate);
	const maxOnly = toDateOnly(maxDate);
	const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4" data-month-key={monthKey}>
			{/* Day-of-week headers */}
			<div className="grid grid-cols-7 border-base-300 border-b py-4 md:border-none md:p-0">
				{DAY_INITIAL_KEYS.map((_, dow) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static weekday headers
						key={dow}
						className="text-center font-bold text-base text-primary-700 leading-6"
						aria-hidden="true"
					>
						{getDayInitialLabel(dow, t)}
					</div>
				))}
			</div>

			{/* Month-Year */}
			{showMonthTitle && (
				<h3 className="text-left font-bold text-[24px] text-primary-700 leading-9 md:text-center">
					{getMonthLabel(month, t)} <span>{year}</span>
				</h3>
			)}

			{/* Day cells */}
			<div className="grid grid-cols-7 gap-y-1">
				{cells.map((date, idx) => {
					if (!date)
						return (
							<div
								key={`empty-${
									// biome-ignore lint/suspicious/noArrayIndexKey: empty grid spacer
									idx
								}`}
								aria-hidden="true"
							/>
						);

					const displayRange = toDateOnly(date);
					const isOutOfRange = displayRange < minOnly || displayRange > maxOnly;
					const isBeforeDeparture =
						isSelectingReturn && departure ? displayRange <= toDateOnly(departure) : false;
					const key = formatDateKey(date);
					const price = prices?.[key];
					const fareDisplay = fareData ? getFareDisplay(fareData[key], seatType) : price;
					const hasSelectedFare =
						fareDisplay !== undefined && fareDisplay !== "X" && fareDisplay !== "-";
					const hasAlternativeFare = fareDisplay === "-";
					const promoPrice = price ? promoPrices?.[key] : undefined;
					const hideFareForDeparture =
						isSelectingReturn && departure ? isSameDay(date, departure) : false;
					const displayedPrice = hideFareForDeparture
						? undefined
						: hasSelectedFare
							? (price ?? fareDisplay)
							: undefined;
					const displayedPromoPrice = hideFareForDeparture ? undefined : promoPrice;
					const isNoPrice = !hasSelectedFare;
					const isUnavailableForSelection = isNoPrice || isBeforeDeparture;
					const isDisabled = isOutOfRange;
					const isDepart = departure ? isSameDay(date, departure) : false;
					const isReturn = returnDate ? isSameDay(date, returnDate) : false;
					const isSelected = isDepart || isReturn;
					// All valid priced cells show individual hover highlight;
					// range preview is handled separately via effectiveEnd above
					const isHoverable = !isDisabled && !isUnavailableForSelection;
					const isInRange =
						!isSelected && !isDisabled && rangeStart !== null && rangeEnd !== null
							? displayRange > toDateOnly(rangeStart) && displayRange < toDateOnly(rangeEnd)
							: false;
					//calendar cell style
					let cellClasses =
						"relative flex flex-col items-center justify-center  w-full text-sm transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 p-1";
					if (isDisabled) {
						cellClasses += " text-base-400";
					} else if (isSelected) {
						if (isDepart && isReturn) {
							cellClasses += " bg-primary-600 text-white rounded-xl cursor-pointer";
						} else if (isDepart) {
							cellClasses += " bg-primary-600 text-white rounded-l-xl cursor-pointer";
						} else if (isReturn) {
							cellClasses += " bg-primary-600 text-white rounded-r-xl cursor-pointer";
						}
						// In one-way mode, always apply full border-radius to selected
						if (oneWay) {
							cellClasses = cellClasses
								.replace("rounded-l-xl", "rounded-xl")
								.replace("rounded-r-xl", "rounded-xl");
						}
					} else if (isInRange) {
						cellClasses += " bg-primary-200 text-brand-japan-black cursor-pointer cal-cell-range";
					} else if (hasAlternativeFare && !isBeforeDeparture) {
						cellClasses += " text-brand-japan-black cursor-default";
					} else if (isNoPrice) {
						cellClasses += " text-base-400 cursor-default";
					} else {
						if (isHoverable) {
							cellClasses += oneWay
								? " text-brand-japan-black cursor-pointer hover:bg-primary-200 hover:rounded-xl"
								: " text-brand-japan-black cursor-pointer hover:bg-primary-200";
						} else {
							cellClasses += " text-brand-japan-black cursor-default";
						}
					}

					const tooltipText = generateTooltipText({
						date,
						seatType,
						fareData,
						currencySymbol,
						isOutOfRange,
						isBeforeDeparture,
						isLoading,
					});

					const button = (
						<button
							data-date-key={key}
							type="button"
							disabled={isDisabled || (!isSelected && (isLoading || isUnavailableForSelection))}
							onClick={() => onSelect(date)}
							onMouseEnter={() => isHoverable && onHover(date)}
							onMouseLeave={() => onHover(null)}
							aria-label={[
								`${date.getDate()} ${getMonthLabel(month, t)} ${year}`,
								displayedPromoPrice
									? `original price ${displayedPrice}, promo price ${displayedPromoPrice}`
									: displayedPrice,
								isOutOfRange && "unavailable",
								isBeforeDeparture && "unavailable",
								isNoPrice && "price unavailable",
								isDepart && "selected as outbound date",
								isReturn && "selected as inbound date",
							]
								.filter(Boolean)
								.join(", ")}
							aria-pressed={isSelected || undefined}
							className={cellClasses}
						>
							<span className="font-medium text-lg leading-7">{date.getDate()}</span>

							{isLoading && !isSelected ? (
								<Skeleton className="mt-0.5 h-4 w-[80%] rounded" />
							) : isOutOfRange ? (
								<span className="invisible mt-0.5 text-xs leading-none" aria-hidden="true">
									-
								</span>
							) : !isBeforeDeparture && hasAlternativeFare && !isSelected ? (
								<span className="mt-0.5 text-primary-700 text-xs leading-none">-</span>
							) : !isOutOfRange && isUnavailableForSelection && !isSelected ? (
								<span className="mt-0.5 text-base-400 text-xs leading-none">×</span>
							) : displayedPromoPrice ? (
								<>
									{/* Promotional price in brand green — shown first */}
									<span
										className={`mt-0.5 block text-center text-xs leading-none line-through ${
											isSelected ? "text-white" : "text-primary-600"
										}`}
									>
										{displayedPromoPrice}
									</span>
									{/* Original price struck-through in gray — shown below */}
									<span
										className={`mt-0.5 block text-center text-xs leading-none line-through ${
											isSelected ? "text-white opacity-70" : "text-base-400"
										}`}
									>
										{displayedPrice}
									</span>
								</>
							) : displayedPrice ? (
								<span
									className={`w-[80%] whitespace-normal break-all text-xs leading-5 ${
										isSelected ? "text-white" : "text-primary-700"
									}`}
								>
									{displayedPrice}
								</span>
							) : null}
						</button>
					);

					if (!tooltipText) {
						return <div key={key}>{button}</div>;
					}

					return (
						<Tooltip key={key}>
							<TooltipTrigger asChild>{button}</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={4}>
								{tooltipText}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
}
