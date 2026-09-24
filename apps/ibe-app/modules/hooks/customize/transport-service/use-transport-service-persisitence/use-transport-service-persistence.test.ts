import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTransportServicePersistence } from "@/modules/hooks/customize/transport-service/use-transport-service-persisitence/use-transport-service-persistence";

import { isInfantPassenger } from "@/modules/utils/helpers/customize/transport-service/transport-service-passenger-utils/transport-passenger-utils";

import {
	findSpecialService,
	mapServiceIdToSsrCode,
	passengerType,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";

import { useAppDispatch } from "@/store/hooks";

import { addService, removeService } from "@/store/slices/passenger/passenger.slice";

import type { NEXUZR004OffersSpecialService } from "../../../../../../../packages/sdk/swagger/models";

vi.mock("@/store/hooks", () => ({
	useAppDispatch: vi.fn(),
}));

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-passenger-utils/transport-passenger-utils",
	() => ({
		isInfantPassenger: vi.fn(),
	})
);

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response",
	() => ({
		findSpecialService: vi.fn(),
		mapServiceIdToSsrCode: vi.fn(),
		passengerType: vi.fn(),
	})
);

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	addService: vi.fn((payload) => ({
		type: "addService",
		payload,
	})),
	removeService: vi.fn((payload) => ({
		type: "removeService",
		payload,
	})),
}));

describe("useTransportServicePersistence", () => {
	const dispatch = vi.fn();

	const validTransportServiceId = "service1" as never;

	const transportationData = {} as never;

	const specialServiceMock = {
		lfid: 123,
		ssrId: 456,
		pfid: 789,
		amount: 100,
		cutOffHours: 24,
		description: "Airport Transfer",
		maxCountServiceLevel: 1,
		qtyAvailable: 5,
		ssrCode: "SHUTTLE",
		currency: "USD",
		startSalesDays: 0,
	} as NEXUZR004OffersSpecialService;

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useAppDispatch).mockReturnValue(dispatch);

		vi.mocked(mapServiceIdToSsrCode).mockReturnValue("SHUTTLE" as never);

		vi.mocked(passengerType).mockReturnValue("ADT" as never);

		vi.mocked(isInfantPassenger).mockReturnValue(false);

		vi.mocked(findSpecialService).mockReturnValue(specialServiceMock);
	});

	it("returns early when selectedTransportServiceId is missing", () => {
		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: null,
				transportServicePax: [],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(mapServiceIdToSsrCode).not.toHaveBeenCalled();
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("returns early when ssrCode is not found", () => {
		vi.mocked(mapServiceIdToSsrCode).mockReturnValue(undefined as never);

		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(dispatch).not.toHaveBeenCalled();
	});

	it("skips infant passengers", () => {
		vi.mocked(isInfantPassenger).mockReturnValue(true);

		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "INF",
						checked: true,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(findSpecialService).not.toHaveBeenCalled();
		expect(dispatch).not.toHaveBeenCalled();
	});

	it("skips when special service is not found", () => {
		vi.mocked(findSpecialService).mockReturnValue(undefined as never);

		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "ADT",
						checked: true,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(dispatch).not.toHaveBeenCalled();
	});

	it("skips when lfid is invalid", () => {
		vi.mocked(findSpecialService).mockReturnValue({
			...specialServiceMock,
			lfid: undefined,
		} as never);

		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "ADT",
						checked: true,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(dispatch).not.toHaveBeenCalled();
	});

	it("dispatches addService for checked passengers", () => {
		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "ADT",
						checked: true,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(addService).toHaveBeenCalled();

		expect(dispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "addService",
			})
		);
	});

	it("defaults pfid to 0 when the special service omits it", () => {
		vi.mocked(findSpecialService).mockReturnValue({
			...specialServiceMock,
			pfid: undefined,
		} as never);

		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "ADT",
						checked: true,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(addService).toHaveBeenCalledWith(
			expect.objectContaining({
				service: expect.objectContaining({
					pfid: 0,
				}),
			})
		);
	});

	it("dispatches removeService for unchecked passengers", () => {
		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "ADT",
						checked: false,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(removeService).toHaveBeenCalled();

		expect(dispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "removeService",
			})
		);
	});

	it("skips when ssrId is invalid", () => {
		vi.mocked(findSpecialService).mockReturnValue({
			...specialServiceMock,
			ssrId: undefined,
		} as never);

		const { result } = renderHook(() =>
			useTransportServicePersistence({
				selectedTransportServiceId: validTransportServiceId,
				transportServicePax: [
					{
						id: "1",
						passengerTypeCode: "ADT",
						checked: true,
					} as never,
				],
				transportationData,
			})
		);

		act(() => {
			result.current.persistSelectedTransportService();
		});

		expect(dispatch).not.toHaveBeenCalled();
	});
});
