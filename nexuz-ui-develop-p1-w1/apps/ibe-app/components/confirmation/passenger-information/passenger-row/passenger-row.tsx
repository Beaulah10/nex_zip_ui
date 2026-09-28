/**
 * File: passenger-row.tsx
 * Description: Displays a passenger's information in a desktop table row within the Passenger Information section.
 * Shows personal and travel document details, passenger type indicators, assistance status,
 * and provides an action to modify passenger information during booking confirmation.
 */
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { InfantIcon } from "@/assets/images/infant-icon";
import type { PassengerRowProps } from "@/types/confirmation/confirmation.types";

/** Single passenger row of the Passenger Information table, e.g. "YAMADA TARO". */
export function PassengerRow({
	name,
	dateOfBirth,
	passportNumber,
	expiryDate,
	nationality,
	needsAssistance,
	isInfant,
	needsAssistanceLabel,
	changeLabel,
	onChange,
	className,
}: PassengerRowProps) {
	const t = useTranslations("confirmation_page");
	return (
		<div
			className={cn(
				"passenger-row flex flex-col gap-3 border-base-200 border-b py-4 md:flex-row md:items-center md:gap-6",
				className
			)}
		>
			<div className="flex shrink-0 flex-col items-start justify-center gap-2 md:w-60">
				<div className="flex items-center gap-2">
					{isInfant ? (
						<InfantIcon className="shrink-0 text-primary-700" />
					) : (
						<Icon
							aria-hidden="true"
							name="person"
							size={24}
							fill={1}
							className="shrink-0 p-1 text-primary-700"
						/>
					)}
					<span className="font-[700] text-base text-brand-japan-black leading-6">{name}</span>
				</div>
				{needsAssistance && (
					<Badge
						variant="destructive"
						className="rounded-[var(--border-radius-rounded-sm)] bg-danger-100 text-danger-800"
					>
						{needsAssistanceLabel}
					</Badge>
				)}
			</div>

			<div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
				<span className="font-normal text-base text-base-700 leading-6">{dateOfBirth}</span>
				<span className="font-normal text-base text-base-700 leading-6">{passportNumber}</span>
				<span className="font-normal text-base text-base-700 leading-6">{expiryDate}</span>
				<span className="font-normal text-base text-base-700 leading-6">{nationality}</span>
			</div>

			<div className="shrink-0 md:w-[100px]">
				<Button
					aria-label={t("aria_labels.change_passenger_details", {
						passengerName: name,
					})}
					variant="primary"
					outline
					size="md"
					onClick={onChange}
					className="w-full rounded-lg px-3 md:w-full"
				>
					{changeLabel}
				</Button>
			</div>
		</div>
	);
}
