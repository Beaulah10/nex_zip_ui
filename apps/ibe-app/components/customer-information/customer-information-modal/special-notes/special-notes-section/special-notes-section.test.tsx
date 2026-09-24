/**
 * File: special-notes.test.tsx
 * Classification: Component
 * Description: Tests for SpecialNotes composite component.
 * Verifies all four sub-sections are always rendered.
 */

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpecialNotes } from "@/components/customer-information/customer-information-modal/special-notes/special-notes-section/special-notes-section";
import { renderWithFormAndProviders } from "@/modules/utils/helpers/customer-information/test-utils";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/travel-documents/travel-documents",
	() => ({
		TravelDocumentsSection: () => <div data-testid="travel-documents-section" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/pregnant-section/pregnant-section",
	() => ({
		PregnantSection: () => <div data-testid="pregnant-section" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/assistance-section/assistance-section",
	() => ({
		AssistanceSection: () => <div data-testid="assistance-section" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/special-notes/service-dogs-section/service-dogs-section",
	() => ({
		ServiceDogsSection: () => <div data-testid="service-dogs-section" />,
	})
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SpecialNotes", () => {
	it("renders TravelDocumentsSection", () => {
		renderWithFormAndProviders(<SpecialNotes />);
		expect(screen.getByTestId("travel-documents-section")).toBeTruthy();
	});

	it("renders PregnantSection", () => {
		renderWithFormAndProviders(<SpecialNotes />);
		expect(screen.getByTestId("pregnant-section")).toBeTruthy();
	});

	it("renders AssistanceSection", () => {
		renderWithFormAndProviders(<SpecialNotes />);
		expect(screen.getByTestId("assistance-section")).toBeTruthy();
	});

	it("renders ServiceDogsSection", () => {
		renderWithFormAndProviders(<SpecialNotes />);
		expect(screen.getByTestId("service-dogs-section")).toBeTruthy();
	});

	it("renders all four sections together", () => {
		renderWithFormAndProviders(<SpecialNotes />);
		expect(screen.getByTestId("travel-documents-section")).toBeTruthy();
		expect(screen.getByTestId("pregnant-section")).toBeTruthy();
		expect(screen.getByTestId("assistance-section")).toBeTruthy();
		expect(screen.getByTestId("service-dogs-section")).toBeTruthy();
	});
});
