export const CONFIRMATION_SUMMARY_ROW_IDS = {
	bundle: "bundle",
	seatType: "seatType",
	seat: "seat",
	baggage: "baggage",
	meal: "meal",
	priority: "priority",
	lounge: "lounge",
	transport: "transport",
	extras: "extras",
	voucher: "voucher",
} as const;

export type ConfirmationSummaryRowId =
	(typeof CONFIRMATION_SUMMARY_ROW_IDS)[keyof typeof CONFIRMATION_SUMMARY_ROW_IDS];

export const CONFIRMATION_SUMMARY_ROW_ICONS: Record<ConfirmationSummaryRowId, string> = {
	[CONFIRMATION_SUMMARY_ROW_IDS.bundle]: "trip",
	[CONFIRMATION_SUMMARY_ROW_IDS.seatType]: "airline_seat_recline_normal",
	[CONFIRMATION_SUMMARY_ROW_IDS.seat]: "flight_class",
	[CONFIRMATION_SUMMARY_ROW_IDS.baggage]: "luggage",
	[CONFIRMATION_SUMMARY_ROW_IDS.meal]: "restaurant",
	[CONFIRMATION_SUMMARY_ROW_IDS.priority]: "schedule",
	[CONFIRMATION_SUMMARY_ROW_IDS.lounge]: "weekend",
	[CONFIRMATION_SUMMARY_ROW_IDS.transport]: "airport_shuttle",
	[CONFIRMATION_SUMMARY_ROW_IDS.extras]: "loyalty",
	[CONFIRMATION_SUMMARY_ROW_IDS.voucher]: "airplane_ticket",
};
export type StandardAncillarySummaryRowId = Extract<
	ConfirmationSummaryRowId,
	"meal" | "priority" | "lounge" | "transport" | "extras"
>;
