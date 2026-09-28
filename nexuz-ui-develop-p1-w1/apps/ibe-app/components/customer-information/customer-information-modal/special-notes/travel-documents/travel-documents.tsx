/**
 * File: travel-documents-section.tsx
 * Description: Travel Documents section component for collecting visa, travel permit, and document information required for international travel.
 * It dynamically displays route-specific fields, validations, and travel document requirements based on passenger nationality and itinerary.
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { ComboboxItem } from "@repo/ui/components/combobox";
import { Field, FieldError, FieldHeader, FieldLabel, FieldTitle } from "@repo/ui/components/field";
import { FieldCheckboxField, FieldCombobox } from "@repo/ui/components/field-inputs";
import { Input } from "@repo/ui/components/input";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import {
	Controller,
	type FieldError as RHFieldError,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { useDepartureDeadline } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { useFieldGroupValidation } from "@/modules/hooks/customer-information/date-field-group-validation";
import { useDateField } from "@/modules/hooks/customer-information/use-date-field";
import {
	FUTURE_YEARS,
	getMonthLabel,
	MONTHS_VALUE,
	PURPOSE_OF_TRAVEL_B1B2_VALUE,
	PURPOSE_OF_TRAVEL_OPTIONS,
	TRAVEL_DOCUMENT_CLEAR_ERRORS_FIELDS,
	TRAVEL_DOCUMENT_EVUS_CLEAR_ERRORS_FIELDS,
	TRAVEL_DOCUMENT_KNOWN_TRAVELER_NUMBER_FIELDS,
	TRAVEL_DOCUMENT_PURPOSE_CLEAR_ERRORS_FIELDS,
	TRAVEL_DOCUMENT_REDRESS_NUMBER_FIELDS,
} from "@/modules/utils/constants/customer-information/constants";
import {
	isAnyUSRoute,
	isDestinationUS,
	isUSDeparture,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import { useCountryOptions } from "@/modules/utils/helpers/common/nationality-utils/nationality-utils";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	getFieldErrors,
	getRoutesFromFlightSelection,
	handleFieldOnChange,
	isFieldDateInvalid,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import { getDocumentTypeOptions } from "@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { useAppSelector } from "@/store/hooks";
import { selectFlightSearchRequest } from "@/store/slices/flight-selection/flight-selection.slice";

/**
 * Travel Documents section in customer information modal: travel document type, number, expiry date, issuing country, purpose of travel, and route-specific fields.
 */
