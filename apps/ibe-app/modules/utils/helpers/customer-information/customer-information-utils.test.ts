/**
 * File: customer-information-utils.test.ts
 * Description: Unit tests for customer-information-utils helper functions.
 * Covers passenger mapping, phone extension conversion, validation triggers, focus handling, and utility branches.
 */

import type { FieldError } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

const phoneMocks = vi.hoisted(() => ({
	getCountries: vi.fn(),
	getCountryCallingCode: vi.fn(),
}));

vi.mock("libphonenumber-js", () => ({
	getCountries: phoneMocks.getCountries,
	getCountryCallingCode: phoneMocks.getCountryCallingCode,
}));

vi.mock("@/modules/utils/constants/customer-information/country.constants", () => ({
	RADIX_PHONE_COUNTRY_OVERRIDES: {
		zz: {
			dialCode: "+999",
		},
	},
	EXTRA_RADIX_PHONE_COUNTRIES: [
		{
			code: "aa",
			dialCode: "+111",
		},
	],
}));

import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import { setFocusOnInvalidInput } from "../common/field-focus/field-focus";
import {
	DEFAULT_PHONE_EXTENSION,
	emptyDatePart,
	emptyPassenger,
	getFieldErrors,
	handleFieldOnChange,
	isPrimaryPassenger,
	mapFormToPassenger,
	mapPassengerToForm,
	triggerFieldDateValidation,
} from "./customer-information-utils";

type LegacyContactInformation = NonNullable<Passenger["contactInformation"]> & {
	phoneExtension?: string;
	emergencyExtension?: string;
	emergencyNumber?: string;
};

