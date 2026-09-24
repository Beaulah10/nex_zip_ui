// use-transport-service-passengers.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const orderedPassengers = [
		{
			id: "p1",
			label: "Adult 1",
			passengerTypeCode: "ADT",
			checked: false,
		},
		{
			id: "p2",
			label: "Child 1",
			passengerTypeCode: "CHD",
			checked: false,
		},
		{
			id: "p3",
			label: "Infant 1",
			passengerTypeCode: "INF",
			checked: false,
		},
	];

	const isInfant = (passengerTypeCode?: string) => passengerTypeCode?.toUpperCase() === "INF";

	const getSelectedPrimaryPassengerCount = (passengers: any[]) =>
		passengers.filter((passenger) => passenger.checked && !isInfant(passenger.passengerTypeCode))
			.length;

	const syncAccompanyingPassengers = (passengers: any[]) => {
		const checkedPrimaryIds = new Set(
			passengers
				.filter((passenger) => passenger.checked && !isInfant(passenger.passengerTypeCode))
				.map((passenger) => passenger.id)
		);

		return passengers.map((passenger) => {
			if (!isInfant(passenger.passengerTypeCode)) {
				return passenger;
			}

			if (!passenger.mappedAdultId) {
				return {
					...passenger,
					checked: false,
				};
			}

			return {
				...passenger,
				checked: checkedPrimaryIds.has(passenger.mappedAdultId),
			};
		});
	};

	return {
		orderedPassengers,

		createSelectCustomerListItems: vi.fn(() =>
			orderedPassengers.map((passenger) => ({ ...passenger }))
		),

		getSelectedNonInfantCount: vi.fn(
			(passengers) =>
				passengers.filter(
					(passenger: any) => passenger.checked && passenger.passengerTypeCode !== "INF"
				).length
		),

		isInfantPassenger: vi.fn((passengerTypeCode: string) => passengerTypeCode === "INF"),

		passengerType: vi.fn((passengerTypeCode?: string) => passengerTypeCode?.toUpperCase() ?? ""),

		isAutoSelectedPassengerType: vi.fn(isInfant),

		getSelectedPrimaryPassengerCount: vi.fn(getSelectedPrimaryPassengerCount),

		syncAccompanyingPassengers: vi.fn(syncAccompanyingPassengers),

		togglePrimaryPassengerSelection: vi.fn(({ passengers, targetId, nextChecked, stockLimit }) => {
			const targetPassenger = passengers.find((passenger: any) => passenger.id === targetId);

			if (!targetPassenger || isInfant(targetPassenger.passengerTypeCode)) {
				return passengers;
			}

			if (
				nextChecked &&
				!targetPassenger.checked &&
				stockLimit !== null &&
				getSelectedPrimaryPassengerCount(passengers) >= stockLimit
			) {
				return passengers;
			}

			return syncAccompanyingPassengers(
				passengers.map((passenger: any) =>
					passenger.id === targetId
						? {
								...passenger,
								checked: nextChecked,
							}
						: passenger
				)
			);
		}),

		toggleSelectAllPrimaryPassengers: vi.fn(({ passengers, nextChecked, stockLimit }) => {
			if (!nextChecked) {
				return syncAccompanyingPassengers(
					passengers.map((passenger: any) => ({
						...passenger,
						checked: false,
					}))
				);
			}

			if (stockLimit === null) {
				return syncAccompanyingPassengers(
					passengers.map((passenger: any) =>
						isInfant(passenger.passengerTypeCode)
							? {
									...passenger,
									checked: false,
								}
							: {
									...passenger,
									checked: true,
								}
					)
				);
			}

			let remainingSlots = Math.max(stockLimit - getSelectedPrimaryPassengerCount(passengers), 0);

			return syncAccompanyingPassengers(
				passengers.map((passenger: any) => {
					if (isInfant(passenger.passengerTypeCode)) {
						return {
							...passenger,
							checked: false,
						};
					}

					if (passenger.checked || remainingSlots <= 0) {
						return passenger;
					}

					remainingSlots -= 1;

					return {
						...passenger,
						checked: true,
					};
				})
			);
		}),

		isTransportPassengerListequal: vi.fn(
			(previousPassengers, nextPassengers) =>
				JSON.stringify(previousPassengers) === JSON.stringify(nextPassengers)
		),

		toggleTransportPassengerSelection: vi.fn(
			({ passengers, targetId, nextChecked, stockLimit }) => {
				const selectedNonInfantCount = passengers.filter(
					(passenger: any) => passenger.checked && passenger.passengerTypeCode !== "INF"
				).length;

				return passengers.map((passenger: any) => {
					if (passenger.id !== targetId) {
						return passenger;
					}

					const infantPassenger = passenger.passengerTypeCode === "INF";

					if (
						nextChecked &&
						!infantPassenger &&
						typeof stockLimit === "number" &&
						selectedNonInfantCount >= stockLimit
					) {
						return passenger;
					}

					return {
						...passenger,
						checked: infantPassenger ? false : nextChecked,
					};
				});
			}
		),

		toggleTransportSelectAllPassengers: vi.fn(({ passengers, nextChecked, stockLimit }) => {
			let selectedCount = 0;

			return passengers.map((passenger: any) => {
				const infantPassenger = passenger.passengerTypeCode === "INF";

				if (infantPassenger) {
					return {
						...passenger,
						checked: false,
					};
				}

				if (nextChecked && typeof stockLimit === "number" && selectedCount >= stockLimit) {
					return {
						...passenger,
						checked: false,
					};
				}

				if (nextChecked) {
					selectedCount += 1;
				}

				return {
					...passenger,
					checked: nextChecked,
				};
			});
		}),

		findSpecialService: vi.fn((transportationData, passengerTypeCode, ssrCode) => {
			return transportationData?.services?.[passengerTypeCode]?.[ssrCode] ?? null;
		}),

		hasStoredTransportServiceForPassenger: vi.fn(
			({ passengers, passengerId, ssrCode, lfid, serviceID }) => {
				return passengers.some(
					(passenger: any) =>
						passenger.passengerId === passengerId &&
						passenger.ssrCode === ssrCode &&
						passenger.lfid === lfid &&
						passenger.serviceID === serviceID
				);
			}
		),

		hasStoredTransportServiceForScope: vi.fn(({ passengers, ssrCode, lfid }) => {
			return passengers.some(
				(passenger: any) => passenger.ssrCode === ssrCode && passenger.lfid === lfid
			);
		}),

		getPassengerAmount: vi.fn((passengerTypeCode: string) => {
			if (passengerTypeCode === "ADT") {
				return 100;
			}

			if (passengerTypeCode === "CHD") {
				return 50;
			}

			return 0;
		}),

		transportServiceLabels: vi.fn((key: string) => {
			if (key === "out_of_stock") {
				return "Out of stock";
			}

			return key;
		}),

		setPricingTransportServiceId: vi.fn(),
	};
});

