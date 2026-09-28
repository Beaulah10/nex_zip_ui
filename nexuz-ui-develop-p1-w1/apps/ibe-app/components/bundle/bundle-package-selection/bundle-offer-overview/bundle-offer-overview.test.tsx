import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
	BundleOption,
	BundlePriceCardsProps,
	FeatureRow,
	TicketChangeOptionDialogProps,
	UnavailableAlertProps,
} from "@/types/bundle/bundle.types";
import BundleOfferOverview from "./bundle-offer-overview";

const useTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock(
	"@/components/bundle/bundle-package-selection/bundle-offer-overview/bundle-comparison-table/bundle-comparison-table",
	() => ({
		default: ({ bundles, features }: { bundles: BundleOption[]; features: FeatureRow[] }) => (
			<div data-testid="bundle-comparison-table">
				<div data-testid="bundle-count">{bundles.length}</div>
				<div data-testid="feature-count">{features.length}</div>
			</div>
		),
	})
);

vi.mock(
	"@/components/bundle/bundle-package-selection/bundle-offer-overview/bundle-price-cards/bundle-price-cards",
	() => ({
		default: ({ bundles, hasFlexBizData, onFlexBizRequest }: BundlePriceCardsProps) => (
			<div data-testid="bundle-price-cards">
				<div data-testid="price-card-count">{bundles.length}</div>
				<div data-testid="has-flex-biz-data">{hasFlexBizData.toString()}</div>
				<button type="button" data-testid="flex-biz-button" onClick={onFlexBizRequest}>
					Flex Biz
				</button>
			</div>
		),
	})
);

vi.mock(
	"@/components/bundle/bundle-package-selection/bundle-offer-overview/ticket-change-option-dialog/ticket-change-option-dialog",
	() => ({
		default: ({ open, onOpenChange, onConfirm }: TicketChangeOptionDialogProps) => (
			<div data-testid="ticket-change-dialog">
				<div data-testid="dialog-open">{open?.toString() ?? "undefined"}</div>
				<button type="button" data-testid="dialog-open-button" onClick={() => onOpenChange?.(true)}>
					Open
				</button>
				<button type="button" data-testid="dialog-confirm-button" onClick={onConfirm}>
					Confirm
				</button>
			</div>
		),
	})
);

vi.mock(
	"@/components/bundle/bundle-package-selection/bundle-offer-overview/unavailable-alert/unavailable-alert",
	() => ({
		default: ({ isYvrRoute }: UnavailableAlertProps) => (
			<div data-testid="unavailable-alert">
				<div data-testid="is-yvr-route">{isYvrRoute?.toString() ?? "undefined"}</div>
			</div>
		),
	})
);

vi.mock("@/modules/utils/constants/bundle/bundle-offer-overview.translations", () => ({
	getTranslatedBundleFeatures: vi.fn(() => [
		{
			label: "Seat",
			icon: "flight_class",
			values: { NOBN: "Paid", VALK: "Included", PRMK: "Included" },
		},
		{
			label: "Meal",
			icon: "restaurant",
			values: { VALK: "Included", PRMK: "Included" },
		},
	]),
}));

const mockBundles: BundleOption[] = [
	{ id: "NOBN", name: "No Bundle", description: "Basic fare only", price: 0 },
	{ id: "VALK", name: "Value", description: "Value options", price: 7500, badge: "Popular" },
	{ id: "PRMK", name: "Premium", description: "Premium options", price: 12500 },
];

describe("BundleOfferOverview", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useTranslationsMock.mockReturnValue((key: string) => key);
	});

	it("renders all child components when showEligibilityBanner is true", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={true}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(screen.getByTestId("unavailable-alert")).toBeInTheDocument();
		expect(screen.getByTestId("bundle-price-cards")).toBeInTheDocument();
		expect(screen.getByTestId("bundle-comparison-table")).toBeInTheDocument();
		expect(screen.getByTestId("ticket-change-dialog")).toBeInTheDocument();
	});

	it("does not render unavailable alert when showEligibilityBanner is false", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(screen.queryByTestId("unavailable-alert")).not.toBeInTheDocument();
		expect(screen.getByTestId("bundle-price-cards")).toBeInTheDocument();
		expect(screen.getByTestId("bundle-comparison-table")).toBeInTheDocument();
		expect(screen.getByTestId("ticket-change-dialog")).toBeInTheDocument();
	});

	it("passes bundles to price cards component", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={false}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(screen.getByTestId("price-card-count")).toHaveTextContent("3");
	});

	it("passes hasFlexBizData to price cards component", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(screen.getByTestId("has-flex-biz-data")).toHaveTextContent("true");
	});

	it("calls onFlexBizOpen when flex biz button is clicked", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		// The button in BundlePriceCards component calls onFlexBizRequest prop
		// which is wired to onFlexBizOpen from parent
		const button = screen.getByTestId("flex-biz-button");
		button.click();

		expect(onFlexBizOpen).toHaveBeenCalledTimes(1);
	});

	it("passes dialog open state to ticket change dialog", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={true}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(screen.getByTestId("dialog-open")).toHaveTextContent("true");
	});

	it("calls onFlexBizDialogOpenChange when dialog open state changes", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		const button = screen.getByTestId("dialog-open-button");
		button.click();

		expect(onFlexBizDialogOpenChange).toHaveBeenCalledWith(true);
	});

	it("calls onFlexBizRequest when confirm button in dialog is clicked", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		const button = screen.getByTestId("dialog-confirm-button");
		button.click();

		expect(onFlexBizRequest).toHaveBeenCalledTimes(1);
	});

	it("passes isYvrRoute to unavailable alert", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={true}
				showEligibilityBanner={true}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(screen.getByTestId("is-yvr-route")).toHaveTextContent("true");
	});

	it("uses translations from bundle_page namespace", () => {
		const onFlexBizOpen = vi.fn();
		const onFlexBizDialogOpenChange = vi.fn();
		const onFlexBizRequest = vi.fn();

		render(
			<BundleOfferOverview
				bundles={mockBundles}
				hasFlexBizData={true}
				isICNRoute={false}
				isYvrRoute={false}
				showEligibilityBanner={false}
				onFlexBizRequest={onFlexBizRequest}
				onFlexBizOpen={onFlexBizOpen}
				flexBizDialogOpen={false}
				onFlexBizDialogOpenChange={onFlexBizDialogOpenChange}
			/>
		);

		expect(useTranslationsMock).toHaveBeenCalledWith("bundle_page");
	});
});
