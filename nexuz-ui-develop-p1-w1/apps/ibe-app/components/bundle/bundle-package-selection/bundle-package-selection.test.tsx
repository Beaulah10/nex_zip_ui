import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BundlePackageSelection from "./bundle-package-selection";

const useBundlePackageSelectionMock = vi.hoisted(() => vi.fn());
const BundlePackageSelectionAlertsMock = vi.hoisted(() =>
	vi.fn(() => <div data-testid="alerts" />)
);
const BundleOfferOverviewMock = vi.hoisted(() => vi.fn(() => <div data-testid="overview" />));
const PassengerBundleSelectionMock = vi.hoisted(() =>
	vi.fn(() => <div data-testid="passenger-selection" />)
);

vi.mock("@/modules/hooks/bundle/use-bundle-package-selection/use-bundle-package-selection", () => ({
	useBundlePackageSelection: useBundlePackageSelectionMock,
}));

vi.mock(
	"@/components/bundle/bundle-package-selection/bundle-package-selection-alerts/bundle-package-selection-alerts",
	() => ({
		default: BundlePackageSelectionAlertsMock,
	})
);

vi.mock(
	"@/components/bundle/bundle-package-selection/bundle-offer-overview/bundle-offer-overview",
	() => ({
		default: BundleOfferOverviewMock,
	})
);

vi.mock(
	"@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-selection",
	() => ({
		default: PassengerBundleSelectionMock,
	})
);

describe("BundlePackageSelection", () => {
	it("renders selection sections with hook output", () => {
		useBundlePackageSelectionMock.mockReturnValue({
			alertProps: { alert: "alerts" },
			offerOverviewProps: { overview: "overview" },
			passengerSelectionProps: { passengers: "passengers" },
		});

		render(
			<BundlePackageSelection locale="en" direction="inbound" isICNRoute onProceed={vi.fn()} />
		);

		expect(screen.getByTestId("alerts")).toBeInTheDocument();
		expect(screen.getByTestId("overview")).toBeInTheDocument();
		expect(screen.getByTestId("passenger-selection")).toBeInTheDocument();
		expect(useBundlePackageSelectionMock).toHaveBeenCalledWith({
			locale: "en",
			direction: "inbound",
			isICNRoute: true,
			onProceed: expect.any(Function),
		});
		expect(BundlePackageSelectionAlertsMock).toHaveBeenCalledWith(
			expect.objectContaining({ alert: "alerts" }),
			undefined
		);
		expect(BundleOfferOverviewMock).toHaveBeenCalledWith(
			expect.objectContaining({ overview: "overview" }),
			undefined
		);
		expect(PassengerBundleSelectionMock).toHaveBeenCalledWith(
			expect.objectContaining({ passengers: "passengers" }),
			undefined
		);
	});
});
