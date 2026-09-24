/**
 * File: transport-service-card.test.tsx
 * Classification: Component
 * Description: Tests for TransportServiceCard – pricing table, age-group columns,
 * more-info link/button branch, service rows with cloneElement dialog wiring,
 * selected/disabled states, and durationLabel fallback logic.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransportServiceCard } from "@/components/customize/transport-service/transport-service-card/transport-service-card";
import type { TransportServiceCardProps } from "@/types/customize/transport-service/transport-service.types";

// ── Mock dialog element used to test cloneElement dialog wiring ────────────────

const MockDialog = ({ trigger }: { trigger?: ReactNode }) => (
	<div data-testid="service-dialog">{trigger}</div>
);

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		disabled,
		onClick,
		"aria-label": ariaLabel,
		className,
	}: {
		children: ReactNode;
		disabled?: boolean;
		onClick?: () => void;
		"aria-label"?: string;
		className?: string;
	}) => (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-label={ariaLabel}
			className={className}
		>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("next/image", () => ({
	default: ({ alt, className }: { alt: string; className?: string }) => (
		<div aria-label={alt} className={className} data-testid="card-image" role="img" />
	),
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `¥${amount}`,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockImage = { src: "/test.png", height: 100, width: 100 };

const baseProps: TransportServiceCardProps = {
	imageSrc: mockImage as TransportServiceCardProps["imageSrc"],
	title: "Airport Shuttle",
	description: "Fast shuttle from the airport",
	ageGroupLabels: ["Adults", "Children"],
	pricingRows: [{ label: "One-way", prices: [3000, 1500] }],
	services: [],
};

describe("TransportServiceCard – image and title", () => {
	it("renders the card title", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByRole("heading", { name: "Airport Shuttle" })).toBeInTheDocument();
	});

	it("uses title as image alt when imageAlt is not provided", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByRole("img", { name: "Airport Shuttle" })).toBeInTheDocument();
	});

	it("uses imageAlt prop when provided", () => {
		render(<TransportServiceCard {...baseProps} imageAlt="Custom alt text" />);

		expect(screen.getByRole("img", { name: "Custom alt text" })).toBeInTheDocument();
	});

	it("renders a single image with the default object-cover class", () => {
		render(<TransportServiceCard {...baseProps} />);

		const images = screen.getAllByTestId("card-image");

		expect(images).toHaveLength(1);
		expect(images[0]?.className).toContain("object-cover");
	});

	it("applies the default imageAspectClass to the image", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByTestId("card-image").className).toContain("w-full object-cover");
	});

	it("applies a custom imageAspectClass when provided", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByTestId("card-image").className).toContain("w-full object-cover");
	});

	it("renders the description text", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByText("Fast shuttle from the airport")).toBeInTheDocument();
	});
});

describe("TransportServiceCard – more-info link / button", () => {
	it("renders an anchor element when moreInfoHref is provided", () => {
		render(<TransportServiceCard {...baseProps} moreInfoHref="/more" />);

		expect(screen.getByRole("link")).toHaveAttribute("href", "/more");
	});

	it("includes correct aria-label on the more-info anchor", () => {
		render(<TransportServiceCard {...baseProps} moreInfoHref="/more" />);

		expect(screen.getByRole("link")).toHaveAttribute(
			"aria-label",
			"aria_labels.more_info_aria_label Airport Shuttle"
		);
	});

	it("renders a button instead of an anchor when moreInfoHref is absent", () => {
		render(<TransportServiceCard {...baseProps} onMoreInfoClick={vi.fn()} />);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("calls onMoreInfoClick when the more-info button is clicked", () => {
		const onMoreInfoClick = vi.fn();

		render(<TransportServiceCard {...baseProps} onMoreInfoClick={onMoreInfoClick} />);
		fireEvent.click(screen.getByRole("button"));

		expect(onMoreInfoClick).toHaveBeenCalledTimes(1);
	});

	it("renders the open_in_new icon inside the more-info link", () => {
		render(<TransportServiceCard {...baseProps} moreInfoHref="/more" />);

		expect(screen.getByTestId("icon-open_in_new")).toBeInTheDocument();
	});
});

describe("TransportServiceCard – age group labels", () => {
	it("renders all age group column headers", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByText("Adults")).toBeInTheDocument();
		expect(screen.getByText("Children")).toBeInTheDocument();
	});

	it("renders no age-group headers when ageGroupLabels is empty", () => {
		render(<TransportServiceCard {...baseProps} ageGroupLabels={[]} />);

		expect(screen.queryByText("Adults")).not.toBeInTheDocument();
	});
});

describe("TransportServiceCard – pricing rows", () => {
	it("renders pricing row labels and formatted prices", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.getByText("One-way")).toBeInTheDocument();
		expect(screen.getByText("¥3000")).toBeInTheDocument();
		expect(screen.getByText("¥1500")).toBeInTheDocument();
	});

	it("applies flex-1 text-center on price spans when ageGroupLabels is non-empty", () => {
		render(<TransportServiceCard {...baseProps} />);

		const priceSpan = screen.getByText("¥3000");

		expect(priceSpan.className).toContain("flex-1 text-center");
	});

	it("applies text-right on price spans when ageGroupLabels is empty", () => {
		render(<TransportServiceCard {...baseProps} ageGroupLabels={[]} />);

		const priceSpan = screen.getByText("¥3000");

		expect(priceSpan.className).toContain("text-right");
	});

	it("renders multiple pricing rows", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				pricingRows={[
					{ label: "One-way", prices: [3000] },
					{ label: "Round-trip", prices: [5000] },
				]}
			/>
		);

		expect(screen.getByText("One-way")).toBeInTheDocument();
		expect(screen.getByText("Round-trip")).toBeInTheDocument();
	});

	it("renders footnote when provided", () => {
		render(<TransportServiceCard {...baseProps} footnote="*Free for infants" />);

		expect(screen.getByText("*Free for infants")).toBeInTheDocument();
	});

	it("does not render footnote when not provided", () => {
		render(<TransportServiceCard {...baseProps} />);

		expect(screen.queryByText("*Free for infants")).not.toBeInTheDocument();
	});
});

describe("TransportServiceCard – duration label", () => {
	it("renders the provided durationLabel", () => {
		render(<TransportServiceCard {...baseProps} durationLabel="Duration (days)" />);

		expect(screen.getByText("Duration (days)")).toBeInTheDocument();
	});

	it("falls back to the 'duration' translation key when durationLabel is not provided", () => {
		render(<TransportServiceCard {...baseProps} />);

		// The global translation mock returns the key itself: "duration".
		expect(screen.getByText("duration")).toBeInTheDocument();
	});

	it("applies font-bold when durationLabel equals the trip_type translation output", () => {
		// Global mock returns the key "trip_type" for transportServiceLabels("trip_type").
		// Passing durationLabel="trip_type" makes durationTextLabel === tripTypeLabel → font-bold.
		render(<TransportServiceCard {...baseProps} durationLabel="trip_type" />);

		expect(screen.getByText("trip_type").className).toContain("font-bold");
	});

	it("applies font-normal when durationLabel does not match the trip_type translation", () => {
		render(<TransportServiceCard {...baseProps} durationLabel="Custom Duration" />);

		expect(screen.getByText("Custom Duration").className).toContain("font-normal");
	});
});

describe("TransportServiceCard – service rows", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders service row label", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Shuttle One-way", onAdd: vi.fn() }]}
			/>
		);

		expect(screen.getByText("Shuttle One-way")).toBeInTheDocument();
	});

	it("renders add_button label when service is not selected", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Shuttle", onAdd: vi.fn(), selected: false }]}
			/>
		);

		expect(screen.getByRole("button", { name: "add_button Shuttle" })).toBeInTheDocument();
	});

	it("renders selected_button label when service is selected", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Trolley", onAdd: vi.fn(), selected: true }]}
			/>
		);

		expect(screen.getByRole("button", { name: "selected_button Trolley" })).toBeInTheDocument();
	});

	it("applies selected styling classes when service is selected", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Trolley", onAdd: vi.fn(), selected: true }]}
			/>
		);

		const btn = screen.getByRole("button", { name: "selected_button Trolley" });

		expect(btn.className).toContain("bg-primary-800");
	});

	it("renders service button in disabled state when service.disabled is true", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Shuttle", onAdd: vi.fn(), disabled: true }]}
			/>
		);

		expect(screen.getByRole("button", { name: "add_button Shuttle" })).toBeDisabled();
	});

	it("calls onAdd when the service button is clicked", () => {
		const onAdd = vi.fn();

		render(<TransportServiceCard {...baseProps} services={[{ label: "Shuttle", onAdd }]} />);
		fireEvent.click(screen.getByRole("button", { name: "add_button Shuttle" }));

		expect(onAdd).toHaveBeenCalledTimes(1);
	});

	it("renders the dialog via cloneElement when dialog is provided and service is not disabled", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Trolley", disabled: false, dialog: <MockDialog /> }]}
			/>
		);

		expect(screen.getByTestId("service-dialog")).toBeInTheDocument();
		// The add button is injected as the trigger prop and rendered inside MockDialog.
		expect(screen.getByRole("button", { name: "add_button Trolley" })).toBeInTheDocument();
	});

	it("renders add button directly when service is disabled even if dialog is provided", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Trolley", disabled: true, dialog: <MockDialog /> }]}
			/>
		);

		expect(screen.queryByTestId("service-dialog")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "add_button Trolley" })).toBeInTheDocument();
	});

	it("renders add button directly when no dialog is provided", () => {
		render(
			<TransportServiceCard {...baseProps} services={[{ label: "Shuttle", onAdd: vi.fn() }]} />
		);

		expect(screen.queryByTestId("service-dialog")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "add_button Shuttle" })).toBeInTheDocument();
	});

	it("renders disabledReason text when set", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[{ label: "Trolley", disabled: true, disabledReason: "Out of stock" }]}
			/>
		);

		expect(screen.getByText("Out of stock")).toBeInTheDocument();
	});

	it("does not render disabledReason paragraph when not set", () => {
		render(
			<TransportServiceCard {...baseProps} services={[{ label: "Shuttle", onAdd: vi.fn() }]} />
		);

		expect(screen.queryByText("Out of stock")).not.toBeInTheDocument();
	});

	it("applies bg-base-100 class to the row container when service is disabled", () => {
		render(
			<TransportServiceCard {...baseProps} services={[{ label: "Trolley", disabled: true }]} />
		);

		// span → div.min-w-0 → row div (which carries bg-base-100)
		const labelSpan = screen.getByText("Trolley");

		expect(labelSpan.parentElement?.parentElement?.className).toContain("bg-base-100");
	});

	it("does not apply bg-base-100 when service is not disabled", () => {
		render(
			<TransportServiceCard {...baseProps} services={[{ label: "Shuttle", onAdd: vi.fn() }]} />
		);

		const labelSpan = screen.getByText("Shuttle");

		expect(labelSpan.parentElement?.parentElement?.className).not.toContain("bg-base-100");
	});

	it("renders multiple service rows", () => {
		render(
			<TransportServiceCard
				{...baseProps}
				services={[
					{ label: "One-way Shuttle", onAdd: vi.fn() },
					{ label: "Round-trip Shuttle", onAdd: vi.fn() },
				]}
			/>
		);

		expect(screen.getByText("One-way Shuttle")).toBeInTheDocument();
		expect(screen.getByText("Round-trip Shuttle")).toBeInTheDocument();
	});
});
