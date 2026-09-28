import { Alert, AlertAction, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

const AlertComponent = () => {
	const t = useTranslations("flight_search_page");

	return (
		<div>
			{/* ── Notice alert ──────────────────────────────────────── */}
			<Alert variant="info">
				<AlertTitle>{t("child_alert_heading")}</AlertTitle>
				<AlertDescription>
					<ul className="mt-1 list-disc space-y-2 pl-4">
						<li className="m-0">{t("child_alert_bullet1")}</li>
						<li className="m-0">{t("child_alert_bullet2")}</li>
						<li className="m-0">{t("child_alert_bullet3")}</li>
						<li className="m-0">{t("child_alert_bullet4")}</li>
					</ul>
				</AlertDescription>
				<AlertAction className="w-full">
					<div className="flex w-full flex-col gap-3 md:flex-row md:justify-end">
						<Link
							href="https://www.zipair.net/en/ticket/u6"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								type="button"
								outline
								variant="secondary"
								className="w-full md:w-auto"
								size="md"
							>
								{t("button_child_seat")}
							</Button>
						</Link>
						<Link
							href="https://www.zipair.net/en/help#contact"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								type="button"
								outline
								variant="secondary"
								className="w-full md:w-auto"
								size="md"
							>
								{t("button_contact_center")}
							</Button>
						</Link>
					</div>
				</AlertAction>
			</Alert>
		</div>
	);
};

export default AlertComponent;
