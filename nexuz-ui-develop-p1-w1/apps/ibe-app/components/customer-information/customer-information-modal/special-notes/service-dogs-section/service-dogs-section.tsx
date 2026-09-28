/**
 * File: service-dogs-section.tsx
 * Description: Service Dogs section component for passengers traveling with service dogs.
 * It captures service dog details, cage information, and travel requirements while applying route-specific validation and guidance.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import { Field, FieldError, FieldHeader, FieldLabel } from "@repo/ui/components/field";
import { FieldCheckboxField, FieldDimensionInput } from "@repo/ui/components/field-inputs";
import { InputField } from "@repo/ui/components/input-field";
import { RadioGroup, RadioGroupBorderedItem } from "@repo/ui/components/radio-group";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
	SERVICE_DOG_CAGE_DIMENSION_FIELDS,
	SERVICE_DOG_CLEAR_ERRORS_FIELDS,
	ZIPAIR_BASE_URL,
} from "@/modules/utils/constants/customer-information/constants";
import { isAnyUSRoute } from "@/modules/utils/helpers/common/country-utils/country-utils";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	getFieldErrors,
	getRoutesFromFlightSelection,
	handleFieldOnChange,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import {
	CAGE_DIMENSION_FIELDS,
	CAGE_DIMENSION_STATIC_PROPS,
	getCageDimensionHandlers,
} from "@/modules/utils/helpers/customer-information/service-dogs-utils/service-dogs-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import { SIZE_ERROR_MSG } from "@/modules/utils/validations/customer-information/service-dog-information/service-dog-information";
import { useAppSelector } from "@/store/hooks";
import { selectFlightSearchRequest } from "@/store/slices/flight-selection/flight-selection.slice";
/**
 * Service Dogs section in customer information modal: service dog type, breed, weight, cage presence, and cage dimensions.
 */

