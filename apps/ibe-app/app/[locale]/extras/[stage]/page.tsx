import { notFound } from "next/navigation";
import { Extras } from "@/components/extras/extras";
import { getBookingDirectionFromStage } from "@/modules/utils/helpers/common/flow-router/flow-router";

export default async function ExtrasStagePage({
	params,
}: {
	params: Promise<{ locale: string; stage: string }>;
}) {
	const { locale, stage } = await params;
	const direction = getBookingDirectionFromStage(stage);

	if (!direction) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-5xl">
			<Extras locale={locale} direction={direction} />
		</div>
	);
}
