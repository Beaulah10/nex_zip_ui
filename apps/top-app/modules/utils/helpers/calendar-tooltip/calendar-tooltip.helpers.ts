export type TooltipState =
	| "available"
	| "alt-seat"
	| "no-seats"
	| "invalid-date"
	| "loading"
	| "past-date";

export interface TooltipContext {
	date: Date;
	seatType: "standard" | "zip";
	fareData?: Record<string, { standard?: number; zipFullFlat?: number }>;
	currencySymbol: string;
	isOutOfRange: boolean;
	isBeforeDeparture: boolean;
	isLoading: boolean;
}

function formatDateToString(date: Date): string {
	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const day = dayNames[date.getDay()];
	const month = monthNames[date.getMonth()];
	const dateNum = date.getDate();
	const year = date.getFullYear();

	return `${day}, ${month} ${dateNum}, ${year}`;
}

function getSeatTypeName(seatType: "standard" | "zip"): string {
	return seatType === "standard" ? "Standard seat" : "Zip Full-Flat seat";
}

function formatDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getTooltipState(context: TooltipContext): TooltipState {
	if (context.isOutOfRange) return "past-date";
	if (context.isLoading) return "loading";
	if (context.isBeforeDeparture) return "invalid-date";

	const key = formatDateKey(context.date);
	const fares = context.fareData?.[key];
	if (!fares) return "no-seats";

	const seatTypeKey = context.seatType === "standard" ? "standard" : "zipFullFlat";
	if (fares[seatTypeKey] === undefined) return "alt-seat";

	return "available";
}

export function generateTooltipText(context: TooltipContext): string {
	const dateStr = formatDateToString(context.date);
	const seatTypeName = getSeatTypeName(context.seatType);
	const key = formatDateKey(context.date);
	const fares = context.fareData?.[key];
	const state = getTooltipState(context);

	switch (state) {
		case "available": {
			const seatTypeKey = context.seatType === "standard" ? "standard" : "zipFullFlat";
			const fare = fares?.[seatTypeKey];
			const formattedFare = fare ? `${context.currencySymbol}${fare.toLocaleString("en-US")}` : "";
			return `${seatTypeName} - ${dateStr} - ${formattedFare}`;
		}
		case "alt-seat":
			return `${seatTypeName} - ${dateStr} - ${seatTypeName} cannot be purchased Available in different seat types.`;
		case "no-seats":
			return `${seatTypeName} - ${dateStr} - There are no available seats.`;
		case "invalid-date":
			return `${seatTypeName} - ${dateStr} - This date cannot be selected.`;
		default:
			return "";
	}
}

export function shouldShowTooltip(state: TooltipState): boolean {
	return state !== "loading" && state !== "past-date";
}
