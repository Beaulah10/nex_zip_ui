import { Button } from "@repo/ui/components/button";
import type * as React from "react";

export interface ReservationNumberBannerProps extends React.HTMLAttributes<HTMLDivElement> {
	reservationNumber: string;
	title: string;
	manageBookingLabel: string;
	onManageBooking: () => void;
}

export function ReservationNumberBanner({
	reservationNumber,
	title,
	manageBookingLabel,
	onManageBooking,
	className,
	...props
}: ReservationNumberBannerProps) {
	return (
		<div
			className={`flex w-full flex-wrap items-center justify-between gap-4 rounded-lg bg-info-100 p-4 ${className ?? ""}`}
			{...props}
		>
			<div className="flex min-w-0 flex-col gap-1">
				<span className="font-bold text-base text-info-800 leading-6">{title}</span>
				<span className="font-bold text-3xl text-brand-japan-black leading-9">
					{reservationNumber}
				</span>
			</div>
			<Button type="button" variant="primary" outline size="md" onClick={onManageBooking}>
				{manageBookingLabel}
			</Button>
		</div>
	);
}
