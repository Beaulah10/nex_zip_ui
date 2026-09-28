/**
 * File: meal-card.tsx
 * Description: Reusable Meal Card component used to display inflight meal options.
 * It presents meal details such as image, name, pricing, bundle information, and stock status.
 * The component supports meal selection, out-of-stock handling, optional meal selection dialog integration,
 * and configurable card click behavior for adding or selecting meals during the customization flow.
 */

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MealSelectionDialog } from "@/components/customize/inflight-meals/meal-selection-dialog/meal-selection-dialog";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { MealCardProps } from "@/types/customize/inflight-meals/inflight-meals.types";

function MealCard({
	imageSrc,
	imageAlt,
	dishName,
	bundleLabel,
	originalPrice,
	price,
	remainingQty,
	stockLabel,
	disabled,
	selected,
	onAdd,
	className,
	openOnCardClick,
	mealDialog,
}: MealCardProps) {
	const t = useTranslations("meals_service");
	const formatStockText = (label: string) =>
		label === "remaining_quantity" ? t(label, { quantity: remainingQty ?? 0 }) : t(label);
	const cardClassName = cn(
		"flex w-full flex-col items-start gap-1 rounded-lg border p-2.5",
		disabled
			? "cursor-not-allowed border-base-300 bg-base-50"
			: selected
				? "cursor-pointer border-primary-700 bg-green-50"
				: "cursor-pointer border-base-300 bg-white",
		className
	);
	const addButton = (
		<Button
			type="button"
			variant="primary"
			outline={!selected}
			size="md"
			className={cn("w-full", disabled ? "cursor-not-allowed" : "cursor-pointer")}
			disabled={disabled}
			onClick={onAdd}
		>
			{disabled ? t("out_of_stock") : selected ? t("selected") : t("add")}
		</Button>
	);

	const cardContent = (
		<>
			<div className="flex w-full flex-col items-start gap-2">
				<div className="relative aspect-212/112 w-full overflow-hidden rounded-lg bg-base-100">
					<Image
						src={imageSrc}
						alt={imageAlt ?? dishName}
						fill
						className={cn("size-full object-cover", disabled && "opacity-40")}
					/>

					{selected && (
						<span
							aria-hidden="true"
							className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary-700"
						>
							<Icon name="check" size={20} color="text-white" aria-hidden="true" />
						</span>
					)}

					{/* halal and setDrinks are commented out for now, as they are not part of the current requirements. If needed, they can be uncommented and used in the future. */}
					{/* {isHalal && (
						<Badge variant="info" className="absolute top-2 left-2">
							Halal
						</Badge>
					)} */}
					{/* {hasDrink && (
						<span className="absolute right-2 bottom-2 flex items-center justify-center rounded-full bg-white p-1">
							<Icon name="local_drink" size={18} className="text-primary-700" />
						</span>
					)} */}
				</div>

				<div className="flex w-full flex-col items-start gap-1">
					<p
						className={cn(
							"w-full truncate text-left text-sm leading-6",
							disabled ? "text-base-400" : "text-brand-japan-black"
						)}
					>
						{dishName}
					</p>

					<div
						className={cn(
							"flex w-full items-center gap-2",
							bundleLabel ? "justify-between" : "justify-end"
						)}
					>
						{bundleLabel && (
							<Badge variant="info" className={disabled ? "bg-gray-100 text-base-400" : undefined}>
								{bundleLabel}
							</Badge>
						)}
						{!disabled && (
							<div className="flex items-center gap-2">
								{originalPrice !== undefined && (
									<span className="font-bold text-base-400 text-sm leading-6 line-through">
										{formatPrice(originalPrice)}
									</span>
								)}
								<span className="font-bold text-primary-700 text-sm leading-6">
									{formatPrice(price)}
								</span>
							</div>
						)}

						{disabled && stockLabel && (
							<span className="font-medium text-base-400 text-xs leading-5">
								{formatStockText(stockLabel)}
							</span>
						)}
					</div>

					{stockLabel && !disabled && (
						<span
							className={cn(
								"font-bold text-xs leading-5",
								disabled ? "text-base-400" : "text-primary-700"
							)}
						>
							{formatStockText(stockLabel)}
						</span>
					)}
				</div>
			</div>

			{!disabled &&
				!(openOnCardClick && onAdd) &&
				(mealDialog ? <MealSelectionDialog {...mealDialog} trigger={addButton} /> : addButton)}
		</>
	);

	if (openOnCardClick && !disabled && onAdd) {
		return (
			<button type="button" onClick={onAdd} className={cardClassName}>
				{cardContent}
			</button>
		);
	}

	return <div className={cardClassName}>{cardContent}</div>;
}

export { MealCard };
