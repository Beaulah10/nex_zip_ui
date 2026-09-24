"use client";

import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { ReservationNumberBanner } from "@/components/completion/reservation-number-banner/reservation-number-banner";
import { FlightItineraryCard } from "@/components/confirmation/flight-itinerary-card/flight-itinerary-card";
import { useConfirmationData } from "@/modules/hooks/confirmation/use-confirmation-data";
import { usePaymentStatusSingleCall } from "@/modules/hooks/payment/usePaymentStatus";
import { useAppSelector } from "@/store/hooks";
import { selectRequiresDestinationAddress } from "@/store/slices/flight-selection/flight-selection.slice";
import { selectHasIncompleteDestinationAddress } from "@/store/slices/passenger/passenger.slice";
import {
	selectConfirmationNumber,
	selectOrderId,
} from "@/store/slices/payment-status/payment-status.slice";

export default function Completion() {
	const t = useTranslations("completion_page");
	const flightSelectionLabels = useTranslations("flight_selection_page");

	// Get orderId from Redux store
	const orderId = useAppSelector(selectOrderId);

	// Fetch payment status using Redux-stored orderId
	const { isPending, error, refetch } = usePaymentStatusSingleCall({
		orderId: orderId ?? undefined,
		autoFetch: true,
		removeQueryParam: false,
	});

	// Get confirmation number from Redux
	const confirmationNumber = useAppSelector(selectConfirmationNumber);

	const { pageData } = useConfirmationData();
	const inboundLegData = pageData?.inbound;

	const requiresDestinationAddress = useAppSelector(selectRequiresDestinationAddress);

	const hasIncompleteDestinationAddress = useAppSelector(selectHasIncompleteDestinationAddress);

	const showDestinationAddressBanner =
		requiresDestinationAddress && hasIncompleteDestinationAddress;

	// ─────────────────────────────────────────────────────────────────────────
	// Render: Loading state
	// ─────────────────────────────────────────────────────────────────────────

	if (isPending) {
		return (
			<div className="completion-page flex min-h-screen items-center justify-center bg-white">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
					<p className="text-gray-500">{t("loading_message")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="completion-page relative left-1/2 flex w-screen -translate-x-1/2 flex-col bg-white">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-4 py-4 md:px-0 md:py-6">
				<section
					className="flex w-full flex-col items-start gap-4"
					aria-labelledby="completion-title"
				>
					<div className="flex w-full items-center gap-4">
						<Icon name="check_circle" size={64} fill={1} className="shrink-0 text-primary-600" />
						<h1
							id="completion-title"
							className="min-w-0 flex-1 font-bold text-3xl text-brand-japan-black leading-13"
						>
							{t("title")}
						</h1>
					</div>

					<p className="w-full text-brand-japan-black text-sm leading-6">{t("subtitle")}</p>
				</section>

				{showDestinationAddressBanner && (
					<div className="flex w-full flex-col gap-4 rounded-lg border border-warning-300 bg-warning-100 p-4 md:flex-row md:items-center md:justify-between">
						<div className="flex items-start gap-3">
							<Icon name="warning" size={20} className="mt-1 shrink-0 text-warning-700" />

							<div>
								<p className="font-semibold text-warning-900">
									{t("destination_address_banner_title")}
								</p>
								<p className="mt-1 text-sm text-warning-800">
									{t("destination_address_banner_description")}
								</p>
							</div>
						</div>

						<Button
							type="button"
							className="border-warning-700 bg-transparent text-warning-900 hover:bg-warning-200"
						>
							{t("destination_address_banner_button")}
						</Button>
					</div>
				)}

				{/* Reservation Number Banner */}
				{confirmationNumber && (
					<ReservationNumberBanner
						reservationNumber={confirmationNumber}
						title={t("reservation_number_label")}
						manageBookingLabel={t("manage_booking_button")}
						onManageBooking={() => {}}
					/>
				)}

				{!confirmationNumber && (
					<div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
						<p className="text-gray-600 text-sm">{t("confirmation_number_unavailable")}</p>
					</div>
				)}

				{/* Error state */}
				{error && (
					<div className="w-full rounded-lg border-yellow-500 border-l-4 bg-yellow-50 p-4">
						<div className="flex items-start gap-3">
							<Icon name="warning" size={20} className="shrink-0 text-yellow-600" />

							<div className="flex-1">
								<p className="text-sm text-yellow-900">{error}</p>

								<Button
									type="button"
									variant="ghost"
									onClick={() => refetch()}
									className="mt-2 h-auto w-auto p-0 font-semibold text-sm text-yellow-700 hover:bg-transparent hover:text-yellow-900"
								>
									{t("retry_button")}
								</Button>
							</div>
						</div>
					</div>
				)}

				<section
					className="flex w-full flex-col items-start gap-4"
					aria-labelledby="flight-details-title"
				>
					<h2
						id="flight-details-title"
						className="w-full border-base-200 border-b pb-1 font-bold text-2xl text-primary-700 leading-9"
					>
						{t("flight_details_title")}
					</h2>

					{!pageData && (
						<p className="w-full text-brand-japan-black text-sm leading-6">
							{t("no_flight_details")}
						</p>
					)}

					{pageData && (
						<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-0">
							{/* Flight itinerary cards */}
							<div
								className={`grid w-full grid-cols-1 gap-4 ${
									inboundLegData ? "md:grid-cols-2" : ""
								}`}
							>
								<FlightItineraryCard
									aria-label={pageData.outbound.itinerary.legLabel}
									{...pageData.outbound.itinerary}
								/>

								{inboundLegData && (
									<FlightItineraryCard
										aria-label={inboundLegData.itinerary.legLabel}
										{...inboundLegData.itinerary}
									/>
								)}
							</div>

							{/* Transit info */}
							{pageData.transitInfo && (
								<Wrapper className="h-auto w-auto border-0 bg-gray-50 px-4 py-1 md:px-6 md:py-1">
									<p className="flex items-center justify-center gap-2 text-center font-medium text-xs">
										<Icon name="schedule" size={20} fill={1} grad={0} color="text-green-600" />
										{flightSelectionLabels("transit_label")}: {pageData.transitInfo.airportName} (
										{pageData.transitInfo.airportCode}) - {pageData.transitInfo.transitDuration} (
										{flightSelectionLabels("total_hours_label")}:{" "}
										{pageData.transitInfo.totalDuration})
									</p>
								</Wrapper>
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
