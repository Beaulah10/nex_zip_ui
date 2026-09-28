/**
 * File: requesting-assistance.test.tsx
 * Description: Tests for RequestingAssistance component.
 * Covers assistance questions, companion flow, assistance reasons, restricted reasons,
 * wheelchair rendering, validation errors, and field change handlers.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { RequestingAssistance } from "@/components/customer-information/customer-information-modal/special-notes/assistance-section/requesting-assistance/requesting-assistance";
import { ASSISTANCE_REASONS } from "@/modules/utils/constants/customer-information/constants";
import { makeTestStore } from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

const helperMocks = vi.hoisted(() => ({
	convertToUppercase: vi.fn((value: string) => value.toUpperCase()),
	handleFieldOnChange: vi.fn(),
	clearErrors: vi.fn(),
}));

vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: ReactNode; variant?: string }) => (
		<div data-testid={`alert-${variant ?? "default"}`}>{children}</div>
	),
	AlertAction: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	AlertDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: ReactNode }) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}));

vi.mock("@repo/ui/components/checkbox", () => ({
	Checkbox: ({
		checked,
		onCheckedChange,
		id,
		"aria-invalid": ariaInvalid,
	}: {
		checked: boolean;
		onCheckedChange: (checked: boolean) => void;
		id: string;
		"aria-invalid"?: boolean;
	}) => (
		<input
			type="checkbox"
			data-testid={`checkbox-${id}`}
			checked={!!checked}
			aria-invalid={ariaInvalid}
			onChange={(event) => onCheckedChange(event.target.checked)}
		/>
	),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { errors?: { message?: string }[] }) =>
		errors ? (
			<div data-testid="field-error">{errors.map((error) => error.message).join(", ")}</div>
		) : null,
	FieldHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldLabel: ({ children }: { children: ReactNode }) => <span>{children}</span>,
	FieldTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
		<div className={className}>{children}</div>
	),
}));

vi.mock("@repo/ui/components/input-field", () => ({
	InputField: ({
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
			<input data-testid={`input-${id}`} aria-label={label} onChange={onChange} onBlur={onBlur} />
			{errors ? (
				<div data-testid={`input-error-${id}`}>
					{errors.map((error) => error.message).join(", ")}
				</div>
			) : null}
		</div>
	),
}));

vi.mock("@repo/ui/components/input", () => ({
	Input: ({ id, onChange, onBlur, ...props }: any) => (
		<input data-testid={`input-${id}`} onChange={onChange} onBlur={onBlur} {...props} />
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

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/modules/utils/helpers/common/string-utils/string-utils", () => ({
	convertToUppercase: helperMocks.convertToUppercase,
}));

vi.mock("@/modules/utils/helpers/customer-information/customer-information-utils", () => ({
	getFieldErrors: (error?: { message?: string }) =>
		error ? [{ message: error.message }] : undefined,
	handleFieldOnChange: helperMocks.handleFieldOnChange,
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/assistance-section/wheelchair-assistance/wheelchair-assistance",
	() => ({
		WheelChairAssitance: () => <div data-testid="wheelchair-assistance">wheelchair</div>,
	})
);

function renderRequestingAssistance({
	formValues = {},
	errors = [],
}: {
	formValues?: Partial<PassengerInformation>;
	errors?: Array<{ name: keyof PassengerInformation; message?: string }>;
} = {}) {
	const store = makeTestStore();

	function Wrapper({ children }: { children: ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				requestingAssistance: true,
				canManagePersonalNeeds: "",
				boardingWithAccompanion: "",
				accompanyingPersonName: "",
				assistanceReasons: [],
				...formValues,
			},
		});

		vi.spyOn(methods, "clearErrors").mockImplementation(helperMocks.clearErrors);

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

	return render(<RequestingAssistance />, { wrapper: Wrapper });
}

describe("RequestingAssistance", () => {
	it("renders assistance title, manage personal needs question and special support alert", () => {
		renderRequestingAssistance();

		expect(screen.getByText("assistance_questions_title")).toBeTruthy();
		expect(screen.getByText("question_manage_personal_needs")).toBeTruthy();
		expect(screen.getByText("special_support_title")).toBeTruthy();
		expect(screen.getByText("special_support_description")).toBeTruthy();
	});

	it("does not render boarding question when canManagePersonalNeeds is empty", () => {
		renderRequestingAssistance();

		expect(screen.queryByText("question_boarding_with_accompanying_person")).toBeFalsy();
	});

	it("renders boarding question when canManagePersonalNeeds has value", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
			},
		});

		expect(screen.getByText("question_boarding_with_accompanying_person")).toBeTruthy();
	});

	it("changes canManagePersonalNeeds without boarding error", async () => {
		renderRequestingAssistance();

		const yesButton = screen.getByTestId("radio-change-yes");

		fireEvent.click(yesButton);

		await waitFor(() => {
			expect(screen.getByText("question_boarding_with_accompanying_person")).toBeTruthy();
		});
	});

	it("changes canManagePersonalNeeds when boarding error exists", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
			},
			errors: [{ name: "boardingWithAccompanion", message: "boarding-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("boarding-error")).toBeTruthy();
		});

		const noButtons = screen.getAllByTestId("radio-change-no");

		expect(noButtons.length).toBeGreaterThan(0);

		const firstNoButton = noButtons[0];

		if (!firstNoButton) {
			throw new Error("Expected no button");
		}

		fireEvent.click(firstNoButton);

		expect(screen.getByText("question_boarding_with_accompanying_person")).toBeTruthy();
	});

	it("renders canManagePersonalNeeds error", async () => {
		renderRequestingAssistance({
			errors: [{ name: "canManagePersonalNeeds", message: "manage-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("manage-error")).toBeTruthy();
		});
	});

	it("renders boardingWithAccompanion error", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
			},
			errors: [{ name: "boardingWithAccompanion", message: "boarding-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("boarding-error")).toBeTruthy();
		});
	});

	it("renders accompanying name input when boardingWithAccompanion is yes", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "yes",
			},
		});

		expect(screen.getByTestId("input-accompanying-name")).toBeTruthy();
	});

	it("does not render accompanying name input when boardingWithAccompanion is no", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
			},
		});

		expect(screen.queryByTestId("input-accompanying-name")).toBeFalsy();
	});

	it("clears assistance reasons from undefined state", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: undefined,
			},
		});

		expect(screen.getAllByText("label_assistance_reason").length).toBeGreaterThan(0);
	});

	it("clears accompanying name when the companion input is hidden", () => {
		helperMocks.clearErrors.mockClear();

		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
			},
		});

		expect(helperMocks.clearErrors).toHaveBeenCalledWith("accompanyingPersonName");
	});

	it("calls uppercase conversion and handleFieldOnChange for accompanying name", () => {
		helperMocks.convertToUppercase.mockClear();
		helperMocks.handleFieldOnChange.mockClear();

		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "yes",
			},
		});

		fireEvent.change(screen.getByTestId("input-accompanying-name"), {
			target: { value: "alex" },
		});

		expect(helperMocks.convertToUppercase).toHaveBeenCalledWith("alex");
		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"accompanyingPersonName",
			"ALEX",
			expect.any(Function),
			false
		);
	});

	it("calls handleFieldOnChange with hasError true for accompanying name", async () => {
		helperMocks.handleFieldOnChange.mockClear();

		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "yes",
			},
			errors: [{ name: "accompanyingPersonName", message: "name-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("name-error")).toBeTruthy();
		});

		fireEvent.change(screen.getByTestId("input-accompanying-name"), {
			target: { value: "john" },
		});

		expect(helperMocks.handleFieldOnChange).toHaveBeenCalledWith(
			"accompanyingPersonName",
			"JOHN",
			expect.any(Function),
			true
		);
	});

	it("handles accompanying name blur", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "yes",
			},
		});

		fireEvent.blur(screen.getByTestId("input-accompanying-name"));

		expect(screen.getByTestId("input-accompanying-name")).toBeTruthy();
	});

	it("renders accompanying warning when passenger cannot manage needs and has no companion", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "no",
				boardingWithAccompanion: "no",
			},
		});

		expect(screen.getByText("accompanying_warning_title")).toBeTruthy();
		expect(screen.getByText("accompanying_warning_description")).toBeTruthy();
		expect(screen.queryByText("label_assistance_reason")).toBeFalsy();
	});

	it("sets the boarding warning aria-invalid when boarding error exists", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "no",
				boardingWithAccompanion: "no",
			},
			errors: [{ name: "boardingWithAccompanion", message: "boarding-error" }],
		});

		expect(screen.getByText("accompanying_warning_title")).toBeTruthy();
		expect(screen.getByText("accompanying_warning_description")).toBeTruthy();
	});

	it("clears assistance reasons when the warning hides the section", () => {
		helperMocks.clearErrors.mockClear();

		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "no",
				boardingWithAccompanion: "no",
			},
		});

		expect(helperMocks.clearErrors).toHaveBeenCalledWith("assistanceReasons");
	});

	it("renders assistance reasons when boarding with no companion and no warning", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
			},
		});

		const firstReason = ASSISTANCE_REASONS.at(0);
		const secondReason = ASSISTANCE_REASONS.at(1);
		const fifthReason = ASSISTANCE_REASONS.at(4);

		if (!firstReason || !secondReason || !fifthReason) {
			throw new Error("Missing shared assistance reasons");
		}

		expect(screen.getAllByText("label_assistance_reason").length).toBeGreaterThan(0);
		expect(screen.getAllByText("multiple_selections_allowed").length).toBeGreaterThan(0);
		expect(screen.getByText(firstReason.label)).toBeTruthy();
		expect(screen.getByText(secondReason.label)).toBeTruthy();
		expect(screen.getByText(fifthReason.label)).toBeTruthy();
		expect(screen.getByText(firstReason.label).className).toContain("text-base-900");
		expect(screen.getByText(secondReason.label).className).toContain("text-base-900");
		expect(screen.getByText(fifthReason.label).className).toContain("text-base-900");
	});

	it("renders assistance reasons when companion name is present", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "yes",
				accompanyingPersonName: "ALEX",
			},
		});

		expect(screen.getAllByText("label_assistance_reason").length).toBeGreaterThan(0);
	});

	it("does not render assistance reasons when companion name is blank", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "yes",
				accompanyingPersonName: "   ",
			},
		});

		expect(screen.queryByText("label_assistance_reason")).toBeFalsy();
	});

	it("adds assistance reason when checkbox is checked", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: [],
			},
		});

		const visualCheckbox = screen.getByTestId("checkbox-reason-visual") as HTMLInputElement;

		expect(visualCheckbox.checked).toBe(false);

		fireEvent.click(visualCheckbox);

		await waitFor(() => {
			expect(visualCheckbox.checked).toBe(true);
		});
	});

	it("removes assistance reason when checkbox is unchecked", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: ["visual"],
			},
		});

		const visualCheckbox = screen.getByTestId("checkbox-reason-visual") as HTMLInputElement;

		expect(visualCheckbox.checked).toBe(true);

		fireEvent.click(visualCheckbox);

		await waitFor(() => {
			expect(visualCheckbox.checked).toBe(false);
		});
	});

	it("keeps assistance reason error visible for non restricted reason", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: ["visual"],
			},
			errors: [{ name: "assistanceReasons", message: "assistance-error" }],
		});

		await waitFor(() => {
			expect(screen.getByTestId("field-error").textContent ?? "").toMatch("assistance-error");
		});

		const visualCheckbox = screen.getByTestId("checkbox-reason-visual") as HTMLInputElement;
		expect(visualCheckbox.getAttribute("aria-invalid")).toBe("true");
	});

	it("re-triggers assistance reason validation when an error exists and a reason is toggled", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: [],
			},
			errors: [{ name: "assistanceReasons", message: "assistance-error" }],
		});

		fireEvent.click(screen.getByTestId("checkbox-reason-visual"));

		expect(screen.getByTestId("checkbox-reason-visual")).toBeTruthy();
	});

	it("does not show assistance reason error when restricted reason exists", async () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: ["illness"],
			},
			errors: [{ name: "assistanceReasons", message: "assistance-error" }],
		});

		await waitFor(() => {
			expect(screen.queryByText("assistance-error")).toBeFalsy();
		});

		expect(screen.getByText("contact_required_title")).toBeTruthy();
		expect(screen.getByText("contact_required_description")).toBeTruthy();
	});

	it("does not render contact alert for non restricted reason", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: ["visual"],
			},
		});

		expect(screen.queryByText("contact_required_title")).toBeFalsy();
	});

	it("renders wheelchair assistance when wheelchair reason is selected", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: ["wheelchair"],
			},
		});

		expect(screen.getByTestId("wheelchair-assistance")).toBeTruthy();
	});

	it("does not render wheelchair assistance when accompanying warning is active", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "no",
				boardingWithAccompanion: "no",
				assistanceReasons: ["wheelchair"],
			},
		});

		expect(screen.getByText("accompanying_warning_title")).toBeTruthy();
		expect(screen.queryByTestId("wheelchair-assistance")).toBeFalsy();
	});

	it("does not render wheelchair assistance when wheelchair reason is not selected", () => {
		renderRequestingAssistance({
			formValues: {
				canManagePersonalNeeds: "yes",
				boardingWithAccompanion: "no",
				assistanceReasons: ["visual"],
			},
		});

		expect(screen.queryByTestId("wheelchair-assistance")).toBeFalsy();
	});
});
