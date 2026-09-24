"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";

interface CalendarModalFooterProps {
	onConfirm: () => void;
	onReset: () => void;
}

export default function CalendarModalFooter({ onConfirm, onReset }: CalendarModalFooterProps) {
	const t = useTranslations("flight_search_page");

	return (
		<DialogFooter className="flex w-full flex-col gap-4 rounded-b-2xl border-base-200 border-t bg-white p-4 text-left md:flex-row md:items-center md:justify-between md:px-6 md:py-3">
			<ul className="w-full min-w-0 list-disc pl-6 text-left md:flex-1">
				<li className="text-[12px] text-base-700 leading-5">{t("footer_notice1")}</li>
				<li className="text-[12px] text-base-700 leading-5">{t("footer_notice2")}</li>
			</ul>
			<div className="flex w-full shrink-0 items-center gap-4 md:w-auto">
				<Button className="flex-1 md:w-48" variant="primary" size="xl" outline onClick={onReset}>
					{t("footer_reset_button_label")}
				</Button>
				<Button className="flex-1 md:w-48" variant="primary" size="xl" onClick={onConfirm}>
					{t("footer_confirm_button_label")}
				</Button>
			</div>
		</DialogFooter>
	);
}
