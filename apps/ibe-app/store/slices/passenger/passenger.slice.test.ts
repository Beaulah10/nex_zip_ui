import { describe, expect, it } from "vitest";
import reducer, {
	addExtrasService,
	removeExtrasService,
	setPassengerNames,
} from "@/store/slices/passenger/passenger.slice";

describe("passenger slice", () => {
	it("returns initial state", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state).toEqual({
			passengers: [],
			submitted: false,
		});
	});

	it("stores passenger names and marks submission", () => {
		const payload = [
			{
				id: "1",
				passengerTypeCode: "adult",
				firstName: "JOHN",
				lastName: "DOE",
			},
			{
				id: "2",
				passengerTypeCode: "infant",
				associateWithPassengerId: "1",
				firstName: "BABY",
				lastName: "DOE",
			},
		];

		const state = reducer(undefined, setPassengerNames(payload));

		expect(state.passengers).toEqual(payload);
		expect(state.submitted).toBe(true);
	});

	it("preserves existing bundles, seats, and services when passenger names are updated", () => {
		const previousState = {
			passengers: [
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "OLD",
					lastName: "NAME",
					bundles: [{ lfid: 101, pfid: 1, bundleCode: "BASIC" }],
					seats: [{ lfid: 101, pfid: 1, seatNumber: "12A" }],
					services: {
						"non-chargeable": [{ lfid: 101, ssrCode: "MEAL", serviceID: 1, amount: 0 }],
						chargeable: [],
						baggage: [],
						extras: [],
					},
				},
			],
			submitted: false,
		};

		const nextState = reducer(
			previousState as unknown as Parameters<typeof reducer>[0],
			setPassengerNames([
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "NEW",
					lastName: "NAME",
				},
			])
		);

		expect(nextState.passengers[0]).toMatchObject({
			id: "1",
			passengerTypeCode: "adult",
			firstName: "NEW",
			lastName: "NAME",
			bundles: [{ lfid: 101, pfid: 1, bundleCode: "BASIC" }],
			seats: [{ lfid: 101, pfid: 1, seatNumber: "12A" }],
		});
		expect(nextState.passengers[0]?.services?.["non-chargeable"]).toEqual([
			{ lfid: 101, ssrCode: "MEAL", serviceID: 1, amount: 0 },
		]);
	});

	it("creates setPassengerNames action with correct type", () => {
		const action = setPassengerNames([]);

		expect(action.type).toBe("passenger/setPassengerNames");
		expect(action.payload).toEqual([]);
	});

	it("stores extras separately when ssrCode is same but lfid differs", () => {
		const baseState = reducer(
			undefined,
			setPassengerNames([
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "JOHN",
					lastName: "DOE",
				},
			])
		);

		const withOutbound = reducer(
			baseState,
			addExtrasService({
				passengerId: "1",
				service: {
					ssrCode: "MEAL",
					lfid: 1001,
					amount: 10,
					serviceID: 1,
					description: "Outbound meal",
					qtyAvailable: 1,
					cutOffHours: 24,
					maxCountServiceLevel: 1,
					categoryId: 1,
					passengerType: "adult",
					pfid: 0,
					chargeComment: "",
					bundleCode: "",
				},
			})
		);

		const withInbound = reducer(
			withOutbound,
			addExtrasService({
				passengerId: "1",
				service: {
					ssrCode: "MEAL",
					lfid: 2002,
					amount: 12,
					serviceID: 2,
					description: "Inbound meal",
					qtyAvailable: 1,
					cutOffHours: 24,
					maxCountServiceLevel: 1,
					categoryId: 1,
					passengerType: "adult",
					pfid: 0,
					chargeComment: "",
					bundleCode: "",
				},
			})
		);

		expect(withInbound.passengers[0]?.services?.extras).toEqual([
			expect.objectContaining({ ssrCode: "MEAL", lfid: 1001, amount: 10 }),
			expect.objectContaining({ ssrCode: "MEAL", lfid: 2002, amount: 12 }),
		]);
	});

	it("removes extras only for matching lfid and ssrCode", () => {
		const baseState = reducer(
			undefined,
			setPassengerNames([
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "JOHN",
					lastName: "DOE",
				},
			])
		);

		const withBothSegments = reducer(
			reducer(
				baseState,
				addExtrasService({
					passengerId: "1",
					service: {
						ssrCode: "MEAL",
						lfid: 1001,
						amount: 10,
						serviceID: 1,
						description: "Outbound meal",
						qtyAvailable: 1,
						cutOffHours: 24,
						maxCountServiceLevel: 1,
						categoryId: 1,
						passengerType: "adult",
						pfid: 0,
						chargeComment: "",
						bundleCode: "",
					},
				})
			),
			addExtrasService({
				passengerId: "1",
				service: {
					ssrCode: "MEAL",
					lfid: 2002,
					amount: 12,
					serviceID: 2,
					description: "Inbound meal",
					qtyAvailable: 1,
					cutOffHours: 24,
					maxCountServiceLevel: 1,
					categoryId: 1,
					passengerType: "adult",
					pfid: 0,
					chargeComment: "",
					bundleCode: "",
				},
			})
		);

		const nextState = reducer(
			withBothSegments,
			removeExtrasService({ passengerId: "1", lfid: 1001, ssrCode: "MEAL" })
		);

		expect(nextState.passengers[0]?.services?.extras).toEqual([
			expect.objectContaining({ ssrCode: "MEAL", lfid: 2002, amount: 12 }),
		]);
	});
});
