import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTripType } from "./trip-type";

const useAppSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("@/store/hooks", () => ({
	useAppSelector: useAppSelectorMock,
}));

describe("useTripType", () => {
	it("reports connecting when the flight selection response contains connecting outbound flights", () => {
		useAppSelectorMock.mockImplementation((selector: (state: any) => unknown) =>
			selector({
				flightSelection: {
					confirmedFlight: undefined,
					data: {
						data: {
							outbound: {
								flightsByDate: [
									{
										date: "2026-08-12",
										flights: [{ segments: [{}, {}] }],
									},
								],
							},
						},
					},
				},
			})
		);

		const { result } = renderHook(() => useTripType());

		expect(result.current.tripType).toBe("connecting");
		expect(result.current.connecting).toBe(true);
		expect(result.current.oneway).toBe(false);
		expect(result.current.roundtrip).toBe(false);
	});

	it("falls back to the stored trip type when the flight selection response is direct", () => {
		useAppSelectorMock.mockImplementation((selector: (state: any) => unknown) =>
			selector({
				flightSelection: {
					confirmedFlight: {
						tripType: "roundtrip",
						flights: {
							outbound: { segments: [{}] },
						},
					},
					data: {
						data: {
							outbound: {
								flightsByDate: [
									{
										date: "2026-08-12",
										flights: [{ segments: [{}] }],
									},
								],
							},
						},
					},
				},
			})
		);

		const { result } = renderHook(() => useTripType());

		expect(result.current.tripType).toBe("roundtrip");
		expect(result.current.roundtrip).toBe(true);
	});
});
