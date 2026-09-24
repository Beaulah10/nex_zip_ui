/**
 * File: business-cabin-header.tsx
 * Description: Displays translated business cabin seat column headers.
 */

"use client";

import { useTranslations } from "next-intl";

function HeaderLabel({ column, children }: { column: number; children: string }) {
	return (
		<div className="flex items-center justify-center font-medium text-brand-japan-black text-sm uppercase">
			{children}
		</div>
	);
}

export function BusinessCabinHeader() {
	const t = useTranslations("seat_service");
	return (
		<div className="seat-map__header flex h-11 w-full items-center justify-between px-2">
			<div className="w-15.5">
				<HeaderLabel column={2}>{t("business_cabin_columns_a")}</HeaderLabel>
			</div>

			<div className="w-15.5">
				<HeaderLabel column={4}>{t("business_cabin_columns_d")}</HeaderLabel>
			</div>

			<div className="w-15.5">
				<HeaderLabel column={8}>{t("business_cabin_columns_g")}</HeaderLabel>
			</div>

			<div className="w-15.5">
				<HeaderLabel column={10}>{t("business_cabin_columns_k")}</HeaderLabel>
			</div>
		</div>
	);
}
