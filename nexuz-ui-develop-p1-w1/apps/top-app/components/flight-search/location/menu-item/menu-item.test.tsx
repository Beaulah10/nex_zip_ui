import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MenuItem from "@/components/flight-search/location/menu-item/menu-item";

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/item", () => ({
	Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ItemDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	ItemTitle: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe("MenuItem", () => {
	it("renders airport details and invokes onClick", () => {
		const onClick = vi.fn();
		render(<MenuItem item="NRT" value="NRT" onClick={onClick} isViaTokyoNarita={true} />);

		expect(screen.getByText("Tokyo (NRT)")).toBeDefined();
		expect(screen.getByText(/via Tokyo Narita/)).toBeDefined();
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledWith("NRT");
	});
});
