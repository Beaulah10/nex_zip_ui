/**
 * File: passenger-utils.test.ts
 * Classification: Helper
 * Description: Tests for buildPassengerList helper function.
 * Covers default structure, field mapping, and edge cases.
 */

import { describe, expect, it } from "vitest";
import { buildPassengerList } from "@/modules/utils/helpers/customer-information/passenger-utils/passenger-utils";
import type { PassengerValues } from "@/types/passenger/passenger.type";

function makeSource(overrides: Partial<PassengerValues> = {}): PassengerValues {
	return {
		id: "pax-1",
		passengerTypeCode: "adult",
		firstName: "JOHN",
		middleName: "JAMES",
		lastName: "SMITH",
		...overrides,
	};
}

describe("buildPassengerList - basic mapping", () => {
	it("maps id from source", () => {
		const result = buildPassengerList([makeSource({ id: "custom-id" })]);
		expect(result[0]?.id).toBe("custom-id");
	});

	it("maps passengerTypeCode from source", () => {
		const result = buildPassengerList([makeSource({ passengerTypeCode: "infant" })]);
		expect(result[0]?.passengerTypeCode).toBe("infant");
	});

	it("maps firstName from source", () => {
		const result = buildPassengerList([makeSource({ firstName: "ALICE" })]);
		expect(result[0]?.firstName).toBe("ALICE");
	});

	it("maps lastName from source", () => {
		const result = buildPassengerList([makeSource({ lastName: "WONDER" })]);
		expect(result[0]?.lastName).toBe("WONDER");
	});

	it("maps middleName from source", () => {
		const result = buildPassengerList([makeSource({ middleName: "MARIE" })]);
		expect(result[0]?.middleName).toBe("MARIE");
	});

	it("defaults middleName to empty string when undefined", () => {
		const result = buildPassengerList([makeSource({ middleName: undefined })]);
		expect(result[0]?.middleName).toBe("");
	});

	it("maps associateWithPassengerId to canonical association field", () => {
		const result = buildPassengerList([makeSource({ associateWithPassengerId: "adult-1" })]);
		expect(result[0]?.associateWithPassengerId).toBe("adult-1");
	});

	it("defaults association fields when no association exists", () => {
		const result = buildPassengerList([makeSource({ associateWithPassengerId: undefined })]);
		expect(result[0]?.associateWithPassengerId).toBe("");
		expect(result[0]?.hasAccompanyingAdult).toBe(false);
	});
});

describe("buildPassengerList - default field values", () => {
	it("sets isCompleted to false", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.isCompleted).toBe(false);
	});

	it("sets title to empty string", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.title).toBe("");
	});

	it("sets gender to empty string", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.gender).toBe("");
	});

	it("sets dateOfBirth to empty date parts", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.dateOfBirth).toEqual({ year: "", month: "", day: "" });
	});

	it("initialises contact and emergency information with empty strings", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.contactInformation).toMatchObject({
			countryCode: "",
			phoneNumber: "",
			email: "",
		});
		expect(result[0]?.emergencyContact).toMatchObject({
			countryCode: "",
			phoneNumber: "",
		});
	});

	it("initialises apisInfo with empty passport expiry", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.apisInfo?.passportExpiryDate).toEqual({ year: "", month: "", day: "" });
	});

	it("initialises assistanceService with requestingAssistance false", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.nonChargeable?.assistanceService?.requestingAssistance).toBe(false);
	});

	it("initialises dogForm with accompaniedByServiceDog false", () => {
		const result = buildPassengerList([makeSource()]);
		expect(result[0]?.nonChargeable?.dogForm?.accompaniedByServiceDog).toBe(false);
	});
});

describe("buildPassengerList - multiple passengers", () => {
	it("returns same number of passengers as input", () => {
		const sources = [
			makeSource({ id: "pax-1", passengerTypeCode: "adult" }),
			makeSource({ id: "pax-2", passengerTypeCode: "infant" }),
			makeSource({ id: "pax-3", passengerTypeCode: "childA" }),
		];
		const result = buildPassengerList(sources);
		expect(result).toHaveLength(3);
	});

	it("maps each passenger independently", () => {
		const sources = [
			makeSource({ id: "pax-1", firstName: "ALICE" }),
			makeSource({ id: "pax-2", firstName: "BOB" }),
		];
		const result = buildPassengerList(sources);
		expect(result[0]?.firstName).toBe("ALICE");
		expect(result[1]?.firstName).toBe("BOB");
	});
});

describe("buildPassengerList - empty input", () => {
	it("returns empty array for empty input", () => {
		expect(buildPassengerList([])).toEqual([]);
	});
});
