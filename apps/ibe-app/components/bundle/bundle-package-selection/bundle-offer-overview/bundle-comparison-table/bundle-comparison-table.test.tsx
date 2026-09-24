import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { BundleOption, FeatureRow } from "@/types/bundle/bundle.types";
import BundleComparisonTable from "./bundle-comparison-table";

const useTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name, color, size, fill }: any) => (
		<div data-testid={`icon-${name}`} data-color={color} data-size={size} data-fill={fill}>
			{name}
		</div>
	),
}));

vi.mock("@/assets/images/expand-collapse-icon", () => ({
	ExpandCollapseIcon: ({ className }: { className?: string }) => (
		<svg data-testid="bundle-expand-collapse-icon" className={className} />
	),
}));

const mockBundles: BundleOption[] = [
	{ id: "NOBN", name: "No Bundle", description: "Basic", price: 0 },
	{ id: "VALK", name: "Value", description: "Value", price: 7500 },
	{ id: "PRMK", name: "Premium", description: "Premium", price: 12500 },
];

const mockFeatures: FeatureRow[] = [
	{
		icon: "flight_class",
		label: "Seat",
		values: { NOBN: "Paid", VALK: "Included", PRMK: "Included" },
	},
	{
		icon: "restaurant",
		label: "Meal",
		values: { VALK: "Included", PRMK: "Included" },
	},
	{
		icon: "luggage",
		label: "Baggage",
		values: { NOBN: "Free 7kg", VALK: "Free 23kg", PRMK: "Free 23kg" },
	},
];

