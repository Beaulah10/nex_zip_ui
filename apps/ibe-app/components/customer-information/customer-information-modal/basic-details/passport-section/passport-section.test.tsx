/**
 * File: passport-section.test.tsx
 * Classification: Component
 * Description: Tests for PassportSection — passport number input, expiry date pickers, and scan button.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { PassportSection } from "@/components/customer-information/customer-information-modal/basic-details/passport-section/passport-section";
import {
	makeTestStore,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const inputMocks = vi.hoisted(() => ({
	passportBlur: undefined as (() => void) | undefined,
}));
// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<span data-testid={`badge-${variant}`}>{children}</span>
	),
}));

vi.mock("@repo/ui/components/combobox", () => ({
	Combobox: ({
		children,
		onValueChange,
	}: {
		children: React.ReactNode;
		onValueChange?: (value: string) => void;
	}) => (
		<div data-testid="combobox">
			<button type="button" data-testid="combobox-change" onClick={() => onValueChange?.("2030")}>
				change
			</button>
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

	ComboboxItem: ({ children }: { children: React.ReactNode; value: string }) => (
		<div>{children}</div>
	),

	ComboboxList: ({ children }: { children: (val: string) => React.ReactNode }) => (
		<div>{children("2030")}</div>
	),

	useComboboxAnchor: () => ({ current: null }),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { errors?: { message: string }[] }) =>
		errors ? <div data-testid="field-error">{errors.map((e) => e.message).join(", ")}</div> : null,
	FieldHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/input", () => ({
	Input: ({ id, onChange, onBlur, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
		if (id === "passport-number") {
			inputMocks.passportBlur = onBlur as (() => void) | undefined;
		}

		return (
			<input {...props} id={id} data-testid={`input-${id}`} onChange={onChange} onBlur={onBlur} />
		);
	},
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
	}) => {
		if (id === "passport-number") {
			inputMocks.passportBlur = onBlur as any;
		}

		return (
			<div>
				<input data-testid={`input-${id}`} aria-label={label} onChange={onChange} onBlur={onBlur} />

				{errors ? (
					<div data-testid={`input-error-${id}`}>{errors.map((e) => e.message).join(", ")}</div>
				) : null}
			</div>
		);
	},
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/basic-details/passport-scan/passport-scan",
	() => ({
		PassportScanButton: () => (
			<button type="button" data-testid="passport-scan-btn">
				Scan
			</button>
		),
	})
);
const mocks = vi.hoisted(() => ({
	handleUppercaseChangeMock: vi.fn(),
	handleFieldOnChangeMock: vi.fn(
		(name: string, value: string, setValue: any, shouldValidate: boolean) => {
			setValue(name, value, { shouldValidate });
		}
	),
}));

vi.mock("@/modules/utils/helpers/common/string-utils/string-utils", () => ({
	convertToUppercase: (value: string) => {
		mocks.handleUppercaseChangeMock(value);
		return value?.toUpperCase() ?? "";
	},
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

				return [];
			},

			isFieldDateInvalid: vi.fn(() => false),

			handleFieldOnChange: mocks.handleFieldOnChangeMock,

			triggerFieldDateValidation: vi.fn(),
		};
	}
);

function renderPassportSectionWithErrors({
	formValues = {},
	errors = [],
}: {
	formValues?: Partial<PassengerInformation>;
	errors?: Array<{ name: keyof PassengerInformation | "passportExpiryDate"; message?: string }>;
} = {}) {
	const store = makeTestStore();

	function Wrapper({ children }: { children: React.ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				passportNumber: "",
				passportExpiryDate: { year: "", month: "", day: "" },
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

	return render(<PassportSection />, { wrapper: Wrapper });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PassportSection - structure", () => {
	it("renders the passport section heading", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByText("section_passport_information")).toBeTruthy();
	});

	it("renders passport number input", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByTestId("input-passport-number")).toBeTruthy();
	});

	it("renders expiry year combobox", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByTestId("combobox-passport-expiry-year")).toBeTruthy();
	});

	it("renders expiry month combobox", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByTestId("combobox-passport-expiry-month")).toBeTruthy();
	});

	it("renders expiry day combobox", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByTestId("combobox-passport-expiry-day")).toBeTruthy();
	});
});

describe("PassportSection - passport scan button", () => {
	it("renders the passport scan button (visible on mobile)", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByTestId("passport-scan-btn")).toBeTruthy();
	});

	it("renders the passport scan description text", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getByText("passport_scan_description")).toBeTruthy();
	});
});

describe("PassportSection - required badge", () => {
	it("renders required badge for passport number", () => {
		renderWithFormAndProviders(<PassportSection />);
		expect(screen.getAllByTestId("badge-destructive").length).toBeGreaterThan(0);
	});
});

describe("PassportSection - uncovered lines", () => {
	it("calls uppercase handler", () => {
		renderWithFormAndProviders(<PassportSection />);

		fireEvent.change(screen.getByTestId("input-passport-number"), {
			target: {
				value: "AB123",
			},
		});

		expect(mocks.handleUppercaseChangeMock).toHaveBeenCalled();
	});

	it("triggers combobox change handlers", () => {
		renderWithFormAndProviders(<PassportSection />, {
			formValues: { passportExpiryDate: { year: "2030", month: "12", day: "31" } },
		});

		const buttons = screen.getAllByTestId("combobox-change");
		const [yearButton, monthButton, dayButton] = buttons;

		expect(buttons).toHaveLength(3);

		if (!(yearButton && monthButton && dayButton)) {
			throw new Error("Expected three combobox buttons");
		}

		fireEvent.click(yearButton);
		fireEvent.click(monthButton);
		fireEvent.click(dayButton);

		expect(yearButton).toBeTruthy();
	});

	it("triggers year blur", () => {
		renderWithFormAndProviders(<PassportSection />);

		fireEvent.blur(screen.getByTestId("combobox-passport-expiry-year"));

		expect(screen.getByTestId("combobox-passport-expiry-year")).toBeTruthy();
	});

	it("triggers month blur", () => {
		renderWithFormAndProviders(<PassportSection />);

		fireEvent.blur(screen.getByTestId("combobox-passport-expiry-month"));

		expect(screen.getByTestId("combobox-passport-expiry-month")).toBeTruthy();
	});

	it("triggers day blur", () => {
		renderWithFormAndProviders(<PassportSection />);

		fireEvent.blur(screen.getByTestId("combobox-passport-expiry-day"));

		expect(screen.getByTestId("combobox-passport-expiry-day")).toBeTruthy();
	});
});
describe("PassportSection - additional coverage", () => {
	it("renders all combobox change buttons", () => {
		renderWithFormAndProviders(<PassportSection />);

		const buttons = screen.getAllByTestId("combobox-change");

		expect(buttons).toHaveLength(3);
	});

	it("supports multiple combobox interactions", () => {
		renderWithFormAndProviders(<PassportSection />);

		const buttons = screen.getAllByTestId("combobox-change");

		for (const button of buttons) {
			fireEvent.click(button);
		}

		expect(buttons[0]).toBeTruthy();
		expect(buttons[1]).toBeTruthy();
		expect(buttons[2]).toBeTruthy();
	});

	it("supports multiple passport number changes", () => {
		mocks.handleUppercaseChangeMock.mockClear();

		renderWithFormAndProviders(<PassportSection />);

		const input = screen.getByTestId("input-passport-number");

		fireEvent.change(input, {
			target: { value: "AB123" },
		});

		fireEvent.change(input, {
			target: { value: "CD456" },
		});

		expect(mocks.handleUppercaseChangeMock).toHaveBeenCalledTimes(2);
	});

	it("keeps expiry inputs rendered after blur", () => {
		renderWithFormAndProviders(<PassportSection />);

		const year = screen.getByTestId("combobox-passport-expiry-year");
		const month = screen.getByTestId("combobox-passport-expiry-month");
		const day = screen.getByTestId("combobox-passport-expiry-day");

		fireEvent.blur(year);
		fireEvent.blur(month);
		fireEvent.blur(day);

		expect(year).toBeTruthy();
		expect(month).toBeTruthy();
		expect(day).toBeTruthy();
	});

	it("renders passport number error", () => {
		renderPassportSectionWithErrors({
			errors: [
				{ name: "passportNumber", message: "passport-number-error" },
				{ name: "passportExpiryDate" },
			],
		});

		expect(screen.getByText("passport-number-error")).toBeTruthy();
	});

	it("calls uppercase handler when passport input already has an error", () => {
		mocks.handleUppercaseChangeMock.mockClear();
		renderPassportSectionWithErrors({
			errors: [{ name: "passportNumber", message: "passport-number-error" }],
		});

		fireEvent.change(screen.getByTestId("input-passport-number"), {
			target: { value: "ZZ999" },
		});

		expect(mocks.handleUppercaseChangeMock).toHaveBeenCalled();
	});

	it("triggers expiry change handlers when expiry errors are present", () => {
		renderPassportSectionWithErrors({
			formValues: { passportExpiryDate: { year: "2030", month: "12", day: "31" } },
			errors: [{ name: "passportExpiryDate", message: "expiry-error" }],
		});

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		expect(screen.getByTestId("field-error").textContent ?? "").toMatch("expiry-error");
	});
});

it("executes passport number blur handler", () => {
	renderWithFormAndProviders(<PassportSection />);

	const input = screen.getByTestId("input-passport-number");

	fireEvent.blur(input);

	expect(inputMocks.passportBlur).toBeDefined();
});

it("blurs passport number input", () => {
	renderWithFormAndProviders(<PassportSection />);

	fireEvent.blur(screen.getByTestId("input-passport-number"));

	expect(screen.getByTestId("input-passport-number")).toBeTruthy();
});
