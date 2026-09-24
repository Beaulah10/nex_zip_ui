"use client";

import { Button } from "@repo/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { type ReactNode, useCallback } from "react";
import type { CalendarLegendModalProps, LegendVariant } from "@/types/calendar.types";

type LegendItem = {
	variant: LegendVariant;
	descriptionKey: string;
};

type FlightSelectionTranslate = {
	(key: string): string;
	has: (key: string) => boolean;
};

const LEGEND_ITEMS: LegendItem[] = [
	{ variant: "available", descriptionKey: "calendar_legend_available" },
	{ variant: "promo", descriptionKey: "calendar_legend_promo" },
	{ variant: "alt-seat", descriptionKey: "calendar_legend_alt_seat" },
	{ variant: "unavailable", descriptionKey: "calendar_legend_unavailable" },
	{ variant: "past", descriptionKey: "calendar_legend_past" },
];

function getText(t: FlightSelectionTranslate, key: string) {
	return t(key);
}

function DateCellAvailable({ t }: { t: FlightSelectionTranslate }): ReactNode {
	return (
		<div className="flex min-h-14 flex-col items-center justify-center rounded-xl p-1">
			<span className="font-medium text-gray-900 text-lg leading-7">
				{getText(t, "calendar_legend_preview_day")}
			</span>
			<span className="text-primary-700 text-xs leading-5">
				{getText(t, "calendar_legend_preview_available_price")}
			</span>
		</div>
	);
}

function DateCellPromo({ t }: { t: FlightSelectionTranslate }): ReactNode {
	return (
		<div className="flex min-h-14 flex-col items-center justify-center rounded-xl p-1">
			<span className="font-medium text-gray-900 text-lg leading-7">
				{getText(t, "calendar_legend_preview_day")}
			</span>
			<span className="text-base-400 text-xs leading-5 line-through">
				{getText(t, "calendar_legend_preview_promo_original_price")}
			</span>
			<span className="font-bold text-primary-700 text-xs leading-5">
				{getText(t, "calendar_legend_preview_promo_price")}
			</span>
		</div>
	);
}

function DateCellAltSeat({ t }: { t: FlightSelectionTranslate }): ReactNode {
	return (
		<div className="flex min-h-14 flex-col items-center justify-center rounded-xl p-1">
			<span className="font-medium text-gray-900 text-lg leading-7">
				{getText(t, "calendar_legend_preview_day")}
			</span>
			<span className="text-primary-700 text-xs leading-5">
				{getText(t, "calendar_legend_preview_alt_seat_placeholder")}
			</span>
		</div>
	);
}

function DateCellUnavailable({ t }: { t: FlightSelectionTranslate }): ReactNode {
	return (
		<div className="flex min-h-14 flex-col items-center justify-center rounded-xl p-1">
			<span className="font-medium text-base-400 text-lg leading-7">
				{getText(t, "calendar_legend_preview_day")}
			</span>
			<Icon name="close" size={16} color="" className="text-base-400" />
		</div>
	);
}

function DateCellPast({ t }: { t: FlightSelectionTranslate }): ReactNode {
	return (
		<div className="flex min-h-14 flex-col items-center justify-center rounded-xl p-1">
			<span className="font-medium text-base-400 text-lg leading-7">
				{getText(t, "calendar_legend_preview_day")}
			</span>
		</div>
	);
}

export default function CalendarLegendModal({
	isOpen,
	onClose,
	triggerRef,
	promoPrices,
}: CalendarLegendModalProps): ReactNode {
	const t = useTranslations("flight_selection_page");
	const handleClose = useCallback(() => {
		onClose();
		setTimeout(() => triggerRef.current?.current?.focus(), 0);
	}, [onClose, triggerRef]);

	const title = getText(t, "calendar_legend_title");
	const closeButtonLabel = getText(t, "calendar_close_button_label");
	const closeButtonAriaLabel = getText(t, "calendar_legend_close_button_aria_label");

	// Filter legend items: exclude promo if promoPrices is not provided
	const filteredLegendItems = LEGEND_ITEMS.filter(
		(item) => item.variant !== "promo" || promoPrices
	);

	const itemsWithLabels = filteredLegendItems.map((item) => {
		const description = getText(t, item.descriptionKey);
		const preview =
			item.variant === "available" ? (
				<DateCellAvailable key={item.variant} t={t} />
			) : item.variant === "promo" ? (
				<DateCellPromo key={item.variant} t={t} />
			) : item.variant === "alt-seat" ? (
				<DateCellAltSeat key={item.variant} t={t} />
			) : item.variant === "unavailable" ? (
				<DateCellUnavailable key={item.variant} t={t} />
			) : (
				<DateCellPast key={item.variant} t={t} />
			);

		return { ...item, description, preview };
	});

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				aria-describedby={undefined}
				desktopWidth={640}
				mobileOuterSpacing={16}
				gap={0}
				className="flex max-h-[90dvh] flex-col p-0"
			>
				{/* Header */}
				<div className="flex shrink-0 items-center gap-2 rounded-t-2xl border-base-300 border-b bg-white px-4 py-4 md:gap-4 md:px-6">
					<DialogTitle className="flex-1">{title}</DialogTitle>
					<DialogClose
						onClick={handleClose}
						className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-base-300 bg-white text-brand-japan-black transition-colors hover:border-base-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary-600"
						aria-label={closeButtonAriaLabel}
					>
						<Icon name="close" size={24} color="" className="text-current" />
					</DialogClose>
				</div>

				{/* Body — scrollable */}
				<div className="flex flex-1 flex-col gap-8 overflow-y-auto p-4 pb-17 md:p-6 md:pb-14">
					{itemsWithLabels.map((item) => (
						<div
							key={item.variant}
							className="flex min-h-18 items-center gap-4 rounded-lg border border-base-300 bg-white p-2"
						>
							{/* Date cell preview */}
							<div
								className="flex w-21 shrink-0 flex-col items-center justify-center self-stretch"
								aria-hidden="true"
							>
								{item.preview}
							</div>

							{/* Vertical divider */}
							<div className="w-px self-stretch bg-base-200" aria-hidden="true" />

							{/* Description */}
							<p className="flex-1 text-base text-brand-japan-black leading-6">
								{item.description.split("\n").map((line) => (
									<span key={line} className="block">
										{line}
									</span>
								))}
							</p>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="flex flex-col-reverse gap-2 rounded-b-2xl border-base-200 border-t px-4 py-4 md:flex-row md:justify-end md:px-6">
					<Button
						type="button"
						onClick={handleClose}
						variant="primary"
						size="xl"
						className="min-w-48 rounded-lg"
					>
						{closeButtonLabel}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
