/**
 * File: passenger-information.tsx
 * Description: Accordion-based passenger information component that displays traveler details
 * in responsive mobile and desktop layouts. Supports review of passenger data, assistance indicators,
 * and navigation to passenger information update actions during booking confirmation.
 */
"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { cn } from "@repo/ui/lib";
import { useState } from "react";
import { AccordionToggleIcon } from "@/components/common/accordion-toggle-icon/accordion-toggle-icon";
import { PassengerAccordionRow } from "@/components/confirmation/passenger-information/passenger-accordion-row/passenger-accordion-row";
import { PassengerRow } from "@/components/confirmation/passenger-information/passenger-row/passenger-row";
import { PASSENGER_INFORMATION_ACCORDION_VALUE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import type { PassengerInformationProps } from "@/types/confirmation/confirmation.types";

/** Passenger Information accordion table shown on the confirmation page. */
export function PassengerInformation({
	title,
	helperText,
	passengers,
	columnLabels,
	changeLabel,
	needsAssistanceLabel,
	toggleAriaLabel,
	toggleRowAriaLabel,
	defaultOpen = true,
	className,
}: PassengerInformationProps) {
	const [openMobileIndex, setOpenMobileIndex] = useState<number | null>(0);
	return (
		<Accordion
			type="single"
			collapsible
			defaultValue={defaultOpen ? PASSENGER_INFORMATION_ACCORDION_VALUE : undefined}
			className={cn("passenger-information flex flex-col gap-6", className)}
		>
			<AccordionItem value={PASSENGER_INFORMATION_ACCORDION_VALUE}>
				<AccordionTrigger
					className="group h-auto min-h-0 justify-between"
					aria-label={toggleAriaLabel}
				>
					<span className="flex-1 font-[700] text-2xl text-primary-700 leading-9">{title}</span>
					<AccordionToggleIcon
						iconSize={20}
						wrapperClassName="flex size-6 items-center justify-center rounded-full border border-primary-700 p-0.5"
					/>
				</AccordionTrigger>

				<div className="h-px w-full bg-base-200" />

				<AccordionContent className="flex flex-col gap-6">
					<p className="font-normal text-base text-base-700 leading-6">{helperText}</p>

					{/* Mobile: each passenger is its own collapsible card, one open at a time. */}
					<div className="flex flex-col gap-4 md:hidden">
						{passengers.map((passenger, index) => (
							<PassengerAccordionRow
								key={passenger.name}
								{...passenger}
								dateOfBirthLabel={columnLabels.dateOfBirth}
								passportNumberLabel={columnLabels.passportNumber}
								expiryDateLabel={columnLabels.expiryDate}
								nationalityLabel={columnLabels.nationality}
								changeLabel={changeLabel}
								needsAssistanceLabel={needsAssistanceLabel}
								toggleAriaLabel={toggleRowAriaLabel(passenger.name)}
								isOpen={openMobileIndex === index}
								onToggle={() => setOpenMobileIndex(openMobileIndex === index ? null : index)}
							/>
						))}
					</div>

					{/* Desktop: always-visible table. */}
					<div className="hidden flex-col md:flex">
						<div className="flex items-start gap-6 border-base-300 border-b py-4">
							<span className="w-60 shrink-0 font-bold text-base text-primary-700 leading-6">
								{columnLabels.passenger}
							</span>
							<div className="grid flex-1 grid-cols-4 gap-6">
								<span className="font-bold text-base text-primary-700 leading-6">
									{columnLabels.dateOfBirth}
								</span>
								<span className="font-bold text-base text-primary-700 leading-6">
									{columnLabels.passportNumber}
								</span>
								<span className="font-bold text-base text-primary-700 leading-6">
									{columnLabels.expiryDate}
								</span>
								<span className="font-bold text-base text-primary-700 leading-6">
									{columnLabels.nationality}
								</span>
							</div>
							<div className="w-[100px] shrink-0" />
						</div>

						{passengers.map((passenger) => (
							<PassengerRow
								key={passenger.name}
								{...passenger}
								changeLabel={changeLabel}
								needsAssistanceLabel={needsAssistanceLabel}
							/>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
