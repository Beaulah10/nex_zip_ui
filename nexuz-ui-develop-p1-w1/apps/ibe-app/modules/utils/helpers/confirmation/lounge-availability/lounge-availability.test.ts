import { describe, expect, it } from "vitest";
import {
	detectLoungeAvailabilityIssue,
	resolveLoungeAvailabilityIssue,
} from "./lounge-availability";

function makeLoungeService(serviceID: number, qtyAvailable: number, lfid = 10) {
	return {
		ssrId: serviceID,
		ssrCode: "LNGB",
		description: "Narita Lounge",
		qtyAvailable,
		amount: 4500,
		lfid,
	};
}

function makePassenger(
	id: string,
	passengerTypeCode: string,
	options: {
		associateWithPassengerId?: string;
		lounge?: Array<{ lfid: number; ssrCode: string; serviceID: number; description: string }>;
	} = {}
) {
	return {
		id,
		firstName: `First${id}`,
		lastName: `Last${id}`,
		passengerTypeCode,
		associateWithPassengerId: options.associateWithPassengerId,
		services: {
			lounge: options.lounge ?? [],
		},
	} as any;
}

function ancillaryDataWithLounge(qtyAvailable: number, lfid = 10) {
	return {
		data: {
			servicesPerPassengerType: [
				{
					passengerType: "adult",
					categories: [
						{ categoryId: 2, specialServices: [makeLoungeService(301, qtyAvailable, lfid)] },
					],
				},
			],
		},
	} as any;
}

it("returns selected-lounge-unavailable when an existing selection becomes unavailable", () => {
	const passengers = [
		makePassenger("P1", "adult", {
			lounge: [
				{
					lfid: 10,
					ssrCode: "LNGB",
					serviceID: 301,
					description: "Narita Lounge",
				},
			],
		}),
	];

	expect(
		detectLoungeAvailabilityIssue({
			ancillaryData: ancillaryDataWithLounge(0),
			storedPassengers: passengers,
			orderedPassengerIds: ["P1"],
			lfid: 10,
		})
	).toEqual({
		type: "selected-lounge-unavailable",
		unavailableLounges: [
			{
				passengerId: "P1",
				passengerName: "FirstP1 LastP1",
				loungeName: "Narita Lounge",
			},
		],
		loungesToRemove: [
			{
				passengerId: "P1",
				lfid: 10,
				ssrCode: "LNGB",
				serviceID: 301,
			},
		],
		affectedPassengerIds: ["P1"],
	});
});

describe("resolveLoungeAvailabilityIssue", () => {
	it("expands disabled passengers to associated dependents and keeps the dialog closed for them", () => {
		const passengers = [
			makePassenger("P1", "adult", {
				lounge: [{ lfid: 10, ssrCode: "LNGB", serviceID: 301, description: "Narita Lounge" }],
			}),
			makePassenger("P2", "adult", {
				lounge: [{ lfid: 10, ssrCode: "LNGB", serviceID: 301, description: "Narita Lounge" }],
			}),
			makePassenger("C1", "childC", {
				associateWithPassengerId: "P2",
			}),
		];

		expect(
			resolveLoungeAvailabilityIssue({
				ancillaryData: ancillaryDataWithLounge(1),
				storedPassengers: passengers,
				orderedPassengerIds: ["P1", "P2", "C1"],
				lfid: 10,
				clickedPassengerId: "C1",
				allPassengerIds: ["P1", "P2", "C1"],
			})
		).toEqual({
			type: "selected-lounge-unavailable",
			loungesToRemove: [{ passengerId: "P2", lfid: 10, ssrCode: "LNGB", serviceID: 301 }],
			disabledPassengerIds: ["P2", "C1"],
			contentSuffix: "Narita Lounge : FirstP2 LastP2",
			shouldReopenDialog: false,
		});
	});

	it("reopens the dialog when the clicked passenger is still available", () => {
		const passengers = [
			makePassenger("P1", "adult", {
				lounge: [{ lfid: 10, ssrCode: "LNGB", serviceID: 301, description: "Narita Lounge" }],
			}),
			makePassenger("P2", "adult", {
				lounge: [{ lfid: 10, ssrCode: "LNGB", serviceID: 301, description: "Narita Lounge" }],
			}),
		];

		expect(
			resolveLoungeAvailabilityIssue({
				ancillaryData: ancillaryDataWithLounge(1),
				storedPassengers: passengers,
				orderedPassengerIds: ["P1", "P2"],
				lfid: 10,
				clickedPassengerId: "P1",
				allPassengerIds: ["P1", "P2"],
			})
		).toMatchObject({
			type: "selected-lounge-unavailable",
			disabledPassengerIds: ["P2"],
			shouldReopenDialog: true,
		});
	});
});
