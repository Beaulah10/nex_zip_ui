import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBaggageSelectionState } from "./baggage-selection-state";

describe("useBaggageSelectionState", () => {
	type SelectionMap = Parameters<typeof useBaggageSelectionState>[0];
	type EditingSelection = ReturnType<typeof useBaggageSelectionState>["editingSelection"];
	type SelectionEntry = NonNullable<SelectionMap["passenger1"]>;

	const getRequiredSelection = (selections: SelectionMap, passengerId: string): SelectionEntry => {
		const selection = selections[passengerId];

		if (!selection) {
			throw new Error(`Missing selection for ${passengerId}`);
		}

		return selection;
	};

	const updateSelection = (selection: SelectionEntry, totalPrice: number): SelectionEntry => ({
		...selection,
		totalPrice,
	});

	const mockBaggageSelections: SelectionMap = {
		passenger1: {
			passenger: {
				id: "passenger1",
				name: "John Doe",
				passengerTypeCode: "adult",
				bundleCode: "PRMK",
				bundleLabel: "Premium",
				mealfeatures: [],
				baggagefeatures: [],
				isIcnRoute: false,
				isValueBundle: false,
			},
			baggageServices: {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			},
			categories: [],
			totalPrice: 0,
		},
		passenger2: {
			passenger: {
				id: "passenger2",
				name: "Jane Doe",
				passengerTypeCode: "adult",
				bundleCode: "VALK",
				bundleLabel: "Value",
				mealfeatures: [],
				baggagefeatures: [],
				isIcnRoute: false,
				isValueBundle: true,
			},
			baggageServices: {
				carryOn: {},
				checkedIn: {},
				sportsEquipment: {},
			},
			categories: [],
			totalPrice: 0,
		},
	};

	it("initializes with provided baggageSelections and null passenger/editing selection", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		expect(result.current.baggageSelections).toEqual(mockBaggageSelections);
		expect(result.current.selectedPassengerId).toBeNull();
		expect(result.current.editingSelection).toBeNull();
	});

	it("allows setting selected passenger ID", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		act(() => {
			result.current.setSelectedPassengerId("passenger1");
		});

		expect(result.current.selectedPassengerId).toBe("passenger1");
	});

	it("allows setting editing selection values", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		const editingSelection: NonNullable<EditingSelection> = {
			carryOnId: "CABN",
			checkedInBaggageCount: 2,
			equipmentCounts: { SKII: 1 },
		};

		act(() => {
			result.current.setEditingSelection(editingSelection);
		});

		expect(result.current.editingSelection).toEqual(editingSelection);
	});

	it("allows updating baggage selections", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		const newSelections: SelectionMap = {
			...mockBaggageSelections,
			passenger1: updateSelection(getRequiredSelection(mockBaggageSelections, "passenger1"), 5000),
		};

		act(() => {
			result.current.setBaggageSelections(newSelections);
		});

		expect(result.current.baggageSelections).toEqual(newSelections);
	});

	it("allows updating baggage selections via function", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		act(() => {
			result.current.setBaggageSelections((prev) => {
				const passenger1 = prev.passenger1;

				if (!passenger1) {
					return prev;
				}

				return {
					...prev,
					passenger1: updateSelection(passenger1, 7500),
				};
			});
		});

		expect(result.current.baggageSelections.passenger1?.totalPrice).toBe(7500);
	});

	it("resets selections when dialog opens and no passenger is selected", () => {
		const { result, rerender } = renderHook(
			({ selections, openDialog }: any) => useBaggageSelectionState(selections, openDialog),
			{
				initialProps: {
					selections: mockBaggageSelections,
					openDialog: false,
				},
			}
		);

		result.current.setSelectedPassengerId("passenger1");
		result.current.setEditingSelection({
			carryOnId: "CABN",
			checkedInBaggageCount: 1,
			equipmentCounts: {},
		});

		const newSelections: SelectionMap = {
			...mockBaggageSelections,
			passenger1: updateSelection(getRequiredSelection(mockBaggageSelections, "passenger1"), 5000),
		};

		rerender({
			selections: newSelections,
			openDialog: true,
		});

		// When openDialog is true and selectedPassengerId is not null, it should not reset
		expect(result.current.selectedPassengerId).toBe("passenger1");
	});

	it("resets baggageSelections when dialog opens and passenger is not selected", () => {
		const { result, rerender } = renderHook(
			({ selections, openDialog }: any) => useBaggageSelectionState(selections, openDialog),
			{
				initialProps: {
					selections: mockBaggageSelections,
					openDialog: false,
				},
			}
		);

		// selectedPassengerId is null by default
		expect(result.current.selectedPassengerId).toBeNull();

		const newSelections: SelectionMap = {
			...mockBaggageSelections,
			passenger1: updateSelection(getRequiredSelection(mockBaggageSelections, "passenger1"), 5000),
		};

		rerender({
			selections: newSelections,
			openDialog: true,
		});

		// When dialog opens without a selected passenger, it resets to newSelections
		expect(result.current.baggageSelections).toEqual(newSelections);
	});

	it("does not reset when dialog is closed", () => {
		const updatedSelections: SelectionMap = {
			...mockBaggageSelections,
			passenger1: updateSelection(getRequiredSelection(mockBaggageSelections, "passenger1"), 8000),
		};

		const { result, rerender } = renderHook(
			({ selections, openDialog }: any) => useBaggageSelectionState(selections, openDialog),
			{
				initialProps: {
					selections: mockBaggageSelections,
					openDialog: true,
				},
			}
		);

		act(() => {
			result.current.setBaggageSelections(updatedSelections);
		});

		expect(result.current.baggageSelections).toEqual(updatedSelections);

		rerender({
			selections: mockBaggageSelections,
			openDialog: false,
		});

		// Should retain the updated selections when closing dialog
		expect(result.current.baggageSelections).toEqual(updatedSelections);
	});

	it("resets editingSelection to null when setEditingSelection is called with null", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		act(() => {
			result.current.setEditingSelection({
				carryOnId: "CABN",
				checkedInBaggageCount: 1,
				equipmentCounts: {},
			});
		});

		expect(result.current.editingSelection).not.toBeNull();

		act(() => {
			result.current.setEditingSelection(null);
		});

		expect(result.current.editingSelection).toBeNull();
	});

	it("maintains baggageSelections when only editing selection changes", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		const originalSelections = result.current.baggageSelections;

		result.current.setEditingSelection({
			carryOnId: "CABN",
			checkedInBaggageCount: 1,
			equipmentCounts: {},
		});

		expect(result.current.baggageSelections).toBe(originalSelections);
	});

	it("handles multiple state updates independently", () => {
		const { result } = renderHook(() => useBaggageSelectionState(mockBaggageSelections, false));

		act(() => {
			result.current.setSelectedPassengerId("passenger1");
			const editingSelection = {
				carryOnId: "CABN",
				checkedInBaggageCount: 2,
				equipmentCounts: { GOLF: 1 },
			};
			result.current.setEditingSelection(editingSelection);
		});

		expect(result.current.selectedPassengerId).toBe("passenger1");
		expect(result.current.editingSelection).toEqual({
			carryOnId: "CABN",
			checkedInBaggageCount: 2,
			equipmentCounts: { GOLF: 1 },
		});

		act(() => {
			result.current.setSelectedPassengerId("passenger2");
		});

		expect(result.current.selectedPassengerId).toBe("passenger2");
		expect(result.current.editingSelection).toEqual({
			carryOnId: "CABN",
			checkedInBaggageCount: 2,
			equipmentCounts: { GOLF: 1 },
		});
	});

	it("correctly handles empty baggageSelections", () => {
		const { result } = renderHook(() => useBaggageSelectionState({}, false));

		expect(result.current.baggageSelections).toEqual({});
		expect(result.current.selectedPassengerId).toBeNull();
		expect(result.current.editingSelection).toBeNull();
	});
});
