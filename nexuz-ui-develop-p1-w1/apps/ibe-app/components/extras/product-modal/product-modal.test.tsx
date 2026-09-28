import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExtrasProductModal } from "./product-modal";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
}));

vi.mock("@repo/ui/components/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="dialog">{children}</div>
	),
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

vi.mock("@/components/common/select-customers/select-customers", () => ({
	SelectCustomers: ({
		passengers,
		onPassengerChange,
		onSelectAllChange,
	}: {
		passengers: Array<{ id: string; price: number; checked: boolean; disabled?: boolean }>;
		onPassengerChange: (id: string, checked: boolean) => void;
		onSelectAllChange: (checked: boolean) => void;
	}) => (
		<div>
			<div data-testid="select-customers">
				{passengers
					.map(
						(p) =>
							`${p.id}:${p.price}:${p.checked ? "checked" : "unchecked"}:${p.disabled ? "disabled" : "enabled"}`
					)
					.join("|")}
			</div>
			<button type="button" onClick={() => onPassengerChange(passengers[0]?.id ?? "", true)}>
				Passenger Toggle
			</button>
			<button type="button" onClick={() => onSelectAllChange(true)}>
				Select All
			</button>
		</div>
	),
}));

const baseProduct = {
	id: "amenities-1",
	categoryId: "amenities" as const,
	ssrCode: "WIFI",
	qtyAvailable: 2,
	name: "WiFi",
	description: "Unlimited internet",
	price: 1500,
	imageSrc: "/wifi.png",
	images: ["/wifi.png", "/wifi-2.png", "/wifi-3.png"],
	serviceID: 1,
	lfid: 100,
	cutOffHours: 2,
	maxCountServiceLevel: 2,
	numericCategoryId: 1,
	passengerType: "ADT",
	remainingLabel: "2 remaining",
	infoLink: "https://example.com/wifi",
};

const basePassengers = [
	{ id: "p1", name: "John", category: "Adult", price: 0, checked: false },
	{ id: "p2", name: "Jane", category: "Adult", price: 0, checked: false },
];

function renderModal(overrides?: Partial<React.ComponentProps<typeof ExtrasProductModal>>) {
	return render(
		<ExtrasProductModal
			open
			product={baseProduct}
			routeLabel="NRT -> ITM"
			currentImageIndex={1}
			passengers={basePassengers}
			passengerSelections={{ p1: false, p2: true }}
			bundledPassengerIds={["p1"]}
			isDialogSelectionFull
			dialogTotal={1500}
			shouldShowOutOfStockAlert
			onClose={vi.fn()}
			onPreviousImage={vi.fn()}
			onNextImage={vi.fn()}
			onPassengerChange={vi.fn()}
			onSelectAllChange={vi.fn()}
			onConfirm={vi.fn()}
			{...overrides}
		/>
	);
}

describe("ExtrasProductModal", () => {
	it("renders nothing when product is null", () => {
		renderModal({ product: null });

		expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
	});

	it("renders product details and handles action callbacks", () => {
		const onClose = vi.fn();
		const onPreviousImage = vi.fn();
		const onNextImage = vi.fn();
		const onConfirm = vi.fn();

		renderModal({ onClose, onPreviousImage, onNextImage, onConfirm });

		expect(screen.getByText("WiFi")).toBeInTheDocument();
		expect(screen.getByText("NRT -> ITM")).toBeInTheDocument();
		expect(screen.getByTestId("alert")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "aria_labels.back_button" }));
		fireEvent.click(screen.getByRole("button", { name: "aria_labels.previous_image_button" }));
		fireEvent.click(screen.getByRole("button", { name: "aria_labels.next_image_button" }));
		fireEvent.click(screen.getByRole("button", { name: "confirm_selection" }));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onPreviousImage).toHaveBeenCalledTimes(1);
		expect(onNextImage).toHaveBeenCalledTimes(1);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("maps passengers for select customers and forwards selection handlers", () => {
		const onPassengerChange = vi.fn();
		const onSelectAllChange = vi.fn();

		renderModal({ onPassengerChange, onSelectAllChange });

		const payload = screen.getByTestId("select-customers").textContent;
		expect(payload).toContain("p1:0:checked:disabled");
		expect(payload).toContain("p2:1500:checked:enabled");

		fireEvent.click(screen.getByRole("button", { name: "Passenger Toggle" }));
		fireEvent.click(screen.getByRole("button", { name: "Select All" }));

		expect(onPassengerChange).toHaveBeenCalledWith("p1", true);
		expect(onSelectAllChange).toHaveBeenCalledWith(true);
	});
});
