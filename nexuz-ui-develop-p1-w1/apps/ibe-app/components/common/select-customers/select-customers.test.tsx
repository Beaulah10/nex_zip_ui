import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	createSelectCustomerListItems,
	SelectCustomers,
	SelectCustomersRadioCheck,
	SelectPassengerCard,
} from "@/components/common/select-customers/select-customers";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			adult_label: "Adult",
			infant_label: "Infant",
			childA_label: "Child A",
			childB_label: "Child B",
			childC_label: "Child C",
		};

		return translations[key] ?? key;
	},
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/checkbox", () => ({
	Checkbox: ({
		checked,
		disabled,
		onCheckedChange,
	}: {
		checked: boolean | "indeterminate";
		disabled?: boolean;
		onCheckedChange: (value: boolean) => void;
	}) => (
		<input
			data-testid="checkbox"
			type="checkbox"
			aria-checked={checked === "indeterminate" ? "mixed" : checked}
			checked={checked === true}
			disabled={disabled}
			onChange={(event) => onCheckedChange(event.target.checked)}
		/>
	),
}));

vi.mock("@repo/ui/lib", () => ({
	cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/modules/utils/helpers/currency-formatter", () => ({
	formatPrice: (amount: number) => `¥${amount.toLocaleString()}`,
}));

describe("createSelectCustomerListItems", () => {
	it("creates pax list items correctly", () => {
		const result = createSelectCustomerListItems(
			[
				{
					id: "1",
					firstName: "John",
					lastName: "Doe",
					passengerTypeCode: "adult",
				},
			],
			100
		);

		expect(result).toEqual([
			{
				id: "1",
				name: "John Doe",
				category: "adult",
				price: 100,
				checked: false,
				disabled: false,
				passengerTypeCode: "adult",
			},
		]);
	});

	it("uses passenger price when available", () => {
		const result = createSelectCustomerListItems([
			{
				id: "1",
				passengerTypeCode: "adult",
				price: 500,
			},
		]);

		expect(result[0]?.price).toBe(500);
	});

	it("uses provided fallback price", () => {
		const result = createSelectCustomerListItems(
			[
				{
					id: "1",
					passengerTypeCode: "adult",
				},
			],
			250
		);

		expect(result[0]?.price).toBe(250);
	});

	it("defaults price to 0", () => {
		const result = createSelectCustomerListItems([
			{
				id: "1",
				passengerTypeCode: "adult",
			},
		]);

		expect(result[0]?.price).toBe(0);
	});

	it("always sets infant price to 0", () => {
		const result = createSelectCustomerListItems(
			[
				{
					id: "1",
					passengerTypeCode: "infant",
					price: 999,
				},
			],
			500
		);

		expect(result[0]?.price).toBe(0);
	});

	it("uses Passenger when passengerTypeCode is missing", () => {
		const result = createSelectCustomerListItems([{ id: "1" }]);

		expect(result[0]?.category).toBe("Passenger");
	});

	it("handles missing first name", () => {
		const result = createSelectCustomerListItems([
			{
				id: "1",
				lastName: "Doe",
			},
		]);

		expect(result[0]?.name).toBe("Doe");
	});

	it("handles missing last name", () => {
		const result = createSelectCustomerListItems([
			{
				id: "1",
				firstName: "John",
			},
		]);

		expect(result[0]?.name).toBe("John");
	});

	it("handles empty names", () => {
		const result = createSelectCustomerListItems([{ id: "1" }]);

		expect(result[0]?.name).toBe("");
	});
});

describe("SelectCustomersRadioCheck", () => {
	it("renders check icon when checked", () => {
		render(<SelectCustomersRadioCheck checked={true} disabled={false} />);

		expect(screen.getByTestId("icon-check")).toBeInTheDocument();
	});

	it("does not render icon when unchecked", () => {
		render(<SelectCustomersRadioCheck checked={false} />);

		expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
	});
});

