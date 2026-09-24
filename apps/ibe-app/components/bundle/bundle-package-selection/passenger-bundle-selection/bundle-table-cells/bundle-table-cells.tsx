import Icon from "@repo/ui/components/icon";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { TableCell } from "@repo/ui/components/table";
import type {
	BundleId,
	BundleRadioCellProps,
	PassengerCellProps,
} from "@/types/bundle/bundle.types";

/** Passenger name cell. */
export function PassengerCell({ passenger, invalid = false }: PassengerCellProps) {
	return (
		<TableCell
			className={`sticky left-0 z-10 min-h-12 border-base-300 border-r border-b px-6 py-2 font-bold text-sm ${invalid ? "bg-danger-100" : "bg-white"}`}
		>
			<span className="flex items-center gap-2">
				{typeof passenger.icon === "string" ? (
					<Icon name={passenger.icon} color="text-primary-700" fill={1} />
				) : (
					passenger.icon
				)}
				{passenger.name}
			</span>
		</TableCell>
	);
}
/** Bundle radio selection cell. */
export function BundleRadioCell({
	bundle,
	selected,
	onSelect,
	disabled = false,
	invalid = false,
	sizeClass = "size-5",
	columnHighlighted = false,
}: BundleRadioCellProps) {
	return (
		<TableCell
			className={`min-h-12 border-base-300 border-r border-b p-0 text-center last:border-r-0 ${disabled ? "cursor-not-allowed bg-base-100" : selected === bundle.id ? "cursor-pointer bg-primary-50" : invalid ? "cursor-pointer bg-danger-100" : columnHighlighted ? "cursor-pointer bg-primary-50" : "cursor-pointer bg-white"}`}
			onClick={() => {
				if (!disabled) onSelect(bundle.id);
			}}
		>
			<RadioGroup
				value={selected ?? undefined}
				onValueChange={(value) => onSelect(value as BundleId)}
				className="flex min-h-12 items-center justify-center"
			>
				<RadioGroupItem
					value={bundle.id}
					aria-label={bundle.name}
					aria-invalid={invalid && !disabled}
					disabled={disabled}
					indicator="check"
					className={`${sizeClass} border-base-300 data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700`}
				/>
			</RadioGroup>
		</TableCell>
	);
}
