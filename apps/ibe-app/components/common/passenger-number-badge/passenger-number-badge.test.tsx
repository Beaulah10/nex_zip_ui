import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PassengerNumberBadge } from "@/components/common/passenger-number-badge/passenger-number-badge";
import { renderWithProviders } from "@/test/render-with-providers";

describe("PassengerNumberBadge", () => {
	it("renders badge number and default classes", () => {
		renderWithProviders(<PassengerNumberBadge number={3} />);

		const badge = screen.getByText("3");
		expect(badge).toBeTruthy();
		expect(badge.getAttribute("aria-hidden")).toBe("true");
		expect(badge.className).toContain("bg-primary-600");
		expect(badge.className).toContain("text-white");
	});

	it("merges custom className", () => {
		renderWithProviders(<PassengerNumberBadge number="7" className="custom-badge" />);

		expect(screen.getByText("7").className).toContain("custom-badge");
	});
});