function makePassenger(overrides: Partial<Passenger> = {}): Passenger {
	return {
		id: "",
		passengerTypeCode: "",
		firstName: "",
		lastName: "",
		...overrides,
	};
}
describe("customer-information-utils", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		document.body.innerHTML = "";

		phoneMocks.getCountries.mockReturnValue(["US", "JP", "IN"]);

		phoneMocks.getCountryCallingCode.mockImplementation((code: string) => {
			if (code === "JP") return "81";
			if (code === "IN") return "91";
			if (code === "US") return "1";
			throw new Error("Invalid country code");
		});
	});

	describe("static defaults", () => {
		it("should expose empty date part and default phone extension", () => {
			expect(emptyDatePart).toEqual({
				year: "",
				month: "",
				day: "",
			});

			expect(DEFAULT_PHONE_EXTENSION).toBe("us");
		});

		it("should expose empty passenger default values", () => {
			expect(emptyPassenger.firstName).toBe("");
			expect(emptyPassenger.phoneExtension).toBe("us");
			expect(emptyPassenger.emergencyExtension).toBe("us");
			expect(emptyPassenger.hasTravelDocs).toBe(false);
			expect(emptyPassenger.accompaniedByServiceDog).toBe(false);
			expect(emptyPassenger.assistanceReasons).toEqual([]);
		});
	});

	describe("mapFormToPassenger", () => {
		const passenger = makePassenger({
			id: "PAX-1",
			passengerTypeCode: "adult",
		});

		const formData = {
			firstName: "John",
			middleName: "K",
			lastName: "Doe",
			dateOfBirth: {
				year: "1990",
				month: "01",
				day: "10",
			},
			gender: "male",
			bodyWeight: "70",
			bodyHeight: "175",
			phoneExtension: "zz",
			phoneNumber: "1234567890",
			email: "john@example.com",
			nationality: "JP",
			passportNumber: "A1234567",
			passportExpiryDate: {
				year: "2030",
				month: "12",
				day: "31",
			},
			emergencyExtension: "aa",
			emergencyNumber: "9876543210",
			countryOfResidence: "JP",
			hotelName: "Tokyo Hotel",
			countryOfStay: "JP",
			postalCode: "1000001",
			city: "Tokyo",
			state: "Tokyo",
			redressNumber: "RED123",
			knownTravelerNumber: "KTN123",
			hasTravelDocs: true,
			documentType: "passport",
			documentNumber: "DOC123",
			documentExpiryDate: {
				year: "2029",
				month: "11",
				day: "20",
			},
			issuingCountry: "JP",
			purposeOfTravel: "tourism",
			evusObtained: true,
			isPregnant: true,
			pregnancyWeeks: "12",
			requestingAssistance: true,
			canManagePersonalNeeds: "yes",
			boardingWithAccompanion: "yes",
			accompanyingPersonName: "Jane Doe",
			assistanceReasons: ["wheelchair"],
			canWalk: "no",
			canGoUpDownStairs: "no",
			needsOnboardWheelchair: "yes",
			reasonForWheelchair: "medical",
			bringingOwnWheelchair: "yes",
			wheelchairType: "manual",
			wheelchairBatteryType: "dry",
			wheelchairBatteryRemovable: "yes",
			isFoldable: "yes",
			wheelchairHeight: "80",
			wheelchairWidth: "50",
			wheelchairDepth: "60",
			wheelchairWeight: "15",
			accompaniedByServiceDog: true,
			serviceDogType: "guide",
			serviceDogBreed: "labrador",
			serviceDogWeight: "25",
			serviceDogCagePresence: "yes",
			serviceDogCageHeight: "50",
			serviceDogCageWidth: "40",
			serviceDogCageDepth: "60",
			serviceDogCageWeight: "10",
		} as unknown as PassengerInformation;

		it("should convert form data to passenger data with override and extra dial codes", () => {
			const result = mapFormToPassenger(formData, passenger);

			expect(result.id).toBe("PAX-1");
			expect(result.passengerTypeCode).toBe("adult");
			expect(result.firstName).toBe("John");
			expect(result.weight).toBe("70");
			expect(result.height).toBe("175");
			expect(result.contactInformation?.countryCode).toBe("+999");
			expect(result.emergencyContact?.countryCode).toBe("+111");
			expect(result.emergencyContact?.phoneNumber).toBe("9876543210");
			expect(result.apisInfo?.destinationAddress?.hotelName).toBe("Tokyo Hotel");
			expect(result.nonChargeable?.travelDocument.hasTravelDocs).toBe(true);
			expect(result.nonChargeable?.assistanceService.requestingAssistance).toBe(true);
			expect(result.nonChargeable?.dogForm.accompaniedByServiceDog).toBe(true);
			expect(result.isCompleted).toBe(true);
		});

		it("should convert normal country code to dial code", () => {
			const result = mapFormToPassenger(
				{
					...formData,
					phoneExtension: "jp",
					emergencyExtension: "in",
				},
				passenger
			);

			expect(result.contactInformation?.countryCode).toBe("+81");
			expect(result.emergencyContact?.countryCode).toBe("+91");
		});

		it("should keep plus dial code and fallback invalid country code as-is", () => {
			const result = mapFormToPassenger(
				{
					...formData,
					phoneExtension: "+91",
					emergencyExtension: "bad",
				},
				passenger
			);

			expect(result.contactInformation?.countryCode).toBe("+91");
			expect(result.emergencyContact?.countryCode).toBe("bad");
		});

		it("should handle empty phone extension and default service dog flag", () => {
			const result = mapFormToPassenger(
				{
					...formData,
					phoneExtension: "",
					accompaniedByServiceDog: undefined,
				},
				passenger
			);

			expect(result.contactInformation?.countryCode).toBe("");
			expect(result.nonChargeable?.dogForm.accompaniedByServiceDog).toBe(false);
		});
	});

	describe("mapPassengerToForm", () => {
		it("should convert stored passenger data to form data with full values", () => {
			const stored = makePassenger({
				lastName: "Doe",
				firstName: "John",
				middleName: "K",
				gender: "male",
				dateOfBirth: {
					year: "1990",
					month: "01",
					day: "10",
				},
				weight: "70",
				height: "175",
				contactInformation: {
					countryCode: "+999",
					phoneNumber: "1234567890",
					email: "john@example.com",
				},
				emergencyContact: {
					countryCode: "+111",
					phoneNumber: "9876543210",
				},
				apisInfo: {
					passportNumber: "A1234567",
					passportExpiryDate: {
						year: "2030",
						month: "12",
						day: "31",
					},
					nationality: "JP",
					countryOfResidence: "JP",
					destinationAddress: {
						hotelName: "Tokyo Hotel",
						countryOfStay: "JP",
						postalCode: "1000001",
						city: "Tokyo",
						state: "Tokyo",
					},
					redressNumber: "RED123",
					knownTravelerNumber: "KTN123",
				},
				nonChargeable: {
					travelDocument: {
						hasTravelDocs: true,
						documentType: "passport",
						documentNumber: "DOC123",
						documentExpiryDate: {
							year: "2029",
							month: "11",
							day: "20",
						},
						issuingCountry: "JP",
						purposeOfTravel: "tourism",
						evusObtained: true,
					},
					isPregnant: true,
					pregnancyWeeks: "12",
					assistanceService: {
						requestingAssistance: true,
						canManagePersonalNeeds: "yes",
						boardingWithAccompanion: "yes",
						accompanyingPersonName: "Jane Doe",
						assistanceReasons: ["wheelchair"],
						canWalk: "no",
						canGoUpDownStairs: "no",
						needsOnboardWheelchair: "yes",
						reasonForWheelchair: "medical",
						bringingOwnWheelchair: "yes",
						wheelchairType: "manual",
						wheelchairBatteryType: "dry",
						wheelchairBatteryRemovable: "yes",
						isFoldable: "yes",
						wheelchairHeight: "80",
						wheelchairWidth: "50",
						wheelchairDepth: "60",
						wheelchairWeight: "15",
					},
					dogForm: {
						accompaniedByServiceDog: true,
						serviceDogType: "guide",
						serviceDogBreed: "labrador",
						serviceDogWeight: "25",
						serviceDogCagePresence: "yes",
						serviceDogCageHeight: "50",
						serviceDogCageWidth: "40",
						serviceDogCageDepth: "60",
						serviceDogCageWeight: "10",
					},
				},
			});

			const result = mapPassengerToForm(stored);

			expect(result.firstName).toBe("John");
			expect(result.emailConfirmation).toBe("john@example.com");
			expect(result.phoneExtension).toBe("zz");
			expect(result.emergencyExtension).toBe("aa");
			expect(result.hotelName).toBe("Tokyo Hotel");
			expect(result.hasTravelDocs).toBe(true);
			expect(result.requestingAssistance).toBe(true);
			expect(result.accompaniedByServiceDog).toBe(true);
			expect(result.serviceDogCageWeight).toBe("10");
		});

		it("should convert dial code using country list match", () => {
			const stored = makePassenger({
				contactInformation: {
					countryCode: "+81",
				},
				emergencyContact: {
					countryCode: "+91",
				},
			});

			const result = mapPassengerToForm(stored);

			expect(result.phoneExtension).toBe("jp");
			expect(result.emergencyExtension).toBe("in");
		});

		it("should fallback to default code for unknown dial code", () => {
			const stored = makePassenger({
				contactInformation: {
					countryCode: "+777",
				},
				emergencyContact: {
					countryCode: "+888",
				},
			});

			const result = mapPassengerToForm(stored);

			expect(result.phoneExtension).toBe("us");
			expect(result.emergencyExtension).toBe("us");
		});

		it("should keep non-plus extension code as-is", () => {
			const legacyContactInformation: LegacyContactInformation = {
				phoneExtension: "jp",
				emergencyExtension: "in",
			};
			const stored = makePassenger({
				contactInformation: legacyContactInformation,
			});

			const result = mapPassengerToForm(stored);

			expect(result.phoneExtension).toBe("jp");
			expect(result.emergencyExtension).toBe("in");
		});

		it("should return empty defaults when stored passenger has no nested values", () => {
			const result = mapPassengerToForm(makePassenger());

			expect(result.lastName).toBe("");
			expect(result.firstName).toBe("");
			expect(result.dateOfBirth).toEqual(emptyDatePart);
			expect(result.passportExpiryDate).toEqual(emptyDatePart);
			expect(result.phoneExtension).toBe("us");
			expect(result.emergencyExtension).toBe("us");
			expect(result.email).toBe("");
			expect(result.hasTravelDocs).toBe(false);
			expect(result.evusObtained).toBe(false);
			expect(result.isPregnant).toBe(false);
			expect(result.requestingAssistance).toBe(false);
			expect(result.assistanceReasons).toEqual([]);
			expect(result.accompaniedByServiceDog).toBe(false);
		});

		it("should return default extension when stored extension is blank", () => {
			const stored = makePassenger({
				contactInformation: {
					countryCode: "   ",
				},
				emergencyContact: {
					countryCode: "",
				},
			});

			const result = mapPassengerToForm(stored);

			expect(result.phoneExtension).toBe("us");
			expect(result.emergencyExtension).toBe("us");
		});
	});

	describe("setFocusOnInvalidInput", () => {
		it("should scroll and focus first invalid input element", () => {
			document.body.innerHTML = `<input aria-invalid="true" />`;

			const input = document.querySelector("input") as HTMLInputElement;
			input.scrollIntoView = vi.fn();
			input.focus = vi.fn();

			setFocusOnInvalidInput();

			expect(input.scrollIntoView).toHaveBeenCalledWith({
				behavior: "smooth",
				block: "center",
			});
			expect(input.focus).toHaveBeenCalledTimes(1);
		});

		it("should focus nested focusable element when invalid element is wrapper", () => {
			document.body.innerHTML = `
                <div aria-invalid="true">
                    <button type="button">Select</button>
                </div>
            `;

			const wrapper = document.querySelector("div") as HTMLDivElement;
			const button = document.querySelector("button") as HTMLButtonElement;

			wrapper.scrollIntoView = vi.fn();
			button.focus = vi.fn();

			setFocusOnInvalidInput();

			expect(wrapper.scrollIntoView).toHaveBeenCalledWith({
				behavior: "smooth",
				block: "center",
			});
			expect(button.focus).toHaveBeenCalledTimes(1);
		});

		it("should not throw when invalid wrapper has no focusable element", () => {
			document.body.innerHTML = `<div aria-invalid="true"></div>`;

			const wrapper = document.querySelector("div") as HTMLDivElement;
			wrapper.scrollIntoView = vi.fn();

			expect(() => setFocusOnInvalidInput()).not.toThrow();
			expect(wrapper.scrollIntoView).toHaveBeenCalledTimes(1);
		});

		it("should do nothing when there are no invalid fields", () => {
			document.body.innerHTML = `<input aria-invalid="false" />`;

			expect(() => setFocusOnInvalidInput()).not.toThrow();
		});
	});

	describe("isPrimaryPassenger", () => {
		it("should return true when passenger id matches primary passenger id", () => {
			expect(isPrimaryPassenger(makePassenger({ id: "PAX-1" }), "PAX-1")).toBe(true);
		});

		it("should return false when passenger id does not match primary passenger id", () => {
			expect(isPrimaryPassenger(makePassenger({ id: "PAX-2" }), "PAX-1")).toBe(false);
		});
	});

	describe("getFieldErrors", () => {
		it("should return error message array when error exists", () => {
			const error = {
				message: "Required field",
			} as FieldError;

			expect(getFieldErrors(error)).toEqual([
				{
					message: "Required field",
				},
			]);
		});

		it("should return undefined when error does not exist", () => {
			expect(getFieldErrors()).toBeUndefined();
		});
	});

	describe("triggerFieldDateValidation", () => {
		it("should trigger validation when field has existing error", () => {
			const trigger = vi.fn();
			const getValues = vi.fn().mockReturnValue({
				year: "",
				month: "",
				day: "",
			});

			triggerFieldDateValidation(
				"dateOfBirth",
				{
					dateOfBirth: {
						message: "Invalid date",
					} as FieldError,
				},
				trigger,
				getValues
			);

			expect(trigger).toHaveBeenCalledWith("dateOfBirth");
		});

		it("should trigger validation when year month and day are filled", () => {
			const trigger = vi.fn();
			const getValues = vi.fn().mockReturnValue({
				year: "1990",
				month: "01",
				day: "10",
			});

			triggerFieldDateValidation("passportExpiryDate", {}, trigger, getValues);

			expect(trigger).toHaveBeenCalledWith("passportExpiryDate");
		});

		it("should not trigger validation when no error and date parts are incomplete", () => {
			const trigger = vi.fn();
			const getValues = vi.fn().mockReturnValue({
				year: "1990",
				month: "",
				day: "10",
			});

			triggerFieldDateValidation("documentExpiryDate", {}, trigger, getValues);

			expect(trigger).not.toHaveBeenCalled();
		});
	});

	describe("handleFieldOnChange", () => {
		it("should set value with validation when field has error", () => {
			const setValue = vi.fn();

			handleFieldOnChange("firstName", "John", setValue, true);

			expect(setValue).toHaveBeenCalledWith("firstName", "John", {
				shouldDirty: true,
				shouldValidate: true,
			});
		});

		it("should set value without validation when field has no error", () => {
			const setValue = vi.fn();

			handleFieldOnChange("lastName", "Doe", setValue, false);

			expect(setValue).toHaveBeenCalledWith("lastName", "Doe", {
				shouldDirty: true,
				shouldValidate: false,
			});
		});
	});
});
