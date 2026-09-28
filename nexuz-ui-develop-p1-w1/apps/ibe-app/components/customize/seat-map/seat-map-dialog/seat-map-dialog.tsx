/**
 * File: seat-map-dialog.tsx
 * Description: Seat map selection dialog renderer.
 * State, validation and persistence logic live in use-seat-map-dialog so this
 * component stays focused on layout and presentation.
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { EmergencyExitSupportContent } from "@/components/customize/seat-map/emergency-exit-support-content/emergency-exit-support-content";
import { SeatMap } from "@/components/customize/seat-map/seat-map/seat-map";
import { SeatMapPassengerPanel } from "@/components/customize/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import { useSeatMapDialog } from "@/modules/hooks/seat-map/use-seat-map-dialog/use-seat-map-dialog";
import { getFirstUnselectedPassengerIndex } from "@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import type { SeatMapDialogProps } from "@/types/seat-map/seat-map.types";

export function SeatMapDialog({
	open,
	onOpenChange,
	direction,
	stageLabel,
	routeLabel,
	initialActivePassengerIndex,
	restoreFocusElement,
}: SeatMapDialogProps) {
	const t = useTranslations("seat_service");
	const initialPassengerAppliedRef = useRef(false);
	const {
		selectedCabin,
		seatMapData,
		seatValidationError,
		seatWarningBanner,
		seatMapPassengerPanel,
		activePassengerIndex,
		setActivePassenger,
		activePassengerComplimentaryLegendEligible,
		activePassengerBundleSeatServiceCodes,
		activePassengerSelectedSeatServiceCode,
		bundleInfoMessage,
		legendPrices,
		seatPassengers,
		adjacentInfoBannerMessages,
		seatRulesInfoMessages,
		assignedSeatToPassengerIndex,
		assignedSeatToPassengerLabel,
		activeSeatCode,
		handleValidatedSeatSelect,
		handleConfirmSeatSelection,
		handleDialogOpenChange,
		effectiveTotalSeatCost,
		showingEmergencyExitSupport,
		handleConfirmEmergencyExitSupport,
		handleGoBackFromEmergencySupport,
	} = useSeatMapDialog({ open, onOpenChange, direction });
	const visibleBanner = seatValidationError ?? seatWarningBanner;

	useEffect(() => {
		if (!open) {
			initialPassengerAppliedRef.current = false;
			return;
		}

		if (initialActivePassengerIndex !== undefined) {
			if (!initialPassengerAppliedRef.current) {
				setActivePassenger(initialActivePassengerIndex);
				initialPassengerAppliedRef.current = true;
			}
			return;
		}

		if (initialPassengerAppliedRef.current) {
			return;
		}

		setActivePassenger(getFirstUnselectedPassengerIndex(seatPassengers));
		initialPassengerAppliedRef.current = true;
	}, [open, initialActivePassengerIndex, seatPassengers, setActivePassenger]);

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange} modal>
			<DialogContent
				mobileOuterSpacing={0}
				desktopWidth={1024}
				gap={0}
				className="flex max-h-[calc(100vh-48px)] flex-col"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					if (event.target instanceof HTMLElement) {
						event.target.focus();
					}
				}}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					restoreFocusElement?.focus();
				}}
			>
				{!showingEmergencyExitSupport ? (
					<>
						<DialogHeader className="shrink-0">
							<DialogTitle>
								{t("seat_selection")} - {stageLabel}
							</DialogTitle>
							<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
						</DialogHeader>

						{visibleBanner && (
							<div className="shrink-0 px-4 pt-4 md:px-6">
								<Alert variant={seatValidationError ? "error" : "warning"}>
									<AlertTitle>{visibleBanner.title}</AlertTitle>
									<AlertDescription>{visibleBanner.body}</AlertDescription>
								</Alert>
							</div>
						)}

						<div
							role="region"
							aria-label={routeLabel ? `${t("seat_selection")} ${routeLabel}` : t("seat_selection")}
							className="min-h-0 flex-1 overflow-auto"
						>
							<div className="flex flex-col gap-8 px-2 py-4 md:flex-row md:items-stretch md:gap-4 md:p-6">
								<SeatMapPassengerPanel
									className={"min-w-0 md:max-w-[25rem]"}
									flightCode={seatMapPassengerPanel.flightCode}
									cabinClass={selectedCabin}
									activePassengerComplimentaryLegendEligible={
										activePassengerComplimentaryLegendEligible
									}
									activePassengerBundleSeatServiceCodes={activePassengerBundleSeatServiceCodes}
									activePassengerSelectedSeatServiceCode={activePassengerSelectedSeatServiceCode}
									bundleInfoMessage={bundleInfoMessage}
									legendPrices={legendPrices}
									passengers={seatPassengers}
									activePassengerIndex={activePassengerIndex}
									onPassengerSelect={setActivePassenger}
									adjacentInfoBannerMessages={adjacentInfoBannerMessages}
									seatRulesInfoMessages={seatRulesInfoMessages}
								/>
								<div className="flex flex-col md:w-[35rem] md:min-w-[35rem]">
									<div
										role="region"
										aria-label={
											routeLabel ? `${t("seat_selection")} ${routeLabel}` : t("seat_selection")
										}
										className="rounded-md bg-gray-300 px-2 md:px-6"
									>
										{seatMapData && (
											<SeatMap
												data={seatMapData}
												assignedSeatToPassengerIndex={assignedSeatToPassengerIndex}
												assignedSeatToPassengerLabel={assignedSeatToPassengerLabel}
												activeSeatCode={activeSeatCode}
												onSeatSelect={handleValidatedSeatSelect}
											/>
										)}
									</div>

									{adjacentInfoBannerMessages && adjacentInfoBannerMessages.length > 0 && (
										<div className="md:hidden">
											<Alert variant="warning">
												<AlertTitle>{t("adjacent_seat_information")}</AlertTitle>
												<AlertDescription>
													<ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
														{adjacentInfoBannerMessages.map((message) => (
															<li
																key={`${message.text}-${message.linkHref ?? ""}`}
																className="text-sm leading-5"
															>
																{message.text}
																{message.linkText && message.linkHref ? (
																	<>
																		{" "}
																		<a
																			href={message.linkHref}
																			target={message.linkTarget}
																			rel="noopener noreferrer"
																			className="text-primary-700 underline underline-offset-2"
																		>
																			{message.linkText}
																		</a>
																	</>
																) : null}
															</li>
														))}
													</ul>
												</AlertDescription>
											</Alert>
										</div>
									)}

									{seatRulesInfoMessages && seatRulesInfoMessages.length > 0 && (
										<div className="md:hidden">
											<Alert
												variant="info"
												icon={false}
												className="gap-3 bg-base-100 text-base-700"
											>
												<AlertDescription>
													<ul className="flex list-disc flex-col gap-1 pl-4">
														{seatRulesInfoMessages.map((message) => (
															<li key={message} className="text-sm leading-6">
																{message}
															</li>
														))}
													</ul>
												</AlertDescription>
											</Alert>
										</div>
									)}
								</div>
							</div>
						</div>

						<DialogFooter className="shrink-0 flex-col items-center gap-3 py-4 md:justify-end md:gap-6 md:py-3">
							<div className="pax-dialog-total flex w-full items-end justify-end gap-2 py-2 md:w-auto md:justify-start">
								<span className="text-brand-japan-black text-sm leading-6">
									{t("total_amount")}
								</span>
								<span
									className={`font-bold text-4xl leading-9 ${
										effectiveTotalSeatCost > 0 ? "text-primary-700" : "text-base-400"
									}`}
								>
									¥{effectiveTotalSeatCost.toLocaleString()}
								</span>
							</div>
							<Button
								variant="primary"
								size="xl"
								className="w-full bg-primary-700 md:w-auto"
								onClick={handleConfirmSeatSelection}
							>
								{t("confirm_selection")}
							</Button>
						</DialogFooter>
					</>
				) : (
					<EmergencyExitSupportContent
						routeLabel={routeLabel}
						onConfirm={handleConfirmEmergencyExitSupport}
						onCancel={handleGoBackFromEmergencySupport}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
