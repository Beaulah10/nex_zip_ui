/**
 * File: destination-section.tsx
 * Description: Destination Address section component for collecting passenger stay information, including hotel details and destination address.
 * It handles destination information updates, copy-to-passenger functionality, and deadline-based restrictions before departure.
 */

"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ComboboxEmpty, ComboboxItem } from "@repo/ui/components/combobox";
import { Field, FieldError, FieldHeader, FieldLabel, FieldTitle } from "@repo/ui/components/field";
import { FieldCombobox } from "@repo/ui/components/field-inputs";
import { InputField } from "@repo/ui/components/input-field";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useDepartureDeadline } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { useCountryOptions } from "@/modules/utils/helpers/common/nationality-utils/nationality-utils";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	getFieldErrors,
	handleFieldOnChange,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { useAppSelector } from "@/store/hooks";
import { selectHasMultiplePassengers } from "@/store/slices/customer-information/passenger-selector/passenger-selector";

/**
 * Destination section in customer information modal: hotel name, country of stay, postal code, city and state. */
export function DestinationSection({
	onClickCopyToPassenger,
}: {
	onClickCopyToPassenger: () => void;
}) {
	const {
		register,
		setValue,
		control,
		trigger,
		formState: { errors },
	} = useFormContext<PassengerInformation>();

	const t = useTranslations("customer_information_page");

	// Get country options for the country of stay field from country.helper.ts
	const countryOptions = useCountryOptions();
	const nationalityOptions = useMemo(
		() =>
			countryOptions.map((country) => ({
				label: country.name,
				value: country.alpha3 ?? "", // fallback empty string
			})),
		[countryOptions]
	);
	const { is24HourDeadlineExceeded: hasDeadLinePassed } = useDepartureDeadline();
	const multiplePassengers = useAppSelector(selectHasMultiplePassengers);
	//if the departure time is less than 24 hours away, then the deadline has passed -- Disable destination section and show a warning message.
	// className to disable the destination section if deadline has passed,.
	const disabledClassName =
		"cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300";

	return (
		<div className="destination-section mt-8 flex flex-col gap-6 md:mt-4">
			<h3 className="font-bold text-lg text-primary-700 leading-7">
				{t("section_destination_address")}
			</h3>
			{hasDeadLinePassed && (
				<Alert variant="warning">
					<AlertDescription>
						<p className="mb-1 font-bold">{t("destination_deadline_title")}</p>
						<p>{t("destination_deadline_message")}</p>
					</AlertDescription>
				</Alert>
			)}
			{!hasDeadLinePassed && (
				<Alert variant="info">
					<AlertDescription>
						<p className="mb-1 font-bold">{t("destination_info_title")}</p>
						<p>{t("destination_info_message")}</p>
					</AlertDescription>
				</Alert>
			)}
			<div className="grid grid-cols-1 gap-2">
				<div className="flex w-full flex-wrap items-start gap-x-2 sm:flex-row sm:items-center sm:gap-2">
					<div className="flex flex-col gap-0 md:flex-row md:gap-2">
						<FieldLabel htmlFor="hotel-name">{t("label_hotel_name")}</FieldLabel>
						<FieldTitle className="order-last basis-full sm:order-none sm:basis-auto sm:whitespace-nowrap">
							{t("title_half_width_alphanumeric")}
						</FieldTitle>
					</div>
					<Badge variant="secondary">{t("badge_optional")}</Badge>
				</div>
				<InputField
					id="hotel-name"
					disabled={hasDeadLinePassed}
					placeholder={t("placeholder_hotel_name")}
					className={hasDeadLinePassed ? disabledClassName : ""}
					aria-invalid={!!errors.hotelName}
					errors={getFieldErrors(errors.hotelName)}
					{...register("hotelName", {
						disabled: hasDeadLinePassed,
						onBlur: () => trigger("hotelName"),
					})}
					onChange={(val) => {
						const value = convertToUppercase(val.target.value);
						handleFieldOnChange("hotelName", value, setValue, !!errors.hotelName);
					}}
				/>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<Field>
						<FieldHeader className="flex w-full flex-wrap items-start gap-y-0 sm:flex-row sm:items-center sm:gap-2">
							<FieldLabel htmlFor="country-of-stay">{t("label_country_of_stay")}</FieldLabel>
							<FieldTitle className="order-last basis-full sm:order-none sm:basis-auto sm:whitespace-nowrap">
								{t("title_half_width_alphanumeric")}
							</FieldTitle>
							<Badge variant="secondary">{t("badge_optional")}</Badge>
						</FieldHeader>
						<Controller
							name="countryOfStay"
							control={control}
							render={({ field }) => (
								<FieldCombobox
									noField
									value={field.value}
									onValueChange={(val) => {
										field.onChange(val ?? "");
									}}
									items={nationalityOptions.map((o) => o.value)}
									itemToStringLabel={(val) =>
										nationalityOptions.find((o) => o.value === val)?.label ?? String(val)
									}
									disabled={hasDeadLinePassed}
									inputId="country-of-stay"
									placeholder={t("placeholder_selection")}
									showClear={false}
									invalid={!!errors.countryOfStay}
									emptyContent={<ComboboxEmpty>{t("combobox_no_options_found")}</ComboboxEmpty>}
								>
									{(value: string) => (
										<ComboboxItem key={value} value={value}>
											{nationalityOptions.find((o) => o.value === value)?.label ?? value}
										</ComboboxItem>
									)}
								</FieldCombobox>
							)}
						/>
						<FieldError errors={getFieldErrors(errors.countryOfStay)} />
					</Field>
				</div>

				<InputField
					id="postal-code"
					label={t("label_postal_code")}
					labelHtmlFor="postal-code"
					placeholder={t("placeholder_postal_code")}
					title={t("title_half_width_numbers")}
					disabled={hasDeadLinePassed}
					className={hasDeadLinePassed ? disabledClassName : ""}
					badge={{ variant: "secondary", text: t("badge_optional") }}
					aria-invalid={!!errors.postalCode}
					errors={getFieldErrors(errors.postalCode)}
					{...register("postalCode", {
						disabled: hasDeadLinePassed,
						onBlur: () => trigger("postalCode"),
					})}
					onChange={(val) => {
						setValue("postalCode", val.target.value, { shouldValidate: false });
						if (errors.postalCode) {
							trigger("postalCode");
						}
					}}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<InputField
					id="city"
					label={t("label_city")}
					placeholder={t("placeholder_city")}
					labelHtmlFor="city"
					title={t("title_half_width_alphanumeric")}
					badge={{ variant: "secondary", text: t("badge_optional") }}
					disabled={hasDeadLinePassed}
					className={hasDeadLinePassed ? disabledClassName : ""}
					aria-invalid={!!errors.city}
					errors={getFieldErrors(errors.city)}
					{...register("city", {
						disabled: hasDeadLinePassed,
						onBlur: () => trigger("city"),
					})}
					onChange={(val) => {
						const value = convertToUppercase(val.target.value);
						handleFieldOnChange("city", value, setValue, !!errors.city);
					}}
				/>

				<InputField
					id="state"
					label={t("label_state")}
					placeholder={t("placeholder_state")}
					labelHtmlFor="state"
					title={t("title_half_width_alphanumeric")}
					badge={{ variant: "secondary", text: t("badge_optional") }}
					disabled={hasDeadLinePassed}
					className={hasDeadLinePassed ? disabledClassName : ""}
					aria-invalid={!!errors.state}
					errors={getFieldErrors(errors.state)}
					{...register("state", {
						disabled: hasDeadLinePassed,
						onBlur: () => trigger("state"),
					})}
					onChange={(val) => {
						const value = convertToUppercase(val.target.value);
						handleFieldOnChange("state", value, setValue, !!errors.state);
					}}
				/>
			</div>
			{multiplePassengers && (
				<div className="flex w-89 flex-col items-start">
					<Button
						variant={"primary"}
						outline
						size={"xl"}
						className="bg-white"
						onClick={onClickCopyToPassenger}
						disabled={hasDeadLinePassed}
					>
						{t("button_copy_to_other_passenger")}
					</Button>
				</div>
			)}
		</div>
	);
}
