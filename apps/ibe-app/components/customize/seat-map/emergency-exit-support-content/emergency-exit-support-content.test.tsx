import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmergencyExitSupportContent } from "./emergency-exit-support-content";

const { tMock } = vi.hoisted(() => ({
	tMock: vi.fn((key: string) => key),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => tMock,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
		type,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: "button";
	}) => (
		<button type={type} onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/checkbox", () => ({
	Checkbox: ({
		id,
		checked,
		onCheckedChange,
	}: {
		id: string;
		checked: boolean;
		onCheckedChange: (checked: boolean) => void;
	}) => (
		<input
			id={id}
			type="checkbox"
			checked={checked}
			onChange={(event) => onCheckedChange(event.target.checked)}
		/>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

beforeEach(() => {
	window.requestAnimationFrame = vi.fn(() => 0);

	Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
		writable: true,
		value: vi.fn(),
	});

	Object.defineProperty(window.HTMLElement.prototype, "focus", {
		writable: true,
		value: vi.fn(),
	});
});
describe("EmergencyExitSupportContent", () => {
	it("delegates all cancel affordances without confirming", { timeout: 15000 }, () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		render(
			<EmergencyExitSupportContent routeLabel="NRT-BKK" onConfirm={onConfirm} onCancel={onCancel} />
		);

		expect(screen.getByText("emergency_exit_seat_confirmation")).toBeTruthy();
		fireEvent.click(screen.getByLabelText("aria_labels.back_button"));
		fireEvent.click(screen.getByLabelText("aria_labels.close_button"));
		fireEvent.click(screen.getByRole("button", { name: "close" }));

		expect(onCancel).toHaveBeenCalledTimes(3);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it("shows the checklist error and focuses the banner when agree is clicked too early", async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		const scrollIntoViewMock = vi.fn();
		const focusMock = vi.fn();
		let rafCallback: FrameRequestCallback | undefined;
		const rafMock = vi.fn((callback: FrameRequestCallback) => {
			rafCallback = callback;
			return 0;
		});

		window.requestAnimationFrame = rafMock;
		Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
			writable: true,
			value: scrollIntoViewMock,
		});
		Object.defineProperty(window.HTMLElement.prototype, "focus", {
			writable: true,
			value: focusMock,
		});

		render(
			<EmergencyExitSupportContent routeLabel="NRT-BKK" onConfirm={onConfirm} onCancel={onCancel} />
		);

		fireEvent.click(screen.getByRole("button", { name: "agree_and_select" }));

		expect(screen.getByText("error_labels.checklist_required")).toBeTruthy();
		expect(onConfirm).not.toHaveBeenCalled();
		expect(rafMock).toHaveBeenCalledTimes(1);
		expect(rafCallback).toBeTruthy();
		rafCallback?.(0);
		expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
		expect(focusMock).toHaveBeenCalledTimes(1);
	});

	it("confirms once every checklist item is selected", () => {
		const onConfirm = vi.fn();

		render(
			<EmergencyExitSupportContent routeLabel="NRT-BKK" onConfirm={onConfirm} onCancel={vi.fn()} />
		);

		fireEvent.click(screen.getByRole("button", { name: "agree_and_select" }));
		expect(screen.getByText("error_labels.checklist_required")).toBeTruthy();

		for (const checkbox of screen.getAllByRole("checkbox")) {
			fireEvent.click(checkbox);
		}

		expect(screen.queryByText("error_labels.checklist_required")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "agree_and_select" }));

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
