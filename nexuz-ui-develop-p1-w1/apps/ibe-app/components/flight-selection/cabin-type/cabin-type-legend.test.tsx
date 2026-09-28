import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CabinTypeLegend } from "./cabin-type-legend";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => (key === "zip_full_flat_label" ? "ZIP Full-Flat" : key),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

describe("CabinTypeLegend", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders info content, custom icon, fallback icon, and link callback", () => {
		const onInfoLinkClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
			event.preventDefault();
		});

		render(
			<CabinTypeLegend
				cabinTypes={[
					{ icon: "airline_seat_recline_normal", label: "Standard" },
					{ label: "ZIP Full-Flat" },
				]}
				infoText="More information on"
				infoLinkHref="/cabins"
				infoLinkText="Standard and ZIP Full-Flat"
				onInfoLinkClick={onInfoLinkClick}
			/>
		);

		expect(screen.getByText("More information on")).toBeTruthy();
		expect(screen.getByRole("link", { name: "Standard and ZIP Full-Flat" })).toBeTruthy();
		expect(screen.getByTestId("icon-info")).toBeTruthy();
		expect(screen.getByTestId("icon-airline_seat_recline_normal")).toBeTruthy();
		expect(screen.getByTestId("icon-airline_seat_recline_extra")).toBeTruthy();

		fireEvent.click(screen.getByRole("link", { name: "Standard and ZIP Full-Flat" }));

		expect(onInfoLinkClick).toHaveBeenCalledTimes(1);
	});

	it("omits the info block when both infoText and infoLinkText are missing", () => {
		render(<CabinTypeLegend cabinTypes={[{ label: "Standard" }]} />);

		expect(screen.queryByTestId("icon-info")).toBeNull();
		expect(screen.getByText("Standard")).toBeTruthy();
	});
});
