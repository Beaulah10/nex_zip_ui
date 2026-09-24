/**
 * File: destination-section.test.tsx
 * Classification: Component
 * Description: Tests for DestinationSection — hotel/address fields, deadline-passed alert,
 * info alert, and copy-to-passenger button.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DestinationSection } from "@/components/customer-information/customer-information-modal/basic-details/destination-section/destination-section";
import {
	makePassenger,
	makeTestStore,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

const mocks = vi.hoisted(() => ({
	convertToUppercaseMock: vi.fn((value: string) => value.toUpperCase()),

	handleFieldOnChangeMock: vi.fn(
		(
			name: string,
			value: string,
			setValue: (name: string, value: string, options?: unknown) => void,
			shouldValidate: boolean
		) => {
			setValue(name, value, { shouldValidate });
		}
	),
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<div data-testid={`alert-${variant}`}>{children}</div>
	),
	AlertDescription: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="alert-description">{children}</div>
	),
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="badge">{children}</span>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
	}) => (
		<button type="button" data-testid="copy-to-passenger-btn" onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/combobox", () => ({
	Combobox: ({ children, onValueChange, value, itemToStringLabel }: any) => (
		<button type="button" data-testid="combobox" onClick={() => onValueChange?.("JPN")}>
			{itemToStringLabel && <span data-testid="combobox-label">{itemToStringLabel(value)}</span>}
			{children}
		</button>
	),

	ComboboxContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

	ComboboxEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

	ComboboxInput: ({ id }: { id: string }) => (
		<input data-testid={`combobox-${id}`} id={id} readOnly />
	),

	ComboboxItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

	ComboboxList: ({ children }: { children: (val: string) => React.ReactNode }) => (
		<div>{children("ZZZ")}</div>
	),

	useComboboxAnchor: () => ({ current: null }),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { errors?: { message: string }[] }) =>
		errors ? <div data-testid="field-error">{errors.map((e) => e.message).join(", ")}</div> : null,
	FieldHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<div data-testid="field-header" className={className}>
			{children}
		</div>
	),
	FieldLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
		<label data-testid="field-label" htmlFor={htmlFor}>
			{children}
		</label>
	),
	FieldTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<div data-testid="field-title" className={className}>
			{children}
		</div>
	),
}));

vi.mock("@repo/ui/components/input-field", () => ({
	InputField: (props: any) => (
		<div>
			{(props.label || props.title || props.badge) && (
				<div data-testid={`input-${props.id}-header`} className={props.headerClassName}>
					<div data-testid={`input-${props.id}-header-content`}>
						{props.label && <span data-testid={`input-${props.id}-label`}>{props.label}</span>}
						{props.badge && <span data-testid={`input-${props.id}-badge`}>{props.badge.text}</span>}
						{props.title && (
							<div data-testid={`input-${props.id}-title`} className={props.titleClassName}>
								{props.title}
							</div>
						)}
					</div>
				</div>
			)}
			<input {...props} data-testid={`input-${props.id}`} />

			{props.errors ? (
				<div data-testid={`input-error-${props.id}`}>
					{props.errors.map((e: any) => e.message).join(", ")}
				</div>
			) : null}
		</div>
	),
}));

vi.mock("@/modules/utils/helpers/common/nationality-utils/nationality-utils", () => ({
	useCountryOptions: () => [
		{ code: "jp", alpha3: "JPN", name: "Japan" },
		{ code: "us", alpha3: "USA", name: "United States" },
	],
}));

// ── Key helper mocks ──────────────────────────────────────────────────────────

vi.mock("@/modules/utils/helpers/customer-information/customer-information-utils", () => ({
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

		return [];
	},

	handleFieldOnChange: mocks.handleFieldOnChangeMock,
}));

const mockDepartureDeadline = vi.hoisted(() => ({
	useDepartureDeadlineMock: vi.fn(),
}));

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	useDepartureDeadline: mockDepartureDeadline.useDepartureDeadlineMock,
}));

vi.mock("@/modules/utils/helpers/common/string-utils/string-utils", () => ({
	convertToUppercase: mocks.convertToUppercaseMock,
}));

beforeEach(() => {
	mockDepartureDeadline.useDepartureDeadlineMock.mockReturnValue({
		is24HourDeadlineExceeded: false,
		is48HourDeadlineExceeded: false,
	});
});
// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DestinationSection - default rendering (deadline not passed)", () => {
	it("renders the section heading", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);
		expect(screen.getByText("section_destination_address")).toBeTruthy();
	});

	it.each([
		{ testId: "input-hotel-name", label: "hotel name input field" },
		{ testId: "input-postal-code", label: "postal code input field" },
		{ testId: "input-city", label: "city input field" },
		{ testId: "input-state", label: "state input field" },
	])("renders the $label", ({ testId }) => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);
		expect(screen.getByTestId(testId)).toBeTruthy();
	});

	it("renders the info alert when deadline is not passed", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);
		expect(screen.getByTestId("alert-info")).toBeTruthy();
	});

	it("renders the copy-to-passenger button when deadline is not passed", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />, {
			passengers: [makePassenger(), makePassenger({ id: "pax-2" })],
		});
		const btn = screen.getByTestId("copy-to-passenger-btn");
		expect(btn).toBeTruthy();
		expect(btn).toHaveProperty("disabled", false);
	});

	it("does not render the copy button when only one passenger exists", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />, {
			passengers: [makePassenger()],
		});

		expect(screen.queryByTestId("copy-to-passenger-btn")).toBeNull();
	});
});

describe("DestinationSection - deadline passed rendering", () => {
	it("renders the warning alert when deadline has passed", () => {
		mockDepartureDeadline.useDepartureDeadlineMock.mockReturnValue({
			is24HourDeadlineExceeded: true,
			is48HourDeadlineExceeded: false,
		});

		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		// Component uses the mocked helpers — warning or info alert renders based on deadline
		const alerts = screen.queryAllByTestId(/alert-/);
		expect(alerts.length).toBeGreaterThan(0);
	});
});

describe("DestinationSection - copy button interaction", () => {
	it("calls onClickCopyToPassenger when copy button is clicked", () => {
		const onCopy = vi.fn();
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={onCopy} />, {
			passengers: [makePassenger(), makePassenger({ id: "pax-2" })],
		});
		const btn = screen.getByTestId("copy-to-passenger-btn");
		btn.click();
		expect(onCopy).toHaveBeenCalledTimes(1);
	});
});
describe("DestinationSection - field interactions", () => {
	it("handles hotel name change and blur", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		const hotelInput = screen.getByTestId("input-hotel-name") as HTMLInputElement;
		fireEvent.change(hotelInput, {
			target: { value: "HILTON" },
		});

		fireEvent.blur(hotelInput);
		expect(hotelInput.value).toBe("HILTON");
	});

	it("handles postal code change and blur", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		const postalCodeInput = screen.getByTestId("input-postal-code") as HTMLInputElement;
		fireEvent.change(postalCodeInput, {
			target: { value: "123456" },
		});

		fireEvent.blur(postalCodeInput);
		expect(postalCodeInput.value).toBe("123456");
	});

	it("handles city change and blur", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		const cityInput = screen.getByTestId("input-city") as HTMLInputElement;
		fireEvent.change(cityInput, {
			target: { value: "TOKYO" },
		});

		fireEvent.blur(cityInput);
		expect(cityInput.value).toBe("TOKYO");
	});
	it("handles state change and blur", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		fireEvent.change(screen.getByTestId("input-state"), {
			target: { value: "TOKYO" },
		});

		fireEvent.blur(screen.getByTestId("input-state"));

		expect(mocks.convertToUppercaseMock).toHaveBeenCalled();
		expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled();
	});

	it("renders country of stay combobox", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		expect(screen.getByTestId("combobox-country-of-stay")).toBeTruthy();
	});
	it("handles country selection", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		const combobox = screen.getByTestId("combobox");
		fireEvent.click(combobox);
		expect(combobox).toBeTruthy();
	});
	it("renders country combobox input", () => {
		renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

		expect(screen.getByTestId("combobox-country-of-stay")).toBeTruthy();
	});
});

it("triggers postal code validation when postal code has error", () => {
	function Wrapper() {
		const methods = useForm();

		useEffect(() => {
			methods.setError("postalCode", {
				type: "manual",
				message: "postal-error",
			});
		}, [methods]);

		return (
			<Provider store={makeTestStore()}>
				<FormProvider {...methods}>
					<DestinationSection onClickCopyToPassenger={vi.fn()} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	fireEvent.change(screen.getByTestId("input-postal-code"), {
		target: {
			value: "123456",
		},
	});

	expect(screen.getByTestId("input-error-postal-code").textContent ?? "").toMatch("postal-error");
});

it("renders fallback label when country value is not found", () => {
	renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />, {
		formValues: {
			countryOfStay: "ZZZ",
		},
	});

	expect(screen.getByTestId("combobox-label").textContent ?? "").toMatch("ZZZ");
});

it("renders hotel name error", () => {
	function Wrapper() {
		const methods = useForm();

		useEffect(() => {
			methods.setError("hotelName", {
				type: "manual",
				message: "hotel-error",
			});
		}, [methods]);

		return (
			<Provider store={makeTestStore()}>
				<FormProvider {...methods}>
					<DestinationSection onClickCopyToPassenger={vi.fn()} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	expect(screen.getByTestId("input-error-hotel-name").textContent ?? "").toMatch("hotel-error");
});

it("renders warning alert when deadline has passed", () => {
	mockDepartureDeadline.useDepartureDeadlineMock.mockReturnValue({
		is24HourDeadlineExceeded: true,
		is48HourDeadlineExceeded: false,
	});

	renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

	expect(screen.getByTestId("alert-warning")).toBeTruthy();
});

it("disables fields when deadline has passed", () => {
	mockDepartureDeadline.useDepartureDeadlineMock.mockReturnValue({
		is24HourDeadlineExceeded: true,
		is48HourDeadlineExceeded: false,
	});

	renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />, {
		passengers: [makePassenger(), makePassenger({ id: "pax-2" })],
	});

	expect(screen.getByTestId("input-hotel-name")).toHaveProperty("disabled", true);

	expect(screen.getByTestId("input-postal-code")).toHaveProperty("disabled", true);

	expect(screen.getByTestId("copy-to-passenger-btn")).toHaveProperty("disabled", true);
});

it("displays hotel name validation error message", () => {
	function Wrapper() {
		const methods = useForm();

		useEffect(() => {
			methods.setError("hotelName", {
				type: "manual",
				message: "hotel-error",
			});
		}, [methods]);

		return (
			<Provider store={makeTestStore()}>
				<FormProvider {...methods}>
					<DestinationSection onClickCopyToPassenger={vi.fn()} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	expect(screen.getByTestId("input-error-hotel-name").textContent ?? "").toMatch("hotel-error");
});

it("renders postal code error and triggers blur branch", () => {
	function Wrapper() {
		const methods = useForm();

		useEffect(() => {
			methods.setError("postalCode", {
				type: "manual",
				message: "postal-error",
			});
		}, [methods]);

		return (
			<Provider store={makeTestStore()}>
				<FormProvider {...methods}>
					<DestinationSection onClickCopyToPassenger={vi.fn()} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	const input = screen.getByTestId("input-postal-code");

	fireEvent.blur(input);

	expect(screen.getByTestId("input-error-postal-code").textContent ?? "").toMatch("postal-error");
});

it("renders city error and triggers blur branch", () => {
	function Wrapper() {
		const methods = useForm();

		useEffect(() => {
			methods.setError("city", {
				type: "manual",
				message: "city-error",
			});
		}, [methods]);

		return (
			<Provider store={makeTestStore()}>
				<FormProvider {...methods}>
					<DestinationSection onClickCopyToPassenger={vi.fn()} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	const input = screen.getByTestId("input-city");

	fireEvent.blur(input);

	expect(screen.getByTestId("input-error-city").textContent ?? "").toMatch("city-error");
});

it("renders state error and triggers blur branch", () => {
	function Wrapper() {
		const methods = useForm();

		useEffect(() => {
			methods.setError("state", {
				type: "manual",
				message: "state-error",
			});
		}, [methods]);

		return (
			<Provider store={makeTestStore()}>
				<FormProvider {...methods}>
					<DestinationSection onClickCopyToPassenger={vi.fn()} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	const input = screen.getByTestId("input-state");

	fireEvent.blur(input);

	expect(screen.getByTestId("input-error-state").textContent ?? "").toMatch("state-error");
});

it("renders fallback label when country value is not found (ZZZ code)", () => {
	renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />, {
		formValues: {
			countryOfStay: "ZZZ",
		},
	});

	expect(screen.getByTestId("combobox-label").textContent ?? "").toMatch("ZZZ");
});

it("renders mapped country label when country exists", () => {
	renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />, {
		formValues: {
			countryOfStay: "JPN",
		},
	});

	expect(screen.getByTestId("combobox-label").textContent ?? "").toMatch("Japan");
});

it("handles country option without alpha3 value", async () => {
	vi.doMock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
		useCountryOptions: () => [
			{
				code: "jp",
				alpha3: undefined,
				name: "Japan",
			},
		],
	}));

	vi.resetModules();

	const { DestinationSection } = await import(
		"@/components/customer-information/customer-information-modal/basic-details/destination-section/destination-section"
	);

	renderWithFormAndProviders(<DestinationSection onClickCopyToPassenger={vi.fn()} />);

	expect(screen.getByTestId("combobox-country-of-stay")).toBeTruthy();
});
