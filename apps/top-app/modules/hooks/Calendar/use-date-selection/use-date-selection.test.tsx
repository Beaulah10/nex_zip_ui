import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useDateSelection from "./use-date-selection";

describe("useDateSelection", () => {
	it("selects one-way outbound date only", () => {
		const { result } = renderHook(() =>
			useDateSelection({
				initialDeparture: null,
				initialReturn: null,
				oneWay: true,
			})
		);

		act(() => {
			result.current.handleDateSelect(new Date(2026, 6, 10));
		});

		expect(result.current.outboundDate).toEqual(new Date(2026, 6, 10));
		expect(result.current.inboundDate).toBeNull();
	});

	it("handles round-trip date transitions", () => {
		const { result } = renderHook(() =>
			useDateSelection({
				initialDeparture: null,
				initialReturn: null,
				oneWay: false,
			})
		);

		act(() => {
			result.current.handleDateSelect(new Date(2026, 6, 10));
		});
		expect(result.current.activeTab).toBe("inbound");

		act(() => {
			result.current.handleDateSelect(new Date(2026, 6, 8));
		});
		expect(result.current.outboundDate).toEqual(new Date(2026, 6, 8));
		expect(result.current.inboundDate).toBeNull();

		act(() => {
			result.current.handleDateSelect(new Date(2026, 6, 12));
		});
		expect(result.current.inboundDate).toEqual(new Date(2026, 6, 12));

		act(() => {
			result.current.handleDateSelect(new Date(2026, 6, 7));
		});
		expect(result.current.outboundDate).toEqual(new Date(2026, 6, 7));
		expect(result.current.inboundDate).toBeNull();
	});

	it("resets and syncs from initial values", () => {
		const { result } = renderHook(() =>
			useDateSelection({
				initialDeparture: new Date(2026, 6, 10),
				initialReturn: new Date(2026, 6, 12),
				oneWay: false,
			})
		);

		act(() => {
			result.current.handleReset();
		});
		expect(result.current.outboundDate).toBeNull();
		expect(result.current.inboundDate).toBeNull();

		act(() => {
			result.current.syncFromInitialValues();
		});
		expect(result.current.outboundDate).toEqual(new Date(2026, 6, 10));
		expect(result.current.inboundDate).toEqual(new Date(2026, 6, 12));
	});
});
