"use client";

import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type * as React from "react";
import type { CabinCardProps, CabinPrices } from "@/types/flight-selection/flight-selection.types";

/**
 * Shows a low-seat badge when seat count is less than 9.
 * Hides the badge when seats are available more than 9.
 */
function SeatBadge({ seatsLeft }: Readonly<{ seatsLeft?: number }>) {
	const flightSelectionLabels = useTranslations("flight_selection_page");
	if (seatsLeft === null || seatsLeft === undefined || seatsLeft >= 9) {
		return null;
	}

	return (
		<Badge
			className={cn(
				"cabin-card__seat-badge h-auto w-19.5 self-center rounded bg-base-50 px-2.5 py-0.25 font-medium text-brand-japan-black text-xs"
			)}
		>
			{seatsLeft} {flightSelectionLabels("seat_left_label")}
		</Badge>
	);
}

type CabinContentProps = {
	prices?: CabinPrices;
	selected: boolean;
	seatsLeft?: number;
};
/**
 * Renders the informational state for unavailable cabin options.
 * Displays the provided business message beside an info icon.
 */
function DisabledCabinContent({ disabledMessage }: { disabledMessage?: string }) {
	return (
		<div className="flex items-start gap-2.5">
			<Icon name="info" size={20} fill={1} color="text-gray-600" className="mt-0.5 shrink-0" />

			<p className="text-left text-base-600 text-sm leading-6">{disabledMessage}</p>
		</div>
	);
}

/**
 * Displays the compact price layout for adult-only fares.
 * Keeps the total prominent while preserving the seat badge.
 */
function AdultOnlyCabinContent({ prices, selected, seatsLeft }: CabinContentProps) {
	const labelClassName = selected ? "text-primary-700" : "text-brand-japan-black";
	const priceClassName = selected ? "text-primary-700" : "text-brand-japan-black";
	const flightSelectionLabels = useTranslations("flight_selection_page");

	return (
		<>
			<div className="cabin-card__adult-only flex flex-col gap-0.5">
				<span className={cn("cabin-card__pax-label text-xs leading-5", labelClassName)}>
					{flightSelectionLabels("adult_label")}
				</span>

				<span
					className={cn(
						"cabin-card__adult-price whitespace-nowrap font-bold text-2xl text-brand-japan-black leading-9 md:text-2xl",
						priceClassName
					)}
				>
					{prices?.adult}
				</span>
			</div>

			<SeatBadge seatsLeft={seatsLeft} />
		</>
	);
}

/**
 * Displays the expanded price layout for mixed passenger groups.
 * Renders adult pricing first followed by each additional fare row.
 */
function MultiPaxCabinContent({ prices, selected, seatsLeft }: CabinContentProps) {
	const labelClassName = selected ? "text-primary-700" : "text-gray-700";
	const priceClassName = selected ? "text-primary-700" : "text-brand-japan-black";
	const flightSelectionLabels = useTranslations("flight_selection_page");

	return (
		<>
			<div className="cabin-card__price-list flex w-full flex-col gap-1">
				<div className="cabin-card__price-row flex items-center justify-between gap-2">
					<span
						className={cn("cabin-card__pax-label min-w-0 shrink text-xs leading-6", labelClassName)}
					>
						{flightSelectionLabels("adult_label")}
					</span>

					<span
						className={cn(
							"cabin-card__adult-price shrink-0 whitespace-nowrap font-bold text-base leading-7 md:text-lg",
							priceClassName
						)}
					>
						{prices?.adult}
					</span>
				</div>

				{prices?.extras?.map((row) => (
					<div
						key={row.label}
						className="cabin-card__price-row flex items-center justify-between gap-2"
					>
						<span
							className={cn(
								"cabin-card__pax-label min-w-0 shrink text-xs leading-5",
								labelClassName
							)}
						>
							{row.label}
						</span>

						<span
							className={cn(
								"cabin-card__extra-price shrink-0 whitespace-nowrap font-bold text-base leading-6",
								priceClassName
							)}
						>
							{row.price}
						</span>
					</div>
				))}
			</div>

			<SeatBadge seatsLeft={seatsLeft} />
		</>
	);
}

/**
 * Builds keyboard activation support for selectable cabin cards.
 * Only Enter triggers the existing click behavior.
 */
function createCardKeyDownHandler(
	onClick: React.MouseEventHandler<HTMLDivElement> | undefined,
	isInteractive: boolean
) {
	if (!isInteractive || !onClick) {
		return undefined;
	}

	return (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key !== "Enter") {
			return;
		}

		onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
	};
}

/**
 * Derives semantic interaction props for the cabin card shell.
 * Keeps disabled cards non-interactive while preserving selection state.
 */
function getCardInteractionProps({
	isDisabled,
	onClick,
	selected,
}: {
	isDisabled: boolean;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	selected: boolean;
}) {
	const isInteractive = Boolean(onClick) && !isDisabled;
	const role = isInteractive ? "button" : undefined;
	const tabIndex = isInteractive ? 0 : undefined;
	const ariaPressed = isInteractive ? selected : undefined;
	const clickHandler = isDisabled ? undefined : onClick;
	const onKeyDown = createCardKeyDownHandler(onClick, isInteractive);

	return {
		isInteractive,
		role,
		tabIndex,
		ariaPressed,
		onClick: clickHandler,
		onKeyDown,
	};
}

