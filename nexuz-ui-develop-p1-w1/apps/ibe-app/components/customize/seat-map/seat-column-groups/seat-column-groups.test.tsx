import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeatColumnGroups } from "./seat-column-groups";

describe("SeatColumnGroups", () => {
	it("renders cells and spacers between groups", () => {
		render(
			<SeatColumnGroups
				columnGroups={[["A", "B"], ["C"]]}
				renderCell={(column, groupIndex) => <span>{`${groupIndex}-${column}`}</span>}
				renderSpacer={(groupIndex) => <span>{`spacer-${groupIndex}`}</span>}
			/>
		);

		expect(screen.getByText("0-A")).toBeTruthy();
		expect(screen.getByText("0-B")).toBeTruthy();
		expect(screen.getByText("1-C")).toBeTruthy();
		expect(screen.getByText("spacer-0")).toBeTruthy();
	});

	it("omits spacers when no renderSpacer prop is supplied", () => {
		render(
			<SeatColumnGroups
				columnGroups={[["A"], ["B"]]}
				renderCell={(column) => <span>{column}</span>}
			/>
		);

		expect(screen.getByText("A")).toBeTruthy();
		expect(screen.getByText("B")).toBeTruthy();
	});
});
