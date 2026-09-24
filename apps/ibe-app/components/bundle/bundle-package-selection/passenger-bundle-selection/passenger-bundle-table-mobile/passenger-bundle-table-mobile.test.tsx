import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	BundleId,
	BundleOption,
	BundleSelectionMap,
	PassengerEntry,
} from "@/types/bundle/bundle.types";
import PassengerBundleTableMobile from "./passenger-bundle-table-mobile";

const useTranslationsMock = vi.hoisted(() => vi.fn());
const applyBundleToAllMock = vi.hoisted(() => vi.fn());
const radioGroupCalls = vi.hoisted(() => [] as Array<Record<string, any>>);

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
		radioGroupCalls.push(props);
		return <div data-testid="radio-group">{children}</div>;
	},
	RadioGroupItem: ({
		value,
		disabled,
		...props
	}: {
		value: string;
		disabled?: boolean;
		[key: string]: unknown;
	}) => (
		<button
			data-testid={`radio-item-${value}`}
			data-disabled={String(Boolean(disabled))}
			{...props}
		/>
	),
}));

vi.mock("@/modules/utils/helpers/bundle/bundle.helpers", () => ({
	applyBundleToAll: applyBundleToAllMock,
}));

beforeEach(() => {
	radioGroupCalls.length = 0;
	useTranslationsMock.mockImplementation(
		(namespace: string) => (key: string, values?: { count?: number }) => {
			const translations: Record<string, string> = {
				selection_table_passenger: "Passenger",
				selection_table_bundle_selection_unavailable: "Unavailable",
				"aria_labels.no_bundle": "No bundle",
			};
			if (key === "selection_table_other_passengers_many") return `many ${values?.count ?? 0}`;
			if (key === "selection_table_other_passengers_one") return `one ${values?.count ?? 0}`;
			return namespace === "bundle_page" ? (translations[key] ?? key) : key;
		}
	);
});

function makeBundles(count: number): BundleOption[] {
	return Array.from({ length: count }, (_, index) => {
		const ids: BundleId[] = ["NOBN", "FLBF", "FLBS", "VALB", "PREM"];
		const id = ids[index];
		if (!id) throw new Error("Missing bundle id");
		return { id, name: id, description: id, price: index * 10 };
	});
}

