import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import type { EmergencySupportDialogProps } from "@/types/flight-selection/flight-selection.types";

// on slection of zipfull flat cabin the modal dialog should open
export function EmergencySupportDialog({ open, onClose, onAgree }: EmergencySupportDialogProps) {
	const flightSelectionLabels = useTranslations("flight_selection_page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent
				desktopWidth={576}
				showCloseButton={false}
				className="w-[calc(100vw-32px)] gap-7 rounded-lg px-4 py-6 md:max-w-xl md:gap-9 md:p-8"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					closeButtonRef.current?.focus();
				}}
			>
				<DialogHeader showCloseButton={false} className="border-b-0 p-0 md:px-0">
					<DialogTitle className="text-2xl">
						{flightSelectionLabels("emergency_support_dialog_title")}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col md:gap-3">
					<p className="pb-7 font-medium text-base text-secondary-700 md:pb-6">
						{flightSelectionLabels("emergency_support_dialog_description")}
					</p>

					<div className="flex flex-col-reverse gap-4 md:flex-row md:justify-end">
						<Button variant="base" outline onClick={onClose} ref={closeButtonRef}>
							{flightSelectionLabels("close_button_label")}
						</Button>

						<Button variant="primary" onClick={onAgree}>
							{flightSelectionLabels("agree_and_proceed_button_label")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