export function ServiceDogsSection() {
	const {
		register,
		control,
		trigger,
		setValue,
		clearErrors,
		getValues,
		formState: { errors },
	} = useFormContext<PassengerInformation>();

	const t = useTranslations("customer_information_page");
	const locale = useLocale();
	// Watches whether the passenger is traveling with a service dog.
	const accompaniedByServiceDog = useWatch({ control, name: "accompaniedByServiceDog" });
	// Watches whether a cage/crate will be provided for the service dog.
	const serviceDogCagePresence = useWatch({ control, name: "serviceDogCagePresence" });
	// Watches the selected type/category of service dog.
	const serviceDogType = useWatch({ control, name: "serviceDogType" });
	// Derive whether the itinerary includes any US route (arrival or departure)
	const flightRouteDetails = useAppSelector(selectFlightSearchRequest);
	const segments = flightRouteDetails ? getRoutesFromFlightSelection(flightRouteDetails) : [];
	const isUSRouteActive = isAnyUSRoute(segments);

	// Psychiatric service dogs and alert dogs must always travel with a cage
	const requiresCage =
		serviceDogType === "psychiatric-service-dog" || serviceDogType === "alert-dog";

	useEffect(() => {
		if (!accompaniedByServiceDog) {
			clearErrors(SERVICE_DOG_CLEAR_ERRORS_FIELDS);
		}
	}, [accompaniedByServiceDog, clearErrors]);

	useEffect(() => {
		if (requiresCage && serviceDogCagePresence === "without-cage") {
			setValue("serviceDogCagePresence", "with-cage", { shouldValidate: true });
		}
	}, [requiresCage, serviceDogCagePresence, setValue]);

	useEffect(() => {
		if (serviceDogCagePresence === "without-cage") {
			clearErrors(SERVICE_DOG_CAGE_DIMENSION_FIELDS);
		}
	}, [clearErrors, serviceDogCagePresence]);

	// Strip min/max from register return (FieldDimensionInput expects number | undefined)
	const { min: _dw1, max: _dw2, ...serviceDogWeightReg } = register("serviceDogWeight");
	const { min: _ch1, max: _ch2, ...cageHeightReg } = register("serviceDogCageHeight");
	const { min: _cw1, max: _cw2, ...cageWidthReg } = register("serviceDogCageWidth");
	const { min: _cd1, max: _cd2, ...cageDepthReg } = register("serviceDogCageDepth");
	const { min: _cwt1, max: _cwt2, ...cageWeightReg } = register("serviceDogCageWeight");
	// Checks if any cage dimension field has the size validation error.
	const isSizeErrorActive = () =>
		errors.serviceDogCageHeight?.message === SIZE_ERROR_MSG ||
		errors.serviceDogCageWidth?.message === SIZE_ERROR_MSG ||
		errors.serviceDogCageDepth?.message === SIZE_ERROR_MSG;
	// Validates all cage dimension fields when all values are present; otherwise validates only the updated field.
	const triggerCageDimensions = (field: (typeof CAGE_DIMENSION_FIELDS)[number]) => {
		const h = getValues("serviceDogCageHeight");
		const w = getValues("serviceDogCageWidth");
		const d = getValues("serviceDogCageDepth");
		if (h && w && d) {
			trigger(CAGE_DIMENSION_FIELDS);
		} else {
			trigger(field);
		}
	};

	return (
		<div className="mt-8 flex flex-col gap-6 md:mt-4">
			<h3 className="font-bold text-lg text-primary-700 leading-7">{t("section_service_dogs")}</h3>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="font-medium text-brand-japan-black text-sm leading-6">
						{t("label_assistance_dogs")}
					</span>
					<Badge variant="secondary" className="text-base-800">
						{t("badge_optional")}
					</Badge>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="col-span-1">
						<Controller
							name="accompaniedByServiceDog"
							control={control}
							render={({ field }) => (
								<FieldCheckboxField
									id="service-dogs"
									name="service-dogs"
									checked={field.value}
									onCheckedChange={field.onChange}
									title={t("label_accompanied_by_service_dog")}
								/>
							)}
						/>
					</div>
				</div>
			</div>

			{accompaniedByServiceDog && (
				<Wrapper
					bg="gray-2"
					padding="default"
					border="default"
					className="service-dog-expand flex flex-col gap-6 rounded-lg border-gray-200"
				>
					{/* Dog type */}
					<Controller
						name="serviceDogType"
						control={control}
						render={({ field }) => (
							<Field>
								<FieldHeader>
									<FieldLabel id="service-dog-type-label">{t("label_service_dog_type")}</FieldLabel>
									<Badge variant="destructive">{t("badge_required")}</Badge>
								</FieldHeader>
								<RadioGroup
									className="grid grid-cols-1 gap-2 sm:grid-cols-3"
									value={field.value}
									onValueChange={field.onChange}
									aria-labelledby="service-dog-type-label"
								>
									<RadioGroupBorderedItem
										value="guide-dog"
										label={t("service_dog_type_guide")}
										aria-invalid={!!errors.serviceDogType}
									/>
									<RadioGroupBorderedItem
										value="assistance-dog"
										label={t("service_dog_type_assistance")}
										aria-invalid={!!errors.serviceDogType}
									/>
									<RadioGroupBorderedItem
										value="hearing-dog"
										label={t("service_dog_type_hearing")}
										aria-invalid={!!errors.serviceDogType}
									/>
									<RadioGroupBorderedItem
										value="psychiatric-service-dog"
										label={t("service_dog_type_psychiatric")}
										disabled={!isUSRouteActive}
										aria-invalid={isUSRouteActive && !!errors.serviceDogType}
									/>
									<RadioGroupBorderedItem
										value="alert-dog"
										label={t("service_dog_type_alert")}
										disabled={!isUSRouteActive}
										aria-invalid={isUSRouteActive && !!errors.serviceDogType}
									/>
								</RadioGroup>
								<FieldError errors={getFieldErrors(errors.serviceDogType)} />
								{!isUSRouteActive && (
									<Wrapper bg="gray-1" padding="default" border="none" className="rounded-lg">
										{t("service_dog_us_route_notice")}
									</Wrapper>
								)}
							</Field>
						)}
					/>

					{/* Dog breed */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="col-span-1">
							<InputField
								id="dog-breed"
								label={t("label_dog_breed")}
								labelHtmlFor="dog-breed"
								title={t("title_uppercase_letters_only")}
								badge={{ variant: "destructive", text: t("badge_required") }}
								errors={getFieldErrors(errors.serviceDogBreed)}
								{...register("serviceDogBreed", {
									setValueAs: (v: string) => v.toUpperCase(),
									onBlur: () => trigger("serviceDogBreed"),
								})}
								onChange={(val) => {
									const value = convertToUppercase(val.target.value);
									handleFieldOnChange("serviceDogBreed", value, setValue, !!errors.serviceDogBreed);
								}}
								aria-invalid={!!errors.serviceDogBreed}
							/>
						</div>
					</div>
					{/* Dog weight */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="col-span-1">
							<FieldDimensionInput
								id="dog-weight"
								label={t("label_dog_weight")}
								title={t("title_numeric_characters_only")}
								required
								unit="kg"
								min={1}
								defaultValue={0}
								placeholder="0"
								errors={getFieldErrors(errors.serviceDogWeight)}
								aria-invalid={!!errors.serviceDogWeight}
								{...serviceDogWeightReg}
								onBlur={() => trigger("serviceDogWeight")}
								onChange={(e) => {
									serviceDogWeightReg.onChange(e);
									handleFieldOnChange(
										"serviceDogWeight",
										e.target.value,
										setValue,
										!!errors.serviceDogWeight
									);
								}}
							/>
						</div>
					</div>

					{/* Cage presence */}
					<Controller
						name="serviceDogCagePresence"
						control={control}
						render={({ field }) => (
							<Field>
								<FieldHeader>
									<FieldLabel id="cage-presence-label">{t("label_cage_presence")}</FieldLabel>
									<Badge variant="destructive">{t("badge_required")}</Badge>
								</FieldHeader>
								<RadioGroup
									className="grid grid-cols-2 gap-2"
									value={field.value}
									onValueChange={field.onChange}
									aria-labelledby="cage-presence-label"
								>
									<RadioGroupBorderedItem
										value="with-cage"
										label={t("label_with_cage")}
										aria-invalid={!!errors.serviceDogCagePresence}
									/>
									<RadioGroupBorderedItem
										value="without-cage"
										label={t("label_without_cage")}
										disabled={requiresCage}
										aria-invalid={!requiresCage && !!errors.serviceDogCagePresence}
									/>
								</RadioGroup>
								{requiresCage && (
									<p className="text-base-900 text-sm leading-6">
										{t("title_service_dog_cage_required")}
									</p>
								)}
								<FieldError errors={getFieldErrors(errors.serviceDogCagePresence)} />
							</Field>
						)}
					/>

					{/* Cage Size — shown only when With Cage selected */}
					{serviceDogCagePresence === "with-cage" && (
						<div className="cage-size-section flex flex-col gap-4">
							<h4 className="font-normal text-base text-brand-japan-black leading-6">
								{t("section_cage_size")}
							</h4>

							<div className="grid grid-cols-2 gap-4">
								<FieldDimensionInput
									id="cage-height"
									label={t("label_height")}
									title={t("title_numeric_characters_only")}
									{...CAGE_DIMENSION_STATIC_PROPS}
									aria-invalid={!!errors.serviceDogCageHeight}
									errors={getFieldErrors(errors.serviceDogCageHeight)}
									{...cageHeightReg}
									{...getCageDimensionHandlers({
										fieldName: "serviceDogCageHeight",
										fieldReg: cageHeightReg,
										setValue,
										trigger,
										errors,
										isSizeErrorActive,
										triggerCageDimensions,
									})}
								/>

								<FieldDimensionInput
									id="cage-width"
									label={t("label_width")}
									title={t("title_numeric_characters_only")}
									{...CAGE_DIMENSION_STATIC_PROPS}
									errors={getFieldErrors(errors.serviceDogCageWidth)}
									aria-invalid={!!errors.serviceDogCageWidth}
									{...cageWidthReg}
									{...getCageDimensionHandlers({
										fieldName: "serviceDogCageWidth",
										fieldReg: cageWidthReg,
										setValue,
										trigger,
										errors,
										isSizeErrorActive,
										triggerCageDimensions,
									})}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FieldDimensionInput
									id="cage-depth"
									label={t("label_depth")}
									title={t("title_numeric_characters_only")}
									{...CAGE_DIMENSION_STATIC_PROPS}
									errors={getFieldErrors(errors.serviceDogCageDepth)}
									aria-invalid={!!errors.serviceDogCageDepth}
									{...cageDepthReg}
									{...getCageDimensionHandlers({
										fieldName: "serviceDogCageDepth",
										fieldReg: cageDepthReg,
										setValue,
										trigger,
										errors,
										isSizeErrorActive,
										triggerCageDimensions,
									})}
								/>

								<FieldDimensionInput
									id="cage-weight"
									label={t("label_weight")}
									title={t("title_numeric_characters_only")}
									required
									unit="kg"
									min={1}
									max={32}
									defaultValue={0}
									placeholder="0"
									errors={getFieldErrors(errors.serviceDogCageWeight)}
									aria-invalid={!!errors.serviceDogCageWeight}
									{...cageWeightReg}
									onBlur={() => trigger("serviceDogCageWeight")}
									onChange={(e) => {
										cageWeightReg.onChange(e);
										handleFieldOnChange(
											"serviceDogCageWeight",
											e.target.value,
											setValue,
											!!errors.serviceDogCageWeight
										);
									}}
								/>
							</div>
						</div>
					)}

					{/* Important notes */}
					<Wrapper bg="gray-1" border="none" className="rounded-lg p-4 md:p-4">
						<ul className="service-dog-notes flex flex-col gap-2 pl-4">
							<li className="list-disc text-brand-japan-black text-xs leading-5">
								{t("service_dog_note_1")}
							</li>
							<li className="list-disc text-brand-japan-black text-xs leading-5">
								{t("service_dog_note_2_prefix")}{" "}
								<a
									href="https://www.zipair.net/service/boarding/support/U.S.%20Department%20of%20Transportation%20Service%20Animal%20Air%20Transportation%20Form.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_2_us_dot")}
								</a>{" "}
								{t("service_dog_note_2_middle")}{" "}
								<a
									href="https://www.zipair.net/service/boarding/support/ServiceDogConsentForm.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_2_consent_form")}
								</a>{" "}
								{t("service_dog_note_2_suffix")}
							</li>
							<li className="list-disc text-brand-japan-black text-xs leading-5">
								{t("service_dog_note_3_prefix")}{" "}
								<a
									href="https://www.zipair.net/service/boarding/support/U.S.%20Department%20of%20Transportation%20Service%20Animal%20Air%20Transportation%20Form.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_3_us_dot")}
								</a>
								,{" "}
								<a
									href="https://www.zipair.net/service/boarding/support/U.S.%20Department%20of%20Transportation%20Service%20Animal%20Relief%20Attestation%20Form.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_3_excretion")}
								</a>{" "}
								{t("service_dog_note_3_us_route")}{" "}
								<a
									href="https://www.zipair.net/service/boarding/support/ServiceDogConsentForm.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_3_consent_form")}
								</a>{" "}
								{t("service_dog_note_3_canada_route")}{" "}
								<a
									href={`${ZIPAIR_BASE_URL}/${locale}/help#contact`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_3_contact_center")}
								</a>{" "}
								{t("service_dog_note_3_suffix")}
							</li>
							<li className="list-disc text-brand-japan-black text-xs leading-5">
								{t("service_dog_note_4_prefix")}{" "}
								<a
									href="https://www.cdc.gov/importation/dogs/index.html?CDC_AA_refVal=https://www.cdc.gov/importation/dogs/enter-the-us.html"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("service_dog_note_4_cdc")}
								</a>
								{t("service_dog_note_4_suffix")}
							</li>
						</ul>
					</Wrapper>
				</Wrapper>
			)}
		</div>
	);
}
