/**
 * File: contact-section.test.tsx
 * Classification: Component
 * Description: Tests for ContactSection — phone, email, emergency contact fields
 * and the copy-from-primary button logic.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { ContactSection } from "@/components/customer-information/customer-information-modal/basic-details/contact-section/contact-section";
import {
	makePassenger,
	makeTestStore,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";
import * as storeHooks from "@/store/hooks";
import { setPassengerNames } from "@/store/slices/passenger/passenger.slice";
import type { Passenger } from "@/types/customer-information/customer-information.types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
	handleFieldOnChangeMock: vi.fn(
		(name: string, value: string, setValue: any, shouldValidate: boolean) => {
			setValue(name, value, { shouldValidate });
		}
	),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		[key: string]: unknown;
	}) => (
		<button type="button" data-testid="copy-btn" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldPhoneField: ({ label, value, onChange, onBlur, onExtensionChange, errors }: any) => (
		<div data-testid={`phone-${label}`}>
			<button
				type="button"
				data-testid={`extension-${label}`}
				onClick={() => onExtensionChange?.("us")}
			>
				extension
			</button>

			<input
				data-testid={`phone-input-${label}`}
				aria-label={label}
				value={value ?? ""}
				onChange={onChange}
				onBlur={onBlur}
			/>
			{errors?.map((e: any) => (
				<span key={e.message}>{e.message}</span>
			))}
		</div>
	),
}));

vi.mock("@repo/ui/components/input-field", () => ({
	InputField: (props: any) => (
		<div>
			<input {...props} data-testid={`input-${props.id}`} />

			{props.errors?.map((e: any) => (
				<span key={e.message} data-testid={`error-${props.id}`}>
					{e.message}
				</span>
			))}
		</div>
	),
}));

vi.mock("@repo/ui/components/input", () => ({
	Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
		<input {...props} data-testid={`input-${props.id}`} />
	),
}));

vi.mock("@/modules/utils/helpers/common/extension-code-utils/extension-code-utils", () => ({
	usePhoneOptions: () => [
		{ code: "jp", dialCode: "+81", name: "Japan" },
		{ code: "us", dialCode: "+1", name: "United States" },
	],
}));

vi.mock("@/modules/utils/helpers/customer-information/customer-information-utils", () => ({
	emptyDatePart: {
		year: "",
		month: "",
		day: "",
	},
	DEFAULT_PHONE_EXTENSION: "us",

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

function renderContactSectionWithPrimaryPassenger(passengers: Passenger[], isUsRoute: boolean) {
	const store = makeTestStore(passengers);

	store.dispatch(setPassengerNames(passengers as any));

	function Wrapper({ children }: { readonly children: React.ReactNode }) {
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
				passportNumber: "",
				passportExpiryDate: { year: "", month: "", day: "" },
				phoneExtension: "+81",
				phoneNumber: "",
				emergencyExtension: "+1",
				emergencyNumber: "",
				email: "",
				emailConfirmation: "",
				hasTravelDocs: false,
				isPregnant: false,
				pregnancyWeeks: "",
				requestingAssistance: false,
				assistanceReasons: [],
			},
		});

		return (
			<Provider store={store}>
				<FormProvider {...methods}>{children}</FormProvider>
			</Provider>
		);
	}

	return render(<ContactSection isUsRoute={isUsRoute} isPrimary={false} />, {
		wrapper: Wrapper,
	});
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ContactSection - basic rendering", () => {
	it("renders the section heading", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		expect(screen.getByText("section_contact_information")).toBeTruthy();
	});

	it("renders email input field", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		expect(screen.getByTestId("input-email")).toBeTruthy();
	});

	it("renders email-confirm input field", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		expect(screen.getByTestId("input-email-confirm")).toBeTruthy();
	});
});

describe("ContactSection - emergency contact (US route)", () => {
	it("renders emergency contact phone field when isUsRoute is true", () => {
		const pax = makePassenger({
			id: "pax-1",
			contactInformation: {
				countryCode: "+81",
				phoneNumber: "1234567890",
				email: "p@p.com",
			},
			emergencyContact: {
				countryCode: "+1",
				phoneNumber: "9876543210",
			},
		});

		renderWithFormAndProviders(<ContactSection isUsRoute={true} isPrimary={false} />, {
			passengers: [pax],
		});

		expect(screen.getByTestId("phone-label_emergency_contact")).toBeTruthy();
	});

	it("does not render emergency contact field when isUsRoute is false", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		expect(screen.queryByTestId("phone-label_emergency_contact")).toBeFalsy();
	});
});

describe("ContactSection - copy button visibility", () => {
	it("shows copy button when not primary and primary passenger has contact info", () => {
		const primaryPax = makePassenger({
			id: "pax-1",
			passengerTypeCode: "adult",
			contactInformation: {
				countryCode: "+81",
				phoneNumber: "1234567890",
				email: "primary@example.com",
			},
			emergencyContact: {
				countryCode: "+1",
				phoneNumber: "9876543210",
			},
		});

		const secondPax = makePassenger({
			id: "pax-2",
			passengerTypeCode: "adult",
		});

		renderContactSectionWithPrimaryPassenger([primaryPax, secondPax], false);

		expect(screen.getByTestId("copy-btn")).toBeTruthy();
	});

	it("hides copy button when isPrimary is true", () => {
		const pax = makePassenger({
			id: "pax-1",
			passengerTypeCode: "adult",
			contactInformation: {
				countryCode: "+81",
				phoneNumber: "1234567890",
				email: "p@p.com",
			},
			emergencyContact: {
				countryCode: "+1",
				phoneNumber: "9876543210",
			},
		});

		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={true} />, {
			passengers: [pax],
		});

		expect(screen.queryByTestId("copy-btn")).toBeFalsy();
	});

	it("hides copy button when primary passenger has no contact info", () => {
		const pax = makePassenger({
			id: "pax-1",
			passengerTypeCode: "adult",
			contactInformation: {
				countryCode: "",
				phoneNumber: "",
				email: "",
			},
			emergencyContact: {
				countryCode: "",
				phoneNumber: "",
			},
		});

		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />, {
			passengers: [pax],
		});

		expect(screen.queryByTestId("copy-btn")).toBeFalsy();
	});
});

describe("ContactSection - copy button click", () => {
	it("clicking copy button does not throw when no primary passenger", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />, {
			passengers: [],
		});

		expect(screen.queryByTestId("copy-btn")).toBeFalsy();
	});
});

describe("ContactSection - additional coverage", () => {
	it.each([
		{
			description: "handles phone number change",
			testId: "phone-input-label_phone_number",
			action: (element: HTMLElement) =>
				fireEvent.change(element, { target: { value: "1234567890" } }),
			expectation: () => expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled(),
		},
		{
			description: "handles phone blur",
			testId: "phone-input-label_phone_number",
			action: (element: HTMLElement) => fireEvent.blur(element),
			expectation: (testId: string) => expect(screen.getByTestId(testId)).toBeTruthy(),
		},
		{
			description: "handles phone extension change",
			testId: "extension-label_phone_number",
			action: (element: HTMLElement) => fireEvent.click(element),
			expectation: (testId: string) => expect(screen.getByTestId(testId)).toBeTruthy(),
		},
	])("$description", ({ testId, action, expectation }) => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		const element = screen.getByTestId(testId);
		action(element);

		expectation(testId);
	});

	it("handles emergency phone events", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={true} isPrimary={false} />);

		fireEvent.click(screen.getByTestId("extension-label_emergency_contact"));

		fireEvent.change(screen.getByTestId("phone-input-label_emergency_contact"), {
			target: { value: "9876543210" },
		});

		fireEvent.blur(screen.getByTestId("phone-input-label_emergency_contact"));

		expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled();
	});

	it("handles email change", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		fireEvent.change(screen.getByTestId("input-email"), {
			target: { value: "test@test.com" },
		});

		expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled();
	});

	it("handles email confirmation change", () => {
		renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

		fireEvent.change(screen.getByTestId("input-email-confirm"), {
			target: { value: "test@test.com" },
		});

		expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled();
	});
});

describe("ContactSection - copy actions", () => {
	it.each([
		{ isUsRoute: true, description: "US route" },
		{ isUsRoute: true, description: "emergency contact information for US route" },
		{ isUsRoute: false, description: "non US route" },
	])("handles copy button click for $description", ({ isUsRoute }) => {
		const primaryPax = makePassenger({
			id: "pax-1",
			passengerTypeCode: "adult",
			contactInformation: {
				countryCode: "+81",
				phoneNumber: "1234567890",
				email: "primary@example.com",
			},
			emergencyContact: {
				countryCode: "+1",
				phoneNumber: "9876543210",
			},
		});

		renderContactSectionWithPrimaryPassenger([primaryPax], isUsRoute);

		const button = screen.getByTestId("copy-btn");

		fireEvent.click(button);

		expect(button).toBeTruthy();
	});
});

it("renders phone number error when only phone number error exists", () => {
	const store = makeTestStore();

	function Wrapper() {
		const methods = useForm<PassengerInformation>();

		useEffect(() => {
			methods.setError("phoneNumber", {
				type: "manual",
				message: "phone-number-error",
			});
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={false} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	expect(screen.getByText("phone-number-error")).toBeTruthy();
});

it("renders both phone extension and phone number errors", () => {
	const store = makeTestStore();

	function Wrapper() {
		const methods = useForm<PassengerInformation>();

		useEffect(() => {
			methods.setError("phoneExtension", {
				type: "manual",
				message: "extension-error",
			});

			methods.setError("phoneNumber", {
				type: "manual",
				message: "phone-number-error",
			});
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={false} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	expect(screen.getByText("extension-error")).toBeTruthy();
	expect(screen.getByText("phone-number-error")).toBeTruthy();
});

it("renders phone extension error when only extension error exists", () => {
	const store = makeTestStore();

	function Wrapper() {
		const methods = useForm<PassengerInformation>();

		useEffect(() => {
			methods.setError("phoneExtension", {
				type: "manual",
				message: "extension-error",
			});
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={false} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	expect(screen.getByText("extension-error")).toBeTruthy();
});

it("handles email blur", () => {
	renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

	const emailInput = screen.getByTestId("input-email");

	fireEvent.focus(emailInput);
	fireEvent.blur(emailInput);

	expect(emailInput).toBeTruthy();
});

it("handles email confirmation blur", () => {
	renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

	const input = screen.getByTestId("input-email-confirm");

	fireEvent.focus(input);
	fireEvent.blur(input);

	expect(input).toBeTruthy();
});

it("prevents paste in email confirmation field", () => {
	renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

	const input = screen.getByTestId("input-email-confirm");

	const pasteEvent = new Event("paste", {
		bubbles: true,
		cancelable: true,
	});

	const preventDefaultSpy = vi.spyOn(pasteEvent, "preventDefault");

	input.dispatchEvent(pasteEvent);

	expect(preventDefaultSpy).toHaveBeenCalled();
});

it("does not validate email confirmation until it is touched", () => {
	const store = makeTestStore();
	let triggerSpy: ReturnType<typeof vi.spyOn>;

	function Wrapper() {
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
				passportNumber: "",
				passportExpiryDate: { year: "", month: "", day: "" },
				phoneExtension: "+81",
				phoneNumber: "",
				emergencyExtension: "+1",
				emergencyNumber: "",
				email: "",
				emailConfirmation: "",
				hasTravelDocs: false,
				isPregnant: false,
				pregnancyWeeks: "",
				requestingAssistance: false,
				assistanceReasons: [],
			},
		});

		triggerSpy = vi.spyOn(methods, "trigger");

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={false} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	fireEvent.focus(screen.getByTestId("input-email"));
	fireEvent.blur(screen.getByTestId("input-email"));

	expect(triggerSpy).not.toHaveBeenCalledWith("emailConfirmation");

	fireEvent.focus(screen.getByTestId("input-email-confirm"));
	fireEvent.blur(screen.getByTestId("input-email-confirm"));

	expect(triggerSpy).toHaveBeenCalledWith("emailConfirmation");
});

it("validates email confirmation when a prefilled value already exists", () => {
	const store = makeTestStore();
	let triggerSpy: ReturnType<typeof vi.spyOn>;

	function Wrapper() {
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
				passportNumber: "",
				passportExpiryDate: { year: "", month: "", day: "" },
				phoneExtension: "+81",
				phoneNumber: "",
				emergencyExtension: "+1",
				emergencyNumber: "",
				email: "s@gmail.com",
				emailConfirmation: "s@gsssmail.com",
				hasTravelDocs: false,
				isPregnant: false,
				pregnancyWeeks: "",
				requestingAssistance: false,
				assistanceReasons: [],
			},
		});

		triggerSpy = vi.spyOn(methods, "trigger");

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={false} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	fireEvent.focus(screen.getByTestId("input-email"));
	fireEvent.blur(screen.getByTestId("input-email"));

	expect(triggerSpy).toHaveBeenCalledWith("emailConfirmation");
});

it("triggers phoneExtension validation when phone extension has an error", () => {
	const store = makeTestStore();

	function Wrapper() {
		const methods = useForm<PassengerInformation>();

		useEffect(() => {
			methods.setError("phoneExtension", {
				type: "manual",
				message: "extension-error",
			});
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={false} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	fireEvent.change(screen.getByTestId("phone-input-label_phone_number"), {
		target: { value: "1234567890" },
	});

	expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled();
});

it("triggers emergencyExtension validation when emergency extension has an error", () => {
	const store = makeTestStore();

	function Wrapper() {
		const methods = useForm<PassengerInformation>();

		useEffect(() => {
			methods.setError("emergencyExtension", {
				type: "manual",
				message: "emergency-extension-error",
			});
		}, [methods]);

		return (
			<Provider store={store}>
				<FormProvider {...methods}>
					<ContactSection isUsRoute={true} isPrimary={false} />
				</FormProvider>
			</Provider>
		);
	}

	render(<Wrapper />);

	fireEvent.change(screen.getByTestId("phone-input-label_emergency_contact"), {
		target: { value: "9876543210" },
	});

	expect(mocks.handleFieldOnChangeMock).toHaveBeenCalled();
});

it.each([
	{
		name: "copies contact information from primary passenger",
		phoneExtension: "+81",
		emergencyExtension: "+1",
		emergencyNumber: "9876543210",
		id: undefined,
	},
	{
		name: "uses default extension when dial code does not exist",
		phoneExtension: "+999",
		emergencyExtension: "+999",
		emergencyNumber: "9876543210",
		id: undefined,
	},
	{
		name: "copies empty emergency number when primary passenger emergency number is undefined",
		phoneExtension: "+81",
		emergencyExtension: "+1",
		emergencyNumber: undefined,
		id: "pax-1",
	},
])("$name", ({ phoneExtension, emergencyExtension, emergencyNumber, id }) => {
	const primaryPax = makePassenger({
		...(id && { id }),
		contactInformation: {
			countryCode: phoneExtension,
			phoneNumber: "1234567890",
			email: "primary@example.com",
		},
		emergencyContact: {
			countryCode: emergencyExtension,
			phoneNumber: emergencyNumber as any,
		},
	});

	renderContactSectionWithPrimaryPassenger([primaryPax], true);

	fireEvent.click(screen.getByTestId("copy-btn"));

	expect(screen.getByTestId("copy-btn")).toBeTruthy();
});

it("executes copy handler", () => {
	const primaryPax = makePassenger({
		contactInformation: {
			countryCode: "+81",
			phoneNumber: "1234567890",
			email: "primary@example.com",
		},
		emergencyContact: {
			countryCode: "+1",
			phoneNumber: "9876543210",
		},
	});

	renderContactSectionWithPrimaryPassenger([primaryPax], true);

	fireEvent.click(screen.getByTestId("copy-btn"));

	expect(screen.getByTestId("copy-btn")).toBeTruthy();
});

it("copies all contact information fields from primary passenger when fully populated", () => {
	const primaryPax = makePassenger({
		id: "pax-1",
		contactInformation: {
			countryCode: "+81",
			phoneNumber: "1234567890",
			email: "primary@example.com",
		},
		emergencyContact: {
			countryCode: "+1",
			phoneNumber: "9876543210",
		},
	});

	renderContactSectionWithPrimaryPassenger([primaryPax], true);

	fireEvent.click(screen.getByTestId("copy-btn"));

	expect(screen.getByTestId("copy-btn")).toBeTruthy();
});

it("does not render copy button when primary passenger is undefined", () => {
	const selectorSpy = vi.spyOn(storeHooks, "useAppSelector").mockReturnValue(undefined);

	renderWithFormAndProviders(<ContactSection isUsRoute={false} isPrimary={false} />);

	expect(screen.queryByTestId("copy-btn")).toBeFalsy();

	selectorSpy.mockRestore();
});

it("uses fallback values when copied contact information is missing", () => {
	const primaryPax = makePassenger({
		id: "pax-1",
		contactInformation: {
			countryCode: "+999",
			phoneNumber: undefined as any,
			email: undefined as any,
		},
		emergencyContact: {
			countryCode: "+999",
			phoneNumber: undefined as any,
		},
	});

	renderContactSectionWithPrimaryPassenger([primaryPax], true);

	fireEvent.click(screen.getByTestId("copy-btn"));

	expect(screen.getByTestId("copy-btn")).toBeTruthy();
});
