import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleId } from "@/types/bundle/bundle.types";
import BundlePackageSelectionAlerts from "./bundle-package-selection-alerts";

const useTranslationsMock = vi.hoisted(() => vi.fn());
const FLEX_BIZ_BUNDLE_IDS: [BundleId, BundleId] = ["FLBF", "FLBS"];
const testBundle = { id: FLEX_BIZ_BUNDLE_IDS[0], name: "Bundle one", description: "Bundle one" };

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
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
	AlertDescription: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="alert-description">{children}</div>
	),
}));

beforeEach(() => {
	useTranslationsMock.mockReturnValue((key: string, values?: Record<string, string | number>) => {
		const translations: Record<string, string> = {
			alerts_no_bundles_available_title: `No bundles for ${values?.stageLabel ?? ""}`.trim(),
			alerts_no_bundles_available_description: "No bundles description",
			alerts_deadline_title: `Deadline for ${values?.stageLabel ?? ""}`.trim(),
			alerts_deadline_description: `Deadline ${values?.bundleDeadlineHours ?? ""}`.trim(),
			alerts_out_of_stock_title: "Out of stock",
			alerts_out_of_stock_description: `Out of stock ${values?.bundleName ?? ""}`.trim(),
			alerts_limited_title:
				`Limited ${values?.stageLabel ?? ""} ${values?.passengersLabel ?? ""}`.trim(),
			alerts_limited_description_apply_to_all: "Limited apply to all",
			alerts_limited_description_other: "Limited other",
			selection_table_passengers: "Passengers",
			selection_table_other_passengers: "Other passengers",
		};

		return translations[key] ?? key;
	});
});

describe("BundlePackageSelectionAlerts", () => {
	it("renders no bundles warning", () => {
		render(
			<BundlePackageSelectionAlerts
				allBundlesUnavailable
				isBundlePurchaseDeadlineExceeded={false}
				stageLabel="outbound"
				bundleDeadlineHours={24}
				unavailableBundleIds={[]}
				showOutOfStockAlert={false}
				bundles={[]}
				hasSelectionInteraction={false}
				limitedBundleIds={[]}
				applyToAll={false}
				topValidationMessage={null}
				validationAttempt={0}
			/>
		);

		expect(screen.getByTestId("alert")).toHaveAttribute("data-variant", "warning");
		expect(screen.getByText("No bundles for outbound")).toBeInTheDocument();
		expect(screen.getByText("No bundles description")).toBeInTheDocument();
	});

	it("renders deadline warning", () => {
		render(
			<BundlePackageSelectionAlerts
				allBundlesUnavailable={false}
				isBundlePurchaseDeadlineExceeded
				stageLabel="inbound"
				bundleDeadlineHours={12}
				unavailableBundleIds={[]}
				showOutOfStockAlert={false}
				bundles={[]}
				hasSelectionInteraction={false}
				limitedBundleIds={[]}
				applyToAll={false}
				topValidationMessage={null}
				validationAttempt={0}
			/>
		);

		expect(screen.getByText("Deadline for inbound")).toBeInTheDocument();
		expect(screen.getByText("Deadline 12")).toBeInTheDocument();
	});

	it("renders out of stock warning for matching and missing bundle names", () => {
		render(
			<BundlePackageSelectionAlerts
				allBundlesUnavailable={false}
				isBundlePurchaseDeadlineExceeded={false}
				stageLabel="outbound"
				bundleDeadlineHours={0}
				unavailableBundleIds={FLEX_BIZ_BUNDLE_IDS}
				showOutOfStockAlert
				bundles={[testBundle]}
				hasSelectionInteraction={false}
				limitedBundleIds={[]}
				applyToAll={false}
				topValidationMessage={null}
				validationAttempt={0}
			/>
		);

		expect(screen.getAllByText("Out of stock")).toHaveLength(2);
		expect(screen.getByText("Out of stock Bundle one")).toBeInTheDocument();
	});

	it("renders limited warning for apply to all passengers", () => {
		render(
			<BundlePackageSelectionAlerts
				allBundlesUnavailable={false}
				isBundlePurchaseDeadlineExceeded={false}
				stageLabel="segment1"
				bundleDeadlineHours={0}
				unavailableBundleIds={[]}
				showOutOfStockAlert={false}
				bundles={[]}
				hasSelectionInteraction
				limitedBundleIds={[FLEX_BIZ_BUNDLE_IDS[0]]}
				applyToAll
				topValidationMessage={null}
				validationAttempt={0}
			/>
		);

		expect(screen.getByText("Limited segment1 Passengers")).toBeInTheDocument();
		expect(screen.getByText("Limited apply to all")).toBeInTheDocument();
	});

	it("renders limited warning for other passengers", () => {
		render(
			<BundlePackageSelectionAlerts
				allBundlesUnavailable={false}
				isBundlePurchaseDeadlineExceeded={false}
				stageLabel="segment2"
				bundleDeadlineHours={0}
				unavailableBundleIds={[]}
				showOutOfStockAlert={false}
				bundles={[]}
				hasSelectionInteraction
				limitedBundleIds={[FLEX_BIZ_BUNDLE_IDS[0]]}
				applyToAll={false}
				topValidationMessage={null}
				validationAttempt={0}
			/>
		);

		expect(screen.getByText("Limited segment2 Other passengers")).toBeInTheDocument();
		expect(screen.getByText("Limited other")).toBeInTheDocument();
	});

	it("renders validation errors, scrolls on every attempt, and hides warnings", () => {
		const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
		const alertProps = {
			allBundlesUnavailable: true,
			isBundlePurchaseDeadlineExceeded: true,
			stageLabel: "outbound",
			bundleDeadlineHours: 24,
			unavailableBundleIds: [FLEX_BIZ_BUNDLE_IDS[0]],
			showOutOfStockAlert: true,
			bundles: [testBundle],
			hasSelectionInteraction: true,
			limitedBundleIds: [FLEX_BIZ_BUNDLE_IDS[0]],
			applyToAll: true,
			topValidationMessage: "Top error",
		};

		const { rerender } = render(
			<BundlePackageSelectionAlerts {...alertProps} validationAttempt={1} />
		);

		expect(screen.getByText("Top error")).toBeInTheDocument();
		expect(scrollToSpy).toHaveBeenCalledTimes(1);
		expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
		expect(screen.queryAllByTestId("alert")).toHaveLength(1);
		expect(screen.queryByText("No bundles for outbound")).toBeNull();
		expect(screen.queryByText("Deadline for outbound")).toBeNull();

		rerender(<BundlePackageSelectionAlerts {...alertProps} validationAttempt={2} />);

		expect(scrollToSpy).toHaveBeenCalledTimes(2);
		scrollToSpy.mockRestore();
	});
});
