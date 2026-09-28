"use client";

import { ComboboxItem } from "@repo/ui/components/combobox";
import { FieldCombobox } from "@repo/ui/components/field-inputs";
import { InputField } from "@repo/ui/components/input-field";
import { Wrapper } from "@repo/ui/components/wrapper";
import { cn } from "@repo/ui/lib";
import { Controller } from "react-hook-form";
import { PassengerNumberBadge } from "@/components/common/passenger-number-badge/passenger-number-badge";
import { convertToUppercase } from "@/modules/utils/helpers/common/string-util/string-util";
import { isValidateAdultAssignment } from "@/modules/utils/helpers/passenger-name/passenger-rules/passenger-rules";
import type { PassengerSectionProps } from "@/types/passenger/passenger.type";

export const PassengerSection = ({
	index,
	section,
	errs,
	control,
	trigger,
	adultOptions,
	associatedAdults,
	isYvrRouteValue,
	passengerNameLabels,
}: PassengerSectionProps) => {
	return (
		<Wrapper bg="gray-1" padding="default" className="pax-section flex flex-col gap-6 rounded-2xl">
			<div className="flex items-center gap-2 md:hidden">
				<PassengerNumberBadge number={section.id} />
				<div className="flex flex-col">
					<span className="font-bold text-2xl text-brand-japan-black leading-9">
						{section.mainLabel}
					</span>
					<span className="font-bold text-brand-japan-black text-sm leading-6">
						{section.ageLabel}
					</span>
				</div>
			</div>
			<div className="pax-fields-row flex items-center gap-4">
				<PassengerNumberBadge number={section.id} className="hidden md:flex" />
				<div className="flex flex-1 flex-col gap-4">
					<h3 className="hidden font-bold text-2xl text-brand-japan-black leading-9 md:block">
						{section.mainLabel} {section.ageLabel}
					</h3>
					<div className="pax-form-grid grid grid-cols-1 gap-6 md:gap-4 lg:grid-cols-3">
						{/* Last name */}
						<Controller
							name={`passengers.${index}.lastName`}
							control={control}
							render={({ field: f, fieldState }) => (
								<InputField
									{...f}
									id={`passenger-${index}-lastName`}
									required
									labelHtmlFor={`passenger-${index}-lastName`}
									label={passengerNameLabels("last_name")}
									title={passengerNameLabels("title_label")}
									badge={{
										variant: "destructive",
										text: passengerNameLabels("required_label"),
									}}
									placeholder={passengerNameLabels("placeholder_last_name")}
									aria-invalid={fieldState.invalid}
									errors={fieldState.invalid ? [errs?.lastName] : undefined}
									errorId={`passenger-${index}-lastName-error`}
									onChange={(e) => {
										f.onChange(convertToUppercase(e.target.value));
										if (fieldState.error) {
											trigger(`passengers.${index}.lastName`);
										}
									}}
								/>
							)}
						/>

						{/* First name */}
						<Controller
							name={`passengers.${index}.firstName`}
							control={control}
							render={({ field: f, fieldState }) => (
								<InputField
									{...f}
									id={`passenger-${index}-firstName`}
									required
									labelHtmlFor={`passenger-${index}-firstName`}
									label={passengerNameLabels("first_name")}
									title={passengerNameLabels("title_label")}
									badge={{
										variant: "destructive",
										text: passengerNameLabels("required_label"),
									}}
									placeholder={passengerNameLabels("placeholder_last_name")}
									aria-invalid={fieldState.invalid}
									errors={fieldState.invalid ? [errs?.firstName] : undefined}
									errorId={`passenger-${index}-firstName-error`}
									onChange={(e) => {
										f.onChange(convertToUppercase(e.target.value));
										if (fieldState.error) {
											trigger(`passengers.${index}.firstName`);
										}
									}}
								/>
							)}
						/>
						{/* Accompanying Adult */}
						{section.hasAccompanyingAdult && (
							<Controller
								name={`passengers.${index}.accompanyingAdult`}
								control={control}
								render={({ field: f, fieldState }) => (
									<FieldCombobox
										label={passengerNameLabels("accompanying_adult")}
										required
										requiredLabel={passengerNameLabels("required_label")}
										labelHtmlFor={`passenger-${index}-accompanyingAdult`}
										placeholder={passengerNameLabels("placeholder_select")}
										invalid={fieldState.invalid}
										errors={[errs?.accompanyingAdult]}
										errorId={`passenger-${index}-accompanyingAdult-error`}
										value={f.value || null}
										inputValue={
											f.value ? (adultOptions.find((o) => o.value === f.value)?.label ?? "") : ""
										}
										onValueChange={(val) => {
											if (!val) {
												f.onChange("");
												return;
											}

											const allowed = isValidateAdultAssignment({
												adultId: val as string,
												passengerType: section.passengerTypeCode,
												map: associatedAdults,
												isYvr: isYvrRouteValue,
											});
											if (allowed) f.onChange(val);
										}}
										itemToStringLabel={(val) =>
											adultOptions.find((o) => o.value === (val as string))?.label ??
											(val as string)
										}
										filter={() => true}
										inputId={`passenger-${index}-accompanyingAdult`}
										inputClassName={cn(
											"w-full [&_[data-slot=combobox-clear]_svg]:text-primary-600",
											adultOptions.every((o) => o.disabled) && "pointer-events-none"
										)}
										inputAriaLabel={passengerNameLabels("accompanying_adult")}
										showClear={!!f.value}
									>
										{adultOptions.map((opt) => {
											const isAllowed = isValidateAdultAssignment({
												adultId: opt.value,
												passengerType: section.passengerTypeCode,
												map: associatedAdults,
												isYvr: isYvrRouteValue,
											});

											// Adults whose name is not yet entered → natively disabled and  Adults at capacity → visually greyed
											return (
												<ComboboxItem
													key={opt.value}
													value={opt.value}
													disabled={opt.disabled}
													className={cn(
														"pr-4 aria-selected:text-base-900!",
														!opt.disabled && !isAllowed ? "opacity-50" : ""
													)}
												>
													{opt.label}
												</ComboboxItem>
											);
										})}
									</FieldCombobox>
								)}
							/>
						)}
					</div>
				</div>
			</div>
		</Wrapper>
	);
};
