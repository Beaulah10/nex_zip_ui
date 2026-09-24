/**
 * File: passenger-accordion-row.tsx
 * Description: Mobile-friendly accordion component that displays an individual passenger's
 * details, including personal and travel document information, within the Passenger Information section.
 * Supports expandable review of passenger data and provides an action to update passenger information.
 */
"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { InfantIcon } from "@/assets/images/infant-icon";
import { AccordionToggleIcon } from "@/components/common/accordion-toggle-icon/accordion-toggle-icon";
import { PASSENGER_ACCORDION_VALUE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import type { PassengerAccordionRowProps } from "@/types/confirmation/confirmation.types";

/** Single passenger's collapsible card used by the mobile Passenger Information accordion. */
export function PassengerAccordionRow({
	name,
	dateOfBirth,
	passportNumber,
	expiryDate,
	nationality,
	needsAssistance,
	isInfant,
	needsAssistanceLabel,
	dateOfBirthLabel,
	passportNumberLabel,
	expiryDateLabel,
	nationalityLabel,
	changeLabel,
	onChange,
	toggleAriaLabel,
	defaultOpen = false,
	isOpen,
	onToggle,
	className,
}: PassengerAccordionRowProps) {
	const controlled = isOpen !== undefined;
	return (
		<Accordion
			type="single"
			collapsible
			{...(controlled
				? { value: isOpen ? PASSENGER_ACCORDION_VALUE : "", onValueChange: onToggle }
				: { defaultValue: defaultOpen ? PASSENGER_ACCORDION_VALUE : undefined })}
			className={cn(
				"passenger-accordion-row rounded-lg border border-base-300 bg-white p-4",
				className
			)}
		>
			<AccordionItem value={PASSENGER_ACCORDION_VALUE}>
				<AccordionTrigger
					className="group h-auto min-h-0 justify-between gap-2"
					aria-label={toggleAriaLabel}
				>
					<div className="flex min-w-0 flex-1 gap-2">
						{isInfant ? (
							<InfantIcon className="shrink-0 text-primary-700" />
						) : (
							<Icon name="person" size={24} fill={1} className="shrink-0 text-primary-700" />
						)}
						<div className="flex min-w-0 flex-1 flex-col items-start gap-2">
							<span className="break-words font-bold text-base text-brand-japan-black leading-6">
								{name}
							</span>
							{needsAssistance && (
								<Badge
									variant="destructive"
									className="rounded-[var(--border-radius-rounded-sm)] bg-danger-100 text-danger-800"
								>
									{needsAssistanceLabel}
								</Badge>
							)}
						</div>
					</div>
					<AccordionToggleIcon
						iconSize={20}
						wrapperClassName="flex size-6 items-center justify-center rounded-full border border-primary-700 p-0.5"
					/>
				</AccordionTrigger>

				<AccordionContent className="flex flex-col gap-3 pt-3">
					<div className="divide-y divide-base-200">
						<div className="h-px bg-base-200" />
						<div className="flex items-center justify-between gap-2 py-3">
							<span className="font-[700] text-base text-primary-700 leading-6">
								{dateOfBirthLabel}
							</span>
							<span className="text-base text-base-700 leading-6">{dateOfBirth}</span>
						</div>
						<div className="flex items-center justify-between gap-2 py-3">
							<span className="font-[700] text-base text-primary-700 leading-6">
								{passportNumberLabel}
							</span>
							<span className="text-base text-base-700 leading-6">{passportNumber}</span>
						</div>
						<div className="flex items-center justify-between gap-2 py-3">
							<span className="font-[700] text-base text-primary-700 leading-6">
								{expiryDateLabel}
							</span>
							<span className="text-base text-base-700 leading-6">{expiryDate}</span>
						</div>
						<div className="flex items-center justify-between gap-2 py-3">
							<span className="font-[700] text-base text-primary-700 leading-6">
								{nationalityLabel}
							</span>
							<span className="text-base text-base-700 leading-6">{nationality}</span>
						</div>
						<div className="h-px bg-base-200" />
					</div>
					<Button
						variant="primary"
						outline
						size="md"
						onClick={onChange}
						className="w-full rounded-lg"
					>
						{changeLabel}
					</Button>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
