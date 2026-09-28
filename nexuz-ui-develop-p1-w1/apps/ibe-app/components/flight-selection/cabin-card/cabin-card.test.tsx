import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CabinCard } from "./cabin-card";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		if (key === "adult_label") return "Adult";
		if (key === "seat_left_label") return "seats left";
		if (key === "alt_seat_img") return "seat image";
		return key;
	},
}));

vi.mock("next/image", () => ({
	default: ({ alt, ...props }: any) => (
		<span role="img" aria-label={alt} data-testid="mock-next-image" {...props} />
	),
}));

vi.mock("@repo/ui/components/card", () => ({
	Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
		<div {...props}>{children}</div>
	),
	CardContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
		<div {...props}>{children}</div>
	),
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
		<div {...props}>{children}</div>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

describe("CabinCard", () => {
	it("renders adult-only price content and low seat badge", () => {
		render(
			<CabinCard
				cabinType="Standard"
				mobileImage="/standard.png"
				desktopImage="/standard.png"
				prices={{ adult: "JPY 12000" }}
				seatsLeft={3}
			/>
		);

		expect(screen.getByText("Adult")).toBeTruthy();
		expect(screen.getByText("JPY 12000")).toBeTruthy();
		expect(screen.getByText("3 seats left")).toBeTruthy();
		expect(screen.getAllByRole("img", { name: "Standard seat image" })).toHaveLength(2);
	});

	it("renders multi-passenger rows when extras are present", () => {
		render(
			<CabinCard
				cabinType="ZIP Full-Flat"
				mobileImage="/zip.png"
				desktopImage="/zip.png"
				prices={{
					adult: "JPY 20000",
					extras: [
						{ label: "Child", price: "JPY 10000" },
						{ label: "Infant", price: "JPY 3000" },
					],
				}}
			/>
		);

		expect(screen.getByText("JPY 20000")).toBeTruthy();
		expect(screen.getByText("Child")).toBeTruthy();
		expect(screen.getByText("JPY 10000")).toBeTruthy();
		expect(screen.getByText("Infant")).toBeTruthy();
		expect(screen.getByText("JPY 3000")).toBeTruthy();
	});

	it("supports click and Enter keyboard activation when interactive", () => {
		const onClick = vi.fn();
		render(
			<CabinCard
				cabinType="Standard"
				mobileImage="/standard.png"
				desktopImage="/standard.png"
				prices={{ adult: "JPY 12000" }}
				onClick={onClick}
				selected
			/>
		);

		const card = screen.getByRole("button");
		expect(card.getAttribute("aria-pressed")).toBe("true");

		fireEvent.click(card);
		fireEvent.keyDown(card, { key: "Enter" });
		fireEvent.keyDown(card, { key: "Space" });

		expect(onClick).toHaveBeenCalledTimes(2);
	});

	it("renders disabled state with message and blocks interactions", () => {
		const onClick = vi.fn();
		render(
			<CabinCard
				cabinType="ZIP Full-Flat"
				mobileImage="/zip.png"
				desktopImage="/zip.png"
				prices={{ adult: "JPY 20000" }}
				isDisabled
				disabledMessage="No available seats"
				onClick={onClick}
				seatsLeft={9}
			/>
		);

		expect(screen.getByText("No available seats")).toBeTruthy();
		expect(screen.getByTestId("icon-info")).toBeTruthy();
		expect(screen.queryByRole("button")).toBeNull();

		const card = screen.getByText("No available seats").closest("div[aria-disabled='true']");
		expect(card).toBeTruthy();
		if (card) {
			fireEvent.click(card);
		}
		expect(onClick).not.toHaveBeenCalled();
		expect(screen.queryByText(/seats left/)).toBeNull();
	});
});
