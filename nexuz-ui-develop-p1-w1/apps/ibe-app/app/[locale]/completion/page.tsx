import type { Metadata } from "next";
import Completion from "@/components/completion/completion";
import { generatePageMetadata } from "@/modules/utils/common/meta-data";
import type { PageProps } from "@/types/common.type";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	return generatePageMetadata({ params, namespace: "completion_page" });
}

export default async function CompletionPage() {
	return (
		<div className="mx-auto max-w-5xl">
			<Completion />
		</div>
	);
}
