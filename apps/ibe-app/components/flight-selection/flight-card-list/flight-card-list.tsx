"use client";
import Icon from "@repo/ui/components/icon";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { CabinCard } from "@/components/flight-selection/cabin-card/cabin-card";
import { CabinTypeLegend } from "@/components/flight-selection/cabin-type/cabin-type-legend";
import { FlightInfo } from "@/components/flight-selection/flight-information/flight-info";
import { getAirportDisplayName } from "@/modules/utils/helpers/airport";
import {
	getPassengerLabel,
	PASSENGER_DISPLAY_ORDER,
} from "@/modules/utils/helpers/common/passenger-label/passenger-label";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import { formatDuration } from "@/modules/utils/helpers/flightTime-formatter";
import { useAppSelector } from "@/store/hooks";
import { selectFlightSearchRequest } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	CabinPrices,
	FlightCardListProps,
	FlightFare,
} from "@/types/flight-selection/flight-selection.types";

/**
 * Resolves the displayed cabin prices for a connecting-flight segment.
 */

function getSegmentPrices(
	rawSegFares: FlightFare[],
	flightSelectionLabels: ReturnType<typeof useTranslations>
): CabinPrices {
	const adultFare = rawSegFares.find((fare) => fare.passengerType === "adult");

	const extras = PASSENGER_DISPLAY_ORDER.map((passengerType) =>
		rawSegFares.find((fare) => fare.passengerType === passengerType)
	)
		.filter((fare): fare is FlightFare => fare !== undefined)
		.map((fare) => ({
			label: getPassengerLabel(fare.passengerType, flightSelectionLabels),
			price: formatPrice(fare.baseFareAmtInclTax ?? fare.fareAmtInclTax ?? 0),
		}));

	return {
		adult: formatPrice(adultFare?.baseFareAmtInclTax ?? adultFare?.fareAmtInclTax ?? 0),
		extras: extras.length > 0 ? extras : undefined,
	};
}