export function TravelDocumentsSection() {
	const {
		register,
		control,
		trigger,
		clearErrors,
		getValues,
		formState: { errors },
		setValue,
	} = useFormContext<PassengerInformation>();
	const documentExpiryDateGroupValidation = useFieldGroupValidation<PassengerInformation>(
		"documentExpiryDate",
		trigger
	);
	const {
		validDays: validDocumentExpiryDays,
		handleYearChange: handleDocumentExpiryYearChange,
		handleMonthChange: handleDocumentExpiryMonthChange,
		handleDayChange: handleDocumentExpiryDayChange,
	} = useDateField({
		fieldName: "documentExpiryDate",
		control,
		errors,
		trigger,
		getValues,
		setValue,
	});
	const t = useTranslations("customer_information_page");
	const hasTravelDocs = useWatch({ control, name: "hasTravelDocs" });
	const purposeOfTravel = useWatch({ control, name: "purposeOfTravel" });
	useEffect(() => {
		if (!hasTravelDocs) {
			clearErrors(TRAVEL_DOCUMENT_CLEAR_ERRORS_FIELDS);
		}
	}, [clearErrors, hasTravelDocs]);
	useEffect(() => {
		if (purposeOfTravel !== PURPOSE_OF_TRAVEL_B1B2_VALUE) {
			clearErrors(TRAVEL_DOCUMENT_EVUS_CLEAR_ERRORS_FIELDS);
		}
	}, [clearErrors, purposeOfTravel]);
	const documentType = useWatch({ control, name: "documentType" });
	const nationality = useWatch({ control, name: "nationality" });
	const countryOptions = useCountryOptions();
	const issuingCountryOptions = countryOptions.map((country) => ({
		label: country.name,
		value: country.alpha3 ?? "",
	}));
	const disabledClassName =
		"cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300";

	// ── Derive route + deadline flags from flight selection ──────────────────
	const flightRouteDetails = useAppSelector(selectFlightSearchRequest);
	const flightRoutes = flightRouteDetails ? getRoutesFromFlightSelection(flightRouteDetails) : [];
	const isUS = isDestinationUS(flightRoutes);
	/** True when ANY segment (arrival or departure) involves a US airport — drives Redress Number visibility */
	const isAnyUS = isAnyUSRoute(flightRoutes);
	/** True when the first departure airport is in the US — drives Known Traveler Number visibility */
	const isUSDep = isUSDeparture(flightRoutes);
	const { is24HourDeadlineExceeded: hasDeadlinePassed } = useDepartureDeadline();

	// Document type options differ by route
	const documentTypeOptions = getDocumentTypeOptions(isUS);
	const documentTypeLabelMap = new Map<string, string>(
		documentTypeOptions.map((o) => [o.value, t(o.label)])
	);
	const documentTypeValues = documentTypeOptions.map((o) => o.value);
	const issuingCountryLabelMap = new Map<string, string>(
		issuingCountryOptions.map((o) => [o.value, o.label])
	);
	const issuingCountryValues = issuingCountryOptions.map((o) => o.value);
	const purposeOfTravelLabelMap = new Map<string, string>(
		PURPOSE_OF_TRAVEL_OPTIONS.map((o) => [o.value, t(o.label)])
	);

	const purposeOfTravelValues = PURPOSE_OF_TRAVEL_OPTIONS.map((o) => o.value);

	// Purpose of travel shown only when visa on US route
	const showPurposeOfTravel = documentType === "visa" && isUS;

	// EVUS section shown only for Chinese nationals on US routes with B1/B2 visa
	const showEvus =
		nationality === "CHN" &&
		isUS &&
		documentType === "visa" &&
		purposeOfTravel === PURPOSE_OF_TRAVEL_B1B2_VALUE;

	useEffect(() => {
		if (!showPurposeOfTravel) {
			clearErrors(TRAVEL_DOCUMENT_PURPOSE_CLEAR_ERRORS_FIELDS);
		}
	}, [clearErrors, showPurposeOfTravel]);

	useEffect(() => {
		if (!showEvus) {
			clearErrors(TRAVEL_DOCUMENT_EVUS_CLEAR_ERRORS_FIELDS);
		}
	}, [clearErrors, showEvus]);

	useEffect(() => {
		if (!isAnyUS) {
			clearErrors(TRAVEL_DOCUMENT_REDRESS_NUMBER_FIELDS);
		}
	}, [clearErrors, isAnyUS]);

	useEffect(() => {
		if (!isUSDep) {
			clearErrors(TRAVEL_DOCUMENT_KNOWN_TRAVELER_NUMBER_FIELDS);
		}
	}, [clearErrors, isUSDep]);

	// Ref for EVUS checkbox — used by the banner's "EVUS Obtained" link to scroll into view
	const evusCheckboxRef = useRef<HTMLDivElement>(null);

	const handleEvusLinkClick = () => {
		evusCheckboxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
		// Also focus the first focusable element inside the EVUS section
		const focusable = evusCheckboxRef.current?.querySelector<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		focusable?.focus();
	};

	return (
		<div id="other-travel-documents" className="mt-8 flex flex-col gap-6 md:mt-4">
			<div className="flex flex-col gap-2">
				<h3 className="font-bold text-lg text-primary-700 leading-7">
					{t("section_other_travel_documents")}
				</h3>
				<p className="text-base-700 text-sm leading-6">{t("travel_documents_description")}</p>
			</div>

			{/* Deadline exceeded warning banner */}
			{hasDeadlinePassed && (
				<Alert variant="warning">
					<AlertTitle>{t("travel_documents_deadline_title")}</AlertTitle>
					<AlertDescription>{t("travel_documents_deadline_message")}</AlertDescription>
				</Alert>
			)}

			{/* Redress Number — shown when itinerary includes ANY US route (arrival or departure) */}
			{/* Known Traveler Number — shown only when departure airport is in the US */}
			{(isAnyUS || isUSDep) && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{isAnyUS && (
						<Field>
							<div className="sm:hidden">
								<FieldHeader>
									<FieldLabel htmlFor="redress-number">{t("label_redress_number")}</FieldLabel>
									<Badge variant="secondary">{t("badge_optional")}</Badge>
								</FieldHeader>
								<FieldTitle>{t("title_half_width_alphanumeric")}</FieldTitle>
							</div>
							<div className="hidden w-full items-center gap-2 sm:flex">
								<FieldLabel htmlFor="redress-number">{t("label_redress_number")}</FieldLabel>
								<FieldTitle className="whitespace-nowrap">
									{t("title_half_width_alphanumeric")}
								</FieldTitle>
								<Badge variant="secondary">{t("badge_optional")}</Badge>
							</div>
							<Input
								id="redress-number"
								placeholder=""
								disabled={hasDeadlinePassed}
								className={hasDeadlinePassed ? disabledClassName : ""}
								aria-invalid={!!errors.redressNumber}
								{...register("redressNumber", {
									onBlur: () => trigger("redressNumber"),
								})}
								onChange={(val) => {
									handleFieldOnChange(
										"redressNumber",
										val.target.value,
										setValue,
										!!errors.redressNumber
									);
								}}
							/>
							<FieldError errors={getFieldErrors(errors.redressNumber)} />
						</Field>
					)}
					{isUSDep && (
						<Field>
							<div className="sm:hidden">
								<FieldHeader>
									<FieldLabel htmlFor="known-traveler-number">
										{t("label_known_traveler_number")}
									</FieldLabel>
									<Badge variant="secondary">{t("badge_optional")}</Badge>
								</FieldHeader>
								<FieldTitle>{t("title_half_width_alphanumeric")}</FieldTitle>
							</div>
							<div className="hidden w-full items-center gap-2 sm:flex">
								<FieldLabel htmlFor="known-traveler-number">
									{t("label_known_traveler_number")}
								</FieldLabel>
								<FieldTitle className="whitespace-nowrap">
									{t("title_half_width_alphanumeric")}
								</FieldTitle>
								<Badge variant="secondary">{t("badge_optional")}</Badge>
							</div>
							<Input
								id="known-traveler-number"
								placeholder=""
								disabled={hasDeadlinePassed}
								className={hasDeadlinePassed ? disabledClassName : ""}
								aria-invalid={!!errors.knownTravelerNumber}
								{...register("knownTravelerNumber", {
									onBlur: () => trigger("knownTravelerNumber"),
								})}
								onChange={(val) => {
									handleFieldOnChange(
										"knownTravelerNumber",
										val.target.value,
										setValue,
										!!errors.knownTravelerNumber
									);
								}}
							/>
							<FieldError errors={getFieldErrors(errors.knownTravelerNumber)} />
						</Field>
					)}
				</div>
			)}

			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="font-medium text-brand-japan-black text-sm leading-6">
						{t("label_travel_documents")}
					</span>
					<Badge variant="secondary" className="text-base-800">
						{t("badge_optional")}
					</Badge>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="col-span-1">
						<Controller
							name="hasTravelDocs"
							control={control}
							render={({ field }) => (
								<FieldCheckboxField
									id="travel-docs"
									name="travel-docs"
									checked={!!field.value}
									disabled={hasDeadlinePassed}
									onCheckedChange={(checked) => {
										field.onChange(Boolean(checked));
									}}
									title={t("checkbox_other_travel_documents")}
								/>
							)}
						/>
					</div>
				</div>
			</div>

			{hasTravelDocs && (
				<Wrapper
					bg="gray-2"
					padding="default"
					className="travel-doc-expand flex flex-col gap-6 rounded-lg border-gray-200"
				>
					{/* Type + Document Number */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field>
							<FieldHeader>
								<FieldLabel htmlFor="document-type">{t("label_document_type")}</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<Controller
								name="documentType"
								control={control}
								render={({ field }) => (
									<FieldCombobox
										noField
										value={field.value ?? ""}
										onValueChange={(val) => {
											field.onChange(val ?? "");
											if (errors.documentType) {
												trigger("documentType");
											}
										}}
										items={documentTypeValues}
										itemToStringLabel={(val) =>
											documentTypeLabelMap.get(val as string) ?? (val as string)
										}
										disabled={hasDeadlinePassed}
										inputId="document-type"
										placeholder={t("placeholder_select")}
										inputOnBlur={() => {
											field.onBlur();
											trigger("documentType");
										}}
										invalid={!!errors.documentType}
										showClear={false}
									>
										{(val: string) => (
											<ComboboxItem key={val} value={val}>
												{documentTypeLabelMap.get(val) ?? val}
											</ComboboxItem>
										)}
									</FieldCombobox>
								)}
							/>
							<FieldError errors={getFieldErrors(errors.documentType)} />
						</Field>

						<Field>
							<div className="sm:hidden">
								<FieldHeader>
									<FieldLabel htmlFor="doc-number">{t("label_document_number")}</FieldLabel>
									<Badge variant="destructive">{t("badge_required")}</Badge>
								</FieldHeader>
								<FieldTitle>{t("title_half_width_alphanumeric")}</FieldTitle>
							</div>
							<div className="hidden w-full items-center gap-2 sm:flex">
								<FieldLabel htmlFor="doc-number">{t("label_document_number")}</FieldLabel>
								<FieldTitle className="whitespace-nowrap">
									{t("title_half_width_alphanumeric")}
								</FieldTitle>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</div>
							<Input
								id="doc-number"
								placeholder={t("placeholder_document_number")}
								disabled={hasDeadlinePassed}
								aria-invalid={!!errors.documentNumber}
								{...register("documentNumber", {
									setValueAs: (value: string) => value?.toUpperCase() ?? "",
									onBlur: () => trigger("documentNumber"),
								})}
								onChange={(val) => {
									const value = convertToUppercase(val.target.value);
									handleFieldOnChange("documentNumber", value, setValue, !!errors.documentNumber);
								}}
							/>
							<FieldError errors={getFieldErrors(errors.documentNumber)} />
						</Field>
					</div>

					{/* Expiry Date + Issuing Country */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field>
							<FieldHeader>
								<FieldLabel id="document-expiry-label">
									{t("label_document_expiry_date")}
								</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<div className="grid grid-cols-3 gap-2" {...documentExpiryDateGroupValidation}>
								<Controller
									name="documentExpiryDate.day"
									control={control}
									render={({ field }) => (
										<FieldCombobox
											noField
											value={field.value ?? ""}
											onValueChange={(val) => {
												handleDocumentExpiryDayChange(val, field.onChange);
											}}
											items={validDocumentExpiryDays}
											disabled={hasDeadlinePassed}
											inputId="document-expiry-day"
											inputAriaLabel={t("document_expiry_day_aria_label")}
											placeholder={t("placeholder_dd")}
											showClear={false}
											inputOnBlur={() => {
												field.onBlur();
											}}
											invalid={isFieldDateInvalid("documentExpiryDate", errors, getValues, "day")}
											inputAriaDescribedBy="document-expiry-error"
										>
											{(day: string) => (
												<ComboboxItem key={day} value={day}>
													{day}
												</ComboboxItem>
											)}
										</FieldCombobox>
									)}
								/>
								<Controller
									name="documentExpiryDate.month"
									control={control}
									render={({ field }) => (
										<FieldCombobox
											noField
											value={field.value ?? ""}
											onValueChange={(val) => {
												handleDocumentExpiryMonthChange(val, field.onChange);
											}}
											items={MONTHS_VALUE}
											itemToStringLabel={(val) => getMonthLabel(val as string)}
											disabled={hasDeadlinePassed}
											inputId="document-expiry-month"
											inputAriaLabel={t("document_expiry_month_aria_label")}
											placeholder={t("placeholder_mm")}
											showClear={false}
											inputOnBlur={() => {
												field.onBlur();
											}}
											invalid={isFieldDateInvalid("documentExpiryDate", errors, getValues, "month")}
											inputAriaDescribedBy="document-expiry-error"
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
									name="documentExpiryDate.year"
									control={control}
									render={({ field }) => (
										<FieldCombobox
											noField
											value={field.value ?? ""}
											onValueChange={(val) => {
												handleDocumentExpiryYearChange(val, field.onChange);
											}}
											items={FUTURE_YEARS}
											disabled={hasDeadlinePassed}
											inputId="document-expiry-year"
											inputAriaLabel={t("document_expiry_year_aria_label")}
											placeholder={t("placeholder_yyyy")}
											showClear={false}
											inputOnBlur={() => {
												field.onBlur();
											}}
											invalid={isFieldDateInvalid("documentExpiryDate", errors, getValues, "year")}
											inputAriaDescribedBy="document-expiry-error"
										>
											{(year: string) => (
												<ComboboxItem key={year} value={year}>
													{year}
												</ComboboxItem>
											)}
										</FieldCombobox>
									)}
								/>
							</div>
							<FieldError
								id="document-expiry-error"
								errors={getFieldErrors(errors.documentExpiryDate as RHFieldError)}
							/>
						</Field>

						<Field>
							<FieldHeader>
								<FieldLabel htmlFor="issuing-country">
									{t("label_issuing_country_region")}
								</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<Controller
								name="issuingCountry"
								control={control}
								render={({ field }) => (
									<FieldCombobox
										noField
										value={field.value ?? ""}
										onValueChange={(val) => {
											field.onChange(val ?? "");
											if (errors.issuingCountry) {
												trigger("issuingCountry");
											}
										}}
										items={issuingCountryValues}
										itemToStringLabel={(val) =>
											issuingCountryLabelMap.get(val as string) ?? (val as string)
										}
										disabled={hasDeadlinePassed}
										inputId="issuing-country"
										placeholder={t("placeholder_select")}
										inputOnBlur={() => {
											field.onBlur();
											trigger("issuingCountry");
										}}
										invalid={!!errors.issuingCountry}
										showClear={false}
									>
										{(val: string) => (
											<ComboboxItem key={val} value={val}>
												{issuingCountryLabelMap.get(val) ?? val}
											</ComboboxItem>
										)}
									</FieldCombobox>
								)}
							/>
							<FieldError errors={getFieldErrors(errors.issuingCountry)} />
						</Field>
					</div>

					{/* Purpose of Travel — shown only when document type is Visa on US route */}
					{showPurposeOfTravel && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Field>
								<FieldHeader>
									<FieldLabel htmlFor="purpose-of-travel">
										{t("label_purpose_of_travel")}
									</FieldLabel>
									<Badge variant="destructive">{t("badge_required")}</Badge>
								</FieldHeader>
								<Controller
									name="purposeOfTravel"
									control={control}
									render={({ field }) => (
										<FieldCombobox
											noField
											value={field.value ?? ""}
											onValueChange={(val) => {
												field.onChange(val ?? "");
												if (errors.purposeOfTravel) {
													trigger("purposeOfTravel");
												}
											}}
											items={purposeOfTravelValues}
											itemToStringLabel={(val) =>
												purposeOfTravelLabelMap.get(val as string) ?? (val as string)
											}
											disabled={hasDeadlinePassed}
											inputId="purpose-of-travel"
											placeholder={t("placeholder_select")}
											inputOnBlur={() => {
												field.onBlur();
												trigger("purposeOfTravel");
											}}
											invalid={!!errors.purposeOfTravel}
											showClear={false}
										>
											{(val: string) => (
												<ComboboxItem key={val} value={val}>
													{purposeOfTravelLabelMap.get(val) ?? val}
												</ComboboxItem>
											)}
										</FieldCombobox>
									)}
								/>
								<FieldError errors={getFieldErrors(errors.purposeOfTravel)} />
							</Field>
						</div>
					)}

					{/* EVUS — shown only for Chinese nationals on US routes with B1/B2 visa */}
					{showEvus && (
						<div className="evus-section flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<span className="font-medium text-base-900 text-sm leading-6">
									{t("label_evus_required")}
								</span>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</div>

							<div ref={evusCheckboxRef}>
								<Controller
									name="evusObtained"
									control={control}
									render={({ field }) => (
										<FieldCheckboxField
											id="evus-obtained"
											name="evus-obtained"
											checked={!!field.value}
											disabled={hasDeadlinePassed}
											onCheckedChange={(checked) => field.onChange(Boolean(checked))}
											title={t("checkbox_evus_obtained")}
											aria-invalid={!!errors.evusObtained}
										/>
									)}
								/>
							</div>

							<FieldError errors={getFieldErrors(errors.evusObtained)} />
						</div>
					)}

					{/* EVUS Informational Banner — shown when EVUS section is visible */}
					{showEvus && (
						<Alert variant="warning">
							<AlertDescription>
								<ul className="evus-warning-list flex flex-col pl-4">
									<li className="list-disc">
										{t("evus_warning_1_prefix")}{" "}
										<button
											type="button"
											onClick={handleEvusLinkClick}
											className="cursor-pointer font-normal text-primary-700 underline underline-offset-2"
										>
											{`"${t("evus_warning_1_link")}"`}
										</button>{" "}
										{t("evus_warning_1_suffix")}{" "}
										<a
											href="https://www.evus.gov/"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary-700"
										>
											{`"${t("link_official_evus_website")}"`}
										</a>{" "}
										.
									</li>
									<li className="list-disc">{t("evus_warning_2")}</li>
								</ul>
							</AlertDescription>
						</Alert>
					)}
				</Wrapper>
			)}
		</div>
	);
}
