/**
 * File: passenger-list.tsx
 * Description: Passenger List component that renders all passengers available in the booking.
 * It displays a collection of passenger cards and provides access to manage customer information for each passenger.
 */

"use client";

import { PassengerCard } from "@/components/customer-information/passenger-details/passenger-card/passenger-card";
import { useAppSelector } from "@/store/hooks";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";

/**
 * Passenger List component that displays a collection of passenger cards and provides access to manage customer information for each passenger.
 */
export function PassengerList() {
	const passengerList = useAppSelector(selectPassengerList);

	return (
		<>
			{/* Passenger cards */}
			<div className="passenger-list flex flex-col gap-4 pt-4 md:pt-6">
				{passengerList.map((passenger, index) => (
					<PassengerCard key={passenger.id} passenger={passenger} passengerIndex={index} />
				))}
			</div>
		</>
	);
}
