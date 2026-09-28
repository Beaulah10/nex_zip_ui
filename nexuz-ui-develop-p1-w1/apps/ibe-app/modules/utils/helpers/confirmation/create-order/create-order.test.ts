import { describe, expect, it } from "vitest";
import { buildConfirmationCreateOrderRequest } from "./create-order";

describe("buildConfirmationCreateOrderRequest", () => {
	it("maps confirmation passenger and receipt data into the create-order request", () => {
		const request = buildConfirmationCreateOrderRequest({
			verifyToken: "verified-token",
			passengerList: [
				{
					id: "p1",
					passengerTypeCode: "adult",
					firstName: "TEST",
					middleName: "MID",
					lastName: "USER",
					gender: "M",
					dateOfBirth: { year: "1996", month: "6", day: "6" },
					apisInfo: {
						passportNumber: "HUF13345",
						passportExpiryDate: { year: "2026", month: "6", day: "6" },
						nationality: "JPN",
						countryOfResidence: "JPN",
						destinationAddress: {
							hotelName: "Example Street",
							countryOfStay: "JPN",
							postalCode: "1000001",
							city: "Chiyoda",
							state: "Tokyo",
						},
					},
					nonChargeable: {
						travelDocument: {
							hasTravelDocs: true,
							documentType: "visa",
							documentNumber: "VISA123",
							documentExpiryDate: { year: "2028", month: "8", day: "9" },
							issuingCountry: "JPN",
						},
						assistanceService: { requestingAssistance: false },
						dogForm: { accompaniedByServiceDog: false },
						isPregnant: false,
					},
				},
			] as never,
			recipientInfo: {
				firstName: "REC",
				lastName: "USER",
				middleName: "MID",
				emailAddress: "abc@gmail.com",
			},
		});

		expect(request).toMatchObject({
			verifyToken: "verified-token",
			recipientInfo: {
				firstName: "REC",
				lastName: "USER",
				middleName: "MID",
				emailAddress: "abc@gmail.com",
			},
			passengers: [
				{
					id: 1,
					passengerType: "Adult",
					firstName: "TEST",
					middleName: "MID",
					lastName: "USER",
					gender: "M",
					dateOfBirth: "1996-06-06",
					nationality: "JPN",
					residenceCountry: "JPN",
					destinationAddress: {
						country: "JPN",
						postalCode: "1000001",
						state: "Tokyo",
						city: "Chiyoda",
						address: "Example Street",
					},
					documents: [
						{
							documentId: 1,
							documentNumber: "HUF13345",
							issuedCountry: "JPN",
							expiryDate: "2026-06-06",
							isScanned: false,
						},
						{
							documentId: 2,
							documentNumber: "VISA123",
							issuedCountry: "JPN",
							expiryDate: "2028-08-09",
							isScanned: false,
						},
					],
				},
			],
		});
	});

	it("omits optional fields when source values are blank and ignores unsupported travel documents", () => {
		const request = buildConfirmationCreateOrderRequest({
			verifyToken: "verified-token",
			passengerList: [
				{
					id: "p1",
					passengerTypeCode: "unknown",
					firstName: "  Jane  ",
					middleName: "   ",
					lastName: "  Doe ",
					gender: "f",
					dateOfBirth: { year: "2001", month: "7", day: "8" },
					nationality: "USA",
					apisInfo: {
						passportNumber: "P123",
						passportExpiryDate: { year: "2030", month: "1", day: "9" },
						nationality: "",
						countryOfResidence: "   ",
						destinationAddress: {
							hotelName: "   ",
							countryOfStay: "",
							postalCode: "",
							city: "",
							state: "",
						},
					},
					nonChargeable: {
						travelDocument: {
							hasTravelDocs: true,
							documentType: "unsupported",
							documentNumber: "X-1",
							documentExpiryDate: { year: "2032", month: "2", day: "3" },
						},
						assistanceService: { requestingAssistance: false },
						dogForm: { accompaniedByServiceDog: false },
						isPregnant: false,
					},
				},
				{
					id: "p2",
					passengerTypeCode: "childb",
					firstName: "Tom",
					lastName: "Kid",
					gender: "m",
					dateOfBirth: "2019-05-01",
					nationality: "CAN",
					apisInfo: {
						passportNumber: "P999",
						passportExpiryDate: { year: "2033", month: "6", day: "7" },
						nationality: "CAN",
						countryOfResidence: "CAN",
						destinationAddress: {
							hotelName: "Hotel Stay",
							countryOfStay: "CAN",
						},
					},
					nonChargeable: {
						travelDocument: {
							hasTravelDocs: true,
							documentType: "military-id",
							documentNumber: "MID-2",
							documentExpiryDate: { year: "2034", month: "8", day: "9" },
						},
						assistanceService: { requestingAssistance: false },
						dogForm: { accompaniedByServiceDog: false },
						isPregnant: false,
					},
				},
			] as never,
			recipientInfo: {
				firstName: "REC",
				lastName: "USER",
				emailAddress: "abc@gmail.com",
			},
		});

		expect(request.recipientInfo).toEqual({
			firstName: "REC",
			lastName: "USER",
			emailAddress: "abc@gmail.com",
		});
		expect(request.passengers[0]).toMatchObject({
			id: 1,
			passengerType: "Adult",
			firstName: "Jane",
			lastName: "Doe",
			gender: "F",
			dateOfBirth: "2001-07-08",
			nationality: "",
			documents: [
				{
					documentId: 1,
					documentNumber: "P123",
					expiryDate: "2030-01-09",
					isScanned: false,
					issuedCountry: "",
				},
			],
		});
		expect(request.passengers[0]).not.toHaveProperty("middleName");
		expect(request.passengers[0]).not.toHaveProperty("residenceCountry");
		expect(request.passengers[0]).not.toHaveProperty("destinationAddress");
		expect(request.passengers[1]).toMatchObject({
			id: 2,
			passengerType: "ChildB",
			nationality: "CAN",
			residenceCountry: "CAN",
			destinationAddress: {
				country: "CAN",
				address: "Hotel Stay",
			},
			documents: [
				{
					documentId: 1,
					documentNumber: "P999",
					issuedCountry: "CAN",
				},
				{
					documentId: 5,
					documentNumber: "MID-2",
					expiryDate: "2034-08-09",
					isScanned: false,
				},
			],
		});
	});
});
