import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FlightSearchPage from "@/components/flight-search/flight-search";

const { mockPush, mockDispatch, selected, mockSetFormData } = vi.hoisted(() => ({
	mockPush: vi.fn(),
	mockDispatch: vi.fn(),
	mockSetFormData: vi.fn((payload: unknown) => ({
		type: "flightSearchForm/setFormData",
		payload,
	})),
	selected: {
		origin: "NRT",
		destination: "ICN",
	},
}));

vi.mock("@/i18n/routing", () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mockDispatch,
	useAppSelector: () => null,
}));

vi.mock("@repo/ui/components/button", () => ({
	Button: ({ children, outline, variant, size, asChild, ...props }: any) => (
		<button {...props}>{children}</button>
	),
}));

vi.mock("@repo/ui/components/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldError: ({ errors }: { errors: Array<{ message?: string }> }) => (
		<div>{errors.map((e) => e.message).join(",")}</div>
	),
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@repo/ui/components/input", () => ({
	Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({
		children,
		onValueChange,
	}: {
		children: React.ReactNode;
		onValueChange: (value: string) => void;
	}) => (
		<div>
			<button type="button" onClick={() => onValueChange("round-trip")}>
				Set Round Trip
			</button>
			<button type="button" onClick={() => onValueChange("one-way")}>
				Set One Way
			</button>
			{children}
		</div>
	),
	RadioGroupBorderedItem: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(" "),
}));

vi.mock("@/modules/utils/helpers/flight-search/flight-search.helpers", () => ({
	DEFAULT_PASSENGER_COUNTS: {
		adult: 1,
		childA: 0,
		childB: 0,
		childC: 0,
		infant: 0,
	},
	getDestinations: (_data: unknown, origin: string) => {
		if (origin === "NRT") {
			return ["ICN", "SIN"];
		}
		if (origin === "ICN") {
			return ["NRT"];
		}
		if (origin === "SIN") {
			return ["NRT", "ICN"];
		}
		if (origin === "BKK") {
			return ["SIN"];
		}
		return [];
	},
	getIpLocation: () => selected.origin,
	buildFlightSelectionPath: (values: { origin: string; destination: string }, locale: string) =>
		`/booking/${locale}/flight-selection?routes=${encodeURIComponent(`${values.origin},${values.destination}`)}`,
	isConnectingFlightRoute: (tripType: string, origin: string, destination: string) =>
		tripType === "one-way" && origin === "BKK" && destination === "SIN",
	orderIataCodesByMessageAirports: (iataCodes: string[]) => iataCodes,
}));

vi.mock("@/store/slices/flight-search-form/flight-search-form.slice", () => ({
	setFormData: mockSetFormData,
}));

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const t = (key: string) => key;
		t.raw = (key: string) => {
			if (key === "lists.airports") {
				return [
					{
						iata_code: "NRT",
						city: "Tokyo",
						airport: "Narita International Airport",
						country: "Japan",
						display_order: 1,
					},
					{
						iata_code: "SIN",
						city: "Singapore",
						airport: "Changi Airport",
						country: "Singapore",
						display_order: 2,
					},
					{
						iata_code: "ICN",
						city: "Seoul",
						airport: "Incheon International Airport",
						country: "South Korea",
						display_order: 3,
					},
					{
						iata_code: "BKK",
						city: "Bangkok",
						airport: "Suvarnabhumi Airport",
						country: "Thailand",
						display_order: 4,
					},
				];
			}
			return key;
		};
		return t;
	},
	useLocale: () => "en",
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/modules/utils/validations/flight-search", async () => {
	const mod = await vi.importActual<typeof import("@/modules/utils/validations/flight-search")>(
		"@/modules/utils/validations/flight-search"
	);
	return {
		...mod,
		getFlightSearchPassengerMessages: () => [],
	};
});

vi.mock("@/components/flight-search/location/departure-modal/departure-modal", () => ({
	default: ({ onClick, value }: { onClick: (value: string) => void; value: string }) => (
		<div>
			<span>Origin: {value || "-"}</span>
			<button type="button" onClick={() => onClick(selected.origin)}>
				Departure Select
			</button>
		</div>
	),
}));

