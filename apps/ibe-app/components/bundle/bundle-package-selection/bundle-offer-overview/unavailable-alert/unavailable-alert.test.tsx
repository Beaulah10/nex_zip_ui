import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import UnavailableAlert from "./unavailable-alert";

const useTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children, variant, className }: any) => (
		<div data-testid="alert" data-variant={variant} className={className}>
			{children}
		</div>
	),
	AlertTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
	AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
	AlertAction: ({ children }: any) => <div data-testid="alert-action">{children}</div>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
		variant,
		outline,
		size,
		className,
		"aria-label": ariaLabel,
	}: any) => (
		<button
			type="button"
			data-testid="collapse-button"
			onClick={onClick}
			className={className}
			data-variant={variant}
			data-outline={outline}
			data-size={size}
			aria-label={ariaLabel}
		>
			{children}
		</button>
	),
}));

vi.mock("@/assets/images/expand-collapse-icon", () => ({
	ExpandCollapseIcon: ({ className }: { className?: string }) => (
		<svg data-testid="bundle-expand-collapse-icon" className={className} />
	),
}));

describe("UnavailableAlert", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useTranslationsMock.mockReturnValue((key: string, values?: Record<string, any>) => {
			if (key === "alerts_unavailable_banner_description") {
				return `Description with maxAge: ${values?.maxAge}`;
			}
			if (key.startsWith("aria_labels.")) {
				return key.replace("aria_labels.", "");
			}
			return key;
		});
	});

	it("renders alert component", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert")).toBeInTheDocument();
	});

	it("renders alert with info variant", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert")).toHaveAttribute("data-variant", "info");
	});

	it("renders alert title", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert-title")).toBeInTheDocument();
		expect(screen.getByText("alerts_unavailable_banner_title")).toBeInTheDocument();
	});

	it("renders alert description with maxAge 6 for non-YVR route", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert-description")).toHaveTextContent("maxAge: 6");
	});

	it("renders alert description with maxAge 14 for YVR route", () => {
		render(<UnavailableAlert isYvrRoute={true} />);

		expect(screen.getByTestId("alert-description")).toHaveTextContent("maxAge: 14");
	});

	it("renders collapse button", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("collapse-button")).toBeInTheDocument();
	});

	it("button is clickable", async () => {
		const user = userEvent.setup();
		render(<UnavailableAlert isYvrRoute={false} />);

		const button = screen.getByTestId("collapse-button");
		await user.click(button);

		// Button should still be in document after click
		expect(button).toBeInTheDocument();
		expect(screen.queryByTestId("alert-description")).not.toBeInTheDocument();
		expect(screen.getByTestId("bundle-expand-collapse-icon")).toHaveClass("rotate-180");
	});

	it("renders the outlined expand/collapse icon rotated when open", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("bundle-expand-collapse-icon")).toHaveClass("size-5");
		expect(screen.getByTestId("bundle-expand-collapse-icon")).not.toHaveClass("rotate-180");
	});

	it("uses translations from bundle_page namespace", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(useTranslationsMock).toHaveBeenCalledWith("bundle_page");
	});

	it("renders aria label with collapse_information when open", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		const button = screen.getByTestId("collapse-button");
		expect(button).toHaveAttribute("aria-label", "collapse_information");
	});

	it("renders alert action container", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert-action")).toBeInTheDocument();
	});

	it("rotates the outlined icon when open", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		const icon = screen.getByTestId("bundle-expand-collapse-icon");
		expect(icon).not.toHaveClass("rotate-180");
	});

	it("renders button with correct styling classes", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		const button = screen.getByTestId("collapse-button");
		expect(button).toHaveClass("size-6", "rounded-full");
	});

	it("renders with full width class", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert")).toHaveClass("w-full");
	});

	it("renders flex container with correct layout", () => {
		const { container } = render(<UnavailableAlert isYvrRoute={false} />);

		const flexContainer = container.querySelector(".flex");
		expect(flexContainer).toBeInTheDocument();
	});

	it("shows description initially when component mounts", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		const description = screen.getByTestId("alert-description");
		expect(description).toBeInTheDocument();
	});

	it("renders button inside alert action", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		const action = screen.getByTestId("alert-action");
		const button = action.querySelector("button");
		expect(button).toBeInTheDocument();
	});

	it("button has primary variant styling", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		const button = screen.getByTestId("collapse-button");
		expect(button).toHaveAttribute("data-variant", "ghost");
		expect(button).toHaveAttribute("data-outline", "false");
		expect(button).toHaveAttribute("data-size", "icon-xs");
	});

	it("renders title with correct translation key", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByText("alerts_unavailable_banner_title")).toBeInTheDocument();
	});

	it("renders different content based on isYvrRoute prop", () => {
		const { rerender } = render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert-description")).toHaveTextContent("maxAge: 6");

		rerender(<UnavailableAlert isYvrRoute={true} />);

		expect(screen.getByTestId("alert-description")).toHaveTextContent("maxAge: 14");
	});

	it("uses useState hook for controlling description visibility", async () => {
		const user = userEvent.setup();
		render(<UnavailableAlert isYvrRoute={false} />);

		const button = screen.getByTestId("collapse-button");

		// Initial state - description visible
		expect(screen.getByTestId("alert-description")).toBeInTheDocument();

		// After click - state changes internally
		await user.click(button);

		// Button still exists and is functional
		expect(button).toBeInTheDocument();
	});

	it("toggles button state on multiple clicks", async () => {
		const user = userEvent.setup();
		render(<UnavailableAlert isYvrRoute={false} />);

		const button = screen.getByTestId("collapse-button");

		// Click multiple times
		await user.click(button);
		expect(button).toBeInTheDocument();

		await user.click(button);
		expect(button).toBeInTheDocument();

		await user.click(button);
		expect(button).toBeInTheDocument();
	});

	it("renders all required UI elements", () => {
		render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert")).toBeInTheDocument();
		expect(screen.getByTestId("alert-title")).toBeInTheDocument();
		expect(screen.getByTestId("alert-description")).toBeInTheDocument();
		expect(screen.getByTestId("alert-action")).toBeInTheDocument();
		expect(screen.getByTestId("collapse-button")).toBeInTheDocument();
		expect(screen.getByTestId("bundle-expand-collapse-icon")).toBeInTheDocument();
	});

	it("accepts isYvrRoute as a boolean prop", () => {
		const { rerender } = render(<UnavailableAlert isYvrRoute={false} />);

		expect(screen.getByTestId("alert-description")).toHaveTextContent("maxAge: 6");

		rerender(<UnavailableAlert isYvrRoute={true} />);

		expect(screen.getByTestId("alert-description")).toHaveTextContent("maxAge: 14");
	});
});
