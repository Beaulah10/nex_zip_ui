/**
 * File: passenger-list.test.tsx
 * Classification: Component
 * Description: Tests for PassengerList component — verifies correct rendering
 * of passenger cards and empty state handling.
 */

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PassengerList } from "@/components/customer-information/passenger-details/passenger-list/passenger-list";
import {
	makePassenger,
	renderWithProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock(
	"@/components/customer-information/passenger-details/passenger-card/passenger-card",
	() => ({
		PassengerCard: ({
			passenger,
			passengerIndex,
		}: {
			passenger: { id: string };
			passengerIndex: number;
		}) => <div data-testid={`passenger-card-${passengerIndex}`} data-id={passenger.id} />,
	})
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PassengerList", () => {
	it("renders no cards when passenger list is empty", () => {
		renderWithProviders(<PassengerList />, { passengers: [] });

		expect(screen.queryByTestId(/passenger-card/)).toBeNull();
	});

	it("renders one card for a single passenger", () => {
		renderWithProviders(<PassengerList />, {
			passengers: [makePassenger({ id: "pax-1" })],
		});

		expect(screen.getByTestId("passenger-card-0")).toBeTruthy();
	});

	it("renders multiple cards for multiple passengers", () => {
		renderWithProviders(<PassengerList />, {
			passengers: [
				makePassenger({ id: "pax-1" }),
				makePassenger({ id: "pax-2" }),
				makePassenger({ id: "pax-3" }),
			],
		});

		expect(screen.getByTestId("passenger-card-0")).toBeTruthy();
		expect(screen.getByTestId("passenger-card-1")).toBeTruthy();
		expect(screen.getByTestId("passenger-card-2")).toBeTruthy();
	});

	it("passes the correct passenger index to each card", () => {
		const passengers = [makePassenger({ id: "pax-1" }), makePassenger({ id: "pax-2" })];

		renderWithProviders(<PassengerList />, { passengers });

		expect(screen.getByTestId("passenger-card-0").getAttribute("data-id")).toBe("pax-1");

		expect(screen.getByTestId("passenger-card-1").getAttribute("data-id")).toBe("pax-2");
	});

	it("renders the outer passenger-list container", () => {
		const { container } = renderWithProviders(<PassengerList />, {
			passengers: [makePassenger()],
		});

		expect(container.querySelector(".passenger-list")).not.toBeNull();
	});
});
