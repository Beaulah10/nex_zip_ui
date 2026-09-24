"use client";

import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { EXTRAS_CATEGORIES } from "@/modules/utils/constants/extras/extras";
import type { Category, FilterPillsProps } from "@/types/extras/extras.type";

export function FilterPills({ onCategoryChange, selectedCategoryIds = [] }: FilterPillsProps) {
	const t = useTranslations("extras_page");
	const allCategory = EXTRAS_CATEGORIES[0];
	const otherCategories = EXTRAS_CATEGORIES.slice(1);

	const renderCategoryButton = (category: Category, isCompact = false) => {
		const isActive = selectedCategoryIds.includes(category.id);

		return (
			<button
				key={category.id}
				type="button"
				onClick={() => onCategoryChange(category.id)}
				className={cn(
					"flex items-center rounded-full border text-base transition-colors",
					isCompact
						? "h-8 gap-1.5 px-3 py-1.5 font-medium leading-5"
						: "gap-2 px-4 py-2 font-normal leading-6",
					isActive
						? "border-primary-600 bg-green-50 font-bold text-primary-700"
						: "border-base-300 bg-white text-base-700 hover:border-base-400"
				)}
			>
				<Icon
					name={category.icon}
					size={isCompact ? 18 : 24}
					color=""
					variant="rounded"
					className={cn(isActive ? "text-primary-700" : "text-base-400")}
					fill={1}
				/>
				{category.name}
			</button>
		);
	};

	return (
		<>
			{/* mobile view */}
			<div className="flex flex-col gap-2 md:hidden">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="whitespace-nowrap font-bold text-[18px] text-primary-700 leading-7">
						{t("choose_by_category")}
					</h3>
					{allCategory ? renderCategoryButton(allCategory, true) : null}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{otherCategories.map((category) => renderCategoryButton(category, true))}
				</div>
			</div>

			{/* desktop view */}
			<div className="hidden md:flex md:items-start md:gap-4">
				<h3 className="flex h-[42px] items-center whitespace-nowrap font-bold text-[18px] text-primary-700 leading-7 md:text-lg md:leading-7">
					{t("choose_by_category")}
				</h3>
				<div className="flex flex-wrap items-center gap-2">
					{EXTRAS_CATEGORIES.map((category) => renderCategoryButton(category))}
				</div>
			</div>
		</>
	);
}
