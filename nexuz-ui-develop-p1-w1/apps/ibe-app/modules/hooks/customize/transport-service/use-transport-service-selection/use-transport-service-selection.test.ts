import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTransportServiceSelection } from "@/modules/hooks/customize/transport-service/use-transport-service-selection/use-transport-service-selection";

import {
	getAdultServiceQtyAvailable,
	getServiceStockLimit,
	hasStoredTransportServiceForScope,
	mapServiceIdToSsrCode,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";

vi.mock(
	"@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response",
	() => ({
		getAdultServiceQtyAvailable: vi.fn(),
		getServiceStockLimit: vi.fn(),
		hasStoredTransportServiceForScope: vi.fn(),
		mapServiceIdToSsrCode: vi.fn(),
		SERVICE_ID_TO_SSR_CODE: {
			"shuttle-1": "SHUTTLE",
		},
	})
);

describe("useTransportServiceSelection", () => {
	const setPricingTransportServiceId = vi.fn();

	const transportServices = [
		{
			description: "Activity Description",
			services: [
				{
					id: "shuttle-1",
					label: "Airport Shuttle",
					imageSrc: "/image.png",
				},
			],
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(mapServiceIdToSsrCode).mockReturnValue("SHUTTLE" as never);
		vi.mocked(getAdultServiceQtyAvailable).mockReturnValue(5);
		vi.mocked(getServiceStockLimit).mockReturnValue(20);
		vi.mocked(hasStoredTransportServiceForScope).mockReturnValue(true);
	});

	const createHook = (overrideProps = {}) =>
		renderHook(() =>
			useTransportServiceSelection({
				transportationData: {} as never,
				transportServices: transportServices as never,
				lfidBySsrCode: new Map([["SHUTTLE", 123]]),
				selectedPassengers: [] as never,
				transportServiceLabels: vi.fn(() => "Shuttle Description"),
				setPricingTransportServiceId,
				...overrideProps,
			} as never)
		);

	it("initial state", () => {
		const { result } = createHook();

		expect(result.current.selectedTransportServiceId).toBeNull();
		expect(result.current.remainingStockCount).toBeNull();
		expect(result.current.shouldShowRemainingStock).toBe(false);
	});

	it("select service", () => {
		const { result } = createHook();

		act(() => {
			result.current.setSelectedTransportServiceId("shuttle-1" as never);
		});

		expect(result.current.selectedTransportServiceId).toBe("shuttle-1");

		expect(result.current.remainingStockCount).toBe(5);
		expect(result.current.shouldShowRemainingStock).toBe(true);
	});

	it("returns selected service description", () => {
		const { result } = createHook();

		act(() => {
			result.current.setSelectedTransportServiceId("shuttle-1" as never);
		});

		expect(result.current.selectedServiceDescription).toBe("Shuttle Description");
	});

	it("handleBackFromTransportServiceDetails resets selection", () => {
		const { result } = createHook();

		act(() => {
			result.current.setSelectedTransportServiceId("shuttle-1" as never);
		});

		act(() => {
			result.current.handleBackFromTransportServiceDetails();
		});

		expect(result.current.selectedTransportServiceId).toBeNull();
	});

	it("getTransportCardServices returns selected card", () => {
		const { result } = createHook();

		const cards = result.current.getTransportCardServices(transportServices[0]?.services as never);

		expect(cards[0]?.label).toBe("Airport Shuttle");
		expect(cards[0]?.selected).toBe(true);

		act(() => {
			cards[0]?.onAdd();
		});

		expect(setPricingTransportServiceId).toHaveBeenCalledWith("shuttle-1");
	});

	it("returns selected false without scoped lfid", () => {
		const { result } = createHook({
			lfidBySsrCode: new Map(),
		});

		const cards = result.current.getTransportCardServices(transportServices[0]?.services as never);

		expect(cards[0]?.selected).toBe(false);
	});
});
