/**
 * File: customer-information/page.test.tsx
 * Description: Test cases for CustomerInformationPage.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CustomerInformationPage from "./page";

vi.mock("@/components/customer-information/customer-information", () => ({
	default: () => <div data-testid="customer-information">Customer Information Component</div>,
}));

describe("CustomerInformationPage", () => {
	it("should render CustomerInformation component", async () => {
		const Page = await CustomerInformationPage();

		render(Page);

		expect(screen.getByTestId("customer-information")).toBeTruthy();

		expect(screen.getByText("Customer Information Component")).toBeTruthy();
	});
});
