/**
 * File: customer-information-utils.ts
 * Description: Helper functions for customer information form processing, passenger data transformation, and workflow management.
 * It provides utilities for passenger type mapping, form-to-passenger conversion, phone extension handling, validation focus management, and passenger-related business logic.
 */

import { type CountryCode, getCountries, getCountryCallingCode } from "libphonenumber-js";
import type {
	FieldError,
	FieldErrors,
	Path,
	UseFormGetValues,
	UseFormSetValue,
	UseFormTrigger,
} from "react-hook-form";
import {
	EXTRA_RADIX_PHONE_COUNTRIES,
	RADIX_PHONE_COUNTRY_OVERRIDES,
} from "@/modules/utils/constants/customer-information/country.constants";
import type { FlightSegment } from "@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import type { DatePart, Passenger } from "@/types/customer-information/customer-information.types";
import type { FlightSelectionRequest } from "@/types/flight-selection/flight-selection.types";

//............ Date part for empty date values (year, month, day) ............//
export const emptyDatePart = {
	year: "",
	month: "",
	day: "",
};

//..................... Default phone extension code .....................//
export const DEFAULT_PHONE_EXTENSION = "us";

/** Convert a country code ("jp") to a dial code ("+81") for storing in Redux. */
const codeToDialCode = (code: string): string => {
	if (!code || code.startsWith("+")) return code;
	const lower = code.toLowerCase();
	const override = RADIX_PHONE_COUNTRY_OVERRIDES[lower];
	if (override?.dialCode) return override.dialCode;
	const extra = EXTRA_RADIX_PHONE_COUNTRIES.find((c) => c.code === lower);
	if (extra?.dialCode) return extra.dialCode;
	try {
		return `+${getCountryCallingCode(code.toUpperCase() as CountryCode)}`;
	} catch {
		return code;
	}
};

/** Convert a dial code ("+81") back to a country code ("jp") for the form UI. */
const dialCodeToCode = (dialCode: string): string => {
	if (!dialCode?.startsWith("+")) return dialCode ?? DEFAULT_PHONE_EXTENSION;
	const numericPart = dialCode.slice(1);
	const overrideEntry = Object.entries(RADIX_PHONE_COUNTRY_OVERRIDES).find(
		([_, v]) => v.dialCode === dialCode
	);
	if (overrideEntry) return overrideEntry[0];
	const extra = EXTRA_RADIX_PHONE_COUNTRIES.find((c) => c.dialCode === dialCode);
	if (extra) return extra.code;
	const match = getCountries().find((c) => String(getCountryCallingCode(c)) === numericPart);
	return match ? match.toLowerCase() : DEFAULT_PHONE_EXTENSION;
};

const getDefaultExtensionCode = (value: string | undefined): string => {
	if (!value || value.trim() === "") return DEFAULT_PHONE_EXTENSION;
	// Dial codes stored in Redux (e.g. "+81") → convert back to country code for the form UI
	if (value.startsWith("+")) return dialCodeToCode(value);
	return value;
};

