import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeatMapPassengerPanel } from "./seat-map-passenger-panel";

HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@/components/customize/seat-map/seat-map-legend/seat-map-legend", () => ({
	SeatMapLegend: ({
		cabinClass,
		complimentaryLegendEligible,
		bundleSeatServiceCodes,
		selectedServiceCode,
	}: {
		cabinClass: string;
		complimentaryLegendEligible: boolean;
		bundleSeatServiceCodes: ReadonlySet<string>;
		selectedServiceCode?: string;
	}) => (
		<div>{`${cabinClass}-${complimentaryLegendEligible ? "bundle" : "paid"}-${bundleSeatServiceCodes.size}-${selectedServiceCode ?? "none"}`}</div>
	),
}));

describe("SeatMapPassengerPanel", () => {
	it("renders passengers, badges, seat data and info banners", () => {
		const onPassengerSelect = vi.fn();

		render(
			<SeatMapPassengerPanel
				flightCode="NRT-BKK"
				cabinClass="Standard"
				activePassengerComplimentaryLegendEligible
				activePassengerBundleSeatServiceCodes={new Set(["STFW"])}
				activePassengerSelectedSeatServiceCode="STFW"
				bundleInfoMessage="bundle info"
				legendPrices={{}}
				activePassengerIndex={1}
				onPassengerSelect={onPassengerSelect}
				passengers={[
					{
						name: "ZIP TARO",
						bundle: "VALUE",
						seatType: "Window",
						seatCode: "12A",
						price: "¥0",
					},
					{
						name: "ZIP HANAKO",
						isInfant: true,
					},
				]}
				adjacentInfoBannerMessages={[
					{
						text: "Adjacent info",
						linkText: "Learn more",
						linkHref: "https://example.com",
					},
				]}
				seatRulesInfoMessages={["Rule 1"]}
			/>
		);

		expect(screen.getByText("passengers")).toBeTruthy();
		expect(screen.getByText("NRT-BKK")).toBeTruthy();
		expect(screen.getByText("ZIP TARO")).toBeTruthy();
		expect(screen.getByText("VALUE")).toBeTruthy();
		expect(screen.getByText("Window")).toBeTruthy();
		expect(screen.getByText("12A")).toBeTruthy();
		expect(screen.getByText("¥0")).toBeTruthy();
		expect(screen.queryByText("¥2,000")).toBeNull();
		expect(screen.getByLabelText("Infant icon")).toBeTruthy();
		expect(screen.getByText("Standard-bundle-1-STFW")).toBeTruthy();
		expect(screen.getByText("Adjacent info")).toBeTruthy();
		expect(screen.getByRole("link", { name: "Learn more" }).getAttribute("href")).toBe(
			"https://example.com"
		);
		expect(screen.getByText("Rule 1")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: /ZIP HANAKO/i }));
		expect(onPassengerSelect).toHaveBeenCalledWith(1);
	});

	it("manages selection internally when no callback is provided", () => {
		render(
			<SeatMapPassengerPanel
				flightCode="NRT-BKK"
				cabinClass="ZipFullFlat"
				activePassengerComplimentaryLegendEligible={false}
				activePassengerBundleSeatServiceCodes={new Set()}
				legendPrices={{}}
				passengers={[
					{ name: "Passenger One" },
					{ name: "Passenger Two", seatCode: "56A", seatType: "Window", price: "¥0" },
				]}
			/>
		);

		expect(screen.getByText("ZipFullFlat-paid-0-none")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: /Passenger Two/i }));
		expect(screen.getByText("56A")).toBeTruthy();
	});

	it("supports keyboard selection on passenger rows", () => {
		const onPassengerSelect = vi.fn();

		render(
			<SeatMapPassengerPanel
				flightCode="NRT-BKK"
				cabinClass="Standard"
				activePassengerComplimentaryLegendEligible={false}
				activePassengerBundleSeatServiceCodes={new Set()}
				legendPrices={{}}
				onPassengerSelect={onPassengerSelect}
				passengers={[{ name: "Passenger One" }, { name: "Passenger Two" }]}
			/>
		);

		const secondPassenger = screen.getByRole("button", { name: /Passenger Two/i });
		fireEvent.keyDown(secondPassenger, { key: "Enter" });
		fireEvent.keyDown(secondPassenger, { key: " " });

		expect(onPassengerSelect).toHaveBeenNthCalledWith(1, 1);
		expect(onPassengerSelect).toHaveBeenNthCalledWith(2, 1);
	});
});
