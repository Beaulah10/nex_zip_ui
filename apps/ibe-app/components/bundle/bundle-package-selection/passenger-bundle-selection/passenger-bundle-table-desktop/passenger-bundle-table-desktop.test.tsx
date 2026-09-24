import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleId, BundleOption, PassengerEntry } from "@/types/bundle/bundle.types";
import PassengerBundleTableDesktop from "./passenger-bundle-table-desktop";

const useTranslationsMock = vi.hoisted(() => vi.fn());
const applyBundleToAllMock = vi.hoisted(() => vi.fn());
const bundleRadioCellCalls = vi.hoisted(() => [] as Array<Record<string, any>>);

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@repo/ui/components/radio-group", () => ({
	RadioGroup: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="radio-group">{children}</div>
	),
	RadioGroupItem: ({
		value,
		"aria-label": ariaLabel,
	}: {
		value: string;
		"aria-label"?: string;
	}) => (
		<button
			type="button"
			data-testid="radio-item"
			data-value={value}
			aria-label={ariaLabel ?? value}
		>
			{ariaLabel ?? value}
		</button>
	),
}));

vi.mock("@repo/ui/components/table", () => ({
	Table: ({ children }: { children: React.ReactNode }) => (
		<table data-testid="table">{children}</table>
	),
	TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
	TableCell: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
		<td {...props}>{children}</td>
	),
	TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

vi.mock(
	"@/components/bundle/bundle-package-selection/passenger-bundle-selection/bundle-table-cells/bundle-table-cells",
	() => ({
		BundleRadioCell: (props: Record<string, any>) => {
			bundleRadioCellCalls.push(props);
			return (
				<td
					data-testid={`bundle-cell-${props.bundle.id}`}
					data-disabled={String(Boolean(props.disabled))}
					data-invalid={String(Boolean(props.invalid))}
					data-selected={String(props.selected === props.bundle.id)}
					data-highlighted={String(Boolean(props.columnHighlighted))}
				/>
			);
		},
		PassengerCell: ({ passenger, invalid }: { passenger: { id: string }; invalid?: boolean }) => (
			<td data-testid={`passenger-cell-${passenger.id}`} data-invalid={String(Boolean(invalid))} />
		),
	})
);

vi.mock("@/modules/utils/helpers/bundle/bundle.helpers", () => ({
	applyBundleToAll: applyBundleToAllMock,
}));

beforeEach(() => {
	bundleRadioCellCalls.length = 0;
	useTranslationsMock.mockImplementation(
		(namespace: string) => (key: string, values?: { count?: number }) => {
			const translations: Record<string, string> = {
				selection_table_apply_to_all: "Apply to all",
				selection_table_passenger: "Passenger",
				selection_table_bundle_selection_unavailable: "Unavailable",
				aria_labels_no_bundle: "No bundle",
			};
			if (key === "selection_table_other_passengers_many") return `many ${values?.count ?? 0}`;
			if (key === "selection_table_other_passengers_one") return `one ${values?.count ?? 0}`;
			if (namespace === "bundle_page") return translations[key] ?? key;
			return key;
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

describe("PassengerBundleTableDesktop", () => {
	it("renders collapsed unavailable state", () => {
		const bundles = makeBundles(3);

		render(
			<PassengerBundleTableDesktop
				isCollapsed
				firstEntryUnavailable
				isCollapsedInvalid
				firstPassengerName={undefined}
				totalPassengerCount={3}
				passengers={[]}
				bundles={bundles}
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
				selectedBundleIds={new Set()}
			/>
		);

		expect(screen.getByText("Passenger")).toBeInTheDocument();
		expect(screen.getByText("many 2")).toBeInTheDocument();
		expect(screen.getByText("Unavailable")).toBeInTheDocument();
		expect(screen.getByTestId("radio-item")).toHaveAttribute("data-value", "NOBN");
	});

	it("renders collapsed selectable state and drives limited callback", () => {
		const bundles = makeBundles(2);
		const onSelectionChange = vi.fn();
		const onLimitedBundleAttempt = vi.fn();

		render(
			<PassengerBundleTableDesktop
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
				selectedBundleIds={new Set<BundleId>(["FLBF"])}
			/>
		);

		expect(screen.getByText("Passenger 1")).toBeInTheDocument();
		expect(screen.queryByText("one 0")).toBeNull();
		expect(screen.getByTestId("table")).toBeInTheDocument();
		expect(bundleRadioCellCalls).toHaveLength(2);

		bundleRadioCellCalls[0]?.onSelect("FLBF");
		bundleRadioCellCalls[1]?.onSelect("FLBS");

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
		render(
			<PassengerBundleTableDesktop
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
				selection={
					{
						p2: "FLBF",
						p3: "FLBS",
						ghost: "VALB",
					} as any
				}
				isPassengerBundleDisabled={(bundleId, passengerId) =>
					bundleId === "VALB" ? false : bundleId === "FLBF" && passengerId === "p2"
				}
				selectedBundleIds={new Set<BundleId>(["FLBF", "FLBS", "VALB"])}
			/>
		);

		expect(screen.getByText("Group unavailable")).toBeInTheDocument();
		expect(screen.getByTestId("passenger-cell-p2")).toHaveAttribute("data-invalid", "true");
		expect(screen.getByTestId("passenger-cell-p3")).toHaveAttribute("data-invalid", "false");
		expect(bundleRadioCellCalls[0]?.invalid).toBe(true);
		expect(bundleRadioCellCalls[1]?.disabled).toBe(true);
		expect(bundleRadioCellCalls[2]?.invalid).toBe(true);
		expect(bundleRadioCellCalls[3]?.disabled).toBe(false);
		expect(bundleRadioCellCalls[4]?.selected).toBe("FLBS");
		expect(bundleRadioCellCalls[5]?.columnHighlighted).toBe(true);
		bundleRadioCellCalls[4]?.onSelect("FLBS");
		expect(onSelectionChange).toHaveBeenCalledWith("p3", "FLBS");
	});
});
