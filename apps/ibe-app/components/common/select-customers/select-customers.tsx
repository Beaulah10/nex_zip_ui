/**
 * File: select-customers.tsx
 * Description: Passenger list UI components and utilities for selecting passengers across add-on services.
 * createSelectCustomerListItems builds selectCustomersListItem[] from API passenger data; infants are always priced at 0.
 * SelectCustomers renders passenger cards with a "Select all" toggle and supports disabling by category via disabledPassengerCategories.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import { Checkbox } from "@repo/ui/components/checkbox";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { InfantIcon } from "@/assets/images/infant-icon";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type {
	SelectCustomerListPassenger,
	SelectCustomersProps,
	selectCustomersListItem,
} from "@/types/select-customer/select-customer.types";

/**
 * Transforms raw passenger data into selectCustomersListItem array.
 * Infants are always priced at 0; other passengers use their API price, falling back to the price parameter.
 */
export function createSelectCustomerListItems(
	passengers: SelectCustomerListPassenger[],
	price?: number
): selectCustomersListItem[] {
	return passengers.map((p) => ({
		id: p.id,
		name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
		category: p.passengerTypeCode ?? "Passenger",
		price: p.passengerTypeCode === "infant" ? 0 : (p.price ?? price ?? 0),
		checked: false,
		disabled: false,
		passengerTypeCode: p.passengerTypeCode,
		mappedAdultId: p.mappedAdultId,
	}));
}

function SelectAllCheckbox({
	checked,
	isPartiallySelected,
	disabled,
	onChange,
}: {
	checked: boolean;
	isPartiallySelected: boolean;
	disabled?: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex shrink-0 items-center gap-2">
			<Checkbox
				checked={isPartiallySelected ? "indeterminate" : checked}
				disabled={disabled}
				onCheckedChange={(next) => onChange(next === true)}
				className={cn(
					"rounded-base border-base-300 bg-base-50 transition-none duration-0 data-[state=indeterminate]:border-none data-checked:border-none data-[state=indeterminate]:bg-primary-700 data-checked:bg-primary-700 data-[state=indeterminate]:text-white data-checked:text-white",
					disabled
						? "cursor-not-allowed disabled:opacity-100 disabled:data-[state=indeterminate]:border-base-400 disabled:data-checked:border-base-400 disabled:data-[state=indeterminate]:bg-base-300 disabled:data-checked:bg-base-300"
						: "cursor-pointer"
				)}
			/>
			<span
				className={cn(
					"whitespace-nowrap font-medium text-sm leading-6",
					disabled ? "text-base-400" : "text-brand-japan-black"
				)}
			>
				Select all
			</span>
		</div>
	);
}

function SelectCustomersRadioCheck({
	checked,
	disabled,
	hasIncluded,
}: {
	checked: boolean;
	disabled?: boolean;
	hasIncluded?: boolean;
}) {
	const radioIconDisabled = disabled && !hasIncluded;

	return (
		<span
			aria-hidden="true"
			className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", {
				"border-base-400 bg-base-300": radioIconDisabled,
				"border-base-400 bg-base-400": !radioIconDisabled && hasIncluded,
				"border-primary-700 bg-primary-700": !radioIconDisabled && !hasIncluded && checked,
				"border-base-300 bg-base-50": !radioIconDisabled && !hasIncluded && !checked,
			})}
		>
			{(checked || hasIncluded) && (!radioIconDisabled || (checked && disabled)) && (
				<Icon name="check" size={20} className="text-base-50!" />
			)}
		</span>
	);
}

