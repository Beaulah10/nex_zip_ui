import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BusinessCabinHeader } from "./business-cabin-header";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key.split("_").at(-1)?.toUpperCase() ?? key,
}));

describe("BusinessCabinHeader", () => {
	it("renders all translated business cabin columns", () => {
		render(<BusinessCabinHeader />);

		expect(screen.getByText("A")).toBeTruthy();
		expect(screen.getByText("D")).toBeTruthy();
		expect(screen.getByText("G")).toBeTruthy();
		expect(screen.getByText("K")).toBeTruthy();
	});
});
