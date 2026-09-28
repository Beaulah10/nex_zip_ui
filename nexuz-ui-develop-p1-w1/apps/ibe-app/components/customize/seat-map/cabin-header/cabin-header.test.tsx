import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CabinHeader } from "./cabin-header";

describe("CabinHeader", () => {
	it("renders the standard cabin column groups", () => {
		render(<CabinHeader cabinClass="Standard" />);

		expect(screen.getByText("A")).toBeTruthy();
		expect(screen.getByText("B")).toBeTruthy();
		expect(screen.getByText("K")).toBeTruthy();
	});

	it("renders the zip full flat cabin column groups", () => {
		render(<CabinHeader cabinClass="ZipFullFlat" />);

		expect(screen.getByText("A")).toBeTruthy();
		expect(screen.getByText("D")).toBeTruthy();
		expect(screen.getByText("G")).toBeTruthy();
		expect(screen.getByText("K")).toBeTruthy();
	});
});
