import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/utils/constants/priority-service/passenger-types.constants", () => ({
	UNDER_SIX_DEPENDENT_TYPES: new Set(["inf"]),
}));

import type { AncillaryServiceOption } from "@/modules/utils/lounge.utils";
import type { PassengerService } from "@/types/passenger/passenger.type";
import {
	appendNewPassengers,
	createLoungeServiceForPassenger,
	createSavedPassengerMap,
	getPassengerLoungeSelections,
	updateExistingPassengers,
	updatePassengerServices,
} from "./lounge-dialog.helper";

const mockPassengerService: PassengerService = {
	lfid: 100,
	pfid: 200,
	amount: 5000,
	categoryId: 1,
	cutOffHours: 24,
	description: "Lounge",
	maxCountServiceLevel: 10,
	passengerType: "ADT",
	qtyAvailable: 5,
	ssrCode: "LNG",
	serviceID: 300,
	chargeComment: "",
	bundleCode: "",
};

const loungeOption = {
	id: "lounge-1",
	title: "Airport Lounge",
	price: 5000,
	ssrCode: "LNG",
	categoryId: 1,
	passengerType: "adt",
	service: {
		lfid: 100,
		pfid: 200,
		amount: 5000,
		cutOffHours: 24,
		description: "Lounge Access",
		maxCountServiceLevel: 10,
		qtyAvailable: 5,
		ssrCode: "LNG",
		ssrId: 300,
	} as any,
} as AncillaryServiceOption;

describe("createSavedPassengerMap", () => {
	it("creates map keyed by passenger id", () => {
		const result = createSavedPassengerMap([
			{
				id: "p1",
			} as any,
		]);

		expect(result.get("p1")?.id).toBe("p1");
	});

	it("returns empty map", () => {
		expect(createSavedPassengerMap([]).size).toBe(0);
	});
});

describe("createLoungeServiceForPassenger", () => {
	const optionMap = new Map([["adt", loungeOption]]);

	it("creates lounge service", () => {
		const result = createLoungeServiceForPassenger(
			{
				id: "1",
				passengerTypeCode: "adt",
			} as any,
			optionMap,
			[loungeOption]
		);

		expect(result).toMatchObject({
			lfid: 100,
			amount: 5000,
			qtyAvailable: 5,
			ssrCode: "LNG",
		});
	});

	it("returns undefined when no matching option exists", () => {
		const result = createLoungeServiceForPassenger(
			{
				id: "1",
				passengerTypeCode: "adt",
			} as any,
			new Map(),
			[]
		);

		expect(result).toBeUndefined();
	});

	it("returns zero amount for dependent passenger", () => {
		const result = createLoungeServiceForPassenger(
			{
				id: "1",
				passengerTypeCode: "inf",
			} as any,
			new Map([["inf", loungeOption]]),
			[loungeOption]
		);

		expect(result?.amount).toBe(0);
		expect(result?.qtyAvailable).toBe(0);
	});

	it("falls back to first lounge option", () => {
		const result = createLoungeServiceForPassenger(
			{
				id: "1",
				passengerTypeCode: "unknown",
			} as any,
			new Map(),
			[loungeOption]
		);

		expect(result?.lfid).toBe(100);
	});
});

describe("getPassengerLoungeSelections", () => {
	const optionMap = new Map([["adt", loungeOption]]);

	it("creates selected passenger map", () => {
		const result = getPassengerLoungeSelections(
			[
				{
					id: "p1",
					checked: true,
					passengerTypeCode: "adt",
				},
			] as any,
			[loungeOption],
			optionMap
		);

		expect(result.selectedLoungeServiceByPassengerId.size).toBe(1);
		expect(result.removableOptionsByPassengerId.size).toBe(1);
	});

	it("skips unchecked passengers", () => {
		const result = getPassengerLoungeSelections(
			[
				{
					id: "p1",
					checked: false,
					passengerTypeCode: "adt",
				},
			] as any,
			[loungeOption],
			optionMap
		);

		expect(result.selectedLoungeServiceByPassengerId.size).toBe(0);
	});

	it("falls back to full lounge service list", () => {
		const result = getPassengerLoungeSelections(
			[
				{
					id: "p1",
					checked: false,
					passengerTypeCode: "xyz",
				},
			] as any,
			[loungeOption],
			optionMap
		);

		expect(result.removableOptionsByPassengerId.get("p1")).toEqual([loungeOption]);
	});
});

describe("updatePassengerServices", () => {
	const loungeService = {
		lfid: 100,
		ssrCode: "LNG",
		serviceID: 300,
	} as any;

	const removable = [
		{
			service: {
				lfid: 100,
				ssrCode: "LNG",
				ssrId: 300,
			},
		},
	] as any;

	it("replaces removable lounge service", () => {
		const result = updatePassengerServices(
			{
				id: "p1",
				services: {
					lounge: [loungeService],
					"non-chargeable": [],
				},
			} as any,
			removable,
			{
				...loungeService,
				amount: 999,
			}
		);

		expect(result.services?.lounge).toHaveLength(1);
		expect(result.services?.lounge?.[0]).toMatchObject({
			lfid: 100,
			ssrCode: "LNG",
			serviceID: 300,
			amount: 999,
		});
	});

	it("removes lounge service when none selected", () => {
		const result = updatePassengerServices(
			{
				id: "p1",
				services: {
					lounge: [loungeService],
					"non-chargeable": [],
				},
			} as any,
			removable
		);

		expect(result.services?.lounge).toEqual([]);
	});
});

describe("updateExistingPassengers", () => {
	it("updates matching passengers only", () => {
		const selectedMap = new Map([
			[
				"p1",
				{
					lfid: 100,
				},
			],
		]);

		const removableMap = new Map([["p1", []]]);

		const result = updateExistingPassengers(
			[{ id: "p1" }, { id: "p2" }] as any,
			[
				{
					id: "p1",
				},
			] as any,
			[],
			selectedMap as any,
			removableMap as any
		);

		expect(result).toHaveLength(2);
	});
});

describe("appendNewPassengers", () => {
	it("appends new passenger", () => {
		const nextPassengers: any[] = [];

		appendNewPassengers(
			nextPassengers,
			[
				{
					id: "p1",
					name: "John",
					passengerTypeCode: "adt",
				},
			] as any,
			new Map(),
			new Map()
		);

		expect(nextPassengers).toHaveLength(1);
	});

	it("skips existing passenger", () => {
		const nextPassengers: any[] = [];

		appendNewPassengers(
			nextPassengers,
			[
				{
					id: "p1",
					name: "John",
					passengerTypeCode: "adt",
				},
			] as any,
			new Map([["p1", {} as any]]),
			new Map()
		);

		expect(nextPassengers).toHaveLength(0);
	});

	it("skips dependent passenger without lounge service", () => {
		const nextPassengers: any[] = [];

		appendNewPassengers(
			nextPassengers,
			[
				{
					id: "p1",
					name: "Child",
					passengerTypeCode: "inf",
				},
			] as any,
			new Map(),
			new Map()
		);

		expect(nextPassengers).toHaveLength(0);
	});

	it("adds dependent passenger when lounge service exists", () => {
		const nextPassengers: any[] = [];

		appendNewPassengers(
			nextPassengers,
			[
				{
					id: "p1",
					name: "Child",
					passengerTypeCode: "inf",
				},
			] as any,
			new Map(),
			new Map<string, PassengerService>([["p1", mockPassengerService]])
		);

		expect(nextPassengers).toHaveLength(1);
	});
});
