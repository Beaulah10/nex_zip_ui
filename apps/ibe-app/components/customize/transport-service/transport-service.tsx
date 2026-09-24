/**
 * File: transport-service.tsx
 * Description: Manages the transport service selection flow, passenger assignment, and pricing.
 * Renders available transport services and handles service persistence within the booking journey.
 */
"use client";
import { NEXUZR004OffersAncillaryRequestServiceCategoryEnum } from "@repo/sdk";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Fragment, useMemo } from "react";
import shuttleImage from "@/assets/images/LeaLea-shuttle.png";
import trolleyImage from "@/assets/images/LeLea-Trolley.png";
import shuttleServiceImage from "@/assets/images/shuttle.png";
import shuttleOnlyDesktopImage from "@/assets/images/shuttleonlyImg.png";
import shuttleServiceDesktopImage from "@/assets/images/shuttleservice.png";
import shuttleServiceMobileImage from "@/assets/images/shuttleserviceMob.png";
import trolleyDesktopImage from "@/assets/images/trolleyDesktop.png";
import { SelectCustomers } from "@/components/common/select-customers/select-customers";
import { TransportServiceCard } from "@/components/customize/transport-service/transport-service-card/transport-service-card";
import { TransportServiceDialog } from "@/components/customize/transport-service/transport-service-dialog/transport-services-dialog";
import { useTransportServicePassengers } from "@/modules/hooks/customize/transport-service/use-transport-passengers/use-transport-service-passengers";
import { useTransportServicePersistence } from "@/modules/hooks/customize/transport-service/use-transport-service-persisitence/use-transport-service-persistence";
import { useTransportServicePricing } from "@/modules/hooks/customize/transport-service/use-transport-service-pricing/use-transport-service-pricing";
import { useTransportServiceSelection } from "@/modules/hooks/customize/transport-service/use-transport-service-selection/use-transport-service-selection";
import {
	isDestinationHNLfromNRT,
	isDestinationNRTfromHNL,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import { getBookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import {
	displayPtcAgeGroupLabels,
	displayShuttleServicePricingRows,
	displayTransportServiceApplicable,
	displayTrolleyServicePricingRows,
	displayTrolleyServices,
	getTransportServiceAvailability,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-card/transport-service-card-display";
import { createLfidBySsrCodeMap } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { selectAncillaryOffersDataByDirectionAndServiceCategory } from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import type { TransportServiceProps } from "@/types/customize/transport-service/transport-service.types";

/**
 * Transport service selection flow with stock-aware passenger assignment.
 */
function TransportService({
	open,
	onOpenChange,
	routeLabel,
	highlightedPassengerId,
	direction,
	origin,
	destination,
	stageLabel,
	triggerRef,
}: TransportServiceProps) {
	const transportServiceLabels = useTranslations("transportation_service");
	const selectCustomersLabels = useTranslations("common");
	const selectCustomersTitle = useTranslations("extras_page");
	const selectedPassengers = useAppSelector((state) => state.passenger.passengers);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const scope = getBookingStageSegment({
		confirmedFlight: confirmedFlight ?? undefined,
		direction,
	});
	const transportationData = useAppSelector((state: RootState) =>
		selectAncillaryOffersDataByDirectionAndServiceCategory(
			state,
			scope,
			NEXUZR004OffersAncillaryRequestServiceCategoryEnum.transportation
		)
	);

	const { hasOneWay, hasRoundTrip, hasTRLA, hasTRLB, hasTRLC, hasAnySupportedTransportSsr } =
		useMemo(() => getTransportServiceAvailability(transportationData), [transportationData]);

	const isNrtToHnlRoute = isDestinationHNLfromNRT(origin, destination);
	const isHnlToNrtRoute = isDestinationNRTfromHNL(origin, destination);

	const lfidBySsrCode = useMemo(
		() => createLfidBySsrCodeMap(transportationData) ?? new Map<string, number>(),
		[transportationData]
	);

	const shuttlePricingRows = useMemo(
		() =>
			displayShuttleServicePricingRows({
				transportationData,
				hasOneWay,
				hasRoundTrip,
				transportServiceLabels,
			}),
		[hasOneWay, hasRoundTrip, transportServiceLabels, transportationData]
	);

	const trolleyPricingRows = useMemo(
		() =>
			displayTrolleyServicePricingRows({
				transportationData,
				hasTRLA,
				hasTRLB,
				hasTRLC,
				transportServiceLabels,
			}),
		[hasTRLA, hasTRLB, hasTRLC, transportServiceLabels, transportationData]
	);

	const trolleyServices = useMemo(
		() =>
			displayTrolleyServices({
				hasTRLA,
				hasTRLB,
				hasTRLC,
				transportServiceLabels,
				trolleyImage,
			}),
		[hasTRLA, hasTRLB, hasTRLC, transportServiceLabels]
	);

	const trolleyAgeGroupLabels = useMemo(
		() =>
			displayPtcAgeGroupLabels({
				transportationData,
				hasTRLA,
				hasTRLB,
				hasTRLC,
				transportServiceLabels,
			}),
		[hasTRLA, hasTRLB, hasTRLC, transportationData, transportServiceLabels]
	);

	const transportServices = useMemo(
		() =>
			displayTransportServiceApplicable({
				isNrtToHnlRoute,
				isHnlToNrtRoute,
				hasOneWay,
				hasRoundTrip,
				transportServiceLabels,
				shuttleImage,
				shuttleServiceImage,
				trolleyImage,
				shuttlePricingRows,
				trolleyPricingRows,
				trolleyServices,
				trolleyAgeGroupLabels,
			}),
		[
			hasOneWay,
			hasRoundTrip,
			isNrtToHnlRoute,
			isHnlToNrtRoute,
			shuttlePricingRows,
			transportServiceLabels,
			trolleyPricingRows,
			trolleyServices,
			trolleyAgeGroupLabels,
		]
	);

	const shouldUseTwoServiceShuttleImages = transportServices.length === 2;
	const shuttleCardTitle = transportServiceLabels("lealea_airport_shuttle");
	const hasOnlyShuttleService =
		transportServices.length === 1 && transportServices[0]?.title === shuttleCardTitle;

	const currentLfid = useMemo(() => {
		const lfids = Array.from((lfidBySsrCode ?? new Map<string, number>()).values());
		return lfids.length > 0 ? lfids[0] : undefined;
	}, [lfidBySsrCode]);

	const { getPassengerAmount, storedServicesTotal, setPricingTransportServiceId } =
		useTransportServicePricing({ transportationData, selectedPassengers, currentLfid });

	const {
		selectedTransportServiceId,
		setSelectedTransportServiceId,
		selectedServiceStockLimit,
		remainingStockCount,
		shouldShowRemainingStock,
		selectedService,
		selectedServiceDescription,
		handleBackFromTransportServiceDetails,
		getTransportCardServices,
	} = useTransportServiceSelection({
		transportationData,
		transportServices,
		lfidBySsrCode,
		selectedPassengers,
		transportServiceLabels,
		setPricingTransportServiceId,
		trolleyDesktopImage,
	});

	const {
		transportServicePax,
		passengersWithAmount,
		hasOutOfStockPassengers,
		currentSelectionTotal,
		selectedTransportPassengerCount,
		toggleTransportServicePax,
		toggleTransportServiceSelectAll,
	} = useTransportServicePassengers({
		transportationData,
		selectedPassengers,
		selectedTransportServiceId,
		selectedServiceStockLimit,
		getPassengerAmount,
		transportServiceLabels,
		open,
		lfidBySsrCode,
		setPricingTransportServiceId,
	});

	const { persistSelectedTransportService } = useTransportServicePersistence({
		selectedTransportServiceId,
		transportServicePax,
		transportationData,
	});

	const transportServicesTotal =
		selectedTransportServiceId !== null ? currentSelectionTotal : storedServicesTotal;

	const handleOpenChange = (nextOpen: boolean) => {
		onOpenChange(nextOpen);
		if (!nextOpen) {
			setSelectedTransportServiceId(null);
			setPricingTransportServiceId(null);
		}
	};

	const handleConfirmTransportService = () => {
		if (selectedTransportServiceId !== null) {
			persistSelectedTransportService();
			setSelectedTransportServiceId(null);
			return;
		}

		handleOpenChange(false);
	};

	return (
		<TransportServiceDialog
			triggerRef={triggerRef}
			open={open}
			onOpenChange={handleOpenChange}
			routeLabel={routeLabel}
			selectedTransportServiceId={selectedTransportServiceId}
			totalAmount={transportServicesTotal}
			stageLabel={stageLabel}
			hasOutOfStockPassengers={hasOutOfStockPassengers}
			onBack={handleBackFromTransportServiceDetails}
			onConfirm={handleConfirmTransportService}
		>
			{selectedTransportServiceId === null ? (
				<div className="flex w-full flex-col gap-4">
					{!hasAnySupportedTransportSsr && (
						<p className="text-center font-medium text-gray-400 text-xs leading-6">
							{transportServiceLabels("no_purchase_option_available")}
						</p>
					)}
					<div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
						{hasAnySupportedTransportSsr &&
							transportServices.map((activity, activityIndex) => (
								<Fragment key={activity.title}>
									{activityIndex > 0 && (
										<div className="h-px w-full shrink-0 bg-base-300 md:h-auto md:w-px md:self-stretch" />
									)}

									{(() => {
										const isShuttleCard = activity.services.some(
											(service) =>
												service.id === "shuttle-one-way" || service.id === "shuttle-round-trip"
										);
										const isShuttleServiceCard =
											isShuttleCard || activity.title === shuttleCardTitle;
										const shouldUseCustomShuttleImages =
											isShuttleServiceCard &&
											(shouldUseTwoServiceShuttleImages || hasOnlyShuttleService);
										const shuttleDesktopImageSrc = hasOnlyShuttleService
											? shuttleOnlyDesktopImage
											: shuttleServiceDesktopImage;
										const transportCardMobileImageSrc = isShuttleServiceCard
											? shuttleServiceMobileImage
											: undefined;
										const transportCardDesktopImageSrc = shouldUseCustomShuttleImages
											? shuttleDesktopImageSrc
											: undefined;

										return (
											<TransportServiceCard
												className="md:flex-1"
												imageSrc={activity.imageSrc}
												mobileImageSrc={transportCardMobileImageSrc}
												desktopImageSrc={transportCardDesktopImageSrc}
												title={activity.title}
												moreInfoHref={activity.moreInfoHref}
												description={activity.description}
												ageGroupLabels={[...activity.ageGroupLabels]}
												durationLabel={activity.durationLabel}
												pricingRows={activity.pricingRows.map((row) => ({
													label: row.label,
													prices: [...row.prices],
												}))}
												footnote={activity.footnote}
												services={getTransportCardServices(activity.services)}
											/>
										);
									})()}
								</Fragment>
							))}
					</div>
				</div>
			) : (
				selectedService && (
					<div className="flex w-full flex-col gap-4 md:flex-row">
						<div className="flex flex-1 flex-col">
							<h2 className="order-2 pt-4 font-bold text-2xl text-primary-700 leading-9 md:order-1 md:pt-0 md:pb-4">
								{selectedService.label}
							</h2>

							{shouldShowRemainingStock && (
								<p className="order-3 py-1 font-normal text-primary-700 text-xs leading-5 md:order-2">
									{transportServiceLabels("remaining_stock_count", {
										count: Math.max(
											0,
											(remainingStockCount ?? selectedServiceStockLimit ?? 0) -
												(selectedTransportPassengerCount ?? 0)
										),
									})}
								</p>
							)}
							{shouldShowRemainingStock && (
								<div className="order-4 mb-4 hidden h-px w-full bg-base-300 md:order-2 md:block" />
							)}
							<div className="order-1 overflow-hidden rounded-lg md:order-2">
								<Image
									src={selectedService.activityDesktopImage ?? selectedService.activityImage}
									alt={selectedService.label}
									className="h-auto w-full object-cover"
								/>
							</div>
							<p className="order-5 pt-4 text-base-700 text-sm leading-6">
								{selectedServiceDescription}
							</p>
						</div>
						<div className="hidden h-px w-full shrink-0 bg-base-300 md:block md:h-auto md:w-px md:self-stretch" />
						<div className="w-full shrink-0 md:max-w-81.5">
							<div className="mb-4 h-px w-full bg-base-300 md:hidden" />
							<SelectCustomers
								passengers={passengersWithAmount}
								highlightedPassengerId={highlightedPassengerId}
								disabledPassengerCategories={[selectCustomersLabels("infant_label")]}
								title={selectCustomersTitle("select_customers")}
								onPassengerChange={toggleTransportServicePax}
								onSelectAllChange={toggleTransportServiceSelectAll}
							/>
						</div>
					</div>
				)
			)}
		</TransportServiceDialog>
	);
}

export { TransportService };
