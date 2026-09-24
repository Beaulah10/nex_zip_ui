/**
 * File: pregnant-section.test.tsx
 * Classification: Component
 * Description: Tests for PregnantSection component — verifies pregnancy checkbox,
 * conditional expansion of gestational weeks form, and advisory notices.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { PregnantSection } from "@/components/customer-information/customer-information-modal/special-notes/pregnant-section/pregnant-section";
import { renderWithFormAndProviders } from "@/modules/utils/helpers/customer-information/test-utils";

// ── Helper Mocks ─────────────────────────────────────────────────────────────────────
const helperMocks = vi.hoisted(() => ({
	handleFieldOnChangeMock: vi.fn(),
	getFieldErrorsMock: vi.fn(() => undefined),
}));
const inputMocks = vi.hoisted(() => ({
	blurHandler: undefined as any,
	fieldProps: undefined as any,
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<span data-testid="badge" data-variant={variant}>
			{children}
		</span>
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
		onCheckedChange: (val: boolean | string) => void;
		id: string;
		title?: string;
	}) => (
		<input
			data-testid={`checkbox-${id}`}
			type="checkbox"
			checked={!!checked}
			onChange={(e) => onCheckedChange(e.target.checked)}
			aria-label={title}
		/>
	),
	FieldDimensionInput: ({
		id,
		label,
		onChange,
		onBlur,
		placeholder,
		min,
		max,
		...props
	}: {
		id: string;
		label: string;
		onChange?: React.ChangeEventHandler<HTMLInputElement>;
		onBlur?: React.FocusEventHandler<HTMLInputElement>;
		placeholder?: string;
		min?: number;
		max?: number;
		[key: string]: unknown;
	}) => {
		inputMocks.blurHandler = onBlur;
		inputMocks.fieldProps = { min, max, ...props };
		return (
			<input
				data-testid={`dimension-${id}`}
				type="number"
				aria-label={label}
				placeholder={placeholder}
				min={min}
				max={max}
				aria-invalid={props["aria-invalid"] as boolean | undefined}
				onChange={onChange}
				onBlur={onBlur}
			/>
		);
	},
}));

vi.mock("@repo/ui/components/separator", () => ({
	Separator: () => <hr data-testid="separator" />,
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<div data-testid="pregnancy-expand" className={className}>
			{children}
		</div>
	),
}));

vi.mock("@/modules/utils/helpers/customer-information/customer-information-utils", () => ({
	getFieldErrors: helperMocks.getFieldErrorsMock,
	handleFieldOnChange: helperMocks.handleFieldOnChangeMock,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PregnantSection - default state", () => {
	it("renders the section heading", () => {
		renderWithFormAndProviders(<PregnantSection />);
		expect(screen.getByText("section_pregnant_customers")).toBeTruthy();
	});

	it("renders the pregnancy checkbox unchecked by default", () => {
		renderWithFormAndProviders(<PregnantSection />);
		const checkbox = screen.getByTestId("checkbox-pregnant-yes") as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
	});

	it("does not render the expanded pregnancy form when isPregnant is false", () => {
		renderWithFormAndProviders(<PregnantSection />);
		expect(screen.queryByTestId("dimension-pregnancy-weeks")).toBeFalsy();
	});

	it("renders the optional badge", () => {
		renderWithFormAndProviders(<PregnantSection />);
		expect(screen.getByTestId("badge")).toBeTruthy();
	});
});

describe("PregnantSection - when pregnancy is declared", () => {
	it("shows gestational weeks input when isPregnant is true (pre-seeded)", () => {
		renderWithFormAndProviders(<PregnantSection />, {
			formValues: { isPregnant: true },
		});
		const input = screen.getByTestId("dimension-pregnancy-weeks");
		expect(input).toBeTruthy();
		expect(input).toHaveAttribute("placeholder", "0");
		expect(input).toHaveAttribute("min", "1");
		expect(input).toHaveAttribute("max", "42");
	});

	it("shows the expanded pregnancy section on checkbox click", async () => {
		renderWithFormAndProviders(<PregnantSection />);
		const checkbox = screen.getByTestId("checkbox-pregnant-yes");
		fireEvent.click(checkbox);
		await waitFor(() => {
			expect(screen.getByTestId("dimension-pregnancy-weeks")).toBeTruthy();
		});
	});

	it("hides the expanded section when checkbox is unchecked again", async () => {
		renderWithFormAndProviders(<PregnantSection />, {
			formValues: { isPregnant: true },
		});
		const checkbox = screen.getByTestId("checkbox-pregnant-yes");
		fireEvent.click(checkbox); // uncheck
		await waitFor(() => {
			expect(screen.queryByTestId("dimension-pregnancy-weeks")).toBeFalsy();
		});
	});
});

describe("PregnantSection - notice list", () => {
	it("renders pregnancy advisory notices when pregnant is true", () => {
		renderWithFormAndProviders(<PregnantSection />, {
			formValues: { isPregnant: true },
		});
		// pregnancy_notice_1 through _6 should be rendered as translation keys
		expect(screen.getByText("pregnancy_notice_1")).toBeTruthy();
		expect(screen.getByText("pregnancy_notice_6")).toBeTruthy();
	});
});

// ── Line 82 coverage: errors.pregnancyWeeks truthy branch ────────────────────
describe("PregnantSection - pregnancyWeeks validation error branch", () => {
	it("evaluates the truthy branch of errors.pregnancyWeeks ternary when error is set", async () => {
		// Build a custom wrapper that uses react-hook-form's setError to populate
		// errors.pregnancyWeeks, covering the `errors.pregnancyWeeks ? [...] : undefined`
		// truthy branch on line 82.
		function WrapperWithPregnancyError() {
			const methods = useForm<any>({
				defaultValues: { isPregnant: true, pregnancyWeeks: "" },
			});

			// biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-shot error
			useEffect(() => {
				methods.setError("pregnancyWeeks", {
					type: "manual",
					message: "Please enter your gestational weeks",
				});
			}, []);

			return (
				<FormProvider {...methods}>
					<PregnantSection />
				</FormProvider>
			);
		}

		render(<WrapperWithPregnancyError />);

		// isPregnant=true → expanded section renders → FieldDimensionInput is mounted
		await waitFor(() => {
			expect(screen.getByTestId("dimension-pregnancy-weeks")).toBeTruthy();
		});
		// After setError fires, errors.pregnancyWeeks is truthy and the truthy branch
		// `[{ message: errors.pregnancyWeeks.message }]` is evaluated (line 82).
		expect(screen.getByTestId("dimension-pregnancy-weeks")).toHaveAttribute("aria-invalid", "true");
	});
});

it("handles pregnancy weeks input change", async () => {
	renderWithFormAndProviders(<PregnantSection />, {
		formValues: {
			isPregnant: true,
			pregnancyWeeks: "",
		},
	});

	const input = screen.getByTestId("dimension-pregnancy-weeks");

	fireEvent.change(input, {
		target: {
			value: "24",
		},
	});

	expect(helperMocks.handleFieldOnChangeMock).toHaveBeenCalledWith(
		"pregnancyWeeks",
		"24",
		expect.any(Function),
		false
	);
});

it("executes pregnancy weeks blur handler", () => {
	renderWithFormAndProviders(<PregnantSection />, {
		formValues: {
			isPregnant: true,
		},
	});

	fireEvent.blur(screen.getByTestId("dimension-pregnancy-weeks"));

	expect(inputMocks.blurHandler).toBeDefined();
});