describe("SelectPassengerCard", () => {
	const basePassenger = {
		id: "1",
		name: "John Doe",
		category: "Adult",
		price: 100,
		checked: false,
		disabled: false,
		passengerTypeCode: "adult",
	};

	it("renders passenger name, category and formatted price", () => {
		render(<SelectPassengerCard item={basePassenger} onToggle={vi.fn()} />);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Adult")).toBeInTheDocument();
		expect(screen.getByText("¥100")).toBeInTheDocument();
	});

	it("calls onToggle when clicked", () => {
		const onToggle = vi.fn();

		render(<SelectPassengerCard item={basePassenger} onToggle={onToggle} />);

		fireEvent.click(screen.getByRole("button"));

		expect(onToggle).toHaveBeenCalledWith(true);
	});

	it("toggles checked passenger", () => {
		const onToggle = vi.fn();

		render(
			<SelectPassengerCard
				item={{
					...basePassenger,
					checked: true,
				}}
				onToggle={onToggle}
			/>
		);

		fireEvent.click(screen.getByRole("button"));

		expect(onToggle).toHaveBeenCalledWith(false);
	});

	it("renders disabled button", () => {
		render(
			<SelectPassengerCard
				item={{
					...basePassenger,
					disabled: true,
				}}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("does not call onToggle when disabled button is clicked", () => {
		const onToggle = vi.fn();

		render(
			<SelectPassengerCard
				item={{
					...basePassenger,
					disabled: true,
				}}
				onToggle={onToggle}
			/>
		);

		fireEvent.click(screen.getByRole("button"));

		expect(onToggle).not.toHaveBeenCalled();
	});

	it("renders formatted price", () => {
		render(
			<SelectPassengerCard
				item={{
					...basePassenger,
					price: 1000,
				}}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByText("¥1,000")).toBeInTheDocument();
	});

	it("shows check icon when selected", () => {
		render(
			<SelectPassengerCard
				item={{
					...basePassenger,
					checked: true,
				}}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByTestId("icon-check")).toBeInTheDocument();
	});

	it("shows status instead of price when status is provided", () => {
		render(
			<SelectPassengerCard
				item={{
					...basePassenger,
					status: "Out of stock",
				}}
				onToggle={vi.fn()}
			/>
		);

		expect(screen.getByText("Out of stock")).toBeInTheDocument();
		expect(screen.queryByText("¥100")).not.toBeInTheDocument();
	});
});

describe("SelectCustomers", () => {
	const passengers = [
		{
			id: "1",
			name: "Adult One",
			category: "Adult",
			price: 100,
			checked: true,
			passengerTypeCode: "adult",
		},
		{
			id: "2",
			name: "Adult Two",
			category: "Adult",
			price: 100,
			checked: false,
			passengerTypeCode: "adult",
		},
	];

	it("renders title", () => {
		render(<SelectCustomers title="Passengers" passengers={passengers} />);

		expect(screen.getByText("Passengers")).toBeInTheDocument();
	});

	it("renders passenger cards", () => {
		render(<SelectCustomers title="Passengers" passengers={passengers} />);

		expect(screen.getByText("Adult One")).toBeInTheDocument();
		expect(screen.getByText("Adult Two")).toBeInTheDocument();
	});

	it("calls onSelectAllChange", () => {
		const onSelectAllChange = vi.fn();

		render(<SelectCustomers passengers={passengers} onSelectAllChange={onSelectAllChange} />);

		fireEvent.click(screen.getByTestId("checkbox"));

		expect(onSelectAllChange).toHaveBeenCalledWith(true);
	});

	it("calls onPassengerChange", () => {
		const onPassengerChange = vi.fn();

		render(<SelectCustomers passengers={passengers} onPassengerChange={onPassengerChange} />);

		fireEvent.click(screen.getByRole("button", { name: /Adult Two/i }));

		expect(onPassengerChange).toHaveBeenCalledWith("2", true);
	});

	it("translates category labels", () => {
		render(
			<SelectCustomers
				passengers={[
					{
						id: "1",
						name: "John",
						category: "adult",
						price: 100,
						checked: false,
						passengerTypeCode: "adult",
					},
				]}
			/>
		);

		expect(screen.getByText("Adult")).toBeInTheDocument();
	});

	it("disables passenger by translated category", () => {
		render(
			<SelectCustomers
				passengers={[
					{
						id: "1",
						name: "John",
						category: "adult",
						price: 100,
						checked: false,
						passengerTypeCode: "adult",
					},
				]}
				disabledPassengerCategories={["Adult"]}
			/>
		);

		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("keeps passenger disabled when already disabled", () => {
		render(
			<SelectCustomers
				passengers={[
					{
						id: "1",
						name: "John",
						category: "Adult",
						price: 100,
						checked: false,
						disabled: true,
						passengerTypeCode: "adult",
					},
				]}
			/>
		);

		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("renders checked select-all state", () => {
		render(
			<SelectCustomers
				passengers={[
					{
						id: "1",
						name: "John",
						category: "Adult",
						price: 100,
						checked: true,
						passengerTypeCode: "adult",
					},
				]}
			/>
		);

		expect(screen.getByTestId("checkbox")).toBeChecked();
		expect(screen.getByTestId("checkbox")).toHaveAttribute("aria-checked", "true");
	});

	it("renders indeterminate select-all state", () => {
		render(<SelectCustomers passengers={passengers} />);

		expect(screen.getByTestId("checkbox")).toHaveAttribute("aria-checked", "mixed");
	});

	it("overrides price for non-infant passengers", () => {
		render(
			<SelectCustomers
				price={500}
				passengers={[
					{
						id: "1",
						name: "John",
						category: "Adult",
						price: 100,
						checked: false,
						passengerTypeCode: "adult",
					},
				]}
			/>
		);

		expect(screen.getByText("¥500")).toBeInTheDocument();
	});

	it("does not override infant price", () => {
		render(
			<SelectCustomers
				price={500}
				passengers={[
					{
						id: "1",
						name: "Baby",
						category: "Infant",
						price: 0,
						checked: false,
						passengerTypeCode: "infant",
					},
				]}
			/>
		);

		expect(screen.getByText("¥0")).toBeInTheDocument();
	});

	it("ignores disabled passengers in select-all calculation", () => {
		render(
			<SelectCustomers
				passengers={[
					{
						id: "1",
						name: "John",
						category: "Adult",
						price: 100,
						checked: true,
						disabled: true,
						passengerTypeCode: "adult",
					},
					{
						id: "2",
						name: "Jane",
						category: "Adult",
						price: 100,
						checked: true,
						passengerTypeCode: "adult",
					},
				]}
			/>
		);

		expect(screen.getByTestId("checkbox")).toBeChecked();
		expect(screen.getByTestId("checkbox")).toHaveAttribute("aria-checked", "true");
	});

	it("does not check select-all when all passengers are disabled", () => {
		render(
			<SelectCustomers
				passengers={[
					{
						id: "1",
						name: "John",
						category: "Adult",
						price: 100,
						checked: true,
						disabled: true,
						passengerTypeCode: "adult",
					},
				]}
			/>
		);

		expect(screen.getByTestId("checkbox")).not.toBeChecked();
		expect(screen.getByTestId("checkbox")).toHaveAttribute("aria-checked", "false");
	});

	// it("uses selectAllOverride checked state", () => {
	//   render(
	//     <SelectCustomers
	//       passengers={passengers}
	//       selectAllOverride={{
	//         checked: true,
	//         disabled: false,
	//       }}
	//     />
	//   );

	//   expect(screen.getByTestId("checkbox")).toBeChecked();
	//   expect(screen.getByTestId("checkbox")).toHaveAttribute("aria-checked", "true");
	// });

	it("disables select-all checkbox when override is disabled", () => {
		render(
			<SelectCustomers
				passengers={passengers}
				selectAllOverride={{
					checked: true,
					disabled: true,
				}}
			/>
		);

		expect(screen.getByTestId("checkbox")).toBeDisabled();
		expect(screen.getByTestId("checkbox")).toBeChecked();
	});

	it("does not show indeterminate state when selectAllOverride is disabled", () => {
		render(
			<SelectCustomers
				passengers={passengers}
				selectAllOverride={{
					checked: false,
					disabled: true,
				}}
			/>
		);

		expect(screen.getByTestId("checkbox")).toBeDisabled();
		expect(screen.getByTestId("checkbox")).toHaveAttribute("aria-checked", "false");
	});

	it("applies custom className to wrapper", () => {
		const { container } = render(
			<SelectCustomers title="Passengers" passengers={passengers} className="custom-class" />
		);

		expect(container.firstChild).toHaveClass("custom-class");
	});
});
