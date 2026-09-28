import { Badge } from "@repo/ui/components/badge";
import { useTranslations } from "next-intl";
import { BUNDLE_CODES } from "@/modules/utils/constants/bundle/bundle.constants";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { BundleId, BundlePriceCardsProps } from "@/types/bundle/bundle.types";

/** Bundle price cards row. */
export default function BundlePriceCards({
	bundles,
	hasFlexBizData,
	onFlexBizRequest,
	triggerRef,
}: BundlePriceCardsProps) {
	const t = useTranslations("bundle_page");
	const isFlexBizBundle = (bundleId: BundleId) => BUNDLE_CODES.FLEX_BIZ.includes(bundleId);
	const gridColsClass =
		bundles.length === 3
			? "md:grid-cols-[18rem_repeat(3,minmax(0,1fr))]"
			: "md:grid-cols-[18rem_repeat(4,minmax(0,1fr))]";

	return (
		<div className={`flex w-full items-stretch gap-0.5 md:grid md:gap-0 ${gridColsClass}`}>
			<div className="hidden md:block" aria-hidden="true" />
			{bundles.map((bundle) => (
				<div key={bundle.id} className="min-w-0 flex-1 basis-0 md:px-1">
					<div className="relative flex h-full flex-col items-center justify-between gap-2 rounded-lg border border-base-300 bg-white px-1 py-2 text-center">
						{bundle.badge && (
							<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-transparent bg-primary-600 px-2.5 py-0 font-medium text-[0.625rem] text-brand-white md:text-xs">
								{bundle.badge}
							</Badge>
						)}
						<div className="flex flex-col items-center gap-1">
							<h3 className="font-bold text-brand-japan-black text-sm leading-5 md:text-lg md:leading-7">
								{bundle.name}
							</h3>
							<div className="text-[0.625rem] text-gray-700 leading-4 md:text-xs md:leading-5">
								{bundle.description}
								{isFlexBizBundle(bundle.id) && hasFlexBizData && (
									<button
										type="button"
										ref={triggerRef}
										className="cursor-pointer appearance-none bg-transparent p-0 text-primary-700 underline"
										onClick={onFlexBizRequest}
									>
										{t("dialog_trigger")}
									</button>
								)}
							</div>
						</div>
						<div className="wrap-break-word max-w-full font-bold text-lg text-primary-700 leading-7 md:text-2xl md:leading-9">
							{bundle.price === undefined ? "-" : formatPrice(bundle.price)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
