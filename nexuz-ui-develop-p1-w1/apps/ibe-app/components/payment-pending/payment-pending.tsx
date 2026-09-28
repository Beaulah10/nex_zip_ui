/**
 * File: components/payment-pending/payment-pending.tsx
 * Description: Pending payment page component.
 * Displays a loader while polling payment status.
 * Polls API every 2 seconds until Success/Failure or timeout.
 *
 * Responsibilities:
 * - Use polling hook for continuous API calls
 * - Display loader while polling
 * - Auto-redirect on Success or Failure
 * - Show retry dialog on timeout (after 10 minutes)
 */

"use client";

import { Button } from "@repo/ui/components/button";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { usePaymentStatusPolling } from "@/modules/hooks/payment/usePaymentStatusPolling";
import {
	DEFAULT_LOCALE,
	PAYMENT_POLLING_INTERVAL_MS,
	PAYMENT_POLLING_MAX_DURATION_MS,
} from "@/modules/utils/constants/payment/constants";

/**
 * PaymentPending page component.
 */
export default function PaymentPending(): ReactElement {
	const t = useTranslations("pending_page");
	const params = useParams();
	const locale = (params?.locale as string) || DEFAULT_LOCALE;

	// Polling hook: automatically starts polling, stops on Success/Failure or timeout
	const { paymentStatus, isPolling } = usePaymentStatusPolling({
		pollingIntervalMs: PAYMENT_POLLING_INTERVAL_MS,
		maxDurationMs: PAYMENT_POLLING_MAX_DURATION_MS,
		autoStart: true,
		removeQueryParam: true,
	});

	// Auto-redirect on Success or Failure
	useEffect(() => {
		if (!isPolling && paymentStatus === "Success") {
			// Redirect to completion page
			window.location.href = `/booking/${locale}/completion`;
		}
	}, [isPolling, paymentStatus, locale]);

	useEffect(() => {
		if (!isPolling && paymentStatus === "Failure") {
			// Redirect to payment failure page
			window.location.href = `/booking/${locale}/payment-failure`;
		}
	}, [isPolling, paymentStatus, locale]);

	// ─────────────────────────────────────────────────────────────────────────
	// Render: Loading spinner while polling
	// ─────────────────────────────────────────────────────────────────────────

	if (isPolling) {
		return (
			<div className="pending-page flex h-full min-h-full items-center justify-center bg-gray-800 bg-opacity-50">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-white" />
					<p className="text-white">{t("initializing_message")}</p>
				</div>
			</div>
		);
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Render: Timeout dialog (after 10 minutes)
	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div className="pending-page flex h-full min-h-[calc(100vh-200px)] items-center justify-center bg-gray-800 bg-opacity-50">
			<div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-6 shadow-lg">
				{/* Header */}
				<h1 className="font-bold text-brand-japan-black text-xl">{t("title")}</h1>

				{/* Message */}
				<p className="text-gray-600 text-sm leading-6">{t("subtitle")}</p>

				{/* Action buttons */}
				<div className="flex flex-col gap-3">
					<Button
						type="button"
						variant="primary"
						outline
						size="lg"
						onClick={() => (window.location.href = `/booking/${locale}`)}
						className="rounded-lg border-primary-600 bg-white text-primary-600 hover:bg-primary-50"
					>
						{t("back_to_top_button")}
					</Button>
					<Button
						type="button"
						variant="primary"
						size="lg"
						onClick={() => window.location.reload()}
						className="rounded-lg bg-primary-600 hover:bg-primary-700"
					>
						{t("reload_button")}
					</Button>
				</div>
			</div>
		</div>
	);
}
