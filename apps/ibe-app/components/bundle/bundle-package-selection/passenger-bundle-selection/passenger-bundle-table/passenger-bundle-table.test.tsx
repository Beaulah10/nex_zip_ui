import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BundleId, BundleOption, PassengerEntry } from "@/types/bundle/bundle.types";
import PassengerBundleTable from "./passenger-bundle-table";

const useTranslationsMock = vi.hoisted(() => vi.fn());
const desktopCalls = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const mobileCalls = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock("next-intl", () => ({
	useTranslations: useTranslationsMock,
}));

vi.mock(
	"@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-table-desktop/passenger-bundle-table-desktop",
	() => ({
		default: (props: Record<string, unknown>) => {
			desktopCalls.push(props);
			return <div data-testid="desktop-table" />;
		},
	})
);

vi.mock(
	"@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-table-mobile/passenger-bundle-table-mobile",
	() => ({
		default: (props: Record<string, unknown>) => {
			mobileCalls.push(props);
			return <div data-testid="mobile-table" />;
		},
	})
);

vi.mock("@repo/ui/components/alert", () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
	AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@repo/ui/components/icon", () => ({
	default: () => <span data-testid="icon" />,
}));

vi.mock("@repo/ui/components/switch", () => ({
	Switch: ({
		checked,
		onCheckedChange,
		"aria-label": ariaLabel,
	}: {
		checked: boolean;
		onCheckedChange: (value: boolean) => void;
		"aria-label"?: string;
	}) => (
		<button
			type="button"
			data-testid="switch"
			data-checked={String(checked)}
			aria-label={ariaLabel ?? "Toggle switch"}
			onClick={() => onCheckedChange(!checked)}
		>
			{ariaLabel ?? "Toggle switch"}
		</button>
	),
}));

beforeEach(() => {
	desktopCalls.length = 0;
	mobileCalls.length = 0;
	useTranslationsMock.mockImplementation(() => (key: string) => {
		const translations: Record<string, string> = {
			selection_table_apply_to_all: "Apply to all",
			aria_labels_select_bundle_for_all_travellers: "Select for all",
		};
		return translations[key] ?? key;
	});
});

function makeBundles(): BundleOption[] {
	return [
		{ id: "NOBN", name: "No bundle", description: "None" },
		{ id: "FLBF", name: "Flex", description: "Flex" },
		{ id: "FLBS", name: "Flex Plus", description: "Flex plus" },
		{ id: "VALB", name: "Value", description: "Value" },
	];
}

describe("PassengerBundleTable", () => {
	it("renders toggle and forwards computed props", () => {
		const passengers: PassengerEntry[] = [
			{ kind: "passenger", id: "p1", name: "Passenger 1", icon: "person" },
			{ kind: "passenger", id: "p2", name: "Passenger 2", icon: "person" },
		];
		const bundles = makeBundles();
		const selection = { p1: "FLBF", p2: "FLBS" } as const;
		const bundleCapacities = new Map<BundleId, number>([
			["FLBF", 1],
			["FLBS", 2],
			["VALB", 3],
		]);
		const isBundleDisabled = vi.fn((bundleId: BundleId) => bundleId === "VALB");
		const onApplyToAllChange = vi.fn();

		render(
			<PassengerBundleTable
				title="Bundle selection"
				passengers={passengers}
				bundles={bundles}
				applyToAll={false}
				onApplyToAllChange={onApplyToAllChange}
				selection={selection}
				onSelectionChange={vi.fn()}
				onLimitedBundleAttempt={vi.fn()}
				limitedCollapsedBundleIds={["FLBF"]}
				isBundleDisabled={isBundleDisabled}
				bundleCapacities={bundleCapacities}
				validationMessage="Pick one"
				invalidPassengerIds={new Set(["p1"])}
				purchaseDeadlineExceeded={false}
			/>
		);

		expect(screen.getByText("Apply to all")).toBeInTheDocument();
		screen.getByTestId("switch").click();
		expect(onApplyToAllChange).toHaveBeenCalledWith(true);
		expect(screen.getByTestId("alert")).toHaveTextContent("Pick one");
		expect(desktopCalls).toHaveLength(1);
		expect(mobileCalls).toHaveLength(1);

		const desktopProps = desktopCalls[0] as Record<string, any>;
		expect(desktopProps.isCollapsed).toBe(false);
		expect(desktopProps.firstEntryUnavailable).toBe(false);
		expect(desktopProps.firstPassengerName).toBe("Passenger 1");
		expect(desktopProps.allValue).toBe("FLBF");
		expect(desktopProps.selectedBundleIds).toEqual(new Set(["FLBF", "FLBS"]));
		expect(desktopProps.isPassengerBundleDisabled("VALB", "p2")).toBe(true);
		expect(desktopProps.isPassengerBundleDisabled("FLBF", "p1")).toBe(false);
		expect(desktopProps.isPassengerBundleDisabled("FLBF", "p2")).toBe(true);
		expect(desktopProps.isPassengerBundleDisabled("FLBS", "p1")).toBe(false);
		expect(desktopProps.isCollapsedBundleLimited("NOBN")).toBe(false);
		expect(desktopProps.isCollapsedBundleLimited("FLBF")).toBe(true);

		const mobileProps = mobileCalls[0] as Record<string, any>;
		expect(mobileProps.mobileCollapsedHeaderClass).toContain("bg-danger-100");
		expect(mobileProps.isCollapsed).toBe(false);
		expect(mobileProps.firstPassengerName).toBe("Passenger 1");
	});

	it("hides toggle for deadline and keeps collapsed state", () => {
		const passengers: PassengerEntry[] = [
			{
				kind: "unavailable-group",
				id: "group-1",
				passengers: [{ id: "u1", name: "Unavailable 1", icon: "person" }],
				message: "Group unavailable",
			},
		];

		render(
			<PassengerBundleTable
				title="Bundle selection"
				passengers={passengers}
				bundles={makeBundles()}
				applyToAll={true}
				onApplyToAllChange={vi.fn()}
				selection={{}}
				onSelectionChange={vi.fn()}
				onLimitedBundleAttempt={vi.fn()}
				limitedCollapsedBundleIds={[]}
				isBundleDisabled={() => false}
				bundleCapacities={null}
				purchaseDeadlineExceeded
			/>
		);

		expect(screen.queryByText("Apply to all")).toBeNull();
		expect(desktopCalls[0]).toMatchObject({
			isCollapsed: true,
			firstEntryUnavailable: true,
			firstPassengerName: "Unavailable 1",
			allValue: null,
		});
		expect((desktopCalls[0] as Record<string, any>).isCollapsedBundleLimited("NOBN")).toBe(false);
		expect((desktopCalls[0] as Record<string, any>).isCollapsedBundleLimited("FLBF")).toBe(false);
		expect((mobileCalls[0] as Record<string, any>).mobileCollapsedHeaderClass).toContain(
			"bg-base-50"
		);
	});
});
