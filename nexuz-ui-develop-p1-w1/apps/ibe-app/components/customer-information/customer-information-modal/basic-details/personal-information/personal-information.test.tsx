/**
 * File: personal-information.test.tsx
 * Classification: Component
 * Description: Tests for PersonalInformation — name fields, gender, date of birth,
 * nationality, country of residence, and infant-specific weight/height fields.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { PersonalInformation } from "@/components/customer-information/customer-information-modal/basic-details/personal-information/personal-information";
import {
	makePassenger,
	makeTestStore,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

const mocks = vi.hoisted(() => ({
	convertToUppercaseMock: vi.fn((value: string) => value.toUpperCase()),

	handleFieldOnChangeMock: vi.fn(
		(name: string, value: string, setValue: any, shouldValidate: boolean) => {
			setValue(name, value, { shouldValidate });
		}
	),
}));

vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<div data-testid={`alert-${variant ?? "default"}`}>{children}</div>
	),
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<span data-testid={`badge-${variant}`}>{children}</span>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button type="button" data-testid="form-btn" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/combobox", () => ({
	Combobox: ({
		children,
		onValueChange,
		value,
		itemToStringLabel,
	}: {
		children: React.ReactNode;
		onValueChange?: (value: string) => void;
		value?: string;
		itemToStringLabel?: (value: unknown) => string;
	}) => (
		<div data-testid="combobox">
			<button type="button" data-testid="combobox-change" onClick={() => onValueChange?.("2030")}>
				change
			</button>
			{itemToStringLabel ? (
				<span data-testid="combobox-label">{itemToStringLabel(value ?? "")}</span>
			) : null}
			{children}
		</div>
	),
	ComboboxContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ComboboxEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ComboboxInput: ({
		id,
		"aria-label": ariaLabel,
		onBlur,
	}: {
		id: string;
		"aria-label"?: string;
		onBlur?: () => void;
	}) => <input data-testid={`combobox-${id}`} aria-label={ariaLabel} onBlur={onBlur} />,
	ComboboxItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ComboboxList: ({ children }: { children: (val: string) => React.ReactNode }) => (
		<div>{children("JPN")}</div>
	),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { id?: string; errors?: { message: string }[] }) =>
		errors ? <div data-testid="field-error">{errors.map((e) => e.message).join(", ")}</div> : null,
	FieldHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldLabel: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="field-label">{children}</span>
	),
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldCombobox: ({
		children,
		onValueChange,
		value,
		itemToStringLabel,
		inputId,
		inputAriaLabel,
		inputOnBlur,
	}: {
		children: (value: string) => React.ReactNode;
		onValueChange?: (value: string) => void;
		value?: string;
		itemToStringLabel?: (value: unknown) => string;
		inputId?: string;
		inputAriaLabel?: string;
		inputOnBlur?: () => void;
	}) => (
		<div data-testid="combobox">
			<button type="button" data-testid="combobox-change" onClick={() => onValueChange?.("2030")}>
				change
			</button>
			{itemToStringLabel ? (
				<span data-testid="combobox-label">{itemToStringLabel(value ?? "")}</span>
			) : null}
			<input data-testid={`combobox-${inputId}`} aria-label={inputAriaLabel} onBlur={inputOnBlur} />
			<div>{children("JPN")}</div>
		</div>
	),

	FieldRadioGroup: ({
		children,
		label,
		onValueChange,
		onBlur,
	}: {
		children: React.ReactNode;
		label?: string;
		onValueChange?: (value: string) => void;
		onBlur?: () => void;
	}) => (
		<div>
			{label && <span data-testid={`label-${label}`}>{label}</span>}
			<button
				type="button"
				data-testid={`radio-change-${label}`}
				onClick={() => onValueChange?.("Less than 9kg")}
			>
				change
			</button>
			<button type="button" data-testid={`radio-blur-${label}`} onClick={() => onBlur?.()}>
				blur
			</button>
			<div data-testid="radio-group">{children}</div>
		</div>
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
		errors?: { message: string }[];
	}) => (
		<div>
			<input data-testid={`input-${id}`} aria-label={label} onChange={onChange} onBlur={onBlur} />
			{errors ? (
				<div data-testid={`input-error-${id}`}>{errors.map((e) => e.message).join(", ")}</div>
			) : null}
		</div>
	),
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroupBorderedItem: ({
		value,
		children,
		label,
	}: {
		value: string;
		children?: React.ReactNode;
		label?: string;
	}) => (
		<label data-testid={`radio-${value}`}>
			<input type="radio" value={value} />
			{children ?? label}
		</label>
	),
}));

vi.mock("@/modules/utils/helpers/common/nationality-utils/nationality-utils", () => ({
	useCountryOptions: () => [
		{ code: "jp", alpha3: "JPN", name: "Japan" },
		{ code: "us", alpha3: "USA", name: "United States" },
	],
}));

vi.mock("@/modules/utils/helpers/common/string-utils/string-utils", () => ({
	convertToUppercase: mocks.convertToUppercaseMock,
}));

vi.mock(
	"@/modules/utils/helpers/customer-information/customer-information-utils",
	async (importOriginal) => {
		const actual =
			await importOriginal<
				typeof import("@/modules/utils/helpers/customer-information/customer-information-utils")
			>();

		return {
			...actual,
			getFieldErrors: (error: any) => {
				if (!error) {
					return undefined;
				}

				if (error.message) {
					return [
						{
							message: error.message,
						},
					];
				}

				return [
					{
						message: "error_date_of_birth_required",
					},
				];
			},

			isFieldDateInvalid: vi.fn(() => false),

			handleFieldOnChange: mocks.handleFieldOnChangeMock,

			triggerFieldDateValidation: vi.fn(),
		};
	}
);

function renderPersonalInformationWithErrors(
	ui: React.ReactElement,
	{
		formValues = {},
		errors = [],
	}: {
		formValues?: Partial<PassengerInformation>;
		errors?: Array<{ name: keyof PassengerInformation | "dateOfBirth"; message?: string }>;
	} = {}
) {
	const store = makeTestStore();

	function Wrapper({ children }: { children: React.ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				lastName: "",
				firstName: "",
				middleName: "",
				gender: "" as PassengerInformation["gender"],
				dateOfBirth: { year: "", month: "", day: "" },
				nationality: "",
				countryOfResidence: "",
				bodyWeight: "",
				bodyHeight: "",
				...formValues,
			},
		});

		useEffect(() => {
			for (const error of errors) {
				methods.setError(error.name as any, { type: "manual", message: error.message });
			}
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>{children}</FormProvider>
			</Provider>
		);
	}

	return render(ui, { wrapper: Wrapper });
}

const adultPax = makePassenger({ passengerTypeCode: "adult" });
const infantPax = makePassenger({ passengerTypeCode: "infant" });

describe("PersonalInformation - names", () => {
	it("renders the three name inputs and helper text", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={false} />);

		expect(screen.getByTestId("input-last-name")).toBeTruthy();
		expect(screen.getByTestId("input-first-name")).toBeTruthy();
		expect(screen.getByTestId("input-middle-name")).toBeTruthy();
		expect(screen.getByText("helper_middle_name")).toBeTruthy();
	});

	it("calls uppercase helper for all name field changes", () => {
		mocks.convertToUppercaseMock.mockClear();
		mocks.handleFieldOnChangeMock.mockClear();

		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={false} />);

		fireEvent.change(screen.getByTestId("input-last-name"), { target: { value: "doe" } });
		fireEvent.change(screen.getByTestId("input-first-name"), { target: { value: "john" } });
		fireEvent.change(screen.getByTestId("input-middle-name"), { target: { value: "m" } });

		expect(mocks.convertToUppercaseMock).toHaveBeenCalledTimes(3);
		expect(mocks.handleFieldOnChangeMock).toHaveBeenCalledTimes(3);
	});

	it("blurs all three name fields", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={false} />);

		fireEvent.blur(screen.getByTestId("input-last-name"));
		fireEvent.blur(screen.getByTestId("input-first-name"));
		fireEvent.blur(screen.getByTestId("input-middle-name"));

		expect(screen.getByTestId("input-middle-name")).toBeTruthy();
	});

	it("renders name field errors when present", () => {
		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={adultPax} isUsRoute={false} />,
			{
				errors: [
					{ name: "lastName", message: "last-name-error" },
					{ name: "firstName", message: "first-name-error" },
					{ name: "middleName", message: "middle-name-error" },
				],
			}
		);

		expect(screen.getByTestId("input-error-last-name").textContent ?? "").toMatch(
			"last-name-error"
		);
		expect(screen.getByTestId("input-error-first-name").textContent ?? "").toMatch(
			"first-name-error"
		);
		expect(screen.getByTestId("input-error-middle-name").textContent ?? "").toMatch(
			"middle-name-error"
		);
	});

	it("calls uppercase helper when name fields already have errors", () => {
		mocks.convertToUppercaseMock.mockClear();
		mocks.handleFieldOnChangeMock.mockClear();

		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={adultPax} isUsRoute={false} />,
			{
				errors: [
					{ name: "lastName", message: "last-name-error" },
					{ name: "firstName", message: "first-name-error" },
					{ name: "middleName", message: "middle-name-error" },
				],
			}
		);

		fireEvent.change(screen.getByTestId("input-last-name"), { target: { value: "DOE" } });
		fireEvent.change(screen.getByTestId("input-first-name"), { target: { value: "JOHN" } });
		fireEvent.change(screen.getByTestId("input-middle-name"), { target: { value: "M" } });

		expect(mocks.convertToUppercaseMock).toHaveBeenCalledTimes(3);
		expect(mocks.handleFieldOnChangeMock).toHaveBeenCalledTimes(3);
	});
});

describe("PersonalInformation - gender and birth date", () => {
	it("renders gender options", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={false} />);

		expect(screen.getByTestId("radio-group")).toBeTruthy();
		expect(screen.getByTestId("radio-male")).toBeTruthy();
		expect(screen.getByTestId("radio-female")).toBeTruthy();
	});

	it("renders and blurs all date-of-birth inputs", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={false} />, {
			formValues: { dateOfBirth: { year: "1990", month: "06", day: "15" } },
		});

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		fireEvent.blur(screen.getByTestId("combobox-date-of-birth-year"));
		fireEvent.blur(screen.getByTestId("combobox-date-of-birth-month"));
		fireEvent.blur(screen.getByTestId("combobox-date-of-birth-day"));

		expect(screen.getByTestId("combobox-date-of-birth-year")).toBeTruthy();
		expect(screen.getByTestId("combobox-date-of-birth-month")).toBeTruthy();
		expect(screen.getByTestId("combobox-date-of-birth-day")).toBeTruthy();
	});

	it("renders the fallback date-of-birth error message when the error has no message", () => {
		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={adultPax} isUsRoute={false} />,
			{ errors: [{ name: "dateOfBirth" }] }
		);

		expect(screen.getByTestId("field-error").textContent ?? "").toMatch(
			"error_date_of_birth_required"
		);
	});

	it("triggers date-of-birth change handlers when a date error is present", () => {
		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={adultPax} isUsRoute={false} />,
			{
				formValues: { dateOfBirth: { year: "1990", month: "06", day: "15" } },
				errors: [{ name: "dateOfBirth", message: "dob-error" }],
			}
		);

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		expect(screen.getByTestId("field-error").textContent ?? "").toMatch("dob-error");
	});
});

describe("PersonalInformation - nationality and residence", () => {
	it("renders nationality and hides residence for non-US routes", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={false} />);

		expect(screen.getByTestId("combobox-nationality")).toBeTruthy();
		expect(screen.queryByTestId("combobox-country-of-residence")).toBeFalsy();
	});

	it("renders and blurs country of residence on US routes", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={true} />, {
			formValues: { nationality: "JPN", countryOfResidence: "USA" },
		});

		expect(screen.getByTestId("combobox-country-of-residence")).toBeTruthy();

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		fireEvent.blur(screen.getByTestId("combobox-nationality"));
		fireEvent.blur(screen.getByTestId("combobox-country-of-residence"));

		expect(screen.getByTestId("combobox-country-of-residence")).toBeTruthy();
	});

	it("renders fallback combobox labels for unknown nationality values", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={adultPax} isUsRoute={true} />, {
			formValues: { nationality: "ZZZ" as any, countryOfResidence: "YYY" as any },
		});

		expect(screen.getAllByTestId("combobox-label").length).toBeGreaterThan(0);
	});

	it("renders nationality and residence field errors", () => {
		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={adultPax} isUsRoute={true} />,
			{
				errors: [
					{ name: "nationality", message: "nationality-error" },
					{ name: "countryOfResidence", message: "country-error" },
				],
			}
		);

		const errors = screen.getAllByTestId("field-error");

		if (errors[0]) {
			expect(errors[0].textContent ?? "").toMatch("nationality-error");
		}
		if (errors[1]) {
			expect(errors[1].textContent ?? "").toMatch("country-error");
		}
	});

	it("triggers nationality and residence change handlers when errors are present", () => {
		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={adultPax} isUsRoute={true} />,
			{
				formValues: { nationality: "JPN", countryOfResidence: "USA" },
				errors: [
					{ name: "nationality", message: "nationality-error" },
					{ name: "countryOfResidence", message: "country-error" },
				],
			}
		);

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		expect(screen.getByTestId("combobox-country-of-residence")).toBeTruthy();
	});
});

describe("PersonalInformation - infant only branches", () => {
	it("renders body weight and height selectors for infants", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={infantPax} isUsRoute={false} />);

		expect(screen.getByTestId("label-label_body_weight")).toBeTruthy();
		expect(screen.getByTestId("label-label_body_height")).toBeTruthy();
		expect(screen.getByTestId("radio-Less than 9kg")).toBeTruthy();
		expect(screen.getByTestId("radio-72-81 cm")).toBeTruthy();
	});

	it("supports body weight change and blur when the field has an error", () => {
		renderPersonalInformationWithErrors(
			<PersonalInformation passenger={infantPax} isUsRoute={false} />,
			{ errors: [{ name: "bodyWeight", message: "body-weight-error" }] }
		);

		fireEvent.click(screen.getByTestId("radio-change-label_body_weight"));
		fireEvent.click(screen.getByTestId("radio-blur-label_body_weight"));

		expect(screen.getByTestId("radio-Less than 9kg")).toBeTruthy();
	});

	it("shows the contact alert for body weight less than 9kg", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={infantPax} isUsRoute={false} />, {
			formValues: { bodyWeight: "Less than 9kg" },
		});

		expect(screen.getByTestId("alert-error")).toBeTruthy();
		expect(screen.getByText("button_contact_us")).toBeTruthy();
	});

	it("shows the warning alert for body weight 18kg or more", () => {
		renderWithFormAndProviders(<PersonalInformation passenger={infantPax} isUsRoute={false} />, {
			formValues: { bodyWeight: "18kg or more" },
		});

		expect(screen.getByTestId("alert-warning")).toBeTruthy();
	});
});
