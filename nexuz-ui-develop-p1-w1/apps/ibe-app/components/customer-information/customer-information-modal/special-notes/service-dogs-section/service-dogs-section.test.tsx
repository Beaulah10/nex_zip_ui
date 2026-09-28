/**
 * File: service-dogs-section.test.tsx
 * Classification: Component
 * Description: Tests for ServiceDogsSection — checkbox toggle, expanded dog form rendering,
 * cage presence selection, and dimension fields.
 */

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceDogsSection } from "@/components/customer-information/customer-information-modal/special-notes/service-dogs-section/service-dogs-section";
import {
	SERVICE_DOG_CAGE_DIMENSION_FIELDS,
	SERVICE_DOG_CLEAR_ERRORS_FIELDS,
} from "@/modules/utils/constants/customer-information/constants";
import { renderWithFormAndProviders } from "@/modules/utils/helpers/customer-information/test-utils";

const mocks = vi.hoisted(() => ({
	isAnyUSRoute: true,
	hasFlightSelection: true,
}));

vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="badge">{children}</span>
	),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { errors?: { message: string }[] }) =>
		errors ? <div data-testid="field-error">{errors.map((e) => e.message).join(", ")}</div> : null,
	FieldHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldLabel: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="field-label">{children}</span>
	),
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldCheckboxField: ({
		checked,
		onCheckedChange,
		id,
		title,
	}: {
		checked: boolean;
		onCheckedChange: (v: boolean) => void;
		id: string;
		title?: string;
	}) => (
		<input
			type="checkbox"
			data-testid={`check-${id}`}
			checked={!!checked}
			onChange={(e) => onCheckedChange(e.target.checked)}
			aria-label={title}
		/>
	),
	FieldDimensionInput: ({ id, label, onChange, onBlur }: any) => (
		<input
			data-testid={`dim-${id}`}
			type="number"
			aria-label={label}
			onChange={onChange}
			onBlur={onBlur}
		/>
	),
}));

vi.mock("@repo/ui/components/input-field", () => ({
	InputField: ({ id, label, onChange, onBlur }: any) => (
		<input data-testid={`input-${id}`} aria-label={label} onChange={onChange} onBlur={onBlur} />
	),
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="radio-group">{children}</div>
	),
	RadioGroupBorderedItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
		<label data-testid={`radio-${value}`}>
			<input type="radio" value={value} />
			{children}
		</label>
	),
}));

// IMPORTANT: remove duplicated dog-wrapper test ids
vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isAnyUSRoute: (segments: unknown[]) => mocks.isAnyUSRoute && segments.length > 0,
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: (selector: (state: any) => unknown) =>
		selector({
			flightSelection: {
				request: mocks.hasFlightSelection
					? {
							routes: "NRT,LAX",
						}
					: undefined,
			},
		}),
}));

vi.mock(
	"@/modules/utils/validations/customer-information/service-dog-information/service-dog-information",
	() => ({
		SIZE_ERROR_MSG: "The total size of the cage must be entered within 203cm.",
	})
);

describe("ServiceDogsSection - default state", () => {
	it("renders the section heading", () => {
		renderWithFormAndProviders(<ServiceDogsSection />);
		expect(screen.getByText("section_service_dogs")).toBeTruthy();
	});

	it("renders the service dog checkbox unchecked by default", () => {
		renderWithFormAndProviders(<ServiceDogsSection />);

		const checkbox = screen.getByTestId("check-service-dogs") as HTMLInputElement;

		expect(checkbox.checked).toBe(false);
	});

	it("does not render dog breed input by default", () => {
		renderWithFormAndProviders(<ServiceDogsSection />);

		expect(screen.queryByTestId("input-dog-breed")).toBeFalsy();
	});
});

describe("ServiceDogsSection - when accompaniedByServiceDog is true", () => {
	it("renders dog form fields", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		expect(screen.getByTestId("input-dog-breed")).toBeTruthy();

		expect(screen.getByTestId("dim-dog-weight")).toBeTruthy();
	});

	it("renders dog type radio group", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		expect(screen.getAllByTestId("radio-group")).toHaveLength(2);

		expect(screen.getByTestId("radio-guide-dog")).toBeTruthy();

		expect(screen.getByTestId("radio-assistance-dog")).toBeTruthy();

		expect(screen.getByTestId("radio-hearing-dog")).toBeTruthy();

		expect(screen.getByTestId("radio-psychiatric-service-dog")).toBeTruthy();

		expect(screen.getByTestId("radio-alert-dog")).toBeTruthy();
	});

	it("renders cage presence radio group", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		expect(screen.getByText("label_cage_presence")).toBeTruthy();

		expect(screen.getByTestId("radio-with-cage")).toBeTruthy();

		expect(screen.getByTestId("radio-without-cage")).toBeTruthy();
	});

	it("renders cage required message for psychiatric service dog", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogType: "psychiatric-service-dog",
			},
		});

		expect(screen.getByText("title_service_dog_cage_required")).toBeTruthy();
	});

	it("renders important notes section", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		expect(screen.getByText("service_dog_note_1")).toBeTruthy();

		expect(screen.getByText("service_dog_note_2_us_dot")).toBeTruthy();

		expect(screen.getByText("service_dog_note_3_contact_center")).toBeTruthy();

		expect(screen.getByText("service_dog_note_4_cdc")).toBeTruthy();
	});
});

