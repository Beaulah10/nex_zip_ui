/**
 * File: wheelchair-assistance.test.tsx
 * Description: Tests for WheelChairAssitance component.
 * Covers wheelchair question branches, battery/manual flows, dimensions, errors, and field handlers.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { WheelChairAssitance } from "@/components/customer-information/customer-information-modal/special-notes/assistance-section/wheelchair-assistance/wheelchair-assistance";
import {
	BATTERY_TYPES,
	WHEELCHAIR_REASONS,
} from "@/modules/utils/constants/customer-information/constants";
import { makeTestStore } from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

const helperMocks = vi.hoisted(() => ({
	handleFieldOnChange: vi.fn(),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: ReactNode }) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { errors?: { message?: string }[] }) =>
		errors ? (
			<div data-testid="field-error">{errors.map((error) => error.message).join(", ")}</div>
		) : null,
	FieldHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldLabel: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldDimensionInput: ({
		id,
		label,
		onChange,
		onBlur,
		errors,
	}: {
		id: string;
		label: string;
		onChange?: React.ChangeEventHandler<HTMLInputElement>;
		onBlur?: React.FocusEventHandler<HTMLInputElement>;
		errors?: { message?: string }[];
	}) => (
		<div>
			<input
				type="number"
				data-testid={`dim-${id}`}
				aria-label={label}
				onChange={onChange}
				onBlur={onBlur}
			/>
			{errors ? (
				<div data-testid={`dim-error-${id}`}>{errors.map((error) => error.message).join(", ")}</div>
			) : null}
		</div>
	),
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({
		children,
		onValueChange,
	}: {
		children: ReactNode;
		onValueChange?: (value: string) => void;
	}) => (
		<div data-testid="radio-group">
			<button type="button" data-testid="radio-change-yes" onClick={() => onValueChange?.("yes")}>
				yes
			</button>
			<button type="button" data-testid="radio-change-no" onClick={() => onValueChange?.("no")}>
				no
			</button>
			<button
				type="button"
				data-testid="radio-change-electric"
				onClick={() => onValueChange?.("electric")}
			>
				electric
			</button>
			<button
				type="button"
				data-testid="radio-change-manual"
				onClick={() => onValueChange?.("manual")}
			>
				manual
			</button>
			<button
				type="button"
				data-testid="radio-change-aftereffects"
				onClick={() => onValueChange?.("aftereffects")}
			>
				aftereffects
			</button>
			<button
				type="button"
				data-testid="radio-change-lithium-ion"
				onClick={() => onValueChange?.("lithium-ion")}
			>
				lithium-ion
			</button>
			{children}
		</div>
	),
	RadioGroupBorderedItem: ({ value, label }: { value: string; label?: string }) => (
		<label data-testid={`radio-${value}`}>
			<input type="radio" value={value} />
			{label}
		</label>
	),
}));

vi.mock("@repo/ui/components/separator", () => ({
	Separator: () => <hr data-testid="separator" />,
}));

vi.mock("@/modules/utils/helpers/customer-information/customer-information-utils", () => ({
	getFieldErrors: (error?: { message?: string }) =>
		error ? [{ message: error.message }] : undefined,
	handleFieldOnChange: helperMocks.handleFieldOnChange,
}));

function renderWheelchairAssistance({
	showWheelchair = true,
	formValues = {},
	errors = [],
}: {
	showWheelchair?: boolean;
	formValues?: Partial<PassengerInformation>;
	errors?: Array<{ name: keyof PassengerInformation; message?: string }>;
} = {}) {
	const store = makeTestStore();

	function Wrapper({ children }: { children: ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				canWalk: "",
				canGoUpDownStairs: "",
				needsOnboardWheelchair: "",
				reasonForWheelchair: "",
				bringingOwnWheelchair: "",
				wheelchairType: "",
				wheelchairBatteryRemovable: "",
				wheelchairBatteryType: "",
				isFoldable: "",
				wheelchairHeight: "",
				wheelchairWidth: "",
				wheelchairDepth: "",
				wheelchairWeight: "",
				...formValues,
			},
		});

		useEffect(() => {
			for (const error of errors) {
				methods.setError(error.name, {
					type: "manual",
					message: error.message,
				});
			}
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>{children}</FormProvider>
			</Provider>
		);
	}

	return render(<WheelChairAssitance showWheelchair={showWheelchair} />, { wrapper: Wrapper });
}

describe("WheelChairAssitance", () => {
	it("renders base wheelchair title and can walk question", () => {
		renderWheelchairAssistance();

		expect(screen.getByText("wheelchair_questions_title")).toBeTruthy();
		expect(screen.getByText("question_can_walk")).toBeTruthy();
	});

	it("does not render conditional wheelchair questions when showWheelchair is false", () => {
		renderWheelchairAssistance({
			showWheelchair: false,
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
				wheelchairBatteryType: "lithium-ion",
			},
		});

		expect(screen.getByText("question_can_walk")).toBeTruthy();
		expect(screen.queryByText("question_can_use_stairs")).toBeFalsy();
		expect(screen.queryByText("question_reason_for_wheelchair")).toBeFalsy();
		expect(screen.queryByText("wheelchair_dimensions_title")).toBeFalsy();
	});

	it("renders stairs question when passenger can walk", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
			},
		});

		expect(screen.getByText("question_can_use_stairs")).toBeTruthy();
		expect(screen.queryByText("question_need_onboard_wheelchair")).toBeFalsy();
	});

	it("renders onboard wheelchair question when passenger cannot walk", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "no",
			},
		});

		expect(screen.getByText("question_need_onboard_wheelchair")).toBeTruthy();
		expect(screen.queryByText("question_can_use_stairs")).toBeFalsy();
	});

	it("renders wheelchair reason when passenger can walk and stairs answer exists", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
			},
		});

		const firstReason = WHEELCHAIR_REASONS.find((reason) => reason.value === "aftereffects");
		const fourthReason = WHEELCHAIR_REASONS.find((reason) => reason.value === "injury");

		if (!firstReason || !fourthReason) {
			throw new Error("Missing shared wheelchair reasons");
		}

		expect(screen.getByText("question_reason_for_wheelchair")).toBeTruthy();
		expect(screen.getByText(firstReason.label)).toBeTruthy();
		expect(screen.getByText(fourthReason.label)).toBeTruthy();
	});

	it("renders wheelchair reason when passenger cannot walk and onboard wheelchair answer exists", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "no",
				needsOnboardWheelchair: "yes",
			},
		});

		expect(screen.getByText("question_reason_for_wheelchair")).toBeTruthy();
	});

	it("does not render wheelchair reason when required dependency is missing", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "",
			},
		});

		expect(screen.queryByText("question_reason_for_wheelchair")).toBeFalsy();
	});

	it("renders bring own wheelchair question after wheelchair reason is selected", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
			},
		});

		expect(screen.getByText("question_bring_own_wheelchair")).toBeTruthy();
	});

	it("does not render bring own wheelchair question when reason is empty", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "",
			},
		});

		expect(screen.queryByText("question_bring_own_wheelchair")).toBeFalsy();
	});

	it("renders wheelchair type question when bringing own wheelchair is yes", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
			},
		});

		expect(screen.getByText("question_wheelchair_type")).toBeTruthy();
	});

	it("does not render wheelchair type when bringing own wheelchair is no", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "no",
			},
		});

		expect(screen.queryByText("question_wheelchair_type")).toBeFalsy();
	});

	it("renders electric wheelchair battery removable question", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
			},
		});

		expect(screen.getByText("question_battery_removable")).toBeTruthy();
		expect(screen.queryByText("question_battery_type")).toBeFalsy();
		expect(screen.queryByText("wheelchair_dimensions_title")).toBeFalsy();
	});

	it("renders battery type when electric wheelchair battery removable has value", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
			},
		});

		const thirdBattery = BATTERY_TYPES.find((battery) => battery.value === "lithium-ion");
		const fourthBattery = BATTERY_TYPES.find((battery) => battery.value === "lead-acid");

		if (!thirdBattery || !fourthBattery) {
			throw new Error("Missing shared battery types");
		}

		expect(screen.getByText("question_battery_type")).toBeTruthy();
		expect(screen.getByText(thirdBattery.label)).toBeTruthy();
		expect(screen.getByText(fourthBattery.label)).toBeTruthy();
		expect(screen.queryByText("wheelchair_dimensions_title")).toBeFalsy();
	});

	it("renders dimensions for electric wheelchair when battery type is selected", () => {
		helperMocks.handleFieldOnChange.mockClear();

		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
				wheelchairBatteryType: "lithium-ion",
			},
		});

		expect(screen.getByText("wheelchair_dimensions_title")).toBeTruthy();

		fireEvent.change(screen.getByTestId("dim-wheelchair-height"), {
			target: { value: "10" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-height"));

		fireEvent.change(screen.getByTestId("dim-wheelchair-width"), {
			target: { value: "20" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-width"));

		fireEvent.change(screen.getByTestId("dim-wheelchair-depth"), {
			target: { value: "30" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-depth"));

		fireEvent.change(screen.getByTestId("dim-wheelchair-weight"), {
			target: { value: "40" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-weight"));

		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairHeight",
			"10",
			expect.any(Function),
			false
		);
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairWidth",
			"20",
			expect.any(Function),
			false
		);
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairDepth",
			"30",
			expect.any(Function),
			false
		);
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairWeight",
			"40",
			expect.any(Function),
			false
		);
	});

	it("renders manual wheelchair foldable question", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "manual",
			},
		});

		expect(screen.getByText("question_wheelchair_foldable")).toBeTruthy();
		expect(screen.queryByText("wheelchair_dimensions_title")).toBeFalsy();
	});

	it("renders dimensions for manual wheelchair when foldable value exists", () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "manual",
				isFoldable: "yes",
			},
		});

		expect(screen.getByText("wheelchair_dimensions_title")).toBeTruthy();
		expect(screen.getByTestId("dim-wheelchair-height")).toBeTruthy();
		expect(screen.getByTestId("dim-wheelchair-width")).toBeTruthy();
		expect(screen.getByTestId("dim-wheelchair-depth")).toBeTruthy();
		expect(screen.getByTestId("dim-wheelchair-weight")).toBeTruthy();
	});
	it("updates fields using radio group change handlers", async () => {
		renderWheelchairAssistance();

		const yesButtons = screen.getAllByTestId("radio-change-yes");

		const firstYesButton = yesButtons[0];

		if (!firstYesButton) {
			throw new Error("Expected first yes button");
		}

		fireEvent.click(firstYesButton);

		await waitFor(() => {
			expect(screen.getByText("question_can_use_stairs")).toBeTruthy();
		});

		const updatedYesButtons = screen.getAllByTestId("radio-change-yes");

		const secondYesButton = updatedYesButtons[1];

		if (!secondYesButton) {
			throw new Error("Expected second yes button");
		}

		fireEvent.click(secondYesButton);

		await waitFor(() => {
			expect(screen.getByText("question_reason_for_wheelchair")).toBeTruthy();
		});

		const afterEffectsButtons = screen.getAllByTestId("radio-change-aftereffects");
		const reasonAfterEffectsButton = afterEffectsButtons[2];

		if (!reasonAfterEffectsButton) {
			throw new Error("Expected reason aftereffects button");
		}

		fireEvent.click(reasonAfterEffectsButton);

		await waitFor(() => {
			expect(screen.getByText("question_bring_own_wheelchair")).toBeTruthy();
		});
	});

	it("renders radio field errors", async () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
				wheelchairBatteryType: "lithium-ion",
			},
			errors: [
				{ name: "canWalk", message: "can-walk-error" },
				{ name: "canGoUpDownStairs", message: "stairs-error" },
				{ name: "reasonForWheelchair", message: "reason-error" },
				{ name: "bringingOwnWheelchair", message: "bring-error" },
				{ name: "wheelchairType", message: "type-error" },
				{ name: "wheelchairBatteryRemovable", message: "removable-error" },
				{ name: "wheelchairBatteryType", message: "battery-error" },
			],
		});

		await waitFor(() => {
			expect(screen.getByText("can-walk-error")).toBeTruthy();
			expect(screen.getByText("stairs-error")).toBeTruthy();
			expect(screen.getByText("reason-error")).toBeTruthy();
			expect(screen.getByText("bring-error")).toBeTruthy();
			expect(screen.getByText("type-error")).toBeTruthy();
			expect(screen.getByText("removable-error")).toBeTruthy();
			expect(screen.getByText("battery-error")).toBeTruthy();
		});
	});

	it("renders manual foldable error", async () => {
		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "manual",
			},
			errors: [{ name: "isFoldable", message: "foldable-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("foldable-error")).toBeTruthy();
		});
	});

	it("renders dimension errors and passes hasError true on change", async () => {
		helperMocks.handleFieldOnChange.mockClear();

		renderWheelchairAssistance({
			formValues: {
				canWalk: "yes",
				canGoUpDownStairs: "yes",
				reasonForWheelchair: "aftereffects",
				bringingOwnWheelchair: "yes",
				wheelchairType: "electric",
				wheelchairBatteryRemovable: "yes",
				wheelchairBatteryType: "lithium-ion",
			},
			errors: [
				{ name: "wheelchairHeight", message: "height-error" },
				{ name: "wheelchairWidth", message: "width-error" },
				{ name: "wheelchairDepth", message: "depth-error" },
				{ name: "wheelchairWeight", message: "weight-error" },
			],
		});

		await waitFor(() => {
			expect(screen.getByTestId("dim-error-wheelchair-height").textContent ?? "").toMatch(
				"height-error"
			);
			expect(screen.getByTestId("dim-error-wheelchair-width").textContent ?? "").toMatch(
				"width-error"
			);
			expect(screen.getByTestId("dim-error-wheelchair-depth").textContent ?? "").toMatch(
				"depth-error"
			);
			expect(screen.getByTestId("dim-error-wheelchair-weight").textContent ?? "").toMatch(
				"weight-error"
			);
		});

		fireEvent.change(screen.getByTestId("dim-wheelchair-height"), {
			target: { value: "11" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-height"));

		fireEvent.change(screen.getByTestId("dim-wheelchair-width"), {
			target: { value: "22" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-width"));

		fireEvent.change(screen.getByTestId("dim-wheelchair-depth"), {
			target: { value: "33" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-depth"));

		fireEvent.change(screen.getByTestId("dim-wheelchair-weight"), {
			target: { value: "44" },
		});
		fireEvent.blur(screen.getByTestId("dim-wheelchair-weight"));

		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairHeight",
			"11",
			expect.any(Function),
			true
		);
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairWidth",
			"22",
			expect.any(Function),
			true
		);
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairDepth",
			"33",
			expect.any(Function),
			true
		);
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"wheelchairWeight",
			"44",
			expect.any(Function),
			true
		);
	});
});
