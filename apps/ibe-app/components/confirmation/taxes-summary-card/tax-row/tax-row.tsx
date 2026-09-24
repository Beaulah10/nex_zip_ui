/**
 * File: tax-row.tsx
 * Description: Displays an individual tax or fee entry within the taxes summary breakdown,
 * including the tax amount and any associated sub-items with optional pricing details.
 * Used as part of the expandable taxes and fees section on the confirmation page.
 */
import { cn } from "@repo/ui/lib";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { TaxRowProps } from "@/types/confirmation/confirmation.types";

/** Single tax line item of the Taxes accordion, e.g. "TK: International Tourist Tax (JAPAN)". */
export function TaxRow({ title, price, subItems, className }: TaxRowProps) {
	return (
		<div
			className={cn(
				"tax-row flex flex-col gap-1 border-base-200 border-b py-2 last:border-b-0",
				className
			)}
		>
			<div className="flex min-w-0 items-start gap-2">
				<span className="min-w-0 flex-1 break-words font-bold text-base text-brand-japan-black leading-6">
					{title}
				</span>
				<span className="shrink-0 font-bold text-base text-primary-700 leading-6">
					{formatPrice(price)}
				</span>
			</div>
			{subItems.map((item) => (
				<div key={item.label} className="flex items-center gap-2">
					<span className="min-w-0 flex-1 break-words font-normal text-base text-base-700 leading-6">
						{item.label}
					</span>
					{typeof item.price === "number" && (
						<span className="shrink-0 font-normal text-base text-base-700 leading-6">
							{formatPrice(item.price)}
						</span>
					)}
				</div>
			))}
		</div>
	);
}
