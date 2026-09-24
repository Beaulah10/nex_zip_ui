/**
 * File: basic-information.test.tsx
 * Classification: Component
 * Description: Tests for BasicInformation composite component.
 * Verifies conditional rendering of DestinationSection based on route type.
 */

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BasicInformation } from "@/components/customer-information/customer-information-modal/basic-details/basic-information/basic-information";
import {
	makePassenger,
	renderWithFormAndProviders,
} from "@/modules/utils/helpers/customer-information/test-utils";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock(
	"@/components/customer-information/customer-information-modal/basic-details/personal-information/personal-information",
	() => ({
		PersonalInformation: () => <div data-testid="personal-information" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/basic-details/passport-section/passport-section",
	() => ({
		PassportSection: () => <div data-testid="passport-section" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/basic-details/contact-section/contact-section",
	() => ({
		ContactSection: () => <div data-testid="contact-section" />,
	})
);

vi.mock(
	"@/components/customer-information/customer-information-modal/basic-details/destination-section/destination-section",
	() => ({
		DestinationSection: () => <div data-testid="destination-section" />,
	})
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderBasicInfo(isUsRoute = false, isThaiRoute = false) {
	const pax = makePassenger();
	return renderWithFormAndProviders(
		<BasicInformation
			passenger={pax}
			isUsRoute={isUsRoute}
			isThaiRoute={isThaiRoute}
			isPrimary={false}
			onClickCopyToPassenger={vi.fn()}
		/>,
		{ passengers: [pax] }
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BasicInformation - always renders", () => {
	it("renders PersonalInformation", () => {
		renderBasicInfo();
		expect(screen.getByTestId("personal-information")).toBeTruthy();
	});

	it("renders PassportSection", () => {
		renderBasicInfo();
		expect(screen.getByTestId("passport-section")).toBeTruthy();
	});

	it("renders ContactSection", () => {
		renderBasicInfo();
		expect(screen.getByTestId("contact-section")).toBeTruthy();
	});
});

describe("BasicInformation - DestinationSection visibility", () => {
	it("does not render DestinationSection for non-US non-Thai route", () => {
		renderBasicInfo(false, false);
		expect(screen.queryByTestId("destination-section")).toBeFalsy();
	});

	it("renders DestinationSection for US route", () => {
		renderBasicInfo(true, false);
		expect(screen.getByTestId("destination-section")).toBeTruthy();
	});

	it("renders DestinationSection for Thai route", () => {
		renderBasicInfo(false, true);
		expect(screen.getByTestId("destination-section")).toBeTruthy();
	});

	it("renders DestinationSection when both US and Thai are true", () => {
		renderBasicInfo(true, true);
		expect(screen.getByTestId("destination-section")).toBeTruthy();
	});
});
