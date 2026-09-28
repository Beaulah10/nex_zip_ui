import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DepartureModal from "@/components/flight-search/location/departure-modal/departure-modal";

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
	DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/item", () => ({
	Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemDescription: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
	ItemTitle: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/flight-search/location/menu-item/menu-item", () => ({
	default: ({ item, onClick }: { item: string; onClick: (value: string) => void }) => (
		<button type="button" onClick={() => onClick(item)}>
			{item}
		</button>
	),
}));

vi.mock("@/modules/utils/helpers/flight-search-helper/flight-search-helper", () => ({
	getAirportByIata: (iata: string) => ({
		iata,
		city: iata === "NRT" ? "Tokyo" : "Singapore",
		airport: iata === "NRT" ? "Narita International Airport" : "Changi Airport",
		country: iata === "NRT" ? "Japan" : "Singapore",
	}),
}));

describe("DepartureModal", () => {
	it("renders departure placeholder and emits selected value", () => {
		const onClick = vi.fn();
		render(
			<DepartureModal
				iata={["NRT", "ICN"]}
				value=""
				tripType="round-trip"
				origin=""
				onClick={onClick}
			/>
		);

		expect(screen.getByText("Departure Location")).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: "NRT" }));
		expect(onClick).toHaveBeenCalledWith("NRT");
	});
});
