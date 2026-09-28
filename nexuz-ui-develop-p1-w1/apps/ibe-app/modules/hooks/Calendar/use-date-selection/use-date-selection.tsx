import { useCallback, useState } from "react";
import { toDateOnly } from "../../../utils/helpers/calendar/calendar.helpers";

interface UseDateSelectionParams {
	initialDeparture: Date | null;
	initialReturn: Date | null;
	oneWay: boolean;
}

function getInitialActiveTab(
	initialDeparture: Date | null,
	initialReturn: Date | null,
	oneWay: boolean
): "outbound" | "inbound" {
	if (oneWay) {
		return "outbound";
	}

	return initialDeparture || initialReturn ? "inbound" : "outbound";
}

/**
 * Encapsulates outbound/inbound date selection rules for one-way and round-trip modes.
 */
export default function useDateSelection({
	initialDeparture,
	initialReturn,
	oneWay,
}: UseDateSelectionParams) {
	const [activeTab, setActiveTab] = useState<"outbound" | "inbound">(() =>
		getInitialActiveTab(initialDeparture, initialReturn, oneWay)
	);
	const [outboundDate, setOutboundDate] = useState<Date | null>(initialDeparture);
	const [inboundDate, setInboundDate] = useState<Date | null>(oneWay ? null : initialReturn);
	const [hovered, setHovered] = useState<Date | null>(null);

	const handleDateSelect = useCallback(
		(date: Date) => {
			if (oneWay) {
				setOutboundDate(date);
				return;
			}
			//fix for IBE alone
			if (activeTab === "outbound") {
				if (outboundDate && toDateOnly(date).getTime() === toDateOnly(outboundDate).getTime()) {
					return;
				}

				setOutboundDate(date);

				if (inboundDate && toDateOnly(date) >= toDateOnly(inboundDate)) {
					setInboundDate(null);
				}

				setActiveTab("inbound");
				return;
			}

			if (!outboundDate) {
				setOutboundDate(date);
				setInboundDate(null);
				setActiveTab("inbound");
			} else if (inboundDate) {
				if (toDateOnly(date) > toDateOnly(outboundDate)) {
					// Any date after departure updates only return date.
					setInboundDate(date);
				} else {
					// Any other click when a full range exists resets to new departure.
					setOutboundDate(date);
					setInboundDate(null);
					setActiveTab("inbound");
				}
			} else if (toDateOnly(date) < toDateOnly(outboundDate)) {
				// Backward click resets range and treats as new departure.
				setOutboundDate(date);
				setInboundDate(null);
				setActiveTab("inbound");
			} else if (toDateOnly(date).getTime() === toDateOnly(outboundDate).getTime()) {
				// Same day as departure is a no-op.
				return;
			} else {
				// Forward date sets return.
				setInboundDate(date);
			}
		},
		[activeTab, outboundDate, inboundDate, oneWay]
	);

	const handleReset = useCallback(() => {
		setOutboundDate(null);
		setInboundDate(null);
		setActiveTab("outbound");
		setHovered(null);
	}, []);

	const syncFromInitialValues = useCallback(() => {
		setOutboundDate(initialDeparture);
		setInboundDate(oneWay ? null : initialReturn);
		setActiveTab(getInitialActiveTab(initialDeparture, initialReturn, oneWay));
		setHovered(null);
	}, [initialDeparture, initialReturn, oneWay]);

	return {
		activeTab,
		outboundDate,
		hovered,
		inboundDate,
		setActiveTab,
		setOutboundDate,
		setHovered,
		setInboundDate,
		handleDateSelect,
		handleReset,
		syncFromInitialValues,
	};
}
