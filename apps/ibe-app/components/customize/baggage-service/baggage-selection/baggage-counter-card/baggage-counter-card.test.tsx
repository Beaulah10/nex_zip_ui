import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BaggageCounter, CounterCard } from "./baggage-counter-card";

describe("BaggageCounter", () => {
	it("increments and decrements an uncontrolled value", () => {
		const onChange = vi.fn();

		render(<BaggageCounter defaultValue={1} onChange={onChange} incrementDisabled={false} />);

		const decreaseButton = screen.getByRole("button", {
			name: "aria_labels.label_decrease_quantity",
		});
		const increaseButton = screen.getByRole("button", {
			name: "aria_labels.label_increase_quantity",
		});

		fireEvent.click(increaseButton);
		expect(onChange).toHaveBeenCalledWith(2);
		expect(screen.getByRole("status")).toHaveTextContent("2");

		fireEvent.click(decreaseButton);
		expect(onChange).toHaveBeenLastCalledWith(1);
		expect(screen.getByRole("status")).toHaveTextContent("1");
	});

	it("prevents decrement when at the minimum", () => {
		const onChange = vi.fn();

		render(<BaggageCounter value={0} min={0} onChange={onChange} incrementDisabled={false} />);

		const decreaseButton = screen.getByRole("button", {
			name: "aria_labels.label_decrease_quantity",
		});

		expect(decreaseButton).toBeDisabled();
		fireEvent.click(decreaseButton);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("prevents increment when disabled or incrementDisabled", () => {
		const onChange = vi.fn();

		const { rerender } = render(<BaggageCounter value={1} onChange={onChange} incrementDisabled />);

		let increaseButton = screen.getByRole("button", {
			name: "aria_labels.label_increase_quantity",
		});
		expect(increaseButton).toBeDisabled();
		fireEvent.click(increaseButton);
		expect(onChange).not.toHaveBeenCalled();

		rerender(<BaggageCounter value={1} onChange={onChange} incrementDisabled={false} disabled />);
		increaseButton = screen.getByRole("button", {
			name: "aria_labels.label_increase_quantity",
		});
		expect(increaseButton).toBeDisabled();
		fireEvent.click(increaseButton);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("uses the controlled value for display", () => {
		const { rerender } = render(
			<BaggageCounter value={3} onChange={vi.fn()} incrementDisabled={false} />
		);

		expect(screen.getByRole("status")).toHaveTextContent("3");

		rerender(<BaggageCounter value={5} onChange={vi.fn()} incrementDisabled={false} />);

		expect(screen.getByRole("status")).toHaveTextContent("5");
	});
});

describe("CounterCard", () => {
	it("renders the selected state with description, formatted price, and change handler", () => {
		const onChange = vi.fn();

		render(
			<CounterCard
				icon="luggage"
				label="Checked-in Baggage"
				description="2 seats left"
				price={7500}
				count={1}
				incrementDisabled={false}
				disabled={false}
				onChange={onChange}
			/>
		);

		expect(screen.getByText("Checked-in Baggage")).toBeInTheDocument();
		expect(screen.getByText("2 seats left")).toBeInTheDocument();
		expect(screen.getByText("￥7,500")).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", {
				name: "aria_labels.label_increase_quantity",
			})
		);

		expect(onChange).toHaveBeenCalledWith(2);
	});

	it("renders disabled styling and prevents counter changes when disabled", () => {
		const onChange = vi.fn();

		render(
			<CounterCard
				icon="downhill_skiing"
				label="Ski Equipment"
				price={0}
				count={0}
				incrementDisabled={false}
				disabled
				onChange={onChange}
			/>
		);

		expect(screen.getByText("Ski Equipment")).toHaveClass("text-base-400");
		expect(screen.getByText("￥0")).toHaveClass("text-base-400");

		const increaseButton = screen.getByRole("button", {
			name: "aria_labels.label_increase_quantity",
		});
		const decreaseButton = screen.getByRole("button", {
			name: "aria_labels.label_decrease_quantity",
		});

		expect(increaseButton).toBeDisabled();
		expect(decreaseButton).toBeDisabled();
		fireEvent.click(increaseButton);
		fireEvent.click(decreaseButton);
		expect(onChange).not.toHaveBeenCalled();
	});
});
