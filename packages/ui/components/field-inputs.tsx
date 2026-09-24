"use client";

import type * as React from "react";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxList,
	useComboboxAnchor,
} from "./combobox";

import { DimensionInput, type DimensionInputProps } from "./dimension";
import { Field, FieldContent, FieldError, FieldHeader, FieldLabel, FieldTitle } from "./field";
import { type PhoneExtension, PhoneField, type PhoneFieldProps } from "./phone-field";
import { RadioGroup } from "./radio-group";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select";

/* ────────────────────────────────────────────────────────────────────────── */
/* FieldRadioGroup */
/* ────────────────────────────────────────────────────────────────────────── */

interface FieldRadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
	label?: string;
	required?: boolean;
	children?: React.ReactNode;
	errors?: Array<{ message?: string } | undefined>;
}

function FieldRadioGroup({
	label,
	required = false,
	children,
	errors,
	className,
	...props
}: FieldRadioGroupProps) {
	return (
		<Field>
			{label && (
				<FieldHeader>
					<FieldLabel>{label}</FieldLabel>
					{required && <Badge variant="destructive">Required</Badge>}
				</FieldHeader>
			)}
			<RadioGroup className={className} {...props}>
				{children}
			</RadioGroup>
			<FieldError errors={errors} />
		</Field>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* FieldSelect */
/* ────────────────────────────────────────────────────────────────────────── */

interface FieldSelectProps {
	label?: string;
	required?: boolean;
	placeholder?: string;
	selectSize?: "sm" | "md" | "lg";
	children?: React.ReactNode;
	errors?: Array<{ message?: string } | undefined>;
	invalid?: boolean;
	noField?: boolean;
}

function FieldSelect({
	label,
	required = false,
	placeholder = "Select",
	selectSize = "md",
	children,
	errors,
	invalid = false,
	noField = false,
}: FieldSelectProps) {
	const selectEl = (
		<Select>
			<SelectTrigger selectSize={selectSize} aria-invalid={invalid} className="w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>{children}</SelectContent>
		</Select>
	);

	if (noField) {
		return selectEl;
	}

	return (
		<Field>
			{label && (
				<FieldHeader>
					<FieldLabel>{label}</FieldLabel>
					{required && <Badge variant="destructive">Required</Badge>}
				</FieldHeader>
			)}
			{selectEl}
			<FieldError errors={errors} />
		</Field>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* FieldPhoneField */
/* ────────────────────────────────────────────────────────────────────────── */

interface FieldPhoneFieldProps extends Omit<PhoneFieldProps, "extensions"> {
	label?: string;
	title?: string;
	required?: boolean;
	extensions: PhoneExtension[];
	errors?: Array<{ message?: string } | undefined>;
	invalid?: boolean;
}

function FieldPhoneField({
	label,
	title,
	required = false,
	extensions,
	errors,
	invalid = false,
	...props
}: FieldPhoneFieldProps) {
	return (
		<Field>
			<FieldHeader>
				{label && <FieldLabel htmlFor={props.id}>{label}</FieldLabel>}
				{title && <FieldTitle>{title}</FieldTitle>}
				{required && <Badge variant="destructive">Required</Badge>}
			</FieldHeader>
			<PhoneField extensions={extensions} {...props} />
			<FieldError errors={errors} />
		</Field>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* FieldDimensionInput */
/* ────────────────────────────────────────────────────────────────────────── */

interface FieldDimensionInputProps extends DimensionInputProps {
	label?: string;
	title?: string;
	required?: boolean;
	errors?: Array<{ message?: string } | undefined>;
	invalid?: boolean;
}

function FieldDimensionInput({
	label,
	title,
	required = false,
	errors,
	invalid = false,
	...props
}: FieldDimensionInputProps) {
	return (
		<Field>
			<FieldHeader className="gap-1">
				{/* Desktop */}
				<div className="hidden md:flex md:items-center md:gap-2">
					{label && <FieldLabel htmlFor={props.id}>{label}</FieldLabel>}

					{title && <FieldTitle className="text-xs text-muted-foreground">{title}</FieldTitle>}

					{required && <Badge variant="destructive">Required</Badge>}
				</div>

				{/* Mobile */}
				<div className="flex flex-col md:hidden">
					<div className="flex items-center gap-2">
						{label && <FieldLabel htmlFor={props.id}>{label}</FieldLabel>}
						{required && <Badge variant="destructive">Required</Badge>}
					</div>
					{title && <FieldTitle className="text-xs text-muted-foreground">{title}</FieldTitle>}
				</div>
			</FieldHeader>
			<DimensionInput {...props} />
			<FieldError errors={errors} />
		</Field>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* FieldCheckboxField */
/* ────────────────────────────────────────────────────────────────────────── */

interface FieldCheckboxFieldProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
	label?: string;
	title?: string;
	errors?: Array<{ message?: string } | undefined>;
}

function FieldCheckboxField({ label, title, errors, ...props }: FieldCheckboxFieldProps) {
	return (
		<>
			<FieldLabel>
				<Field orientation="horizontal">
					<Checkbox {...props} />
					<FieldContent>
						{label && <FieldTitle className="text-base-900">{label}</FieldTitle>}
						{title && (
							<FieldTitle className="text-base-900 text-sm leading-6 font-medium">
								{title}
							</FieldTitle>
						)}
					</FieldContent>
				</Field>
			</FieldLabel>
			<FieldError errors={errors} />
		</>
	);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* FieldCombobox */
/* ────────────────────────────────────────────────────────────────────────── */

interface FieldComboboxProps {
	label?: string;
	required?: boolean;
	requiredLabel?: string;
	labelHtmlFor?: string;
	placeholder?: string;
	children?: Exclude<React.ComponentProps<typeof ComboboxList>["children"], undefined>;
	errors?: Array<{ message?: string } | undefined>;
	invalid?: boolean;
	errorId?: string;
	noField?: boolean;
	// Combobox root controlled props
	value?: React.ComponentProps<typeof Combobox>["value"];
	inputValue?: Exclude<React.ComponentProps<typeof Combobox>["inputValue"], undefined>;
	onValueChange?: Exclude<React.ComponentProps<typeof Combobox>["onValueChange"], undefined>;
	itemToStringLabel?: Exclude<
		React.ComponentProps<typeof Combobox>["itemToStringLabel"],
		undefined
	>;
	filter?: Exclude<React.ComponentProps<typeof Combobox>["filter"], undefined>;
	items?: Exclude<React.ComponentProps<typeof Combobox>["items"], undefined>;
	// ComboboxInput props
	inputId?: string;
	inputClassName?: string;
	inputAriaLabel?: string;
	inputAriaRequired?: Exclude<
		React.ComponentProps<typeof ComboboxInput>["aria-required"],
		undefined
	>;
	inputAriaDescribedBy?: Exclude<
		React.ComponentProps<typeof ComboboxInput>["aria-describedby"],
		undefined
	>;
	inputOnBlur?: Exclude<React.ComponentProps<typeof ComboboxInput>["onBlur"], undefined>;
	showClear?: boolean;
	emptyContent?: React.ReactNode;
	// ComboboxContent props
	contentClassName?: string;
	contentSide?: Exclude<React.ComponentProps<typeof ComboboxContent>["side"], undefined>;
	contentAlign?: Exclude<React.ComponentProps<typeof ComboboxContent>["align"], undefined>;
	contentSideOffset?: Exclude<
		React.ComponentProps<typeof ComboboxContent>["sideOffset"],
		undefined
	>;
	contentAlignOffset?: Exclude<
		React.ComponentProps<typeof ComboboxContent>["alignOffset"],
		undefined
	>;
	/**
	 * Initial combobox list scroll position.
	 * "end" is useful for past-year selections (e.g. DOB year).
	 */
	listInitialScrollPosition?: Exclude<
		React.ComponentProps<typeof ComboboxList>["initialScrollPosition"],
		undefined
	>;
}

function FieldCombobox({
	label,
	required = false,
	requiredLabel = "Required",
	labelHtmlFor,
	placeholder = "Select",
	children,
	errors,
	invalid = false,
	errorId,
	noField = false,
	value,
	inputValue,
	onValueChange,
	itemToStringLabel,
	filter,
	items,
	inputId,
	inputClassName,
	inputAriaLabel,
	inputAriaRequired,
	inputAriaDescribedBy,
	inputOnBlur,
	showClear = true,
	emptyContent,
	contentClassName,
	contentSide,
	contentAlign,
	contentSideOffset,
	contentAlignOffset,
	listInitialScrollPosition = "start",
	...comboboxProps
}: FieldComboboxProps &
	Omit<
		React.ComponentPropsWithoutRef<typeof Combobox>,
		"children" | "value" | "inputValue" | "onValueChange" | "itemToStringLabel" | "filter"
	>) {
	const anchorRef = useComboboxAnchor();

	const comboboxEl = (
		<Combobox
			{...(value !== undefined ? { value } : {})}
			{...(inputValue !== undefined ? { inputValue } : {})}
			{...(onValueChange !== undefined ? { onValueChange } : {})}
			{...(itemToStringLabel !== undefined ? { itemToStringLabel } : {})}
			{...(filter !== undefined ? { filter } : {})}
			{...(items !== undefined ? { items } : {})}
			{...comboboxProps}
		>
			<div ref={anchorRef}>
				<ComboboxInput
					id={inputId}
					showClear={showClear}
					placeholder={placeholder}
					className={inputClassName}
					aria-label={inputAriaLabel}
					disabled={comboboxProps.disabled}
					aria-required={inputAriaRequired ?? (required || undefined)}
					aria-invalid={invalid || undefined}
					aria-describedby={
						inputAriaDescribedBy ??
						(invalid && errors?.some((e) => e?.message) && errorId ? errorId : undefined)
					}
					onBlur={inputOnBlur}
				/>
			</div>
			<ComboboxContent
				anchor={anchorRef}
				className={contentClassName}
				{...(contentSide !== undefined ? { side: contentSide } : {})}
				{...(contentAlign !== undefined ? { align: contentAlign } : {})}
				{...(contentSideOffset !== undefined ? { sideOffset: contentSideOffset } : {})}
				{...(contentAlignOffset !== undefined ? { alignOffset: contentAlignOffset } : {})}
			>
				<ComboboxList initialScrollPosition={listInitialScrollPosition}>{children}</ComboboxList>
				{emptyContent}
			</ComboboxContent>
		</Combobox>
	);

	if (noField) {
		return comboboxEl;
	}

	return (
		<Field data-invalid={invalid || undefined}>
			{label && (
				<FieldHeader>
					<FieldLabel className="whitespace-nowrap" htmlFor={labelHtmlFor}>
						{label}
					</FieldLabel>
					{required && <Badge variant="destructive">{requiredLabel}</Badge>}
				</FieldHeader>
			)}
			{comboboxEl}
			{invalid && errors?.some((e) => e?.message) && <FieldError id={errorId} errors={errors} />}
		</Field>
	);
}

export {
	FieldCheckboxField,
	type FieldCheckboxFieldProps,
	FieldCombobox,
	type FieldComboboxProps,
	FieldDimensionInput,
	type FieldDimensionInputProps,
	FieldPhoneField,
	type FieldPhoneFieldProps,
	FieldRadioGroup,
	type FieldRadioGroupProps,
	FieldSelect,
	type FieldSelectProps,
};
