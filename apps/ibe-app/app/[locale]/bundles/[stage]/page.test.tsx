import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BundlesStagePage from "./page";

const {
	bundleSelectionMock,
	notFoundMock,
	getBookingDirectionFromStageMock,
	isBookingStageSegmentMock,
} = vi.hoisted(() => ({
	bundleSelectionMock: vi.fn(() => <div data-testid="bundle-selection">Bundle Selection</div>),
	notFoundMock: vi.fn(() => {
		throw new Error("NEXT_NOT_FOUND");
	}),
	getBookingDirectionFromStageMock: vi.fn(),
	isBookingStageSegmentMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	notFound: notFoundMock,
}));

vi.mock("@/components/bundle/bundle", () => ({
	default: bundleSelectionMock,
}));

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingDirectionFromStage: getBookingDirectionFromStageMock,
	isBookingStageSegment: isBookingStageSegmentMock,
}));

describe("BundlesStagePage", () => {
	it("renders bundle selection for valid stage", async () => {
		getBookingDirectionFromStageMock.mockReturnValue("outbound");
		isBookingStageSegmentMock.mockReturnValue(true);

		const page = await BundlesStagePage({
			params: Promise.resolve({
				locale: "en",
				stage: "outbound",
			}),
		});

		render(page);

		expect(bundleSelectionMock).toHaveBeenCalledWith(
			{ locale: "en", direction: "outbound", stage: "outbound" },
			undefined
		);
		expect(screen.getByTestId("bundle-selection")).toBeTruthy();
	});

	it("calls notFound for invalid stage", async () => {
		getBookingDirectionFromStageMock.mockReturnValue(undefined);
		isBookingStageSegmentMock.mockReturnValue(false);

		await expect(
			BundlesStagePage({
				params: Promise.resolve({
					locale: "en",
					stage: "bad-stage",
				}),
			})
		).rejects.toThrow("NEXT_NOT_FOUND");

		expect(notFoundMock).toHaveBeenCalledTimes(1);
	});
});