/**
 * Resolves the visual state classes for a cabin card.
 * Applies the correct border, image, and alignment styles per state.
 */
function getCardClassNames({
	selected,
	isDisabled,
	isInteractive,
	isAdultOnly,
}: {
	selected: boolean;
	isDisabled: boolean;
	isInteractive: boolean;
	isAdultOnly: boolean;
}) {
	let interactiveClassName: string | undefined;
	let borderClassName = "border-secondary-300";
	let indicatorClassName = "hidden bg-white";
	let imageClassName = "cabin-card__image h-full w-full object-cover";
	let contentAlignmentClassName = "items-start text-left md:self-stretch";

	if (isDisabled) {
		interactiveClassName = "cursor-not-allowed bg-gray-100";
	} else if (isInteractive) {
		interactiveClassName =
			"cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
	}

	if (selected) {
		borderClassName = "border-primary-600 ring-1 ring-primary-600";
		indicatorClassName = "bg-primary-600";
	}

	if (isDisabled) {
		imageClassName = "cabin-card__image h-full w-full object-cover opacity-40";
	}

	if (isAdultOnly) {
		contentAlignmentClassName = "justify-center items-center text-center md:self-stretch";
	}

	return {
		borderClassName,
		interactiveClassName,
		indicatorClassName,
		imageClassName,
		contentClassName: cn(
			"cabin-card__content flex min-w-0 flex-1 flex-col gap-1",
			contentAlignmentClassName
		),
	};
}

export function CabinCard({
	cabinType,
	mobileImage,
	desktopImage,
	prices,
	seatsLeft,
	selected = false,
	isDisabled = false,
	disabledMessage,
	onClick,
	className,
	...props
}: CabinCardProps) {
	const flightSelectionLabels = useTranslations("flight_selection_page");
	const isAdultOnly = !prices?.extras || prices?.extras?.length === 0;
	const interaction = getCardInteractionProps({ isDisabled, onClick, selected });
	const classNames = getCardClassNames({
		selected,
		isDisabled,
		isInteractive: interaction.isInteractive,
		isAdultOnly,
	});
	let content = <MultiPaxCabinContent prices={prices} selected={selected} seatsLeft={seatsLeft} />;

	if (isAdultOnly) {
		content = <AdultOnlyCabinContent prices={prices} selected={selected} seatsLeft={seatsLeft} />;
	}

	return (
		<Card
			role={interaction.role}
			tabIndex={interaction.tabIndex}
			aria-disabled={isDisabled || undefined}
			aria-pressed={interaction.ariaPressed}
			onClick={interaction.onClick}
			onKeyDown={interaction.onKeyDown}
			className={cn(
				"cabin-card relative w-full py-0 pt-2",
				"transition-colors duration-150",
				classNames.borderClassName,
				classNames.interactiveClassName,
				className
			)}
			{...props}
		>
			{/* Selected indicator bar */}
			<div
				className={cn(
					"cabin-card__indicator absolute top-0 right-0 left-0 h-2 w-full shrink-0 rounded-t-lg transition-colors duration-150",
					classNames.indicatorClassName
				)}
			/>

			{/*
        Layout:
          Mobile  (<768px) → side-by-side: image LEFT · content RIGHT
          Desktop (≥768px) → vertical:    image TOP  · content BELOW
      */}
			<CardContent className="cabin-card__body flex flex-row gap-2 p-2 md:flex-col md:gap-2 md:px-2 md:pt-2 md:pb-2">
				{/* Cabin image */}
				<div className="cabin-card__image-wrapper relative min-h-[148px] w-[130px] shrink-0 overflow-hidden rounded-lg md:h-auto md:min-h-[104px] md:w-full">
					<Image
						src={mobileImage}
						alt={`${cabinType} ${flightSelectionLabels("alt_seat_img")}`}
						fill
						sizes="130px"
						className={cn(classNames.imageClassName, "md:hidden")}
					/>
					<Image
						src={desktopImage}
						alt={`${cabinType} ${flightSelectionLabels("alt_seat_img")}`}
						fill
						sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 0px"
						className={cn(classNames.imageClassName, "hidden md:block")}
					/>
				</div>

				{/* Content: cabin type name + prices + badge */}
				<div className={classNames.contentClassName}>
					{/* Cabin type name */}
					<span
						className={cn(
							"cabin-card__cabin-type block font-bold text-base leading-6 md:hidden",
							isDisabled
								? "self-start text-left text-gray-400"
								: "self-center text-center text-primary-700"
						)}
					>
						{cabinType}
					</span>

					{isDisabled ? <DisabledCabinContent disabledMessage={disabledMessage} /> : content}
				</div>
			</CardContent>
		</Card>
	);
}
