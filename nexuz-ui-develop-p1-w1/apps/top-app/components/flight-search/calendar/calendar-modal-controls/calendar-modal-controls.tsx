"use client";

import { useTranslations } from "next-intl";
import { IconInfo } from "@/modules/utils/helpers/calendar/calendar.helpers";
import type { SeatType } from "@/types/flight-search/calendar.types";
import DateTabNavigation from "../date-tab-navigation/date-tab-navigation";
import SeatTypeSelector from "../seat-type-selector/seat-type-selector";

type CalendarModalControlsProps = {
	isChild: boolean;
	seatType: SeatType;
	onSeatTypeChange: (nextSeatType: SeatType) => void;
	onOpenLegend: () => void;
	legendTriggerDesktopRef: React.RefObject<HTMLButtonElement | null>;
	legendTriggerMobileRef: React.RefObject<HTMLButtonElement | null>;
	oneWay: boolean;
	activeTab: "outbound" | "inbound";
	outboundDate: Date | null;
	inboundDate: Date | null;
	onTabChange: (tab: "outbound" | "inbound") => void;
};

export default function CalendarModalControls({
	isChild,
	seatType,
	onSeatTypeChange,
	onOpenLegend,
	legendTriggerDesktopRef,
	legendTriggerMobileRef,
	oneWay,
	activeTab,
	outboundDate,
	inboundDate,
	onTabChange,
}: CalendarModalControlsProps) {
	const t = useTranslations("flight_search_page");
	const legendButtonLabel = t("legend_button_label");
	return (
		<>
			<div className="hidden shrink-0 flex-wrap items-center gap-8 bg-white px-6 py-4 md:flex">
				<SeatTypeSelector
					seatType={seatType}
					onChange={onSeatTypeChange}
					isChild={isChild}
					variant="desktop"
				/>
				<button
					ref={legendTriggerDesktopRef}
					type="button"
					onClick={onOpenLegend}
					aria-haspopup="dialog"
					className="flex shrink-0 cursor-pointer items-center gap-1 rounded font-medium text-base text-primary-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-600"
				>
					<IconInfo />
					{legendButtonLabel}
				</button>
			</div>

			<div className="hidden shrink-0 justify-center bg-white px-10 md:flex">
				<DateTabNavigation
					oneWay={oneWay}
					activeTab={activeTab}
					outboundDate={outboundDate}
					inboundDate={inboundDate}
					onTabChange={onTabChange}
					tabListClassName="flex justify-center gap-2 border-base-200 border-b"
				/>
			</div>

			<div className="sticky top-0 z-10 border-base-200 border-b bg-white shadow-xs md:hidden">
				<div className="flex flex-col gap-4 bg-white px-6 pt-4 pb-3 md:hidden">
					<SeatTypeSelector
						seatType={seatType}
						onChange={onSeatTypeChange}
						isChild={isChild}
						variant="mobile"
					/>
					<div className="flex justify-end">
						<button
							ref={legendTriggerMobileRef}
							type="button"
							onClick={onOpenLegend}
							aria-haspopup="dialog"
							className="flex shrink-0 items-center gap-1 rounded font-medium text-base text-primary-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-600"
						>
							<IconInfo />
							{legendButtonLabel}
						</button>
					</div>
				</div>

				<div className="sticky top-0 z-10 border-base-200 border-b bg-white shadow-xs md:hidden">
					<div className="flex justify-center px-6">
						<DateTabNavigation
							oneWay={oneWay}
							activeTab={activeTab}
							outboundDate={outboundDate}
							inboundDate={inboundDate}
							onTabChange={onTabChange}
							tabListClassName="flex w-full gap-2"
						/>
					</div>
				</div>
			</div>
		</>
	);
}
