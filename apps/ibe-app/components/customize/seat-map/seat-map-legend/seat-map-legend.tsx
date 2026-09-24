/**
 * File: seat-map-legend.tsx
 * Description: Renders the seat map legend with seat types, availability indicators, pricing information, and bundle-eligible seat pricing details.
 */

"use client";

import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { type CSSProperties, type ReactNode, useMemo } from "react";
import {
	PRICE_BEARING_ITEM_IDS,
	ZIP_FULL_FLAT_LEGEND_ITEM_IDS,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import {
	getBundleSeatPrice,
	getSeatLegendServiceCode,
} from "@/modules/utils/helpers/seat-map/bundle-seat-pricing/bundle-seat-pricing";
import type { LegendItemId, SeatLegendPrices } from "@/types/seat-map/seat-map.types";

type SeatLegendCabin = "Standard" | "ZipFullFlat";

interface LegendItem {
	id: LegendItemId;
	label: string;
	swatchClassName: string;
	icon?: ReactNode;
	swatchStyle?: CSSProperties;
}

function formatLegendPrice(amount: number | undefined): string {
	if (amount === undefined) {
		return "-";
	}

	return `¥${amount.toLocaleString()}`;
}

export function SeatMapLegend({
	cabinClass,
	complimentaryLegendEligible,
	bundleSeatServiceCodes,
	selectedServiceCode,
	bundleInfoMessage,
	prices,
}: {
	cabinClass: SeatLegendCabin;
	complimentaryLegendEligible: boolean;
	bundleSeatServiceCodes: ReadonlySet<string>;
	selectedServiceCode?: string;
	bundleInfoMessage?: string;
	prices: SeatLegendPrices;
}) {
	const t = useTranslations("seat_service");
	const legendItems = useMemo<LegendItem[]>(
		() => [
			{
				id: "more-legroom",
				label: t("seat_legend_more_legroom"),
				swatchClassName: "bg-warning-400",
				icon: <Icon name="open_in_full" size={12} color="text-warning-800" />,
			},
			{
				id: "front-aisle-window-side",
				label: t("seat_legend_front_aisle_window_side"),
				swatchClassName: "bg-primary-400",
				icon: <span className="block h-0.5 w-2.5 -translate-y-1 rounded-full bg-primary-700" />,
			},
			{
				id: "reclining-not-allowed",
				label: t("seat_legend_reclining_not_allowed"),
				swatchClassName: "bg-base-300",
				icon: <Icon name="unfold_less" size={12} color="text-primary-700" />,
			},
			{
				id: "rear-aisle-window-side",
				label: t("seat_legend_rear_aisle_window_side"),
				swatchClassName: "bg-success-400",
				icon: <span className="block h-0.5 w-2.5 translate-y-1 rounded-full bg-success-800" />,
			},
			{
				id: "central-seat",
				label:
					cabinClass === "ZipFullFlat"
						? t("seat_legend_zip_full_flat_central_seat")
						: t("seat_legend_central_seat"),
				swatchClassName: "border border-primary-500 bg-primary-300",
			},
			{
				id: "selected",
				label: t("seat_legend_selected"),
				swatchClassName: "bg-primary-800",
				icon: <span className="font-semibold text-[9px] text-white">ZP</span>,
			},
			{
				id: "not-selectable",
				label: t("seat_legend_not_selectable"),
				swatchClassName: "bg-gray-50",
				icon: <Icon name="close" size={12} color="text-base-400" />,
			},
		],
		[cabinClass, t]
	);
	const visibleLegendItems =
		cabinClass === "ZipFullFlat"
			? legendItems.filter((item) => ZIP_FULL_FLAT_LEGEND_ITEM_IDS.has(item.id))
			: legendItems;

	return (
		<div className="seat-map__legend flex flex-col gap-2 p-4">
			{visibleLegendItems.map((item) => {
				const amount = prices[item.id];
				const serviceCode = getSeatLegendServiceCode({
					itemId: item.id,
					cabinClass,
					selectedServiceCode,
				});
				const bundleSeatPrice =
					amount === undefined
						? undefined
						: getBundleSeatPrice({
								amount,
								serviceCode,
								bundleSeatServiceCodes,
							});
				const showBundleIncludedPrice =
					!complimentaryLegendEligible &&
					bundleSeatPrice?.isBundleIncluded &&
					PRICE_BEARING_ITEM_IDS.has(item.id);

				return (
					<div key={item.id} className="flex items-center gap-3">
						<span
							className={`rounded- flex size-4 shrink-0 items-center justify-center rounded-xs ${item.swatchClassName}`}
							style={item.swatchStyle}
						>
							{item.icon}
						</span>
						<span className="flex-1 text-brand-japan-black text-sm">{item.label}</span>
						{complimentaryLegendEligible && PRICE_BEARING_ITEM_IDS.has(item.id) ? (
							<span className="flex items-center gap-1 text-sm">
								<span className="text-base-400 line-through">{formatLegendPrice(amount)}</span>
								<span className="font-semibold text-primary-700 leading-6">¥0</span>
							</span>
						) : showBundleIncludedPrice ? (
							<span className="flex items-center gap-1 text-sm">
								<span className="text-base-400 line-through">
									{formatLegendPrice(bundleSeatPrice?.originalAmount)}
								</span>
								<span className="font-semibold text-primary-700 leading-6">¥0</span>
							</span>
						) : (
							<span className="font-semibold text-primary-700 text-sm leading-6">
								{formatLegendPrice(amount)}
							</span>
						)}
					</div>
				);
			})}
			{bundleInfoMessage && (
				<p className="mt-1 text-base-700 text-sm leading-5">{bundleInfoMessage}</p>
			)}
		</div>
	);
}
