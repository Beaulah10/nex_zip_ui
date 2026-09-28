/**
 * File: app/[locale]/payment-failure/page.tsx
 * Description: Payment failure route page.
 * Rendered when POP returns user to IBE with failure status.
 */

import type { Metadata } from "next";
import PaymentFailure from "@/components/payment-failure/payment-failure";
import { generatePageMetadata } from "@/modules/utils/common/meta-data";
import type { PageProps } from "@/types/common.type";

/**
 * Generate page metadata for SEO.
 * Uses i18n namespace "payment_failure_page".
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	return generatePageMetadata({ params, namespace: "payment_failure_page" });
}

/**
 * Payment failure page.
 * Route: /[locale]/payment-failure
 */
export default async function PaymentFailurePage({ params }: PageProps) {
	await params;
	return <PaymentFailure />;
}
