"use client";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { TotalAmountDisplay } from "@/components/customize/transport-service/total-amount/total-amount-display";
import type { TransportServiceDialogProps } from "@/types/customize/transport-service/transport-service.types";

/**
 * Wraps transport-service content inside a confirmation dialog with shared header and footer.
 */
export function TransportServiceDialog({
	open,
	onOpenChange,
	routeLabel,
	selectedTransportServiceId,
	totalAmount,
	onBack,
	onConfirm,
	children,
	stageLabel,
	hasOutOfStockPassengers,
	triggerRef,
}: TransportServiceDialogProps) {
	const transportServiceLabels = useTranslations("transportation_service");
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				desktopWidth={1024}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					triggerRef?.current?.focus({ preventScroll: true });
				}}
			>
				<DialogHeader>
					<div className="flex items-center gap-4">
						{selectedTransportServiceId !== null && (
							<button
								type="button"
								aria-label={transportServiceLabels("aria_labels.back")}
								onClick={onBack}
								className="shrink-0 text-base-950"
							>
								<Icon
									name="arrow_back"
									color="text-gray-900"
									size={24}
									className="text-current"
									aria-hidden="true"
								/>
							</button>
						)}
						<div className="flex flex-col gap-1">
							<DialogTitle>
								{transportServiceLabels("transport_services")} - {stageLabel}
							</DialogTitle>
							<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
						</div>
					</div>
				</DialogHeader>
				{selectedTransportServiceId !== null && hasOutOfStockPassengers && (
					<Alert variant="warning" className="mx-6">
						<AlertDescription>
							<p className="font-bold">
								{transportServiceLabels("error_labels.exceeds_available_stock")}
							</p>
							<p>{transportServiceLabels("error_labels.insufficient_stock_message")}</p>
						</AlertDescription>
					</Alert>
				)}
				<div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 md:mt-2 md:flex-row md:items-start md:px-6">
					{children}
				</div>

				<DialogFooter className="flex flex-col gap-4 border-base-300 border-t bg-white md:items-center md:justify-end md:gap-8">
					<TotalAmountDisplay amount={totalAmount} />
					<Button type="button" variant="primary" size="xl" onClick={onConfirm}>
						{transportServiceLabels("confirm_selection")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
