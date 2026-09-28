/**
 * File: precautions.tsx
 * Description: Displays booking-related precautions, purchase conditions, and onboarding notices
 * that passengers must review before completing their reservation. Includes an agreement checkbox
 * to capture user acknowledgment of the displayed terms and conditions.
 */
"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldError } from "@repo/ui/components/field";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib";
import { useId } from "react";
import type { PrecautionsProps } from "@/types/confirmation/confirmation.types";

/** Precautions section listing Purchases / Onboarding Rules notices and a final agreement checkbox. */
export function Precautions({
	title,
	subsections,
	agreeLabel,
	agreeCheckboxLabel,
	checked,
	onCheckedChange,
	showAgreementError = false,
	agreementCheckboxError,
	className,
}: PrecautionsProps) {
	const id = useId();
	const errorId = `${id}-error`;

	return (
		<div className={cn("precautions flex w-full flex-col gap-4 md:gap-6", className)}>
			<div className="flex flex-col">
				<h2 className="font-bold text-2xl text-primary-700 leading-9">{title}</h2>
				<Separator />
			</div>

			{subsections.map((subsection) => (
				<div key={subsection.title} className="flex w-full flex-col gap-4">
					<h3 className="font-bold text-lg text-primary-700 leading-7">{subsection.title}</h3>
					<ul className="precautions-list flex flex-col">
						{subsection.items.map((item) => (
							<li
								key={item.id}
								className={cn(
									"precaution-item flex items-start gap-2",
									subsection.textSize === "base" ? "text-base" : "text-sm",
									item.variant === "alert" ? "text-danger-800" : "text-brand-japan-black"
								)}
							>
								<span
									className={cn(
										"precaution-bullet mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-japan-black"
									)}
								/>
								<span className="leading-6">{item.content}</span>
							</li>
						))}
					</ul>
				</div>
			))}

			<Field>
				<div className="flex w-full flex-col gap-2 md:w-[504px]">
					<span className="text-base-900 text-sm leading-6">{agreeLabel}</span>
					<label
						htmlFor={id}
						className={cn(
							"flex h-11 cursor-pointer items-center gap-2 rounded-lg border bg-white px-4",
							showAgreementError ? "border-danger-600" : "border-base-300"
						)}
					>
						<Checkbox
							id={id}
							aria-labelledby={`${id}-label`}
							checked={checked}
							aria-invalid={showAgreementError}
							aria-describedby={showAgreementError ? errorId : undefined}
							onCheckedChange={(value) => {
								const next = value === true;
								onCheckedChange?.(next);
							}}
						/>
						<span id={`${id}-label`} className="text-base text-base-900 leading-6">
							{agreeCheckboxLabel}
						</span>
					</label>
				</div>
				<FieldError
					id={errorId}
					errors={
						showAgreementError && agreementCheckboxError
							? [{ message: agreementCheckboxError }]
							: undefined
					}
				/>
			</Field>
		</div>
	);
}
