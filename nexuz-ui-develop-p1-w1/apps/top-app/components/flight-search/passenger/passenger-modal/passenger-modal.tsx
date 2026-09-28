import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { InputNumberField } from "@repo/ui/components/input-number";
import { Item, ItemActions, ItemContent } from "@repo/ui/components/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import PassengerInfo from "@/components/flight-search/passenger/passenger-info-section/passenger-info";
import { getFlightSearchPassengerMessages } from "@/modules/utils/validations/flight-search";
import type {
	PassengerCounts,
	PaxModalProps,
} from "../../../../types/flight-search/flight-search.types";

function getTotalPassengers(value: PassengerCounts): number {
	return Object.values(value).reduce((total, count) => total + count, 0);
}

const PaxModal = ({ open, origin, destination, onOpenChange, value, onChange }: PaxModalProps) => {
	const t = useTranslations("flight_search_page");
	const [draftValue, setDraftValue] = useState<PassengerCounts>(value);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const errorSectionRef = useRef<HTMLDivElement>(null);

	const passengerMessages = getFlightSearchPassengerMessages({
		origin,
		destination,
		passengerCounts: draftValue,
	});

	const errors = passengerMessages.map((message) => ({ message }));

	useEffect(() => {
		if (open) {
			setDraftValue(value);
		}
	}, [open, value]);

	const updateCount = (key: keyof PassengerCounts) => (nextValue: number) => {
		setDraftValue((prev) => ({ ...prev, [key]: nextValue }));
	};

	const handleConfirmSelection = () => {
		if (errorMessages.length > 0) {
			return;
		}

		onChange(draftValue);
		onOpenChange(false);
	};

	const errorMessages = [
		...new Set(errors.flatMap((error) => (error?.message ? [error.message] : []))),
	];
	const totalPassengers = getTotalPassengers(value);
	const passengerLabel = `${totalPassengers} ${
		totalPassengers > 1 ? t("summary_multiple") : t("summary_single")
	}`;
	const hasMultipleErrors = errorMessages.length > 1;

	useEffect(() => {
		if (!open || errorMessages.length === 0) {
			return;
		}

		errorSectionRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	}, [open, errorMessages.length]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Tooltip open={isTooltipOpen}>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Item
							asChild
							variant="outline"
							className="box-border h-11 cursor-pointer gap-2 rounded-lg border border-secondary-300 py-3 transition-colors hover:bg-base-50"
						>
							<button
								type="button"
								onPointerEnter={() => setIsTooltipOpen(true)}
								onPointerLeave={() => setIsTooltipOpen(false)}
								onFocus={() => setIsTooltipOpen(false)}
								onBlur={() => setIsTooltipOpen(false)}
							>
								<ItemContent>
									<div className="flex h-5 items-center gap-2">
										<Icon
											name="person"
											size={20}
											fill={1}
											wght={400}
											grad={0}
											opsz={24}
											color=""
											className="text-primary-600"
										/>
										<span className="text-base text-base-600 text-brand-japan-black">
											{passengerLabel}
										</span>
									</div>
								</ItemContent>
								<ItemActions>
									<Icon
										name="arrow_drop_down"
										size={18}
										fill={0}
										wght={400}
										grad={0}
										opsz={20}
										color=""
										className="text-primary-600"
									/>
								</ItemActions>
							</button>
						</Item>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>{passengerLabel}</p>
				</TooltipContent>
			</Tooltip>
			<DialogContent aria-describedby={undefined} className="gap-0">
				<DialogHeader className="border-secondary-300 bg-white">
					<DialogTitle>{t("passenger_modal_heading")}</DialogTitle>
				</DialogHeader>

				<div className="no-scrollbar flex max-h-[70vh] flex-col gap-6 overflow-y-auto bg-white p-4 md:gap-8 md:p-6">
					<div ref={errorSectionRef} className="flex flex-col gap-4">
						<p className="font-normal text-brand-japan-black text-sm leading-6">
							{t("header_title")}
						</p>
						{errorMessages.length > 0 && (
							<Alert variant="error">
								<AlertTitle>
									{hasMultipleErrors ? t("error_multiple") : errorMessages[0]}
								</AlertTitle>
								{hasMultipleErrors && (
									<AlertDescription>
										<ol className="list-decimal pl-5">
											{errorMessages.map((message) => (
												<li key={message}>{message}</li>
											))}
										</ol>
									</AlertDescription>
								)}
							</Alert>
						)}
					</div>

					{/* adult */}
					<div>
						<InputNumberField
							label={t("label_adult")}
							description={t("description_adult")}
							value={draftValue.adult}
							min={1}
							max={9}
							onChange={updateCount("adult")}
						/>
					</div>

					{/* child/infant */}
					<div>
						<div className="passenger-section-label flex flex-col gap-1 pt-2 pb-1">
							<p className="font-bold text-[14px] text-primary-700 leading-5.25">
								{t("label_child_infant")}
							</p>
							<div className="self-stretch border-secondary-300 border-b"></div>
						</div>

						<InputNumberField
							label={t("label_child_12_14")}
							value={draftValue.childA}
							min={0}
							max={9}
							onChange={updateCount("childA")}
						/>

						<InputNumberField
							label={t("label_child_7_11")}
							value={draftValue.childB}
							min={0}
							max={9}
							onChange={updateCount("childB")}
						/>

						<InputNumberField
							label={t("label_child_2_6")}
							value={draftValue.childC}
							min={0}
							max={9}
							onChange={updateCount("childC")}
						/>

						<InputNumberField
							label={t("label_infant_0_1")}
							description={t("description_infant_0_1")}
							value={draftValue.infant}
							min={0}
							max={9}
							onChange={updateCount("infant")}
						/>
					</div>

					{/* info content */}
					<PassengerInfo />
				</div>

				<DialogFooter className="border-secondary-300 bg-white py-4 md:px-4 md:py-3">
					<Button
						size={"xl"}
						onClick={handleConfirmSelection}
						className="min-w-48 rounded-lg text-white"
					>
						{t("button_confirm_selection")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PaxModal;