vi.mock("@/components/common/select-customers/select-customers", () => ({
	createSelectCustomerListItems: mocks.createSelectCustomerListItems,
}));

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: () => ({
		orderedPassengersWithNames: mocks.orderedPassengers,
	}),
}));

vi.mock("@/modules/hooks/common/lounge-service/lounge-service", () => ({
	useAccompanyingSelectionHelpers: () => ({
		isAutoSelectedPassengerType: mocks.isAutoSelectedPassengerType,
		getSelectedPrimaryPassengerCount: mocks.getSelectedPrimaryPassengerCount,
		syncAccompanyingPassengers: mocks.syncAccompanyingPassengers,
		togglePrimaryPassengerSelection: mocks.togglePrimaryPassengerSelection,
		toggleSelectAllPrimaryPassengers: mocks.toggleSelectAllPrimaryPassengers,
	}),

	createAccompanyingSelectionHelpers: () => ({
		isAutoSelectedPassengerType: mocks.isAutoSelectedPassengerType,
		getSelectedPrimaryPassengerCount: mocks.getSelectedPrimaryPassengerCount,
		syncAccompanyingPassengers: mocks.syncAccompanyingPassengers,
		togglePrimaryPassengerSelection: mocks.togglePrimaryPassengerSelection,
		toggleSelectAllPrimaryPassengers: mocks.toggleSelectAllPrimaryPassengers,
	}),
}));

vi.mock("@/modules/hooks/common/accompanying-selection/accompanying-selection", () => ({
	useAccompanyingSelectionHelpers: () => ({
		isAutoSelectedPassengerType: mocks.isAutoSelectedPassengerType,
		getSelectedPrimaryPassengerCount: mocks.getSelectedPrimaryPassengerCount,
		syncAccompanyingPassengers: mocks.syncAccompanyingPassengers,
		togglePrimaryPassengerSelection: mocks.togglePrimaryPassengerSelection,
		toggleSelectAllPrimaryPassengers: mocks.toggleSelectAllPrimaryPassengers,
	}),

	createAccompanyingSelectionHelpers: () => ({
		isAutoSelectedPassengerType: mocks.isAutoSelectedPassengerType,
		getSelectedPrimaryPassengerCount: mocks.getSelectedPrimaryPassengerCount,
		syncAccompanyingPassengers: mocks.syncAccompanyingPassengers,
		togglePrimaryPassengerSelection: mocks.togglePrimaryPassengerSelection,
		toggleSelectAllPrimaryPassengers: mocks.toggleSelectAllPrimaryPassengers,
	}),
}));

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-passenger-utils/transport-passenger-utils",
	() => ({
		getSelectedNonInfantCount: mocks.getSelectedNonInfantCount,
		isInfantPassenger: mocks.isInfantPassenger,
		isTransportPassengerListequal: mocks.isTransportPassengerListequal,
		toggleTransportPassengerSelection: mocks.toggleTransportPassengerSelection,
		toggleTransportSelectAllPassengers: mocks.toggleTransportSelectAllPassengers,
	})
);

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response",
	() => ({
		SERVICE_ID_TO_SSR_CODE: {
			SHUTTLE: "SHU",
			LIMO: "LIM",
		},
		passengerType: mocks.passengerType,
		findSpecialService: mocks.findSpecialService,
		hasStoredTransportServiceForPassenger: mocks.hasStoredTransportServiceForPassenger,
		hasStoredTransportServiceForScope: mocks.hasStoredTransportServiceForScope,
	})
);

