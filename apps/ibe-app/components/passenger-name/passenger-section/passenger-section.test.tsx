import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render-with-providers";
import type { PassengerSection as PassengerSectionType } from "@/types/passenger/passenger.type";

const controllerInvalidNames = new Set<string>();
const controllerValues: Record<string, string> = {};
const controllerOnChange: Record<string, ReturnType<typeof vi.fn>> = {};

vi.mock("react-hook-form", async () => {
	const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

	return {
		...actual,
		Controller: ({
			name,
			render,
		}: {
			name: string;
			render: (props: any) => React.ReactElement;
		}) => {
			if (!controllerOnChange[name]) {
				controllerOnChange[name] = vi.fn((value: string) => {
					controllerValues[name] = value;
				});
			}

			const invalid = controllerInvalidNames.has(name);
			return render({
				field: {
					name,
					value: controllerValues[name] ?? "",
					onChange: controllerOnChange[name],
				},
				fieldState: {
					invalid,
					error: invalid ? { message: "invalid" } : undefined,
				},
			});
		},
	};
});

vi.mock("@repo/ui/components/input-field", () => ({
	InputField: ({ id, label, onChange, errors, "aria-invalid": ariaInvalid }: any) => (
		<div>
			<label htmlFor={id}>{label}</label>
			<input id={id} aria-label={label} onChange={onChange} aria-invalid={ariaInvalid} />
			{errors?.[0] ? <span>{String(errors[0].message ?? errors[0])}</span> : null}
		</div>
	),
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldCombobox: ({
		label,
		onValueChange,
		inputClassName,
		inputValue,
		itemToStringLabel,
		filter,
		children,
	}: any) =>
		(() => {
			itemToStringLabel?.("adult-1");
			filter?.("adult-1");
			return (
				<div data-testid="field-combobox" data-input-class={inputClassName}>
					<div data-testid="field-combobox-value">{inputValue}</div>
					<span>{label}</span>
					<button type="button" onClick={() => onValueChange("adult-1")}>
						choose-adult-1
					</button>
					<button type="button" onClick={() => onValueChange("adult-2")}>
						choose-adult-2
					</button>
					<button type="button" onClick={() => onValueChange(null)}>
						clear-selection
					</button>
					{children}
				</div>
			);
		})(),
}));

vi.mock("@repo/ui/components/combobox", () => ({
	ComboboxItem: ({ value, disabled, className, children }: any) => (
		<div
			data-testid={`option-${value}`}
			data-disabled={disabled ? "true" : "false"}
			className={className}
		>
			{children}
		</div>
	),
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" "),
}));

vi.mock("@/components/passenger-name/passenger-number-badge/passenger-number-badge", () => ({
	PassengerNumberBadge: ({ number }: { number: string }) => <span>Badge-{number}</span>,
}));

const isValidAssignmentMock = vi.fn();

vi.mock("@/modules/utils/helpers/passenger-name/passenger-rules/passenger-rules", () => ({
	isValidateAdultAssignment: (args: unknown) => isValidAssignmentMock(args),
}));

import { PassengerSection } from "@/components/passenger-name/passenger-section/passenger-section";

const triggerMock = vi.fn();

const baseSection: PassengerSectionType = {
	id: "1",
	mainLabel: "Adult",
	ageLabel: "(12+)",
	hasAccompanyingAdult: true,
	passengerTypeCode: "childC",
};

const labelFn = ((key: string) => key) as ReturnType<
	typeof import("next-intl").useTranslations<"passenger_name_page">
>;

