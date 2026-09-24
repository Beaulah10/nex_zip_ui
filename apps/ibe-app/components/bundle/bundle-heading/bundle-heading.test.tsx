import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BundleHeading from "./bundle-heading";

const useTranslationsMock = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

describe("BundleHeading", () => {
	it("renders stage label and helper text", () => {
		useTranslationsMock.mockReturnValue((key: string, values?: { stageLabel?: string }) => {
			const translations: Record<string, string> = {
				stage_labels_outbound: "Outbound",
				bundle_selection_title: `Bundle ${values?.stageLabel ?? ""}`.trim(),
				bundle_section_helper_sports_equipment: "Sports equipment helper",
				bundle_section_helper_preferred_piece: "preferred piece helper",
				bundle_section_helper_service_package: "Service package helper",
			};

			return translations[key] ?? key;
		});

		render(<BundleHeading stage="outbound" />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Bundle Outbound");
		expect(
			screen.getByText(
				(_, element) =>
					element?.tagName === "P" &&
					element.textContent?.includes("Sports equipment helper") &&
					element.textContent?.includes("preferred piece helper")
			)
		).toBeInTheDocument();
		expect(screen.getByText("Service package helper")).toBeInTheDocument();
		expect(useTranslationsMock).toHaveBeenCalledWith("bundle_page");
	});
});
