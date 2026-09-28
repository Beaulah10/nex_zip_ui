/**
 * File: taxes-summary-card.tsx
 * Description: Accordion card component that displays a summarized total of taxes and fees
 * with an expandable breakdown of individual tax items on the booking confirmation page.
 * Supports default expanded/collapsed state and accessible toggle interactions.
 */

"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { AccordionToggleIcon } from "@/components/common/accordion-toggle-icon/accordion-toggle-icon";
import { TaxRow } from "@/components/confirmation/taxes-summary-card/tax-row/tax-row";
import { TAXES_SUMMARY_ACCORDION_VALUE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { TaxesSummaryCardProps } from "@/types/confirmation/confirmation.types";

/** Taxes and fees breakdown accordion card shown on the confirmation page. */
export function TaxesSummaryCard({
	title,
	totalPrice,
	note,
	rows,
	toggleAriaLabel,
	defaultOpen = true,
	className,
}: TaxesSummaryCardProps) {
	return (
		<Accordion
			type="single"
			collapsible
			defaultValue={defaultOpen ? TAXES_SUMMARY_ACCORDION_VALUE : undefined}
			className={cn(
				"taxes-summary-card flex flex-col gap-4 rounded-lg border border-base-300 bg-white p-4",
				className
			)}
		>
			<AccordionItem value={TAXES_SUMMARY_ACCORDION_VALUE}>
				<AccordionTrigger
					className="group h-auto min-h-10 flex-col items-stretch gap-2 md:h-14 md:flex-row md:items-center md:justify-between md:gap-6"
					aria-label={`${toggleAriaLabel} ${title}`}
				>
					{/* Mobile: title + expand button share the top row; note and price move to their own rows below. */}
					<div className="flex items-center justify-between gap-3 md:shrink-0 md:justify-start">
						<div className="flex min-w-0 items-center gap-2">
							<Icon name="money_range" size={24} fill={1} className="shrink-0 text-primary-700" />
							<span className="font-bold text-brand-japan-black text-xl leading-8">{title}</span>
						</div>
						<span className="shrink-0 md:hidden">
							<AccordionToggleIcon
								iconSize={20}
								wrapperClassName="flex size-6 items-center justify-center rounded-full border border-primary-700 p-0.5"
							/>
						</span>
					</div>

					<p className="font-normal text-base-700 text-sm leading-6 md:flex-1">{note}</p>

					<div className="flex items-center justify-end gap-4 md:shrink-0">
						<span className="font-bold text-2xl text-primary-700 leading-9">
							{formatPrice(totalPrice)}
						</span>
						<span className="hidden shrink-0 md:inline-flex">
							<AccordionToggleIcon
								iconSize={20}
								wrapperClassName="flex size-6 items-center justify-center rounded-full border border-primary-700 p-0.5"
							/>
						</span>
					</div>
				</AccordionTrigger>

				<AccordionContent className="flex flex-col">
					<div className="mb-4 h-px w-full bg-base-300" />
					{rows.map((row) => (
						<TaxRow key={row.title} {...row} />
					))}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