function SelectPassengerCard({
	item,
	hasIncluded,
	highlighted,
	onToggle,
}: {
	item: selectCustomersListItem;
	hasIncluded?: boolean;
	highlighted?: boolean;
	onToggle: (checked: boolean) => void;
}) {
	const { name, category, price, checked, disabled, status } = item;
	const selected = checked && !disabled;
	const amountOrStatus = status ?? `${formatPrice(price)}`;
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={() => onToggle(!checked)}
			className={cn(
				"flex w-full flex-col gap-2 rounded-lg border border-base-300 p-2 text-left outline-none transition-colors",
				disabled
					? "cursor-not-allowed bg-base-50"
					: "cursor-pointer bg-white hover:border-base-400",
				"focus-visible:ring-2 focus-visible:ring-green-400",
				selected && "bg-green-50 hover:border-primary-600",
				highlighted && "border-primary-700 bg-primary-50 ring-2 ring-primary-200",
				highlighted && selected && "bg-green-50"
			)}
		>
			<div className="flex items-start gap-2">
				{category === "0 - 1 year old" ? (
					<InfantIcon className={disabled ? "text-base-400" : "text-primary-700"} />
				) : (
					<Icon
						name="person"
						size={24}
						fill={1}
						className={disabled ? "text-base-400!" : "text-primary-700"}
					/>
				)}
				<div className="flex flex-1 flex-col gap-0.5">
					<span
						className={cn(
							"flex-1 font-bold text-sm leading-6",
							disabled ? "text-base-400" : "text-brand-japan-black"
						)}
					>
						{name}
					</span>
					{hasIncluded && (
						<Badge
							variant="secondary"
							className="rounded bg-secondary-100 font-medium text-secondary-400 text-xs leading-5"
						>
							Included in set
						</Badge>
					)}
				</div>
				<SelectCustomersRadioCheck
					checked={checked}
					disabled={disabled}
					hasIncluded={hasIncluded}
				/>
			</div>
			<div className="h-px w-full bg-base-300" />
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<span
						className={cn(
							"font-medium text-xs leading-5",
							disabled ? "text-base-400" : "text-primary-700"
						)}
					>
						{category}
					</span>
				</div>
				<span
					className={cn(
						"font-medium text-base leading-6",
						disabled ? "text-base-400" : "text-brand-japan-black"
					)}
				>
					{amountOrStatus}
				</span>
			</div>
		</button>
	);
}

/**
 * Renders a list of passenger selection cards with a "Select all" checkbox.
 * Passengers matching disabledPassengerCategories are automatically disabled regardless of their individual disabled state.
 * If price prop is provided, updates all non-infant passenger prices dynamically.
 * Labels are managed internally using translations.
 */

function SelectCustomers({
	title,
	passengers: passengerLists,
	onPassengerChange,
	onSelectAllChange,
	highlightedPassengerId,
	selectAllOverride,
	className,
	disabledPassengerCategories,
	price,
	bundledPassengerIds,
}: SelectCustomersProps) {
	const selectCustomersLabels = useTranslations("common");

	// Create category labels map with translations //
	const categoryMap = useMemo(
		() => ({
			adult: selectCustomersLabels("adult_label"),
			infant: selectCustomersLabels("infant_label"),
			childA: selectCustomersLabels("childA_label"),
			childB: selectCustomersLabels("childB_label"),
			childC: selectCustomersLabels("childC_label"),
		}),
		[selectCustomersLabels]
	);

	const disabledCategorySet = useMemo(
		() => new Set(disabledPassengerCategories ?? []),
		[disabledPassengerCategories]
	);

	const bundledPassengerIdSet = useMemo(
		() => new Set(bundledPassengerIds ?? []),
		[bundledPassengerIds]
	);

	const passengers = useMemo(
		() =>
			passengerLists.map((passenger) => {
				const translatedCategory =
					categoryMap[passenger.passengerTypeCode as keyof typeof categoryMap] ??
					passenger.category;
				const isDisabledByCategory = disabledCategorySet.has(translatedCategory);
				const priceForPassenger =
					price !== undefined && passenger.passengerTypeCode !== "infant" ? price : passenger.price;
				return {
					...passenger,
					category: translatedCategory,
					disabled: (passenger.disabled ?? false) || isDisabledByCategory,
					price: priceForPassenger,
				};
			}),
		[passengerLists, disabledCategorySet, price, categoryMap]
	);

	const selectable = passengers.filter((p) => !p.disabled);
	const selectedCount = selectable.filter((p) => p.checked).length;
	const derivedAllChecked = selectable.length > 0 && selectedCount === selectable.length;
	const derivedIndeterminate = selectedCount > 0 && !derivedAllChecked;
	const allChecked = selectAllOverride?.checked ?? derivedAllChecked;
	const selectAllDisabled = selectAllOverride?.disabled ?? false;
	const isPartiallySelected = selectAllDisabled ? false : derivedIndeterminate;

	return (
		<div className={cn("flex w-full flex-col gap-4", className)}>
			<div className="flex items-center gap-4">
				<h3 className="flex-1 font-bold text-brand-japan-black text-xl leading-8">{title}</h3>
				<SelectAllCheckbox
					checked={allChecked}
					isPartiallySelected={isPartiallySelected}
					disabled={selectAllDisabled}
					onChange={(next) => onSelectAllChange?.(next)}
				/>
			</div>
			<div className="flex flex-col gap-4">
				{passengers.map((p) => (
					<SelectPassengerCard
						key={p.id}
						item={p}
						hasIncluded={bundledPassengerIdSet.has(p.id)}
						highlighted={p.id === highlightedPassengerId}
						onToggle={(checked) => onPassengerChange?.(p.id, checked)}
					/>
				))}
			</div>
		</div>
	);
}

export type { selectCustomersListItem };
export { SelectCustomers, SelectCustomersRadioCheck, SelectPassengerCard };
