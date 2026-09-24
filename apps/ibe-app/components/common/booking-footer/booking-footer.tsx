import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";

type BookingFooterProps = {
	amountValue: number;
	onProceed?: () => void;
	action?: ReactNode;
	disabled?: boolean;
};

export function BookingFooter({
	amountValue,
	onProceed,
	action,
	disabled = false,
}: Readonly<BookingFooterProps>) {
	const t = useTranslations("common");
	const containerClassName =
		"booking-footer flex w-full flex-col items-end bg-white md:flex-row md:items-center md:justify-end  md:gap-6 gap-4";
	const amountLabelClassName = "pb-1 text-brand-japan-black text-sm leading-6";

	return (
		<div className={containerClassName}>
			<div className="total-amount flex items-end gap-2">
				<span className={amountLabelClassName}>{t("booking_footer_amount")}</span>
				<span
					className={`font-bold text-4xl leading-13 ${amountValue > 0 ? "text-primary-700" : "text-base-400"}`}
				>
					{formatPrice(amountValue)}
				</span>
			</div>
			{action ?? (
				<Button
					variant="primary"
					size="xl"
					className="w-full rounded-lg bg-primary-600 py-3.5 md:w-auto md:min-w-64"
					disabled={disabled}
					onClick={onProceed}
				>
					{t("booking_footer_proceed")}
				</Button>
			)}
		</div>
	);
}
