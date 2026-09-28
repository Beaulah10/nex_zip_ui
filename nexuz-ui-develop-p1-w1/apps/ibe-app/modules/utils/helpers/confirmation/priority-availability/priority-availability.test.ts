import { describe, expect, it } from "vitest";
import {
	detectPriorityAvailabilityIssue,
	resolvePriorityAvailabilityIssue,
} from "./priority-availability";

function makeExpressService(serviceID: number, qtyAvailable: number, lfid = 10) {
	return {
		ssrId: serviceID,
		ssrCode: "EXPS",
		description: "ZIPAIR Express",
		qtyAvailable,
		amount: 2500,
		lfid,
	};
}

function makePassenger(
	id: string,
	passengerTypeCode: string,
	options: {
		associateWithPassengerId?: string;
		express?: Array<{ lfid: number; ssrCode: string; serviceID: number; description: string }>;
	} = {}
) {
	return {
		id,
		firstName: `First${id}`,
		lastName: `Last${id}`,
		passengerTypeCode,
		associateWithPassengerId: options.associateWithPassengerId,
		services: {
			express: options.express ?? [],
		},
	} as any;
}

function ancillaryDataWithExpress(qtyAvailable: number, lfid = 10) {
	return {
		data: {
			servicesPerPassengerType: [
				{
					passengerType: "adult",
					categories: [
						{ categoryId: 1, specialServices: [makeExpressService(201, qtyAvailable, lfid)] },
					],
				},
			],
		},
	} as any;
}

describe("detectPriorityAvailabilityIssue", () => {
	it("returns selected-priority-unavailable when an existing selection becomes unavailable", () => {
		const passengers = [
			makePassenger("P1", "adult", {
				express: [
					{
						lfid: 10,
						ssrCode: "EXPS",
						serviceID: 201,
						description: "ZIPAIR Express",
					},
				],
			}),
		];

		expect(
			detectPriorityAvailabilityIssue({
				ancillaryData: ancillaryDataWithExpress(0),
				storedPassengers: passengers,
				orderedPassengerIds: ["P1"],
				lfid: 10,
			})
		).toEqual({
			type: "selected-priority-unavailable",
			unavailableServices: [
				{
					passengerId: "P1",
					passengerName: "FirstP1 LastP1",
					serviceName: "ZIPAIR Express",
				},
			],
			servicesToRemove: [
				{
					passengerId: "P1",
					lfid: 10,
					ssrCode: "EXPS",
					serviceID: 201,
				},
			],
			affectedPassengerIds: ["P1"],
		});
	});
});

describe("resolvePriorityAvailabilityIssue", () => {
	it("expands disabled passengers to associated dependents and keeps the dialog closed for them", () => {
		const passengers = [
			makePassenger("P1", "adult", {
				express: [{ lfid: 10, ssrCode: "EXPS", serviceID: 201, description: "ZIPAIR Express" }],
			}),
			makePassenger("P2", "adult", {
				express: [{ lfid: 10, ssrCode: "EXPS", serviceID: 201, description: "ZIPAIR Express" }],
			}),
			makePassenger("C1", "childC", {
				associateWithPassengerId: "P2",
				express: [{ lfid: 10, ssrCode: "EXPS", serviceID: 201, description: "ZIPAIR Express" }],
			}),
		];

		expect(
			resolvePriorityAvailabilityIssue({
				ancillaryData: ancillaryDataWithExpress(1),
				storedPassengers: passengers,
				orderedPassengerIds: ["P1", "P2", "C1"],
				lfid: 10,
				clickedPassengerId: "C1",
				allPassengerIds: ["P1", "P2", "C1"],
			})
		).toEqual({
			type: "selected-priority-unavailable",
			servicesToRemove: [
				{ passengerId: "P2", lfid: 10, ssrCode: "EXPS", serviceID: 201 },
				{ passengerId: "C1", lfid: 10, ssrCode: "EXPS", serviceID: 201 },
			],
			disabledPassengerIds: ["P2", "C1"],
			contentSuffix: "ZIPAIR Express : FirstP2 LastP2",
			shouldReopenDialog: false,
		});
	});

	it("reopens the dialog when the clicked passenger is still available", () => {
		const passengers = [
			makePassenger("P1", "adult", {
				express: [{ lfid: 10, ssrCode: "EXPS", serviceID: 201, description: "ZIPAIR Express" }],
			}),
			makePassenger("P2", "adult", {
				express: [{ lfid: 10, ssrCode: "EXPS", serviceID: 201, description: "ZIPAIR Express" }],
			}),
		];

		expect(
			resolvePriorityAvailabilityIssue({
				ancillaryData: ancillaryDataWithExpress(1),
				storedPassengers: passengers,
				orderedPassengerIds: ["P1", "P2"],
				lfid: 10,
				clickedPassengerId: "P1",
				allPassengerIds: ["P1", "P2"],
			})
		).toMatchObject({
			type: "selected-priority-unavailable",
			disabledPassengerIds: ["P2"],
			shouldReopenDialog: true,
		});
	});
});
