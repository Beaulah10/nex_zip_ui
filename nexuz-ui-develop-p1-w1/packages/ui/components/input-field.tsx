"use client";

import { Badge } from "@repo/ui/components/badge";
import { Field, FieldError, FieldLabel, FieldTitle } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	labelHtmlFor?: string;
	title?: string;
	errors?: Array<{ message?: string } | undefined>;
	errorId?: string;
	badge?: {
		variant?: "default" | "secondary" | "destructive" | "outline";
		text: string;
	};
	inputSize?: "sm" | "md" | "lg";
	orientation?: "vertical" | "horizontal" | "responsive";
	className?: string;
};

function InputField({
	label,
	labelHtmlFor,
	title,
	errors,
	errorId,
	badge,
	orientation = "vertical",
	inputSize,
	className,
	...inputProps
}: InputFieldProps) {
	const hasHeader = label || title || badge;

	return (
		<Field orientation={orientation}>
			{hasHeader && (
				<div className="flex w-full flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
					<div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
						{label && (
							<FieldLabel className="whitespace-nowrap" htmlFor={labelHtmlFor}>
								{label}
							</FieldLabel>
						)}
						{badge && (
							<Badge variant={badge.variant} className="xs:order-last">
								{badge.text}
							</Badge>
						)}
						{title && (
							<FieldTitle className="whitespace-nowrap text-xs leading-5">{title}</FieldTitle>
						)}
					</div>
				</div>
			)}
			<Input
				inputSize={inputSize}
				className={className}
				{...inputProps}
				aria-required={inputProps.required || undefined}
				aria-invalid={errors?.some((e) => e?.message) ? true : undefined}
			/>
			{errors?.some((e) => e?.message) && <FieldError id={errorId} errors={errors} />}
		</Field>
	);
}

export type { InputFieldProps };
export { InputField };
