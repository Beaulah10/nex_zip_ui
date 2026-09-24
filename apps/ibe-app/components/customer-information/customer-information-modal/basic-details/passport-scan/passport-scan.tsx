/**
 * File: passport-scan.tsx
 * Description: Passport Scan button component that launches the passport scanner modal and captures passport details using OCR.
 * It automatically populates passport and date-related form fields with the scanned information upon successful scan.
 */

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PassportScannerModal } from "@/components/customer-information/customer-information-modal/basic-details/passport-scan-modal/passport-scan-modal";
import type { MrzParseResult } from "@/modules/utils/helpers/customer-information/passport-scan-engine-utils/passport-scan-engine-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

/**
 * PassportScanButton mobile-only (md:hidden in parent).
 * On click: opens PassportScannerModal (camera permission ? scan ? OCR).
 * On scan success: applies extracted values to react-hook-form via setValue.
 */
export function PassportScanButton() {
	const [scannerOpen, setScannerOpen] = useState(false);
	const { setValue } = useFormContext<PassengerInformation>();
	const t = useTranslations("customer_information_page");

	const handleScanComplete = useCallback(
		(result: MrzParseResult) => {
			if (result.passportNumber)
				setValue("passportNumber", result.passportNumber, { shouldValidate: false });
			if (result.expiryYear)
				setValue("passportExpiryDate.year", result.expiryYear, { shouldValidate: false });
			if (result.expiryMonth)
				setValue("passportExpiryDate.month", result.expiryMonth, { shouldValidate: false });
			if (result.expiryDay)
				setValue("passportExpiryDate.day", result.expiryDay, { shouldValidate: false });
			if (result.dobYear) setValue("dateOfBirth.year", result.dobYear, { shouldValidate: false });
			if (result.dobMonth)
				setValue("dateOfBirth.month", result.dobMonth, { shouldValidate: false });
			if (result.dobDay) setValue("dateOfBirth.day", result.dobDay, { shouldValidate: false });
		},
		[setValue]
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setScannerOpen(true)}
				className="scan-passport-btn flex w-full items-center justify-center rounded-lg border border-primary-700 bg-white py-3.5 font-medium text-base text-primary-700 leading-6"
			>
				{t("button_scan_passport")}
			</button>

			<PassportScannerModal
				isOpen={scannerOpen}
				onClose={() => setScannerOpen(false)}
				onScanComplete={handleScanComplete}
			/>
		</>
	);
}
