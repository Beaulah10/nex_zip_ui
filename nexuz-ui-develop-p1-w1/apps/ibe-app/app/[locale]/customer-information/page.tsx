/**
 * File: customer-information/page.tsx
 * Description: Customer Information page component that renders the CustomerInformation module.
 * This page is responsible for displaying the customer information form within the localized route.
 */

import type { Metadata } from "next";
import CustomerInformation from "@/components/customer-information/customer-information";
import { generatePageMetadata } from "@/modules/utils/common/meta-data";
import type { PageProps } from "@/types/common.type";

/**
 * Generates dynamic metadata for the locale-specific layout segment.
 *
 * @param params - Route segment params containing the current `locale` slug
 *   (e.g. `"en"`, `"ja"`). Passed as a Promise in Next.js App Router.
 * @returns A Next.js {@link Metadata} object with at minimum the page `title`
 *   translated into the requested locale.
 *
 * @example
 * // Result for locale "en": { title: "ZIPAIR" }
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	return generatePageMetadata({ params, namespace: "customer_information_page" });
}

export default async function CustomerInformationPage() {
	return (
		<div className="mx-auto max-w-5xl">
			<CustomerInformation />
		</div>
	);
}