vi.mock("@/components/flight-search/location/arrival-modal/arrival-modal", () => ({
	default: ({ onClick, value }: { onClick: (value: string) => void; value: string }) => (
		<div>
			<span>Destination: {value || "-"}</span>
			<button type="button" onClick={() => onClick(selected.destination)}>
				Arrival Select
			</button>
		</div>
	),
}));

vi.mock("@/components/flight-search/passenger/passenger-modal/passenger-modal", () => ({
	default: ({ onChange }: { onChange: (value: unknown) => void }) => (
		<button
			type="button"
			onClick={() =>
				onChange({
					adult: 1,
					childA: 0,
					childB: 0,
					childC: 0,
					infant: 0,
				})
			}
		>
			Pax Select
		</button>
	),
}));

vi.mock("@/components/flight-search/calendar/calendar", () => ({
	default: ({
		tripType,
		outboundDate,
		returnDate,
		onChange,
		disabled,
	}: {
		tripType: string;
		outboundDate: string;
		returnDate: string;
		onChange: (value: { outboundDate: string; returnDate: string }) => void;
		disabled?: boolean;
	}) =>
		disabled ? null : (
			<div>
				<div>{`Calendar State: ${tripType}|${outboundDate}|${returnDate}`}</div>
				<button
					type="button"
					onClick={() => onChange({ outboundDate: "2026-10-01", returnDate: "2026-10-10" })}
				>
					Calendar Select
				</button>
			</div>
		),
}));

vi.mock("@/components/flight-search/child-alert/alert", () => ({
	default: () => <div>Child Alert</div>,
}));

vi.mock("@/components/flight-search/passport/passport-info-modal", () => ({
	default: ({
		openPassportInfoModal,
		onNext,
	}: {
		openPassportInfoModal: boolean;
		onNext: () => void;
	}) => (
		<div>
			<div>Passport Modal: {String(openPassportInfoModal)}</div>
			{openPassportInfoModal && (
				<button type="button" onClick={onNext}>
					Passport Next
				</button>
			)}
		</div>
	),
}));

const routeData = [
	[{ origin: "NRT", destination: "ICN" }],
	[
		{ origin: "SIN", destination: "NRT" },
		{ origin: "NRT", destination: "ICN" },
	],
];

