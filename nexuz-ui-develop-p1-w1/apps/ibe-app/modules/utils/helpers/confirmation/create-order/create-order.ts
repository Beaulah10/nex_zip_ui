/**
 * File: create-order.ts
 * Description: Utility functions used to construct the Create Order API request
 * payload during the booking confirmation process. Handles transformation of
 * passenger information, travel documents, passport details, destination
 * address data, recipient information, and passenger identifiers into the
 * SDK-compliant request structure required for order creation. Also provides
 * normalization of passenger types, gender values, date formatting, document
 * validation, and passenger-to-request mapping logic for booking completion
 * workflows.
 */
import {
	type NEXUZR005APIsCreateOrderRequest,
	type NEXUZR005APIsDestinationAddress,
	type NEXUZR005APIsDocument,
	NEXUZR005APIsPassengerGenderEnum,
	NEXUZR005APIsPassengerPassengerTypeEnum,
} from "@repo/sdk";
import { CREATE_ORDER_DOCUMENT_IDS } from "@/modules/utils/constants/arkose/arkose.constants";
import type { ReceiptRecipientInfo } from "@/types/confirmation/confirmation.types";
import type {
	Passenger as CustomerPassenger,
	PassengerDateValue,
} from "@/types/customer-information/customer-information.types";

function isCreateOrderDocumentType(
	documentType: string
): documentType is keyof typeof CREATE_ORDER_DOCUMENT_IDS {
	return documentType in CREATE_ORDER_DOCUMENT_IDS;
}

function toPassengerType(
	passengerTypeCode?: string
): NEXUZR005APIsCreateOrderRequest["passengers"][number]["passengerType"] {
	switch (passengerTypeCode?.trim().toLowerCase()) {
		case "adult":
		case "adt":
			return NEXUZR005APIsPassengerPassengerTypeEnum.adult;
		case "childa":
		case "chd":
			return NEXUZR005APIsPassengerPassengerTypeEnum.childA;
		case "childb":
			return NEXUZR005APIsPassengerPassengerTypeEnum.childB;
		case "childc":
			return NEXUZR005APIsPassengerPassengerTypeEnum.childC;
		case "infant":
		case "inf":
			return NEXUZR005APIsPassengerPassengerTypeEnum.infant;
		default:
			return NEXUZR005APIsPassengerPassengerTypeEnum.adult;
	}
}

function toPassengerGender(
	gender?: string
): NEXUZR005APIsCreateOrderRequest["passengers"][number]["gender"] {
	return gender?.trim().toLowerCase() === "f"
		? NEXUZR005APIsPassengerGenderEnum.f
		: NEXUZR005APIsPassengerGenderEnum.m;
}

function toDateString(value?: PassengerDateValue): string {
	if (!value) {
		return "";
	}

	if (typeof value === "string") {
		return value;
	}

	const year = value.year?.trim() ?? "";
	const month = value.month?.trim() ? value.month.trim().padStart(2, "0") : "";
	const day = value.day?.trim() ? value.day.trim().padStart(2, "0") : "";

	return year && month && day ? `${year}-${month}-${day}` : "";
}

function buildPassengerIdMap(passengerList: ReadonlyArray<CustomerPassenger>): Map<string, number> {
	return new Map(passengerList.map((passenger, index) => [passenger.id, index + 1]));
}

function buildPassportDocument(passenger: CustomerPassenger): NEXUZR005APIsDocument {
	return {
		documentId: CREATE_ORDER_DOCUMENT_IDS.passport,
		documentNumber: passenger.apisInfo?.passportNumber ?? "",
		expiryDate: toDateString(passenger.apisInfo?.passportExpiryDate),
		isScanned: false,
		...(passenger.apisInfo?.nationality || passenger.nationality
			? { issuedCountry: passenger.apisInfo?.nationality ?? passenger.nationality ?? "" }
			: {}),
	};
}

