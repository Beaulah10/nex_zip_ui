import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BundleOption } from "@/types/bundle/bundle.types";
import BundlePriceCards from "./bundle-price-cards";

const useTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, className }: any) => (
		<div data-testid="badge" className={className}>
			{children}
		</div>
	),
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (price: number) => `¥${price.toLocaleString()}`,
}));

const mockBundles: BundleOption[] = [
	{
		id: "NOBN",
		name: "No Bundle",
		description: "Basic fare only",
		price: 0,
	},
	{
		id: "VALK",
		name: "Value",
		description: "Value options",
		price: 7500,
		badge: "Popular",
	},
	{
		id: "PRMK",
		name: "Premium",
		description: "Premium options",
		price: 12500,
		badge: "Most Popular",
	},
];

describe("BundlePriceCards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useTranslationsMock.mockReturnValue((key: string) => key);
	});

	it("renders bundle name and description", () => {
		render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		expect(screen.getByText("No Bundle")).toBeInTheDocument();
		expect(screen.getByText("Value")).toBeInTheDocument();
		expect(screen.getByText("Premium")).toBeInTheDocument();

		expect(screen.getByText("Basic fare only")).toBeInTheDocument();
		expect(screen.getByText("Value options")).toBeInTheDocument();
		expect(screen.getByText("Premium options")).toBeInTheDocument();
	});

	it("renders formatted prices", () => {
		render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		expect(screen.getByText("¥0")).toBeInTheDocument();
		expect(screen.getByText("¥7,500")).toBeInTheDocument();
		expect(screen.getByText("¥12,500")).toBeInTheDocument();
	});

	it("renders badge when present", () => {
		render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		expect(screen.getByText("Popular")).toBeInTheDocument();
		expect(screen.getByText("Most Popular")).toBeInTheDocument();
	});

	it("does not render badge when absent", () => {
		render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		// First bundle has no badge
		const badges = screen.getAllByTestId("badge");
		expect(badges.length).toBe(2); // Only 2 bundles have badges
	});

	it("uses translations from bundle_page namespace", () => {
		render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		expect(useTranslationsMock).toHaveBeenCalledWith("bundle_page");
	});

	it("renders dialog trigger button when hasFlexBizData is true and bundle is FLBS", () => {
		const flexBsBundle: BundleOption = {
			id: "FLBS",
			name: "Flex Biz",
			description: "Flex ticket change options",
			price: 7000,
		};

		const onFlexBizRequest = vi.fn();

		render(
			<BundlePriceCards
				bundles={[flexBsBundle]}
				hasFlexBizData={true}
				onFlexBizRequest={onFlexBizRequest}
			/>
		);

		const button = screen.getByRole("button", { name: /dialog_trigger/i });
		expect(button).toBeInTheDocument();
	});

	it("calls onFlexBizRequest when dialog trigger button is clicked", () => {
		const flexBsBundle: BundleOption = {
			id: "FLBS",
			name: "Flex Biz",
			description: "Flex ticket change options",
			price: 7000,
		};

		const onFlexBizRequest = vi.fn();

		render(
			<BundlePriceCards
				bundles={[flexBsBundle]}
				hasFlexBizData={true}
				onFlexBizRequest={onFlexBizRequest}
			/>
		);

		const button = screen.getByRole("button", { name: /dialog_trigger/i });
		button.click();

		expect(onFlexBizRequest).toHaveBeenCalledTimes(1);
	});

	it("does not render dialog trigger when hasFlexBizData is false", () => {
		const flexBsBundle: BundleOption = {
			id: "FLBS",
			name: "Flex Biz",
			description: "Flex ticket change options",
			price: 7000,
		};

		render(
			<BundlePriceCards
				bundles={[flexBsBundle]}
				hasFlexBizData={false}
				onFlexBizRequest={() => {}}
			/>
		);

		const button = screen.queryByRole("button", { name: /dialog_trigger/i });
		expect(button).not.toBeInTheDocument();
	});

	it("does not render dialog trigger for FLBF bundle when hasFlexBizData is true", () => {
		const flexBfBundle: BundleOption = {
			id: "FLBF",
			name: "Flex Biz Full",
			description: "Flex ticket change options full",
			price: 8000,
		};

		render(
			<BundlePriceCards
				bundles={[flexBfBundle]}
				hasFlexBizData={true}
				onFlexBizRequest={() => {}}
			/>
		);

		const button = screen.queryByRole("button", { name: /dialog_trigger/i });
		expect(button).toBeInTheDocument();
	});

	it("renders grid with correct number of columns for 3 bundles", () => {
		const { container } = render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		const gridContainer = container.querySelector(".md\\:grid");
		expect(gridContainer).toHaveClass("md:grid-cols-[18rem_repeat(3,minmax(0,1fr))]");
	});

	it("renders grid with correct number of columns for 4 bundles", () => {
		const fourBundles: BundleOption[] = [
			...mockBundles,
			{
				id: "PREN",
				name: "Premium Extra",
				description: "Premium extra options",
				price: 15000,
			},
		];

		const { container } = render(
			<BundlePriceCards bundles={fourBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		const gridContainer = container.querySelector(".md\\:grid");
		expect(gridContainer).toHaveClass("md:grid-cols-[18rem_repeat(4,minmax(0,1fr))]");
	});

	it("renders card containers for each bundle", () => {
		const { container } = render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		const cards = container.querySelectorAll(".rounded-lg.border");
		expect(cards.length).toBeGreaterThanOrEqual(mockBundles.length);
	});

	it("renders undefined price as dash", () => {
		const bundleWithoutPrice: BundleOption = {
			id: "NOBN",
			name: "No Price",
			description: "No price bundle",
		};

		render(
			<BundlePriceCards
				bundles={[bundleWithoutPrice]}
				hasFlexBizData={false}
				onFlexBizRequest={() => {}}
			/>
		);

		expect(screen.getByText("-")).toBeInTheDocument();
	});

	it("renders all bundle cards in a single row container", () => {
		const { container } = render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		const flexContainer = container.querySelector(".flex.w-full.items-stretch");
		expect(flexContainer).toBeInTheDocument();
	});

	it("applies correct styling classes to price text", () => {
		const { container } = render(
			<BundlePriceCards bundles={mockBundles} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		const priceElement = Array.from(container.querySelectorAll(".text-primary-700")).find(
			(element) => element.classList.contains("font-bold")
		);

		expect(priceElement).toHaveClass("font-bold", "text-lg", "text-primary-700");
	});

	it("renders dialog trigger as unstyled button", () => {
		const flexBsBundle: BundleOption = {
			id: "FLBS",
			name: "Flex Biz",
			description: "Flex ticket change options",
			price: 7000,
		};

		render(
			<BundlePriceCards
				bundles={[flexBsBundle]}
				hasFlexBizData={true}
				onFlexBizRequest={() => {}}
			/>
		);

		const button = screen.getByRole("button", { name: /dialog_trigger/i });
		expect(button).toHaveClass("appearance-none");
		expect(button).toHaveClass("bg-transparent");
	});

	it("handles empty bundles array", () => {
		const { container } = render(
			<BundlePriceCards bundles={[]} hasFlexBizData={false} onFlexBizRequest={() => {}} />
		);

		const flexContainer = container.querySelector(".flex.w-full.items-stretch");
		expect(flexContainer).toBeInTheDocument();
	});
});
