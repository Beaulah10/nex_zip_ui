/**
 * File: pregnant-section.tsx
 * Description: Pregnancy Information component that allows passengers to provide pregnancy-related details, including gestation period.
 * It displays important travel guidelines and notices for pregnant passengers based on the information provided.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import { FieldCheckboxField, FieldDimensionInput } from "@repo/ui/components/field-inputs";
import { Separator } from "@repo/ui/components/separator";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { pregnancyNotices } from "@/modules/utils/constants/customer-information/constants";
import {
	getFieldErrors,
	handleFieldOnChange,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

/**
 * Pregnant section in customer information modal: pregnancy status, gestational weeks, and travel notices for pregnant passengers.
 */
export function PregnantSection() {
	const {
		register,
		control,
		clearErrors,
		setValue,
		trigger,
		formState: { errors },
	} = useFormContext<PassengerInformation>();

	const t = useTranslations("customer_information_page");
	// Watches whether the passenger is pregnant.
	const isPregnant = useWatch({ control, name: "isPregnant" });

	useEffect(() => {
		if (!isPregnant) {
			clearErrors("pregnancyWeeks");
		}
	}, [clearErrors, isPregnant]);

	// Strip min/max from register return (FieldDimensionInput expects number | undefined)
	const { min: _pwMin, max: _pwMax, ...pregnancyWeeksReg } = register("pregnancyWeeks");

	return (
		<div className="mt-8 flex flex-col gap-6 md:mt-4">
			<h3 className="font-bold text-lg text-primary-700 leading-7">
				{t("section_pregnant_customers")}
			</h3>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="font-medium text-brand-japan-black text-sm leading-6">
						{t("label_are_you_pregnant")}
					</span>
					<Badge variant="secondary" className="text-base-800">
						{t("badge_optional")}
					</Badge>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="col-span-1">
						<Controller
							name="isPregnant"
							control={control}
							render={({ field }) => (
								<FieldCheckboxField
									id="pregnant-yes"
									name="pregnant-yes"
									checked={field.value}
									onCheckedChange={field.onChange}
									title={t("label_yes")}
								/>
							)}
						/>
					</div>
				</div>
			</div>

			{isPregnant && (
				<Wrapper
					bg="gray-2"
					padding="default"
					className="pregnancy-expand flex flex-col gap-6 rounded-lg border-gray-200"
				>
					{/* Gestational weeks field */}
					<div className="w-full">
						<FieldDimensionInput
							id="pregnancy-weeks"
							label={t("label_pregnancy_weeks")}
							title={t("title_numeric_characters_only")}
							placeholder="0"
							required
							unit="week"
							min={1}
							max={42}
							buttonGroupClassName="w-full md:!w-1/2"
							errors={getFieldErrors(errors.pregnancyWeeks)}
							aria-invalid={!!errors.pregnancyWeeks}
							{...pregnancyWeeksReg}
							onBlur={() => trigger("pregnancyWeeks")}
							onChange={(e) => {
								pregnancyWeeksReg.onChange(e);
								handleFieldOnChange(
									"pregnancyWeeks",
									e.target.value,
									setValue,
									!!errors.pregnancyWeeks
								);
							}}
						/>
					</div>

					<Separator className="border-base-200" />

					{/* Notification list */}
					<div className="pregnancy-notice flex flex-col gap-4">
						<h4 className="font-bold text-lg text-primary-700 leading-7">
							{t("pregnancy_notice_title")}
						</h4>
						<ul className="pregnancy-notice-list flex flex-col gap-1 pl-4">
							{pregnancyNotices.map((item) => (
								<li key={item} className="list-disc text-base-700 text-sm leading-6">
									{t(item)}
								</li>
							))}
						</ul>
					</div>
				</Wrapper>
			)}
		</div>
	);
}