function buildTravelDocument(passenger: CustomerPassenger): NEXUZR005APIsDocument | null {
	const travelDocument = passenger.nonChargeable?.travelDocument;
	const documentType = travelDocument?.documentType;

	if (
		!travelDocument?.hasTravelDocs ||
		!documentType ||
		!travelDocument.documentNumber ||
		!travelDocument.documentExpiryDate
	) {
		return null;
	}

	if (!isCreateOrderDocumentType(documentType)) {
		return null;
	}

	return {
		documentId: CREATE_ORDER_DOCUMENT_IDS[documentType],
		documentNumber: travelDocument.documentNumber,
		expiryDate: toDateString(travelDocument.documentExpiryDate),
		isScanned: false,
		...(travelDocument.issuingCountry ? { issuedCountry: travelDocument.issuingCountry } : {}),
	};
}

function buildDocuments(passenger: CustomerPassenger): NEXUZR005APIsDocument[] {
	const travelDocument = buildTravelDocument(passenger);

	return travelDocument
		? [buildPassportDocument(passenger), travelDocument]
		: [buildPassportDocument(passenger)];
}

function buildDestinationAddress(
	passenger: CustomerPassenger
): NEXUZR005APIsDestinationAddress | undefined {
	const destinationAddress = passenger.apisInfo?.destinationAddress;

	if (!destinationAddress) {
		return undefined;
	}

	const address: NEXUZR005APIsDestinationAddress = {
		...(destinationAddress.countryOfStay?.trim()
			? { country: destinationAddress.countryOfStay.trim() }
			: {}),
		...(destinationAddress.postalCode?.trim()
			? { postalCode: destinationAddress.postalCode.trim() }
			: {}),
		...(destinationAddress.state?.trim() ? { state: destinationAddress.state.trim() } : {}),
		...(destinationAddress.city?.trim() ? { city: destinationAddress.city.trim() } : {}),
		...(destinationAddress.hotelName?.trim()
			? { address: destinationAddress.hotelName.trim() }
			: {}),
	};

	return Object.keys(address).length > 0 ? address : undefined;
}

export function buildConfirmationCreateOrderRequest({
	verifyToken,
	passengerList,
	recipientInfo,
}: {
	verifyToken: string;
	passengerList: ReadonlyArray<CustomerPassenger>;
	recipientInfo: ReceiptRecipientInfo;
}): NEXUZR005APIsCreateOrderRequest {
	const passengerIdMap = buildPassengerIdMap(passengerList);

	return {
		verifyToken,
		passengers: passengerList.map((passenger) => {
			const passengerId = passengerIdMap.get(passenger.id);

			if (!passengerId) {
				throw new Error(
					`Unable to build CreateOrder request: missing passenger id for ${passenger.id}`
				);
			}

			const destinationAddress = buildDestinationAddress(passenger);

			return {
				id: passengerId,
				passengerType: toPassengerType(passenger.passengerTypeCode),
				firstName: passenger.firstName?.trim() ?? "",
				...(passenger.middleName?.trim() ? { middleName: passenger.middleName.trim() } : {}),
				lastName: passenger.lastName?.trim() ?? "",
				gender: toPassengerGender(passenger.gender),
				dateOfBirth: toDateString(passenger.dateOfBirth),
				nationality: passenger.apisInfo?.nationality ?? passenger.nationality ?? "",
				...(passenger.apisInfo?.countryOfResidence?.trim()
					? { residenceCountry: passenger.apisInfo.countryOfResidence.trim() }
					: {}),
				...(destinationAddress ? { destinationAddress } : {}),
				documents: buildDocuments(passenger),
			};
		}),
		recipientInfo: {
			firstName: recipientInfo.firstName,
			lastName: recipientInfo.lastName,
			...(recipientInfo.middleName ? { middleName: recipientInfo.middleName } : {}),
			emailAddress: recipientInfo.emailAddress,
		},
	};
}