//............ map form to passenger and passenger to form for redux state management ............//
export const mapFormToPassenger = (
	formData: PassengerInformation,
	passenger: Passenger
): Passenger => {
	const phoneCountryCode = codeToDialCode(formData.phoneExtension);
	const emergencyCountryCode = codeToDialCode(formData.emergencyExtension);
	return {
		...passenger,
		id: passenger.id,
		passengerTypeCode: passenger.passengerTypeCode,
		firstName: formData.firstName,
		middleName: formData.middleName,
		lastName: formData.lastName,
		dateOfBirth: formData.dateOfBirth,
		gender: formData.gender,
		nationality: formData.nationality,
		redressNumber: formData.redressNumber,
		knownTravelerNumber: formData.knownTravelerNumber,
		weight: formData.bodyWeight,
		height: formData.bodyHeight,
		contactInformation: {
			countryCode: phoneCountryCode,
			phoneNumber: formData.phoneNumber,
			email: formData.email,
		},
		emergencyContact: {
			countryCode: emergencyCountryCode,
			phoneNumber: formData.emergencyNumber,
		},
		apisInfo: {
			passportNumber: formData.passportNumber,
			passportExpiryDate: formData.passportExpiryDate,
			nationality: formData.nationality,
			countryOfResidence: formData.countryOfResidence,
			destinationAddress: {
				hotelName: formData.hotelName,
				countryOfStay: formData.countryOfStay,
				postalCode: formData.postalCode,
				city: formData.city,
				state: formData.state,
			},
			redressNumber: formData.redressNumber,
			knownTravelerNumber: formData.knownTravelerNumber,
		},
		nonChargeable: {
			travelDocument: {
				hasTravelDocs: formData.hasTravelDocs,
				documentType: formData.documentType,
				documentNumber: formData.documentNumber,
				documentExpiryDate: formData.documentExpiryDate,
				issuingCountry: formData.issuingCountry,
				purposeOfTravel: formData.purposeOfTravel,
				evusObtained: formData.evusObtained,
			},
			isPregnant: formData.isPregnant,
			pregnancyWeeks: formData.pregnancyWeeks,
			assistanceService: {
				requestingAssistance: formData.requestingAssistance,
				canManagePersonalNeeds: formData.canManagePersonalNeeds,
				boardingWithAccompanion: formData.boardingWithAccompanion,
				accompanyingPersonName: formData.accompanyingPersonName,
				assistanceReasons: formData.assistanceReasons,
				canWalk: formData.canWalk,
				canGoUpDownStairs: formData.canGoUpDownStairs,
				needsOnboardWheelchair: formData.needsOnboardWheelchair,
				reasonForWheelchair: formData.reasonForWheelchair,
				bringingOwnWheelchair: formData.bringingOwnWheelchair,
				wheelchairType: formData.wheelchairType,
				wheelchairBatteryType: formData.wheelchairBatteryType,
				wheelchairBatteryRemovable: formData.wheelchairBatteryRemovable,
				isFoldable: formData.isFoldable,
				wheelchairHeight: formData.wheelchairHeight,
				wheelchairWidth: formData.wheelchairWidth,
				wheelchairDepth: formData.wheelchairDepth,
				wheelchairWeight: formData.wheelchairWeight,
			},
			dogForm: {
				accompaniedByServiceDog: formData.accompaniedByServiceDog ?? false,
				serviceDogType: formData.serviceDogType,
				serviceDogBreed: formData.serviceDogBreed,
				serviceDogWeight: formData.serviceDogWeight,
				serviceDogCagePresence: formData.serviceDogCagePresence,
				serviceDogCageHeight: formData.serviceDogCageHeight,
				serviceDogCageWidth: formData.serviceDogCageWidth,
				serviceDogCageDepth: formData.serviceDogCageDepth,
				serviceDogCageWeight: formData.serviceDogCageWeight,
			},
		},
		isCompleted: true,
	};
};

