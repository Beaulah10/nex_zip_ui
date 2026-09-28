/**
 * File: personal-information.tsx
 * Description: Personal Information component that captures passenger name, gender, date of birth, nationality, and country of residence details.
 * It also handles infant-specific body weight and height selections with related warning or contact messages.
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ComboboxEmpty, ComboboxItem } from "@repo/ui/components/combobox";
import { Field, FieldError, FieldHeader, FieldLabel } from "@repo/ui/components/field";
import { FieldCombobox, FieldRadioGroup } from "@repo/ui/components/field-inputs";
import { InputField } from "@repo/ui/components/input-field";
import { RadioGroupBorderedItem } from "@repo/ui/components/radio-group";
import { useLocale, useTranslations } from "next-intl";
import {
	Controller,
	type FieldError as RHFieldError,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { useFieldGroupValidation } from "@/modules/hooks/customer-information/date-field-group-validation";
import { useDateField } from "@/modules/hooks/customer-information/use-date-field";
import {
	BODY_HEIGHT_OPTIONS,
	BODY_WEIGHT_OPTIONS,
	GENDER_OPTIONS,
	getMonthLabel,
	MONTHS_VALUE,
	PAST_YEARS,
	ZIPAIR_BASE_URL,
} from "@/modules/utils/constants/customer-information/constants";
import { useCountryOptions } from "@/modules/utils/helpers/common/nationality-utils/nationality-utils";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	getFieldErrors,
	handleFieldOnChange,
	isFieldDateInvalid,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import type { Passenger } from "@/types/customer-information/customer-information.types";

/**
 * Personal Information section in customer information modal: name, gender, date of birth, nationality, country of residence, body weight and body height.
 */
