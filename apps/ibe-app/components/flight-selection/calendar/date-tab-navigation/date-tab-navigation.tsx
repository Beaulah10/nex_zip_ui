import { useTranslations } from "next-intl";
import { formatTabLabel } from "@/modules/utils/helpers/calendar/calendar.helpers";
import type { DateTabNavigationProps } from "@/types/flight-selection/flight-selection.types";

export default function DateTabNavigation({
	oneWay,
	activeTab,
	outboundDate,
	inboundDate,
	onTabChange,
	tabListClassName = "flex gap-2",
}: DateTabNavigationProps) {
	const flightSelectionLabels = useTranslations("flight_selection_page");
	const outboundTabLabel = flightSelectionLabels("calendar_tab_outbound");
	const returnTabLabel = flightSelectionLabels("calendar_tab_return");
	const outboundOneWayLabel = flightSelectionLabels("calendar_tab_outbound");
	return (
		<div
			className={tabListClassName}
			role="tablist"
			aria-label={oneWay ? "Select outbound date" : "Select outbound or inbound date"}
		>
			{oneWay ? (
				<button
					type="button"
					role="tab"
					aria-selected={true}
					className="border-primary-600 border-b-2 px-4 py-3 font-bold text-base text-primary-700 transition-colors"
				>
					{formatTabLabel(outboundDate, outboundOneWayLabel)}
				</button>
			) : (
				(
					[
						{
							id: "outbound",
							label: formatTabLabel(outboundDate, outboundTabLabel),
						},
						{ id: "inbound", label: formatTabLabel(inboundDate, returnTabLabel) },
					] as { id: "outbound" | "inbound"; label: string }[]
				).map(({ id, label }) => {
					const isActive = activeTab === id;
					const isInboundDisabled = id === "inbound" && !outboundDate;
					return (
						<button
							type="button"
							key={id}
							role="tab"
							aria-selected={isActive}
							aria-disabled={isInboundDisabled || undefined}
							disabled={isInboundDisabled}
							onClick={() => !isInboundDisabled && onTabChange(id)}
							className={[
								"border-b-2 px-4 py-3 font-bold transition-colors",
								isActive && !isInboundDisabled
									? "border-primary-600 text-base text-primary-600"
									: isInboundDisabled
										? "cursor-not-allowed border-transparent text-base-400 text-sm"
										: "cursor-pointer border-transparent text-base-700 text-sm hover:text-primary-600",
							].join(" ")}
						>
							{label}
						</button>
					);
				})
			)}
		</div>
	);
}