import { useTransportServicePassengers } from "./use-transport-service-passengers";

describe("useTransportServicePassengers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const transportationData = {
		services: {
			ADT: {
				SHU: {
					lfid: 11,
					ssrId: 101,
				},
				LIM: {
					lfid: 22,
					ssrId: 201,
				},
			},
			CHD: {
				SHU: {
					lfid: 11,
					ssrId: 102,
				},
				LIM: {
					lfid: 22,
					ssrId: 202,
				},
			},
		},
	};

	const createParams = (overrides = {}) =>
		({
			transportationData,
			selectedPassengers: [],
			selectedTransportServiceId: null,
			selectedServiceStockLimit: null,
			getPassengerAmount: mocks.getPassengerAmount,
			transportServiceLabels: mocks.transportServiceLabels,
			open: false,
			lfidBySsrCode: new Map([
				["SHU", 11],
				["LIM", 22],
			]),
			setPricingTransportServiceId: mocks.setPricingTransportServiceId,
			...overrides,
		}) as any;

	it("creates initial passenger list from ordered passengers", () => {
		const { result } = renderHook(() => useTransportServicePassengers(createParams()));

		expect(mocks.createSelectCustomerListItems).toHaveBeenCalledWith(mocks.orderedPassengers);

		expect(result.current.transportServicePax).toEqual([
			expect.objectContaining({
				id: "p1",
				passengerTypeCode: "ADT",
				checked: false,
			}),
			expect.objectContaining({
				id: "p2",
				passengerTypeCode: "CHD",
				checked: false,
			}),
			expect.objectContaining({
				id: "p3",
				passengerTypeCode: "INF",
				checked: false,
			}),
		]);

		expect(result.current.currentSelectionTotal).toBe(0);
		expect(result.current.hasOutOfStockPassengers).toBe(false);
	});

	it("syncs passengers when selected transport service id is available", async () => {
		const selectedPassengers = [
			{
				passengerId: "p1",
				ssrCode: "SHU",
				lfid: 11,
				serviceID: 101,
			},
		];

		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					selectedPassengers,
					selectedTransportServiceId: "SHUTTLE",
				})
			)
		);

		await waitFor(() => {
			expect(result.current.transportServicePax[0]?.checked).toBe(true);
		});

		expect(result.current.transportServicePax[1]?.checked).toBe(false);
		expect(result.current.transportServicePax[2]?.checked).toBe(false);
		expect(result.current.currentSelectionTotal).toBe(100);
	});

	it("unchecks passenger when special service is missing", async () => {
		const selectedPassengers = [
			{
				passengerId: "p1",
				ssrCode: "LIM",
				lfid: 22,
				serviceID: 201,
			},
		];

		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					transportationData: {
						services: {},
					},
					selectedPassengers,
					selectedTransportServiceId: "LIMO",
				})
			)
		);

		await waitFor(() => {
			expect(result.current.transportServicePax.every((pax) => !pax.checked)).toBe(true);
		});

		expect(result.current.currentSelectionTotal).toBe(0);
	});

	it("unchecks passenger when special service has invalid ids", async () => {
		const selectedPassengers = [
			{
				passengerId: "p1",
				ssrCode: "SHU",
				lfid: 11,
				serviceID: 101,
			},
		];

		const invalidTransportationData = {
			services: {
				ADT: {
					SHU: {
						lfid: undefined,
						ssrId: undefined,
					},
				},
			},
		};

		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					transportationData: invalidTransportationData,
					selectedPassengers,
					selectedTransportServiceId: "SHUTTLE",
				})
			)
		);

		await waitFor(() => {
			expect(result.current.transportServicePax[0]?.checked).toBe(false);
		});

		expect(result.current.currentSelectionTotal).toBe(0);
	});

	it("restores stored service when popup is opened", async () => {
		const selectedPassengers = [
			{
				passengerId: "p2",
				ssrCode: "LIM",
				lfid: 22,
				serviceID: 202,
			},
		];

		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					open: true,
					selectedPassengers,
				})
			)
		);

		await waitFor(() => {
			expect(mocks.setPricingTransportServiceId).toHaveBeenCalledWith("LIMO");
		});

		expect(result.current.transportServicePax[0]?.checked).toBe(false);
		expect(result.current.transportServicePax[1]?.checked).toBe(true);
		expect(result.current.currentSelectionTotal).toBe(50);
	});

	it("sets pricing service id as null and resets passengers when popup opens without stored scope", async () => {
		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					open: true,
					selectedPassengers: [],
				})
			)
		);

		await waitFor(() => {
			expect(mocks.setPricingTransportServiceId).toHaveBeenCalledWith(null);
		});

		expect(result.current.transportServicePax.every((pax) => !pax.checked)).toBe(true);
		expect(result.current.currentSelectionTotal).toBe(0);
	});

	it("skips scope lookup when the SSR has no mapped lfid on open", async () => {
		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					open: true,
					lfidBySsrCode: new Map(),
				})
			)
		);

		await waitFor(() => {
			expect(mocks.setPricingTransportServiceId).toHaveBeenCalledWith(null);
		});

		expect(mocks.hasStoredTransportServiceForScope).not.toHaveBeenCalled();
		expect(result.current.transportServicePax.every((pax) => !pax.checked)).toBe(true);
	});

	it("marks unchecked non-infant passengers as out of stock when stock limit is reached", async () => {
		const selectedPassengers = [
			{
				passengerId: "p1",
				ssrCode: "SHU",
				lfid: 11,
				serviceID: 101,
			},
		];

		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					selectedPassengers,
					selectedTransportServiceId: "SHUTTLE",
					selectedServiceStockLimit: 1,
				})
			)
		);

		await waitFor(() => {
			expect(result.current.hasOutOfStockPassengers).toBe(true);
		});

		expect(result.current.passengersWithAmount[0]).toEqual(
			expect.objectContaining({
				id: "p1",
				checked: true,
				price: 100,
				disabled: false,
				status: undefined,
			})
		);

		expect(result.current.passengersWithAmount[1]).toEqual(
			expect.objectContaining({
				id: "p2",
				checked: false,
				price: 50,
				disabled: true,
				status: "Out of stock",
			})
		);

		expect(result.current.passengersWithAmount[2]).toEqual(
			expect.objectContaining({
				id: "p3",
				checked: false,
				price: 0,
				disabled: false,
				status: undefined,
			})
		);
	});

	it("toggles a single passenger selection", () => {
		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					selectedServiceStockLimit: 1,
				})
			)
		);

		act(() => {
			result.current.toggleTransportServicePax("p1", true);
		});

		expect(result.current.transportServicePax[0]?.checked).toBe(true);
		expect(result.current.currentSelectionTotal).toBe(100);

		act(() => {
			result.current.toggleTransportServicePax("p2", true);
		});

		expect(result.current.transportServicePax[0]?.checked).toBe(true);
		expect(result.current.transportServicePax[1]?.checked).toBe(false);
		expect(result.current.currentSelectionTotal).toBe(100);
	});

	it("toggles select all passengers with stock limit", () => {
		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					selectedServiceStockLimit: 1,
				})
			)
		);

		act(() => {
			result.current.toggleTransportServiceSelectAll(true);
		});

		expect(result.current.transportServicePax[0]?.checked).toBe(true);
		expect(result.current.transportServicePax[1]?.checked).toBe(false);
		expect(result.current.transportServicePax[2]?.checked).toBe(false);
		expect(result.current.currentSelectionTotal).toBe(100);

		act(() => {
			result.current.toggleTransportServiceSelectAll(false);
		});

		expect(result.current.transportServicePax.every((pax) => !pax.checked)).toBe(true);
		expect(result.current.currentSelectionTotal).toBe(0);
	});

	it("does not disable passengers when stock limit is null", () => {
		const { result } = renderHook(() =>
			useTransportServicePassengers(
				createParams({
					selectedServiceStockLimit: null,
				})
			)
		);

		expect(result.current.hasOutOfStockPassengers).toBe(false);

		expect(result.current.passengersWithAmount).toEqual([
			expect.objectContaining({
				id: "p1",
				price: 100,
				disabled: false,
			}),
			expect.objectContaining({
				id: "p2",
				price: 50,
				disabled: false,
			}),
			expect.objectContaining({
				id: "p3",
				price: 0,
				disabled: false,
			}),
		]);
	});
});
