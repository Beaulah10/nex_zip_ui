import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	FixedBarsContent,
	FlightMenuBar,
} from "@/components/common/flight-menu-bar/flight-menu-bar";

const mocks = vi.hoisted(() => ({
	flightSearchRequest: null as Record<string, unknown> | null,
	totalAmount: 0,
	backHandler: vi.fn(),
	useAppSelector: vi.fn(),
	useBackNavigation: vi.fn(),
	selectCommittedPassengerSelectionsTotalValue: vi.fn(),
	selectConfirmedTotalAmount: vi.fn(),
	selectFlightSearchRequest: vi.fn(),
	getPreviousBookingFlowPath: vi.fn(),
	getAirportDisplayName: vi.fn((code: string) => code),
	getConnectingAirportRoutes: vi.fn(),
	formatPrice: vi.fn((amount: number) => `¥${amount}`),
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: mocks.useAppSelector,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedTotalAmount: mocks.selectConfirmedTotalAmount,
	selectFlightSearchRequest: mocks.selectFlightSearchRequest,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectCommittedPassengerSelectionsTotalValue: mocks.selectCommittedPassengerSelectionsTotalValue,
}));

vi.mock("@/modules/hooks/common/back-navigation/use-back-navigation", () => ({
	useBackNavigation: mocks.useBackNavigation,
}));

