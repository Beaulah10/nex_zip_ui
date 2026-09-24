/**
 * File: requesting-assistance.tsx
 * Description: Assistance requests information component for passengers requiring special assistance during travel.
 * It manages assistance requests, accessibility needs, wheelchair information, and related support requirements based on passenger selections.
 */

"use client";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Field,
	FieldContent,
	FieldError,
	FieldHeader,
	FieldLabel,
	FieldTitle,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { RadioGroup, RadioGroupBorderedItem } from "@repo/ui/components/radio-group";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { WheelChairAssitance } from "@/components/customer-information/customer-information-modal/special-notes/assistance-section/wheelchair-assistance/wheelchair-assistance";
import {
	ASSISTANCE_REASONS,
	RESTRICTED_REASONS,
	ZIPAIR_BASE_URL,
} from "@/modules/utils/constants/customer-information/constants";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	getFieldErrors,
	handleFieldOnChange,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

// RequestingAssistance component manages assistance requests, accessibility needs, wheelchair information, and related support requirements based on passenger selections.
export function RequestingAssistance() {
	const {
		register,
		control,
		setValue,
		clearErrors,
		trigger,
		formState: { errors },
	} = useFormContext<PassengerInformation>();
	const t = useTranslations("customer_information_page");
	const locale = useLocale();
	// Watches whether the passenger can independently manage their personal needs.
	const canManagePersonalNeeds = useWatch({ control, name: "canManagePersonalNeeds" });
	// Watches whether the passenger is traveling with an accompanying person.
	const boardingWithAccompanion = useWatch({ control, name: "boardingWithAccompanion" });
	// Watches the name entered for the accompanying person.
	const accompanyingPersonName = useWatch({
		control,
		name: "accompanyingPersonName",
	});
	// Watches the selected assistance requirements; defaults to an empty array.
	const assistanceReasons = useWatch({ control, name: "assistanceReasons" }) ?? [];
	// Shows the accompanying person name input when the passenger is traveling with a companion.
	const showAccompanyingNameInput = boardingWithAccompanion === "yes";
	// Shows a warning when the passenger cannot manage personal needs and has no companion.
	const showAccompanyingWarning =
		canManagePersonalNeeds === "no" && boardingWithAccompanion === "no";
	// Displays assistance reason options once prerequisite conditions are satisfied.
	const showAssistanceReasons =
		canManagePersonalNeeds &&
		!showAccompanyingWarning &&
		(boardingWithAccompanion === "no" ||
			(boardingWithAccompanion === "yes" && !!accompanyingPersonName?.trim()));
	// Checks whether any selected assistance reason belongs to the restricted reasons list.
	const hasRestrictedReason = assistanceReasons.some((r) => RESTRICTED_REASONS.includes(r));
	// Shows wheelchair-related options when wheelchair assistance is selected and no warning is displayed
	const showWheelchair = assistanceReasons.includes("wheelchair") && !showAccompanyingWarning;

	useEffect(() => {
		if (!showAccompanyingNameInput) {
			clearErrors("accompanyingPersonName");
		}

		if (!showAssistanceReasons) {
			clearErrors("assistanceReasons");
		}
	}, [clearErrors, showAccompanyingNameInput, showAssistanceReasons]);

	// Adds or removes an assistance reason and triggers validation if needed.
	const toggleReason = (value: string, checked: boolean) => {
		const current = assistanceReasons ?? [];
		const updated = checked ? [...current, value] : current.filter((r) => r !== value);
		setValue("assistanceReasons", updated, { shouldValidate: false });
		if (errors.assistanceReasons) {
			trigger("assistanceReasons");
		}
	};

	return (
		<Wrapper
			bg="gray-2"
			padding="default"
			className="assistance-expand flex flex-col gap-6 rounded-lg"
		>
			{/* ── Section 1: General questions ── */}
			<h4 className="font-bold text-lg text-primary-700 leading-7">
				{t("assistance_questions_title")}
			</h4>

			{/* Can you manage personal needs */}
			<Controller
				name="canManagePersonalNeeds"
				control={control}
				render={({ field }) => (
					<Field>
						<FieldHeader className="flex items-start justify-between gap-2">
							<FieldLabel id="can-manage-personal-needs-label">
								{t("question_manage_personal_needs")}
							</FieldLabel>
							<Badge variant="destructive">{t("badge_required")}</Badge>
						</FieldHeader>
						<RadioGroup
							className="grid grid-cols-2 gap-2 md:grid-cols-4"
							value={field.value}
							onValueChange={(val) => {
								field.onChange(val);
								if (errors.boardingWithAccompanion) {
									trigger("boardingWithAccompanion");
								}
							}}
							aria-labelledby="can-manage-personal-needs-label"
						>
							<RadioGroupBorderedItem
								value="yes"
								label={t("label_yes")}
								aria-invalid={!!errors.canManagePersonalNeeds}
							/>
							<RadioGroupBorderedItem
								value="no"
								label={t("label_no")}
								aria-invalid={!!errors.canManagePersonalNeeds}
							/>
						</RadioGroup>
						<FieldError errors={getFieldErrors(errors.canManagePersonalNeeds)} />
					</Field>
				)}
			/>

			{/* Boarding with accompanying person */}
			{canManagePersonalNeeds && (
				<Controller
					name="boardingWithAccompanion"
					control={control}
					render={({ field }) => (
						<Field>
							<FieldHeader>
								<FieldLabel id="boarding-with-companion-label">
									{t("question_boarding_with_accompanying_person")}
								</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<RadioGroup
								className="grid grid-cols-2 gap-2 md:grid-cols-4"
								value={field.value}
								onValueChange={field.onChange}
								aria-labelledby="boarding-with-companion-label"
								aria-invalid={
									showAccompanyingWarning && errors.boardingWithAccompanion !== undefined
										? true
										: undefined
								}
							>
								<RadioGroupBorderedItem
									value="yes"
									label="Yes"
									aria-invalid={!showAccompanyingWarning && !!errors.boardingWithAccompanion}
								/>
								<RadioGroupBorderedItem
									value="no"
									label="No"
									aria-invalid={!showAccompanyingWarning && !!errors.boardingWithAccompanion}
								/>
							</RadioGroup>
							{!showAccompanyingWarning && (
								<FieldError errors={getFieldErrors(errors.boardingWithAccompanion)} />
							)}
						</Field>
					)}
				/>
			)}

			{/* Accompanying person name */}
			{showAccompanyingNameInput && (
				<Field>
					<div className="sm:hidden">
						<FieldHeader>
							<FieldLabel htmlFor="accompanying-name">
								{t("label_accompanying_person_name")}
							</FieldLabel>
							<Badge variant="destructive">{t("badge_required")}</Badge>
						</FieldHeader>
						<FieldTitle>{t("title_uppercase_letters_only")}</FieldTitle>
					</div>
					<div className="hidden w-full items-center gap-2 sm:flex">
						<FieldLabel htmlFor="accompanying-name">
							{t("label_accompanying_person_name")}
						</FieldLabel>
						<FieldTitle className="whitespace-nowrap">
							{t("title_uppercase_letters_only")}
						</FieldTitle>
						<Badge variant="destructive">{t("badge_required")}</Badge>
					</div>
					<Input
						id="accompanying-name"
						placeholder={t("placeholder_accompanying_person_name")}
						aria-invalid={!!errors.accompanyingPersonName}
						{...register("accompanyingPersonName", {
							onBlur: () => trigger("accompanyingPersonName"),
						})}
						onChange={(val) => {
							const value = convertToUppercase(val.target.value);
							handleFieldOnChange(
								"accompanyingPersonName",
								value,
								setValue,
								!!errors.accompanyingPersonName
							);
						}}
					/>
					<FieldError errors={getFieldErrors(errors.accompanyingPersonName)} />
				</Field>
			)}

			{/* Accompanying warning — blocked booking */}
			{showAccompanyingWarning && (
				<Alert variant="error">
					<AlertTitle>{t("accompanying_warning_title")}</AlertTitle>
					<AlertDescription>{t("accompanying_warning_description")}</AlertDescription>
					<AlertAction>
						<Button asChild variant={"secondary"} outline>
							<a
								href={`${ZIPAIR_BASE_URL}/${locale}/help#contact`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{t("button_contact_us")}
							</a>
						</Button>
					</AlertAction>
				</Alert>
			)}

			{/* Reason for assistance */}
			{showAssistanceReasons && (
				<Field>
					<div className="sm:hidden">
						<FieldHeader>
							<FieldLabel>{t("label_assistance_reason")}</FieldLabel>
							<Badge variant="destructive">{t("badge_required")}</Badge>
						</FieldHeader>
						<FieldTitle className="text-xs">{t("multiple_selections_allowed")}</FieldTitle>
					</div>
					<div className="hidden w-full items-center gap-2 sm:flex">
						<FieldLabel>{t("label_assistance_reason")}</FieldLabel>
						<FieldTitle className="whitespace-nowrap text-xs">
							{t("multiple_selections_allowed")}
						</FieldTitle>
						<Badge variant="destructive">{t("badge_required")}</Badge>
					</div>
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
						{ASSISTANCE_REASONS.map((reason) => (
							<FieldLabel key={reason.value}>
								<Field orientation="horizontal">
									<Checkbox
										id={`reason-${reason.value}`}
										name="assistance-reason"
										checked={assistanceReasons.includes(reason.value)}
										onCheckedChange={(checked) => toggleReason(reason.value, checked === true)}
										aria-invalid={errors.assistanceReasons && !hasRestrictedReason}
									/>
									<FieldContent>
										<FieldTitle className="font-medium text-base-900 text-sm leading-6">
											{t(reason.label)}
										</FieldTitle>
									</FieldContent>
								</Field>
							</FieldLabel>
						))}
					</div>
					<FieldError
						errors={
							errors.assistanceReasons && !hasRestrictedReason
								? [{ message: (errors.assistanceReasons as { message?: string })?.message }]
								: undefined
						}
					/>
				</Field>
			)}

			{/* Contact required alert */}
			{showAssistanceReasons && hasRestrictedReason && (
				<div aria-invalid={errors.assistanceReasons !== undefined ? true : undefined}>
					<Alert variant="error">
						<AlertTitle>{t("contact_required_title")}</AlertTitle>
						<AlertDescription>{t("contact_required_description")}</AlertDescription>
						<AlertAction>
							<Button asChild variant={"secondary"} outline>
								<a
									href={`${ZIPAIR_BASE_URL}/${locale}/help#contact`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{t("button_contact_us")}
								</a>
							</Button>
						</AlertAction>
					</Alert>
				</div>
			)}

			{/* Special support alert */}
			<Alert variant="info">
				<AlertTitle>{t("special_support_title")}</AlertTitle>
				<AlertDescription>{t("special_support_description")}</AlertDescription>
				<AlertAction>
					<Button asChild variant={"secondary"} outline>
						<a
							href={`${ZIPAIR_BASE_URL}/${locale}/help#contact`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{t("button_contact_us")}
						</a>
					</Button>
				</AlertAction>
			</Alert>

			{/* ── Section 2: Wheelchair questions ── */}
			{showWheelchair && <WheelChairAssitance showWheelchair />}
		</Wrapper>
	);
}