describe("FlightSearchPage component", () => {
	beforeEach(() => {
		mockPush.mockReset();
		mockDispatch.mockReset();
		mockSetFormData.mockClear();
		selected.origin = "NRT";
		selected.destination = "ICN";
	});

	it("keeps exchange disabled until both locations are selected", () => {
		render(<FlightSearchPage data={routeData} initialOrigin="NRT" />);

		expect(
			screen.getByRole("button", { name: "Swap origin and destination" }).getAttribute("disabled")
		).not.toBeNull();
	});

	it("opens and fills the promo code section", () => {
		render(<FlightSearchPage data={routeData} initialOrigin="NRT" />);

		fireEvent.click(screen.getByText("label_promocode").closest("button") as HTMLButtonElement);

		expect(screen.getByText("Enter promotion code")).toBeDefined();
		expect(screen.getByPlaceholderText("Promotion Code")).toBeDefined();
	});

	it("opens passport modal when origin is not SIN and proceeds on next", async () => {
		render(<FlightSearchPage data={routeData} initialOrigin="NRT" />);

		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Calendar Select" })).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Calendar Select" }));
		fireEvent.submit(
			screen.getByRole("button", { name: "label_search" }).closest("form") as HTMLFormElement
		);

		await waitFor(() => {
			expect(mockSetFormData).toHaveBeenCalledTimes(1);
			expect(mockPush).not.toHaveBeenCalled();
			expect(screen.getByText("Passport Modal: true")).toBeDefined();
		});

		fireEvent.click(screen.getByRole("button", { name: "Passport Next" }));
		expect(mockPush).toHaveBeenCalledWith(
			expect.stringContaining("/flight-selection?routes=NRT%2CICN")
		);
	});

	it("navigates directly when origin is SIN", async () => {
		selected.origin = "SIN";
		selected.destination = "ICN";

		render(<FlightSearchPage data={routeData} initialOrigin="SIN" />);

		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));
		await waitFor(() => {
			expect(screen.getByText("Origin: SIN")).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Calendar Select" })).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Calendar Select" }));
		fireEvent.submit(
			screen.getByRole("button", { name: "label_search" }).closest("form") as HTMLFormElement
		);

		await waitFor(() => {
			expect(mockSetFormData).toHaveBeenCalledTimes(1);
			expect(mockPush).toHaveBeenCalledWith(
				expect.stringContaining("/flight-selection?routes=SIN%2CICN")
			);
		});
	});

	it("swaps origin and destination when exchange is enabled", async () => {
		const exchangeRouteData = [
			[{ origin: "NRT", destination: "ICN" }],
			[{ origin: "ICN", destination: "NRT" }],
		];

		render(<FlightSearchPage data={exchangeRouteData} initialOrigin="NRT" />);

		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));

		const exchangeButton = screen.getByRole("button", { name: "Swap origin and destination" });
		expect(exchangeButton.getAttribute("disabled")).toBeNull();

		fireEvent.click(exchangeButton);

		expect(screen.getByText("Origin: ICN")).toBeDefined();
		expect(screen.getByText("Destination: NRT")).toBeDefined();
	});

	it("resets selected dates when destination changes", async () => {
		render(<FlightSearchPage data={routeData} initialOrigin="NRT" />);

		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Calendar Select" })).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Calendar Select" }));

		expect(screen.getByText("Calendar State: round-trip|2026-10-01|2026-10-10")).toBeDefined();

		selected.destination = "SIN";
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));

		await waitFor(() => {
			expect(screen.getByText("Destination: SIN")).toBeDefined();
			expect(screen.getByText("Calendar State: round-trip||")).toBeDefined();
		});
	});

	it("resets selected dates when origin changes", async () => {
		render(<FlightSearchPage data={routeData} initialOrigin="NRT" />);

		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Calendar Select" })).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Calendar Select" }));

		expect(screen.getByText("Calendar State: round-trip|2026-10-01|2026-10-10")).toBeDefined();

		selected.origin = "SIN";
		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));

		await waitFor(() => {
			expect(screen.getByText("Origin: SIN")).toBeDefined();
			expect(screen.getByText("Destination: -")).toBeDefined();
		});

		selected.destination = "ICN";
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));

		await waitFor(() => {
			expect(screen.getByText("Destination: ICN")).toBeDefined();
			expect(screen.getByText("Calendar State: round-trip||")).toBeDefined();
		});
	});

	it("handles trip-type transitions and sends connecting-flight payload", async () => {
		selected.origin = "BKK";
		selected.destination = "SIN";

		render(<FlightSearchPage data={routeData} initialOrigin="BKK" />);

		fireEvent.click(screen.getByRole("button", { name: "Departure Select" }));
		await waitFor(() => {
			expect(screen.getByText("Origin: BKK")).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Arrival Select" }));
		await waitFor(() => {
			expect(screen.getByText("Destination: SIN")).toBeDefined();
		});
		fireEvent.click(screen.getByRole("button", { name: "Calendar Select" }));

		expect(screen.getByText("Calendar State: round-trip|2026-10-01|2026-10-10")).toBeDefined();

		fireEvent.click(screen.getByRole("button", { name: "Set Round Trip" }));
		fireEvent.click(screen.getByRole("button", { name: "Set One Way" }));
		await waitFor(() => {
			expect(screen.getByText("Calendar State: one-way|2026-10-01|")).toBeDefined();
		});

		fireEvent.submit(
			screen.getByRole("button", { name: "label_search" }).closest("form") as HTMLFormElement
		);

		await waitFor(() => {
			expect(mockSetFormData).toHaveBeenCalled();
		});

		const dispatchedPayload = mockSetFormData.mock.calls.at(-1)?.[0] as {
			tripType: string;
		};
		expect(dispatchedPayload.tripType).toBe("connecting-flight");

		fireEvent.click(screen.getByRole("button", { name: "Set Round Trip" }));
		await waitFor(() => {
			expect(screen.getByText("Destination: -")).toBeDefined();
		});

		expect(screen.queryByRole("button", { name: "Calendar Select" })).toBeNull();
	});
});
