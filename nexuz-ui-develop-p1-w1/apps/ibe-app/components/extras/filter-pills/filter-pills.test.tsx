import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterPills } from "@/components/extras/filter-pills/filter-pills";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

const onCategoryChange = vi.fn();

describe("FilterPills", () => {
	it("renders the category filter section header", () => {
		render(
			<FilterPills
				title="Outbound Ancillary - Optional Services"
				onCategoryChange={onCategoryChange}
			/>
		);

		expect(screen.getAllByText("choose_by_category").length).toBeGreaterThan(0);
	});

	it("renders the all-category button", () => {
		render(<FilterPills title="Extras" onCategoryChange={onCategoryChange} />);

		expect(screen.getAllByText("All").length).toBeGreaterThan(0);
	});

	it("renders all category buttons", () => {
		render(<FilterPills title="Extras" onCategoryChange={onCategoryChange} />);

		expect(screen.getAllByText("All").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Amenities").length).toBeGreaterThan(0);
	});

	it("calls onCategoryChange with the category id when a button is clicked", () => {
		const handleChange = vi.fn();

		render(<FilterPills title="Extras" onCategoryChange={handleChange} />);

		const allButtons = screen.getAllByRole("button", { name: "All" });
		fireEvent.click(allButtons[0] as HTMLElement);

		expect(handleChange).toHaveBeenCalledWith("all");
	});

	it("applies active styles to the selected category button", () => {
		render(
			<FilterPills
				title="Extras"
				onCategoryChange={onCategoryChange}
				selectedCategoryIds={["amenities"]}
			/>
		);

		const activeButtons = screen
			.getAllByRole("button", { name: "Amenities" })
			.filter((button) => button.className.includes("border-primary-600"));

		expect(activeButtons.length).toBeGreaterThan(0);
	});
});
