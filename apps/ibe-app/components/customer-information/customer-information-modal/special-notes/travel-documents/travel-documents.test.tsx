/**
 * File: travel-documents.test.tsx
 * Classification: Component
 * Description: Tests for TravelDocumentsSection component.
 * Verifies all sub-sections are always rendered.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { TravelDocumentsSection } from "@/components/customer-information/customer-information-modal/special-notes/travel-documents/travel-documents";
import {
	TRAVEL_DOCUMENT_CLEAR_ERRORS_FIELDS,
	TRAVEL_DOCUMENT_EVUS_CLEAR_ERRORS_FIELDS,
	TRAVEL_DOCUMENT_KNOWN_TRAVELER_NUMBER_FIELDS,
	TRAVEL_DOCUMENT_REDRESS_NUMBER_FIELDS,
} from "@/modules/utils/constants/customer-information/constants";
import {
	makeTestStore,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

const mocks = vi.hoisted(() => ({
	handleUppercaseChangeMock: vi.fn(),
	handleFieldOnChangeMock: vi.fn(
		(name: string, value: string, setValue: any, shouldValidate: boolean) => {
			setValue(name, value, { shouldValidate });
		}
	),
	clearErrorsMock: vi.fn(),
	routeState: {
		isUSRoute: true,
		isAnyUSRoute: true,
		isUSDeparture: false,
		is24HourDeadlineExceeded: false,
	},
	hasFlightSelection: true,
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => "en",
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: ReactNode; variant?: string }) => (
		<div data-testid={`alert-${variant ?? "default"}`}>{children}</div>
	),
	AlertDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: ReactNode }) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@repo/ui/components/combobox", () => ({
	Combobox: ({
		children,
		onValueChange,
		value,
		itemToStringLabel,
	}: {
		children: ReactNode;
		onValueChange?: (value: string) => void;
		value?: string;
		itemToStringLabel?: (value: unknown) => string;
		items?: string[];
		disabled?: boolean;
	}) => (
		<div data-testid="combobox">
			<button type="button" data-testid="combobox-change" onClick={() => onValueChange?.("visa")}>
				change
			</button>
			{itemToStringLabel ? (
				<span data-testid="combobox-label">{itemToStringLabel(value ?? "")}</span>
			) : null}
			{children}
		</div>
	),
	ComboboxContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ComboboxInput: ({
		id,
		"aria-label": ariaLabel,
		onBlur,
	}: {
		id?: string;
		"aria-label"?: string;
		onBlur?: () => void;
		placeholder?: string;
		"aria-invalid"?: boolean;
		"aria-describedby"?: string;
	}) => (
		<input
			data-testid={id ? `combobox-${id}` : "combobox-input"}
			aria-label={ariaLabel}
			onBlur={onBlur}
		/>
	),
	ComboboxItem: ({ children }: { children: ReactNode; value?: string }) => <div>{children}</div>,
	ComboboxList: ({ children }: { children: (val: string) => ReactNode }) => (
		<div>{children("visa")}</div>
	),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { id?: string; errors?: { message: string }[] }) =>
		errors ? <div data-testid="field-error">{errors.map((e) => e.message).join(", ")}</div> : null,
	FieldHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FieldLabel: ({ children }: { children: ReactNode; htmlFor?: string; id?: string }) => (
		<span data-testid="field-label">{children}</span>
	),
	FieldTitle: ({ children }: { children: ReactNode }) => <span>{children}</span>,
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
		children: (value: string) => ReactNode;
		onValueChange?: (value: string) => void;
		value?: string;
		itemToStringLabel?: (value: unknown) => string;
		inputId?: string;
		inputAriaLabel?: string;
		inputOnBlur?: () => void;
	}) => (
		<div data-testid="combobox">
			<button type="button" data-testid="combobox-change" onClick={() => onValueChange?.("visa")}>
				change
			</button>
			{itemToStringLabel ? (
				<span data-testid="combobox-label">{itemToStringLabel(value ?? "")}</span>
			) : null}
			<input
				data-testid={inputId ? `combobox-${inputId}` : "combobox-input"}
				aria-label={inputAriaLabel}
				onBlur={inputOnBlur}
			/>
			<div>{children("visa")}</div>
		</div>
	),

	FieldCheckboxField: ({
		checked,
		onCheckedChange,
		id,
		title,
	}: {
		checked: boolean;
		onCheckedChange: (v: boolean) => void;
		id: string;
		name?: string;
		title?: string;
		disabled?: boolean;
		"aria-invalid"?: boolean;
	}) => (
		<input
			type="checkbox"
			data-testid={`check-${id}`}
			checked={!!checked}
			onChange={(e) => onCheckedChange(e.target.checked)}
			aria-label={title}
		/>
	),
}));

vi.mock("@repo/ui/components/input-field", () => ({
	InputField: ({ id, label, onChange, onBlur, errors, ...props }: any) => (
		<div>
			<input
				data-testid={`input-${id}`}
				aria-label={label}
				onChange={onChange}
				onBlur={onBlur}
				{...props}
			/>
			{errors ? (
				<div data-testid={`input-error-${id}`}>{errors.map((e: any) => e.message).join(", ")}</div>
			) : null}
		</div>
	),
}));

vi.mock("@repo/ui/components/input", () => ({
	Input: ({ id, onChange, onBlur, ...props }: any) => (
		<input data-testid={`input-${id}`} onChange={onChange} onBlur={onBlur} {...props} />
	),
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: ReactNode }) => (
		<div data-testid="travel-docs-wrapper">{children}</div>
	),
}));

vi.mock("@/modules/utils/helpers/common/nationality-utils/nationality-utils", () => ({
	useCountryOptions: () => [
		{ code: "jp", alpha3: "JPN", name: "Japan" },
		{ code: "us", alpha3: "USA", name: "United States" },
	],
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
			getFlightDepartureDateTime: () => "2030-01-01T00:00:00+09:00",

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
						message: "error_document_expiry_date",
					},
				];
			},

			isFieldDateInvalid: vi.fn(() => false),

			getRoutesFromFlightSelection: () => {
				if (mocks.routeState.isUSDeparture) {
					return [{ origin: "HNL", destination: "SFO" }];
				}

				if (mocks.routeState.isAnyUSRoute) {
					return [{ origin: "NRT", destination: "SFO" }];
				}

				return [{ origin: "NRT", destination: "BKK" }];
			},

			handleFieldOnChange: mocks.handleFieldOnChangeMock,

			triggerFieldDateValidation: vi.fn(),
		};
	}
);

vi.mock("@/modules/utils/helpers/common/string-utils/string-utils", () => ({
	convertToUppercase: (value: string) => {
		mocks.handleUppercaseChangeMock(value);
		return value?.toUpperCase() ?? "";
	},
}));

vi.mock(
	"@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils",
	() => ({
		getFlightSegments: () => [],
		getDocumentTypeOptions: () => [
			{ value: "visa", label: "document_type_visa" },
			{ value: "permanent-residence", label: "document_type_permanent_residence" },
		],
	})
);

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	useDepartureDeadline: () => ({
		is24HourDeadlineExceeded: mocks.routeState.is24HourDeadlineExceeded,
		is48HourDeadlineExceeded: false,
	}),
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: (selector: (state: any) => unknown) =>
		selector({
			flightSelection: {
				request: mocks.hasFlightSelection
					? {
							routes: "NRT,SFO",
						}
					: undefined,
			},
		}),
}));

function renderTravelDocumentsWithErrors({
	formValues = {},
	errors = [],
}: {
	formValues?: Partial<PassengerInformation>;
	errors?: Array<{ name: keyof PassengerInformation | "documentExpiryDate"; message?: string }>;
} = {}) {
	const store = makeTestStore();

	function Wrapper({ children }: { children: ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				hasTravelDocs: false,
				documentType: undefined,
				documentNumber: "",
				documentExpiryDate: { year: "", month: "", day: "" },
				issuingCountry: "",
				purposeOfTravel: "",
				evusObtained: false,
				nationality: "",
				redressNumber: "",
				knownTravelerNumber: "",
				...formValues,
			},
		});

		vi.spyOn(methods, "clearErrors").mockImplementation(mocks.clearErrorsMock);

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

	return render(<TravelDocumentsSection />, { wrapper: Wrapper });
}

describe("TravelDocumentsSection - route branches", () => {
	it("renders default content with redress input only", () => {
		mocks.clearErrorsMock.mockClear();
		mocks.routeState.is24HourDeadlineExceeded = false;
		mocks.routeState.isAnyUSRoute = true;
		mocks.routeState.isUSDeparture = false;

		renderTravelDocumentsWithErrors();

		expect(screen.getByText("section_other_travel_documents")).toBeTruthy();
		expect((screen.getByTestId("check-travel-docs") as HTMLInputElement).checked).toBe(false);
		expect(screen.queryByTestId("travel-docs-wrapper")).toBeFalsy();
		expect(screen.getByTestId("input-redress-number")).toBeTruthy();
		expect(screen.queryByTestId("input-known-traveler-number")).toBeFalsy();
		expect(mocks.clearErrorsMock).toHaveBeenCalledWith(TRAVEL_DOCUMENT_CLEAR_ERRORS_FIELDS);
	});

	it("renders deadline warning and known traveler input when applicable", () => {
		mocks.routeState.is24HourDeadlineExceeded = true;
		mocks.routeState.isAnyUSRoute = false;
		mocks.routeState.isUSDeparture = true;

		renderWithFormAndProviders(<TravelDocumentsSection />);

		expect(screen.getByTestId("alert-warning")).toBeTruthy();
		expect(screen.getByTestId("input-known-traveler-number")).toBeTruthy();
		expect(screen.getByTestId("input-redress-number")).toBeTruthy();

		mocks.routeState.is24HourDeadlineExceeded = false;
		mocks.routeState.isAnyUSRoute = true;
		mocks.routeState.isUSDeparture = false;
	});

	it("renders no route-specific input when neither branch is active", () => {
		mocks.clearErrorsMock.mockClear();
		mocks.routeState.isAnyUSRoute = false;
		mocks.routeState.isUSDeparture = false;

		renderTravelDocumentsWithErrors();

		expect(screen.queryByTestId("input-redress-number")).toBeFalsy();
		expect(screen.queryByTestId("input-known-traveler-number")).toBeFalsy();
		expect(mocks.clearErrorsMock).toHaveBeenCalledWith(TRAVEL_DOCUMENT_REDRESS_NUMBER_FIELDS);
		expect(mocks.clearErrorsMock).toHaveBeenCalledWith(
			TRAVEL_DOCUMENT_KNOWN_TRAVELER_NUMBER_FIELDS
		);

		mocks.routeState.isAnyUSRoute = true;
	});

	it("expands the travel document form when the checkbox is toggled", () => {
		renderWithFormAndProviders(<TravelDocumentsSection />);

		fireEvent.click(screen.getByTestId("check-travel-docs"));

		expect(screen.getByTestId("travel-docs-wrapper")).toBeTruthy();
	});
});

describe("TravelDocumentsSection - expanded form and errors", () => {
	it("renders expanded fields and drives handlers", () => {
		mocks.handleUppercaseChangeMock.mockClear();

		renderWithFormAndProviders(<TravelDocumentsSection />, {
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				documentExpiryDate: { year: "2030", month: "12", day: "31" },
				issuingCountry: "JPN",
				purposeOfTravel: "b1-b2-tourism" as any,
			},
		});

		expect(screen.getByTestId("travel-docs-wrapper")).toBeTruthy();
		expect(screen.getByText("label_purpose_of_travel")).toBeTruthy();

		fireEvent.change(screen.getByTestId("input-doc-number"), { target: { value: "ab123" } });

		expect(mocks.handleUppercaseChangeMock).toHaveBeenCalled();

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		fireEvent.blur(screen.getByTestId("combobox-document-type"));
		fireEvent.blur(screen.getByTestId("combobox-document-expiry-day"));
		fireEvent.blur(screen.getByTestId("combobox-document-expiry-month"));
		fireEvent.blur(screen.getByTestId("combobox-document-expiry-year"));
		fireEvent.blur(screen.getByTestId("combobox-issuing-country"));
		fireEvent.blur(screen.getByTestId("combobox-purpose-of-travel"));
		fireEvent.blur(screen.getByTestId("input-doc-number"));

		expect(screen.getByTestId("input-doc-number")).toBeTruthy();
	});

	it("re-triggers document type validation when an error exists and the combobox changes", () => {
		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				documentType: undefined,
			},
			errors: [{ name: "documentType", message: "document-type-error" }],
		});

		const documentTypeChangeButton = screen.getAllByTestId("combobox-change").at(0);

		if (!documentTypeChangeButton) {
			throw new Error("Missing document type combobox change button");
		}

		fireEvent.click(documentTypeChangeButton);

		expect(screen.getByTestId("field-error").textContent ?? "").toMatch("document-type-error");
	});

	it("renders document and field errors including expiry fallback", () => {
		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				nationality: "CHN",
				purposeOfTravel: "b1-b2-tourism",
			},
			errors: [
				{ name: "documentNumber", message: "document-number-error" },
				{ name: "documentType", message: "document-type-error" },
				{ name: "documentExpiryDate" },
				{ name: "issuingCountry", message: "issuing-country-error" },
				{ name: "purposeOfTravel", message: "purpose-of-travel-error" },
				{ name: "evusObtained", message: "evus-error" },
			],
		});

		expect(screen.getByText("document-number-error")).toBeTruthy();

		expect(screen.getByText("document-type-error")).toBeTruthy();
		expect(screen.getByText("error_document_expiry_date")).toBeTruthy();
		expect(screen.getByText("issuing-country-error")).toBeTruthy();
		expect(screen.getByText("purpose-of-travel-error")).toBeTruthy();
		expect(screen.getByText("evus-error")).toBeTruthy();
	});

	it("shows EVUS when the nationality and purpose conditions match", () => {
		renderWithFormAndProviders(<TravelDocumentsSection />, {
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				nationality: "CHN",
				purposeOfTravel: "b1-b2-tourism",
			},
		});

		expect(screen.getByTestId("check-evus-obtained")).toBeTruthy();
		expect(screen.getByText(/evus_warning_1_link/)).toBeTruthy();
	});

	it("renders combobox label mapping and fallback values", () => {
		renderWithFormAndProviders(<TravelDocumentsSection />, {
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				issuingCountry: "ZZZ" as any,
				purposeOfTravel: "b1-b2-tourism",
			},
		});

		expect(screen.getAllByTestId("combobox-label").length).toBeGreaterThan(0);
	});

	it("renders route-input and EVUS errors and exercises the EVUS link", () => {
		const scrollIntoViewMock = vi.fn();

		Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
			configurable: true,
			value: scrollIntoViewMock,
		});

		mocks.routeState.isAnyUSRoute = true;
		mocks.routeState.isUSDeparture = true;

		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				documentExpiryDate: { year: "2030", month: "12", day: "31" },
				issuingCountry: "JPN",
				nationality: "CHN",
				purposeOfTravel: "b1-b2-tourism",
			},
			errors: [
				{ name: "redressNumber", message: "redress-error" },
				{ name: "knownTravelerNumber", message: "known-traveler-error" },
				{ name: "evusObtained", message: "evus-error" },
			],
		});

		fireEvent.change(screen.getByTestId("input-redress-number"), { target: { value: "R1" } });
		fireEvent.blur(screen.getByTestId("input-redress-number"));

		fireEvent.change(screen.getByTestId("input-known-traveler-number"), {
			target: { value: "K1" },
		});
		fireEvent.blur(screen.getByTestId("input-known-traveler-number"));

		fireEvent.click(screen.getByTestId("check-evus-obtained"));
		fireEvent.click(screen.getByText(/evus_warning_1_link/));

		expect(scrollIntoViewMock).toHaveBeenCalled();
		expect(screen.getByText("evus-error")).toBeTruthy();

		mocks.routeState.isUSDeparture = false;
	});

	it("triggers issuing-country and purpose handlers when those fields have errors", () => {
		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				issuingCountry: "JPN",
				purposeOfTravel: "b1-b2-tourism",
			},
			errors: [
				{ name: "issuingCountry", message: "issuing-country-error" },
				{ name: "purposeOfTravel", message: "purpose-of-travel-error" },
			],
		});

		for (const button of screen.getAllByTestId("combobox-change")) {
			fireEvent.click(button);
		}

		expect(screen.getAllByTestId("field-error").length).toBeGreaterThan(0);
	});

	it("re-triggers issuing country validation when an error exists and the combobox changes", async () => {
		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				issuingCountry: "JPN",
			},
			errors: [{ name: "issuingCountry", message: "issuing-country-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("issuing-country-error")).toBeTruthy();
		});

		const issuingCountryChangeButton = screen.getAllByTestId("combobox-change").at(4);

		if (!issuingCountryChangeButton) {
			throw new Error("Missing issuing country combobox change button");
		}

		fireEvent.click(issuingCountryChangeButton);

		expect(screen.getByTestId("field-error").textContent ?? "").toMatch("issuing-country-error");
	});

	it("re-triggers purpose of travel validation when an error exists and the combobox changes", async () => {
		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				purposeOfTravel: "b1-b2-tourism" as any,
			},
			errors: [{ name: "purposeOfTravel", message: "purpose-of-travel-error" }],
		});

		await waitFor(() => {
			expect(screen.getByText("purpose-of-travel-error")).toBeTruthy();
		});

		const purposeOfTravelChangeButton = screen.getAllByTestId("combobox-change").at(5);

		if (!purposeOfTravelChangeButton) {
			throw new Error("Missing purpose of travel combobox change button");
		}

		fireEvent.click(purposeOfTravelChangeButton);

		expect(screen.getByTestId("field-error").textContent ?? "").toMatch("purpose-of-travel-error");
	});

	it("handles the no-flight-selection branch", () => {
		mocks.hasFlightSelection = false;

		renderTravelDocumentsWithErrors();

		expect(screen.queryByTestId("input-redress-number")).toBeFalsy();
		expect(screen.queryByTestId("input-known-traveler-number")).toBeFalsy();

		mocks.hasFlightSelection = true;
	});

	it("does not render EVUS or purpose-of-travel for non-visa documents", () => {
		renderWithFormAndProviders(<TravelDocumentsSection />, {
			formValues: {
				hasTravelDocs: true,
				documentType: "permanent-residence" as any,
				nationality: "CHN",
			},
		});

		expect(screen.queryByTestId("check-evus-obtained")).toBeFalsy();
		expect(screen.queryByText("label_purpose_of_travel")).toBeFalsy();
	});

	it("clears EVUS when the purpose of travel does not require it", () => {
		mocks.clearErrorsMock.mockClear();

		renderTravelDocumentsWithErrors({
			formValues: {
				hasTravelDocs: true,
				documentType: "visa" as any,
				nationality: "CHN",
				purposeOfTravel: "other-purpose" as any,
			},
		});

		expect(mocks.clearErrorsMock).toHaveBeenCalledWith(TRAVEL_DOCUMENT_EVUS_CLEAR_ERRORS_FIELDS);
	});
});
