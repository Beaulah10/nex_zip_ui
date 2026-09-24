import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";
import { ExpandCollapseIcon } from "@/assets/images/expand-collapse-icon";
import type { BundleComparisonTableProps } from "@/types/bundle/bundle.types";

/** Bundle feature comparison matrix. */
export default function BundleComparisonTable({ bundles, features }: BundleComparisonTableProps) {
	const t = useTranslations("bundle_page");
	const [isExpanded, setIsExpanded] = useState(true);
	const renderFeatureValue = (value: ReactNode) => {
		if (typeof value === "string") {
			return <span className="text-brand-japan-black">{value}</span>;
		}

		return value;
	};

	return (
		<>
			<div className="hidden overflow-x-auto md:block">
				<Table className="min-w-190 table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-base-300">
					<colgroup>
						<col className="w-72" />
						{bundles.map((bundle) => (
							<col key={bundle.id} />
						))}
					</colgroup>
					<TableHeader>
						<TableRow className="sr-only">
							<TableHead>{t("bundle_features_feature")}</TableHead>
							{bundles.map((bundle) => (
								<TableHead key={bundle.id}>{bundle.name}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{features.map((feature, index) => {
							const isLastFeature = index === features.length - 1;

							return (
								<TableRow key={feature.label} className="hover:bg-transparent">
									<TableCell
										className={`sticky left-0 z-10 border-base-300 border-r bg-white px-6 py-3 font-bold text-sm ${isLastFeature ? "border-b-0" : "border-b"}`}
									>
										<span className="flex items-center gap-2 text-brand-japan-black">
											{typeof feature.icon === "string" ? (
												<Icon name={feature.icon} color="text-primary-700" fill={1} />
											) : (
												feature.icon
											)}
											{feature.label}
										</span>
									</TableCell>
									{bundles.map((bundle) => (
										<TableCell
											key={bundle.id}
											className={`border-base-300 border-r px-2 py-2 text-center text-sm last:border-r-0 ${isLastFeature ? "border-b-0" : "border-b"}`}
										>
											{renderFeatureValue(feature.values[bundle.id])}
										</TableCell>
									))}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
			<div className="overflow-hidden border border-base-300 md:hidden">
				<div className="flex min-h-10 items-center gap-2 border-base-300 border-b bg-base-50 p-2">
					<span className="flex-1 font-bold text-sm">{t("bundle_features_view_features")}</span>
					<Button
						variant="ghost"
						outline={false}
						size="icon-xs"
						className="size-6 rounded-full"
						aria-label={
							isExpanded
								? t("aria_labels.collapse_information")
								: t("aria_labels.expand_information")
						}
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<ExpandCollapseIcon className={isExpanded ? "size-5" : "size-5 rotate-180"} />
					</Button>
				</div>
				{isExpanded &&
					features.map((feature, index) => {
						const isLastFeature = index === features.length - 1;

						return (
							<div key={feature.label}>
								<div className="flex items-center gap-2 border-base-300 border-b bg-base-50 px-4 py-2.5 font-bold text-sm">
									{typeof feature.icon === "string" ? (
										<Icon name={feature.icon} color="text-primary-700" fill={1} />
									) : (
										feature.icon
									)}
									{feature.label}
								</div>
								<div className="flex">
									{bundles.map((bundle) => (
										<div
											key={bundle.id}
											className={`flex min-h-10 flex-1 basis-0 items-center justify-center border-base-300 border-r px-2 py-2 text-center text-sm last:border-r-0 ${isLastFeature ? "border-b-0" : "border-b"}`}
										>
											{renderFeatureValue(feature.values[bundle.id])}
										</div>
									))}
								</div>
							</div>
						);
					})}
			</div>
		</>
	);
}
