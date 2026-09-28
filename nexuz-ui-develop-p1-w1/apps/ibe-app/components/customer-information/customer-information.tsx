/**
 * File: customer-information.tsx
 * Description: Main Customer Information page component that manages passenger information completion and booking validation.
 * It displays passenger details, collects confirmation from the user, validates all required information, and enables progression to the next booking step.
 */

"use client";
import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Field, FieldError } from "@repo/ui/components/field";
import { FieldCheckboxField } from "@repo/ui/components/field-inputs";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BookingFooter } from "@/components/common/booking-footer/booking-footer";
import { BookingHeader } from "@/components/common/booking-header/booking-header";
import { PassengerList } from "@/components/customer-information/passenger-details/passenger-list/passenger-list";
import { useAppSelector } from "@/store/hooks";
import { selectHasIncompletePassengers } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedTotalAmount } from "@/store/slices/flight-selection/flight-selection.slice";

// ── Page ──────────────────────────────────────────────────────────────────────
/** customer information main page */
export default function CustomerInformation() {
	const t = useTranslations("customer_information_page");
	const locale = useLocale();
	const hasIncomplete = useAppSelector(selectHasIncompletePassengers);
	const [confirmed, setConfirmed] = useState(false);
	const [errorAlert, setErrorAlert] = useState(false);
	const router = useRouter();
	const alertRef = useRef<HTMLDivElement>(null);
	const confirmedTotalAmount = useAppSelector(selectConfirmedTotalAmount);
	useEffect(() => {
		if (!hasIncomplete) {
			setErrorAlert(false);
		}
	}, [hasIncomplete]);
	function onProceedToCustomerInfo() {
		if (confirmed && !hasIncomplete) {
			setErrorAlert(false);
			router.push(`/${locale}/confirmation`);
		} else {
			setErrorAlert(true);
		}
		if (hasIncomplete) {
			requestAnimationFrame(() => alertRef.current?.focus());
		}
	}

	return (
		<div className="flex flex-col px-4 md:px-0">
			<div
				className={cn("flex flex-col gap-4", errorAlert && hasIncomplete ? "pb-4 md:pb-6" : "pb-0")}
			>
				<BookingHeader
					title={t("dialog_customer_information")}
					description={t("customer_information_header_info")}
				/>
			</div>
			<main
				className={cn(
					"customer-info-page flex min-h-[75.0625rem] flex-col pb-32",
					errorAlert && hasIncomplete ? "" : "gap-4 md:gap-6"
				)}
			>
				{/* Validation alert */}
				{errorAlert && hasIncomplete && (
					<div ref={alertRef} tabIndex={-1}>
						<Alert variant="error">
							<AlertTitle>{t("customer_info_validation_error")}</AlertTitle>
						</Alert>
					</div>
				)}

				{/* Display Passenger card list */}
				<PassengerList />

				{/* Precautions */}
				<section className="precautions-section flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<h2 className="font-bold text-2xl text-primary-700 leading-9">
							{t("section_precautions")}
						</h2>
						<Separator />
					</div>
					<ul className="precautions-list flex flex-col">
						<li
							key="precaution-content-1"
							className="precaution-item flex items-start gap-2 font-normal text-base text-base-700 leading-6"
						>
							<span className="precaution-bullet mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-base-900" />
							<span>{t("precaution_1")}</span>
						</li>
						<li
							key="precaution-content-2"
							className="precaution-item flex items-start gap-2 font-normal text-base text-base-700 leading-6"
						>
							<span className="precaution-bullet mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-base-900" />
							<span>{t("precaution_2")}</span>
						</li>
					</ul>
					{/* Confirmation checkbox */}
					<Field>
						<div className="h-25 *:data-[slot=field-label]:h-full *:data-[slot=field-label]:min-h-0 **:data-[slot=field]:items-start md:h-auto md:*:data-[slot=field-label]:h-auto md:*:data-[slot=field-label]:min-h-13 md:**:data-[slot=field]:items-center">
							<FieldCheckboxField
								id="confirm-terms"
								checked={confirmed}
								aria-describedby={errorAlert && !confirmed ? "confirm-terms-error" : undefined}
								onCheckedChange={(val) => setConfirmed(val === true)}
								className={`text-sm leading-6 ${errorAlert && !confirmed ? "border-danger-600 aria-checked:border-primary data-checked:border-danger-600" : ""}`}
								title={t("confirmation_passenger_details")}
								aria-invalid={errorAlert && !confirmed}
							/>
						</div>
						<FieldError
							errors={
								errorAlert && !confirmed
									? [{ message: t("confirmation_checkbox_error") }]
									: undefined
							}
						/>
					</Field>
				</section>

				{/* Booking footer */}
				<BookingFooter amountValue={confirmedTotalAmount} onProceed={onProceedToCustomerInfo} />
			</main>
		</div>
	);
}
