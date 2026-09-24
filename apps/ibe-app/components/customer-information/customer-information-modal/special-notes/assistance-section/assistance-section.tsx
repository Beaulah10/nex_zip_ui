/**
 * File: assistance-section.tsx
 * Description: Assistance Information component for passengers requiring special assistance during travel.
 * It manages assistance requests, accessibility needs, wheelchair information, and related support requirements based on passenger selections.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import { FieldCheckboxField } from "@repo/ui/components/field-inputs";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { RequestingAssistance } from "@/components/customer-information/customer-information-modal/special-notes/assistance-section/requesting-assistance/requesting-assistance";
import {
	ASSISTANCE_CATEGORIES,
	REQUESTING_ASSISTANCE_CLEAR_ERRORS_FIELDS,
} from "@/modules/utils/constants/customer-information/constants";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

/**
 * Assistance section in customer information modal: assistance requests, accessibility needs, wheelchair information, and related support requirements.
 */
export function AssistanceSection() {
	const { control, clearErrors } = useFormContext<PassengerInformation>();

	const t = useTranslations("customer_information_page");
	// Get the current values of assistance-related fields to conditionally render sections based on passenger selections
	const requestingAssistance = useWatch({ control, name: "requestingAssistance" });

	useEffect(() => {
		if (!requestingAssistance) {
			clearErrors(REQUESTING_ASSISTANCE_CLEAR_ERRORS_FIELDS);
		}
	}, [clearErrors, requestingAssistance]);

	return (
		<div className="mt-8 flex flex-col gap-6 md:mt-4">
			<h3 className="font-bold text-lg text-primary-700 leading-7">
				{t("section_customers_needing_assistance")}
			</h3>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2 md:items-center">
					<p className="text-brand-japan-black text-sm leading-6">{t("assistance_description")}</p>
					<Badge variant="secondary" className="w-fit">
						{t("badge_optional")}
					</Badge>
				</div>
				<Wrapper
					bg="gray-2"
					padding="sm"
					border="none"
					className="assistance-list-wrapper rounded-lg border-gray-200"
				>
					<ul className="flex flex-col gap-1 pl-4">
						{ASSISTANCE_CATEGORIES.map((item) => (
							<li key={item} className="list-disc text-brand-japan-black text-sm leading-6">
								{item}
							</li>
						))}
					</ul>
				</Wrapper>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="col-span-1">
						<Controller
							name="requestingAssistance"
							control={control}
							render={({ field }) => (
								<FieldCheckboxField
									id="requesting-assistance"
									name="requesting-assistance"
									checked={field.value}
									onCheckedChange={(checked) => {
										field.onChange(checked);
									}}
									title={t("checkbox_requesting_assistance")}
								/>
							)}
						/>
					</div>
				</div>
			</div>

			{requestingAssistance && <RequestingAssistance />}
		</div>
	);
}