vi.mock("@/modules/utils/helpers/airport", () => ({
	getAirportDisplayName: mocks.getAirportDisplayName,
	getConnectingAirportRoutes: mocks.getConnectingAirportRoutes,
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: mocks.formatPrice,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" "),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

beforeEach(() => {
	globalThis.ResizeObserver = class {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	} as unknown as typeof ResizeObserver;

	mocks.flightSearchRequest = null;
	mocks.totalAmount = 0;
	mocks.useBackNavigation.mockReturnValue(mocks.backHandler);
	mocks.useAppSelector.mockImplementation((selector: unknown) => {
		if (selector === mocks.selectFlightSearchRequest) {
			return mocks.flightSearchRequest;
		}

		if (selector === mocks.selectCommittedPassengerSelectionsTotalValue) {
			return undefined;
		}

		if (selector === mocks.selectConfirmedTotalAmount) {
			return mocks.totalAmount;
		}

		return undefined;
	});
	mocks.getConnectingAirportRoutes.mockReturnValue([]);
	mocks.formatPrice.mockReturnValue("¥0");
});

describe("FlightMenuBar", () => {
	it("renders the nav element", () => {
		render(<FlightMenuBar />);
		expect(document.querySelector("nav")).toBeTruthy();
	});

	it("renders price returned by formatPrice", () => {
		mocks.formatPrice.mockReturnValue("¥12,000");
		render(<FlightMenuBar />);
		expect(screen.getByText("¥12,000")).toBeTruthy();
	});

	it("prefers committed total when it exists", () => {
		mocks.useAppSelector.mockImplementation((selector: unknown) => {
			if (selector === mocks.selectFlightSearchRequest) {
				return mocks.flightSearchRequest;
			}

			if (selector === mocks.selectCommittedPassengerSelectionsTotalValue) {
				return 23622;
			}

			if (selector === mocks.selectConfirmedTotalAmount) {
				return 12000;
			}

			return undefined;
		});
		mocks.formatPrice.mockImplementation((amount: number) => `¥${amount}`);

		render(<FlightMenuBar />);

		expect(screen.getByText("¥23622")).toBeTruthy();
	});

	it("renders route segments provided by getConnectingAirportRoutes", () => {
		mocks.getConnectingAirportRoutes.mockReturnValue([{ origin: "NRT", destination: "HNL" }]);
		render(<FlightMenuBar />);
		expect(screen.getAllByText("NRT").length).toBeGreaterThan(0);
		expect(screen.getAllByText("HNL").length).toBeGreaterThan(0);
	});

	it("renders via airports when route has via field", () => {
		mocks.getConnectingAirportRoutes.mockReturnValue([
			{ origin: "NRT", destination: "HNL", via: ["SFO"] },
		]);
		render(<FlightMenuBar />);
		expect(screen.getByText(/Via/)).toBeTruthy();
	});

	it("does not render Via when route has no via airports", () => {
		mocks.getConnectingAirportRoutes.mockReturnValue([{ origin: "NRT", destination: "HNL" }]);
		render(<FlightMenuBar />);
		expect(screen.queryByText(/Via/)).toBeNull();
	});

	it("renders date range when both departure dates are set", () => {
		mocks.flightSearchRequest = {
			routes: "NRT,HNL",
			departureDateFrom: "2026-02-01",
			departureDateTo: "2026-02-10",
		};
		render(<FlightMenuBar />);
		expect(screen.getByText(/2\/1/)).toBeTruthy();
	});

	it("renders single departure date when no return date", () => {
		mocks.flightSearchRequest = {
			routes: "NRT,HNL",
			departureDateFrom: "2026-03-15",
			departureDateTo: undefined,
		};
		render(<FlightMenuBar />);
		expect(screen.getByText("3/15")).toBeTruthy();
	});

	it("renders empty date range when no departure dates", () => {
		mocks.flightSearchRequest = {
			routes: "NRT,HNL",
			departureDateFrom: undefined,
		};
		render(<FlightMenuBar />);
		expect(document.querySelector("nav")).toBeTruthy();
	});

	it("delegates back button click to useBackNavigation handler", () => {
		render(<FlightMenuBar />);
		fireEvent.click(screen.getByRole("button", { name: "arrow_back" }));
		expect(mocks.backHandler).toHaveBeenCalledTimes(1);
	});

	it("does not trigger back handler until button is clicked", () => {
		render(<FlightMenuBar />);
		expect(mocks.backHandler).not.toHaveBeenCalled();
	});

	it("applies the ResizeObserver and disconnects on unmount", () => {
		const disconnectMock = vi.fn();
		const observeMock = vi.fn();
		class MockResizeObserver {
			observe = observeMock;
			disconnect = disconnectMock;
			unobserve = vi.fn();
		}
		globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

		const { unmount } = render(<FlightMenuBar />);
		unmount();
		expect(disconnectMock).toHaveBeenCalledTimes(1);
	});

	it("accepts and applies a custom className", () => {
		render(<FlightMenuBar className="my-custom-class" />);
		const nav = document.querySelector("nav");
		expect(nav?.className).toContain("my-custom-class");
	});

	it("updates fixed header CSS variables when ResizeObserver callback runs", () => {
		const header = document.createElement("header");
		header.getBoundingClientRect = vi.fn(() => ({ height: 80 }) as DOMRect);
		document.body.appendChild(header);

		const observeMock = vi.fn();
		let resizeCallback: (() => void) | undefined;

		class MockResizeObserver {
			observe = observeMock;
			unobserve = vi.fn();
			disconnect = vi.fn();

			constructor(callback: () => void) {
				resizeCallback = callback;
			}
		}

		globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

		render(<FlightMenuBar />);

		expect(observeMock).toHaveBeenCalledWith(header);

		act(() => {
			resizeCallback?.();
		});

		expect(document.documentElement.style.getPropertyValue("--header-height")).toBe("80px");
		expect(document.documentElement.style.getPropertyValue("--fixed-bars-height")).toBe("80px");

		header.remove();
	});

	it("passes routes and return-trip flag to getConnectingAirportRoutes", () => {
		mocks.flightSearchRequest = {
			routes: "NRT,HNL",
			departureDateFrom: "2026-03-15",
			departureDateTo: "2026-03-20",
		};

		render(<FlightMenuBar />);

		expect(mocks.getConnectingAirportRoutes).toHaveBeenCalledWith(["NRT", "HNL"], true);
	});
});

describe("FixedBarsContent", () => {
	it("renders children", () => {
		render(
			<FixedBarsContent>
				<span data-testid="child">content</span>
			</FixedBarsContent>
		);
		expect(screen.getByTestId("child")).toBeTruthy();
	});

	it("applies custom className", () => {
		const { container } = render(
			<FixedBarsContent className="extra-class">
				<span />
			</FixedBarsContent>
		);
		expect(container.firstChild).toHaveProperty("className", "extra-class");
	});

	it("applies fixed-bars-height padding style", () => {
		const { container } = render(
			<FixedBarsContent>
				<span />
			</FixedBarsContent>
		);
		const div = container.firstChild as HTMLElement;
		expect(div.style.paddingTop).toBe("var(--fixed-bars-height, 120px)");
	});
});
