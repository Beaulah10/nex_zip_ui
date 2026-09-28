/**
 * File: total-amount-display.tsx
 * Description: Total Amount Display component used in the transport service flow.
 * It renders a formatted total amount with an optional label and supports
 * custom styling for both the amount and label elements.
 */
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { TotalAmountDisplayProps } from "@/types/customize/transport-service/transport-service.types";

/**
 * Displays the formatted total amount for the transport-service dialog footer.
 */
function TotalAmountDisplay({
	amount,
	amountClassName,
	label,
	labelClassName,
}: TotalAmountDisplayProps) {
	const t = useTranslations("common");
	return (
		<div className="flex w-full justify-end md:w-auto">
			{label && (
				<span className={cn("font-medium text-sm leading-6", labelClassName)}>{label}</span>
			)}
			<div className="total-amount flex items-end gap-2">
				<span className="text-brand-japan-black text-sm leading-6">
					{t("booking_footer_amount")}
				</span>
				<span
					className={cn(
						"font-bold text-4xl leading-9",
						amount > 0 ? "text-primary-700" : "text-base-400",
						amountClassName
					)}
				>
					{formatPrice(amount)}
				</span>
			</div>
		</div>
	);
}

export { TotalAmountDisplay };
