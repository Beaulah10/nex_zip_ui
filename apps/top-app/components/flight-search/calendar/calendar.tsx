"use client";

import Icon from "@repo/ui/components/icon";
import { Item, ItemActions, ItemContent } from "@repo/ui/components/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { type ReactElement, useCallback, useEffect, useRef, useState } from "react";
import type { SeatType } from "../../../types/flight-search/calendar.types";
import CalendarContent from "./calendar-modal/calendar-modal";

type TripType = "round-trip" | "one-way" | "connecting-flight";

type FlightDates = {
	outboundDate: string;
	returnDate: string;
};

type CalendarModalProps = FlightDates & {
	tripType: TripType;
	onChange: (value: FlightDates) => void;
	origin: string;
	destination: string;
	promotionCode?: string;
	/** Passenger type for special handling (e.g., child restrictions) */
	passengerType?: "adult" | "child";
	/** Disables the calendar trigger when arrival location is not yet selected */
	disabled?: boolean;
	/** Called with the seat type that was active when dates were confirmed (or reset) */
	onSeatTypeConfirm?: (seatType: SeatType) => void;
	/** Current confirmed seat type (used to reset calendar seat type when dates are cleared) */
	confirmedSeatType?: SeatType;
};

/**
 * Format date for form storage.
 * @param date - Date object to format
 * @returns ISO date string (e.g., "2026-11-01")
 */
