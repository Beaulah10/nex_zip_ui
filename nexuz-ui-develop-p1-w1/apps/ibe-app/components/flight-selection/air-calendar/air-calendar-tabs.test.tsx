import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AirCalendarTabs } from "./air-calendar-tabs";

vi.mock("@repo/ui/components/tabs", () => ({
	Tabs: ({
		children,
		className,
		defaultValue,
		onValueChange,
		value,
	}: {
		children: React.ReactNode;
		className?: string;
		defaultValue?: string;
		onValueChange?: (value: string) => void;
		value?: string;
	}) => (
		<div
			className={className}
			data-default-value={defaultValue}
			data-testid="tabs-root"
			data-value={value}
		>
			<button onClick={() => onValueChange?.("7-8")} type="button">
				change tab
			</button>
			{children}
		</div>
	),
	TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TabsList: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
		<div data-testid="tabs-list" data-variant={variant}>
			{children}
		</div>
	),
	TabsTrigger: ({
		children,
		disabled,
		value,
		...props
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		value: string;
	}) => (
		<button data-value={value} disabled={disabled} type="button" {...props}>
			{children}
		</button>
	),
}));

describe("AirCalendarTabs", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders tabs, forwards control props, and triggers value changes", () => {
		const onValueChange = vi.fn();

		render(
			<AirCalendarTabs
				className="custom-class"
				onValueChange={onValueChange}
				tabs={[
					{ date: "7/7", price: "JPY 100", value: "7-7" },
					{ date: "7/8", price: "JPY 120", value: "7-8" },
				]}
				value="7-7"
			/>
		);

		expect(screen.getByTestId("tabs-root").dataset.value).toBe("7-7");
		expect(screen.getByTestId("tabs-list").dataset.variant).toBe("line");
		expect(screen.getByRole("button", { name: "7/7 JPY 100" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "7/8 JPY 120" })).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "change tab" }));

		expect(onValueChange).toHaveBeenCalledWith("7-8");
	});

	it("uses the first tab value as the default when no defaultValue is provided and respects disabled tabs", () => {
		render(
			<AirCalendarTabs
				tabs={[
					{ date: "7/7", disabled: true, price: "JPY 100", value: "7-7" },
					{ date: "7/8", price: "JPY 120", value: "7-8" },
				]}
			/>
		);

		expect(screen.getByTestId("tabs-root").dataset.defaultValue).toBe("7-7");
		expect(screen.getByRole("button", { name: "7/7 JPY 100" }).hasAttribute("disabled")).toBe(true);
	});
});
