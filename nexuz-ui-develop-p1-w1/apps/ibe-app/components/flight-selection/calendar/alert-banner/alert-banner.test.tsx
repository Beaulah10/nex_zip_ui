import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AlertBanner from "./alert-banner";

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("AlertBanner", () => {
	it("renders message", () => {
		render(<AlertBanner message="Calendar warning" />);
		expect(screen.getByText("Calendar warning")).toBeDefined();
		expect(screen.getByTestId("alert")).toBeDefined();
	});
});
