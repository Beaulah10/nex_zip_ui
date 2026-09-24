"use client";

import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { usePaymentStatusSingleCall } from "@/modules/hooks/payment/usePaymentStatus";
import { DEFAULT_LOCALE, DEV_BOOKING_ORIGIN } from "@/modules/utils/constants/payment/constants";

export default function PaymentFailure(): ReactElement {
	const t = useTranslations("payment_failure_page");
	const commonT = useTranslations("common");

	const params = useParams();
	const locale = (params?.locale as string) || DEFAULT_LOCALE;

	const { orderId, isPending, error, refetch, clearErrorState } = usePaymentStatusSingleCall({
		autoFetch: true,
		removeQueryParam: true,
	});

	const handleStartOver = () => {
		const isDevelopment = process.env.NODE_ENV === "development";
		const path = `/${locale}`;

		window.location.href = isDevelopment ? `${DEV_BOOKING_ORIGIN}${path}` : path;
	};

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-base-200 border-t-primary-600" />
					<p className="text-base-500">{t("loading_message")}</p>
				</div>
			</div>
		);
	}

	if (!orderId) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4">
					<Icon name="warning" size={64} color="text-danger-700" />

					<div className="text-center">
						<h1 className="mb-2 font-bold text-brand-japan-black text-xl">
							{t("order_not_found_title")}
						</h1>
						<p className="text-base-600 text-sm">{t("order_not_found_message")}</p>
					</div>

					<Button
						type="button"
						variant="primary"
						onClick={() => (window.location.href = "/")}
						className="rounded-lg bg-primary-600 hover:bg-primary-700"
					>
						{commonT("go_to_top_page")}
					</Button>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="payment-failure-page relative left-1/2 flex w-screen -translate-x-1/2 flex-col bg-white">
				<div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-4 py-4 md:px-0 md:py-6">
					<div className="w-full rounded-lg bg-danger-50 p-4">
						<div className="flex gap-3">
							<Icon name="error" size={20} className="text-danger-700" />
							<div>
								<h2 className="font-semibold text-danger-900">{t("error_title")}</h2>
								<p className="mt-3 text-danger-700 text-sm">{error}</p>
							</div>
						</div>

						<div className="mt-3 flex justify-end gap-2">
							<Button
								type="button"
								variant="primary"
								size="md"
								onClick={() => refetch()}
								className="rounded-lg bg-primary-600"
							>
								{t("retry_button")}
							</Button>

							<Button
								type="button"
								variant="base"
								outline
								size="md"
								onClick={clearErrorState}
								className="rounded-lg border-base-300 bg-white"
							>
								{t("dismiss_error")}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="payment-failure-page relative left-1/2 flex w-screen -translate-x-1/2 flex-col bg-white">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-4 py-4 md:px-0 md:py-6">
				<Icon name="warning" size={64} fill={1} className="text-danger-700" />

				<h1 className="font-bold text-4xl text-brand-japan-black">{t("title")}</h1>

				<div className="w-full rounded-lg bg-danger-50 p-4">
					<div className="flex items-start gap-2">
						<Icon name="error" size={20} className="mt-0.5 shrink-0 text-danger-700" />

						<div>
							<h2 className="font-semibold text-danger-800 text-sm">
								{t("reservation_not_confirmed")}
							</h2>

							<p className="mt-3 text-danger-700 text-sm leading-6">
								{t("reservation_not_confirmed_message")}
							</p>
						</div>
					</div>

					<div className="mt-3 flex justify-end">
						<Button
							type="button"
							variant="base"
							outline
							size="md"
							onClick={handleStartOver}
							className="rounded-lg border-base-300 bg-white text-base-700 hover:bg-base-50"
						>
							{t("start_over_button")}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
