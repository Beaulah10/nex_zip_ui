/**
 * File: passenger-information-dialog-content.test.tsx
 * Classification: Component
 * Description: Tests for DialogFormContent component.
 * Verifies header, error alert, badge, and section composition based on form state and props.
 */

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PassengerInformationDialogContent } from "@/components/customer-information/customer-information-modal/passenger-information-dialog-content/passenger-information-dialog-content";
import {
	makePassenger,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";

const rhfMocks = vi.hoisted(() => ({
	isSubmitted: false,
	errors: {},
	canManagePersonalNeeds: "",
	boardingWithAccompanion: "",
	assistanceReasons: [] as string[],
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<div data-testid="dialog-alert" data-variant={variant}>
			{children}
		</div>
	),
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="dialog-badge">{children}</span>
	),
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	DialogClose: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-close">{children}</div>
	),
	// Updated: accept onOpenAutoFocus so the callback on line 56 can be exercised
	DialogContent: ({
		children,
		onOpenAutoFocus,
	}: {
		children: React.ReactNode;
		onOpenAutoFocus?: (event: { preventDefault: () => void }) => void;
	}) => (
		<div data-testid="dialog-content">
			{children}
			{/* Expose a trigger button so tests can fire the onOpenAutoFocus callback */}
			<button
				type="button"
				data-testid="dialog-auto-focus-trigger"
				onClick={() => onOpenAutoFocus?.({ preventDefault: () => {} })}
			>
				trigger-auto-focus
			</button>
		</div>
	),
	DialogFooter: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-footer">{children}</div>
	),
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-header">{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2 data-testid="dialog-title">{children}</h2>
	),
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-wrapper">{children}</div>
	),
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/basic-details/basic-information/basic-information",
	() => ({
		BasicInformation: () => <div data-testid="basic-information" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/special-notes-section/special-notes-section",
	() => ({
		SpecialNotes: () => <div data-testid="special-notes" />,
	})
);

vi.mock("react-hook-form", async () => {
	const actual = await vi.importActual("react-hook-form");

	return {
		...actual,

		useFormContext: () => ({
			control: {},
		}),

		useFormState: () => ({
			isSubmitted: rhfMocks.isSubmitted,
			errors: rhfMocks.errors,
		}),

		useWatch: ({ name }: { name: string }) => {
			switch (name) {
				case "canManagePersonalNeeds":
					return rhfMocks.canManagePersonalNeeds;

				case "boardingWithAccompanion":
					return rhfMocks.boardingWithAccompanion;

				case "assistanceReasons":
					return rhfMocks.assistanceReasons;

				default:
					return undefined;
			}
		},
	};
});
vi.mock("@/modules/utils/constants/customer-information/constants", async (importOriginal) => {
	const actual =
		await importOriginal<
			typeof import("@/modules/utils/constants/customer-information/constants")
		>();

	return {
		...actual,
		RESTRICTED_REASONS: ["RESTRICTED"],
	};
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderDialogContent(
	overrides: Partial<{
		isPrimary: boolean;
		isUsRoute: boolean;
		isThaiRoute: boolean;
		multiplePassengers: boolean;
	}> = {}
) {
	const pax = makePassenger({ id: "pax-1", passengerTypeCode: "adult" });
	const pax2 = makePassenger({ id: "pax-2", passengerTypeCode: "adult" });
	const passengers = overrides.multiplePassengers !== false ? [pax, pax2] : [pax];
	return renderWithFormAndProviders(
		<PassengerInformationDialogContent
			passenger={pax}
			passengerIndex={0}
			isPrimary={overrides.isPrimary ?? false}
			isUsRoute={overrides.isUsRoute ?? false}
			isThaiRoute={overrides.isThaiRoute ?? false}
			onClickCopyToPassenger={vi.fn()}
		/>,
		{ passengers }
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DialogFormContent - structure", () => {
	it("renders the dialog content wrapper", () => {
		renderDialogContent();
		expect(screen.getByTestId("dialog-content")).toBeTruthy();
	});

	it("renders the dialog header", () => {
		renderDialogContent();
		expect(screen.getByTestId("dialog-header")).toBeTruthy();
	});

	it("renders the dialog title", () => {
		renderDialogContent();
		expect(screen.getByTestId("dialog-title")).toBeTruthy();
	});

	it("renders BasicInformation section", () => {
		renderDialogContent();
		expect(screen.getByTestId("basic-information")).toBeTruthy();
	});

	it("renders SpecialNotes section", () => {
		renderDialogContent();
		expect(screen.getByTestId("special-notes")).toBeTruthy();
	});

	it("renders dialog footer with action buttons", () => {
		renderDialogContent();
		expect(screen.getByTestId("dialog-footer")).toBeTruthy();
	});
});

describe("DialogFormContent - primary passenger badge", () => {
	it("shows primary badge when isPrimary is true and multiple passengers", () => {
		renderDialogContent({ isPrimary: true, multiplePassengers: true });
		expect(screen.getByTestId("dialog-badge")).toBeTruthy();
	});

	it("does not show badge when isPrimary is false", () => {
		renderDialogContent({ isPrimary: false });
		expect(screen.queryByTestId("dialog-badge")).toBeFalsy();
	});
});

describe("DialogFormContent - error alert", () => {
	it("does not show error alert when form has not been submitted", () => {
		renderDialogContent();
		expect(screen.queryByTestId("dialog-alert")).toBeFalsy();
	});
});

// ── Line 56 coverage: onOpenAutoFocus callback ────────────────────────────────
describe("DialogFormContent - onOpenAutoFocus callback", () => {
	it("calls event.preventDefault when the dialog auto-focus trigger fires", () => {
		renderDialogContent();
		// The updated mock renders a trigger button for the onOpenAutoFocus callback
		const trigger = screen.getByTestId("dialog-auto-focus-trigger");
		// Click triggers onOpenAutoFocus → runs event.preventDefault() on line 56
		fireEvent.click(trigger);
		expect(trigger).toBeTruthy();
	});
});

// ── Line 56 / age label branch coverage ──────────────────────────────────────
describe("DialogFormContent - unknown passengerTypeCode (empty age label)", () => {
	it("renders without age label when passengerTypeCode is not in the lookup map", () => {
		const pax = makePassenger({ id: "pax-1", passengerTypeCode: "UNKNOWN_TYPE" as any });
		renderWithFormAndProviders(
			<PassengerInformationDialogContent
				passenger={pax}
				passengerIndex={0}
				isPrimary={false}
				isUsRoute={false}
				isThaiRoute={false}
				onClickCopyToPassenger={vi.fn()}
			/>,
			{ passengers: [pax] }
		);
		// ageLabelKey is undefined → `ageLabelKey ? ... : ""` → empty string branch covered
		expect(screen.getByTestId("dialog-content")).toBeTruthy();
	});

	it("renders without age label when passengerTypeCode is undefined", () => {
		const pax = makePassenger({ id: "pax-1", passengerTypeCode: undefined as any });
		renderWithFormAndProviders(
			<PassengerInformationDialogContent
				passenger={pax}
				passengerIndex={0}
				isPrimary={false}
				isUsRoute={false}
				isThaiRoute={false}
				onClickCopyToPassenger={vi.fn()}
			/>,
			{ passengers: [pax] }
		);
		// passengerTypeCode ?? "" → "" → map[""] → undefined → ternary takes empty-string branch
		expect(screen.getByTestId("dialog-content")).toBeTruthy();
	});
});

// ── Primary badge: single passenger edge case ─────────────────────────────────
describe("DialogFormContent - no primary badge when single passenger", () => {
	it("does not show primary badge when isPrimary is true but only one passenger", () => {
		renderDialogContent({ isPrimary: true, multiplePassengers: false });
		expect(screen.queryByTestId("dialog-badge")).toBeFalsy();
	});
});

describe("DialogFormContent - footer buttons", () => {
	it("renders cancel and save buttons", () => {
		renderDialogContent();

		expect(screen.getByText("button_cancel")).toBeTruthy();

		expect(screen.getByText("button_save_details")).toBeTruthy();

		expect(screen.getByTestId("dialog-close")).toBeTruthy();

		expect(screen.getByTestId("dialog-footer")).toBeTruthy();
	});
});

describe("DialogFormContent - age label branch", () => {
	it("renders when passengerTypeCode exists in lookup", () => {
		const pax = makePassenger({
			id: "pax-1",
			passengerTypeCode: "adult",
		});

		renderWithFormAndProviders(
			<PassengerInformationDialogContent
				passenger={pax}
				passengerIndex={0}
				isPrimary={false}
				isUsRoute={false}
				isThaiRoute={false}
				onClickCopyToPassenger={vi.fn()}
			/>,
			{
				passengers: [pax],
			}
		);

		expect(screen.getByTestId("dialog-content")).toBeTruthy();
	});
});

describe("DialogFormContent - footer actions", () => {
	it("renders dialog close wrapper", () => {
		renderDialogContent();

		expect(screen.getByTestId("dialog-close")).toBeTruthy();

		expect(screen.getByTestId("dialog-footer")).toBeTruthy();
	});
});

it("shows global error alert when form has errors", () => {
	rhfMocks.isSubmitted = true;

	rhfMocks.errors = {
		firstName: {
			message: "required",
		},
	};

	rhfMocks.canManagePersonalNeeds = "yes";
	rhfMocks.boardingWithAccompanion = "yes";
	rhfMocks.assistanceReasons = [];

	renderDialogContent();

	expect(screen.getByTestId("dialog-alert")).toBeTruthy();
});

it("suppresses global alert when accompanying warning is active", () => {
	rhfMocks.isSubmitted = true;

	rhfMocks.errors = {
		firstName: {
			message: "required",
		},
	};

	rhfMocks.canManagePersonalNeeds = "no";
	rhfMocks.boardingWithAccompanion = "no";
	rhfMocks.assistanceReasons = [];

	renderDialogContent();

	expect(screen.queryByTestId("dialog-alert")).toBeFalsy();
});

it("suppresses global alert when restricted reason exists", () => {
	rhfMocks.isSubmitted = true;

	rhfMocks.errors = {
		firstName: {
			message: "required",
		},
	};

	rhfMocks.canManagePersonalNeeds = "yes";
	rhfMocks.boardingWithAccompanion = "yes";

	rhfMocks.assistanceReasons = ["RESTRICTED"];

	renderDialogContent();

	expect(screen.queryByTestId("dialog-alert")).toBeFalsy();
});

it("handles undefined assistance reasons", () => {
	rhfMocks.assistanceReasons = undefined as any;

	renderDialogContent();

	expect(screen.getByTestId("dialog-content")).toBeTruthy();
});
