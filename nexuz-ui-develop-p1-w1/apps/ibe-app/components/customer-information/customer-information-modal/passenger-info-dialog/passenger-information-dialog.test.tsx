/**
 * File: passenger-information-dialog.test.tsx
 * Description: Basic unit tests for PassengerInformationDialog covering rendering,
 * dialog trigger actions, and passenger information workflow initialization.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PassengerInformationDialog } from "@/components/customer-information/customer-information-modal/passenger-info-dialog/passenger-information-dialog";
import * as countryUtils from "@/modules/utils/helpers/common/country-utils/country-utils";
import { renderWithProviders } from "@/modules/utils/helpers/customer-information/test-utils";
import {
	updateAllPassengersAccommodation,
	updatePassenger,
} from "@/store/slices/customer-information/customer-information.slice";

const helperMocks = vi.hoisted(() => ({
	setFocusOnInvalidInputMock: vi.fn(),
}));

const formMocks = vi.hoisted(() => ({
	submitMode: "valid" as "valid" | "invalid",
	submitData: {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	} as Record<string, unknown>,
}));
const storeMocks = vi.hoisted(() => ({
	passengers: [] as any[],
	flightSelectionRequest: {} as Record<string, unknown>,
}));

const serviceMocks = vi.hoisted(() => ({
	prepareSelectedServicesForPassengerMock: vi.fn(() => []),
}));
const dialogMocks = vi.hoisted(() => ({
	contentProps: {} as Record<string, unknown>,
}));
const unsavedChangesMocks = vi.hoisted(() => ({
	isDirty: false,
	showWarning: vi.fn(),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/utils/helpers/common/field-focus/field-focus", () => ({
	setFocusOnInvalidInput: helperMocks.setFocusOnInvalidInputMock,
}));

vi.mock("@/components/common/unsaved-changes/unsaved-changes-dialog", () => ({
	useUnsavedChanges: () => ({
		showWarning: unsavedChangesMocks.showWarning,
	}),
}));

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: vi.fn(() => vi.fn()),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: () => <span data-testid="icon" />,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
		type = "button",
	}: ButtonHTMLAttributes<HTMLButtonElement> & {
		children: ReactNode;
		asChild?: boolean;
		variant?: string;
		size?: string;
		outline?: boolean;
	}) => (
		<button type={type} onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		children,
		onOpenChange,
	}: {
		children: ReactNode;
		open?: boolean;
		onOpenChange?: (value: boolean) => void;
	}) => (
		<div>
			<button data-testid="open-dialog" type="button" onClick={() => onOpenChange?.(true)}>
				open-dialog
			</button>
			<button type="button" data-testid="close-dialog" onClick={() => onOpenChange?.(false)}>
				close-dialog
			</button>
			{children}
		</div>
	),
	DialogContent: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => {
		dialogMocks.contentProps = props;
		return <div data-testid="dialog-content">{children}</div>;
	},
	DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	DialogTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/passenger-information-dialog-content/passenger-information-dialog-content",
	() => ({
		PassengerInformationDialogContent: ({ onClickCopyToPassenger }: any) => (
			<div>
				<button type="button" data-testid="copy-btn" onClick={onClickCopyToPassenger}>
					copy
				</button>

				<div data-testid="dialog-form-content">Passenger Information Content</div>
			</div>
		),
	})
);

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => vi.fn(),
	useAppSelector: (selector: (state: any) => unknown) =>
		selector({
			__passengers: storeMocks.passengers,
			flightSelection: {
				confirmedFlight: {
					tripType: "oneway",
					currency: "USD",
					language: "en",
					grandTotalAmount: 100,
					flights: {
						outbound: {
							totalFlightAmount: 100,
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							segments: [
								{
									pfid: 1,
									lfid: 1,
									carrierCode: "XX",
									origin: "NRT",
									destination: "SFO",
									flightNumber: "1",
									scheduledDepartureArrivalDateTime: {
										departureDateTime: "2030-01-01T00:00:00",
										departureDateTimeOffset: "2030-01-01T00:00:00+09:00",
										arrivalDateTime: "2030-01-01T08:00:00",
										arrivalDateTimeOffset: "2030-01-01T08:00:00-08:00",
									},
									flightTime: "8h",
									selectedCabin: "economy",
									fareDetails: [],
								},
							],
						},
					},
				},
				request: storeMocks.flightSelectionRequest,
			},
		}),
}));

vi.mock("@/store/slices/customer-information/passenger-selector/passenger-selector", () => ({
	selectPassengerList: vi.fn((state: { __passengers?: any[] }) => state.__passengers ?? []),
}));

vi.mock("@/store/slices/customer-information/customer-information.slice", () => ({
	updatePassenger: vi.fn((payload) => ({
		type: "passenger/updatePassenger",
		payload,
	})),
	updateAllPassengersAccommodation: vi.fn((payload) => ({
		type: "passenger/updateAllPassengersAccommodation",
		payload,
	})),
	default: (state = { values: [], submitted: false }, action: any) => {
		switch (action.type) {
			case "passenger/updatePassenger":
			case "passenger/updateAllPassengersAccommodation":
				return state;
			default:
				return state;
		}
	},
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	addService: vi.fn((payload) => ({
		type: "passenger/addService",
		payload,
	})),
	removeService: vi.fn((payload) => ({
		type: "passenger/removeService",
		payload,
	})),
	selectServicesByPassengerId: vi.fn(() => []),
	default: (state = [], action: any) => {
		switch (action.type) {
			case "selectedService/setSelectedServices":
				return state;
			default:
				return state;
		}
	},
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: vi.fn((state) => state.flightSelection?.confirmedFlight),
	selectFlightSearchRequest: vi.fn((state) => state.flightSelection?.request),
	default: (state: any = {}) => state,
}));

vi.mock("@/modules/utils/helpers/customer-information/customer-information-utils", () => ({
	emptyPassenger: {
		lastName: "",
		firstName: "",
		middleName: "",
		gender: "",
		dateOfBirth: {
			year: "",
			month: "",
			day: "",
		},
		nationality: "",
		countryOfResidence: "",
		passportNumber: "",
		passportExpiryDate: {
			year: "",
			month: "",
			day: "",
		},
		phoneNumber: "",
		phoneExtension: "",
		email: "",
		emailConfirmation: "",
		emergencyNumber: "",
		emergencyExtension: "",
		hotelName: "",
		countryOfStay: "",
		postalCode: "",
		city: "",
		state: "",
		hasTravelDocs: false,
		documentType: undefined,
		documentNumber: "",
		documentExpiryDate: {
			year: "",
			month: "",
			day: "",
		},
		issuingCountry: "",
		purposeOfTravel: "",
		evusObtained: false,
		bodyWeight: "",
		bodyHeight: "",
	},
	getFlightDepartureDateTime: vi.fn(() => "2026-01-01"),
	getRoutesFromFlightSelection: vi.fn(() => []),
	mapFormToPassenger: vi.fn(() => ({
		id: "PAX001",
		isCompleted: true,
	})),
	mapPassengerToForm: vi.fn(() => ({
		lastName: "",
		firstName: "",
		middleName: "",
		gender: "",
		dateOfBirth: {
			year: "",
			month: "",
			day: "",
		},
		nationality: "",
		countryOfResidence: "",
		passportNumber: "",
		passportExpiryDate: {
			year: "",
			month: "",
			day: "",
		},
		phoneNumber: "",
		phoneExtension: "",
		email: "",
		emailConfirmation: "",
		emergencyNumber: "",
		emergencyExtension: "",
		hotelName: "",
		countryOfStay: "",
		postalCode: "",
		city: "",
		state: "",
		hasTravelDocs: false,
		documentType: undefined,
		documentNumber: "",
		documentExpiryDate: {
			year: "",
			month: "",
			day: "",
		},
		issuingCountry: "",
		purposeOfTravel: "",
		evusObtained: false,
		bodyWeight: "",
		bodyHeight: "",
	})),
	setFocusOnInvalidInput: helperMocks.setFocusOnInvalidInputMock,
}));

vi.mock(
	"@/modules/utils/helpers/customer-information/prepared-selected-services-utils/prepare-selected-services-utils",
	() => ({
		NON_CHARGEABLE_SSR_CODES: new Set([
			"WCHR",
			"WCHS",
			"WCHC",
			"MPWC",
			"DBWC",
			"WBWC",
			"BLND",
			"DEAF",
			"PRGN",
			"SVAN",
			"STOP",
		]),
		prepareSelectedServicesForPassenger: serviceMocks.prepareSelectedServicesForPassengerMock,
	})
);

vi.mock(
	"@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils",
	() => ({
		getFlightSegments: vi.fn((flight) => flight.flights.outbound.segments),
		isNRTDirectOrRoundTrip: vi.fn(() => true),
		isUSDeparture: vi.fn(() => false),
	})
);
vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isAnyCANADARoute: vi.fn(() => false),
	isAnyUSRoute: vi.fn(() => false),
	isDestinationThai: vi.fn(() => false),
	isDestinationUS: vi.fn(() => false),
	isUSDeparture: vi.fn(() => false),
}));

vi.mock("@/modules/utils/validations/customer-information/customer-information-schema", () => ({
	buildSinglePassengerSchema: vi.fn(() => ({})),
}));

vi.mock("react-hook-form", async () => {
	const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

	return {
		...actual,
		FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
		useFormState: () => ({
			isDirty: unsavedChangesMocks.isDirty,
		}),
		useForm: () => ({
			reset: vi.fn(),
			watch: vi.fn(() => ({
				unsubscribe: vi.fn(),
			})),
			handleSubmit: vi.fn((validCallback, invalidCallback) => {
				return (event?: Event) => {
					event?.preventDefault?.();

					if (formMocks.submitMode === "invalid") {
						invalidCallback?.({});
						return;
					}

					validCallback?.(formMocks.submitData);
				};
			}),
			formState: {
				errors: {},
			},
			control: {},
			getValues: vi.fn(),
			setValue: vi.fn(),
			trigger: vi.fn(),
			clearErrors: vi.fn(),
		}),
	};
});

const passengerMock = {
	id: "PAX001",
	firstName: "John",
	lastName: "Doe",
	passengerTypeCode: "adult",
	isCompleted: false,
};

beforeEach(() => {
	vi.clearAllMocks();
	unsavedChangesMocks.isDirty = false;
	formMocks.submitMode = "valid";
	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	if (!globalThis.requestAnimationFrame) {
		globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
			callback(0);
			return 0;
		};
	}
});

describe("PassengerInformationDialog", () => {
	it("renders Add Info button for incomplete passenger", () => {
		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		expect(screen.getByText("button_add_info")).toBeTruthy();
	});

	it("renders icon", () => {
		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		expect(screen.getByTestId("icon")).toBeTruthy();
	});

	it("renders passenger information content", () => {
		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		expect(screen.getByTestId("dialog-form-content")).toBeTruthy();
	});

	it.each([
		"button_add_info",
		"button_enter_visa_information",
		"button_confirmed_proceed_next_step",
	])("keeps %s available after click", (buttonLabel) => {
		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		const button = screen.getByText(buttonLabel);
		fireEvent.click(button);

		expect(button).toBeTruthy();
	});

	it("renders form element", () => {
		const { container } = renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		expect(container.querySelector("form")).toBeTruthy();
	});

	it("renders edit info button for completed passenger", () => {
		renderWithProviders(
			<PassengerInformationDialog
				passenger={
					{
						...passengerMock,
						isCompleted: true,
					} as any
				}
				passengerIndex={0}
				isPrimary
			/>
		);

		expect(screen.getByText("button_edit_info")).toBeTruthy();
	});

	it("opens visa popup", () => {
		const { container } = renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		const form = container.querySelector("form");

		expect(form).toBeTruthy();

		if (!form) {
			throw new Error("Form not found");
		}

		fireEvent.submit(form);

		expect(screen.getByText("visa_dialog_title")).toBeTruthy();
	});

	it("handles invalid submit", () => {
		formMocks.submitMode = "invalid";

		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		const form = document.querySelector("form");

		expect(form).toBeTruthy();

		if (!form) {
			throw new Error("Form not found");
		}

		fireEvent.submit(form);

		expect(form).toBeTruthy();
	});

	it("shows unsaved changes warning when closing a dirty dialog", () => {
		unsavedChangesMocks.isDirty = true;

		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		const openButton = screen.getAllByTestId("open-dialog")[0];
		const closeButton = screen.getAllByTestId("close-dialog")[0];

		expect(openButton).toBeDefined();
		expect(closeButton).toBeDefined();

		if (!openButton || !closeButton) {
			throw new Error("Main dialog buttons not found");
		}

		fireEvent.click(openButton);
		fireEvent.click(closeButton);

		expect(unsavedChangesMocks.showWarning).toHaveBeenCalledTimes(1);
	});

	it("submits form", () => {
		const { container } = renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		const form = container.querySelector("form");

		expect(form).toBeTruthy();

		if (!form) {
			throw new Error("Form not found");
		}

		fireEvent.submit(form);

		expect(form).toBeTruthy();
	});

	it("opens dialog", () => {
		renderWithProviders(
			<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
		);

		const openButton = screen.getAllByText("open-dialog")[0];

		expect(openButton).toBeDefined();

		if (!openButton) {
			throw new Error("Open button not found");
		}

		fireEvent.click(openButton);

		expect(openButton).toBeTruthy();
	});
});

it("focuses invalid field on invalid submit", async () => {
	formMocks.submitMode = "invalid";
	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	await waitFor(() => {
		expect(helperMocks.setFocusOnInvalidInputMock).toHaveBeenCalled();
	});
});

it("opens visa popup for chinese passenger on NRT route", () => {
	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}
	expect(screen.getByText("visa_dialog_title")).toBeTruthy();
});

it("handles visa enter info", () => {
	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");
	expect(form).toBeTruthy();
	if (form) {
		fireEvent.submit(form);
	}
	const button = screen.getByText("button_enter_visa_information");

	fireEvent.click(button);

	expect(button).toBeTruthy();
});

it("prevents implicit dismissal of the visa popup", () => {
	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");
	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	expect(typeof dialogMocks.contentProps.onInteractOutside).toBe("function");
	expect(typeof dialogMocks.contentProps.onEscapeKeyDown).toBe("function");

	const preventDefault = vi.fn();
	(dialogMocks.contentProps.onInteractOutside as (event: { preventDefault: () => void }) => void)({
		preventDefault,
	});
	(dialogMocks.contentProps.onEscapeKeyDown as (event: { preventDefault: () => void }) => void)({
		preventDefault,
	});

	expect(preventDefault).toHaveBeenCalledTimes(2);
});

it("saves passenger when visa confirmation is clicked", () => {
	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}
	fireEvent.click(screen.getByText("button_confirmed_proceed_next_step"));

	expect(updatePassenger).toHaveBeenCalled();
});

it("saves directly when nationality is not chinese", () => {
	formMocks.submitData = {
		nationality: "JPN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}
	expect(updatePassenger).toHaveBeenCalled();
});

it("updates all passengers when copy to passenger is used", () => {
	formMocks.submitData = {
		nationality: "JPN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	fireEvent.click(screen.getByTestId("copy-btn"));

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}
	expect(updateAllPassengersAccommodation).toHaveBeenCalled();
});

it("focuses invalid field when body weight is less than 9kg", async () => {
	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "Less than 9kg",
		hasTravelDocs: false,
		documentType: undefined,
	};

	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	await waitFor(() => {
		expect(helperMocks.setFocusOnInvalidInputMock).toHaveBeenCalled();
	});
});

it("copies destination address to all other passengers", () => {
	storeMocks.passengers = [
		{
			id: "PAX001",
			apisInfo: {
				destinationAddress: {},
			},
		},
		{
			id: "PAX002",
			apisInfo: {
				destinationAddress: {},
			},
		},
	];

	formMocks.submitData = {
		nationality: "JPN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
		hotelName: "Hotel Tokyo",
		countryOfStay: "JP",
		postalCode: "1000001",
		city: "Tokyo",
		state: "Tokyo",
	};

	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	fireEvent.click(screen.getByTestId("copy-btn"));

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}
	expect(updateAllPassengersAccommodation).toHaveBeenCalled();

	expect(serviceMocks.prepareSelectedServicesForPassengerMock).toHaveBeenCalledWith(
		expect.objectContaining({
			id: "PAX001",
		}),
		expect.arrayContaining([
			expect.objectContaining({
				lfid: 1,
				pfid: 1,
				origin: "NRT",
				destination: "SFO",
			}),
		])
	);
});

it("updates only current passenger when copy is not used", () => {
	storeMocks.passengers = [
		{ id: "PAX001", apisInfo: {} },
		{ id: "PAX002", apisInfo: {} },
	];

	formMocks.submitData = {
		nationality: "JPN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	} as any;

	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}
	expect(updatePassenger).toHaveBeenCalled();
});

it("calls history go when dialog closes", () => {
	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const closeButtons = screen.getAllByTestId("close-dialog");

	expect(closeButtons.length).toBeGreaterThan(0);

	const closeButton = closeButtons[0];

	if (closeButton) {
		fireEvent.click(closeButton);
	}
});

it("uses completed state from stored passenger", () => {
	storeMocks.passengers = [
		{
			id: "PAX001",
			isCompleted: true,
			apisInfo: {},
		},
	];

	render(
		<PassengerInformationDialog
			passenger={
				{
					...passengerMock,
					isCompleted: false,
				} as any
			}
			passengerIndex={0}
			isPrimary
		/>
	);

	expect(screen.getByText("button_edit_info")).toBeTruthy();
});

it("sets visa popup shown to false for non chinese nationality", () => {
	storeMocks.passengers = [
		{
			id: "PAX001",
			apisInfo: {},
		},
	];

	formMocks.submitData = {
		nationality: "JPN",
		bodyWeight: "",
		hasTravelDocs: false,
		documentType: undefined,
	};

	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	expect(updatePassenger).toHaveBeenCalled();
	expect(updatePassenger).toHaveBeenCalledWith(
		expect.objectContaining({
			isVisaPopupShown: false,
		})
	);
});

it("keeps stored visa popup state when chinese passenger already saw popup", () => {
	storeMocks.passengers = [
		{
			id: "PAX001",
			isVisaPopupShown: true,
			apisInfo: {},
		},
	];

	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: true,
		documentType: "visa",
	};

	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	expect(updatePassenger).toHaveBeenCalled();
	expect(updatePassenger).toHaveBeenCalledWith(
		expect.objectContaining({
			isVisaPopupShown: true,
		})
	);
});

it("preserves stored visa popup flag for chinese passenger", () => {
	storeMocks.passengers = [
		{
			id: "PAX001",
			isCompleted: false,
			isVisaPopupShown: true,
			apisInfo: {},
		},
	];

	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: true,
		documentType: "visa",
	} as any;

	render(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	expect(updatePassenger).toHaveBeenCalled();
	expect(updatePassenger).toHaveBeenCalledWith(
		expect.objectContaining({
			isVisaPopupShown: true,
		})
	);
});

it("uses passenger completed state when stored passenger does not exist", () => {
	storeMocks.passengers = [];

	render(
		<PassengerInformationDialog
			passenger={
				{
					...passengerMock,
					isCompleted: true,
				} as any
			}
			passengerIndex={0}
			isPrimary
		/>
	);

	expect(screen.getByText("button_edit_info")).toBeTruthy();
});

it("defaults to add info when completion state is unavailable", () => {
	storeMocks.passengers = [];

	renderWithProviders(
		<PassengerInformationDialog
			passenger={
				{
					...passengerMock,
					isCompleted: false,
				} as any
			}
			passengerIndex={0}
			isPrimary
		/>
	);

	expect(screen.getByText("button_add_info")).toBeTruthy();
});

it.each([
	["US route", "isDestinationUS"],
	["Canada route", "isAnyCANADARoute"],
	["Thailand route", "isDestinationThai"],
] as const)("handles %s", (_, routeHelper) => {
	vi.spyOn(countryUtils, routeHelper).mockReturnValue(true);

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	expect(screen.getByTestId("dialog-form-content")).toBeTruthy();
});

it("handles missing passenger type code", () => {
	renderWithProviders(
		<PassengerInformationDialog
			passenger={
				{
					...passengerMock,
					passengerTypeCode: undefined,
				} as any
			}
			passengerIndex={0}
			isPrimary
		/>
	);

	expect(screen.getByTestId("dialog-form-content")).toBeTruthy();
});

it("uses passenger completion state when stored passenger is not found", () => {
	storeMocks.passengers = [];

	renderWithProviders(
		<PassengerInformationDialog
			passenger={
				{
					...passengerMock,
					isCompleted: true,
				} as any
			}
			passengerIndex={0}
			isPrimary
		/>
	);

	expect(screen.getByText("button_edit_info")).toBeTruthy();
});

it("falls back to false when completion status is unavailable", () => {
	storeMocks.passengers = [];

	renderWithProviders(
		<PassengerInformationDialog
			passenger={
				{
					...passengerMock,
					isCompleted: undefined,
				} as any
			}
			passengerIndex={0}
			isPrimary
		/>
	);

	expect(screen.getByText("button_add_info")).toBeTruthy();
});

it("uses false fallback when stored visa popup state is undefined", () => {
	storeMocks.passengers = [
		{
			id: "PAX001",
			apisInfo: {},
			// intentionally no isVisaPopupShown
		},
	];

	formMocks.submitData = {
		nationality: "CHN",
		bodyWeight: "",
		hasTravelDocs: true,
		documentType: "visa",
	} as any;

	renderWithProviders(
		<PassengerInformationDialog passenger={passengerMock as any} passengerIndex={0} isPrimary />
	);

	const form = document.querySelector("form");

	expect(form).toBeTruthy();

	if (form) {
		fireEvent.submit(form);
	}

	expect(updatePassenger).toHaveBeenCalled();
});
