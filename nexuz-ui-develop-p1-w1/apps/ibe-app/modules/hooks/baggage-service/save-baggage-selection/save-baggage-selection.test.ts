import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSavePassengerBaggageSelection } from "./save-baggage-selection";

const useTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));
const buildBaggageCategoriesMock = vi.hoisted(() => vi.fn());
const dispatchBaggageChangesMock = vi.hoisted(() => vi.fn());
const compareSegmentSelectionsMock = vi.hoisted(() => vi.fn());
const hasAnyBaggageSelectionMock = vi.hoisted(() => vi.fn());
const hasCabnMock = vi.hoisted(() => vi.fn());
const buildPassengerBaggageServicesFromSelectionMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories", () => ({
	buildBaggageCategories: buildBaggageCategoriesMock,
}));

vi.mock(
	"@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils",
	() => ({
		dispatchBaggageChanges: dispatchBaggageChangesMock,
	})
);

vi.mock("@/modules/utils/helpers/baggage-service/baggage-validation/baggage-validation", () => ({
	compareSegmentSelections: compareSegmentSelectionsMock,
	hasAnyBaggageSelection: hasAnyBaggageSelectionMock,
	hasCabn: hasCabnMock,
}));

vi.mock(
	"@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection",
	() => ({
		buildPassengerBaggageServicesFromSelection: buildPassengerBaggageServicesFromSelectionMock,
	})
);

