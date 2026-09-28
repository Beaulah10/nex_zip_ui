import { useTranslations } from "next-intl";
import { BookingHeader } from "@/components/common/booking-header/booking-header";
import type { BundleSectionProps } from "@/types/bundle/bundle.types";

/** Bundle stage heading. */
export default function BundleHeading({ stage }: Readonly<BundleSectionProps>) {
	const t = useTranslations("bundle_page");
	const stageLabel = t(`stage_labels_${stage}`);
	const bundleDescriptionContent = [
		{
			id: "sports-equipment",
			content: (
				<>
					<span>{t("bundle_section_helper_sports_equipment")}</span>
					<br />
					<span className="md:inline-block md:pl-2">
						{t("bundle_section_helper_preferred_piece")}
					</span>
				</>
			),
		},
		{
			id: "service-package",
			content: t("bundle_section_helper_service_package"),
		},
	];
	return (
		<section className="bundle-section flex w-full flex-col items-start gap-4 px-4 md:px-0">
			<BookingHeader
				title={t("bundle_selection_title", { stageLabel })}
				description={bundleDescriptionContent}
			/>
		</section>
	);
}
