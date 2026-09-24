/**
 * File: passport-section.tsx
 * Description: Passport Information section component for capturing passport number and expiry date details.
 * It also supports passport scanning on mobile devices to automatically populate passenger passport information.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";

import { ComboboxEmpty, ComboboxItem } from "@repo/ui/components/combobox";
import { Field, FieldError, FieldHeader, FieldLabel, FieldTitle } from "@repo/ui/components/field";
import { FieldCombobox } from "@repo/ui/components/field-inputs";
import { Input } from "@repo/ui/components/input";
import { useTranslations } from "next-intl";
import { Controller, type FieldError as RHFieldError, useFormContext } from "react-hook-form";
import { PassportScanButton } from "@/components/customer-information/customer-information-modal/basic-details/passport-scan/passport-scan";
import { useFieldGroupValidation } from "@/modules/hooks/customer-information/date-field-group-validation";
import { useDateField } from "@/modules/hooks/customer-information/use-date-field";
import {
	FUTURE_YEARS,
	getMonthLabel,
	MONTHS_VALUE,
} from "@/modules/utils/constants/customer-information/constants";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	getFieldErrors,
	handleFieldOnChange,
	isFieldDateInvalid,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

/**
 * Passport section in customer information modal: passport scan button, passport number and expiry date.
 */
export function PassportSection() {
	const {
		register,
		control,
		getValues,
		trigger,
		setValue,
		formState: { errors },
	} = useFormContext<PassengerInformation>();
	const {
		validDays: validPassportExpiryDays,
		handleYearChange: handlePassportExpiryYearChange,
		handleMonthChange: handlePassportExpiryMonthChange,
		handleDayChange: handlePassportExpiryDayChange,
	} = useDateField({
		fieldName: "passportExpiryDate",
		control,
		errors,
		trigger,
		getValues,
		setValue,
	});
	const t = useTranslations("customer_information_page");
	const expiryDateGroupValidation = useFieldGroupValidation<PassengerInformation>(
		"passportExpiryDate",
		trigger
	);

	return (
		<div className="passport-section mt-8 flex flex-col gap-2 md:mt-4 md:gap-6">
			<h3 className="font-bold text-lg text-primary-700 leading-7">
				{t("section_passport_information")}
			</h3>
			<div className="flex flex-col gap-2 md:hidden">
				<p className="text-base-700 text-sm leading-6">{t("passport_scan_description")}</p>
				<PassportScanButton />
			</div>
			<div className="mt-4 grid grid-cols-1 gap-6 md:mt-0 md:grid-cols-2 md:gap-4">
				<Field>
					<div className="sm:hidden">
						<FieldHeader>
							<FieldLabel htmlFor="passport-number">{t("label_passport_number")}</FieldLabel>
							<Badge variant="destructive">{t("badge_required")}</Badge>
						</FieldHeader>
						<FieldTitle>{t("title_half_width_alphanumeric")}</FieldTitle>
					</div>
					<div className="hidden w-full items-center gap-2 sm:flex">
						<FieldLabel htmlFor="passport-number">{t("label_passport_number")}</FieldLabel>
						<FieldTitle className="whitespace-nowrap">
							{t("title_half_width_alphanumeric")}
						</FieldTitle>
						<Badge variant="destructive">{t("badge_required")}</Badge>
					</div>
					<Input
						id="passport-number"
						placeholder={t("placeholder_document_number")}
						aria-required="true"
						aria-invalid={!!errors.passportNumber}
						{...register("passportNumber", {
							onBlur: () => trigger("passportNumber"),
						})}
						onChange={(val) => {
							const value = convertToUppercase(val.target.value);
							handleFieldOnChange("passportNumber", value, setValue, !!errors.passportNumber);
						}}
					/>
					<FieldError errors={getFieldErrors(errors.passportNumber)} />
				</Field>

				<Field>
					<FieldHeader>
						<FieldLabel id="passport-expiry-label">{t("label_expiry_date")}</FieldLabel>
						<Badge variant="destructive">{t("badge_required")}</Badge>
					</FieldHeader>
					<div className="grid grid-cols-3 gap-2" {...expiryDateGroupValidation}>
						<Controller
							name="passportExpiryDate.year"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										handlePassportExpiryYearChange(val, field.onChange);
									}}
									items={FUTURE_YEARS}
									inputId="passport-expiry-year"
									inputAriaLabel={t("passport_expiry_year_aria_label")}
									placeholder={t("placeholder_year")}
									showClear={false}
									inputAriaRequired="true"
									invalid={isFieldDateInvalid("passportExpiryDate", errors, getValues, "year")}
									inputAriaDescribedBy="passport-expiry-error"
									inputOnBlur={() => {
										field.onBlur();
									}}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(y: string) => (
										<ComboboxItem key={y} value={y}>
											{y}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
						<Controller
							name="passportExpiryDate.month"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										handlePassportExpiryMonthChange(val, field.onChange);
									}}
									items={MONTHS_VALUE}
									itemToStringLabel={(val) => getMonthLabel(val as string)}
									inputId="passport-expiry-month"
									inputAriaLabel={t("passport_expiry_month_aria_label")}
									placeholder={t("placeholder_month")}
									showClear={false}
									inputAriaRequired="true"
									invalid={isFieldDateInvalid("passportExpiryDate", errors, getValues, "month")}
									inputAriaDescribedBy="passport-expiry-error"
									inputOnBlur={() => {
										field.onBlur();
									}}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(m: string) => (
										<ComboboxItem key={m} value={m}>
											{getMonthLabel(m)}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
						<Controller
							name="passportExpiryDate.day"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										handlePassportExpiryDayChange(val, field.onChange);
									}}
									items={validPassportExpiryDays}
									inputId="passport-expiry-day"
									inputAriaLabel={t("passport_expiry_day_aria_label")}
									placeholder={t("placeholder_day")}
									showClear={false}
									inputAriaRequired="true"
									invalid={isFieldDateInvalid("passportExpiryDate", errors, getValues, "day")}
									inputAriaDescribedBy="passport-expiry-error"
									inputOnBlur={() => {
										field.onBlur();
									}}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(d: string) => (
										<ComboboxItem key={d} value={d}>
											{d}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
					</div>
					<FieldError
						id="passport-expiry-error"
						errors={getFieldErrors(errors.passportExpiryDate as RHFieldError)}
					/>
				</Field>
			</div>
		</div>
	);
}
