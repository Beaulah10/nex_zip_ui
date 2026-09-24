/**
 * File: app/[locale]/payment-pending/page.tsx
 * Description: Pending payment route page.
 * Rendered when payment status is still being processed.
 * Polls status API every 2 seconds until Success/Failure or 10-minute timeout.
 */

import type { Metadata } from "next";
import PaymentPending from "@/components/payment-pending/payment-pending";
import { generatePageMetadata } from "@/modules/utils/common/meta-data";
import type { PageProps } from "@/types/common.type";

/**
 * Generate page metadata for SEO.
 * Uses i18n namespace "pending_page".
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	return generatePageMetadata({ params, namespace: "pending_page" });
}

/**
 * Pending payment page.
 * Route: /[locale]/pending
 * Behavior: Polls payment status every 2 seconds, max 10 minutes
 */
export default function PendingPage() {
	return <PaymentPending />;
}
