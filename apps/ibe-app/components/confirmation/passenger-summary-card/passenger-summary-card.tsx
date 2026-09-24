/**
 * File: passenger-summary-card.tsx
 * Description: Accordion card component that displays a passenger's fare summary,
 * including the total price, passenger category badge, and an expandable breakdown
 * of fare-related charges on the booking confirmation page.
 */
"use client";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/accordion";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { InfantIcon } from "@/assets/images/infant-icon";
import { AccordionToggleIcon } from "@/components/common/accordion-toggle-icon/accordion-toggle-icon";
import { SummaryRow } from "@/components/confirmation/passenger-summary-card/summary-row/summary-row";
import { CONFIRMATION_SUMMARY_ROW_IDS } from "@/modules/utils/constants/confirmation/summary-row.constants";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { PassengerSummaryCardProps } from "@/types/confirmation/confirmation.types";

/** Passenger price-summary accordion card shown below each flight leg on the confirmation page. */
export function PassengerSummaryCard({
	accordionValue,
	name,
	totalPrice,
	rows,
	toggleAriaLabel,
	seatErrorBanner,
	isInfant,
	badgeLabel,
	className,
	baggageSegmentMismatchBanner,
	showBaggageSegmentMismatchBanner,
	baggageSegmentMismatchPassengerId,
}: PassengerSummaryCardProps) {
	return (
		<AccordionItem
			value={accordionValue}
			data-seat-summary-passenger-id={accordionValue}
			className={cn(
				"passenger-summary-card flex flex-col gap-4 rounded-lg border border-base-300 bg-white p-4",
				className
			)}
		>
			<AccordionTrigger
				className="group h-auto min-h-10 flex-col items-stretch gap-2 md:h-14 md:flex-row md:items-center md:justify-between md:gap-3"
				aria-label={`${toggleAriaLabel} ${name}`}
			>
				{/* Mobile: name + expand button share the top row; price moves to its own row below. */}
				<div className="flex items-center justify-between gap-3 md:flex-1 md:justify-start">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						{isInfant ? (
							<InfantIcon className="shrink-0 text-primary-700" />
						) : (
							<Icon name="person" size={24} fill={1} className="shrink-0 text-primary-700" />
						)}
						<div className="flex flex-1 flex-col items-start justify-center gap-1">
							<span className="font-bold text-brand-japan-black text-xl leading-8">{name}</span>
							{badgeLabel && (
								<Badge variant="info" className="rounded-[--border-radius-rounded-sm]">
									{badgeLabel}
								</Badge>
							)}
						</div>
					</div>
					<span className="shrink-0 md:hidden">
						<AccordionToggleIcon
							iconSize={20}
							wrapperClassName="flex size-6 items-center justify-center rounded-full border border-primary-700 p-0.5"
						/>
					</span>
				</div>

				<div className="flex items-center justify-end gap-4">
					<span className="shrink-0 font-bold text-primary-700 text-xl leading-8 sm:text-2xl sm:leading-9">
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

			<AccordionContent className="flex flex-col gap-4">
				<div className="h-px w-full bg-base-300" />
				{rows.map((row) => {
					const showBaggageMismatchAlert =
						baggageSegmentMismatchBanner &&
						showBaggageSegmentMismatchBanner &&
						row.id === CONFIRMATION_SUMMARY_ROW_IDS.baggage;
					return (
						<div key={`${row.id}-${row.label}`} className="flex flex-col gap-4">
							{row.warningMessage && (
								<div className="w-full rounded-md text-sm text-warning-700 leading-6">
									<Alert variant="warning" className="gap-0 rounded-md p-4">
										<AlertTitle>{row.warningMessage}</AlertTitle>
									</Alert>
								</div>
							)}
							{/* Baggage mismatch alert must appear before the baggage row */}
							{showBaggageMismatchAlert ? (
								<div
									data-baggage-segment-mismatch-passenger-id={baggageSegmentMismatchPassengerId}
									tabIndex={-1}
									role="alert"
									aria-live="assertive"
									aria-atomic="true"
									className="w-full"
								>
									<Alert variant={baggageSegmentMismatchBanner.variant ?? "error"}>
										<AlertTitle>{baggageSegmentMismatchBanner.title}</AlertTitle>

										<AlertDescription>{baggageSegmentMismatchBanner.body}</AlertDescription>
									</Alert>
								</div>
							) : null}
							<SummaryRow {...row} passengerName={name} />
							{seatErrorBanner && row.id === CONFIRMATION_SUMMARY_ROW_IDS.seatType ? (
								<Alert variant="error" data-seat-error-banner-passenger-id={accordionValue}>
									<AlertTitle>{seatErrorBanner.title}</AlertTitle>
									<AlertDescription>{seatErrorBanner.body}</AlertDescription>
								</Alert>
							) : null}
						</div>
					);
				})}
			</AccordionContent>
		</AccordionItem>
	);
}
