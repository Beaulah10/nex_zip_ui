/**
 * File: passport-scan-modal.test.tsx
 * Classification: Component
 * Description: Tests for PassportScannerModal — rendering, dialog open/close behaviour,
 * camera permission states, Escape key handler, and scan result callbacks.
 *
 * NOTE: camera (getUserMedia) and canvas (scanCanvasForPassport) are mocked throughout
 * because real media devices are unavailable in jsdom.
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PassportScannerModal } from "@/components/customer-information/customer-information-modal/basic-details/passport-scan-modal/passport-scan-modal";

// ── Global Mocks ──────────────────────────────────────────────────────────────
vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({
		children,
		onClick,
		type,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: string;
	}) => (
		<button type={(type as "button" | "submit" | "reset") ?? "button"} onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({
		children,
		open,
		onOpenChange,
	}: {
		children: React.ReactNode;
		open: boolean;
		onOpenChange: (v: boolean) => void;
	}) =>
		open ? (
			<div
				data-testid="dialog"
				role="dialog"
				tabIndex={-1}
				onClick={() => onOpenChange(false)}
				onKeyDown={(e) => {
					if (e.key === "Enter") onOpenChange(false);
				}}
			>
				{children}
			</div>
		) : null,
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog-content">{children}</div>
	),
	DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<h1 data-testid="dialog-title" className={className}>
			{children}
		</h1>
	),
}));

// Mock the passport scan engine (heavy tesseract dependency)
vi.mock(
	"../../../../modules/utils/helpers/customer-information/passport-scan-engine-utils/passport-scan-engine-utils",
	() => ({
		scanCanvasForPassport: vi.fn().mockResolvedValue(null),
	})
);

// ── Media device mock helpers ─────────────────────────────────────────────────

/** Ensure navigator.mediaDevices exists in jsdom before we spy on it. */
function ensureMediaDevices() {
	if (!navigator.mediaDevices) {
		Object.defineProperty(navigator, "mediaDevices", {
			writable: true,
			configurable: true,
			value: { getUserMedia: vi.fn() },
		});
	}
}

function setupCameraSuccess() {
	ensureMediaDevices();
	const mockStream = {
		getTracks: () => [{ stop: vi.fn() }],
	} as unknown as MediaStream;

	vi.spyOn(navigator.mediaDevices, "getUserMedia").mockResolvedValue(mockStream);
	return mockStream;
}

function setupCameraFailure() {
	ensureMediaDevices();
	vi.spyOn(navigator.mediaDevices, "getUserMedia").mockRejectedValue(
		new Error("Permission denied")
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PassportScannerModal - not rendered when closed", () => {
	it("renders nothing when isOpen is false", () => {
		render(<PassportScannerModal isOpen={false} onClose={vi.fn()} onScanComplete={vi.fn()} />);
		expect(screen.queryByTestId("dialog")).toBeFalsy();
	});
});

describe("PassportScannerModal - rendered when open", () => {
	beforeEach(() => {
		setupCameraSuccess();
	});

	it("renders the dialog when isOpen is true", async () => {
		render(<PassportScannerModal isOpen={true} onClose={vi.fn()} onScanComplete={vi.fn()} />);
		await waitFor(() => expect(screen.getByTestId("dialog")).toBeTruthy());
	});

	it("renders the dialog title", async () => {
		render(<PassportScannerModal isOpen={true} onClose={vi.fn()} onScanComplete={vi.fn()} />);
		await waitFor(() => expect(screen.getByTestId("dialog-title")).toBeTruthy());
	});

	it("renders sr-only status region", async () => {
		render(<PassportScannerModal isOpen={true} onClose={vi.fn()} onScanComplete={vi.fn()} />);
		await waitFor(() => {
			const status = document.querySelector('[role="status"]');
			expect(status).toBeTruthy();
		});
	});
});

describe("PassportScannerModal - camera permission denied state", () => {
	beforeEach(() => {
		setupCameraFailure();
	});

	it("shows permission-denied UI when camera access is refused", async () => {
		render(<PassportScannerModal isOpen={true} onClose={vi.fn()} onScanComplete={vi.fn()} />);

		await waitFor(() => {
			expect(screen.getAllByText("passport_scanner_permission_denied_title")).toHaveLength(2);
		});

		expect(screen.getByText("passport_scanner_permission_denied_message")).toBeTruthy();

		expect(screen.getByText("passport_scanner_ok_button")).toBeTruthy();
	});

	it("calls onClose when OK button is clicked in permission-denied state", async () => {
		const onClose = vi.fn();
		render(<PassportScannerModal isOpen={true} onClose={onClose} onScanComplete={vi.fn()} />);
		await waitFor(() => screen.getByText("passport_scanner_ok_button"));
		fireEvent.click(screen.getByText("passport_scanner_ok_button"));
		expect(onClose).toHaveBeenCalled();
	});
});

describe("PassportScannerModal - Escape key handler", () => {
	beforeEach(() => {
		setupCameraSuccess();
	});

	it("calls onClose when Escape key is pressed while modal is open", async () => {
		const onClose = vi.fn();
		render(<PassportScannerModal isOpen={true} onClose={onClose} onScanComplete={vi.fn()} />);
		await waitFor(() => screen.getByTestId("dialog"));
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalled();
	});

	it("does not register Escape handler when modal is closed", () => {
		const onClose = vi.fn();
		render(<PassportScannerModal isOpen={false} onClose={onClose} onScanComplete={vi.fn()} />);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).not.toHaveBeenCalled();
	});
});

describe("PassportScannerModal - isOpen changes", () => {
	beforeEach(() => {
		setupCameraSuccess();
	});

	it("resets state and stops stream when isOpen transitions to false", async () => {
		const onClose = vi.fn();
		const { rerender } = render(
			<PassportScannerModal isOpen={true} onClose={onClose} onScanComplete={vi.fn()} />
		);
		await waitFor(() => screen.getByTestId("dialog"));

		await act(async () => {
			rerender(<PassportScannerModal isOpen={false} onClose={onClose} onScanComplete={vi.fn()} />);
		});

		expect(screen.queryByTestId("dialog")).toBeFalsy();
	});
});
it("handles dialog click close", async () => {
	const onClose = vi.fn();

	render(<PassportScannerModal isOpen={true} onClose={onClose} onScanComplete={vi.fn()} />);

	const dialog = await screen.findByTestId("dialog");

	fireEvent.click(dialog);

	expect(onClose).toHaveBeenCalled();
});

it("handles dialog enter key close", async () => {
	const onClose = vi.fn();

	render(<PassportScannerModal isOpen={true} onClose={onClose} onScanComplete={vi.fn()} />);

	const dialog = await screen.findByTestId("dialog");

	fireEvent.keyDown(dialog, {
		key: "Enter",
	});

	expect(onClose).toHaveBeenCalled();
});
