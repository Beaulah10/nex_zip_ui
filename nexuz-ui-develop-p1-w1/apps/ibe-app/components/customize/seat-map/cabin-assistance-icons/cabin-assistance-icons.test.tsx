import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CabinAssistanceIcons } from "./cabin-assistance-icons";

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

describe("CabinAssistanceIcons", () => {
	it("renders the full icon group by default", () => {
		render(<CabinAssistanceIcons />);

		// Each icon is rendered twice (a mobile-size and a desktop-size variant,
		// toggled via responsive classes), so 3 logical "wc" icons appear 6 times.
		expect(screen.getAllByText("wc")).toHaveLength(6);
		expect(screen.getAllByText("accessible")).toHaveLength(2);
	});

	it("hides the middle accessible group when requested", () => {
		render(<CabinAssistanceIcons showAccessibleGroup={false} />);

		expect(screen.getAllByText("wc")).toHaveLength(4);
		expect(screen.queryByText("accessible")).toBeNull();
	});
});
