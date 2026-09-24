/**
 * File: customer-information.test.tsx
 * Classification: Component (Page)
 * Description: Tests for the main CustomerInformation page component.
 * Covers page rendering, error alert, agreement checkbox, and proceed button behaviour.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomerInformation from "@/components/customer-information/customer-information";
import {
	makePassenger,
	makeTestStore,
} from "@/modules/utils/helpers/customer-information/test-utils";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: () => (key: string) => key,
}));

const { mockRouterPush } = vi.hoisted(() => ({
	mockRouterPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockRouterPush,
	}),
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<div data-testid="alert" data-variant={variant}>
			{children}
		</div>
	),
	AlertTitle: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="alert-title">{children}</div>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick} data-testid="button">
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div data-testid="field">{children}</div>,
	FieldError: ({ errors }: { errors?: { message: string }[] }) =>
		errors ? <div data-testid="field-error">{errors.map((e) => e.message).join(", ")}</div> : null,
}));

vi.mock("@repo/ui/components/field-inputs", () => ({
	FieldCheckboxField: ({
		checked,
		onCheckedChange,
		title,
		id,
	}: {
		checked: boolean;
		onCheckedChange: (val: boolean) => void;
		title: string;
		id: string;
	}) => (
		<input
			data-testid={`checkbox-${id}`}
			type="checkbox"
			checked={checked}
			onChange={(e) => onCheckedChange(e.target.checked)}
			aria-label={title}
		/>
	),
}));

vi.mock("@repo/ui/components/separator", () => ({
	Separator: () => <hr data-testid="separator" />,
}));

// Mock the PassengerList child to isolate the page component
vi.mock(
	"@/components/customer-information/passenger-details/passenger-list/passenger-list",
	() => ({
		PassengerList: () => <div data-testid="passenger-list" />,
	})
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPage(passengers = [makePassenger({ id: "pax-1" })]) {
	const store = makeTestStore(passengers);
	return render(
		<Provider store={store}>
			<CustomerInformation />
		</Provider>
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CustomerInformation - page load", () => {
	it("renders the passenger list", () => {
		renderPage();
		expect(screen.getByTestId("passenger-list")).toBeTruthy();
	});

	it("renders the agreement checkbox", () => {
		renderPage();
		expect(screen.getByTestId("checkbox-confirm-terms")).toBeTruthy();
	});

	it("renders the proceed button", () => {
		renderPage();
		expect(screen.getByTestId("button")).toBeTruthy();
	});

	it("does not show error alert on initial render", () => {
		renderPage();
		expect(screen.queryByTestId("alert")).toBeFalsy();
	});

	it("renders the separator in precautions section", () => {
		renderPage();
		expect(screen.getByTestId("separator")).toBeTruthy();
	});
});

describe("CustomerInformation - proceed with incomplete passenger", () => {
	beforeEach(() => {
		// Passenger is not completed
		renderPage([makePassenger({ id: "pax-1", isCompleted: false })]);
	});

	it("shows error alert when proceed clicked without checking checkbox", () => {
		fireEvent.click(screen.getByTestId("button"));
		expect(screen.getByTestId("alert")).toBeTruthy();
	});

	it("shows field error when checkbox is unchecked and proceed clicked", () => {
		fireEvent.click(screen.getByTestId("button"));
		expect(screen.getByTestId("field-error")).toBeTruthy();
	});

	it("shows error alert when proceed clicked even if checkbox is checked", () => {
		fireEvent.click(screen.getByTestId("checkbox-confirm-terms"));
		fireEvent.click(screen.getByTestId("button"));
		expect(screen.getByTestId("alert")).toBeTruthy();
	});
});

describe("CustomerInformation - proceed with all complete and unchecked", () => {
	it("shows only the checkbox field error when passengers are complete and checkbox is unchecked", () => {
		renderPage([makePassenger({ id: "pax-1", isCompleted: true })]);
		fireEvent.click(screen.getByTestId("button"));
		expect(screen.queryByTestId("alert")).toBeFalsy();
		expect(screen.getByTestId("field-error")).toBeTruthy();
	});
});

describe("CustomerInformation - checkbox behaviour", () => {
	it("toggles the checkbox when clicked", () => {
		renderPage([makePassenger({ isCompleted: true })]);
		const checkbox = screen.getByTestId("checkbox-confirm-terms") as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
		fireEvent.click(checkbox);
		expect(checkbox.checked).toBe(true);
	});

	it("clears error alert when all passengers become complete", () => {
		// Render with an incomplete passenger (triggers error on click)
		const store = makeTestStore([makePassenger({ id: "pax-1", isCompleted: false })]);
		const { rerender } = render(
			<Provider store={store}>
				<CustomerInformation />
			</Provider>
		);
		fireEvent.click(screen.getByTestId("button"));
		expect(screen.getByTestId("alert")).toBeTruthy();

		// Now rerender with all passengers completed
		const completedStore = makeTestStore([makePassenger({ id: "pax-1", isCompleted: true })]);
		rerender(
			<Provider store={completedStore}>
				<CustomerInformation />
			</Provider>
		);
		// After all passengers complete, error alert should be cleared
		expect(screen.queryByTestId("alert")).toBeFalsy();
	});
});

describe("CustomerInformation - no field error when checkbox is checked and not submitted", () => {
	it("does not show field-error before any click", () => {
		renderPage([makePassenger({ isCompleted: true })]);
		expect(screen.queryByTestId("field-error")).toBeFalsy();
	});
});

// ── Line 32 coverage: confirmed && !hasIncomplete true-branch ─────────────────
describe("CustomerInformation - successful proceed (confirmed + complete)", () => {
	it("does not show error alert when checkbox is checked and all passengers are complete", () => {
		// Render with a fully-completed passenger so hasIncomplete === false
		renderPage([makePassenger({ id: "pax-1", isCompleted: true })]);

		// Check the confirmation checkbox → confirmed = true
		fireEvent.click(screen.getByTestId("checkbox-confirm-terms"));

		// Click proceed: confirmed=true, hasIncomplete=false → setErrorAlert(false) taken
		fireEvent.click(screen.getByTestId("button"));

		// No error alert should appear
		expect(screen.queryByTestId("alert")).toBeFalsy();
		expect(mockRouterPush).toHaveBeenCalledTimes(1);
		expect(mockRouterPush).toHaveBeenCalledWith("/en/confirmation");
	});

	it("does not show field-error when checkbox is checked and passengers are complete on proceed", () => {
		renderPage([makePassenger({ id: "pax-1", isCompleted: true })]);

		fireEvent.click(screen.getByTestId("checkbox-confirm-terms"));
		fireEvent.click(screen.getByTestId("button"));

		expect(screen.queryByTestId("field-error")).toBeFalsy();
	});
});
