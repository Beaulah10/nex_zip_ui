"use client";

import { useTranslations } from "next-intl";

type CalendarModalFooterProps = {
	onConfirm: () => void;
	onReset: () => void;
};

export default function CalendarModalFooter({ onConfirm, onReset }: CalendarModalFooterProps) {
	const t = useTranslations("flight_selection_page");

	return (
		<div className="flex flex-col justify-between gap-4 rounded-b-2xl border-base-200 border-t bg-white p-4 md:flex-row md:items-center md:px-6 md:py-3">
			<ul className="flex list-disc flex-col pl-6">
				<li className="flex-1 text-base-700 text-xs leading-5">{t("calendar_footer_notice1")}</li>
				<li className="flex-1 text-base-700 text-xs leading-5">{t("calendar_footer_notice2")}</li>
			</ul>
			<div className="flex shrink-0 items-center gap-4">
				<button
					type="button"
					onClick={onReset}
					className="h-13 min-w-[10.6875rem] cursor-pointer rounded-lg border border-primary-600 bg-white px-5 py-3.5 font-medium text-base text-primary-700 leading-6 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary-600 md:w-[192px]"
				>
					{t("calendar_footer_reset_button_label")}
				</button>
				<button
					type="button"
					onClick={onConfirm}
					className="h-13 min-w-[10.6875rem] cursor-pointer rounded-lg bg-primary-600 px-5 py-3.5 font-medium text-base text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-1 md:w-[192px]"
				>
					{t("calendar_footer_confirm_button_label")}
				</button>
			</div>
		</div>
	);
}
