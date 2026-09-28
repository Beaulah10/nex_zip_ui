import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTransportServicePricing } from "@/modules/hooks/customize/transport-service/use-transport-service-pricing/use-transport-service-pricing";

import { getPassengerAmountByPricingSsr } from "@/modules/utils/helpers/customize/transport-service/transport-service-pricing/transport-service-pricing";

import { mapServiceIdToSsrCode } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-pricing/transport-service-pricing",
	() => ({
		getPassengerAmountByPricingSsr: vi.fn(),
	})
);

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response",
	() => ({
		mapServiceIdToSsrCode: vi.fn(),
	})
);

describe("useTransportServicePricing", () => {
	const transportationData = {} as never;

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(mapServiceIdToSsrCode).mockReturnValue("SHUTTLE" as never);

		vi.mocked(getPassengerAmountByPricingSsr).mockReturnValue(100);
	});

	it("should initialize with default values", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [],
				currentLfid: undefined,
			})
		);

		expect(result.current.pricingTransportServiceId).toBeNull();
		expect(result.current.storedServicesTotal).toBe(0);
	});

	it("should update pricingTransportServiceId", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [],
				currentLfid: undefined,
			})
		);

		act(() => {
			result.current.setPricingTransportServiceId("service1" as never);
		});

		expect(result.current.pricingTransportServiceId).toBe("service1");
	});

	it("should call getPassengerAmountByPricingSsr", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [],
				currentLfid: undefined,
			})
		);

		act(() => {
			result.current.setPricingTransportServiceId("service1" as never);
		});

		const amount = result.current.getPassengerAmount("ADT");

		expect(amount).toBe(100);

		expect(mapServiceIdToSsrCode).toHaveBeenCalled();

		expect(getPassengerAmountByPricingSsr).toHaveBeenCalledWith({
			transportationData,
			pricingSsrCode: "SHUTTLE",
			passengerTypeCode: "ADT",
		});
	});

	it("should calculate storedServicesTotal", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [
					{
						services: {
							travel: [
								{
									amount: 100,
									lfid: 1,
								},
								{
									amount: 50,
									lfid: 1,
								},
							],
						},
					},
					{
						services: {
							travel: [
								{
									amount: 25,
									lfid: 1,
								},
							],
						},
					},
				] as never,
				currentLfid: 1,
			})
		);

		expect(result.current.storedServicesTotal).toBe(175);
	});

	it("should handle passengers without travel services", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [
					{
						services: undefined,
					},
					{},
				] as never,
				currentLfid: undefined,
			})
		);

		expect(result.current.storedServicesTotal).toBe(0);
	});

	it("should treat undefined amount as 0", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [
					{
						services: {
							travel: [
								{
									amount: undefined,
									lfid: 1,
								},
								{
									amount: 100,
									lfid: 1,
								},
							],
						},
					},
				] as never,
				currentLfid: 1,
			})
		);

		expect(result.current.storedServicesTotal).toBe(100);
	});

	it("should filter services by currentLfid", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [
					{
						services: {
							travel: [
								{
									amount: 100,
									lfid: 1,
								},
								{
									amount: 50,
									lfid: 2,
								},
							],
						},
					},
				] as never,
				currentLfid: 1,
			})
		);

		expect(result.current.storedServicesTotal).toBe(100);
	});

	it("should include all services when currentLfid is undefined", () => {
		const { result } = renderHook(() =>
			useTransportServicePricing({
				transportationData,
				selectedPassengers: [
					{
						services: {
							travel: [
								{
									amount: 100,
									lfid: 1,
								},
								{
									amount: 50,
									lfid: 2,
								},
							],
						},
					},
				] as never,
				currentLfid: undefined,
			})
		);

		expect(result.current.storedServicesTotal).toBe(150);
	});
});
