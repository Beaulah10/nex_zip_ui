/**
 * File: passenger-card.test.tsx
 * Classification: Component
 * Description — verifies passenger info display,
 * completion status, primary badge visibility, and dialog trigger rendering.
 */

import { cleanup, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	makePassenger,
	renderWithProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";

const selectorMocks = vi.hoisted(() => ({
	hasMultiplePassengers: vi.fn(),
	primaryPassengerId: vi.fn(),
}));

const passengerDialogMock = vi.hoisted(() => ({
	PassengerInformationDialog: ({
		passenger,
		passengerIndex,
		isPrimary,
	}: {
		passenger: { id: string };
		passengerIndex: number;
		isPrimary: boolean;
	}) => (
		<button
			type="button"
			data-testid="passenger-dialog-trigger"
			data-id={passenger.id}
			data-index={passengerIndex}
			data-primary={String(isPrimary)}
		>
			Add/Edit Info
		</button>
	),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, className }: { children: ReactNode; className?: string }) => (
		<span data-testid="badge" className={className}>
			{children}
		</span>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/wrapper", () => ({
	Wrapper: ({ children, className }: { children: ReactNode; className?: string }) => (
		<div data-testid="wrapper" className={className}>
			{children}
		</div>
	),
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: (selector: () => unknown) => selector(),
}));

vi.mock("@/store/slices/customer-information/passenger-selector/passenger-selector", () => ({
	selectHasMultiplePassengers: selectorMocks.hasMultiplePassengers,
}));

vi.mock("@/modules/hooks/common/primary-passenger/primary-passenger", () => ({
	usePrimaryPassenger: () => ({
		primaryPassenger: undefined,
		primaryPassengerId: selectorMocks.primaryPassengerId(),
	}),
}));

vi.mock(
	"@/components/customer-information/customer-information-modal/passenger-info-dialog/passenger-information-dialog",
	() => passengerDialogMock
);

vi.mock(
	"@/components/customer-information/customer-information-modal/passenger-info-dialog/passenger-info-dialog",
	() => passengerDialogMock
);

vi.mock(
	"@/components/customer-information/customer-information-modal/passenger-information-dialog/passenger-information-dialog",
	() => passengerDialogMock
);

import { PassengerCard } from "@/components/customer-information/passenger-details/passenger-card/passenger-card";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("PassengerCard - basic rendering", () => {
	beforeEach(() => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(false);
		selectorMocks.primaryPassengerId.mockReturnValue("pax-1");
	});

	it("renders the passenger's first and last name", () => {
		const pax = makePassenger({ id: "pax-1", firstName: "JOHN", lastName: "SMITH" });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={0} />, {
			passengers: [pax],
		});

		expect(screen.getByText(/JOHN/)).toBeTruthy();
		expect(screen.getByText(/SMITH/)).toBeTruthy();
	});

	it("renders the 1-based passenger number", () => {
		const pax = makePassenger({ id: "pax-1" });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={2} />, {
			passengers: [pax],
		});

		expect(screen.getByText("3")).toBeTruthy();
	});

	it("renders the dialog trigger button", () => {
		const pax = makePassenger({ id: "pax-1" });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={0} />, {
			passengers: [pax],
		});

		expect(screen.getByTestId("passenger-dialog-trigger")).toBeTruthy();
	});
});

describe("PassengerCard - completion status", () => {
	beforeEach(() => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(false);
		selectorMocks.primaryPassengerId.mockReturnValue("pax-1");
	});

	it("shows check_circle icon when passenger is completed", () => {
		const pax = makePassenger({ id: "pax-1", isCompleted: true });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={0} />, {
			passengers: [pax],
		});

		expect(screen.getByTestId("icon-check_circle")).toBeTruthy();
	});

	it("does not show check_circle icon when passenger is not completed", () => {
		const pax = makePassenger({ id: "pax-1", isCompleted: false });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={0} />, {
			passengers: [pax],
		});

		expect(screen.queryByTestId("icon-check_circle")).toBeNull();
	});
});

describe("PassengerCard - primary badge", () => {
	beforeEach(() => {
		selectorMocks.primaryPassengerId.mockReturnValue("pax-1");
	});

	it("shows primary badge when passenger is primary and there are multiple passengers", () => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(true);

		const pax1 = makePassenger({ id: "pax-1", passengerTypeCode: "adult" });
		const pax2 = makePassenger({ id: "pax-2", passengerTypeCode: "adult" });

		renderWithProviders(<PassengerCard passenger={pax1} passengerIndex={0} />, {
			passengers: [pax1, pax2],
		});

		expect(screen.getByTestId("badge")).toBeTruthy();
	});

	it("does not show primary badge when there is only one passenger", () => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(false);

		const pax = makePassenger({ id: "pax-1", passengerTypeCode: "adult" });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={0} />, {
			passengers: [pax],
		});

		expect(screen.queryByTestId("badge")).toBeNull();
	});

	it("does not show primary badge for non-primary passenger with multiple passengers", () => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(true);

		const pax1 = makePassenger({ id: "pax-1", passengerTypeCode: "adult" });
		const pax2 = makePassenger({ id: "pax-2", passengerTypeCode: "adult" });

		renderWithProviders(<PassengerCard passenger={pax2} passengerIndex={1} />, {
			passengers: [pax1, pax2],
		});

		expect(screen.queryByTestId("badge")).toBeNull();
	});
});

describe("PassengerCard - wrapper container", () => {
	beforeEach(() => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(false);
		selectorMocks.primaryPassengerId.mockReturnValue("pax-1");
	});

	it("renders the passenger-card wrapper", () => {
		const pax = makePassenger({ id: "pax-1" });

		const { container } = renderWithProviders(
			<PassengerCard passenger={pax} passengerIndex={0} />,
			{ passengers: [pax] }
		);

		expect(container.querySelector(".passenger-card")).not.toBeNull();
	});
});

describe("PassengerCard - unknown passengerTypeCode", () => {
	beforeEach(() => {
		selectorMocks.hasMultiplePassengers.mockReturnValue(false);
		selectorMocks.primaryPassengerId.mockReturnValue("pax-1");
	});

	it("renders the card when passengerTypeCode is not in the lookup map", () => {
		const pax = makePassenger({
			id: "pax-1",
			passengerTypeCode: "UNKNOWN" as never,
		});

		const { container } = renderWithProviders(
			<PassengerCard passenger={pax} passengerIndex={0} />,
			{
				passengers: [pax],
			}
		);

		expect(container.querySelector(".passenger-card")).not.toBeNull();
	});

	it("renders the card when passengerTypeCode is undefined", () => {
		const pax = makePassenger({
			id: "pax-1",
			passengerTypeCode: undefined as never,
		});

		const { container } = renderWithProviders(
			<PassengerCard passenger={pax} passengerIndex={0} />,
			{
				passengers: [pax],
			}
		);

		expect(container.querySelector(".passenger-card")).not.toBeNull();
	});

	it("does not show check_circle icon when isCompleted is undefined", () => {
		const pax = makePassenger({ id: "pax-1", isCompleted: undefined as never });

		renderWithProviders(<PassengerCard passenger={pax} passengerIndex={0} />, {
			passengers: [pax],
		});

		expect(screen.queryByTestId("icon-check_circle")).toBeNull();
	});
});
