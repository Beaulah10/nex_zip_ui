import Icon from "@repo/ui/components/icon";
import { RadioGroup, RadioGroupBorderedItem } from "@repo/ui/components/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { useTranslations } from "next-intl";
import type { SeatType } from "@/types/flight-search/calendar.types";

interface SeatTypeSelectorProps {
	seatType: SeatType;
	onChange: (seatType: SeatType) => void;
	isChild: boolean;
	variant: "desktop" | "mobile";
}

export default function SeatTypeSelector({
	seatType,
	onChange,
	isChild,
	variant,
}: SeatTypeSelectorProps) {
	const t = useTranslations("flight_search_page");
	const seatTypeOptions: { value: SeatType; label: string; disabled?: boolean }[] = [
		{
			value: "standard",
			label: t("seat_type_standard"),
		},
		{
			value: "zip",
			label: t("seat_type_zip"),
			disabled: isChild,
		},
	];

	if (variant === "mobile") {
		return (
			<div className="flex flex-col gap-2">
				<span className="text-brand-japan-black text-sm">{t("seat_type_label")}</span>
				<Select value={seatType} onValueChange={onChange}>
					<SelectTrigger selectSize="md" className="w-full px-4 py-2.5 text-base">
						<div className="flex min-w-0 flex-1 items-center gap-2">
							<Icon name="airline_seat_recline_normal" size={24} className="text-primary-600" />
							<SelectValue />
						</div>
					</SelectTrigger>
					<SelectContent position="popper" className="w-(--radix-select-trigger-width)">
						{seatTypeOptions.map(({ value, label, disabled }) => (
							<SelectItem key={value} value={value} disabled={disabled}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-wrap items-center gap-2">
			<span className="font-normal text-brand-japan-black text-sm leading-6">
				{t("seat_type_label")}
			</span>
			<RadioGroup value={seatType} onValueChange={onChange} className="flex gap-2">
				{seatTypeOptions.map(({ value, label, disabled }) => (
					<RadioGroupBorderedItem key={value} value={value} label={label} disabled={disabled} />
				))}
			</RadioGroup>
		</div>
	);
}