describe("PassengerBundleTableMobile", () => {
	it("renders collapsed unavailable state", () => {
		render(
			<PassengerBundleTableMobile
				isCollapsed
				firstEntryUnavailable
				isCollapsedInvalid
				firstPassengerName={undefined}
				totalPassengerCount={3}
				passengers={[]}
				bundles={makeBundles(3)}
				allValue={null}
				isBundleDisabled={() => false}
				bundleCapacities={null}
				onSelectionChange={vi.fn()}
				onLimitedBundleAttempt={vi.fn()}
				limitedCollapsedBundleIds={[]}
				isCollapsedBundleLimited={() => false}
				invalidPassengerIds={new Set()}
				selection={{}}
				isPassengerBundleDisabled={() => false}
				mobileCollapsedHeaderClass="header"
				selectedBundleIds={new Set()}
			/>
		);

		expect(screen.getByText("Passenger")).toBeInTheDocument();
		expect(screen.getByText("many 2")).toBeInTheDocument();
		expect(screen.getByText("Unavailable")).toBeInTheDocument();
		expect(screen.getByTestId("radio-item-NOBN")).toHaveAttribute("data-disabled", "true");
	});

	it("renders collapsed selectable state and triggers apply to all logic", () => {
		const onSelectionChange = vi.fn();
		const onLimitedBundleAttempt = vi.fn();
		const bundles = makeBundles(2);

		render(
			<PassengerBundleTableMobile
				isCollapsed
				firstEntryUnavailable={false}
				isCollapsedInvalid
				firstPassengerName="Passenger 1"
				totalPassengerCount={1}
				passengers={[{ kind: "passenger", id: "p1", name: "Passenger 1", icon: "person" }]}
				bundles={bundles}
				allValue="FLBF"
				isBundleDisabled={() => false}
				bundleCapacities={
					new Map<BundleId, number>([
						["FLBF", 0],
						["FLBS", 3],
					])
				}
				onSelectionChange={onSelectionChange}
				onLimitedBundleAttempt={onLimitedBundleAttempt}
				limitedCollapsedBundleIds={[]}
				isCollapsedBundleLimited={(bundleId) => bundleId === "FLBF"}
				invalidPassengerIds={new Set()}
				selection={{ p1: "FLBF" }}
				isPassengerBundleDisabled={() => false}
				mobileCollapsedHeaderClass="header"
				selectedBundleIds={new Set<BundleId>(["FLBF"])}
			/>
		);

		expect(screen.getByText("Passenger 1")).toBeInTheDocument();
		expect(radioGroupCalls).toHaveLength(2);
		radioGroupCalls[0]?.onValueChange("FLBF");
		radioGroupCalls[0]?.onValueChange("FLBS");

		expect(onLimitedBundleAttempt).toHaveBeenCalledWith("FLBF");
		expect(applyBundleToAllMock).toHaveBeenCalledWith(
			[{ kind: "passenger", id: "p1", name: "Passenger 1", icon: "person" }],
			"FLBS",
			3,
			onSelectionChange
		);
	});

	it("renders expanded mixed rows", () => {
		const onSelectionChange = vi.fn();
		const passengers: PassengerEntry[] = [
			{
				kind: "unavailable-group",
				id: "group-1",
				passengers: [{ id: "u1", name: "Unavailable 1", icon: "person" }],
				message: "Group unavailable",
			},
			{ kind: "passenger", id: "p2", name: "Passenger 2", icon: "person" },
			{ kind: "passenger", id: "p3", name: "Passenger 3", icon: "person" },
		];
		const bundles = makeBundles(4);
		const selection = {
			p2: "FLBF",
			p3: "FLBS",
			ghost: "VALB",
		} as const satisfies BundleSelectionMap;

		render(
			<PassengerBundleTableMobile
				isCollapsed={false}
				firstEntryUnavailable={false}
				isCollapsedInvalid={false}
				firstPassengerName="Passenger 2"
				totalPassengerCount={3}
				passengers={passengers}
				bundles={bundles}
				allValue={null}
				isBundleDisabled={(bundleId) => bundleId === "PREM"}
				bundleCapacities={
					new Map<BundleId, number>([
						["FLBF", 2],
						["FLBS", 2],
						["VALB", 3],
						["PREM", 1],
					])
				}
				onSelectionChange={onSelectionChange}
				onLimitedBundleAttempt={vi.fn()}
				limitedCollapsedBundleIds={[]}
				isCollapsedBundleLimited={() => false}
				invalidPassengerIds={new Set(["p2"])}
				selection={selection}
				isPassengerBundleDisabled={(bundleId, passengerId) =>
					bundleId === "VALB" ? false : bundleId === "FLBF" && passengerId === "p2"
				}
				mobileCollapsedHeaderClass="header"
				selectedBundleIds={new Set<BundleId>(["FLBF", "FLBS", "VALB"])}
			/>
		);

		expect(screen.getByText("Group unavailable")).toBeInTheDocument();
		expect(screen.getAllByTestId("radio-item-NOBN")).toHaveLength(3);
		expect(screen.getAllByTestId("radio-item-VALB")).toHaveLength(2);
		expect(screen.getAllByTestId("radio-item-FLBF")[0]).toHaveAttribute("data-disabled", "true");
		expect(screen.getAllByTestId("radio-item-VALB")[0]).toHaveAttribute("data-disabled", "false");
		radioGroupCalls[1]?.onValueChange("FLBS");
		expect(onSelectionChange).toHaveBeenCalledWith("p2", "FLBS");
	});
});