export const mapPassengerToForm = (stored: Passenger): PassengerInformation => {
	const legacyContact = stored.contactInformation as
		| {
				phoneExtension?: string;
				emergencyExtension?: string;
				emergencyNumber?: string;
		  }
		| undefined;
	const dateOfBirth =
		stored.dateOfBirth && typeof stored.dateOfBirth === "object"
			? stored.dateOfBirth
			: emptyDatePart;

	return {
		lastName: stored.lastName ?? "",
		firstName: stored.firstName ?? "",
		middleName: stored.middleName ?? "",
		gender: stored.gender as PassengerInformation["gender"],
		dateOfBirth,
		nationality: stored.apisInfo?.nationality ?? stored.nationality ?? "",
		countryOfResidence: stored.apisInfo?.countryOfResidence ?? "",
		bodyWeight: stored.weight == null ? "" : String(stored.weight),
		bodyHeight: stored.height == null ? "" : String(stored.height),
		passportNumber: stored.apisInfo?.passportNumber ?? "",
		passportExpiryDate: stored.apisInfo?.passportExpiryDate ?? emptyDatePart,
		phoneExtension: getDefaultExtensionCode(
			stored.contactInformation?.countryCode ?? legacyContact?.phoneExtension
		),
		phoneNumber: stored.contactInformation?.phoneNumber ?? "",
		email: stored.contactInformation?.email ?? "",
		emailConfirmation: stored.contactInformation?.email ?? "",
		emergencyExtension: getDefaultExtensionCode(
			stored.emergencyContact?.countryCode ?? legacyContact?.emergencyExtension
		),
		emergencyNumber: stored.emergencyContact?.phoneNumber ?? legacyContact?.emergencyNumber ?? "",
		hotelName: stored.apisInfo?.destinationAddress?.hotelName ?? "",
		countryOfStay: stored.apisInfo?.destinationAddress?.countryOfStay ?? "",
		postalCode: stored.apisInfo?.destinationAddress?.postalCode ?? "",
		city: stored.apisInfo?.destinationAddress?.city ?? "",
		state: stored.apisInfo?.destinationAddress?.state ?? "",
		redressNumber: stored.apisInfo?.redressNumber ?? stored.redressNumber ?? "",
		knownTravelerNumber: stored.apisInfo?.knownTravelerNumber ?? stored.knownTravelerNumber ?? "",
		hasTravelDocs: stored.nonChargeable?.travelDocument?.hasTravelDocs ?? false,
		documentType: stored.nonChargeable?.travelDocument
			?.documentType as PassengerInformation["documentType"],
		documentNumber: stored.nonChargeable?.travelDocument?.documentNumber ?? "",
		documentExpiryDate: stored.nonChargeable?.travelDocument?.documentExpiryDate ?? emptyDatePart,
		issuingCountry: stored.nonChargeable?.travelDocument?.issuingCountry ?? "",
		purposeOfTravel: stored.nonChargeable?.travelDocument?.purposeOfTravel,
		evusObtained: stored.nonChargeable?.travelDocument?.evusObtained ?? false,
		isPregnant: stored.nonChargeable?.isPregnant ?? false,
		pregnancyWeeks: stored.nonChargeable?.pregnancyWeeks ?? "",
		requestingAssistance: stored.nonChargeable?.assistanceService?.requestingAssistance ?? false,
		canManagePersonalNeeds: stored.nonChargeable?.assistanceService?.canManagePersonalNeeds ?? "",
		boardingWithAccompanion: stored.nonChargeable?.assistanceService?.boardingWithAccompanion ?? "",
		accompanyingPersonName: stored.nonChargeable?.assistanceService?.accompanyingPersonName ?? "",
		assistanceReasons: stored.nonChargeable?.assistanceService?.assistanceReasons ?? [],
		canWalk: stored.nonChargeable?.assistanceService?.canWalk ?? "",
		canGoUpDownStairs: stored.nonChargeable?.assistanceService?.canGoUpDownStairs ?? "",
		needsOnboardWheelchair: stored.nonChargeable?.assistanceService?.needsOnboardWheelchair ?? "",
		reasonForWheelchair: stored.nonChargeable?.assistanceService?.reasonForWheelchair ?? "",
		bringingOwnWheelchair: stored.nonChargeable?.assistanceService?.bringingOwnWheelchair ?? "",
		wheelchairType: stored.nonChargeable?.assistanceService?.wheelchairType ?? "",
		wheelchairBatteryType: stored.nonChargeable?.assistanceService?.wheelchairBatteryType ?? "",
		wheelchairBatteryRemovable:
			stored.nonChargeable?.assistanceService?.wheelchairBatteryRemovable ?? "",
		isFoldable: stored.nonChargeable?.assistanceService?.isFoldable ?? "",
		wheelchairHeight: stored.nonChargeable?.assistanceService?.wheelchairHeight ?? "",
		wheelchairWidth: stored.nonChargeable?.assistanceService?.wheelchairWidth ?? "",
		wheelchairDepth: stored.nonChargeable?.assistanceService?.wheelchairDepth ?? "",
		wheelchairWeight: stored.nonChargeable?.assistanceService?.wheelchairWeight ?? "",
		accompaniedByServiceDog: stored.nonChargeable?.dogForm?.accompaniedByServiceDog ?? false,
		serviceDogType: stored.nonChargeable?.dogForm?.serviceDogType ?? "",
		serviceDogBreed: stored.nonChargeable?.dogForm?.serviceDogBreed ?? "",
		serviceDogWeight: stored.nonChargeable?.dogForm?.serviceDogWeight ?? "",
		serviceDogCagePresence: stored.nonChargeable?.dogForm?.serviceDogCagePresence ?? "",
		serviceDogCageHeight: stored.nonChargeable?.dogForm?.serviceDogCageHeight ?? "",
		serviceDogCageWidth: stored.nonChargeable?.dogForm?.serviceDogCageWidth ?? "",
		serviceDogCageDepth: stored.nonChargeable?.dogForm?.serviceDogCageDepth ?? "",
		serviceDogCageWeight: stored.nonChargeable?.dogForm?.serviceDogCageWeight ?? "",
	};
};

//............... Helper function for Default Passenger for FormInitialState ..............
// ── Empty defaults ─────────────────────────────────────────────────────────────
export const emptyPassenger: PassengerInformation = {
	lastName: "",
	firstName: "",
	middleName: "",
	gender: "" as PassengerInformation["gender"],
	dateOfBirth: { year: "", month: "", day: "" },
	nationality: "",
	countryOfResidence: "",
	bodyWeight: "",
	bodyHeight: "",
	passportNumber: "",
	passportExpiryDate: { year: "", month: "", day: "" },
	phoneExtension: DEFAULT_PHONE_EXTENSION,
	phoneNumber: "",
	email: "",
	emailConfirmation: "",
	emergencyExtension: DEFAULT_PHONE_EXTENSION,
	emergencyNumber: "",
	hotelName: "",
	countryOfStay: "",
	postalCode: "",
	city: "",
	state: "",
	redressNumber: "",
	knownTravelerNumber: "",
	hasTravelDocs: false,
	documentType: undefined,
	documentNumber: "",
	documentExpiryDate: { year: "", month: "", day: "" },
	issuingCountry: "",
	purposeOfTravel: undefined,
	evusObtained: false,
	isPregnant: false,
	pregnancyWeeks: "",
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
	accompaniedByServiceDog: false,
	serviceDogType: "",
	serviceDogBreed: "",
	serviceDogWeight: "",
	serviceDogCagePresence: "",
	serviceDogCageHeight: "",
	serviceDogCageWidth: "",
	serviceDogCageDepth: "",
	serviceDogCageWeight: "",
};

