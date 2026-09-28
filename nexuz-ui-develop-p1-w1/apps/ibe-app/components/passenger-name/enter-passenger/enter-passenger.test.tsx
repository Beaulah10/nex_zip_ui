import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import { renderWithProviders } from "@/test/render-with-providers";

const routerPushMock = vi.fn();
const routerReplaceMock = vi.fn();
const routerPrefetchMock = vi.fn();
const routerRefreshMock = vi.fn();
const routerBackMock = vi.fn();
const routerForwardMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: routerPushMock,
		replace: routerReplaceMock,
		prefetch: routerPrefetchMock,
		refresh: routerRefreshMock,
		back: routerBackMock,
		forward: routerForwardMock,
	}),
}));

const dispatchMock = vi.fn();
const setPassengerNamesActionMock = vi.fn((payload) => ({
	type: "passenger/setPassengerNames",
	payload,
}));
const passengerSectionMock = vi.fn((props: any) => (
	<div data-testid={`passenger-section-${props.index}`}>section-{props.index}</div>
));

const formResetMock = vi.fn();
const formTriggerMock = vi.fn();
let submitMode: "valid" | "invalid" = "valid";
let submitData: any = { passengers: [] };
let watchPassengers: any[] = [];
let fieldArrayFields: Array<{ id: string }> = [];
let formErrorsMock: any = {};
const selectorState = vi.hoisted<{ current: any }>(() => ({
	current: {
		flightSelection: {
			confirmedFlight: { grandTotalAmount: 0 } as Partial<ConfirmedFlightPayload>,
			request: {
				routes: "KOC-SIN",
				passengers: { adult: 0, childA: 0, childB: 0, childC: 0, infant: 0 },
			},
		},
		passenger: {
			passengers: [],
		},
	},
}));

const getAdultAssignmentMapMock = vi.fn();
const isValidAssignmentMock = vi.fn();
const setFocusOnInvalidInputMock = vi.fn();
const isYvrRouteMock = vi.fn(() => false);
let buildPassengerNamesResult: any[] = [];

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@hookform/resolvers/zod", () => ({
	zodResolver: () => vi.fn(),
}));

vi.mock("react-hook-form", async () => {
	const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");
	return {
		...actual,
		useForm: () => ({
			control: {},
			watch: () => watchPassengers,
			handleSubmit: (onValid: (data: unknown) => void, onInvalid?: () => void) => () => {
				if (submitMode === "valid") {
					onValid(submitData);
					return;
				}
				onInvalid?.();
			},
			trigger: formTriggerMock,
			reset: formResetMock,
			formState: {
				errors: formErrorsMock,
				isValid: !(
					Array.isArray(formErrorsMock?.passengers) &&
					formErrorsMock.passengers.some((item: Record<string, unknown>) =>
						Boolean(item && Object.keys(item).length > 0)
					)
				),
			},
		}),
		useFieldArray: () => ({
			fields: fieldArrayFields,
		}),
	};
});

vi.mock("react-redux", async () => {
	const actual = await vi.importActual<typeof import("react-redux")>("react-redux");

	return {
		...actual,
		useSelector: (selector: (state: any) => unknown) => selector(selectorState.current),
	};
});

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		children,
		onOpenChange,
	}: {
		children: React.ReactNode;
		onOpenChange?: (open: boolean) => void;
	}) => (
		<div>
			{children}
			<button type="button" onClick={() => onOpenChange?.(false)}>
				close-dialog
			</button>
		</div>
	),
	DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock("@/components/passenger-name/passenger-section/passenger-section", () => ({
	PassengerSection: (props: { index: number }) => passengerSectionMock(props),
}));

vi.mock("@/modules/mocks/passenger.mock", () => ({
	passengerData: {
		tripType: "one-way",
		origin: "KOC",
		destination: "SIN",
		passengerCounts: { adult: 0, childA: 0, childB: 0, childC: 0, infant: 0 },
	},
}));

vi.mock("@/modules/utils/helpers/common/route-type/route-type", () => ({
	isYvrRoute: () => isYvrRouteMock(),
}));

vi.mock("@/modules/utils/helpers/passenger-name/passenger-data/passenger-data", () => ({
	buildPassengerNames: () => buildPassengerNamesResult,
}));

vi.mock("@/modules/utils/helpers/passenger-name/passenger-rules/passenger-rules", () => ({
	getAdultAssignmentMap: (passengers: unknown[]) => getAdultAssignmentMapMock(passengers),
	isValidateAdultAssignment: (args: unknown) => isValidAssignmentMock(args),
	shouldHaveAccompanyingAdult: (type: string, yvr: boolean) =>
		yvr
			? ["childA", "childB", "childC", "infant"].includes(type)
			: ["childC", "infant"].includes(type),
}));