describe("ServiceDogsSection - cage dimensions", () => {
	it("renders cage dimension inputs when with-cage selected", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogCagePresence: "with-cage",
			},
		});

		expect(screen.getByTestId("dim-cage-height")).toBeTruthy();

		expect(screen.getByTestId("dim-cage-width")).toBeTruthy();

		expect(screen.getByTestId("dim-cage-depth")).toBeTruthy();

		expect(screen.getByTestId("dim-cage-weight")).toBeTruthy();
	});

	it("does not render cage dimensions when without-cage selected", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogCagePresence: "without-cage",
			},
		});

		expect(screen.queryByTestId("dim-cage-height")).toBeFalsy();

		expect(screen.queryByTestId("dim-cage-width")).toBeFalsy();

		expect(screen.queryByTestId("dim-cage-depth")).toBeFalsy();

		expect(screen.queryByTestId("dim-cage-weight")).toBeFalsy();
	});
});

describe("ServiceDogsSection - badges", () => {
	it("renders optional badge", () => {
		renderWithFormAndProviders(<ServiceDogsSection />);

		expect(screen.getAllByTestId("badge")[0]).toBeTruthy();
	});

	it("uses shared service dog field groups", () => {
		expect(SERVICE_DOG_CLEAR_ERRORS_FIELDS).toEqual([
			"serviceDogType",
			"serviceDogBreed",
			"serviceDogWeight",
			"serviceDogCagePresence",
			"serviceDogCageHeight",
			"serviceDogCageWidth",
			"serviceDogCageDepth",
			"serviceDogCageWeight",
		]);
		expect(SERVICE_DOG_CAGE_DIMENSION_FIELDS).toEqual([
			"serviceDogCageHeight",
			"serviceDogCageWidth",
			"serviceDogCageDepth",
			"serviceDogCageWeight",
		]);
	});
});
describe("ServiceDogsSection - coverage", () => {
	it("shows the non-US route notice and disables restricted dog types", () => {
		mocks.isAnyUSRoute = false;

		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogType: "guide-dog",
			},
		});

		expect(screen.getByText("service_dog_us_route_notice")).toBeTruthy();
		expect(screen.getByTestId("radio-psychiatric-service-dog")).toBeTruthy();
		expect(screen.getByTestId("radio-alert-dog")).toBeTruthy();
		mocks.isAnyUSRoute = true;
	});

	it("handles the no-flight-selection branch", () => {
		mocks.hasFlightSelection = false;

		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		expect(screen.getByText("service_dog_us_route_notice")).toBeTruthy();
		mocks.hasFlightSelection = true;
	});

	it("renders psychiatric service dog", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogType: "psychiatric-service-dog",
				serviceDogCagePresence: "without-cage",
			},
		});

		expect(screen.getByTestId("input-dog-breed")).toBeTruthy();
	});

	it("forces cage presence to with-cage for cage-required dog types", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogType: "psychiatric-service-dog",
				serviceDogCagePresence: "without-cage",
			},
		});

		expect(screen.getByText("section_cage_size")).toBeTruthy();
		expect(screen.getByTestId("dim-cage-height")).toBeTruthy();
	});

	it("renders alert dog", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogType: "alert-dog",
				serviceDogCagePresence: "without-cage",
			},
		});

		expect(screen.getByTestId("input-dog-breed")).toBeTruthy();
	});

	it("handles dog breed input", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		fireEvent.change(screen.getByTestId("input-dog-breed"), {
			target: {
				value: "LABRADOR",
			},
		});

		fireEvent.blur(screen.getByTestId("input-dog-breed"));
	});

	it("handles dog weight change", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		fireEvent.change(screen.getByTestId("dim-dog-weight"), {
			target: { value: "25" },
		});
	});

	it("handles cage dimensions", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "40",
				serviceDogCageWidth: "50",
				serviceDogCageDepth: "60",
			},
		});

		fireEvent.change(screen.getByTestId("dim-cage-height"), {
			target: { value: "40" },
		});

		fireEvent.change(screen.getByTestId("dim-cage-width"), {
			target: { value: "50" },
		});

		fireEvent.change(screen.getByTestId("dim-cage-depth"), {
			target: { value: "60" },
		});

		fireEvent.change(screen.getByTestId("dim-cage-weight"), {
			target: { value: "15" },
		});

		fireEvent.blur(screen.getByTestId("dim-cage-height"));
		fireEvent.blur(screen.getByTestId("dim-cage-width"));
		fireEvent.blur(screen.getByTestId("dim-cage-depth"));
		fireEvent.blur(screen.getByTestId("dim-cage-weight"));
	});

	it("triggers a single cage field validation when dimensions are incomplete", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
				serviceDogCagePresence: "with-cage",
				serviceDogCageHeight: "40",
				serviceDogCageWidth: "",
				serviceDogCageDepth: "60",
			},
		});

		fireEvent.change(screen.getByTestId("dim-cage-height"), {
			target: { value: "41" },
		});
	});

	it("handles dog breed blur", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		fireEvent.blur(screen.getByTestId("input-dog-breed"));
	});
	it("handles dog weight blur", () => {
		renderWithFormAndProviders(<ServiceDogsSection />, {
			formValues: {
				accompaniedByServiceDog: true,
			},
		});

		fireEvent.blur(screen.getByTestId("dim-dog-weight"));
	});
});
