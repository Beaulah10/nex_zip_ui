import { useTranslations } from "next-intl";
import { formatTabLabel } from "@/modules/utils/helpers/calendar/calendar.helpers";

interface DateTabNavigationProps {
	oneWay: boolean;
	activeTab: "outbound" | "inbound";
	outboundDate: Date | null;
	inboundDate: Date | null;
	onTabChange: (tab: "outbound" | "inbound") => void;
	tabListClassName?: string;
}

export default function DateTabNavigation({
	oneWay,
	activeTab,
	outboundDate,
	inboundDate,
	onTabChange,
	tabListClassName = "flex gap-2",
}: DateTabNavigationProps) {
	const t = useTranslations("flight_search_page");
	const outboundTabLabel = t("tab_outbound");
	const returnTabLabel = t("tab_return");
	const oneWayLabel = t("tab_outbound");

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
					className="border-primary-600 border-b-2 px-4 py-3 font-bold text-base text-primary-600 transition-colors"
				>
					{formatTabLabel(outboundDate, oneWayLabel)}
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
									? "border-primary-600 text-base text-primary-700"
									: isInboundDisabled
										? "cursor-not-allowed border-transparent text-base text-base-500"
										: "cursor-pointer border-transparent text-base text-base-700 hover:text-primary-600",
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