vi.mock("@/modules/utils/helpers/common/field-focus/field-focus", () => ({
	setFocusOnInvalidInput: () => setFocusOnInvalidInputMock(),
}));

vi.mock("@/modules/utils/validations/passenger.schema/passenger.schema", () => ({
	passengerFormSchema: () => ({}),
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => dispatchMock,
	useAppSelector: (selector: (state: any) => unknown) => selector(selectorState.current),
}));

vi.mock("@/store/slices/passenger/passenger.slice", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/store/slices/passenger/passenger.slice")>();

	return {
		...actual,
		setPassengerNames: (payload: unknown) => setPassengerNamesActionMock(payload),
	};
});

import { EnterPassengerDialog } from "@/components/passenger-name/enter-passenger/enter-passenger";

const getConfirmSubmitButton = () => {
	const confirmButtons = screen.getAllByRole("button", { name: "confirm_button" });
	expect(confirmButtons.length).toBeGreaterThan(0);
	const submitButton = confirmButtons[0];

	if (!submitButton) {
		throw new Error("Expected dialog confirm button to exist");
	}

	return submitButton;
};

describe("EnterPassengerDialog", () => {
	beforeEach(() => {
		routerPushMock.mockReset();
		dispatchMock.mockReset();
		routerPushMock.mockReset();
		routerReplaceMock.mockReset();
		routerPrefetchMock.mockReset();
		routerRefreshMock.mockReset();
		routerBackMock.mockReset();
		routerForwardMock.mockReset();
		setPassengerNamesActionMock.mockClear();
		passengerSectionMock.mockClear();
		formResetMock.mockReset();
		formTriggerMock.mockReset();
		getAdultAssignmentMapMock.mockReset();
		isValidAssignmentMock.mockReset();
		setFocusOnInvalidInputMock.mockReset();
		isYvrRouteMock.mockReset();
		isYvrRouteMock.mockReturnValue(false);
		submitMode = "valid";
		formErrorsMock = {};
		selectorState.current = {
			flightSelection: {
				confirmedFlight: {
					grandTotalAmount: 0,
					tripType: "oneway",
					flights: {
						outbound: {
							segments: [
								{
									origin: "KOC",
									destination: "SIN",
								},
							],
						},
					},
				} as Partial<ConfirmedFlightPayload>,
				request: {
					routes: "KOC-SIN",
					passengers: { adult: 0, childA: 0, childB: 0, childC: 0, infant: 0 },
				},
			},
			passenger: {
				passengers: [],
			},
		};
		buildPassengerNamesResult = [
			{
				id: "1",
				mainLabel: "adult_passenger",
				ageLabel: "adult_age",
				hasAccompanyingAdult: false,
				passengerTypeCode: "adult",
			},
			{
				id: "2",
				mainLabel: "adult_passenger",
				ageLabel: "adult_age",
				hasAccompanyingAdult: false,
				passengerTypeCode: "adult",
			},
			{
				id: "3",
				mainLabel: "child_passenger",
				ageLabel: "child_age",
				hasAccompanyingAdult: true,
				passengerTypeCode: "childC",
			},
		];
		watchPassengers = [
			{
				id: "1",
				firstName: "JOHN",
				lastName: "DOE",
				passengerTypeCode: "adult",
			},
			{
				id: "2",
				firstName: "",
				lastName: "",
				passengerTypeCode: "adult",
			},
			{
				id: "3",
				firstName: "KID",
				lastName: "ONE",
				passengerTypeCode: "childC",
				accompanyingAdult: "1",
			},
		];
		fieldArrayFields = [{ id: "f1" }, { id: "f2" }, { id: "f3" }, { id: "f4" }];
		submitData = {
			passengers: [
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "JOHN",
					lastName: "DOE",
				},
				{
					id: "3",
					passengerTypeCode: "childC",
					firstName: "KID",
					lastName: "ONE",
					accompanyingAdult: "1",
				},
			],
		};
		isValidAssignmentMock.mockReturnValue(true);
		getAdultAssignmentMapMock.mockReturnValue({});
		vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
			cb(0);
			return 1;
		});
	});

	it("renders passenger sections and computes adult options", () => {
		renderWithProviders(<EnterPassengerDialog locale="en" />);

		expect(screen.getByRole("heading", { name: "passenger_name" })).toBeTruthy();
		expect(passengerSectionMock).toHaveBeenCalledTimes(3);

		const firstCallProps = passengerSectionMock.mock.calls[0]?.[0];
		expect(firstCallProps).toBeTruthy();
		expect(firstCallProps.adultOptions).toEqual([
			{ value: "1", label: "JOHN DOE", disabled: false },
			{ value: "2", label: "adult_passenger 2", disabled: true },
		]);
		expect(firstCallProps.isYvrRouteValue).toBe(false);
	});

	it("dispatches transformed passenger payload on successful submit", () => {
		renderWithProviders(<EnterPassengerDialog locale="en" />);
		fireEvent.click(getConfirmSubmitButton());

		expect(setPassengerNamesActionMock).toHaveBeenCalledWith([
			{
				id: "1",
				passengerTypeCode: "adult",
				firstName: "JOHN",
				lastName: "DOE",
			},
			{
				id: "3",
				passengerTypeCode: "childC",
				associateWithPassengerId: "1",
				firstName: "KID",
				lastName: "ONE",
			},
		]);
		expect(dispatchMock).toHaveBeenCalledWith({
			type: "passenger/setPassengerNames",
			payload: [
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "JOHN",
					lastName: "DOE",
				},
				{
					id: "3",
					passengerTypeCode: "childC",
					associateWithPassengerId: "1",
					firstName: "KID",
					lastName: "ONE",
				},
			],
		});
		expect(routerPushMock).toHaveBeenCalledWith("/en/bundles/outbound");
		expect(screen.queryByText("global_error")).toBeFalsy();
	});

	it("skips dispatch when submitted values already match the stored passengers", () => {
		selectorState.current.passenger.passengers = [
			{
				id: "1",
				passengerTypeCode: "adult",
				firstName: "JOHN",
				lastName: "DOE",
				bundles: [{ lfid: 1, pfid: 1, bundleCode: "B1" }],
				services: {
					"non-chargeable": [],
					chargeable: [],
					baggage: [],
					extras: [],
				},
			},
			{
				id: "3",
				passengerTypeCode: "childC",
				associateWithPassengerId: "1",
				firstName: "KID",
				lastName: "ONE",
			},
		];

		renderWithProviders(<EnterPassengerDialog locale="en" />);
		fireEvent.click(getConfirmSubmitButton());

		expect(setPassengerNamesActionMock).not.toHaveBeenCalled();
		expect(dispatchMock).not.toHaveBeenCalled();
		expect(routerPushMock).toHaveBeenCalledWith("/en/bundles/outbound");
	});

	it("shows global error and blocks dispatch when assignment is invalid", () => {
		isValidAssignmentMock.mockReturnValue(false);

		renderWithProviders(<EnterPassengerDialog locale="en" />);
		fireEvent.click(getConfirmSubmitButton());

		expect(screen.getByText("global_error")).toBeTruthy();
		expect(dispatchMock).not.toHaveBeenCalled();
	});

	it("does not show an assignment error for adults associated with children", () => {
		isValidAssignmentMock.mockReturnValue(false);
		submitData = {
			passengers: [
				{
					id: "1",
					passengerTypeCode: "adult",
					firstName: "JOHN",
					lastName: "DOE",
					accompanyingAdult: "3",
				},
			],
		};

		renderWithProviders(<EnterPassengerDialog locale="en" />);
		fireEvent.click(getConfirmSubmitButton());

		expect(isValidAssignmentMock).not.toHaveBeenCalled();
		expect(screen.queryByText("global_error")).toBeFalsy();
		expect(dispatchMock).toHaveBeenCalledOnce();
	});

	it("handles invalid submit by focusing invalid input and showing global error", () => {
		submitMode = "invalid";
		formErrorsMock = {
			passengers: [{ firstName: { message: "required" } }],
		};

		renderWithProviders(<EnterPassengerDialog locale="en" />);
		fireEvent.click(getConfirmSubmitButton());

		expect(setFocusOnInvalidInputMock).toHaveBeenCalledOnce();
		expect(screen.getByText("global_error")).toBeTruthy();
	});

	it("removes global error only after all passenger field errors are resolved", () => {
		submitMode = "invalid";
		formErrorsMock = {
			passengers: [{ firstName: { message: "required" } }, { lastName: { message: "required" } }],
		};

		const view = renderWithProviders(<EnterPassengerDialog locale="en" />);
		fireEvent.click(getConfirmSubmitButton());
		expect(screen.getByText("global_error")).toBeTruthy();

		formErrorsMock = { passengers: [{}, { lastName: { message: "required" } }] };
		view.rerender(<EnterPassengerDialog locale="en" />);
		expect(screen.getByText("global_error")).toBeTruthy();

		formErrorsMock = { passengers: [{}, {}] };
		view.rerender(<EnterPassengerDialog locale="en" />);
		expect(screen.queryByText("global_error")).toBeFalsy();
	});
});
