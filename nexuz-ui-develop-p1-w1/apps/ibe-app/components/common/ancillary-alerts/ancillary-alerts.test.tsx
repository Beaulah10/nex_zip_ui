import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AncillaryAlerts from "@/components/common/ancillary-alerts/ancillary-alerts";

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
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

const makeAncillaryResult = (overrides = {}) => ({
	cards: {
		seat: { enabled: true, showPopupOnClick: false, redirectToTop: false },
		meal: { enabled: true, showPopupOnClick: false, redirectToTop: false },
		lounge: { enabled: true, showPopupOnClick: false, redirectToTop: false },
		transport: { enabled: true, showPopupOnClick: false, redirectToTop: false },
		express: { enabled: true, showPopupOnClick: false, redirectToTop: false },
		baggage: { enabled: true, showPopupOnClick: false, redirectToTop: false },
	},
	bannerTitle: "Error title",
	bannerDescription: "Error description",
	...overrides,
});

describe("AncillaryAlerts", () => {
	it("renders nothing when all show flags are false", () => {
		const { container } = render(<AncillaryAlerts />);
		expect(container.firstChild).toBeNull();
	});

	it("renders ancillary banner when showAncillaryBanner is true and ancillaryResult is provided", () => {
		render(<AncillaryAlerts showAncillaryBanner ancillaryResult={makeAncillaryResult()} />);
		const titles = screen.getAllByTestId("alert-title");
		expect(titles.some((el) => el.textContent === "Error title")).toBe(true);
		const descriptions = screen.getAllByTestId("alert-description");
		expect(descriptions.some((el) => el.textContent === "Error description")).toBe(true);
	});

	it("does NOT render ancillary banner when showAncillaryBanner is false", () => {
		render(<AncillaryAlerts showAncillaryBanner={false} ancillaryResult={makeAncillaryResult()} />);
		expect(screen.queryByText("Error title")).toBeNull();
	});

	it("does NOT render ancillary banner when ancillaryResult is undefined", () => {
		render(<AncillaryAlerts showAncillaryBanner ancillaryResult={undefined} />);
		expect(screen.queryByTestId("alert-title")).toBeNull();
	});

	it("renders bundle completion alert when showBundleCompletionAlert is true and data provided", () => {
		render(
			<AncillaryAlerts
				showBundleCompletionAlert
				bundleCompletionAlertData={{ title: "Bundle title", description: "Bundle desc" }}
			/>
		);
		const alerts = screen.getAllByTestId("alert");
		expect(alerts.length).toBeGreaterThan(0);
		expect(screen.getByText("Bundle title")).toBeTruthy();
	});

	it("does NOT render bundle completion alert when showBundleCompletionAlert is false", () => {
		render(
			<AncillaryAlerts
				showBundleCompletionAlert={false}
				bundleCompletionAlertData={{ title: "Bundle title", description: "Bundle desc" }}
			/>
		);
		expect(screen.queryByText("Bundle title")).toBeNull();
	});

	it("renders bundle completion alert even when bundleCompletionAlertData is undefined", () => {
		render(<AncillaryAlerts showBundleCompletionAlert bundleCompletionAlertData={undefined} />);

		expect(screen.getByText("error_labels.mandatory_bundle_selection_error_title")).toBeTruthy();
	});

	it("renders stock banner when showStockBanner is true and data provided", () => {
		render(
			<AncillaryAlerts
				showStockBanner
				stockBannerData={{ title: "Stock title", description: "Stock desc" }}
			/>
		);
		expect(screen.getByText("Stock title")).toBeTruthy();
		expect(screen.getByText("Stock desc")).toBeTruthy();
	});

	it("does NOT render stock banner when showStockBanner is false", () => {
		render(
			<AncillaryAlerts
				showStockBanner={false}
				stockBannerData={{ title: "Stock title", description: "Stock desc" }}
			/>
		);
		expect(screen.queryByText("Stock title")).toBeNull();
	});

	it("does NOT render stock banner when stockBannerData is undefined", () => {
		render(<AncillaryAlerts showStockBanner stockBannerData={undefined} />);
		expect(screen.queryByTestId("alert-title")).toBeNull();
	});

	it("renders all three banners simultaneously", () => {
		render(
			<AncillaryAlerts
				showAncillaryBanner
				ancillaryResult={makeAncillaryResult()}
				showBundleCompletionAlert
				bundleCompletionAlertData={{ title: "Bundle title", description: "Bundle desc" }}
				showStockBanner
				stockBannerData={{ title: "Stock title", description: "Stock desc" }}
			/>
		);
		const alerts = screen.getAllByTestId("alert");
		expect(alerts.length).toBe(3);
	});

	it("stock banner uses warning variant", () => {
		render(
			<AncillaryAlerts showStockBanner stockBannerData={{ title: "Stock", description: "desc" }} />
		);
		const alert = screen.getByTestId("alert");
		expect(alert.getAttribute("data-variant")).toBe("warning");
	});

	it("ancillary banner uses error variant", () => {
		render(<AncillaryAlerts showAncillaryBanner ancillaryResult={makeAncillaryResult()} />);
		const alert = screen.getByTestId("alert");
		expect(alert.getAttribute("data-variant")).toBe("error");
	});

	it("bundle completion alert uses error variant", () => {
		render(
			<AncillaryAlerts
				showBundleCompletionAlert
				bundleCompletionAlertData={{ title: "T", description: "D" }}
			/>
		);
		const alert = screen.getByTestId("alert");
		expect(alert.getAttribute("data-variant")).toBe("error");
	});
});
