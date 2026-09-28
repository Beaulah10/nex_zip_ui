import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExtrasSection } from "./extras-section";

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => (
		<span data-testid="badge">{children}</span>
	),
}));

const baseProduct = {
	id: "p1",
	categoryId: "amenities" as const,
	ssrCode: "WIFI",
	qtyAvailable: 5,
	name: "WiFi",
	price: 1000,
	imageSrc: "/wifi.png",
	images: [],
	serviceID: 1,
	lfid: 100,
	cutOffHours: 2,
	maxCountServiceLevel: 5,
	numericCategoryId: 1,
	passengerType: "ADT",
};

describe("ExtrasSection", () => {
	// ── Empty products ─────────────────────────────────────────────────────

	it("renders nothing when products array is empty", () => {
		const { container } = render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[]}
				onCardClick={vi.fn()}
			/>
		);

		expect(container.firstChild).toBeNull();
	});

	it("does not render the title when products array is empty", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.queryByText("Amenities")).not.toBeInTheDocument();
	});

	// ── Title & product grid ───────────────────────────────────────────────

	it("renders the section title when products are present", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[baseProduct]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.getByText("Amenities")).toBeInTheDocument();
	});

	it("renders a card for each product", () => {
		const products = [
			{ ...baseProduct, id: "p1", name: "WiFi" },
			{ ...baseProduct, id: "p2", name: "Blanket" },
		];

		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={products}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.getByText("WiFi")).toBeInTheDocument();
		expect(screen.getByText("Blanket")).toBeInTheDocument();
	});

	// ── Card click ────────────────────────────────────────────────────────

	it("calls onCardClick with the product id when a card button is clicked", () => {
		const onCardClick = vi.fn();

		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[baseProduct]}
				onCardClick={onCardClick}
			/>
		);

		fireEvent.click(screen.getByRole("button"));

		expect(onCardClick).toHaveBeenCalledWith("p1");
	});

	it("calls onCardClick for the correct product when multiple products are rendered", () => {
		const onCardClick = vi.fn();
		const products = [
			{ ...baseProduct, id: "p1", name: "WiFi" },
			{ ...baseProduct, id: "p2", name: "Blanket" },
		];

		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={products}
				onCardClick={onCardClick}
			/>
		);

		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[1] as HTMLElement);

		expect(onCardClick).toHaveBeenCalledWith("p2");
	});

	it("does not call onCardClick when the product is disabled", () => {
		const onCardClick = vi.fn();

		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[{ ...baseProduct, disabled: true }]}
				onCardClick={onCardClick}
			/>
		);

		fireEvent.click(screen.getByRole("button", { hidden: true }));

		expect(onCardClick).not.toHaveBeenCalled();
	});

	// ── Keyboard interaction ──────────────────────────────────────────────
	it("does not call onCardClick when Enter is pressed on a disabled card", () => {
		const onCardClick = vi.fn();

		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[{ ...baseProduct, disabled: true }]}
				onCardClick={onCardClick}
			/>
		);

		fireEvent.keyDown(screen.getByRole("button", { hidden: true }), { key: "Enter" });

		expect(onCardClick).not.toHaveBeenCalled();
	});

	// ── Disabled card ─────────────────────────────────────────────────────

	it("renders the card button as disabled when the product is disabled", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[{ ...baseProduct, disabled: true }]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.getByRole("button", { hidden: true })).toBeDisabled();
	});

	it("renders the card button as enabled when the product is not disabled", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[baseProduct]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.getByRole("button")).not.toBeDisabled();
	});

	// ── Selected state ────────────────────────────────────────────────────

	it("passes selected=true to the product card when the product id is in selectedProductIds", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[baseProduct]}
				selectedProductIds={["p1"]}
				onCardClick={vi.fn()}
			/>
		);

		// ExtraServices renders icon-check when selected
		expect(screen.getByTestId("icon-check")).toBeInTheDocument();
	});

	it("passes selected=false when the product id is not in selectedProductIds", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[baseProduct]}
				selectedProductIds={["other-id"]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
	});

	it("defaults to no selected products when selectedProductIds is not provided", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[baseProduct]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
	});

	// ── Premium bundle badge ──────────────────────────────────────────────

	it("shows the included badge when inPremiumBundle is true", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[{ ...baseProduct, inPremiumBundle: true }]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.getByTestId("badge")).toBeInTheDocument();
	});

	it("does not show the badge when inPremiumBundle is false", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[{ ...baseProduct, inPremiumBundle: false }]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
	});

	// ── Remaining label ───────────────────────────────────────────────────

	it("renders the remaining label when provided", () => {
		render(
			<ExtrasSection
				bundledPassengerIdsByProductId={{}}
				title="Amenities"
				products={[{ ...baseProduct, remainingLabel: "3 left" }]}
				onCardClick={vi.fn()}
			/>
		);

		expect(screen.getByText("3 left")).toBeInTheDocument();
	});
});
