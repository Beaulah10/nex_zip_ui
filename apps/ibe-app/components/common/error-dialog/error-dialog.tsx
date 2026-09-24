/**
 * File: error-dialog.tsx
 * Description: Displays validation and service availability errors across the Customize flow.
 * Handles dialog close actions and return-to-top navigation for seat selection scenarios.
 */

"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";

export type ErrorDialogAction = "close" | "returnToTop";

type ErrorDialogProps = {
	open: boolean;
	title: string;
	onOpenChange: (open: boolean) => void;
	content: string;
	onReturnToTop: () => void;
	buttonLabel?: string;
	action?: ErrorDialogAction;
	redirectUrl?: string;
};

export const ErrorDialog = ({
	open,
	title,
	onOpenChange,
	content,
	onReturnToTop,
	buttonLabel,
	action = "returnToTop",
	redirectUrl,
}: ErrorDialogProps) => {
	const t = useTranslations("common");

	const handleButtonClick = () => {
		if (action === "close") {
			onOpenChange(false);
			return;
		}

		if (redirectUrl) {
			window.location.href = redirectUrl;
			return;
		}

		onReturnToTop();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				desktopWidth={640}
				onOpenAutoFocus={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				className="gap-0 rounded-lg border border-base-200"
			>
				<DialogHeader className="h-21 border-none px-4 py-6 md:h-25 md:p-8" showCloseButton={false}>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 px-4 py-1 md:px-8">
					{content.split("\n").map((line) => {
						const trimmedLine = line.trim();
						const key = crypto.randomUUID();

						if (!trimmedLine) {
							return <div key={key} className="h-4" />;
						}
						const isCancelledSelectionLine = /^[^*\n]+\s:\s[^*\n]+$/.test(trimmedLine);
						const isNote = trimmedLine.startsWith("*");
						return (
							<p
								key={key}
								className={
									isCancelledSelectionLine
										? "font-bold text-base text-brand-japan-black leading-8"
										: isNote
											? "w-full text-left text-base text-secondary-700 leading-6"
											: "text-base text-brand-japan-black leading-6"
								}
							>
								{trimmedLine}
							</p>
						);
					})}
				</div>

				<DialogFooter className="flex h-22 w-full flex-col gap-3 border-none bg-white px-4 py-6 md:h-26 md:flex-row md:p-8">
					<Button
						size="xl"
						className="h-10 w-full md:ml-auto md:w-38.25"
						onClick={handleButtonClick}
					>
						{buttonLabel ?? t("go_to_top_page")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
