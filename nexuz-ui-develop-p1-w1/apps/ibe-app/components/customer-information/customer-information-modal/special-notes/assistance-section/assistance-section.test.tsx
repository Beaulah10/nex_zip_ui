/**
 * File: assistance-section.test.tsx
 * Description: Tests for the AssistanceSection component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { AssistanceSection } from "@/components/customer-information/customer-information-modal/special-notes/assistance-section/assistance-section";
import { ASSISTANCE_CATEGORIES } from "@/modules/utils/constants/customer-information/constants";
import { makeTestStore } from "@/modules/utils/helpers/customer-information/test-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: ReactNode }) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldCheckboxField: ({
		checked,
		onCheckedChange,
		id,
		title,
	}: {
		checked: boolean;
		onCheckedChange: (value: boolean) => void;
		id: string;
		title?: string;
	}) => (
		<input
			type="checkbox"
			data-testid={`check-${id}`}
			checked={!!checked}
			aria-label={title}
			onChange={(event) => onCheckedChange(event.target.checked)}
		/>
	),
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/assistance-section/requesting-assistance/requesting-assistance",
	() => ({
		RequestingAssistance: () => (
			<div data-testid="requesting-assistance">requesting-assistance-content</div>
		),
	})
);

function renderAssistanceSection(formValues: Partial<PassengerInformation> = {}) {
	const store = makeTestStore();

	function Wrapper({ children }: { children: ReactNode }) {
		const methods = useForm<PassengerInformation>({
			defaultValues: {
				requestingAssistance: false,
				...formValues,
			},
		});

		return (
			<Provider store={store}>
				<FormProvider {...methods}>{children}</FormProvider>
			</Provider>
		);
	}

	return render(<AssistanceSection />, { wrapper: Wrapper });
}

describe("AssistanceSection", () => {
	it("renders heading, description, badge and assistance category list", () => {
		renderAssistanceSection();

		const firstCategory = ASSISTANCE_CATEGORIES.at(0);
		const thirdCategory = ASSISTANCE_CATEGORIES.at(2);

		if (!firstCategory || !thirdCategory) {
			throw new Error("Missing shared assistance categories");
		}

		expect(screen.getByText("section_customers_needing_assistance")).toBeTruthy();
		expect(screen.getByText("assistance_description")).toBeTruthy();
		expect(screen.getByText("badge_optional")).toBeTruthy();
		expect(screen.getByText(firstCategory)).toBeTruthy();
		expect(screen.getByText(thirdCategory)).toBeTruthy();
	});

	it("renders requesting assistance checkbox as unchecked by default", () => {
		renderAssistanceSection();

		const checkbox = screen.getByTestId("check-requesting-assistance") as HTMLInputElement;

		expect(checkbox.checked).toBe(false);
		expect(screen.queryByTestId("requesting-assistance")).toBeFalsy();
	});

	it("renders RequestingAssistance when requestingAssistance is true from form values", () => {
		renderAssistanceSection({
			requestingAssistance: true,
		});

		expect(screen.getByTestId("requesting-assistance")).toBeTruthy();
	});

	it("renders RequestingAssistance after checkbox toggle", () => {
		renderAssistanceSection();

		fireEvent.click(screen.getByTestId("check-requesting-assistance"));

		expect(screen.getByTestId("requesting-assistance")).toBeTruthy();
	});
});
