/**
 * File: confirmation/page.tsx
 * Description: Confirmation page component that renders the Confirmation module.
 * This page is responsible for displaying the itinerary review within the localized route.
 */

import type { Metadata } from "next";
import Confirmation from "@/components/confirmation/confirmation";
import { generatePageMetadata } from "@/modules/utils/common/meta-data";
import type { PageProps } from "@/types/common.type";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	return generatePageMetadata({ params, namespace: "confirmation_page" });
}

export default async function ConfirmationPage() {
	return <Confirmation />;
}
