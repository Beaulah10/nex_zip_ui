import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { forwardRef } from "react";
import { AirCalendarTabs } from "@/components/flight-selection/air-calendar/air-calendar-tabs";
import { CabinTypeLegend } from "@/components/flight-selection/cabin-type/cabin-type-legend";
import { FlightCardList } from "@/components/flight-selection/flight-card-list/flight-card-list";
import type { BoundDisplayProps } from "@/types/flight-selection/flight-selection.types";

/**
 * Renders one travel bound with its calendar and flight options.
 * Switches the heading for connecting itineraries while preserving selection behavior.
 */
export const BoundDisplay = forwardRef<HTMLDivElement, BoundDisplayProps>(
	(
		{
			title,
			tabs,
			selectedDate,
			onDateChange,
			flights,
			selectedCabins,
			onCabinSelect,
			standardCabinImage,
			zipFullFlatImage,
			standardDesktopImage,
			zipfullflatDesktopImage,
			isConnectingFlightBound,
			connectingFlightErrors,
			disableCabinSelection,
			showError,
		},
		ref
	) => {
		const connectingFlights = flights.filter((flight) => flight.isConnectingFlight);

		const hasMultipleConnectingFlights = connectingFlights.length > 1;
		const flightSelectionLabels = useTranslations("flight_selection_page");
		return (
			<div ref={ref}>
				{isConnectingFlightBound ? (
					<div className="px-4 pt-4 pb-4 pl-4 md:py-4 md:pt-0 md:pl-0">
						<h2 className="font-bold text-2xl text-primary-700">
							{hasMultipleConnectingFlights
								? flightSelectionLabels("connecting_flight1_label")
								: flightSelectionLabels("connecting_flight_label")}
						</h2>
					</div>
				) : (
					<div className="p-4 md:pt-6 md:pb-4 md:pl-0">
						<h2 className="font-bold text-2xl text-primary-700 md:pl-0">{title}</h2>
					</div>
				)}

				<div className="flight-selection-tabs top-0 z-10 border-y bg-white pt-4">
					<AirCalendarTabs tabs={tabs} value={selectedDate} onValueChange={onDateChange} />
				</div>

				<div className="flight-selection-body flex flex-col gap-4 px-2 py-4 md:px-0 md:pb-6">
					{flights.length === 0 ? (
						<div className="flex justify-center text-base-medium-font-size text-gray-400">
							{flightSelectionLabels("no_available_flights_label")}
						</div>
					) : (
						<>
							{showError && (
								<div className="flex items-center gap-2 rounded bg-red-100 px-4 py-2 text-red-800 text-sm">
									<Icon
										name="warning"
										size={20}
										fill={1}
										color=""
										className="shrink-0 text-current"
									/>
									{flightSelectionLabels("flight_selection_error_label")}
								</div>
							)}
							{!hasMultipleConnectingFlights && (connectingFlightErrors ?? []).length > 0 && (
								<div className="space-y-2">
									{(connectingFlightErrors ?? []).map((error) => (
										<div
											key={error.groupId}
											className="mx-4 mb-4 flex items-center gap-2 rounded bg-red-100 px-4 py-2 text-red-800 text-sm"
										>
											<Icon
												name="warning"
												color=" "
												size={20}
												fill={1}
												className="shrink-0 text-current"
											/>
											{error.message}
										</div>
									))}
								</div>
							)}

							{!hasMultipleConnectingFlights && (
								<div className="flight-selection-legend">
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
							<FlightCardList
								flights={flights}
								selectedCabins={selectedCabins}
								onCabinSelect={onCabinSelect}
								standardCabinImage={standardCabinImage}
								zipFullFlatImage={zipFullFlatImage}
								standardDesktopImage={standardDesktopImage}
								zipfullflatDesktopImage={zipfullflatDesktopImage}
								hasMultipleConnectingFlights={hasMultipleConnectingFlights}
								connectingFlightErrors={connectingFlightErrors ?? []}
								disableCabinSelection={disableCabinSelection}
							/>
						</>
					)}
				</div>
			</div>
		);
	}
);

BoundDisplay.displayName = "BoundDisplay";
