import { notFound } from "next/navigation";
import BundleSelection from "@/components/bundle/bundle";
import {
	getBookingDirectionFromStage,
	isBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { BundleStagePageProps } from "@/types/bundle/bundle.types";

/**
 * Stage-based bundles route page.
 * Validates stage token, resolves logical direction, and renders bundle selection.
 */
export default async function BundlesStagePage({ params }: BundleStagePageProps) {
	const { locale, stage } = await params;
	const direction = getBookingDirectionFromStage(stage);

	if (!direction || !isBookingStageSegment(stage)) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-5xl">
			<BundleSelection locale={locale} direction={direction} stage={stage} />
		</div>
	);
}
