import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";
import type { TicketChangeOptionDialogProps } from "@/types/bundle/bundle.types";

/** Ticket change option dialog. */
export default function TicketChangeOptionDialog({
	open,
	onOpenChange,
	onConfirm,
	onRequest,
	triggerRef,
}: TicketChangeOptionDialogProps) {
	const t = useTranslations("bundle_page");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{onRequest && (
				<DialogTrigger asChild>
					<button
						type="button"
						className="cursor-pointer appearance-none bg-transparent p-0 text-primary-700 underline"
						onClick={onRequest}
					>
						{t("dialog_trigger")}
					</button>
				</DialogTrigger>
			)}
			<DialogContent
				aria-describedby={undefined}
				desktopWidth={640}
				className="gap-0 rounded-lg"
				showCloseButton={false}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					triggerRef?.current?.focus({ preventScroll: true });
				}}
			>
				<DialogHeader className="border-none px-4 py-6 md:p-8" showCloseButton={false}>
					<DialogTitle>{t("dialog_title")}</DialogTitle>
				</DialogHeader>
				<div className="px-4 md:px-8">
					<DialogDescription asChild>
						<ul className="list-disc space-y-1 pl-5 text-base text-secondary-700 leading-6">
							<li>{t("dialog_bullet_1")}</li>
							<li>{t("dialog_bullet_2")}</li>
							<li>
								<a
									href="https://www.zipair.net/en/service/package/change_option"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-700 underline underline-offset-2"
								>
									{t("dialog_learn_more")}
								</a>
							</li>
						</ul>
					</DialogDescription>
				</div>
				<DialogFooter className="gap-4 border-none bg-white px-4 py-6 md:justify-end md:p-8">
					<DialogClose asChild>
						<Button outline variant="primary" size="md" className="w-full md:w-auto">
							{t("dialog_close")}
						</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button variant="primary" size="md" className="w-full md:w-auto" onClick={onConfirm}>
							{t("dialog_confirm")}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
