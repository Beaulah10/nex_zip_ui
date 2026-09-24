import { describe, expect, it } from "vitest";
import { buildConfirmationOrderPrepareRequest } from "./order-prepare";

describe("buildConfirmationOrderPrepareRequest", () => {
	it("keeps seats, services, and bundles as empty arrays when passenger selections are missing", () => {
		const request = buildConfirmationOrderPrepareRequest({
			confirmedFlight: {
				tripType: "oneway",
				grandTotalAmount: 120,
				flights: {
					outbound: {
						segments: [
							{
								carrierCode: "ZG",
								origin: "NRT",
								destination: "ICN",
								flightNumber: "101",
								pfid: 10,
								lfid: 20,
								selectedCabin: "standard",
								scheduledDepartureArrivalDateTime: {
									departureDateTime: "2026-10-01T10:00:00",
									arrivalDateTime: "2026-10-01T13:00:00",
								},
								fareDetails: [
									{
										fareId: 1,
										fareClass: "Y",
										fareBasisCode: "Y01",
										passengerType: "ADT",
										baseFareAmtInclTax: 100,
										fareAmtInclTax: 120,
									},
								],
							},
						],
					},
				},
			} as never,
			passengerList: [
				{
					id: "p1",
					passengerTypeCode: "adult",
					firstName: "A",
					lastName: "B",
					dateOfBirth: "1990-01-01",
					gender: "m",
					nationality: "JP",
					isPrimary: true,
				},
			] as never,
			storedPassengers: [
				{
					id: "p1",
					passengerTypeCode: "adult",
					firstName: "A",
					lastName: "B",
					seats: undefined,
					services: undefined,
					bundles: undefined,
				},
			] as never,
			primaryPassengerId: "p1",
			marketingMails: false,
		});

		expect(request.passengers[0]).toMatchObject({
			seats: [],
			services: [],
			bundles: [],
		});

		const outboundFlight = request.flights.outbound[0];
		expect(outboundFlight).toBeDefined();

		const segment = outboundFlight?.segments[0];
		expect(segment).toBeDefined();

		const fareDetail = segment?.fareDetails[0];
		expect(fareDetail).toBeDefined();
		expect(fareDetail?.passengerType).toBe("Adult");
	});

	it("maps roundtrip fallback passengers, optional fields, and valid stored selections", () => {
		const request = buildConfirmationOrderPrepareRequest({
			confirmedFlight: {
				tripType: "roundtrip",
				grandTotalAmount: 450,
				flights: {
					outbound: {
						segments: [
							{
								carrierCode: "ZG",
								origin: "NRT",
								destination: "BKK",
								flightNumber: "bad-flight-number",
								pfid: 11,
								lfid: 21,
								selectedCabin: "zipfullflat",
								scheduledDepartureArrivalDateTime: {
									departureDateTime: "2026-10-01T10:00:00",
									arrivalDateTime: "2026-10-01T13:00:00",
								},
								fareDetails: [
									{
										fareId: 1,
										fareClass: "Y",
										fareBasisCode: "Y01",
										passengerType: "CHD",
										baseFareAmtInclTax: 100,
										fareAmtInclTax: 120,
									},
								],
							},
						],
					},
					inbound: {
						segments: [
							{
								carrierCode: "ZG",
								origin: "BKK",
								destination: "NRT",
								flightNumber: "202",
								pfid: 12,
								lfid: 22,
								selectedCabin: "standard",
								scheduledDepartureArrivalDateTime: {
									departureDateTime: "2026-10-02T10:00:00",
									arrivalDateTime: "2026-10-02T13:00:00",
								},
								fareDetails: [
									{
										fareId: 2,
										fareClass: "Z",
										fareBasisCode: "Z01",
										passengerType: "INF",
										baseFareAmtInclTax: 90,
										fareAmtInclTax: 110,
									},
								],
							},
						],
					},
				},
			} as never,
			passengerList: [
				{
					id: "p1",
					passengerTypeCode: "adult",
					firstName: "Primary",
					middleName: "Mid",
					lastName: "User",
					dateOfBirth: { year: "1990", month: "3", day: "4" },
					gender: "f",
					nationality: "JP",
					isPrimaryPassenger: true,
					apisInfo: {
						redressNumber: "RED123",
						knownTravelerNumber: "KTN456",
						nationality: "JPN",
						countryOfResidence: "JP",
					},
					contactInformation: {
						countryCode: "+81",
						phoneNumber: "12345678",
						email: "primary@example.com",
					},
					emergencyContact: {
						countryCode: "+81",
						phoneNumber: "8888",
					},
				} as never,
				{
					id: "p2",
					passengerTypeCode: "childb",
					firstName: "Stored",
					lastName: "Passenger",
					dateOfBirth: "2018-08-09",
					gender: "m",
					nationality: "TH",
				} as never,
			],
			storedPassengers: [
				{
					id: "p2",
					passengerTypeCode: "inf",
					firstName: " StoredFirst ",
					lastName: " StoredLast ",
					dateOfBirth: { year: "2019", month: "1", day: "2" },
					gender: "f",
					associateWithPassengerId: "p1",
					height: "101",
					weight: "",
					contactInformation: {
						countryCode: "+66",
						phoneNumber: "9999999",
						email: "stored@example.com",
					},
					emergencyContact: {
						phoneNumber: "7777",
					},
					seats: [
						{
							lfid: 22,
							pfid: 12,
							row: "4",
							column: "A",
							serviceCode: "SEAT",
							amount: 30,
							bundleCode: "BUNDLE",
						},
					],
					services: {
						meals: [
							{
								lfid: 22,
								pfid: 12,
								amount: 15,
								categoryId: 3,
								ssrCode: "MEAL",
								serviceID: 55,
								chargeComment: "special",
								bundleCode: "MEALB",
							},
						],
					},
					bundles: [
						{
							lfid: 22,
							pfid: 12,
							bundleCode: "BASIC",
							amount: 40,
							categoryId: 8,
							serviceID: 77,
						},
						{
							lfid: 22,
							pfid: 12,
							bundleCode: "INVALID",
						},
					],
					isPrimaryPassenger: false,
				} as never,
			],
			primaryPassengerId: "p1",
			marketingMails: true,
		});

		expect(request.tripType).toBe("roundTrip");
		expect(request.flights.outbound[0]?.segments[0]).toMatchObject({
			flightNumber: 0,
			cabin: "ZIPFULLFLAT",
			fareDetails: [expect.objectContaining({ passengerType: "ChildA", amtInclTax: 120 })],
		});
		expect(request.flights.inbound?.[0]?.segments[0]).toMatchObject({
			flightNumber: 202,
			cabin: "STANDARD",
			fareDetails: [expect.objectContaining({ passengerType: "Infant" })],
		});
		expect(request.passengers[0]).toMatchObject({
			id: 1,
			passengerType: "Adult",
			gender: "F",
			dateOfBirth: "1990-03-04",
			redressNumber: "RED123",
			knownTravelerNumber: "KTN456",
			nationality: "JPN",
			isPrimaryPassenger: true,
			contactInformation: {
				countryCode: "+81",
				phoneNumber: "12345678",
				email: "primary@example.com",
			},
			emergencyContact: {
				countryCode: "+81",
				phoneNumber: "8888",
			},
		});
		expect(request.passengers[1]).toMatchObject({
			id: 2,
			passengerType: "Infant",
			associateWithPassengerId: 1,
			gender: "F",
			dateOfBirth: "2019-01-02",
			height: 101,
			marketingMails: true,
			seats: [
				{
					lfid: 22,
					pfid: 12,
					row: 4,
					column: "A",
					serviceCode: "SEAT",
					amount: 30,
					bundleCode: "BUNDLE",
				},
			],
			services: [
				{
					lfid: 22,
					pfid: 12,
					amount: 15,
					categoryId: 3,
					ssrCode: "MEAL",
					serviceID: 55,
					chargeComment: "special",
					bundleCode: "MEALB",
				},
			],
			bundles: [
				{
					lfid: 22,
					pfid: 12,
					bundleCode: "BASIC",
					amount: 40,
					categoryId: 8,
					serviceId: 77,
				},
			],
		});
		expect(request.passengers[1]?.emergencyContact).toEqual({ phoneNumber: "7777" });
		expect(request.passengers[1]).not.toHaveProperty("weight");
	});
});
