/**
 * File: passenger-utils.ts
 * Description: Helper functions for creating and initializing passenger data used throughout the Customer Information workflow.
 * It provides utilities for building passenger objects with default values and preparing passenger information structures for form handling and state management.
 */

import { emptyDatePart } from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

export const buildPassengerList = (sourceValues: PassengerValues[]): Passenger[] =>
	sourceValues.map(
		(pax) =>
			({
				id: pax.id,
				passengerTypeCode: pax.passengerTypeCode,
				title: "",
				firstName: pax.firstName,
				middleName: pax.middleName ?? "",
				lastName: pax.lastName,
				hasAccompanyingAdult: Boolean(pax.associateWithPassengerId),
				associateWithPassengerId: pax.associateWithPassengerId ?? "",
				dateOfBirth: { ...emptyDatePart },
				gender: "",
				weight: "",
				height: "",
				nationality: "",
				redressNumber: "",
				knownTravelerNumber: "",
				contactInformation: {
					countryCode: "",
					phoneNumber: "",
					email: "",
				},
				emergencyContact: {
					countryCode: "",
					phoneNumber: "",
				},
				apisInfo: {
					passportNumber: "",
					passportExpiryDate: { ...emptyDatePart },
					nationality: "",
					countryOfResidence: "",
					destinationAddress: {},
					redressNumber: "",
					knownTravelerNumber: "",
				},
				nonChargeable: {
					travelDocument: {
						hasTravelDocs: false,
						documentType: "",
						documentNumber: "",
						documentExpiryDate: { ...emptyDatePart },
						issuingCountry: "",
						purposeOfTravel: "",
						evusObtained: false,
					},
					isPregnant: false,
					pregnancyWeeks: "",
					assistanceService: {
						requestingAssistance: false,
						canManagePersonalNeeds: "",
						boardingWithAccompanion: "",
						accompanyingPersonName: "",
						assistanceReasons: [],
						canWalk: "",
						canGoUpDownStairs: "",
						needsOnboardWheelchair: "",
						reasonForWheelchair: "",
						bringingOwnWheelchair: "",
						wheelchairType: "",
						wheelchairBatteryType: "",
						wheelchairBatteryRemovable: "",
						isFoldable: "",
						wheelchairHeight: "",
						wheelchairWidth: "",
						wheelchairDepth: "",
						wheelchairWeight: "",
					},
					dogForm: {
						accompaniedByServiceDog: false,
						serviceDogType: "",
						serviceDogBreed: "",
						serviceDogWeight: "",
						serviceDogCagePresence: "",
						serviceDogCageHeight: "",
						serviceDogCageWidth: "",
						serviceDogCageDepth: "",
						serviceDogCageWeight: "",
					},
				},
				isCompleted: false,
				isVisaPopupShown: false,
			}) satisfies Passenger
	);
