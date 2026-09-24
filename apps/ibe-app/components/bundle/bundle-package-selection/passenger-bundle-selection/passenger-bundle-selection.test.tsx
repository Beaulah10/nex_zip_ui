import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BundleId, BundleOption, PassengerEntry } from "@/types/bundle/bundle.types";
import PassengerBundleSelection from "./passenger-bundle-selection";

const useTranslationsMock = vi.hoisted(() => vi.fn());

const PassengerBundleTableMock = vi.hoisted(() =>
	vi.fn((props: Record<string, unknown>) => {
		const isBundleDisabled = props.isBundleDisabled as
			| ((bundleId: BundleId) => boolean)
			| undefined;

		const disabledStates = [isBundleDisabled?.("FLBF"), isBundleDisabled?.("VALB")].join(",");

		return (
			<div
				data-testid="passenger-bundle-table"
				data-collapsed={String(Boolean(props.isCollapsed))}
				data-first-unavailable={String(Boolean(props.firstEntryUnavailable))}
				data-disabled-states={disabledStates}
				data-default-disabled={String(Boolean(isBundleDisabled?.("PREM")))}
			/>
		);
	})
);

const BookingFooterMock = vi.hoisted(() => vi.fn(() => <div data-testid="booking-footer" />));

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock(
	"@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-table/passenger-bundle-table",
	() => ({
		default: PassengerBundleTableMock,
	})
);

vi.mock("@/components/common/booking-footer/booking-footer", () => ({
	BookingFooter: BookingFooterMock,
}));

beforeEach(() => {
	useTranslationsMock.mockReturnValue((key: string, values?: Record<string, string>) => {
		if (key === "bundle_selection_title") return `Title ${values?.stageLabel ?? ""}`.trim();
		return key;
	});
});

describe("PassengerBundleSelection", () => {
	it("forwards props and computes total amount", () => {
		const passengers: PassengerEntry[] = [
			{ kind: "passenger", id: "p1", name: "Passenger 1", icon: "person" },
			{ kind: "passenger", id: "p2", name: "Passenger 2", icon: "person" },
		];
		const bundles: BundleOption[] = [
			{ id: "NOBN", name: "No Bundle", description: "None" },
			{ id: "FLBF", name: "Flex Biz", description: "Flex", price: 120 },
			{ id: "FLBS", name: "Flex Biz Plus", description: "Flex plus", price: 80 },
			{ id: "VALB", name: "Value", description: "Value", price: 60 },
		];
		const selection: Record<string, BundleId | null> = {
			p1: "FLBF",
			p2: "FLBS",
		};

		render(
			<PassengerBundleSelection
				stageLabel="outbound"
				passengers={passengers}
				bundles={bundles}
				applyToAll
				onApplyToAllChange={vi.fn()}
				selection={selection}
				onSelectionChange={vi.fn()}
				onLimitedBundleAttempt={vi.fn()}
				limitedCollapsedBundleIds={[]}
				bundleCapacities={
					new Map<BundleId, number>([
						["FLBF", 1],
						["FLBS", 3],
						["VALB", 2],
					])
				}
				isBundleDisabled={(bundleId) => bundleId === "VALB"}
				onProceed={vi.fn()}
			/>
		);

		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute("data-collapsed", "false");
		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute(
			"data-first-unavailable",
			"false"
		);
		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute(
			"data-disabled-states",
			"false,true"
		);
		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute(
			"data-default-disabled",
			"false"
		);
		expect(screen.getByTestId("booking-footer")).toBeInTheDocument();
		expect(BookingFooterMock).toHaveBeenCalledWith(
			expect.objectContaining({ amountValue: 200 }),
			undefined
		);
		expect(PassengerBundleTableMock).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Title outbound",
				passengers,
				bundles,
				applyToAll: true,
				selection,
				purchaseDeadlineExceeded: false,
				bundleCapacities: new Map<BundleId, number>([
					["FLBF", 1],
					["FLBS", 3],
					["VALB", 2],
				]),
				validationMessage: null,
				invalidPassengerIds: undefined,
			}),
			undefined
		);
	});

	it("uses default optional props when omitted", () => {
		render(
			<PassengerBundleSelection
				stageLabel="inbound"
				passengers={[]}
				bundles={[{ id: "NOBN", name: "No Bundle", description: "None" }]}
				applyToAll={false}
				onApplyToAllChange={vi.fn()}
				selection={{}}
				onSelectionChange={vi.fn()}
				onLimitedBundleAttempt={vi.fn()}
				limitedCollapsedBundleIds={[]}
				onProceed={vi.fn()}
			/>
		);

		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute("data-collapsed", "false");
		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute(
			"data-first-unavailable",
			"false"
		);
		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute(
			"data-disabled-states",
			"false,false"
		);
		expect(screen.getByTestId("passenger-bundle-table")).toHaveAttribute(
			"data-default-disabled",
			"false"
		);
	});
});