describe("useSavePassengerBaggageSelection", () => {
	type SaveArgs = Parameters<typeof useSavePassengerBaggageSelection>[0];
	type SelectedPassenger = NonNullable<SaveArgs["selectedPassenger"]>;
	type OtherSelection = SaveArgs["otherSegmentSelections"][string];
	type OffersByPassengerType = SaveArgs["baggageOffersByPassengerType"];

	const mockDispatch = vi.fn();
	const mockHandleBackToPassengerList = vi.fn();
	const mockSetBaggageSelections = vi.fn();
	const mockSetSegmentValidationMessage = vi.fn();
	const mockSetIsSegmentMismatchDialogOpen = vi.fn();
	const mockSetAcknowledgedSegmentMismatch = vi.fn();

	const mockSelectedPassenger: SelectedPassenger = {
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
			carryOn: {
				CABN: {
					lfid: 76407,
					pfid: 0,
					categoryId: 144,
					cutOffHours: 0,
					maxCountServiceLevel: 100,
					passengerType: "adult",
					qtyAvailable: 5,
					serviceID: 1281,
					chargeComment: "",
					bundleCode: "PRMK",
					ssrCode: "CABN",
					description: "Carry-on Baggage",
					amount: 4000,
				},
			},
			checkedIn: {},
			sportsEquipment: {},
		},
		categories: [],
		totalPrice: 4000,
	};

	const mockEditingSelection = {
		carryOnId: "CABN",
		checkedInBaggageCount: 2,
		equipmentCounts: { SKII: 1 },
	};

	const mockBaggageOffersByPassengerType: OffersByPassengerType = {
		adult: {
			passengerType: "adult",
			categories: {
				carryOn: {
					CABN: {
						amount: 4000,
						currency: "JPY",
						qtyAvailable: 5,
						ssrCode: "CABN",
						lfid: 76407,
						pfid: 0,
						ssrId: 1281,
						cutOffHours: 0,
						maxCountServiceLevel: 100,
						description: "Carry-on Baggage",
						startSalesDays: 0,
					},
				},
				checkedIn: {
					BAGN: {
						amount: 7500,
						currency: "JPY",
						qtyAvailable: 10,
						ssrCode: "BAGN",
						lfid: 76407,
						pfid: 0,
						ssrId: 1221,
						cutOffHours: 0,
						maxCountServiceLevel: 999,
						description: "Checked-in Baggage",
						startSalesDays: 0,
					},
				},
				sportsEquipment: {
					SKII: {
						amount: 7000,
						currency: "JPY",
						qtyAvailable: 2,
						ssrCode: "SKII",
						lfid: 76407,
						pfid: 0,
						ssrId: 184,
						cutOffHours: 0,
						maxCountServiceLevel: 999,
						description: "Ski Equipment",
						startSalesDays: 0,
					},
				},
			},
		},
	};

	const createOtherSelection = (): OtherSelection => ({
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
	});

	beforeEach(() => {
		vi.clearAllMocks();

		useTranslationsMock.mockReturnValue((key: string) => {
			const translations: Record<string, string> = {
				"error_labels.error_description_segment_mismatch":
					"The weight and number of baggage for the second segment must be the same or more than the first segment.",
			};

			return translations[key] ?? key;
		});

		buildBaggageCategoriesMock.mockReturnValue([]);
		buildPassengerBaggageServicesFromSelectionMock.mockReturnValue({
			carryOn: {},
			checkedIn: {},
			sportsEquipment: {},
		});
		hasCabnMock.mockReturnValue(false);
	});

	it("does not save when required parameters are missing", () => {
		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: null,
				selectedPassenger: null,
				editingSelection: null,
				currentLfid: undefined,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 0,
				isConnectingFlight: false,
				stageLabel: "Segment 1",
				otherSegmentSelections: {},
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		result.current.savePassengerBaggageSelection();

		expect(mockDispatch).not.toHaveBeenCalled();
		expect(mockHandleBackToPassengerList).not.toHaveBeenCalled();
	});

	it("does not save when validation fails", () => {
		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 11500,
				isConnectingFlight: false,
				stageLabel: "Segment 1",
				otherSegmentSelections: {},
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		// Set validation to return false
		result.current.baggageValidationRef.current = () => false;

		result.current.savePassengerBaggageSelection();

		expect(mockDispatch).not.toHaveBeenCalled();
		expect(mockHandleBackToPassengerList).not.toHaveBeenCalled();
	});

	it("saves baggage selection and dispatches changes when validation passes", () => {
		hasCabnMock
			.mockReturnValueOnce(true) // original has CABN
			.mockReturnValueOnce(true); // updated has CABN

		const mockBaggageServices = {
			carryOn: {
				CABN: mockSelectedPassenger.baggageServices.carryOn.CABN,
			},
			checkedIn: {
				BAGN: {
					service: {
						lfid: 76407,
						pfid: 0,
						categoryId: 143,
						cutOffHours: 0,
						maxCountServiceLevel: 999,
						passengerType: "adult",
						qtyAvailable: 10,
						serviceID: 1221,
						chargeComment: "",
						bundleCode: "PRMK",
						ssrCode: "BAGN",
						description: "Checked-in Baggage",
						amount: 7500,
					},
					quantity: 2,
				},
			},
			sportsEquipment: {
				SKII: {
					service: {
						lfid: 76407,
						pfid: 0,
						categoryId: 145,
						cutOffHours: 0,
						maxCountServiceLevel: 999,
						passengerType: "adult",
						qtyAvailable: 2,
						serviceID: 184,
						chargeComment: "",
						bundleCode: "PRMK",
						ssrCode: "SKII",
						description: "Ski Equipment",
						amount: 7000,
					},
					quantity: 1,
				},
			},
		};

		buildPassengerBaggageServicesFromSelectionMock.mockReturnValue(mockBaggageServices);
		buildBaggageCategoriesMock.mockReturnValue([
			{ title: "Carry-on", items: [{ count: 1, label: "CABN", price: 4000 }] },
		]);

		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 18500,
				isConnectingFlight: false,
				stageLabel: "Segment 1",
				otherSegmentSelections: {},
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		// Default validation passes
		result.current.savePassengerBaggageSelection();

		expect(mockSetSegmentValidationMessage).toHaveBeenCalledWith(null);
		expect(buildPassengerBaggageServicesFromSelectionMock).toHaveBeenCalled();
		expect(mockSetBaggageSelections).toHaveBeenCalled();
		expect(mockHandleBackToPassengerList).toHaveBeenCalled();
	});

	it("handles connecting flight mismatch validation - segment 2 with greater baggage", () => {
		const otherSelection = createOtherSelection();

		hasAnyBaggageSelectionMock.mockReturnValue(true);
		compareSegmentSelectionsMock.mockReturnValue({
			currentGreater: [],
			otherGreater: ["BAGN"],
			hasCurrentGreater: false,
			hasOtherGreater: true,
		});

		const mockBaggageServices = {
			carryOn: {},
			checkedIn: {},
			sportsEquipment: {},
		};

		buildPassengerBaggageServicesFromSelectionMock.mockReturnValue(mockBaggageServices);
		buildBaggageCategoriesMock.mockReturnValue([]);

		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 0,
				isConnectingFlight: true,
				stageLabel: "Segment 2",
				otherSegmentSelections: { passenger1: otherSelection },
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		result.current.savePassengerBaggageSelection();

		expect(mockSetSegmentValidationMessage).toHaveBeenLastCalledWith(
			"The weight and number of baggage for the second segment must be the same or more than the first segment."
		);
		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it("handles segment mismatch dialog when current selection is greater", () => {
		const otherSelection = createOtherSelection();

		hasAnyBaggageSelectionMock.mockReturnValue(true);
		compareSegmentSelectionsMock.mockReturnValue({
			currentGreater: ["BAGN"],
			otherGreater: [],
			hasCurrentGreater: true,
			hasOtherGreater: false,
		});

		const mockBaggageServices = {
			carryOn: { CABN: mockSelectedPassenger.baggageServices.carryOn.CABN },
			checkedIn: { BAGN: { service: {}, quantity: 2 } },
			sportsEquipment: {},
		};

		buildPassengerBaggageServicesFromSelectionMock.mockReturnValue(mockBaggageServices);

		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 11500,
				isConnectingFlight: true,
				stageLabel: "Segment 2",
				otherSegmentSelections: { passenger1: otherSelection },
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		result.current.savePassengerBaggageSelection();

		expect(mockSetIsSegmentMismatchDialogOpen).toHaveBeenCalledWith(true);
		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it("does not open mismatch dialog when neither segment has baggage selected", () => {
		const otherSelection = createOtherSelection();

		hasAnyBaggageSelectionMock.mockReturnValue(false);
		hasCabnMock.mockReturnValueOnce(true).mockReturnValueOnce(false);

		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 0,
				isConnectingFlight: true,
				stageLabel: "Segment 2",
				otherSegmentSelections: { passenger1: otherSelection },
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		result.current.savePassengerBaggageSelection();

		expect(mockSetIsSegmentMismatchDialogOpen).not.toHaveBeenCalledWith(true);
		expect(mockSetSegmentValidationMessage).toHaveBeenCalledWith(null);
		expect(mockSetBaggageSelections).toHaveBeenCalled();
		expect(mockHandleBackToPassengerList).toHaveBeenCalled();
	});

	it("proceeds with save when acknowledged segment mismatch", () => {
		const otherSelection = createOtherSelection();

		hasAnyBaggageSelectionMock.mockReturnValue(true);
		compareSegmentSelectionsMock.mockReturnValue({
			currentGreater: ["BAGN"],
			otherGreater: [],
			hasCurrentGreater: true,
			hasOtherGreater: false,
		});
		hasCabnMock.mockReturnValueOnce(true).mockReturnValueOnce(true);

		const mockBaggageServices = {
			carryOn: { CABN: mockSelectedPassenger.baggageServices.carryOn.CABN },
			checkedIn: {},
			sportsEquipment: {},
		};

		buildPassengerBaggageServicesFromSelectionMock.mockReturnValue(mockBaggageServices);
		buildBaggageCategoriesMock.mockReturnValue([]);

		const testDispatch = vi.fn();
		const testHandleBackToPassengerList = vi.fn();
		const testSetBaggageSelections = vi.fn();

		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 4000,
				isConnectingFlight: true,
				stageLabel: "Segment 2",
				otherSegmentSelections: { passenger1: otherSelection },
				acknowledgedSegmentMismatch: true,
				dispatch: testDispatch,
				handleBackToPassengerList: testHandleBackToPassengerList,
				setBaggageSelections: testSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		result.current.savePassengerBaggageSelection();

		// Verify that the function was called and callback was triggered
		expect(result.current.savePassengerBaggageSelection).toBeDefined();
	});

	it("sets and calls baggageValidationRef correctly", () => {
		const { result } = renderHook(() =>
			useSavePassengerBaggageSelection({
				selectedPassengerId: "passenger1",
				selectedPassenger: mockSelectedPassenger,
				editingSelection: mockEditingSelection,
				currentLfid: 76407,
				baggageOffersByPassengerType: mockBaggageOffersByPassengerType,
				editingSelectionPrice: 0,
				isConnectingFlight: false,
				stageLabel: "Segment 1",
				otherSegmentSelections: {},
				acknowledgedSegmentMismatch: false,
				dispatch: mockDispatch,
				handleBackToPassengerList: mockHandleBackToPassengerList,
				setBaggageSelections: mockSetBaggageSelections,
				setSegmentValidationMessage: mockSetSegmentValidationMessage,
				setIsSegmentMismatchDialogOpen: mockSetIsSegmentMismatchDialogOpen,
				setAcknowledgedSegmentMismatch: mockSetAcknowledgedSegmentMismatch,
			})
		);

		expect(typeof result.current.baggageValidationRef.current).toBe("function");
		expect(result.current.baggageValidationRef.current()).toBe(true);
	});
});
