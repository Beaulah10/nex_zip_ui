/**
 * File: total-amount-display.test.tsx
 * Classification: Component
 * Description: Tests for TotalAmountDisplay – formatted JPY total with optional label
 * and conditional colour class based on amount sign.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TotalAmountDisplay } from "@/components/customize/transport-service/total-amount/total-amount-display";

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `¥${amount}`,
}));

describe("TotalAmountDisplay – amount rendering", () => {
	it("renders the formatted amount", () => {
		render(<TotalAmountDisplay amount={1500} />);

		expect(screen.getByText("¥1500")).toBeInTheDocument();
	});

	it("applies text-primary-700 class when amount is positive", () => {
		render(<TotalAmountDisplay amount={100} />);

		expect(screen.getByText("¥100").className).toContain("text-primary-700");
	});

	it("applies text-base-400 class when amount is zero", () => {
		render(<TotalAmountDisplay amount={0} />);

		expect(screen.getByText("¥0").className).toContain("text-base-400");
	});

	it("applies text-base-400 class when amount is negative", () => {
		render(<TotalAmountDisplay amount={-50} />);

		expect(screen.getByText("¥-50").className).toContain("text-base-400");
	});

	it("applies amountClassName override in addition to base classes", () => {
		render(<TotalAmountDisplay amount={200} amountClassName="custom-amount" />);

		expect(screen.getByText("¥200").className).toContain("custom-amount");
	});
});

describe("TotalAmountDisplay – optional label", () => {
	it("renders label span when label prop is provided", () => {
		render(<TotalAmountDisplay amount={0} label="Total:" />);

		expect(screen.getByText("Total:")).toBeInTheDocument();
	});

	it("does not render a label element when label prop is omitted", () => {
		render(<TotalAmountDisplay amount={500} />);

		// Only the amount span should be present; no orphan label text.
		expect(screen.queryByText("Total:")).not.toBeInTheDocument();
	});

	it("applies labelClassName override to the label span", () => {
		render(<TotalAmountDisplay amount={0} label="Tax" labelClassName="custom-label" />);

		expect(screen.getByText("Tax").className).toContain("custom-label");
	});
});
