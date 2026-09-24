import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeaderWrapper } from "@/components/common/site-header-wrapper/site-header-wrapper";

const mocks = vi.hoisted(() => ({
	onBackClick: vi.fn(),
	useBackNavigation: vi.fn(),
	siteHeaderSpy: vi.fn(),
}));

vi.mock("@/modules/hooks/common/back-navigation/use-back-navigation", () => ({
	useBackNavigation: mocks.useBackNavigation,
}));

vi.mock("@repo/ui/components/site-header", () => ({
	SiteHeader: (props: {
		className?: string;
		showBackArrow?: boolean;
		onBackClick?: () => void;
	}) => {
		mocks.siteHeaderSpy(props);
		return (
			<button aria-label="site-header-back" type="button" onClick={props.onBackClick}>
				header
			</button>
		);
	},
}));

describe("SiteHeaderWrapper", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.useBackNavigation.mockReturnValue(mocks.onBackClick);
	});

	it("passes through props and injects onBackClick from hook", () => {
		render(<SiteHeaderWrapper className="x-header" showBackArrow />);

		expect(mocks.siteHeaderSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				className: "x-header",
				showBackArrow: true,
				onBackClick: mocks.onBackClick,
			})
		);
	});

	it("calls hook-provided back handler when header triggers click", () => {
		render(<SiteHeaderWrapper />);
		fireEvent.click(screen.getByRole("button", { name: "site-header-back" }));
		expect(mocks.onBackClick).toHaveBeenCalledTimes(1);
	});
});
