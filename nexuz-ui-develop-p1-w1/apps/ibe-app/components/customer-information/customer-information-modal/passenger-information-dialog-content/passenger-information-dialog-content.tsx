/**
 * File: passenger-information-dialog-content.tsx
 * Description: Dialog content component for managing passenger information within the Customer Information workflow.
 * It displays passenger details, renders all customer information sections, handles validation errors, and provides actions to save or cancel updates.
 */

"use client";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { PassengerNumberBadge } from "@/components/common/passenger-number-badge/passenger-number-badge";
import { BasicInformation } from "@/components/customer-information/customer-information-modal/basic-details/basic-information/basic-information";
import { SpecialNotes } from "@/components/customer-information/customer-information-modal/special-notes/special-notes-section/special-notes-section";
import {
	PASSENGER_TYPE_CODE_TO_AGE_LABEL,
	RESTRICTED_REASONS,
} from "@/modules/utils/constants/customer-information/constants";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { useAppSelector } from "@/store/hooks";
import { selectHasMultiplePassengers } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import type { Passenger } from "@/types/customer-information/customer-information.types";

/* Dialog Form Content component that renders the passenger information form, and provides actions to save or cancel updates. */
export function PassengerInformationDialogContent({
	passenger,
	passengerIndex,
	isPrimary,
	isUsRoute,
	isThaiRoute,
	onClickCopyToPassenger,
}: Readonly<{
	passenger: Passenger;
	passengerIndex: number;
	isPrimary: boolean;
	isUsRoute: boolean;
	isThaiRoute: boolean;
	onClickCopyToPassenger: () => void;
}>) {
	const t = useTranslations("customer_information_page");
	// Get the age label key for the passenger type code to display the appropriate age category (Adult, Child, Infant)
	const ageLabelKey = PASSENGER_TYPE_CODE_TO_AGE_LABEL[passenger.passengerTypeCode ?? ""];
	// get form properties from react-hook-form context
	const { control } = useFormContext<PassengerInformation>();
	const { errors, isSubmitted } = useFormState({ control });
	// Watch fields needed to detect in-section blocking states
	const canManagePersonalNeeds = useWatch({ control, name: "canManagePersonalNeeds" });
	const boardingWithAccompanion = useWatch({ control, name: "boardingWithAccompanion" });
	const assistanceReasons = useWatch({ control, name: "assistanceReasons" }) ?? [];
	// Blocking: Q1=No + Q2=No shows an in-section alert; restricted reason shows a contact-required alert
	const showAccompanyingWarning =
		canManagePersonalNeeds === "no" && boardingWithAccompanion === "no";
	const hasRestrictedReason = assistanceReasons.some((r) => RESTRICTED_REASONS.includes(r));
	// Suppress the global banner when an in-section blocking alert already informs the user
	const hasErrors =
		isSubmitted &&
		Object.keys(errors).length > 0 &&
		!showAccompanyingWarning &&
		!hasRestrictedReason;
	// Get the multiple passengers flag from the Redux store to conditionally display the primary passenger badge
	const multiplePassengers = useAppSelector(selectHasMultiplePassengers);

	return (
		<DialogContent
			desktopWidth={1024}
			gap={0}
			mobileOuterSpacing={0}
			className="flex h-[90vh] flex-col overflow-hidden text-brand-japan-black"
			onOpenAutoFocus={(e) => {
				e.preventDefault();
				requestAnimationFrame(() => {
					document.getElementById("last-name")?.focus();
				});
			}}
		>
			<DialogHeader className="shrink-0 gap-2.5 border border-gray-300 md:gap-2.5">
				<DialogTitle className="text-2xl leading-9">{t("dialog_customer_information")}</DialogTitle>
			</DialogHeader>
			{/* Scrollable content area */}

			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="flex flex-col gap-6 p-4 md:p-6">
					{/* Passenger header */}
					<div className="flex items-center gap-2">
						<PassengerNumberBadge number={passengerIndex + 1} />
						<div className="flex flex-col gap-2 md:h-17">
							<div className="flex flex-col flex-wrap gap-1 md:flex-row md:items-center md:gap-2">
								<span className="font-bold text-2xl leading-9">
									{passenger.firstName} {passenger.lastName}
								</span>
								{isPrimary && multiplePassengers ? (
									<Badge className="w-fit border-transparent bg-info-200 font-medium text-info-800 leading-5">
										{t("badge_primary_passenger")}
									</Badge>
								) : null}
							</div>
							<span className="font-normal text-base text-primary-700 leading-6">
								{ageLabelKey ? t(ageLabelKey) : ""}
							</span>
						</div>
					</div>

					{/* Global input error alert — shown only after a failed submit attempt */}
					{hasErrors && (
						<Alert variant="error">
							<AlertTitle>{t("global_error_title")}</AlertTitle>
							<AlertDescription>{t("global_error_message")}</AlertDescription>
						</Alert>
					)}

					{/* Scrollable form body */}
					<Wrapper
						bg="gray-1"
						padding="default"
						className="flex flex-1 flex-col rounded-lg border-gray-200"
					>
						<div className="pax-info-form flex flex-1 flex-col gap-6">
							<BasicInformation
								passenger={passenger}
								isPrimary={isPrimary}
								isUsRoute={isUsRoute}
								isThaiRoute={isThaiRoute}
								onClickCopyToPassenger={onClickCopyToPassenger}
							/>
							<SpecialNotes />
						</div>
					</Wrapper>
				</div>
			</div>
			<DialogFooter className="flex-row gap-4 border border-gray-300 md:justify-end md:p-3">
				<DialogClose asChild>
					<Button
						variant="base"
						size="xl"
						className="flex-1 border-primary-600 bg-white py-3.5 md:min-w-48 md:flex-none"
					>
						{t("button_cancel")}
					</Button>
				</DialogClose>
				{/* Submit the form tied to this passenger — triggers Zod validation */}
				<Button
					type="submit"
					form={`pax-form-${passenger.id}`}
					variant="primary"
					size="xl"
					className="flex-1 md:min-w-48 md:flex-none"
				>
					{t("button_save_details")}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