describe("PassengerSection", () => {
	beforeEach(() => {
		controllerInvalidNames.clear();

		for (const key of Object.keys(controllerValues)) {
			delete controllerValues[key];
		}

		for (const key in controllerOnChange) {
			delete controllerOnChange[key];
		}

		triggerMock.mockReset();
		isValidAssignmentMock.mockReset();
		isValidAssignmentMock.mockReturnValue(true);
	});

	it("renders passenger fields and uppercases input while triggering validation for invalid field", () => {
		controllerInvalidNames.add("passengers.0.lastName");
		controllerInvalidNames.add("passengers.0.firstName");

		renderWithProviders(
			<PassengerSection
				index={0}
				section={baseSection}
				errs={{ lastName: { message: "Last name required" } } as any}
				control={{} as any}
				trigger={triggerMock as any}
				adultOptions={[{ value: "adult-1", label: "Adult 1", disabled: false }]}
				associatedAdults={{}}
				isYvrRouteValue={false}
				passengerNameLabels={labelFn}
			/>
		);

		fireEvent.change(screen.getByLabelText("last_name"), { target: { value: "doe" } });
		fireEvent.change(screen.getByLabelText("first_name"), { target: { value: "john" } });

		expect(controllerOnChange["passengers.0.lastName"]).toHaveBeenCalledWith("DOE");
		expect(controllerOnChange["passengers.0.firstName"]).toHaveBeenCalledWith("JOHN");
		expect(triggerMock).toHaveBeenCalledWith("passengers.0.lastName");
		expect(triggerMock).toHaveBeenCalledWith("passengers.0.firstName");
		expect(triggerMock).toHaveBeenCalledTimes(2);
	});

	it("handles accompanying adult selection based on assignment rules", () => {
		isValidAssignmentMock.mockImplementation(
			({ adultId }: { adultId: string }) => adultId !== "adult-2"
		);

		renderWithProviders(
			<PassengerSection
				index={0}
				section={baseSection}
				errs={undefined}
				control={{} as any}
				trigger={triggerMock as any}
				adultOptions={[
					{ value: "adult-1", label: "Adult One", disabled: false },
					{ value: "adult-2", label: "Adult Two", disabled: false },
					{ value: "adult-3", label: "Adult Three", disabled: true },
				]}
				associatedAdults={{}}
				isYvrRouteValue
				passengerNameLabels={labelFn}
			/>
		);

		fireEvent.click(screen.getByRole("button", { name: "choose-adult-1" }));
		fireEvent.click(screen.getByRole("button", { name: "choose-adult-2" }));
		fireEvent.click(screen.getByRole("button", { name: "clear-selection" }));

		expect(controllerOnChange["passengers.0.accompanyingAdult"]).toHaveBeenCalledWith("adult-1");
		expect(controllerOnChange["passengers.0.accompanyingAdult"]).not.toHaveBeenCalledWith(
			"adult-2"
		);
		expect(controllerOnChange["passengers.0.accompanyingAdult"]).toHaveBeenCalledWith("");

		expect(screen.getByTestId("option-adult-2").className).toContain("opacity-50");
		expect(screen.getByTestId("option-adult-3").getAttribute("data-disabled")).toBe("true");
	});

	it("renders a preselected accompanying adult and disables the combobox when all options are disabled", () => {
		controllerValues["passengers.0.accompanyingAdult"] = "adult-2";

		renderWithProviders(
			<PassengerSection
				index={0}
				section={baseSection}
				errs={undefined}
				control={{} as any}
				trigger={triggerMock as any}
				adultOptions={[
					{ value: "adult-1", label: "Adult One", disabled: true },
					{ value: "adult-2", label: "Adult Two", disabled: true },
				]}
				associatedAdults={{}}
				isYvrRouteValue={false}
				passengerNameLabels={labelFn}
			/>
		);

		expect(screen.getByTestId("field-combobox")).toHaveAttribute(
			"data-input-class",
			expect.stringContaining("pointer-events-none")
		);
		expect(screen.getByTestId("field-combobox-value")).toHaveTextContent("Adult Two");
	});

	it("hides accompanying adult selector when section does not require it", () => {
		renderWithProviders(
			<PassengerSection
				index={0}
				section={{ ...baseSection, hasAccompanyingAdult: false }}
				errs={undefined}
				control={{} as any}
				trigger={triggerMock as any}
				adultOptions={[
					{ value: "adult-1", label: "Adult One", disabled: true },
					{ value: "adult-2", label: "Adult Two", disabled: true },
				]}
				associatedAdults={{}}
				isYvrRouteValue={false}
				passengerNameLabels={labelFn}
			/>
		);

		expect(screen.queryByTestId("field-combobox")).toBeFalsy();
	});
});
