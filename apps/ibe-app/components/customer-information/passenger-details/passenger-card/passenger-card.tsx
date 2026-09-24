/**
 * File: passenger-card.tsx
 * Description: Passenger Card component that displays passenger summary information within the Customer Information page.
 * It shows passenger details, completion status, primary passenger indication, and provides access to the Passenger Information dialog.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import Icon from "@repo/ui/components/icon";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useTranslations } from "next-intl";
import { PassengerNumberBadge } from "@/components/common/passenger-number-badge/passenger-number-badge";
import { PassengerInformationDialog } from "@/components/customer-information/customer-information-modal/passenger-info-dialog/passenger-information-dialog";
import { usePrimaryPassenger } from "@/modules/hooks/common/primary-passenger/primary-passenger";
import { PASSENGER_TYPE_CODE_TO_AGE_LABEL } from "@/modules/utils/constants/customer-information/constants";
import { useAppSelector } from "@/store/hooks";
import { selectHasMultiplePassengers } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import type { Passenger } from "@/types/customer-information/customer-information.types";

/**
 * Passenger Card component that shows passenger details, completion status, primary passenger indication, and provides access to the Passenger Information dialog.
 */
export function PassengerCard({
	passenger,
	passengerIndex,
}: Readonly<{ passenger: Passenger; passengerIndex: number }>) {
	const t = useTranslations("customer_information_page");
	const ageLabelKey = PASSENGER_TYPE_CODE_TO_AGE_LABEL[passenger.passengerTypeCode ?? ""];
	const multiplePassengers = useAppSelector(selectHasMultiplePassengers);
	const { primaryPassengerId } = usePrimaryPassenger();
	const isCompleted = passenger.isCompleted ?? false;
	const isPrimary = passenger.id === primaryPassengerId;
	const showPrimaryBadge = isPrimary && multiplePassengers;
	return (
		<Wrapper
			bg="gray-1"
			padding="default"
			className="passenger-card flex flex-col gap-6 rounded-lg md:flex-row md:items-center md:gap-8"
		>
			{/* Name + age heading */}
			<div className="passenger-heading flex flex-1 items-center gap-2 md:items-center md:gap-2">
				<PassengerNumberBadge number={passengerIndex + 1} />
				<div className="passenger-info flex flex-col gap-1 md:gap-2">
					{/* Mobile: badge stacks below name; Desktop: badge inline beside name */}
					<div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
						<span className="font-bold text-2xl text-base-900 leading-9">
							{passenger.firstName} {passenger.lastName}
						</span>
						{showPrimaryBadge && (
							<Badge className="w-fit gap-1.5 border-transparent bg-primary-200 font-medium text-primary-800">
								{t("badge_primary_passenger")}
							</Badge>
						)}
					</div>
					<span className="text-primary-700 text-sm leading-6 md:text-base">
						{ageLabelKey ? t(ageLabelKey) : ""}
					</span>
				</div>
			</div>

			{/* Status + action: right-aligned on mobile, natural on desktop */}
			<div className="passenger-actions ml-13 flex items-center md:ml-0 md:shrink-0 md:justify-normal md:self-auto">
				{isCompleted && (
					<div className="completed-status flex items-center gap-2 pt-2 pb-2 text-primary-700 md:mr-6">
						<Icon
							name="check_circle"
							size={20}
							fill={1}
							wght={400}
							grad={0}
							opsz={20}
							className="text-primary-700"
						/>
						<span className="font-medium text-base leading-6">{t("status_completed")}</span>
					</div>
				)}
				<div className="ml-auto md:ml-0">
					<PassengerInformationDialog
						passenger={passenger}
						passengerIndex={passengerIndex}
						isPrimary={isPrimary}
					/>
				</div>
			</div>
		</Wrapper>
	);
}
