import { Alert, AlertAction, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ExpandCollapseIcon } from "@/assets/images/expand-collapse-icon";
import type { UnavailableAlertProps } from "@/types/bundle/bundle.types";

/** Route-based bundle availability banner. */
export default function UnavailableAlert({ isYvrRoute }: UnavailableAlertProps) {
	const [open, setOpen] = useState(true);
	const t = useTranslations("bundle_page");

	return (
		<div className="w-full px-4 md:px-0">
			<Alert variant="info" className="w-full">
				<div className="flex w-full items-start gap-2">
					<div className="flex flex-1 flex-col gap-1">
						<AlertTitle>{t("alerts_unavailable_banner_title")}</AlertTitle>
						{open && (
							<AlertDescription>
								{t("alerts_unavailable_banner_description", {
									maxAge: isYvrRoute ? 14 : 6,
								})}
							</AlertDescription>
						)}
					</div>
					<AlertAction>
						<Button
							variant="ghost"
							outline={false}
							size="icon-xs"
							className="size-6 rounded-full"
							aria-label={
								open ? t("aria_labels.collapse_information") : t("aria_labels.expand_information")
							}
							onClick={() => setOpen(!open)}
						>
							<ExpandCollapseIcon className={open ? "size-5" : "size-5 rotate-180"} />
						</Button>
					</AlertAction>
				</div>
			</Alert>
		</div>
	);
}
