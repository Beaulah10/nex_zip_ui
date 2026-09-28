/**
 * File: baggage-passenger-list.tsx
 * Description: Component that displays a list of passengers and their baggage selections.
 */

"use client";
import { useEffect, useRef } from "react";
import { PassengerService } from "@/components/common/passenger-service/passenger-service";
import {
	areAllBaggageServicesMapped,
	mapBaggageCategories,
} from "@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories";
import type { BaggagePassengerListTypes } from "@/types/baggage-selection/baggage-selection.types";

export function BaggagePassengerList({
	passengers,
	baggageSelections,
	onPassengerClick,
	translate,
	focusPassengerId,
	onFocusRestored,
}: BaggagePassengerListTypes) {
	const passengerCardRefs = useRef(new Map<string, HTMLDivElement>());

	useEffect(() => {
		if (!focusPassengerId) {
			return;
		}

		const passengerCard = passengerCardRefs.current.get(focusPassengerId);

		if (!passengerCard) {
			return;
		}

		passengerCard.focus({
			preventScroll: true,
		});

		const rect = passengerCard.getBoundingClientRect();
		const isInView =
			rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);

		if (!isInView) {
			passengerCard.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
		}

		onFocusRestored?.();
	}, [focusPassengerId, onFocusRestored]);
	return (
		<>
			{passengers.map((passenger) => {
				const selection = baggageSelections[passenger.id];

				if (!selection) {
					return null;
				}

				const baggageCategories = mapBaggageCategories({
					categories: selection.categories,
					t: translate,
				});
				const isBaggageSelected = areAllBaggageServicesMapped(selection.baggageServices);
				return (
					// biome-ignore lint/a11y/useSemanticElements: fieldset alters visual styling; div with role="group" is intentional
					<div
						key={passenger.id}
						ref={(element) => {
							if (element) {
								passengerCardRefs.current.set(passenger.id, element);
							} else {
								passengerCardRefs.current.delete(passenger.id);
							}
						}}
						role="group"
						tabIndex={-1}
						aria-label={translate("aria_labels.passenger_baggage_card", {
							passengerName: passenger.name,
						})}
						className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
					>
						<PassengerService
							key={passenger.id}
							name={passenger.name}
							showAddButton={
								!isBaggageSelected && (passenger.bundleCode === "NOBN" || !passenger.bundleCode)
							}
							bundleLabelKey={passenger.bundleLabel}
							features={[...passenger.baggagefeatures]}
							categories={baggageCategories}
							totalPrice={selection.totalPrice}
							onAdd={() => onPassengerClick(passenger.id)}
							onChange={() => onPassengerClick(passenger.id)}
							adultType={passenger.passengerTypeCode}
						/>
					</div>
				);
			})}
		</>
	);
}