//................... Is Primary Passenger ...................//
export const isPrimaryPassenger = (passenger: Passenger, primaryPassengerId: string): boolean =>
	passenger.id === primaryPassengerId;

//................... Get Field Error Message ..................//
export const getFieldErrors = (error?: FieldError) =>
	error ? [{ message: error.message }] : undefined;

//................... trigger date field validation on change .................//
export const triggerFieldDateValidation = (
	fieldName: "passportExpiryDate" | "documentExpiryDate" | "dateOfBirth",
	errors: FieldErrors<PassengerInformation>,
	trigger: UseFormTrigger<PassengerInformation>,
	getValues: UseFormGetValues<PassengerInformation>
) => {
	const { year, month, day } = getValues(fieldName) as DatePart;

	if (errors[fieldName] || (year && month && day)) {
		trigger(fieldName);
	}
};
export const isFieldDateInvalid = (
	fieldName: "passportExpiryDate" | "documentExpiryDate" | "dateOfBirth",
	errors: FieldErrors<PassengerInformation>,
	getValues: UseFormGetValues<PassengerInformation>,
	datePartString: keyof DatePart
) => {
	const datePart = getValues(fieldName) as DatePart;
	const { year, month, day } = datePart;

	return !!(errors[fieldName] && ((year && month && day) || !datePart[datePartString]));
};

//................... FieldChange handler for trigger validation and setValue .............//
export const handleFieldOnChange = (
	fieldName: Path<PassengerInformation>,
	value: string,
	setValue: UseFormSetValue<PassengerInformation>,
	hasError: boolean
) => {
	setValue(fieldName, value, { shouldDirty: true, shouldValidate: hasError });
};

//.................... Helper function for route determination ....................//
export const getRoutesFromFlightSelection = (
	routeData: FlightSelectionRequest
): FlightSegment[] => {
	const codes = routeData.routes.split(",").map((code) => code.trim());
	let segments: FlightSegment[] = [];
	if (routeData?.departureDateTo) {
		segments = [
			{ origin: codes[0] ?? "", destination: codes[1] ?? "" },
			{ origin: codes[1] ?? "", destination: codes[0] ?? "" },
		];
	} else if (codes.length > 2) {
		segments = [
			{ origin: codes[0] ?? "", destination: codes[1] ?? "" },
			{ origin: codes[1] ?? "", destination: codes[2] ?? "" },
		];
	} else {
		segments = [{ origin: codes[0] ?? "", destination: codes[1] ?? "" }];
	}
	// First code is always origin
	// Remaining codes are destinations (including connections)
	return segments;
};

//.................... Helper function for date validation ....................//
export const getDaysInMonth = (year?: string, month?: string): number => {
	const numericMonth = Number(month);

	if (!month || numericMonth < 1 || numericMonth > 12) {
		return 31;
	}

	/*
	 * February depends on the selected year.
	 * Until a year is selected, allow 29 because the year may be a leap year.
	 */
	if (!year && numericMonth === 2) {
		return 29;
	}

	/*
	 * For all other months, the number of days does not depend on the year.
	 * 2000 is used as a safe fallback leap year.
	 */
	const numericYear = year ? Number(year) : 2000;

	return new Date(Date.UTC(numericYear, numericMonth, 0)).getUTCDate();
};

export const getValidDaysForMonth = (year?: string, month?: string): string[] => {
	const numberOfDays = getDaysInMonth(year, month);

	return Array.from({ length: numberOfDays }, (_, index) => String(index + 1).padStart(2, "0"));
};

export const getAdjustedDay = ({
	day,
	month,
	year,
}: {
	day?: string;
	month?: string;
	year?: string;
}): string => {
	if (!day) {
		return "";
	}

	const lastValidDay = getDaysInMonth(year, month);
	const numericDay = Number(day);

	if (numericDay <= lastValidDay) {
		return day;
	}

	return String(lastValidDay).padStart(2, "0");
};
