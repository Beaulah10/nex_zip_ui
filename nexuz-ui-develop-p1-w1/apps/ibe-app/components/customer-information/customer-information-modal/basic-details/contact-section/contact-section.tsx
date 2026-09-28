/**
 * File: contact-section.tsx
 * Description: Contact Information section component for capturing passenger phone number, email address, and emergency contact details.
 * It also supports copying contact information from the primary passenger when applicable.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldHeader, FieldLabel, FieldTitle } from "@repo/ui/components/field";
import { FieldPhoneField } from "@repo/ui/components/field-inputs";
import { Input } from "@repo/ui/components/input";
import { InputField } from "@repo/ui/components/input-field";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
	Controller,
	type FieldErrors,
	type FieldError as RHFFieldError,
	useFormContext,
} from "react-hook-form";
import { usePrimaryPassenger } from "@/modules/hooks/common/primary-passenger/primary-passenger";
import { usePhoneOptions } from "@/modules/utils/helpers/common/extension-code-utils/extension-code-utils";
import {
	DEFAULT_PHONE_EXTENSION,
	getFieldErrors,
	handleFieldOnChange,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

/**
 * Contact section in customer information modal: phone number, email address, emergency contact details.
 */
export function ContactSection({
	isUsRoute,
	isPrimary,
}: Readonly<{ isUsRoute: boolean; isPrimary: boolean }>) {
	const {
		register,
		setValue,
		getValues,
		control,
		trigger,
		formState: { errors, touchedFields },
	} = useFormContext<PassengerInformation>();

	const t = useTranslations("customer_information_page");
	const { primaryPassenger } = usePrimaryPassenger();
	// Get contact information from the primary passenger if available
	const contact = primaryPassenger?.contactInformation;
	const emergencyContact = primaryPassenger?.emergencyContact;
	const contactDetails = useMemo(
		() =>
			Object.entries(contact || {})
				.filter(([_, value]) => value && value.trim() !== "")
				.map(([key]) => key),
		[contact]
	);

	// Get phone country options for the phone number and emergency contact fields from country.helper.ts
	const phoneCountryOptions = usePhoneOptions();
	const phoneCodeOptions = useMemo(
		() =>
			phoneCountryOptions.map((country) => ({
				code: country.code, //unique country code(lc,ca....)
				dialCode: country.dialCode,
				country: country.name,
			})),
		[phoneCountryOptions]
	);

	// Helper function to get phone number and extension errors from react-hook-form's FieldErrors
	const getPhoneErrors = (
		formErrors: FieldErrors<PassengerInformation>,
		extensionKey: keyof PassengerInformation,
		numberKey: keyof PassengerInformation
	): { message: string }[] | undefined => {
		const extErr = formErrors[extensionKey] as RHFFieldError | undefined;
		const numErr = formErrors[numberKey] as RHFFieldError | undefined;
		const errorList: { message: string }[] = [];

		if (extErr && numErr) {
			errorList.push({ message: extErr.message ?? "" }, { message: numErr.message ?? "" });
		} else if (extErr) {
			errorList.push({ message: extErr.message ?? "" });
		} else if (numErr) {
			errorList.push({ message: numErr.message ?? "" });
		}

		return errorList.length === 0 ? undefined : errorList;
	};

	// Function to copy contact information from the primary passenger to the current passenger's form fields
	function handleCopyFromPrimaryPassenger() {
		if (!primaryPassenger) return;
		setValue("phoneNumber", contact?.phoneNumber ?? "", {
			shouldValidate: true,
		});

		setValue(
			"phoneExtension",
			phoneCodeOptions.find((o) => o.dialCode === contact?.countryCode)?.code ??
				DEFAULT_PHONE_EXTENSION,
			{
				shouldValidate: true,
			}
		);

		if (isUsRoute) {
			setValue("emergencyNumber", emergencyContact?.phoneNumber ?? "", {
				shouldValidate: true,
			});

			setValue(
				"emergencyExtension",
				phoneCodeOptions.find((o) => o.dialCode === emergencyContact?.countryCode)?.code ??
					DEFAULT_PHONE_EXTENSION,
				{
					shouldValidate: true,
				}
			);
		}

		setValue("email", contact?.email ?? "", {
			shouldValidate: true,
		});

		setValue("emailConfirmation", contact?.email ?? "", {
			shouldValidate: true,
		});
	}

	const shouldValidateEmailConfirmation = () => {
		const emailConfirmationInput = document.getElementById(
			"email-confirm"
		) as HTMLInputElement | null;
		const emailConfirmationValue =
			emailConfirmationInput?.value ?? getValues("emailConfirmation") ?? "";

		return touchedFields.emailConfirmation || emailConfirmationValue.trim() !== "";
	};

	const shouldValidateEmergencyContact = () => {
		const emergencyNumberValue = getValues("emergencyNumber") ?? "";

		return !!(
			touchedFields.emergencyNumber ||
			touchedFields.emergencyExtension ||
			emergencyNumberValue.trim() !== ""
		);
	};

	return (
		<div className="contact-section mt-8 flex flex-col gap-6 md:mt-4">
			<h3 className="font-bold text-lg text-primary-700 leading-7">
				{t("section_contact_information")}
			</h3>

			{contactDetails.length > 0 && !isPrimary && (
				<div className="flex w-89 flex-col items-start">
					<Button variant="primary" outline size="xl" onClick={handleCopyFromPrimaryPassenger}>
						{t("button_copy_primary_passenger")}
					</Button>
				</div>
			)}

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Controller
					name="phoneNumber"
					control={control}
					render={({ field: phoneField }) => (
						<Controller
							name="phoneExtension"
							control={control}
							render={({ field: extField }) => (
								<FieldPhoneField
									label={t("label_phone_number")}
									title={t("title_half_width_digits")}
									required
									extensions={phoneCodeOptions}
									selectedExtension={extField.value}
									onExtensionChange={(val) => {
										extField.onChange(val);
										trigger(["phoneExtension", "phoneNumber"]);
										if (isUsRoute && shouldValidateEmergencyContact()) {
											trigger(["emergencyNumber", "emergencyExtension"]);
										}
									}}
									value={phoneField.value}
									onChange={(val) => {
										handleFieldOnChange(
											"phoneNumber",
											val.target.value,
											setValue,
											!!errors.phoneNumber
										);
										errors.phoneExtension && trigger("phoneExtension");
										if (
											isUsRoute &&
											shouldValidateEmergencyContact() &&
											(errors.emergencyNumber || errors.emergencyExtension)
										) {
											trigger(["emergencyNumber", "emergencyExtension"]);
										}
									}}
									onBlur={() => {
										trigger(["phoneExtension", "phoneNumber"]);
										if (isUsRoute && shouldValidateEmergencyContact()) {
											trigger(["emergencyNumber", "emergencyExtension"]);
										}
									}}
									aria-invalid={!!errors.phoneNumber || !!errors.phoneExtension}
									errors={getPhoneErrors(errors, "phoneExtension", "phoneNumber")}
								/>
							)}
						/>
					)}
				/>

				{isUsRoute && (
					<Controller
						name="emergencyNumber"
						control={control}
						render={({ field: phoneField }) => (
							<Controller
								name="emergencyExtension"
								control={control}
								render={({ field: extField }) => (
									<FieldPhoneField
										label={t("label_emergency_contact")}
										title={t("title_half_width_digits")}
										required
										extensions={phoneCodeOptions}
										selectedExtension={extField.value}
										onExtensionChange={(val) => {
											extField.onChange(val);
											extField.onBlur();
											trigger(["emergencyNumber", "emergencyExtension"]);
										}}
										value={phoneField.value}
										onChange={(val) => {
											const emergencyNumberValue = val.target.value;
											const shouldValidateEmergencyNumber =
												!!touchedFields.emergencyNumber || emergencyNumberValue.trim() !== "";

											handleFieldOnChange(
												"emergencyNumber",
												emergencyNumberValue,
												setValue,
												shouldValidateEmergencyNumber && !!errors.emergencyNumber
											);
											if (shouldValidateEmergencyNumber && errors.emergencyExtension) {
												trigger("emergencyExtension");
											}
										}}
										onBlur={() => {
											phoneField.onBlur();
											trigger(["emergencyNumber", "emergencyExtension"]);
										}}
										aria-invalid={!!errors.emergencyNumber || !!errors.emergencyExtension}
										errors={getPhoneErrors(errors, "emergencyExtension", "emergencyNumber")}
									/>
								)}
							/>
						)}
					/>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<InputField
						id="email"
						label={t("label_email")}
						labelHtmlFor="email"
						title={t("title_half_width_alphanumeric")}
						type="email"
						placeholder={t("placeholder_email")}
						badge={{ variant: "destructive", text: t("required_badge") }}
						aria-required="true"
						aria-invalid={!!errors.email}
						aria-describedby="email-help"
						errors={getFieldErrors(errors.email)}
						{...register("email", {
							onBlur: () => {
								trigger("email");
								if (shouldValidateEmailConfirmation()) {
									trigger("emailConfirmation");
								}
							},
						})}
						onChange={(event) => {
							const value = event.target.value;
							handleFieldOnChange("email", value, setValue, !!errors.email);
							if (shouldValidateEmailConfirmation()) {
								trigger("emailConfirmation");
							}
						}}
					/>

					<p id="email-help" className="mt-2 text-base-700 text-sm leading-6">
						{t("email_helper_text")}
					</p>
				</div>

				<Field>
					<div className="sm:hidden">
						<FieldHeader>
							<FieldLabel htmlFor="email-confirm">{t("label_email_confirmation")}</FieldLabel>
							<Badge variant="destructive">{t("required_badge")}</Badge>
						</FieldHeader>
						<FieldTitle>{t("title_half_width_alphanumeric")}</FieldTitle>
					</div>
					<div className="hidden w-full items-center gap-2 sm:flex">
						<FieldLabel htmlFor="email-confirm">{t("label_email_confirmation")}</FieldLabel>
						<FieldTitle className="whitespace-nowrap">
							{t("title_half_width_alphanumeric")}
						</FieldTitle>
						<Badge variant="destructive">{t("required_badge")}</Badge>
					</div>
					<Input
						id="email-confirm"
						type="email"
						placeholder={t("placeholder_email_confirmation")}
						aria-required="true"
						aria-invalid={!!errors.emailConfirmation}
						{...register("emailConfirmation", {
							onBlur: () => trigger("emailConfirmation"),
						})}
						onPaste={(event) => {
							event.preventDefault();
						}}
						onChange={(event) => {
							const value = event.target.value;
							handleFieldOnChange("emailConfirmation", value, setValue, !!errors.emailConfirmation);
						}}
					/>
					<FieldError errors={getFieldErrors(errors.emailConfirmation)} />
				</Field>
			</div>
		</div>
	);
}