export function PersonalInformation({
	passenger,
	isUsRoute,
}: {
	readonly passenger: Passenger;
	readonly isUsRoute: boolean;
}) {
	const {
		register,
		control,
		trigger,
		getValues,
		setValue,
		formState: { errors },
	} = useFormContext<PassengerInformation>();
	const dobGroupValidation = useFieldGroupValidation<PassengerInformation>("dateOfBirth", trigger);
	const {
		validDays: validDobDays,
		handleYearChange: handleDobYearChange,
		handleMonthChange: handleDobMonthChange,
		handleDayChange: handleDobDayChange,
	} = useDateField({
		fieldName: "dateOfBirth",
		control,
		errors,
		trigger,
		getValues,
		setValue,
	});
	const t = useTranslations("customer_information_page");
	const locale = useLocale();
	// Get the current value of bodyWeight to conditionally display the infant contact alert
	const bodyWeight = useWatch({ control, name: "bodyWeight" });
	// Get country options for the nationality and country of residence fields from country.helper.ts
	const countryOptions = useCountryOptions();
	const nationalityLabelMap = new Map(
		countryOptions.map((country) => [country.alpha3 ?? "", country.name])
	);
	const nationalityValues = [...nationalityLabelMap.keys()];
	return (
		<>
			{/* ── Name Fields — 3 columns ── */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
				<InputField
					id="last-name"
					label={t("label_last_name")}
					labelHtmlFor="last-name"
					title="Half-width alphabet"
					badge={{ variant: "destructive", text: t("badge_required") }}
					aria-required="true"
					aria-invalid={!!errors.lastName}
					errors={getFieldErrors(errors.lastName)}
					{...register("lastName", {
						onBlur: () => trigger("lastName"),
					})}
					onChange={(val) => {
						const value = convertToUppercase(val.target.value);
						handleFieldOnChange("lastName", value, setValue, !!errors.lastName);
					}}
				/>

				<InputField
					id="first-name"
					label={t("label_first_name")}
					labelHtmlFor="first-name"
					title="Half-width alphabet"
					badge={{ variant: "destructive", text: t("badge_required") }}
					aria-required="true"
					aria-invalid={!!errors.firstName}
					errors={getFieldErrors(errors.firstName)}
					{...register("firstName", {
						onBlur: () => trigger("firstName"),
					})}
					onChange={(val) => {
						const value = convertToUppercase(val.target.value);
						handleFieldOnChange("firstName", value, setValue, !!errors.firstName);
					}}
				/>

				<div>
					<InputField
						id="middle-name"
						label={t("label_middle_name")}
						labelHtmlFor="middle-name"
						title="Half-width alphabet"
						badge={{ variant: "secondary", text: t("badge_optional") }}
						aria-invalid={!!errors.middleName}
						aria-describedby="middle-name-help"
						errors={getFieldErrors(errors.middleName)}
						{...register("middleName", {
							onBlur: () => trigger("middleName"),
						})}
						onChange={(val) => {
							const value = convertToUppercase(val.target.value);
							handleFieldOnChange("middleName", value, setValue, !!errors.middleName);
						}}
					/>
					<p id="middle-name-help" className="mt-2 text-base-700 leading-6">
						{t("helper_middle_name")}
					</p>
				</div>
			</div>

			{/* ── Gender + Date of Birth — 2 columns ── */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
				<Controller
					name="gender"
					control={control}
					render={({ field }) => (
						<FieldRadioGroup
							label={t("label_gender")}
							required
							data-field-name="gender"
							className="flex flex-row gap-2"
							value={field.value}
							onValueChange={field.onChange}
							aria-invalid={!!errors.gender}
							aria-label={t("label_gender")}
							errors={getFieldErrors(errors.gender)}
						>
							{GENDER_OPTIONS.map((option) => (
								<RadioGroupBorderedItem
									key={option.value}
									value={option.value}
									label={t(option.label)}
									aria-invalid={!!errors.gender}
									className="flex-1"
								/>
							))}
						</FieldRadioGroup>
					)}
				/>

				<Field>
					<FieldHeader>
						<FieldLabel id="dob-label">{t("label_date_of_birth")}</FieldLabel>
						<Badge variant="destructive">{t("badge_required")}</Badge>
					</FieldHeader>
					<div className="grid grid-cols-3 gap-2" {...dobGroupValidation}>
						<Controller
							name="dateOfBirth.year"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										handleDobYearChange(val, field.onChange);
									}}
									items={[...PAST_YEARS].reverse()}
									listInitialScrollPosition="end"
									inputId="date-of-birth-year"
									inputAriaLabel={t("date_of_birth_year_aria_label")}
									placeholder={t("placeholder_year")}
									showClear={false}
									invalid={isFieldDateInvalid("dateOfBirth", errors, getValues, "year")}
									inputAriaRequired="true"
									inputAriaDescribedBy="dob-error"
									inputOnBlur={() => {
										field.onBlur();
									}}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(year: string) => (
										<ComboboxItem key={year} value={year}>
											{year}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
						<Controller
							name="dateOfBirth.month"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										handleDobMonthChange(val, field.onChange);
									}}
									items={MONTHS_VALUE}
									itemToStringLabel={(val) => getMonthLabel(val as string)}
									inputId="date-of-birth-month"
									inputAriaLabel={t("date_of_birth_month_aria_label")}
									placeholder={t("placeholder_month")}
									showClear={false}
									invalid={isFieldDateInvalid("dateOfBirth", errors, getValues, "month")}
									inputAriaRequired="true"
									inputAriaDescribedBy="dob-error"
									inputOnBlur={() => {
										field.onBlur();
									}}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(month: string) => (
										<ComboboxItem key={month} value={month}>
											{getMonthLabel(month)}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
						<Controller
							name="dateOfBirth.day"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										handleDobDayChange(val, field.onChange);
									}}
									items={validDobDays}
									inputId="date-of-birth-day"
									inputAriaLabel={t("date_of_birth_day_aria_label")}
									placeholder={t("placeholder_day")}
									showClear={false}
									invalid={isFieldDateInvalid("dateOfBirth", errors, getValues, "day")}
									inputAriaRequired="true"
									inputAriaDescribedBy="dob-error"
									inputOnBlur={() => {
										field.onBlur();
									}}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(day: string) => (
										<ComboboxItem key={day} value={day}>
											{day}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
					</div>
					<FieldError id="dob-error" errors={getFieldErrors(errors.dateOfBirth as RHFieldError)} />
				</Field>
			</div>

			{/* ── Nationality + Country — 2 columns ── */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
				<Field>
					<FieldHeader>
						<FieldLabel htmlFor="nationality">{t("label_nationality_region")}</FieldLabel>
						<Badge variant="destructive">{t("badge_required")}</Badge>
					</FieldHeader>
					<Controller
						name="nationality"
						control={control}
						render={({ field }) => (
							<FieldCombobox
								noField
								value={field.value}
								data-field-name="nationality"
								onValueChange={(val) => {
									field.onChange(val);
									if (errors.nationality) {
										trigger("nationality");
									}
								}}
								items={nationalityValues}
								itemToStringLabel={(val) =>
									nationalityLabelMap.get(val as string) ?? (val as string)
								}
								inputId="nationality"
								placeholder={t("placeholder_select")}
								showClear={false}
								inputAriaRequired="true"
								invalid={!!errors.nationality}
								inputAriaDescribedBy={errors.nationality ? "nationality-error" : undefined}
								inputOnBlur={() => {
									field.onBlur();
									trigger("nationality");
								}}
								emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
							>
								{(alpha3: string) => (
									<ComboboxItem key={alpha3} value={alpha3}>
										{nationalityLabelMap.get(alpha3) ?? alpha3}
									</ComboboxItem>
								)}
							</FieldCombobox>
						)}
					/>
					<FieldError id="nationality-error" errors={getFieldErrors(errors.nationality)} />
				</Field>

				{isUsRoute && (
					<Field>
						<FieldHeader>
							<FieldLabel htmlFor="country-of-residence">
								{t("label_country_of_residence")}
							</FieldLabel>
							<Badge variant="destructive">{t("badge_required")}</Badge>
						</FieldHeader>
						<Controller
							name="countryOfResidence"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										field.onChange(val ?? "");
										if (errors.countryOfResidence) {
											trigger("countryOfResidence");
										}
									}}
									items={nationalityValues}
									itemToStringLabel={(val) =>
										nationalityLabelMap.get(val as string) ?? (val as string)
									}
									inputId="country-of-residence"
									placeholder={t("placeholder_select")}
									showClear={false}
									inputAriaRequired="true"
									invalid={!!errors.countryOfResidence}
									inputAriaDescribedBy={
										errors.countryOfResidence ? "country-of-residence-error" : undefined
									}
									inputOnBlur={() => {
										field.onBlur();
										trigger("countryOfResidence");
									}}
									contentSide="bottom"
									contentAlign="start"
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(alpha3: string) => (
										<ComboboxItem key={alpha3} value={alpha3}>
											{nationalityLabelMap.get(alpha3) ?? alpha3}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
						<FieldError
							id="country-of-residence-error"
							errors={getFieldErrors(errors.countryOfResidence)}
						/>
					</Field>
				)}
			</div>
			{passenger.passengerTypeCode === "infant" && (
				<>
					{/* Body weight for infants */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-1">
						<Controller
							name="bodyWeight"
							control={control}
							render={({ field }) => (
								<FieldRadioGroup
									label={t("label_body_weight")}
									required
									className="flex flex-col gap-2 md:flex-row"
									value={field.value}
									aria-invalid={!!errors.bodyWeight || bodyWeight === "Less than 9kg"}
									onValueChange={(val) => {
										field.onChange(val);
										if (errors.bodyWeight) {
											trigger("bodyWeight");
										}
									}}
									onBlur={() => {
										field.onBlur();
										trigger("bodyWeight");
									}}
									errors={getFieldErrors(errors.bodyWeight)}
								>
									{BODY_WEIGHT_OPTIONS.map((option) => (
										<RadioGroupBorderedItem
											key={option.value}
											value={option.value}
											label={t(option.label)}
											className="flex-1 md:h-17"
											aria-invalid={!!errors.bodyWeight}
										/>
									))}
								</FieldRadioGroup>
							)}
						/>
					</div>
					{/* Global input error alert — shown only after a failed submit attempt */}
					{bodyWeight === "Less than 9kg" && (
						<Alert variant="error">
							<AlertTitle>{t("infant_contact_title")}</AlertTitle>
							<AlertDescription className="[&_a]:no-underline">
								{t("infant_contact_message")}
								<div className="mt-2 flex justify-end">
									<Button asChild variant={"secondary"} outline>
										<a
											href={`${ZIPAIR_BASE_URL}/${locale}/help#contact`}
											target="_blank"
											rel="noopener noreferrer"
										>
											{t("button_contact_us")}
										</a>
									</Button>
								</div>
							</AlertDescription>
						</Alert>
					)}
					{bodyWeight === "18kg or more" && (
						<Alert variant="warning">
							<AlertDescription>{t("infant_warning_message")}</AlertDescription>
						</Alert>
					)}
					{/* Body height for infants */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-1">
						<Controller
							name="bodyHeight"
							control={control}
							render={({ field }) => (
								<FieldRadioGroup
									label={t("label_body_height")}
									required
									className="flex flex-col gap-2 md:flex-row"
									value={field.value}
									aria-invalid={!!errors.bodyHeight}
									onValueChange={field.onChange}
									errors={getFieldErrors(errors.bodyHeight)}
								>
									{BODY_HEIGHT_OPTIONS.map((option) => (
										<RadioGroupBorderedItem
											key={option.value}
											value={option.value}
											label={t(option.label)}
											className="flex-1"
											aria-invalid={!!errors.bodyHeight}
										/>
									))}
								</FieldRadioGroup>
							)}
						/>
					</div>
				</>
			)}
		</>
	);
}