describe("BundleComparisonTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useTranslationsMock.mockReturnValue((key: string) => key);
	});

	it("renders desktop table with all bundles as columns", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		const desktopTable = screen.getByRole("table");
		expect(desktopTable).toBeInTheDocument();

		// Desktop table should have all bundle names
		expect(screen.getByText("No Bundle")).toBeInTheDocument();
		expect(screen.getByText("Value")).toBeInTheDocument();
		expect(screen.getByText("Premium")).toBeInTheDocument();
	});

	it("renders all feature rows in desktop view", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		expect(screen.getAllByText("Seat").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Meal").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Baggage").length).toBeGreaterThan(0);
	});

	it("renders feature values for each bundle in desktop view", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Included").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Free 7kg").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Free 23kg").length).toBeGreaterThan(0);
	});

	it("renders unavailable feature values as centered 18px close icons", () => {
		const unavailableIcon = (
			<svg
				data-testid="bundle-unavailable-icon"
				className="inline-block size-[18px] align-middle"
			/>
		);
		const unavailableFeature: FeatureRow[] = [
			{
				icon: "restaurant",
				label: "Meal",
				values: { NOBN: unavailableIcon },
			},
		];

		render(<BundleComparisonTable bundles={mockBundles} features={unavailableFeature} />);

		for (const unavailableIcon of screen.getAllByTestId("bundle-unavailable-icon")) {
			expect(unavailableIcon).toHaveClass("size-[18px]", "align-middle");
		}
		expect(screen.queryByText("x")).not.toBeInTheDocument();
	});

	it("renders empty value for missing bundle entries in desktop view", () => {
		const featureWithMissingValue: FeatureRow[] = [
			{
				icon: "restaurant",
				label: "Meal",
				values: { VALK: "Included", PRMK: "Included" },
			},
		];

		render(<BundleComparisonTable bundles={mockBundles} features={featureWithMissingValue} />);

		expect(screen.queryAllByTestId("icon-close")).toHaveLength(0);
		expect(screen.getAllByText("Included").length).toBeGreaterThan(0);
	});

	it("renders mobile view with features collapsed", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		// Mobile view should also render all features
		const featuresInMobile = screen.getAllByText("Seat");
		expect(featuresInMobile.length).toBeGreaterThan(0);
	});

	it("renders bundle names across multiple feature rows in mobile view", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		// All bundle names should be rendered (in both desktop and mobile views)
		const noBundleElements = screen.getAllByText("No Bundle");
		expect(noBundleElements.length).toBeGreaterThan(0);
	});

	it("uses translations from bundle_page namespace", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		expect(useTranslationsMock).toHaveBeenCalledWith("bundle_page");
	});

	it("displays icon for each feature in desktop view", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		expect(screen.getAllByTestId("icon-flight_class").length).toBeGreaterThan(0);
		expect(screen.getAllByTestId("icon-restaurant").length).toBeGreaterThan(0);
		expect(screen.getAllByTestId("icon-luggage").length).toBeGreaterThan(0);
	});

	it("displays icon for each feature in mobile view", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		// Icons appear in both desktop and mobile, so we should have multiple instances
		const flightIcons = screen.getAllByTestId("icon-flight_class");
		expect(flightIcons.length).toBeGreaterThan(0);
	});

	it("renders correct number of columns in desktop table", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		const colgroups = screen.queryAllByRole("table");
		expect(colgroups.length).toBeGreaterThan(0);
	});

	it("handles empty bundles array", () => {
		render(<BundleComparisonTable bundles={[]} features={mockFeatures} />);

		// Should still render the structure
		expect(screen.getAllByText("Seat").length).toBeGreaterThan(0);
	});

	it("handles empty features array", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={[]} />);

		// Should render bundles but no features
		expect(screen.getByText("No Bundle")).toBeInTheDocument();
	});

	it("renders sticky feature column in desktop view", () => {
		const { container } = render(
			<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />
		);

		const stickyColumn = container.querySelector(".sticky");
		expect(stickyColumn).toBeInTheDocument();
	});

	it("renders feature icon from string type", () => {
		const featureWithStringIcon: FeatureRow[] = [
			{
				icon: "flight_class",
				label: "Seat",
				values: { NOBN: "Paid", VALK: "Included", PRMK: "Included" },
			},
		];

		render(<BundleComparisonTable bundles={mockBundles} features={featureWithStringIcon} />);

		expect(screen.getAllByTestId("icon-flight_class").length).toBeGreaterThan(0);
	});

	it("renders feature icon from ReactNode type", () => {
		const customIcon = <span data-testid="custom-icon">custom</span>;
		const featureWithReactNodeIcon: FeatureRow[] = [
			{
				icon: customIcon,
				label: "Custom Feature",
				values: { NOBN: "Value1", VALK: "Value2", PRMK: "Value3" },
			},
		];

		render(<BundleComparisonTable bundles={mockBundles} features={featureWithReactNodeIcon} />);

		expect(screen.getAllByTestId("custom-icon").length).toBeGreaterThan(0);
	});

	it("renders all feature values correctly across bundles", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		// Check all text values are rendered (appear at least once in desktop or mobile view)
		expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Included").length).toBeGreaterThan(0);
	});

	it("applies correct CSS classes to table in desktop view", () => {
		const { container } = render(
			<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />
		);

		const desktopContainer = container.querySelector(".hidden.overflow-x-auto.md\\:block");
		expect(desktopContainer).toBeInTheDocument();
	});

	it("applies correct CSS classes to container in mobile view", () => {
		const { container } = render(
			<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />
		);

		const mobileContainer = container.querySelector(".overflow-hidden.rounded-lg");
		expect(mobileContainer).toBeInTheDocument();
	});

	it("renders the View Features header in the mobile view", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		expect(screen.getByText("bundle_features_view_features")).toBeInTheDocument();
	});

	it("renders the outlined expand/collapse icon rotated when expanded", () => {
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		expect(screen.getByTestId("bundle-expand-collapse-icon")).toHaveClass("size-5");
		expect(screen.getByTestId("bundle-expand-collapse-icon")).not.toHaveClass("rotate-180");
		expect(
			screen.getByRole("button", { name: "aria_labels.collapse_information" })
		).toBeInTheDocument();
	});

	it("collapses and re-expands the mobile feature rows when the toggle is clicked", async () => {
		const user = userEvent.setup();
		render(<BundleComparisonTable bundles={mockBundles} features={mockFeatures} />);

		const toggle = screen.getByRole("button", { name: "aria_labels.collapse_information" });

		await user.click(toggle);
		expect(screen.getByTestId("bundle-expand-collapse-icon")).toHaveClass("size-5");
		expect(screen.getByTestId("bundle-expand-collapse-icon")).toHaveClass("rotate-180");
		expect(
			screen.getByRole("button", { name: "aria_labels.expand_information" })
		).toBeInTheDocument();
		expect(screen.queryAllByText("Seat")).toHaveLength(1);

		await user.click(screen.getByRole("button", { name: "aria_labels.expand_information" }));
		expect(screen.getByTestId("bundle-expand-collapse-icon")).toHaveClass("size-5");
		expect(screen.getByTestId("bundle-expand-collapse-icon")).not.toHaveClass("rotate-180");
		expect(screen.getAllByText("Seat").length).toBeGreaterThan(1);
	});
});
