import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArrivalModal from "@/components/flight-search/location/arrival-modal/arrival-modal";

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
	isConnectingFlightRoute: (_tripType: string, origin: string, destination: string) =>
		origin !== "NRT" && destination !== "NRT",
}));

describe("ArrivalModal", () => {
	it("renders arrival placeholder and emits selected value", () => {
		const onClick = vi.fn();
		render(
			<ArrivalModal
				iata={["SIN", "ICN"]}
				value=""
				tripType="one-way"
				origin="BKK"
				onClick={onClick}
			/>
		);

		expect(screen.getByText("Arrival Location")).toBeDefined();
		fireEvent.click(screen.getByRole("button", { name: "SIN" }));
		expect(onClick).toHaveBeenCalledWith("SIN");
	});
});