function formatDateForStorage(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/**
 * Format date into tooltip format (M/DD).
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "7/16")
 */
function formatTooltipDate(date: Date): string {
	return date.toLocaleDateString("en-US", { month: "numeric", day: "2-digit" });
}

/**
 * Generate calendar label based on trip type and selected dates.
 * @param outboundDate - Formatted outbound date string
 * @param returnDate - Formatted return date string
 * @param tripType - Type of trip (round-trip or one-way)
 * @param defaultLabel - Default label when no dates are selected
 * @returns Calendar label to display
 */
function getCalendarLabel(
	outboundDate: string,
	returnDate: string,
	tripType: TripType,
	defaultLabel: string
): string {
	if (!outboundDate) {
		return defaultLabel;
	}

	const formatSelectedDate = (dateValue: string): string => {
		const parsedDate = new Date(dateValue);

		if (Number.isNaN(parsedDate.getTime())) {
			return dateValue;
		}

		return formatTooltipDate(parsedDate);
	};

	const formattedOutbound = formatSelectedDate(outboundDate);

	if (tripType === "round-trip" && returnDate) {
		const formattedReturn = formatSelectedDate(returnDate);
		return `${formattedOutbound} - ${formattedReturn}`;
	}

	return formattedOutbound;
}

/**
 * Generate tooltip text for calendar field showing dates in M/DD format.
 * @param outboundDate - Formatted outbound date string (e.g., "Jun 24")
 * @param returnDate - Formatted return date string (e.g., "Jun 28")
 * @param tripType - Type of trip (round-trip or one-way)
 * @returns Tooltip text showing dates in M/DD format or empty string if no dates selected
 */
function getCalendarTooltip(outboundDate: string, returnDate: string, tripType: TripType): string {
	if (!outboundDate) {
		return "";
	}

	// Parse the formatted date string back to a Date object
	const outboundDateObj = new Date(outboundDate);

	if (tripType === "round-trip" && returnDate) {
		const returnDateObj = new Date(returnDate);
		const formattedOutbound = formatTooltipDate(outboundDateObj);
		const formattedReturn = formatTooltipDate(returnDateObj);
		return `${formattedOutbound} - ${formattedReturn}`;
	}

	return formatTooltipDate(outboundDateObj);
}

/**
 * CalendarModal Component
 *
 * A date picker modal for flight search. Displays selected dates and opens
 * a calendar modal when clicked to allow users to select departure and
 * return dates (or departure only for one-way trips).
 *
 * Uses Dialog component internally via CalendarContent for proper modal handling.
 *
 * @param props - Calendar modal configuration
 * @param props.outboundDate - Currently selected outbound date (formatted string)
 * @param props.returnDate - Currently selected return date (formatted string)
 * @param props.tripType - Type of trip: "round-trip", "one-way", or "connecting-flight"
 * @param props.onChange - Callback when dates are confirmed
 * @param props.passengerType - Passenger type for special handling (default: "adult"). Use "child" to show age restriction alert
 * @returns Calendar modal trigger and content component
 */
const CalendarModal = ({
	outboundDate,
	returnDate,
	tripType,
	onChange,
	origin,
	destination,
	promotionCode,
	passengerType = "adult",
	disabled = false,
	onSeatTypeConfirm,
	confirmedSeatType,
}: CalendarModalProps): ReactElement => {
	const t = useTranslations("flight_search_page");

	/** Dialog open state */
	const [open, setOpen] = useState(false);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const triggerButtonRef = useRef<HTMLButtonElement>(null);

	/** Confirmed departure date for initial value in calendar */
	const [confirmedDeparture, setConfirmedDeparture] = useState<Date | null>(null);

	/** Confirmed return date for initial value in calendar */
	const [confirmedReturn, setConfirmedReturn] = useState<Date | null>(null);

	useEffect(() => {
		if (!outboundDate && !returnDate) {
			setConfirmedDeparture(null);
			setConfirmedReturn(null);
		}
	}, [outboundDate, returnDate]);

	/**
	 * Handles date confirmation from the calendar modal.
	 * Updates the display label and calls parent's onChange callback.
	 *
	 * @param departureDate - Selected departure date
	 * @param returnDateResult - Selected return date (null for one-way trips)
	 */
	const handleCalendarConfirm = (
		departureDate: Date,
		returnDateResult: Date | null,
		seatType: SeatType
	) => {
		// Store confirmed dates for next calendar open
		setConfirmedDeparture(departureDate);
		setConfirmedReturn(returnDateResult);

		// Store year-preserving dates for downstream form submission
		const formattedDeparture = formatDateForStorage(departureDate);
		const formattedReturn = returnDateResult ? formatDateForStorage(returnDateResult) : "";

		onSeatTypeConfirm?.(seatType);

		// Call parent onChange with formatted dates
		onChange({
			outboundDate: formattedDeparture,
			returnDate: formattedReturn,
		});
	};

	const handleCalendarReset = () => {
		setConfirmedDeparture(null);
		setConfirmedReturn(null);
		onSeatTypeConfirm?.("standard");
		onChange({
			outboundDate: "",
			returnDate: "",
		});
	};

	const tooltipText = getCalendarTooltip(outboundDate, returnDate, tripType);
	const effectiveTooltipText = tooltipText;

	const handleCalendarChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen);

		if (!nextOpen) {
			requestAnimationFrame(() => {
				triggerButtonRef.current?.focus({ preventScroll: true });
			});
		}
	}, []);

	const calendarTrigger = (
		<Item
			asChild
			variant="outline"
			className={cn(
				"box-border h-11 gap-2 rounded-[0.5rem] border border-secondary-300 px-4 py-3 transition-colors",
				disabled ? "cursor-not-allowed bg-base-100" : "cursor-pointer hover:bg-base-50"
			)}
		>
			<button
				ref={triggerButtonRef}
				type="button"
				onClick={disabled ? undefined : () => handleCalendarChange(true)}
				onPointerEnter={() => setIsTooltipOpen(true)}
				onPointerLeave={() => setIsTooltipOpen(false)}
				onFocus={() => setIsTooltipOpen(false)}
				onBlur={() => setIsTooltipOpen(false)}
				aria-haspopup="dialog"
				aria-label="Select outbound and inbound dates"
				disabled={disabled}
				aria-disabled={disabled}
				className="flex w-full items-center justify-between gap-2 text-left"
			>
				<ItemContent>
					<div className="flex h-5 items-center gap-2">
						<Icon
							name="calendar_month"
							size={20}
							fill={0}
							wght={400}
							grad={0}
							opsz={24}
							color=""
							className={"text-primary-600"}
							aria-hidden="true"
						/>
						<span
							className={cn(
								"text-base",
								disabled ? "text-base-400" : "text-brand-japan-black",
								(outboundDate || returnDate) && "text-brand-japan-black"
							)}
						>
							{getCalendarLabel(outboundDate, returnDate, tripType, t("trigger_label"))}
						</span>
					</div>
				</ItemContent>
				<ItemActions>
					<Icon
						name="arrow_drop_down"
						size={18}
						fill={0}
						wght={400}
						grad={0}
						opsz={20}
						color=""
						className={"text-primary-600"}
						aria-hidden="true"
					/>
				</ItemActions>
			</button>
		</Item>
	);

	return (
		<>
			{/* Calendar Trigger Button */}
			{effectiveTooltipText ? (
				<Tooltip open={isTooltipOpen}>
					<TooltipTrigger asChild>{calendarTrigger}</TooltipTrigger>
					<TooltipContent side="bottom" sideOffset={4}>
						{effectiveTooltipText}
					</TooltipContent>
				</Tooltip>
			) : (
				calendarTrigger
			)}

			{/* Calendar Modal Content */}
			<CalendarContent
				open={open}
				onOpenChange={handleCalendarChange}
				onConfirm={handleCalendarConfirm}
				onReset={handleCalendarReset}
				tripType={tripType as "round-trip" | "one-way"}
				origin={origin}
				destination={destination}
				promotionCode={promotionCode}
				initialDeparture={confirmedDeparture}
				initialReturn={confirmedReturn}
				passengerType={passengerType}
				initialSeatType={confirmedSeatType}
			/>
		</>
	);
};

export default CalendarModal;
