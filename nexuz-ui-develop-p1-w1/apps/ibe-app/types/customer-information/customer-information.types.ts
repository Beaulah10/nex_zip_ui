/**
 * File: customer-information.types.ts
 * Description: Type definitions used throughout the Customer Information workflow.
 * It defines passenger, contact, APIS, travel document, assistance service, and service dog data structures used for form handling, state management, and passenger information processing.
 */

import type {
	Control,
	FieldErrors,
	UseFormGetValues,
	UseFormSetValue,
	UseFormTrigger,
} from "react-hook-form";
import type { MrzParseResult } from "@/modules/utils/helpers/customer-information/passport-scan-engine-utils/passport-scan-engine-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import type { PassengerValues } from "@/types/passenger/passenger.type";
// ── Primitive Types ────────────────────────────────────────────────────────────

export type DatePart = {
	year: string;
	month: string;
	day: string;
};

// ── Contact Information ────────────────────────────────────────────────────────

export type ContactInformation = {
	phoneExtension: string;
	phoneNumber: string;
	email: string;
	emergencyExtension: string;
	emergencyNumber: string;
};

// ── APIS Info ─────────────────────────────────────────────────────────────────

export type DestinationAddress = {
	hotelName?: string;
	countryOfStay?: string;
	postalCode?: string;
	city?: string;
	state?: string;
};

export type ApisInfo = {
	passportNumber: string;
	passportExpiryDate: DatePart;
	nationality: string;
	countryOfResidence: string;
	destinationAddress: DestinationAddress;
	redressNumber?: string;
	knownTravelerNumber?: string;
};

// ── Travel Document ────────────────────────────────────────────────────────────

export type TravelDocument = {
	hasTravelDocs: boolean;
	documentType?: string;
	documentNumber?: string;
	documentExpiryDate?: DatePart;
	issuingCountry?: string;
	purposeOfTravel?: string;
	evusObtained?: boolean;
};

// ── Assistance Service ─────────────────────────────────────────────────────────

export type AssistanceService = {
	requestingAssistance: boolean;
	canManagePersonalNeeds?: string;
	boardingWithAccompanion?: string;
	accompanyingPersonName?: string;
	assistanceReasons?: string[];
	canWalk?: string;
	canGoUpDownStairs?: string;
	needsOnboardWheelchair?: string;
	reasonForWheelchair?: string;
	bringingOwnWheelchair?: string;
	wheelchairType?: string;
	wheelchairBatteryType?: string;
	wheelchairBatteryRemovable?: string;
	isFoldable?: string;
	wheelchairHeight?: string;
	wheelchairWidth?: string;
	wheelchairDepth?: string;
	wheelchairWeight?: string;
};

// ── Dog Form ───────────────────────────────────────────────────────────────────

export type DogForm = {
	accompaniedByServiceDog: boolean;
	serviceDogType?: string;
	serviceDogBreed?: string;
	serviceDogWeight?: string;
	serviceDogCagePresence?: string;
	serviceDogCageHeight?: string;
	serviceDogCageWidth?: string;
	serviceDogCageDepth?: string;
	serviceDogCageWeight?: string;
};

// ── Non-Chargeable Services ────────────────────────────────────────────────────

export type NonChargeable = {
	travelDocument: TravelDocument;
	isPregnant: boolean;
	pregnancyWeeks?: string;
	assistanceService: AssistanceService;
	dogForm: DogForm;
};

// -- passenger type for redux state ------------------
export type Passenger = PassengerValues & {
	title?: string;
	apisInfo?: ApisInfo;
	nonChargeable?: NonChargeable;
	isCompleted?: boolean;
	/** True after user has confirmed the VISA popup for this passenger */
	isVisaPopupShown?: boolean;
	hasAccompanyingAdult?: boolean;
};
//.................... Type for customer Informtion date field helper hook ........................
type PassengerDateFieldName = "dateOfBirth" | "passportExpiryDate" | "documentExpiryDate";

export type PassengerDateValue =
	| Passenger["dateOfBirth"]
	| NonNullable<Passenger["apisInfo"]>["passportExpiryDate"];

export type UseDateFieldParams = {
	fieldName: PassengerDateFieldName;
	control: Control<PassengerInformation>;
	errors: FieldErrors<PassengerInformation>;
	trigger: UseFormTrigger<PassengerInformation>;
	getValues: UseFormGetValues<PassengerInformation>;
	setValue: UseFormSetValue<PassengerInformation>;
};

export interface PassportScannerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onScanComplete: (result: MrzParseResult) => void;
}
