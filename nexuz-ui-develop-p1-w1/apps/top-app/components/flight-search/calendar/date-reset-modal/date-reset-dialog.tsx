"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";

type DateResetDialogProps = {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

/**
 * Confirms whether to reset the selected dates or the passenger selection when a
 * ZIP Full-Flat date selection becomes incompatible with a newly selected child passenger.
 */
const DateResetDialog = ({ open, onConfirm, onCancel }: DateResetDialogProps) => {
	const t = useTranslations("flight_search_page");

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
			<DialogContent
				aria-describedby={undefined}
				desktopWidth={576}
				className="gap-0 rounded-lg"
				showCloseButton={false}
			>
				<DialogHeader className="border-none px-4 py-6 md:p-8" showCloseButton={false}>
					<DialogTitle className="text-secondary-700">{t("date_title")}</DialogTitle>
				</DialogHeader>

				<div className="px-4 md:px-8">
					<DialogDescription className="whitespace-pre-line text-base text-secondary-700 leading-6">
						{t("date_description")}
					</DialogDescription>
				</div>

				<DialogFooter className="flex-row justify-end gap-4 border-none bg-white px-4 py-6 md:p-8">
					<Button outline variant="primary" size="md" onClick={onCancel}>
						{t("date_reset_dialog_button_cancel")}
					</Button>
					<Button variant="primary" size="md" onClick={onConfirm}>
						{t("button_confirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DateResetDialog;
