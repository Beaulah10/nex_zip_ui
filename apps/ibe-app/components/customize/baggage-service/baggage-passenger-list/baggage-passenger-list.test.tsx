import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BaggagePassengerList } from "./baggage-passenger-list";

const passengerServiceMock = vi.hoisted(() => vi.fn());
const mapBaggageCategoriesMock = vi.hoisted(() => vi.fn());
const areAllBaggageServicesMappedMock = vi.hoisted(() => vi.fn());

vi.mock("@/components/common/passenger-service/passenger-service", () => ({
	PassengerService: (props: {
		name: string;
		showAddButton: boolean;
		bundleLabelKey: string;
		features: string[];
		categories: Array<{ title: string }>;
		totalPrice: number;
		onAdd: () => void;
		onChange: () => void;
	}) => {
		passengerServiceMock(props);
		return (
			<div>
				<span>{props.name}</span>
				<span>{props.bundleLabelKey}</span>
				<span>{String(props.totalPrice)}</span>
				<span>{props.showAddButton ? "add" : "change"}</span>
				<button type="button" onClick={props.onAdd}>
					add-passenger
				</button>
				<button type="button" onClick={props.onChange}>
					change-passenger
				</button>
			</div>
		);
	},
}));

vi.mock("@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories", () => ({
	mapBaggageCategories: mapBaggageCategoriesMock,
	areAllBaggageServicesMapped: areAllBaggageServicesMappedMock,
}));

type ComponentProps = Parameters<typeof BaggagePassengerList>[0];

const createPassenger = (
	overrides: Partial<ComponentProps["passengers"][number]> = {}
): ComponentProps["passengers"][number] => ({
	id: "p1",
	name: "John Doe",
	bundleCode: "NOBN",
	bundleLabel: "No Bundle",
	baggagefeatures: ["feature-a"],
	passengerTypeCode: "adult",
	...overrides,
	mealfeatures: overrides.mealfeatures ?? [],
	isIcnRoute: overrides.isIcnRoute ?? false,
	isValueBundle: overrides.isValueBundle ?? false,
});

const createSelection = (
	overrides: Partial<ComponentProps["baggageSelections"][string]> = {}
): ComponentProps["baggageSelections"][string] => ({
	passenger: createPassenger(),
	baggageServices: {
		carryOn: {},
		checkedIn: {},
		sportsEquipment: {},
	},
	categories: [{ title: "Checked-in", items: [] }],
	totalPrice: 7500,
	...overrides,
});

describe("BaggagePassengerList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mapBaggageCategoriesMock.mockReturnValue([{ title: "Mapped category" }]);
		areAllBaggageServicesMappedMock.mockReturnValue(false);
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});

	it("renders only passengers that have selections and passes mapped values to PassengerService", () => {
		const onPassengerClick = vi.fn();
		const translate = vi.fn((key: string) => key);
		const onFocusRestored = vi.fn();

		render(
			<BaggagePassengerList
				passengers={[createPassenger(), createPassenger({ id: "p2", name: "Jane Doe" })]}
				baggageSelections={{
					p1: createSelection(),
				}}
				onPassengerClick={onPassengerClick}
				translate={translate}
				focusPassengerId={null}
				onFocusRestored={onFocusRestored}
			/>
		);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
		expect(mapBaggageCategoriesMock).toHaveBeenCalledWith({
			categories: [{ title: "Checked-in", items: [] }],
			t: translate,
		});
		expect(areAllBaggageServicesMappedMock).toHaveBeenCalled();
		expect(passengerServiceMock).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "John Doe",
				bundleLabelKey: "No Bundle",
				features: ["feature-a"],
				categories: [{ title: "Mapped category" }],
				totalPrice: 7500,
				showAddButton: true,
			})
		);
	});

	it("uses the change path instead of add when baggage is already mapped or the bundle is not NOBN", () => {
		areAllBaggageServicesMappedMock.mockReturnValue(true);
		const onFocusRestored = vi.fn();

		render(
			<BaggagePassengerList
				passengers={[createPassenger({ bundleCode: "VALK", bundleLabel: "Value" })]}
				baggageSelections={{ p1: createSelection() }}
				onPassengerClick={vi.fn()}
				translate={(key: string) => key}
				focusPassengerId={null}
				onFocusRestored={onFocusRestored}
			/>
		);

		expect(passengerServiceMock).toHaveBeenCalledWith(
			expect.objectContaining({
				showAddButton: false,
				bundleLabelKey: "Value",
			})
		);
		expect(screen.getByText("change")).toBeInTheDocument();
	});

	it("calls onPassengerClick from both add and change handlers", () => {
		const onPassengerClick = vi.fn();
		const onFocusRestored = vi.fn();

		render(
			<BaggagePassengerList
				passengers={[createPassenger()]}
				baggageSelections={{ p1: createSelection() }}
				onPassengerClick={onPassengerClick}
				translate={(key: string) => key}
				focusPassengerId={null}
				onFocusRestored={onFocusRestored}
			/>
		);

		fireEvent.click(screen.getByRole("button", { name: "add-passenger" }));
		fireEvent.click(screen.getByRole("button", { name: "change-passenger" }));

		expect(onPassengerClick).toHaveBeenNthCalledWith(1, "p1");
		expect(onPassengerClick).toHaveBeenNthCalledWith(2, "p1");
	});

	it("restores focus and scrolls the requested passenger into view", () => {
		const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
		const scrollIntoViewMock = vi.fn();
		HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
		vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
			width: 100,
			height: 40,
			top: -10,
			right: 100,
			bottom: 30,
			left: 0,
			x: 0,
			y: -10,
			toJSON: () => ({}),
		});
		const onFocusRestored = vi.fn();

		render(
			<BaggagePassengerList
				passengers={[createPassenger()]}
				baggageSelections={{ p1: createSelection() }}
				onPassengerClick={vi.fn()}
				translate={(key: string) => key}
				focusPassengerId="p1"
				onFocusRestored={onFocusRestored}
			/>
		);

		expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
		expect(scrollIntoViewMock).toHaveBeenCalledWith({
			behavior: "smooth",
			block: "nearest",
		});
		expect(onFocusRestored).toHaveBeenCalled();
	});

	it("does nothing when the requested focus passenger does not exist", () => {
		const onFocusRestored = vi.fn();
		const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

		render(
			<BaggagePassengerList
				passengers={[createPassenger()]}
				baggageSelections={{ p1: createSelection() }}
				onPassengerClick={vi.fn()}
				translate={(key: string) => key}
				focusPassengerId="missing"
				onFocusRestored={onFocusRestored}
			/>
		);

		expect(focusSpy).not.toHaveBeenCalled();
		expect(onFocusRestored).not.toHaveBeenCalled();
	});
});