export function FlightCardList({
	flights,
	selectedCabins,
	onCabinSelect,
	standardCabinImage,
	zipFullFlatImage,
	standardDesktopImage,
	zipfullflatDesktopImage,
	hasMultipleConnectingFlights,
	disableCabinSelection = false,
	connectingFlightErrors,
}: FlightCardListProps) {
	const flightSearchRequest = useAppSelector(selectFlightSearchRequest);
	const hasYoungPassengers =
		(flightSearchRequest?.childC ?? 0) > 0 || (flightSearchRequest?.infant ?? 0) > 0;
	const connectingFlights = flights.filter((flight) => flight.isConnectingFlight);
	const flightSelectionLabels = useTranslations("flight_selection_page");
	return (
		<div className="flex flex-col gap-3 p-0 md:gap-4">
			{flights.map((flight) => {
				const connectingFlightNumber = connectingFlights.findIndex((f) => f.id === flight.id) + 1;
				const flightError = connectingFlightErrors.find((error) => error.groupId === flight.id);
				const isZipRestrictedByPassengerAge = hasYoungPassengers;

				const isZipUnavailable = flight.hasZipFullFlat === false;
				const isZipDisabled =
					disableCabinSelection || isZipRestrictedByPassengerAge || isZipUnavailable;
				const zipDisabledMessage = isZipRestrictedByPassengerAge
					? flightSelectionLabels("zip_full_flat_restriction_message")
					: isZipUnavailable
						? flightSelectionLabels("no_available_seats_message")
						: "";
				const isStandardUnavailable = flight.hasStandardCabin === false;
				const isStandardDisabled = disableCabinSelection || isStandardUnavailable;
				const standardDisabledMessage = isStandardUnavailable
					? flightSelectionLabels("no_available_seats_message")
					: "";
				const standardPrices: CabinPrices | undefined = flight.standardPrices;

				const zipPrices: CabinPrices | undefined = flight.zipPrices;
				const standardSeatsLeft =
					flight.standardSeatsLeft !== undefined && flight.standardSeatsLeft < 9
						? flight.standardSeatsLeft
						: undefined;

				if (flight.isConnectingFlight) {
					return (
						<div key={flight.id} id={flight.id} className="bg-white">
							{hasMultipleConnectingFlights && connectingFlightNumber > 1 && (
								<h2 className="mb-4 border-b pt-14 pb-4 font-bold text-2xl text-primary-700">
									{`${flightSelectionLabels("connecting_flight_label")} ${connectingFlightNumber}`}
								</h2>
							)}
							{hasMultipleConnectingFlights && flightError && (
								<div className="mb-4 flex items-center gap-2.5 rounded bg-red-100 px-4 py-2 text-red-800 text-sm">
									<Icon
										name="warning"
										size={20}
										fill={1}
										color=""
										className="shrink-0 text-current"
									/>
									{flightError.message}
								</div>
							)}

							{hasMultipleConnectingFlights && (
								<div className="flight-selection-legend mb-4">
									<CabinTypeLegend
										cabinTypes={[
											{
												label: flightSelectionLabels("standard_cabin_label"),
												icon: "airline_seat_recline_normal",
											},
											{
												label: flightSelectionLabels("zip_full_flat_label"),
												icon: "airline_seat_recline_extra",
											},
										]}
										infoText={flightSelectionLabels("cabin_legend_info_text")}
										infoLinkText={flightSelectionLabels("cabin_legend_link_text")}
										infoLinkHref="https://www.zipair.net/en/help"
									/>
								</div>
							)}

							<div className="flex flex-col gap-0">
								{flight.segments?.map((segment, index) => {
									// Use numeric index so getSelectedFlightPrice can extract it reliably
									const segmentFlightId = `${flight.id}-segment-${index}`;
									const selectedCabin = selectedCabins[segmentFlightId];

									// Resolve per-segment prices

									const segmentStandardSeatsLeftRaw =
										flight.standardSeatsLeftBySegment?.[index] ?? flight.standardSeatsLeft;
									const segmentZipSeatsLeftRaw =
										flight.zipSeatsLeftBySegment?.[index] ?? flight.zipSeatsLeft;
									const segmentStandardSeatsLeft =
										segmentStandardSeatsLeftRaw !== undefined && segmentStandardSeatsLeftRaw < 9
											? segmentStandardSeatsLeftRaw
											: undefined;
									const segmentZipSeatsLeft =
										segmentZipSeatsLeftRaw !== undefined && segmentZipSeatsLeftRaw < 9
											? segmentZipSeatsLeftRaw
											: undefined;

									const segmentFares = flight.segmentFaresList?.[index];
									const standardSegmentPrices: CabinPrices = segmentFares?.standard?.length
										? getSegmentPrices(segmentFares.standard, flightSelectionLabels)
										: {
												adult: formatPrice(0),
											};
									const zipSegmentPrices: CabinPrices = segmentFares?.zipFullFlat?.length
										? getSegmentPrices(segmentFares.zipFullFlat, flightSelectionLabels)
										: {
												adult: formatPrice(0),
											};

									const isSegmentStandardUnavailable = segmentFares
										? !segmentFares.standard?.length
										: isStandardUnavailable;
									const isSegmentZipUnavailable = segmentFares
										? !segmentFares.zipFullFlat?.length
										: isZipUnavailable;
									const isSegmentStandardDisabled =
										disableCabinSelection || isSegmentStandardUnavailable;
									const isSegmentZipDisabled =
										disableCabinSelection ||
										isZipRestrictedByPassengerAge ||
										isSegmentZipUnavailable;
									const segmentStandardDisabledMessage = isSegmentStandardUnavailable
										? flightSelectionLabels("no_available_seats_message")
										: "";
									const segmentZipDisabledMessage = isZipRestrictedByPassengerAge
										? flightSelectionLabels("zip_full_flat_restriction_message")
										: isSegmentZipUnavailable
											? flightSelectionLabels("no_available_seats_message")
											: "";

									return (
										<div key={`${flight.id}-seg-${segment.departureCity}-${segment.arrivalCity}`}>
											<div className="rounded-lg border border-base-200 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)]">
												<div className="flex flex-col gap-0 p-4 md:flex-row md:items-stretch">
													<h3 className="font-semibold text-base text-green-700">
														{flightSelectionLabels("segment_label", { number: index + 1 })}
													</h3>
													<div className="flex-1 md:flex md:items-center">
														<FlightInfo
															departureTime={segment.departureTime}
															departureCity={getAirportDisplayName(segment.departureCity)}
															arrivalTime={segment.arrivalTime}
															arrivalCity={getAirportDisplayName(segment.arrivalCity)}
															flightNumber={segment.flightNumber}
															duration={segment.duration}
															previousDayIndicator={segment.previousDayIndicator}
															nextDayIndicator={segment.nextDayIndicator}
															className="w-full"
														/>
													</div>

													<div className="my-3 h-px bg-base-200 md:mx-4 md:my-0 md:h-auto md:w-px md:self-stretch" />

													<div className="flex flex-col gap-4 md:flex-row md:items-stretch">
														<CabinCard
															cabinType="Standard"
															mobileImage={standardCabinImage}
															desktopImage={standardDesktopImage}
															prices={standardSegmentPrices}
															seatsLeft={segmentStandardSeatsLeft}
															selected={selectedCabin === "standard"}
															isDisabled={isSegmentStandardDisabled}
															disabledMessage={segmentStandardDisabledMessage}
															onClick={(e) => {
																e.stopPropagation();

																onCabinSelect(segmentFlightId, "standard");
															}}
															className="md:w-[247px]"
														/>

														<CabinCard
															cabinType="ZIP Full-Flat"
															mobileImage={zipFullFlatImage}
															desktopImage={zipfullflatDesktopImage}
															prices={zipSegmentPrices}
															seatsLeft={segmentZipSeatsLeft}
															selected={selectedCabin === "zipfullflat"}
															isDisabled={isSegmentZipDisabled}
															disabledMessage={segmentZipDisabledMessage}
															onClick={(e) => {
																e.stopPropagation();
																onCabinSelect(segmentFlightId, "zipfullflat");
															}}
															className="md:w-[247px]"
														/>
													</div>
												</div>
											</div>

											{index < (flight.segments?.length ?? 0) - 1 && flight.transitTime ? (
												<Wrapper className="my-4 h-auto w-auto border-0 bg-gray-50 px-4 py-1 md:px-6 md:py-1">
													<p className="flex items-center justify-center gap-2 text-center font-medium text-xs">
														<Icon
															name="schedule"
															size={20}
															fill={1}
															grad={0}
															color="text-green-600"
														/>
														{flightSelectionLabels("transit_label")}: Tokyo Narita (NRT) -{" "}
														{formatDuration(flight.transitTime)} (
														{flightSelectionLabels("total_hours_label")}:{" "}
														{formatDuration(flight.overallFlightTime)})
													</p>
												</Wrapper>
											) : null}
										</div>
									);
								})}
							</div>
						</div>
					);
				}

				const selectedCabin = selectedCabins[flight.id];

				return (
					<div
						key={flight.id}
						className="rounded-lg border border-base-200 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)]"
					>
						<div className="flex flex-col gap-0 p-4 md:flex-row md:items-stretch">
							<div className="flex-1 md:flex md:items-center">
								<FlightInfo
									departureTime={flight.departureTime}
									departureCity={getAirportDisplayName(flight.departureCity)}
									arrivalTime={flight.arrivalTime}
									arrivalCity={getAirportDisplayName(flight.arrivalCity)}
									flightNumber={flight.flightNumber}
									duration={flight.duration}
									previousDayIndicator={
										flight.previousDayIndicator ?? flight.segments?.[0]?.previousDayIndicator
									}
									nextDayIndicator={
										flight.nextDayIndicator ?? flight.segments?.[0]?.nextDayIndicator
									}
									className="w-full"
								/>
							</div>

							<div className="my-3 h-px bg-base-200 md:mx-4 md:my-0 md:h-auto md:w-px md:self-stretch" />

							<div className="flex flex-col gap-4 md:flex-row md:items-stretch">
								<CabinCard
									cabinType="Standard"
									mobileImage={standardCabinImage}
									desktopImage={standardDesktopImage}
									prices={standardPrices}
									seatsLeft={standardSeatsLeft}
									selected={selectedCabin === "standard"}
									isDisabled={isStandardDisabled}
									disabledMessage={standardDisabledMessage}
									onClick={(e) => {
										e.stopPropagation();
										onCabinSelect(flight.id, "standard");
									}}
									className="md:w-[247px]"
								/>

								<CabinCard
									cabinType="ZIP Full-Flat"
									mobileImage={zipFullFlatImage}
									desktopImage={zipfullflatDesktopImage}
									prices={zipPrices}
									seatsLeft={flight.zipSeatsLeft}
									selected={selectedCabin === "zipfullflat"}
									isDisabled={isZipDisabled}
									disabledMessage={zipDisabledMessage}
									onClick={(e) => {
										e.stopPropagation();
										onCabinSelect(flight.id, "zipfullflat");
									}}
									className="md:w-[247px]"
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
