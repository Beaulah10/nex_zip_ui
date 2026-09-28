/**
 * File: confirmation.tsx
 * Description: Main booking confirmation page that displays itinerary details, passenger information,
 * fare and tax summaries, receipt preferences, newsletter subscription options, and travel precautions.
 * It validates required booking inputs and enables navigation to the payment selection step.
 */

"use client";

import { NEXUZR004OffersAncillaryRequestServiceCategoryEnum } from "@repo/sdk";
import { Accordion } from "@repo/ui/components/accordion";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import Icon from "@repo/ui/components/icon";
import { Wrapper } from "@repo/ui/components/wrapper";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import Arkose from "@/components/Arkose/arkose";
import { BookingFooter } from "@/components/common/booking-footer/booking-footer";
import { ErrorDialog } from "@/components/common/error-dialog/error-dialog";
import { LoadingOverlay } from "@/components/common/loading-overlay/loading-overlay";
import { FlightItineraryCard } from "@/components/confirmation/flight-itinerary-card/flight-itinerary-card";
import { IssuanceOfReceipt } from "@/components/confirmation/issuance-of-receipt/issuance-of-receipt";
import { NewsletterSubscription } from "@/components/confirmation/newsletter-subscription/newsletter-subscription";
import { PassengerInformation } from "@/components/confirmation/passenger-information/passenger-information";
import { PassengerSummaryCard } from "@/components/confirmation/passenger-summary-card/passenger-summary-card";
import { Precautions } from "@/components/confirmation/precautions/precautions";
import { TaxesSummaryCard } from "@/components/confirmation/taxes-summary-card/taxes-summary-card";
import { PassengerInformationDialog } from "@/components/customer-information/customer-information-modal/passenger-info-dialog/passenger-information-dialog";
import { BaggageService } from "@/components/customize/baggage-service/baggage-service";
import { InflightMeals } from "@/components/customize/inflight-meals/inflight-meals";
import LoungeDialog from "@/components/customize/lounge-dialog/lounge-dialog";
import { PriorityServiceDialog } from "@/components/customize/priority-service/priority-service";
import { SeatMapDialog } from "@/components/customize/seat-map/seat-map-dialog/seat-map-dialog";
import { TransportService } from "@/components/customize/transport-service/transport-service";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { usePriorityService } from "@/modules/hooks/common/priority-service/priority-service";
import { useServicePassengers } from "@/modules/hooks/common/service-passengers/service-passengers";
import { useConfirmationBaggage } from "@/modules/hooks/confirmation/use-confirmation-baggage/use-confirmation-baggage";
import { useConfirmationBundleChange } from "@/modules/hooks/confirmation/use-confirmation-bundle-change";
import { useConfirmationData } from "@/modules/hooks/confirmation/use-confirmation-data";
import { useConfirmationExtras } from "@/modules/hooks/confirmation/use-confirmation-extras";
import {
	DEADLINE_VALIDATION_TYPES,
	PRECAUTION_LINK_PROPS,
	PRECAUTION_URLS,
} from "@/modules/utils/constants/confirmation/confirmation.constants";
import { CONFIRMATION_SUMMARY_ROW_IDS } from "@/modules/utils/constants/confirmation/summary-row.constants";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import {
	type BookingFlowDirection,
	getBookingDirectionLabel,
	getBookingFlowType,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import {
	buildConfirmationCreateOrderRequest,
	buildConfirmationOrderPrepareRequest,
	buildConfirmationPassengerNameMap,
	buildConfirmationSeatErrorState,
	buildConfirmationSeatRouteLabel,
	buildConfirmationSeatUnavailableErrorState,
	getConfirmationAdjacentRequiredSeatPassengerIds,
	getConfirmationEmergencyExitRestrictedPassengerIds,
	getConfirmationSeatSegment,
	getMissingConfirmationMealPassengerNames,
	getMissingConfirmationSeatPassengerNames,
	getUniquePassengerNames,
	prepareConfirmationSeatDialog,
} from "@/modules/utils/helpers/confirmation/confirmation";
import { getBaggageSegmentComparisonSummary } from "@/modules/utils/helpers/confirmation/confirmation-baggage/baggage-helpers/baggage-helpers";
import { prepareConfirmationLoungeDialog } from "@/modules/utils/helpers/confirmation/confirmation-lounge/confirmation-lounge";
import { detectMealAvailabilityIssue } from "@/modules/utils/helpers/confirmation/confirmation-meal/confirmation-meal";
import { prepareConfirmationPriorityDialog } from "@/modules/utils/helpers/confirmation/confirmation-priority/confirmation-priority";
import { resolveLoungeAvailabilityIssue } from "@/modules/utils/helpers/confirmation/lounge-availability/lounge-availability";
import { resolvePriorityAvailabilityIssue } from "@/modules/utils/helpers/confirmation/priority-availability/priority-availability";
import { resolveTransportAvailabilityIssue } from "@/modules/utils/helpers/confirmation/transport-availability/transport-availability";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import { getBundleIncludedMealCodes } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import { hasUsCanadaItinerary } from "@/modules/utils/validations/confirmation/issuance-of-receipt";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import {
	saveConfirmationDisabledFlags,
	selectConfirmationDisabledFlags,
} from "@/store/slices/confirmation/confirmation-disabled-flags.slice";
import {
	selectPassengerList,
	selectPrimaryPassengerId,
} from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	clearOrderCreate,
	createOrder,
	selectOrderCreateIsPending,
} from "@/store/slices/order-create/order-create.slice";
import {
	clearOrderPrepare,
	prepareOrder,
	selectOrderPrepareToken,
} from "@/store/slices/order-prepare/order-prepare.slice";
import {
	removeSeat,
	removeService,
	selectPassengers,
	setCommittedPassengerSelectionsTotal,
} from "@/store/slices/passenger/passenger.slice";
import { setPaymentIdentifiers } from "@/store/slices/payment-status/payment-status.slice";
import type {
	BaggageSegmentComparisonSummary,
	BaggageSegmentMismatchBanner,
	BaggageSegmentMismatchState,
	ConfirmationBaggageDialogState,
	ConfirmationBaggageErrorState,
	ConfirmationLoungeDialogState,
	ConfirmationLoungeErrorState,
	ConfirmationMealDialogState,
	ConfirmationMealErrorState,
	ConfirmationPriorityDialogState,
	ConfirmationPriorityErrorState,
	ConfirmationSeatDialogState,
	ConfirmationSeatErrorState,
	ConfirmationTransportErrorState,
	ConfirmationTransportServiceDialogState,
	IssuanceOfReceiptHandle,
	MealLegSectionProps,
	PrecautionSubsection,
	TotalAmountSummaryProps,
} from "@/types/confirmation/confirmation.types";
import type { CancelledSeatSelection } from "@/types/seat-map/seat-map.types";

type ConfirmationPageTranslations = ReturnType<typeof useTranslations<"confirmation_page">>;
const ARKOSE_PUBLIC_KEY = process.env.NEXT_PUBLIC_ARKOSE_PUBLIC_KEY ?? "";

/**
 * Builds the precaution sections shown on the confirmation page.
 * It wires translated text with the required external links.
 */
function getPrecautionSubsections(t: ConfirmationPageTranslations): PrecautionSubsection[] {
	const greenLink = (href: string) => (chunks: React.ReactNode) => (
		<a
			href={href}
			className="inline cursor-pointer p-0 align-baseline text-primary-700 underline"
			{...PRECAUTION_LINK_PROPS}
		>
			{chunks}
		</a>
	);
	const alertLink = (href: string) => (chunks: React.ReactNode) => (
		<a
			href={href}
			className="inline cursor-pointer p-0 align-baseline underline"
			{...PRECAUTION_LINK_PROPS}
		>
			{chunks}
		</a>
	);

	return [
		{
			title: t("precautions_purchases_title"),
			textSize: "sm",
			items: [
				{
					id: "purchase-1",
					content: t.rich("precautions_purchase_item_1", {
						transportationAgreementLink: greenLink(PRECAUTION_URLS.transportationAgreement),
						fareRegulationsLink: greenLink(PRECAUTION_URLS.fareRegulations),
						privacyPolicyLink: greenLink(PRECAUTION_URLS.privacyPolicy),
					}),
				},
				{
					id: "purchase-2",
					content: t.rich("precautions_purchase_item_2", {
						link: greenLink(PRECAUTION_URLS.fareRegulations),
					}),
				},
				{ id: "purchase-3", content: t("precautions_purchase_item_3") },
				{ id: "purchase-4", content: t("precautions_purchase_item_4") },
				{
					id: "purchase-5",
					content: t.rich("precautions_purchase_item_5", {
						alertLink: alertLink(PRECAUTION_URLS.insuranceIntroduction),
					}),
					variant: "alert",
				},
				{ id: "purchase-6", content: t("precautions_purchase_item_6"), variant: "alert" },
				{
					id: "purchase-7",
					content: t.rich("precautions_purchase_item_7", {
						checkedBaggageLink: greenLink(PRECAUTION_URLS.checkedBaggageTerms),
						souvenirSalesLink: greenLink(PRECAUTION_URLS.souvenirSalesTerms),
					}),
				},
			],
		},
		{
			title: t("precautions_onboarding_title"),
			textSize: "base",
			items: [
				{ id: "onboarding-1", content: t("precautions_onboarding_item_1") },
				{
					id: "onboarding-2",
					content: t.rich("precautions_onboarding_item_2", {
						link: greenLink(PRECAUTION_URLS.dangerousGoods),
					}),
				},
				{ id: "onboarding-3", content: t("precautions_onboarding_item_3") },
			],
		},
	];
}

/**
 * Renders one journey leg on the confirmation page.
 * It shows passenger services, actions, and tax totals for that leg.
 */
function LegSection({
	legData,
	passengers,
	taxTitle,
	taxNote,
	toggleSummaryAriaLabel,
	toggleTaxesAriaLabel,
	onBundleChange,
	bundleChangeDisabled = false,
	onMealChange,
	onBaggageChange,
	onSeatAction,
	onLoungeChange,
	onTransportChange,
	onPriorityChange,
	disabledSeatPassengerIds = [],
	disabledBaggagePassengerIds = [],
	disabledExtrasPassengerIds = [],
	restrictedSeatPassengerIds = [],
	disabledLoungePassengerIds = [],
	disabledPriorityPassengerIds = [],
	proceedAttemptCount = 0,
	shouldScrollToRestrictedSeatBanner = false,
	disabledSeatStatusLabel,
	addButtonLabel,
	passengersWithUnavailableMeals,
	mealUnavailableLabel,
	mealAddLabel,
	extrasUnavailableLabel,
	extrasAddLabel,
	loungeUnavailableLabel,
	loungeAddLabel,
	priorityUnavailableLabel,
	priorityAddLabel,
	seatRestrictionBanner,
	onExtrasChange,
	transportUnavailableLabel,
	transportAddButtonLabel,
	disabledTransportPassengerIds = [],
	baggageCarryOn7KgLabel,
	baggageSegmentMismatchFocusPassengerId,
	baggageSegmentMismatchPassengerIds,
	baggageSegmentMismatchBanner,
	baggageSegmentMismatchAttempt = 0,
	shouldScrollToBaggageSegmentMismatchBanner = false,
}: MealLegSectionProps) {
	const [openPassengerId, setOpenPassengerId] = useState<string | undefined>(passengers[0]?.id);
	useEffect(() => {
		setOpenPassengerId((currentOpenPassengerId) => {
			if (passengers.length === 0) {
				return undefined;
			}

			if (
				currentOpenPassengerId &&
				passengers.some((passenger) => passenger.id === currentOpenPassengerId)
			) {
				return currentOpenPassengerId;
			}

			return passengers[0]?.id;
		});
	}, [passengers]);

	useEffect(() => {
		if (baggageSegmentMismatchAttempt === 0 || !baggageSegmentMismatchFocusPassengerId) {
			return;
		}

		const passengerExists = passengers.some(
			(passenger) => passenger.id === baggageSegmentMismatchFocusPassengerId
		);

		if (passengerExists) {
			setOpenPassengerId(baggageSegmentMismatchFocusPassengerId);
		}
	}, [baggageSegmentMismatchAttempt, baggageSegmentMismatchFocusPassengerId, passengers]);
	useEffect(() => {
		if (
			!shouldScrollToBaggageSegmentMismatchBanner ||
			!baggageSegmentMismatchFocusPassengerId ||
			baggageSegmentMismatchAttempt === 0
		) {
			return;
		}

		/*
		 * First frame commits the controlled accordion value.
		 * Second frame allows the accordion content and alert to finish rendering.
		 */
		const firstAnimationFrameId = window.requestAnimationFrame(() => {
			const secondAnimationFrameId = window.requestAnimationFrame(() => {
				const bannerElement = document.querySelector<HTMLElement>(
					`[data-baggage-segment-mismatch-passenger-id="${baggageSegmentMismatchFocusPassengerId}"]`
				);

				if (!bannerElement) {
					return;
				}

				bannerElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "nearest",
				});

				bannerElement.focus({
					preventScroll: true,
				});
			});

			return () => {
				window.cancelAnimationFrame(secondAnimationFrameId);
			};
		});

		return () => {
			window.cancelAnimationFrame(firstAnimationFrameId);
		};
	}, [
		baggageSegmentMismatchAttempt,
		baggageSegmentMismatchFocusPassengerId,
		shouldScrollToBaggageSegmentMismatchBanner,
	]);

	useEffect(() => {
		if (proceedAttemptCount === 0) {
			return;
		}

		const firstRestrictedPassengerId = passengers.find((passenger) =>
			restrictedSeatPassengerIds.includes(passenger.id)
		)?.id;

		if (!firstRestrictedPassengerId) {
			return;
		}

		setOpenPassengerId(firstRestrictedPassengerId);
	}, [passengers, proceedAttemptCount, restrictedSeatPassengerIds]);

	useEffect(() => {
		if (proceedAttemptCount === 0) {
			return;
		}

		if (!shouldScrollToRestrictedSeatBanner) {
			return;
		}

		const firstRestrictedPassengerId = passengers.find((passenger) =>
			restrictedSeatPassengerIds.includes(passenger.id)
		)?.id;

		if (!firstRestrictedPassengerId) {
			return;
		}

		const animationFrameId = window.requestAnimationFrame(() => {
			const bannerElement = document.querySelector<HTMLElement>(
				`[data-seat-error-banner-passenger-id="${firstRestrictedPassengerId}"]`
			);

			bannerElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
		});

		return () => window.cancelAnimationFrame(animationFrameId);
	}, [
		passengers,
		proceedAttemptCount,
		restrictedSeatPassengerIds,
		shouldScrollToRestrictedSeatBanner,
	]);

	return (
		<>
			<div className="confirmation-page__section-heading flex flex-col justify-center gap-1">
				<div className="flex items-center gap-2">
					<span className="min-w-0 flex-1 font-bold text-2xl text-primary-700 leading-9">
						{legData.legLabel}
					</span>
					<span className="shrink-0 text-right font-bold text-2xl text-primary-700 leading-9 sm:text-3xl sm:leading-12">
						{formatPrice(legData.totalAmount)}
					</span>
				</div>
				<div className="h-px w-full bg-base-200" />
			</div>

			<Accordion
				type="single"
				collapsible
				value={openPassengerId}
				onValueChange={(value) => setOpenPassengerId(value || undefined)}
				className="flex flex-col gap-4 rounded-lg border border-base-300"
			>
				{passengers.map((pax) => {
					const isSeatPurchaseDisabled = disabledSeatPassengerIds.includes(pax.id);
					const isLoungePurchaseDisabled = disabledLoungePassengerIds.includes(pax.id);
					const isTransportPurchaseDisabled = disabledTransportPassengerIds.includes(pax.id);
					const isPriorityPurchaseDisabled = disabledPriorityPassengerIds.includes(pax.id);
					const isExtrasPurchaseDisabled = disabledExtrasPassengerIds.includes(pax.id);
					const rows = pax.summaryRows.map((row) => {
						if (row.id === CONFIRMATION_SUMMARY_ROW_IDS.meal) {
							return passengersWithUnavailableMeals?.has(pax.id)
								? {
										...row,
										unavailableStatus: mealUnavailableLabel,
										changeLabel: mealAddLabel ?? row.changeLabel,
										onChange: undefined,
										changeDisabled: true,
									}
								: { ...row, onChange: () => onMealChange(pax.id) };
						}

						if (row.id === CONFIRMATION_SUMMARY_ROW_IDS.lounge) {
							return {
								...row,
								groups: isLoungePurchaseDisabled
									? [{ items: [{ label: loungeUnavailableLabel ?? "" }] }]
									: row.groups,
								unavailableStatus: isLoungePurchaseDisabled ? loungeUnavailableLabel : undefined,
								changeLabel: isLoungePurchaseDisabled
									? row.changeLabel
										? (loungeAddLabel ?? row.changeLabel)
										: undefined
									: row.changeLabel,
								changeDisabled: isLoungePurchaseDisabled,
								onChange:
									isLoungePurchaseDisabled || !row.changeLabel
										? undefined
										: () => onLoungeChange(pax.id),
							};
						}

						if (row.id === CONFIRMATION_SUMMARY_ROW_IDS.transport) {
							return {
								...row,
								groups: isTransportPurchaseDisabled
									? [{ items: [{ label: transportUnavailableLabel ?? "" }] }]
									: row.groups,
								unavailableStatus: isTransportPurchaseDisabled
									? transportUnavailableLabel
									: undefined,
								changeLabel: isTransportPurchaseDisabled
									? transportAddButtonLabel
									: row.changeLabel,
								changeDisabled: isTransportPurchaseDisabled,
								onChange:
									isTransportPurchaseDisabled || !row.changeLabel
										? undefined
										: () => onTransportChange(pax.id),
							};
						}

						if (row.id === CONFIRMATION_SUMMARY_ROW_IDS.bundle) {
							return {
								...row,
								changeDisabled: bundleChangeDisabled,
								onChange: bundleChangeDisabled
									? undefined
									: row.changeLabel
										? onBundleChange
										: row.onChange,
							};
						}
						if (row.id === CONFIRMATION_SUMMARY_ROW_IDS.priority) {
							return {
								...row,
								groups: isPriorityPurchaseDisabled
									? [{ items: [{ label: priorityUnavailableLabel ?? "" }] }]
									: row.groups,
								unavailableStatus: isPriorityPurchaseDisabled
									? priorityUnavailableLabel
									: undefined,
								changeLabel: isPriorityPurchaseDisabled
									? row.changeLabel
										? (priorityAddLabel ?? row.changeLabel)
										: undefined
									: row.changeLabel,
								changeDisabled: isPriorityPurchaseDisabled,
								onChange:
									isPriorityPurchaseDisabled || !row.changeLabel
										? undefined
										: () => onPriorityChange(pax.id),
							};
						}
						if (row.id === CONFIRMATION_SUMMARY_ROW_IDS.baggage) {
							const isBaggagePurchaseDisabled = disabledBaggagePassengerIds.includes(pax.id);
							const hasBaggageSelected =
								row.groups?.some((group) => (group.items?.length ?? 0) > 0) ?? false;
							if (isBaggagePurchaseDisabled) {
								return {
									...row,
									groups: [
										{
											items: [{ label: baggageCarryOn7KgLabel }],
										},
									],
									changeLabel: addButtonLabel,
									changeDisabled: true,
									onChange: undefined,
								};
							}

							return {
								...row,
								onChange: row.changeLabel ? () => onBaggageChange(pax.id) : undefined,
								changeLabel: hasBaggageSelected ? row.changeLabel : addButtonLabel,
							};
						}
						return row;
					});
					return (
						<PassengerSummaryCard
							key={pax.id}
							accordionValue={pax.id}
							name={pax.name}
							totalPrice={pax.totalPrice}
							rows={rows.map((row) =>
								row.id === CONFIRMATION_SUMMARY_ROW_IDS.seat
									? {
											...row,
											groups: isSeatPurchaseDisabled
												? [{ items: [{ label: disabledSeatStatusLabel }] }]
												: row.groups,
											changeLabel: isSeatPurchaseDisabled ? addButtonLabel : row.changeLabel,
											changeDisabled: isSeatPurchaseDisabled,
											onChange: isSeatPurchaseDisabled
												? () => {}
												: row.changeLabel
													? () => onSeatAction(pax.id)
													: undefined,
										}
									: row.id === CONFIRMATION_SUMMARY_ROW_IDS.extras
										? isExtrasPurchaseDisabled
											? {
													...row,
													unavailableStatus: extrasUnavailableLabel,
													changeLabel: extrasAddLabel ?? addButtonLabel,
													changeDisabled: true,
													onChange: () => onExtrasChange(pax.id),
												}
											: { ...row, onChange: () => onExtrasChange(pax.id) }
										: row
							)}
							toggleAriaLabel={toggleSummaryAriaLabel}
							seatErrorBanner={
								restrictedSeatPassengerIds.includes(pax.id) ? seatRestrictionBanner : undefined
							}
							baggageSegmentMismatchBanner={
								baggageSegmentMismatchPassengerIds?.has(pax.id)
									? baggageSegmentMismatchBanner
									: undefined
							}
							showBaggageSegmentMismatchBanner={
								baggageSegmentMismatchPassengerIds?.has(pax.id) ?? false
							}
							baggageSegmentMismatchPassengerId={
								baggageSegmentMismatchFocusPassengerId === pax.id ? pax.id : undefined
							}
							isInfant={pax.isInfant}
							badgeLabel={pax.badgeLabel}
						/>
					);
				})}
			</Accordion>

			<TaxesSummaryCard
				title={taxTitle}
				note={taxNote}
				totalPrice={legData.taxTotalAmount}
				rows={legData.taxRows}
				toggleAriaLabel={toggleTaxesAriaLabel}
				defaultOpen
			/>
		</>
	);
}

/**
 * Displays the final booking amount block.
 * It shows the payable total and an optional note below it.
 */
function TotalAmountSummary({ label, amount, note }: TotalAmountSummaryProps) {
	return (
		<div className="flex w-full flex-col gap-2 py-2">
			<div className="flex items-end justify-between gap-4">
				<span className="font-bold text-2xl text-primary-700 leading-9">{label}</span>
				<span className="text-right font-bold text-4xl text-primary-700 leading-14">
					{formatPrice(amount)}
				</span>
			</div>
			{note && <p className="text-right text-base-700 text-xs leading-5">{note}</p>}
		</div>
	);
}

// ── Confirmation page ─────────────────────────────────────────────────────────

/**
 * Renders the full confirmation page before payment.
 * It manages service dialogs, validation, and final proceed actions.
 */
export default function Confirmation() {
	const commonT = useTranslations("common");
	const t = useTranslations("confirmation_page");
	const flightSelectionLabels = useTranslations("flight_selection_page");
	const seatLabels = useTranslations("seat_service");
	const mealsServiceT = useTranslations("meals_service");
	const baggageServiceT = useTranslations("baggage_service");
	const ancillaryServiceT = useTranslations("ancillary_service");
	const transportServiceT = useTranslations("transportation_service");
	const loungeServiceT = useTranslations("lounge_service");
	const { pageData, deadlineValidation } = useConfirmationData();
	const dispatch = useAppDispatch();
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const createOrderPending = useAppSelector(selectOrderCreateIsPending);
	const arkoseToken = useAppSelector(selectOrderPrepareToken);
	const passengerList = useAppSelector(selectPassengerList);
	const primaryPassengerId = useAppSelector(selectPrimaryPassengerId);
	const { servicePassengers: outboundServicePassengers } = useServicePassengers("outbound");
	const { servicePassengers: inboundServicePassengers } = useServicePassengers("inbound");
	const storedPassengers = useAppSelector(selectPassengers);
	const { orderedPassengersWithNames } = usePassengerOrder();
	const [openDialogPassengerId, setOpenDialogPassengerId] = useState<string | null>(null);
	const [mealDialogState, setMealDialogState] = useState<ConfirmationMealDialogState>({
		open: false,
		passengerId: null,
		direction: "outbound",
		stageLabel: "",
		routeLabel: "",
	});
	const [loungeDialogState, setLoungeDialogState] = useState<ConfirmationLoungeDialogState | null>(
		null
	);
	const [transportDialogState, setTransportDialogState] =
		useState<ConfirmationTransportServiceDialogState | null>(null);
	const [transportErrorState, setTransportErrorState] = useState<ConfirmationTransportErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "close",
		pendingTransportDialogPassenger: null,
	});
	const persistedDisabledFlags = useAppSelector(selectConfirmationDisabledFlags);
	const disabledTransportPassengersByDirection = persistedDisabledFlags.transport ?? {};
	const [priorityDialogState, setPriorityDialogState] =
		useState<ConfirmationPriorityDialogState | null>(null);

	const disabledLoungePassengersByDirection = persistedDisabledFlags.lounge ?? {};
	const disabledPriorityPassengersByDirection = persistedDisabledFlags.priority ?? {};

	const [seatDialogState, setSeatDialogState] = useState<ConfirmationSeatDialogState | null>(null);
	const [isServiceLoading, setIsServiceLoading] = useState(false);
	const [seatErrorState, setSeatErrorState] = useState<ConfirmationSeatErrorState>({
		open: false,
		title: "",
		content: "",
		action: "returnToTop",
		unavailableSeatSelections: [],
	});
	const disabledSeatPassengersByDirection = persistedDisabledFlags.seat ?? {};

	// Baggage : Service Dialog State for handling baggage-related service interactions
	const [baggageDialogState, setBaggageDialogState] = useState<ConfirmationBaggageDialogState>({
		open: false,
		passengerId: null,
		direction: "outbound",
		stageLabel: "",
		routeLabel: "",
	});
	const [passengersWithUnavailableMeals, setPassengersWithUnavailableMeals] = useState<
		ReadonlySet<string>
	>(new Set());
	const [hasAcceptedPrecautions, setHasAcceptedPrecautions] = useState(false);
	const [showPrecautionsAgreementError, setShowPrecautionsAgreementError] = useState(false);
	const [hasAttemptedProceed, setHasAttemptedProceed] = useState(false);
	const router = useRouter();
	const [proceedAttemptCount, setProceedAttemptCount] = useState(0);
	const [mealErrorState, setMealErrorState] = useState<ConfirmationMealErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "close",
	});
	const [loungeErrorState, setLoungeErrorState] = useState<ConfirmationLoungeErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "close",
		pendingLoungeDialogPassenger: null,
	});
	const [priorityErrorState, setPriorityErrorState] = useState<ConfirmationPriorityErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "close",
		pendingPriorityDialogPassenger: null,
	});
	// Baggage : state to disable baggage passengers by direction
	const disabledBaggagePassengersByDirection = persistedDisabledFlags.baggage ?? {};

	const [baggageSegmentMismatch, setBaggageSegmentMismatch] =
		useState<BaggageSegmentMismatchState>(null);
	const [baggageSegmentMismatchAttempt, setBaggageSegmentMismatchAttempt] = useState(0);
	const bookingFlowType = getBookingFlowType(confirmedFlight);
	const isConnectingFlight = bookingFlowType === "connecting";
	// Baggage : Error State for handling baggage-related errors
	const [baggageErrorState, setBaggageErrorState] = useState<ConfirmationBaggageErrorState>({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
		action: "close",
		pendingBaggageDialogPassenger: null,
	});
	const baggageSegmentMismatchBanner = useMemo<BaggageSegmentMismatchBanner>(
		() => ({
			title: baggageServiceT("error_labels.error_title_segment_mismatch"),
			body: baggageServiceT("error_labels.error_description_segment_mismatch"),
			variant: "error",
		}),
		[baggageServiceT]
	);
	const baggageSegmentWarningBanner = useMemo<BaggageSegmentMismatchBanner>(
		() => ({
			title: baggageServiceT("error_labels.error_title_segment_mismatch"),
			body: baggageServiceT("segment_mismatch_dialog_description"),
			variant: "warning",
		}),
		[baggageServiceT]
	);
	const [proceedErrorState, setProceedErrorState] = useState({
		open: false,
		title: "",
		content: "",
		buttonLabel: "",
	});
	const [hasPrepareOrderBoundaryError, setHasPrepareOrderBoundaryError] = useState(false);
	const [prepareOrderErrorCode, setPrepareOrderErrorCode] = useState<string | null>(null);
	const locale = useLocale();
	const expressServiceT = useTranslations("express_service");
	const {
		bundleErrorState,
		disabledBundleDirections,
		handleBundleChange,
		handleBundleErrorOpenChange,
		handleBundleErrorReturnToTop,
	} = useConfirmationBundleChange({ setIsServiceLoading });
	const receiptRef = useRef<IssuanceOfReceiptHandle>(null);
	const hasAppliedDeadlineCleanupRef = useRef(false);
	const precautionsAlertRef = useRef<HTMLDivElement | null>(null);
	const transportDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
	const precautionSubsections = getPrecautionSubsections(t);
	const inboundLegData = pageData?.inbound;
	const outboundPassengers = pageData?.outbound?.passengers ?? [];
	const inboundPassengers = inboundLegData?.passengers ?? [];
	const passengerNameById = useMemo(
		() => buildConfirmationPassengerNameMap([...outboundPassengers, ...inboundPassengers]),
		[outboundPassengers, inboundPassengers]
	);
	const orderedPassengerIds = useMemo(
		() => orderedPassengersWithNames.map((passenger) => passenger.id),
		[orderedPassengersWithNames]
	);
	const adjacentRequiredSeatPassengerIds = useMemo(
		() => getConfirmationAdjacentRequiredSeatPassengerIds(orderedPassengersWithNames),
		[orderedPassengersWithNames]
	);
	const isUsCanadaItinerary = confirmedFlight
		? hasUsCanadaItinerary([
				...confirmedFlight.flights.outbound.segments,
				...(confirmedFlight.flights.inbound?.segments ?? []),
			])
		: false;
	const [isSubscribedToNewsletter, setIsSubscribedToNewsletter] = useState(false);

	if (hasPrepareOrderBoundaryError) {
		throw new Error(
			prepareOrderErrorCode
				? `Unable to prepare order: ${prepareOrderErrorCode}`
				: "Unable to prepare order"
		);
	}
	useEffect(() => {
		setIsSubscribedToNewsletter(!isUsCanadaItinerary);
	}, [isUsCanadaItinerary]);

	const outboundRestrictedSeatPassengerIds = useMemo(
		() =>
			confirmedFlight
				? getConfirmationEmergencyExitRestrictedPassengerIds({
						confirmedFlight,
						direction: "outbound",
						storedPassengers,
					})
				: [],
		[confirmedFlight, storedPassengers]
	);
	const inboundRestrictedSeatPassengerIds = useMemo(
		() =>
			confirmedFlight && inboundLegData
				? getConfirmationEmergencyExitRestrictedPassengerIds({
						confirmedFlight,
						direction: "inbound",
						storedPassengers,
					})
				: [],
		[confirmedFlight, inboundLegData, storedPassengers]
	);
	const hasRestrictedEmergencyExitSelection =
		outboundRestrictedSeatPassengerIds.length > 0 || inboundRestrictedSeatPassengerIds.length > 0;
	const outboundMissingSeatPassengerNames = useMemo(() => {
		if (!confirmedFlight) {
			return [];
		}

		const seatSegment = getConfirmationSeatSegment({ confirmedFlight, direction: "outbound" });
		return getMissingConfirmationSeatPassengerNames({
			servicePassengers: outboundServicePassengers,
			adjacentRequiredSeatPassengerIds,
			storedPassengers,
			currentLfid: seatSegment?.lfid,
			currentPfid: seatSegment?.pfid,
			nameByPassengerId: passengerNameById,
			orderedPassengerIds,
		});
	}, [
		adjacentRequiredSeatPassengerIds,
		confirmedFlight,
		outboundServicePassengers,
		orderedPassengerIds,
		passengerNameById,
		storedPassengers,
	]);
	const inboundMissingSeatPassengerNames = useMemo(() => {
		if (!confirmedFlight || !inboundLegData) {
			return [];
		}

		const seatSegment = getConfirmationSeatSegment({ confirmedFlight, direction: "inbound" });
		return getMissingConfirmationSeatPassengerNames({
			servicePassengers: inboundServicePassengers,
			adjacentRequiredSeatPassengerIds,
			storedPassengers,
			currentLfid: seatSegment?.lfid,
			currentPfid: seatSegment?.pfid,
			nameByPassengerId: passengerNameById,
			orderedPassengerIds,
		});
	}, [
		adjacentRequiredSeatPassengerIds,
		confirmedFlight,
		inboundLegData,
		inboundServicePassengers,
		orderedPassengerIds,
		passengerNameById,
		storedPassengers,
	]);
	const missingSeatPassengerNames = useMemo(
		() =>
			getUniquePassengerNames(outboundMissingSeatPassengerNames, inboundMissingSeatPassengerNames),
		[inboundMissingSeatPassengerNames, outboundMissingSeatPassengerNames]
	);
	const outboundMissingMealPassengerNames = useMemo(() => {
		if (!confirmedFlight) {
			return [];
		}

		const selectedSegment = getSelectedAncillarySegment({ confirmedFlight, direction: "outbound" });
		return getMissingConfirmationMealPassengerNames({
			servicePassengers: outboundServicePassengers,
			passengersWithUnavailableMeals,
			storedPassengers,
			currentLfid: selectedSegment?.lfid,
			nameByPassengerId: passengerNameById,
			orderedPassengerIds,
		});
	}, [
		confirmedFlight,
		orderedPassengerIds,
		outboundServicePassengers,
		passengerNameById,
		passengersWithUnavailableMeals,
		storedPassengers,
	]);
	const inboundMissingMealPassengerNames = useMemo(() => {
		if (!confirmedFlight || !inboundLegData) {
			return [];
		}

		const selectedSegment = getSelectedAncillarySegment({ confirmedFlight, direction: "inbound" });
		return getMissingConfirmationMealPassengerNames({
			servicePassengers: inboundServicePassengers,
			passengersWithUnavailableMeals,
			storedPassengers,
			currentLfid: selectedSegment?.lfid,
			nameByPassengerId: passengerNameById,
			orderedPassengerIds,
		});
	}, [
		confirmedFlight,
		inboundLegData,
		inboundServicePassengers,
		orderedPassengerIds,
		passengerNameById,
		passengersWithUnavailableMeals,
		storedPassengers,
	]);
	const missingMealPassengerNames = useMemo(
		() =>
			getUniquePassengerNames(outboundMissingMealPassengerNames, inboundMissingMealPassengerNames),
		[inboundMissingMealPassengerNames, outboundMissingMealPassengerNames]
	);
	const seatRestrictionBanner = useMemo(
		() => ({
			title: seatLabels("error_labels.emergency_exit_title"),
			body: seatLabels("error_labels.emergency_exit_body"),
		}),
		[seatLabels]
	);
	const showSeatSelectionTopError = hasAttemptedProceed && missingSeatPassengerNames.length > 0;

	const showMealSelectionTopError = hasAttemptedProceed && missingMealPassengerNames.length > 0;

	const showAgreementTopError = hasAttemptedProceed && showPrecautionsAgreementError;

	const hasTopPageProceedErrors =
		showAgreementTopError ||
		showSeatSelectionTopError ||
		showMealSelectionTopError ||
		hasRestrictedEmergencyExitSelection;
	const outboundPrioritySelection = usePriorityService(
		"outbound",
		priorityDialogState?.open === true && priorityDialogState.direction === "outbound"
	);
	const inboundPrioritySelection = usePriorityService(
		"inbound",
		priorityDialogState?.open === true && priorityDialogState.direction === "inbound"
	);
	const activePrioritySelection =
		priorityDialogState?.direction === "inbound"
			? inboundPrioritySelection
			: outboundPrioritySelection;

	useEffect(() => {
		setIsServiceLoading(createOrderPending);
	}, [createOrderPending]);

	useEffect(() => {
		if (deadlineValidation.type !== "passenger-services") {
			return;
		}

		if (
			hasAppliedDeadlineCleanupRef.current ||
			deadlineValidation.cleanupInstructions.length === 0
		) {
			return;
		}

		for (const instruction of deadlineValidation.cleanupInstructions) {
			if (instruction.type === "remove-seat") {
				dispatch(
					removeSeat({
						passengerId: instruction.passengerId,
						lfid: instruction.lfid,
						pfid: instruction.pfid,
					})
				);
				continue;
			}

			dispatch(
				removeService({
					passengerId: instruction.passengerId,
					lfid: instruction.lfid,
					ssrCode: instruction.ssrCode,
					serviceID: instruction.serviceID,
				})
			);
		}

		hasAppliedDeadlineCleanupRef.current = true;
	}, [deadlineValidation, dispatch]);
	// Baggage : Segment comparison summary and passenger IDs for warnings/errors
	const baggageSegmentComparisonSummary = useMemo<BaggageSegmentComparisonSummary>(
		() =>
			getBaggageSegmentComparisonSummary({
				confirmedFlight,
				orderedPassengersWithNames,
				isConnectingFlight,
			}),
		[confirmedFlight, isConnectingFlight, orderedPassengersWithNames]
	);
	const outboundBaggageWarningPassengerIds = useMemo(
		() => new Set(baggageSegmentComparisonSummary.segment1LessThanSegment2PassengerIds),
		[baggageSegmentComparisonSummary.segment1LessThanSegment2PassengerIds]
	);
	const inboundBaggageErrorPassengerIds = useMemo(
		() => new Set(baggageSegmentComparisonSummary.segment1GreaterThanSegment2PassengerIds),
		[baggageSegmentComparisonSummary.segment1GreaterThanSegment2PassengerIds]
	);
	const { handleBaggageChange, handleBaggageErrorDialogClose } = useConfirmationBaggage({
		dispatch,
		confirmedFlight,
		passengerList,
		storedPassengers,
		orderedPassengersWithNames,
		outboundServicePassengers,
		inboundServicePassengers,
		baggageErrorState,
		setBaggageDialogState,
		setBaggageErrorState,
		setIsServiceLoading,
		baggageServiceT,
		ancillaryServiceT,
		returnToTop: () => router.push(`/${locale}`),
	});
	const {
		extrasErrorState,
		disabledExtrasPassengersByDirection,
		handleExtrasChange,
		handleExtrasErrorDialogClose,
	} = useConfirmationExtras({
		dispatch,
		confirmedFlight,
		passengerList,
		storedPassengers,
		orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
		locale,
		setIsServiceLoading,
		navigate: (path) => router.push(path),
		commonT,
		t,
		ancillaryServiceT,
	});

	/**
	 * Validates the confirmation step before moving to payment.
	 * It blocks navigation when seat or receipt checks still fail.
	 */
	const handleProceedToPaymentSelection = async () => {
		setHasAttemptedProceed(true);
		setProceedAttemptCount((currentCount) => currentCount + 1);
		if (!pageData) {
			return;
		}
		const hasAgreementError = !hasAcceptedPrecautions;
		const hasSeatSelectionError = missingSeatPassengerNames.length > 0;
		const hasMealSelectionError = missingMealPassengerNames.length > 0;

		setShowPrecautionsAgreementError(hasAgreementError);

		if (hasSeatSelectionError || hasMealSelectionError || hasAgreementError) {
			requestAnimationFrame(() => precautionsAlertRef.current?.focus());
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		if (hasRestrictedEmergencyExitSelection) {
			requestAnimationFrame(() => precautionsAlertRef.current?.focus());
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		if (!receiptRef.current?.validateSelection()) {
			requestAnimationFrame(() => receiptRef.current?.focus());
			return;
		}
		// Baggage : Prevent proceeding if there are segment mismatches for connecting flights
		if (isConnectingFlight) {
			const firstBlockingPassengerId =
				baggageSegmentComparisonSummary.segment1GreaterThanSegment2PassengerIds[0];

			if (firstBlockingPassengerId) {
				const affectedDirection: BookingFlowDirection = inboundLegData ? "inbound" : "outbound";
				setBaggageSegmentMismatch({
					passengerId: firstBlockingPassengerId,
					direction: affectedDirection,
				});
				setBaggageSegmentMismatchAttempt((currentAttempt) => currentAttempt + 1);
				return;
			}
		}
		setBaggageSegmentMismatch(null);
		dispatch(setCommittedPassengerSelectionsTotal(pageData.grandTotalAmount));
		setIsServiceLoading(true);

		try {
			if (!confirmedFlight) {
				throw new Error("Unable to prepare order: confirmed flight is missing");
			}

			const request = buildConfirmationOrderPrepareRequest({
				confirmedFlight,
				passengerList,
				storedPassengers,
				primaryPassengerId,
				marketingMails: isSubscribedToNewsletter,
			});

			const resultAction = await dispatch(
				prepareOrder({
					currency: confirmedFlight.currency,
					language: confirmedFlight.language,
					request,
				})
			);

			// Handle Prepare Order API failure
			if (prepareOrder.rejected.match(resultAction)) {
				const errorCode = resultAction.payload?.code;
				setPrepareOrderErrorCode(typeof errorCode === "string" ? errorCode : null);
				setHasPrepareOrderBoundaryError(true);
				return;
			}

			// Prepare Order succeeded, but token is missing
			if (
				typeof resultAction.payload.data.token !== "string" ||
				resultAction.payload.data.token.length === 0
			) {
				setPrepareOrderErrorCode(null);
				setHasPrepareOrderBoundaryError(true);
				return;
			}
		} catch {
			setPrepareOrderErrorCode(null);
			setHasPrepareOrderBoundaryError(true);
		} finally {
			setIsServiceLoading(false);
		}
	};

	const handleCreateOrder = async (verifyToken: string) => {
		if (!confirmedFlight) {
			setHasPrepareOrderBoundaryError(true);
			return;
		}

		const recipientInfo = receiptRef.current?.getRecipientInfo();

		if (!recipientInfo) {
			setHasPrepareOrderBoundaryError(true);
			return;
		}

		try {
			const request = buildConfirmationCreateOrderRequest({
				verifyToken,
				passengerList,
				recipientInfo,
			});

			const resultAction = await dispatch(
				createOrder({
					currency: confirmedFlight.currency,
					language: confirmedFlight.language,
					request,
				})
			);

			if (
				!createOrder.fulfilled.match(resultAction) ||
				typeof resultAction.payload.data.redirectionUrl !== "string" ||
				resultAction.payload.data.redirectionUrl.length === 0
			) {
				setHasPrepareOrderBoundaryError(true);
				return;
			}

			/**
			 * Store orderId for completion/payment-failure pages.
			 * API contract:
			 * data.statusCheckKey = orderId
			 */
			dispatch(
				setPaymentIdentifiers({
					orderId: resultAction.payload.data.statusCheckKey,
					paymentReferenceId: Number(resultAction.payload.data.paymentReferenceId),
				})
			);
			dispatch(clearOrderPrepare());
			dispatch(clearOrderCreate());
			window.location.href = resultAction.payload.data.redirectionUrl;
		} catch {
			setHasPrepareOrderBoundaryError(true);
		}
	};

	/**
	 * Opens the meal dialog for the selected passenger and leg.
	 * It also prepares the stage and route labels used in the modal.
	 */
	const openMealDialog = (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) return;
		const selectedSegment = getSelectedAncillarySegment({ confirmedFlight, direction });
		if (!selectedSegment) return;
		setMealDialogState({
			open: true,
			passengerId,
			direction,
			stageLabel: getBookingDirectionLabel({ confirmedFlight, direction }),
			routeLabel: getAirportRouteLabel([selectedSegment]),
		});
	};

	/**
	 * Shows a fallback dialog when meal data cannot be loaded.
	 * This is used for fetch failures and invalid meal inventory responses.
	 */
	const openMealServiceUnavailableDialog = () => {
		setMealErrorState({
			open: true,
			title: ancillaryServiceT("service_unavailable_session_title"),
			content: ancillaryServiceT("service_unavailable_session_message"),
			buttonLabel: mealsServiceT("error_labels.bundle_meal_unavailable_button"),
			action: "returnToTop",
			redirectUrl: `/${locale}`,
			pendingMealDialogPassenger: null,
		});
	};

	/**
	 * Checks meal availability before opening the meal dialog.
	 * It removes invalid selections and shows the right recovery dialog.
	 */
	const handleMealChange = async (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		setIsServiceLoading(true);

		try {
			const selectedSegment = getSelectedAncillarySegment({
				confirmedFlight,
				direction,
			});

			if (!selectedSegment) {
				return;
			}

			let request: ReturnType<typeof buildRetrieveOfferAncillariesRequest>;
			try {
				request = buildRetrieveOfferAncillariesRequest({
					confirmedFlight,
					segment: selectedSegment,
					passengers: passengerList,
					serviceCategory: "MEALS",
				});
			} catch {
				openMealServiceUnavailableDialog();
				return;
			}

			const scope = getBookingStageSegment({ confirmedFlight, direction });

			const resultAction = await dispatch(
				fetchAncillaryOffers({
					scope,
					request,
				})
			);

			if (!fetchAncillaryOffers.fulfilled.match(resultAction)) {
				openMealServiceUnavailableDialog();
				return;
			}

			const ancillaryData = resultAction.payload;
			const hasMealInventoryData =
				ancillaryData.data?.servicesPerPassengerType?.some((entry) =>
					(entry.categories ?? []).some((category) => (category.specialServices ?? []).length > 0)
				) === true;

			if (!hasMealInventoryData) {
				openMealServiceUnavailableDialog();
				return;
			}

			const lfid = selectedSegment.lfid;

			// Compute bundle meal codes per passenger for this lfid (excluding ICN Value Bundle passengers)
			const activeServicePassengers =
				direction === "outbound" ? outboundServicePassengers : inboundServicePassengers;
			const servicePassengerById = Object.fromEntries(
				activeServicePassengers.map((passenger) => [passenger.id, passenger])
			) as Record<string, { isIcnRoute: boolean; isValueBundle: boolean }>;
			const bundleIncludedMealCodesByPassengerId: Record<string, ReadonlySet<string>> = {};
			for (const passenger of storedPassengers) {
				const servicePassenger = servicePassengerById[passenger.id];
				if (servicePassenger?.isIcnRoute && servicePassenger.isValueBundle) {
					bundleIncludedMealCodesByPassengerId[passenger.id] = new Set<string>();
					continue;
				}
				const codes = new Set<string>();
				for (const bundle of passenger.bundles ?? []) {
					if (bundle.lfid === lfid) {
						for (const code of getBundleIncludedMealCodes(bundle.bundleCategory?.categories)) {
							codes.add(code);
						}
					}
				}
				if (codes.size > 0) {
					bundleIncludedMealCodesByPassengerId[passenger.id] = codes;
				}
			}

			const orderedPassengerIds = orderedPassengersWithNames.map((p) => p.id);

			const issue = detectMealAvailabilityIssue({
				ancillaryData,
				storedPassengers,
				orderedPassengerIds,
				lfid,
				bundleIncludedMealCodesByPassengerId,
			});

			if (issue.type === "noop") {
				openMealDialog(passengerId, direction);
				return;
			}

			if (issue.type === "bundle-meal-unavailable") {
				setMealErrorState({
					open: true,
					title: mealsServiceT("error_labels.bundle_meal_unavailable_title"),
					content: mealsServiceT("error_labels.bundle_meal_unavailable_content"),
					buttonLabel: mealsServiceT("error_labels.bundle_meal_unavailable_button"),
					action: "returnToTop",
					redirectUrl: `/${locale}`,
				});
				return;
			}

			if (issue.type === "all-meals-unavailable") {
				for (const mealToRemove of issue.mealsToRemove) {
					dispatch(removeService(mealToRemove));
				}
				setPassengersWithUnavailableMeals(new Set(orderedPassengerIds));
				const content = issue.hasExistingSelections
					? mealsServiceT("error_labels.proceed_without_meal_message")
					: mealsServiceT("error_labels.meals_unavailable_proceed_message");
				setMealErrorState({
					open: true,
					title: mealsServiceT("error_labels.meal_unavailable_title"),
					content,
					buttonLabel: mealsServiceT("error_labels.meals_unavailable_return_button"),
					action: "close",
				});
				return;
			}

			if (issue.type === "selected-meal-unavailable") {
				for (const mealToRemove of issue.mealsToRemove) {
					dispatch(removeService(mealToRemove));
				}
				const contentSuffix = issue.unavailableMeals
					.map((e) => `${e.mealName} : ${e.passengerName}`)
					.join("\n");
				const content = `${mealsServiceT("error_labels.meal_cancelled_content")}\n\n${contentSuffix}`;
				setMealErrorState({
					open: true,
					title: mealsServiceT("error_labels.meal_cancelled_title"),
					content,
					buttonLabel: mealsServiceT("error_labels.meal_cancelled_ok_button"),
					action: "close",
					pendingMealDialogPassenger: { passengerId, direction },
				});
				return;
			}

			if (issue.type === "partial-meals-unavailable") {
				for (const mealToRemove of issue.mealsToRemove) {
					dispatch(removeService(mealToRemove));
				}
				setPassengersWithUnavailableMeals(
					(prev) => new Set([...prev, ...issue.affectedPassengerIds])
				);
				// If the clicked passenger is one of the affected ones, show dialog instead of opening meals
				if (issue.affectedPassengerIds.includes(passengerId)) {
					setMealErrorState({
						open: true,
						title: mealsServiceT("error_labels.meal_unavailable_title"),
						content: mealsServiceT("error_labels.proceed_without_meal_message"),
						buttonLabel: mealsServiceT("error_labels.meals_unavailable_return_button"),
						action: "close",
					});
				} else {
					openMealDialog(passengerId, direction);
				}
				return;
			}
		} finally {
			setIsServiceLoading(false);
		}
	};

	/**
	 * Closes the meal error dialog.
	 * It reopens the meal dialog when a pending passenger is stored.
	 */
	const handleMealErrorDialogClose = () => {
		const pending = mealErrorState.pendingMealDialogPassenger;
		setMealErrorState((s) => ({ ...s, open: false, pendingMealDialogPassenger: null }));
		if (pending) {
			openMealDialog(pending.passengerId, pending.direction);
		}
	};
	/**
	 * Closes the extras error dialog.
	 */
	/**
	 * Closes the lounge error dialog.
	 * It retries opening lounge selection when a passenger is pending.
	 */
	const handleLoungeErrorDialogClose = () => {
		const pending = loungeErrorState.pendingLoungeDialogPassenger;
		setLoungeErrorState((currentState) => ({
			...currentState,
			open: false,
			pendingLoungeDialogPassenger: null,
		}));
		if (pending) {
			void handleLoungeChange(pending.passengerId, pending.direction);
		}
	};

	/**
	 * Closes the transport error dialog.
	 * It retries the transport flow when a pending passenger exists.
	 */
	const handleTransportErrorDialogClose = () => {
		const pending = transportErrorState.pendingTransportDialogPassenger;
		setTransportErrorState((currentState) => ({
			...currentState,
			open: false,
			pendingTransportDialogPassenger: null,
		}));
		if (pending) {
			void handleTransportChange(pending.passengerId, pending.direction);
		}
	};

	/**
	 * Closes the priority error dialog.
	 * It retries the priority flow when a pending passenger exists.
	 */
	const handlePriorityErrorDialogClose = () => {
		const pending = priorityErrorState.pendingPriorityDialogPassenger;
		setPriorityErrorState((currentState) => ({
			...currentState,
			open: false,
			pendingPriorityDialogPassenger: null,
		}));
		if (pending) {
			void handlePriorityChange(pending.passengerId, pending.direction);
		}
	};

	/**
	 * Opens lounge selection after validating current availability.
	 * It disables affected passengers and clears invalid lounge choices.
	 */
	const handleLoungeChange = async (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		setIsServiceLoading(true);

		try {
			const result = await prepareConfirmationLoungeDialog({
				dispatch,
				confirmedFlight,
				direction,
				passengerId,
				passengers: passengerList,
			});

			if (result.type === "service-unavailable") {
				setLoungeErrorState({
					open: true,
					title: ancillaryServiceT("service_unavailable_session_title"),
					content: ancillaryServiceT("service_unavailable_session_message"),
					buttonLabel: mealsServiceT("error_labels.bundle_meal_unavailable_button"),
					action: "returnToTop",
					redirectUrl: `/${locale}`,
					pendingLoungeDialogPassenger: null,
				});
				return;
			}

			if (result.type === "open-lounge-dialog") {
				const loungeAvailabilityIssue = resolveLoungeAvailabilityIssue({
					ancillaryData: result.ancillaryData,
					storedPassengers,
					orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
					lfid: result.loungeDialogState.segmentLfid ?? 0,
					clickedPassengerId: passengerId,
					allPassengerIds:
						direction === "outbound"
							? (pageData?.outbound.passengers ?? []).map((passenger) => passenger.id)
							: (pageData?.inbound?.passengers ?? []).map((passenger) => passenger.id),
				});

				if (loungeAvailabilityIssue.type === "all-lounges-unavailable") {
					for (const loungeToRemove of loungeAvailabilityIssue.loungesToRemove) {
						dispatch(removeService(loungeToRemove));
					}
					dispatch(
						saveConfirmationDisabledFlags({
							lounge: {
								...persistedDisabledFlags.lounge,
								[direction]: loungeAvailabilityIssue.disabledPassengerIds,
							},
						})
					);

					setLoungeErrorState({
						open: true,
						title: loungeServiceT("no_lounges_available_title"),
						content: loungeServiceT("no_lounges_available_content"),
						buttonLabel: loungeServiceT("no_lounges_available_button"),
						action: "close",
						pendingLoungeDialogPassenger: null,
					});
					return;
				}

				if (loungeAvailabilityIssue.type === "selected-lounge-unavailable") {
					for (const loungeToRemove of loungeAvailabilityIssue.loungesToRemove) {
						dispatch(removeService(loungeToRemove));
					}

					dispatch(
						saveConfirmationDisabledFlags({
							lounge: {
								...persistedDisabledFlags.lounge,
								[direction]: Array.from(
									new Set([
										...(persistedDisabledFlags.lounge?.[direction] ?? []),
										...loungeAvailabilityIssue.disabledPassengerIds,
									])
								),
							},
						})
					);

					setLoungeErrorState({
						open: true,
						title: loungeServiceT("lounge_cancelled_title"),
						content: `${loungeServiceT("lounge_cancelled_content")}\n\n${loungeAvailabilityIssue.contentSuffix}`,
						buttonLabel: loungeServiceT("lounge_cancelled_ok_button"),
						action: "close",
						pendingLoungeDialogPassenger: loungeAvailabilityIssue.shouldReopenDialog
							? { passengerId, direction }
							: null,
					});
					return;
				}

				dispatch(
					saveConfirmationDisabledFlags({
						lounge: {
							...persistedDisabledFlags.lounge,
							[direction]: (persistedDisabledFlags.lounge?.[direction] ?? []).filter(
								(id) => id !== passengerId
							),
						},
					})
				);
				setLoungeDialogState(result.loungeDialogState);
			}
		} finally {
			setIsServiceLoading(false);
		}
	};
	/**
	 * Opens transport selection after checking current stock.
	 * It removes unavailable transport choices and updates disabled passengers.
	 */
	const handleTransportChange = async (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		setIsServiceLoading(true);

		try {
			const selectedSegment = getSelectedAncillarySegment({ confirmedFlight, direction });

			if (!selectedSegment) {
				return;
			}

			const request = buildRetrieveOfferAncillariesRequest({
				confirmedFlight,
				segment: selectedSegment,
				passengers: passengerList,
				serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum.transportation,
			});
			const scope = getBookingStageSegment({ confirmedFlight, direction });
			const resultAction = await dispatch(fetchAncillaryOffers({ scope, request }));

			if (!fetchAncillaryOffers.fulfilled.match(resultAction)) {
				setTransportErrorState({
					open: true,
					title: ancillaryServiceT("service_unavailable_title"),
					content: ancillaryServiceT("service_unavailable_message"),
					buttonLabel: mealsServiceT("error_labels.bundle_meal_unavailable_button"),
					action: "returnToTop",
					redirectUrl: `/${locale}`,
					pendingTransportDialogPassenger: null,
				});
				return;
			}

			const availabilityIssue = resolveTransportAvailabilityIssue({
				ancillaryData: resultAction.payload,
				storedPassengers,
				orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
				lfid: selectedSegment.lfid,
				clickedPassengerId: passengerId,
				allPassengerIds:
					direction === "outbound"
						? (pageData?.outbound.passengers ?? []).map((passenger) => passenger.id)
						: (pageData?.inbound?.passengers ?? []).map((passenger) => passenger.id),
			});

			if (availabilityIssue.type !== "noop") {
				for (const transportToRemove of availabilityIssue.transportsToRemove) {
					dispatch(removeService(transportToRemove));
				}

				dispatch(
					saveConfirmationDisabledFlags({
						transport: {
							...persistedDisabledFlags.transport,
							[direction]: Array.from(
								new Set([
									...(persistedDisabledFlags.transport?.[direction] ?? []),
									...availabilityIssue.disabledPassengerIds,
								])
							),
						},
					})
				);

				if (availabilityIssue.type === "all-transports-unavailable") {
					setTransportErrorState({
						open: true,
						title: transportServiceT("error_labels.transport_no_services_available_title"),
						content: transportServiceT("error_labels.transport_no_services_available_content"),
						buttonLabel: transportServiceT("error_labels.transport_no_services_available_button"),
						action: "close",
						pendingTransportDialogPassenger: null,
					});
					return;
				}

				setTransportErrorState({
					open: true,
					title: transportServiceT("error_labels.transport_selection_cancelled_title"),
					content: `${transportServiceT("error_labels.transport_selection_cancelled_content")}\n\n${availabilityIssue.contentSuffix}`,
					buttonLabel: transportServiceT("error_labels.transport_selection_cancelled_button"),
					action: "close",
					pendingTransportDialogPassenger: availabilityIssue.shouldReopenDialog
						? { passengerId, direction }
						: null,
				});
				return;
			}

			setTransportDialogState({
				open: true,
				passengerId,
				direction,
				stageLabel: getBookingDirectionLabel({ confirmedFlight, direction }),
				routeLabel: getAirportRouteLabel([selectedSegment]),
				origin: selectedSegment.origin,
				destination: selectedSegment.destination,
			});
		} catch {
			setTransportErrorState({
				open: true,
				title: ancillaryServiceT("service_unavailable_session_title"),
				content: ancillaryServiceT("service_unavailable_session_message"),
				action: "close",
				buttonLabel: mealsServiceT("error_labels.bundle_meal_unavailable_button"),
				pendingTransportDialogPassenger: null,
			});
		} finally {
			setIsServiceLoading(false);
		}
	};

	/**
	 * Opens the priority service dialog when stock is still valid.
	 * It clears unavailable selections and marks affected passengers.
	 */
	const handlePriorityChange = async (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		setIsServiceLoading(true);

		try {
			const result = await prepareConfirmationPriorityDialog({
				dispatch,
				confirmedFlight,
				direction,
				passengerId,
				passengers: passengerList,
			});

			if (result.type === "service-unavailable") {
				setPriorityErrorState({
					open: true,
					title: ancillaryServiceT("service_unavailable_session_title"),
					content: ancillaryServiceT("service_unavailable_session_message"),
					buttonLabel: mealsServiceT("error_labels.bundle_meal_unavailable_button"),
					action: "returnToTop",
					redirectUrl: `/${locale}`,
					pendingPriorityDialogPassenger: null,
				});
				return;
			}

			if (result.type === "open-priority-dialog") {
				const priorityAvailabilityIssue = resolvePriorityAvailabilityIssue({
					ancillaryData: result.ancillaryData,
					storedPassengers,
					orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
					lfid: result.priorityDialogState.segmentLfid ?? 0,
					clickedPassengerId: passengerId,
					allPassengerIds:
						direction === "outbound"
							? (pageData?.outbound.passengers ?? []).map((passenger) => passenger.id)
							: (pageData?.inbound?.passengers ?? []).map((passenger) => passenger.id),
				});

				if (priorityAvailabilityIssue.type === "all-priority-unavailable") {
					for (const serviceToRemove of priorityAvailabilityIssue.servicesToRemove) {
						dispatch(removeService(serviceToRemove));
					}

					dispatch(
						saveConfirmationDisabledFlags({
							priority: {
								...persistedDisabledFlags.priority,
								[direction]: priorityAvailabilityIssue.disabledPassengerIds,
							},
						})
					);

					setPriorityErrorState({
						open: true,
						title: expressServiceT("express_services_available_title"),
						content: expressServiceT("express_services_available_content"),
						buttonLabel: expressServiceT("express_services_available_button"),
						action: "close",
						pendingPriorityDialogPassenger: null,
					});
					return;
				}

				if (priorityAvailabilityIssue.type === "selected-priority-unavailable") {
					for (const serviceToRemove of priorityAvailabilityIssue.servicesToRemove) {
						dispatch(removeService(serviceToRemove));
					}

					dispatch(
						saveConfirmationDisabledFlags({
							priority: {
								...persistedDisabledFlags.priority,
								[direction]: Array.from(
									new Set([
										...(persistedDisabledFlags.priority?.[direction] ?? []),
										...priorityAvailabilityIssue.disabledPassengerIds,
									])
								),
							},
						})
					);

					setPriorityErrorState({
						open: true,
						title: expressServiceT("express_cancelled_title"),
						content: `${expressServiceT("express_cancelled_content")}\n\n${priorityAvailabilityIssue.contentSuffix}`,
						buttonLabel: expressServiceT("express_cancelled_ok_button"),
						action: "close",
						pendingPriorityDialogPassenger: priorityAvailabilityIssue.shouldReopenDialog
							? { passengerId, direction }
							: null,
					});
					return;
				}

				dispatch(
					saveConfirmationDisabledFlags({
						priority: {
							...persistedDisabledFlags.priority,
							[direction]: (persistedDisabledFlags.priority?.[direction] ?? []).filter(
								(id) => id !== passengerId
							),
						},
					})
				);
				setPriorityDialogState(result.priorityDialogState);
			}
		} finally {
			setIsServiceLoading(false);
		}
	};
	/**
	 * Returns the passenger index used to focus the correct passenger
	 * when opening the seat map dialog.
	 */
	const seatDialogInitialPassengerIndex = useMemo(() => {
		if (!seatDialogState?.passengerId) {
			return undefined;
		}

		const index = orderedPassengersWithNames.findIndex(
			(passenger) => passenger.id === seatDialogState.passengerId
		);

		return index >= 0 ? index : undefined;
	}, [orderedPassengersWithNames, seatDialogState?.passengerId]);

	/**
	 * Handles the seat error dialog confirm action.
	 * It clears invalid seats and reopens the seat map when needed.
	 */
	const handleSeatErrorDialog = () => {
		if (seatErrorState.unavailableSeatSelections.length > 0 && seatDialogState) {
			for (const unavailableSeatSelection of seatErrorState.unavailableSeatSelections) {
				dispatch(
					removeSeat({
						passengerId: unavailableSeatSelection.passengerId,
						lfid: unavailableSeatSelection.lfid,
						pfid: unavailableSeatSelection.pfid,
					})
				);
			}

			setSeatErrorState((currentState) => ({
				...currentState,
				open: false,
				unavailableSeatSelections: [],
			}));
			setSeatDialogState((currentState) =>
				currentState ? { ...currentState, open: true } : currentState
			);
			return;
		}

		setSeatErrorState((currentState) => ({
			...currentState,
			open: false,
			unavailableSeatSelections: [],
		}));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	/**
	 * Validates seat availability before opening the seat map.
	 * It removes unavailable seats and shows the matching error dialog.
	 */
	const handleSeatAction = async ({
		direction,
		passengerId,
		stageLabel,
		routeLabel,
	}: {
		direction: BookingFlowDirection;
		passengerId: string;
		stageLabel: string;
		routeLabel: string;
	}) => {
		if (!confirmedFlight || !pageData || storedPassengers.length === 0) {
			return;
		}

		const seatSegment = getConfirmationSeatSegment({ confirmedFlight, direction });

		setIsServiceLoading(true);

		try {
			const result = await prepareConfirmationSeatDialog({
				dispatch,
				locale,
				confirmedFlight,
				direction,
				passengerId,
				stageLabel,
				routeLabel,
				orderedPassengersWithNames,
				storedPassengers,
			});

			if (result.type === "noop") {
				return;
			}

			if (result.type === "service-unavailable") {
				setSeatErrorState(buildConfirmationSeatUnavailableErrorState(ancillaryServiceT));
				return;
			}

			if (result.type === "open-seat-error-dialog") {
				if (result.isBundleSeatUnavailable) {
					for (const unavailableSeatSelection of result.seatSelectionsToRemove ?? []) {
						dispatch(
							removeSeat({
								passengerId: unavailableSeatSelection.passengerId,
								lfid: unavailableSeatSelection.lfid,
								pfid: unavailableSeatSelection.pfid,
							})
						);
					}
					setSeatDialogState(null);
					setSeatErrorState({
						open: true,
						title: seatLabels("error_labels.bundle_seat_unavailable_title"),
						content: seatLabels("error_labels.bundle_seat_unavailable_description"),
						buttonLabel: seatLabels("error_labels.bundle_seat_unavailable_button"),
						action: "returnToTop",
						unavailableSeatSelections: [],
					});
					return;
				}
				if (result.dialogType === "NO_AVAILABLE_SEATS") {
					const disabledPassengerIds =
						direction === "outbound"
							? pageData.outbound.passengers.map((passenger) => passenger.id)
							: (pageData.inbound?.passengers ?? []).map((passenger) => passenger.id);

					if (seatSegment) {
						for (const storedPassenger of storedPassengers) {
							const hasSeatOnSegment = storedPassenger.seats?.some(
								(seat) => seat.lfid === seatSegment.lfid && seat.pfid === (seatSegment.pfid ?? 0)
							);

							if (!hasSeatOnSegment) {
								continue;
							}

							dispatch(
								removeSeat({
									passengerId: storedPassenger.id,
									lfid: seatSegment.lfid,
									pfid: seatSegment.pfid ?? 0,
								})
							);
						}
					}

					dispatch(
						saveConfirmationDisabledFlags({
							seat: {
								...persistedDisabledFlags.seat,
								[direction]: disabledPassengerIds,
							},
						})
					);
				}

				if (result.seatDialogState) {
					setSeatDialogState(result.seatDialogState);
				}

				setSeatErrorState(
					buildConfirmationSeatErrorState({
						dialogType: result.dialogType,
						seatLabels,
						seatSelectionsToRemove: result.seatSelectionsToRemove,
						contentSuffix: result.contentSuffix,
						useAdjacentSeatCancellationMessage: result.seatSelectionsToRemove?.some(
							(selection: CancelledSeatSelection) => selection.isAdjacentSeatRelated
						),
					})
				);
				return;
			}

			setSeatDialogState(result.seatDialogState);
		} finally {
			setIsServiceLoading(false);
		}
	};

	// Guard: confirmed flight not yet in store
	if (!pageData) {
		return (
			<div className="confirmation-page relative left-1/2 flex w-screen -translate-x-1/2 flex-col bg-base-100">
				<div className="mx-auto flex w-full max-w-5xl flex-col items-start px-4 py-16 md:px-0">
					<p className="text-base text-secondary-700 leading-6">{t("subtitle")}</p>
				</div>
			</div>
		);
	}

	if (
		deadlineValidation.type === DEADLINE_VALIDATION_TYPES.BOOKING_ERROR ||
		deadlineValidation.type === DEADLINE_VALIDATION_TYPES.BUNDLE_DEADLINE
	) {
		return (
			<ErrorDialog
				open
				title={deadlineValidation.modal.title}
				content={deadlineValidation.modal.message}
				buttonLabel={deadlineValidation.modal.buttonLabel}
				action="returnToTop"
				redirectUrl={deadlineValidation.modal.redirectPath}
				onOpenChange={() => {}}
				onReturnToTop={() => {}}
			/>
		);
	}

	return (
		<div className="flex w-full flex-col pb-14">
			{/* ── Header ──────────────────────────────────────────────────────── */}
			<div className="w-full bg-white">
				<div className="mx-auto flex w-full max-w-5xl flex-col items-start px-4 pb-4 md:px-0 md:pb-6">
					<div className="flex w-full flex-col items-start gap-4">
						<h1 className="font-bold text-3xl text-brand-japan-black leading-10 md:text-4xl md:leading-13">
							{t("confirmation_page_title")}
						</h1>
						<p className="text-secondary-700 text-sm leading-6">{t("subtitle")}</p>
					</div>
				</div>
			</div>

			{/* ── Section 1: itinerary summaries and fare details ──────────────── */}
			<div className="bg-base-100">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 bg-base-100 px-4 py-4 md:gap-6 md:px-0 md:py-6">
					{hasTopPageProceedErrors && (
						<div ref={precautionsAlertRef} tabIndex={-1} className="flex flex-col gap-3">
							{showAgreementTopError && (
								<Alert variant="error">
									<AlertTitle>{t("error_labels.purchase_agreement_required_title")}</AlertTitle>
									<AlertDescription>
										{t("error_labels.purchase_agreement_required_message")}
									</AlertDescription>
								</Alert>
							)}
							{showSeatSelectionTopError && (
								<div className="w-full rounded-md bg-error-100 py-3 text-error-700 text-sm leading-6">
									<Alert variant="error">
										<AlertTitle>
											{t("error_labels.confirmation_missing_seat_selection", {
												passengers: missingSeatPassengerNames.map((name) => `"${name}"`).join(", "),
											})}
										</AlertTitle>
									</Alert>
								</div>
							)}
							{showMealSelectionTopError && (
								<div className="w-full rounded-md bg-error-100 py-3 text-error-700 text-sm leading-6">
									<Alert variant="error">
										<AlertTitle>
											{t("error_labels.confirmation_missing_meal_selection", {
												passengers: missingMealPassengerNames.map((name) => `"${name}"`).join(", "),
											})}
										</AlertTitle>
									</Alert>
								</div>
							)}
						</div>
					)}

					{/* Flight itinerary cards (outbound + optional inbound) */}
					<div
						className={`confirmation-page__itineraries grid w-full grid-cols-1 gap-4 ${inboundLegData ? "md:grid-cols-2" : ""}`}
					>
						<FlightItineraryCard
							aria-label={pageData.outbound.itinerary.legLabel}
							{...pageData.outbound.itinerary}
						/>
						{inboundLegData && (
							<FlightItineraryCard
								aria-label={inboundLegData.itinerary.legLabel}
								{...inboundLegData.itinerary}
							/>
						)}
					</div>

					{/* Transit info — connecting flights only */}
					{pageData.transitInfo && (
						<Wrapper className="h-auto w-auto border-0 bg-gray-50 px-4 py-1 md:px-6 md:py-1">
							<p className="flex items-center justify-center gap-2 text-center font-medium text-xs">
								<Icon name="schedule" size={20} fill={1} grad={0} color="text-green-600" />
								{flightSelectionLabels("transit_label")}: {pageData.transitInfo.airportName} (
								{pageData.transitInfo.airportCode}) - {pageData.transitInfo.transitDuration} (
								{flightSelectionLabels("total_hours_label")}: {pageData.transitInfo.totalDuration})
							</p>
						</Wrapper>
					)}

					{/* Outbound: per-passenger summaries + taxes */}
					<LegSection
						legData={pageData.outbound}
						passengers={pageData.outbound.passengers}
						taxTitle={t("taxes_label")}
						taxNote={t("taxes_note")}
						toggleSummaryAriaLabel={t("toggle_summary_aria_label")}
						toggleTaxesAriaLabel={t("toggle_taxes_aria_label")}
						onBundleChange={() => handleBundleChange("outbound")}
						bundleChangeDisabled={disabledBundleDirections.outbound}
						onMealChange={(passengerId) => handleMealChange(passengerId, "outbound")}
						onExtrasChange={(passengerId) => {
							void handleExtrasChange(passengerId, "outbound");
						}}
						onBaggageChange={(passengerId) => handleBaggageChange(passengerId, "outbound")}
						disabledSeatPassengerIds={disabledSeatPassengersByDirection.outbound}
						disabledExtrasPassengerIds={disabledExtrasPassengersByDirection.outbound}
						disabledLoungePassengerIds={disabledLoungePassengersByDirection.outbound}
						disabledPriorityPassengerIds={disabledPriorityPassengersByDirection.outbound}
						restrictedSeatPassengerIds={
							hasAttemptedProceed ? outboundRestrictedSeatPassengerIds : []
						}
						proceedAttemptCount={proceedAttemptCount}
						shouldScrollToRestrictedSeatBanner={outboundRestrictedSeatPassengerIds.length > 0}
						disabledSeatStatusLabel={t("unable_to_purchase_label")}
						addButtonLabel={t("add_button")}
						onLoungeChange={(passengerId) => handleLoungeChange(passengerId, "outbound")}
						onTransportChange={(passengerId) => handleTransportChange(passengerId, "outbound")}
						disabledTransportPassengerIds={disabledTransportPassengersByDirection.outbound}
						transportUnavailableLabel={transportServiceT("unable_to_purchase")}
						transportAddButtonLabel={transportServiceT("add_button")}
						onPriorityChange={(passengerId) => handlePriorityChange(passengerId, "outbound")}
						seatRestrictionBanner={seatRestrictionBanner}
						onSeatAction={(passengerId) =>
							handleSeatAction({
								direction: "outbound",
								passengerId,
								stageLabel: pageData.outbound.legLabel,
								routeLabel: buildConfirmationSeatRouteLabel(pageData.outbound),
							})
						}
						passengersWithUnavailableMeals={passengersWithUnavailableMeals}
						mealUnavailableLabel={mealsServiceT("unable_to_purchase")}
						mealAddLabel={ancillaryServiceT("add_button")}
						extrasUnavailableLabel={t("unable_to_purchase_label")}
						extrasAddLabel={t("add_button")}
						loungeUnavailableLabel={t("unable_to_purchase_label")}
						loungeAddLabel={t("add_button")}
						priorityUnavailableLabel={t("unable_to_purchase_label")}
						priorityAddLabel={t("add_button")}
						disabledBaggagePassengerIds={disabledBaggagePassengersByDirection.outbound}
						baggageCarryOn7KgLabel={baggageServiceT("select_carry_on_baggage_7kg")}
						baggageSegmentMismatchFocusPassengerId={
							baggageSegmentMismatch?.direction === "outbound"
								? baggageSegmentMismatch.passengerId
								: undefined
						}
						baggageSegmentMismatchPassengerIds={outboundBaggageWarningPassengerIds}
						baggageSegmentMismatchBanner={baggageSegmentWarningBanner}
						baggageSegmentMismatchAttempt={baggageSegmentMismatchAttempt}
						shouldScrollToBaggageSegmentMismatchBanner={
							baggageSegmentMismatch?.direction === "outbound"
						}
					/>

					{/* Second leg: per-passenger summaries + taxes/details when inbound data exists */}
					{inboundLegData && (
						<LegSection
							legData={inboundLegData}
							passengers={inboundLegData.passengers}
							taxTitle={t("taxes_label")}
							taxNote={t("taxes_note")}
							toggleSummaryAriaLabel={t("toggle_summary_aria_label")}
							toggleTaxesAriaLabel={t("toggle_taxes_aria_label")}
							onBundleChange={() => handleBundleChange("inbound")}
							bundleChangeDisabled={disabledBundleDirections.inbound}
							onMealChange={(passengerId) => handleMealChange(passengerId, "inbound")}
							onExtrasChange={(passengerId) => {
								void handleExtrasChange(passengerId, "inbound");
							}}
							onBaggageChange={(passengerId) => handleBaggageChange(passengerId, "inbound")}
							disabledSeatPassengerIds={disabledSeatPassengersByDirection.inbound}
							disabledExtrasPassengerIds={disabledExtrasPassengersByDirection.inbound}
							disabledLoungePassengerIds={disabledLoungePassengersByDirection.inbound}
							disabledPriorityPassengerIds={disabledPriorityPassengersByDirection.inbound}
							restrictedSeatPassengerIds={
								hasAttemptedProceed ? inboundRestrictedSeatPassengerIds : []
							}
							proceedAttemptCount={proceedAttemptCount}
							shouldScrollToRestrictedSeatBanner={
								outboundRestrictedSeatPassengerIds.length === 0 &&
								inboundRestrictedSeatPassengerIds.length > 0
							}
							disabledSeatStatusLabel={t("unable_to_purchase_label")}
							addButtonLabel={t("add_button")}
							onLoungeChange={(passengerId) => handleLoungeChange(passengerId, "inbound")}
							onTransportChange={(passengerId) => handleTransportChange(passengerId, "inbound")}
							disabledTransportPassengerIds={disabledTransportPassengersByDirection.inbound}
							transportUnavailableLabel={transportServiceT("unable_to_purchase")}
							transportAddButtonLabel={transportServiceT("add_button")}
							onPriorityChange={(passengerId) => handlePriorityChange(passengerId, "inbound")}
							seatRestrictionBanner={seatRestrictionBanner}
							onSeatAction={(passengerId) =>
								handleSeatAction({
									direction: "inbound",
									passengerId,
									stageLabel: inboundLegData.legLabel,
									routeLabel: buildConfirmationSeatRouteLabel(inboundLegData),
								})
							}
							passengersWithUnavailableMeals={passengersWithUnavailableMeals}
							mealUnavailableLabel={mealsServiceT("unable_to_purchase")}
							mealAddLabel={ancillaryServiceT("add_button")}
							extrasUnavailableLabel={t("unable_to_purchase_label")}
							extrasAddLabel={t("add_button")}
							loungeUnavailableLabel={t("unable_to_purchase_label")}
							loungeAddLabel={t("add_button")}
							priorityUnavailableLabel={t("unable_to_purchase_label")}
							priorityAddLabel={t("add_button")}
							disabledBaggagePassengerIds={disabledBaggagePassengersByDirection.inbound}
							baggageCarryOn7KgLabel={baggageServiceT("select_carry_on_baggage_7kg")}
							baggageSegmentMismatchFocusPassengerId={
								baggageSegmentMismatch?.direction === "inbound"
									? baggageSegmentMismatch.passengerId
									: undefined
							}
							baggageSegmentMismatchPassengerIds={inboundBaggageErrorPassengerIds}
							baggageSegmentMismatchBanner={baggageSegmentMismatchBanner}
							baggageSegmentMismatchAttempt={baggageSegmentMismatchAttempt}
							shouldScrollToBaggageSegmentMismatchBanner={
								baggageSegmentMismatch?.direction === "inbound"
							}
						/>
					)}

					<TotalAmountSummary
						label={t("label_total_amount")}
						amount={pageData.grandTotalAmount}
						note={t("payment_note")}
					/>
				</div>
			</div>

			{/* ── Section 2: passenger details + forms + footer────────────────────────── */}
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 bg-white px-4 py-4 md:px-0 md:py-6">
				<PassengerInformation
					title={t("passenger_information_title")}
					helperText={t("passenger_information_helper_text")}
					passengers={pageData.passengerInfoRows.map((row) => ({
						...row,
						onChange: () => setOpenDialogPassengerId(row.id),
					}))}
					columnLabels={{
						passenger: t("passenger_column_label"),
						dateOfBirth: t("date_of_birth_column_label"),
						passportNumber: t("passport_number_column_label"),
						expiryDate: t("expiry_date_column_label"),
						nationality: t("nationality_column_label"),
					}}
					changeLabel={t("change_button")}
					needsAssistanceLabel={t("need_assistance_label")}
					toggleAriaLabel={t("toggle_passenger_information_aria_label")}
					toggleRowAriaLabel={(name) => t("toggle_passenger_row_aria_label", { name })}
				/>

				{/* Controlled dialogs — opened via the Change button, no trigger button rendered */}
				{passengerList.map((passenger, index) => (
					<PassengerInformationDialog
						key={passenger.id}
						passenger={passenger}
						passengerIndex={index}
						isPrimary={passenger.id === primaryPassengerId}
						open={openDialogPassengerId === passenger.id}
						onOpenChange={(isOpen) => {
							if (!isOpen) setOpenDialogPassengerId(null);
						}}
					/>
				))}
				{/* Baggage : Service Dialog */}
				<BaggageService
					stageLabel={baggageDialogState.stageLabel}
					routeLabel={baggageDialogState.routeLabel}
					direction={baggageDialogState.direction}
					openBaggageDialog={baggageDialogState.open}
					onOpenBaggageDialogChange={(isOpen) => {
						setBaggageDialogState((previousState) => ({
							...previousState,
							open: isOpen,
							passengerId: isOpen ? previousState.passengerId : null,
						}));
					}}
					closeBaggageDialog={() => {
						setBaggageDialogState((previousState) => ({
							...previousState,
							open: false,
							passengerId: null,
						}));
					}}
					initialSelectedPassengerId={baggageDialogState.passengerId}
					closeOnBaggageConfirm
					hideHeaderBackButtonOnPassengerSelection
				/>

				<InflightMeals
					open={mealDialogState.open}
					onOpenChange={(isOpen) => {
						setMealDialogState((previousState) => ({
							...previousState,
							open: isOpen,
							passengerId: isOpen ? previousState.passengerId : null,
						}));
					}}
					stageLabel={mealDialogState.stageLabel}
					routeLabel={mealDialogState.routeLabel}
					direction={mealDialogState.direction}
					servicePassengers={
						mealDialogState.direction === "outbound"
							? outboundServicePassengers
							: inboundServicePassengers
					}
					initialSelectedMealPassengerId={mealDialogState.passengerId ?? undefined}
					hideHeaderBackButtonOnMealList
					closeOnMealConfirm
				/>

				{seatDialogState && (
					<SeatMapDialog
						open={seatDialogState.open}
						onOpenChange={(open) => {
							if (!open) {
								setSeatDialogState((currentState) =>
									currentState ? { ...currentState, open: false } : currentState
								);
							}
						}}
						direction={seatDialogState.direction}
						stageLabel={seatDialogState.stageLabel}
						routeLabel={seatDialogState.routeLabel}
						initialActivePassengerIndex={seatDialogInitialPassengerIndex}
					/>
				)}

				{loungeDialogState && (
					<LoungeDialog
						open={loungeDialogState.open}
						onOpenChange={(open) => {
							if (!open) {
								setLoungeDialogState((currentState) =>
									currentState ? { ...currentState, open: false } : currentState
								);
							}
						}}
						stageLabel={loungeDialogState.stageLabel}
						transportRouteLabel={loungeDialogState.routeLabel}
						ancillaryScope={loungeDialogState.ancillaryScope}
						originCode={loungeDialogState.originCode}
						segmentLfid={loungeDialogState.segmentLfid}
						highlightedPassengerId={loungeDialogState.passengerId}
						onConfirm={() => {
							setLoungeDialogState((currentState) =>
								currentState ? { ...currentState, open: false } : currentState
							);
						}}
					/>
				)}

				{transportDialogState && (
					<TransportService
						open={transportDialogState.open}
						onOpenChange={(open) => {
							if (!open) {
								setTransportDialogState(null);
							}
						}}
						triggerRef={transportDialogTriggerRef}
						direction={transportDialogState.direction}
						stageLabel={transportDialogState.stageLabel}
						routeLabel={transportDialogState.routeLabel}
						origin={transportDialogState.origin}
						destination={transportDialogState.destination}
						highlightedPassengerId={transportDialogState.passengerId}
					/>
				)}

				<ErrorDialog
					open={transportErrorState.open}
					title={transportErrorState.title}
					content={transportErrorState.content}
					buttonLabel={transportErrorState.buttonLabel}
					action={transportErrorState.action}
					redirectUrl={transportErrorState.redirectUrl}
					onOpenChange={(open) =>
						open
							? setTransportErrorState((currentState) => ({ ...currentState, open }))
							: handleTransportErrorDialogClose()
					}
					onReturnToTop={handleTransportErrorDialogClose}
				/>

				{priorityDialogState && (
					<PriorityServiceDialog
						open={priorityDialogState.open}
						onOpenChange={(open) => {
							if (!open) {
								setPriorityDialogState((currentState) =>
									currentState ? { ...currentState, open: false } : currentState
								);
							}
						}}
						stageLabel={priorityDialogState.stageLabel}
						routeLabel={priorityDialogState.routeLabel}
						passengers={activePrioritySelection.priorityServicePassengers}
						highlightedPassengerId={priorityDialogState.passengerId}
						hasOutOfStockPassengers={activePrioritySelection.hasOutOfStockPassengers}
						remainingStocksLabel={activePrioritySelection.remainingStocksLabel}
						showTransitApplicabilityWarning={
							activePrioritySelection.showTransitApplicabilityWarning
						}
						totalAmount={activePrioritySelection.priorityServiceTotalAmount}
						onPassengerChange={activePrioritySelection.togglePriorityPax}
						onSelectAllChange={activePrioritySelection.togglePrioritySelectAll}
						onConfirmSelection={() => {
							activePrioritySelection.confirmPrioritySelection();
							setPriorityDialogState((currentState) =>
								currentState ? { ...currentState, open: false } : currentState
							);
						}}
					/>
				)}

				<ErrorDialog
					open={proceedErrorState.open}
					title={proceedErrorState.title}
					content={proceedErrorState.content}
					buttonLabel={proceedErrorState.buttonLabel}
					action="close"
					onOpenChange={(open) => {
						setProceedErrorState((currentState) => ({ ...currentState, open }));
					}}
					onReturnToTop={() => {
						setProceedErrorState((currentState) => ({ ...currentState, open: false }));
					}}
				/>

				<ErrorDialog
					open={bundleErrorState.open}
					title={bundleErrorState.title}
					content={bundleErrorState.content}
					buttonLabel={bundleErrorState.buttonLabel}
					action={bundleErrorState.action}
					redirectUrl={bundleErrorState.redirectUrl}
					onOpenChange={handleBundleErrorOpenChange}
					onReturnToTop={handleBundleErrorReturnToTop}
				/>

				<ErrorDialog
					open={seatErrorState.open}
					title={seatErrorState.title}
					content={seatErrorState.content}
					buttonLabel={seatErrorState.buttonLabel}
					action={seatErrorState.action}
					redirectUrl={
						seatErrorState.action === "returnToTop" &&
						seatErrorState.unavailableSeatSelections.length === 0
							? `/${locale}`
							: undefined
					}
					onOpenChange={(open) => {
						setSeatErrorState((currentState) => ({ ...currentState, open }));
					}}
					onReturnToTop={handleSeatErrorDialog}
				/>

				<ErrorDialog
					open={mealErrorState.open}
					title={mealErrorState.title}
					content={mealErrorState.content}
					buttonLabel={mealErrorState.buttonLabel}
					action={mealErrorState.action}
					redirectUrl={mealErrorState.redirectUrl}
					onOpenChange={(open) => {
						if (!open) handleMealErrorDialogClose();
					}}
					onReturnToTop={handleMealErrorDialogClose}
				/>
				<ErrorDialog
					open={loungeErrorState.open}
					title={loungeErrorState.title}
					content={loungeErrorState.content}
					buttonLabel={loungeErrorState.buttonLabel}
					action={loungeErrorState.action}
					redirectUrl={loungeErrorState.redirectUrl}
					onOpenChange={(open) => {
						if (!open) handleLoungeErrorDialogClose();
					}}
					onReturnToTop={handleLoungeErrorDialogClose}
				/>

				<ErrorDialog
					open={priorityErrorState.open}
					title={priorityErrorState.title}
					content={priorityErrorState.content}
					buttonLabel={priorityErrorState.buttonLabel}
					action={priorityErrorState.action}
					redirectUrl={priorityErrorState.redirectUrl}
					onOpenChange={(open) => {
						if (!open) handlePriorityErrorDialogClose();
					}}
					onReturnToTop={handlePriorityErrorDialogClose}
				/>

				{isServiceLoading && <LoadingOverlay />}
				{arkoseToken ? (
					<Arkose
						publicKey={ARKOSE_PUBLIC_KEY}
						token={arkoseToken}
						selector="confirmation-arkose-container"
						mode="lightbox"
						onCompleted={(verifyToken: string) => {
							void handleCreateOrder(verifyToken);
						}}
						onError={() => {
							dispatch(clearOrderPrepare());
							setHasPrepareOrderBoundaryError(true);
						}}
					/>
				) : null}

				<div className="flex flex-col gap-4 md:gap-6">
					<IssuanceOfReceipt
						ref={receiptRef}
						title={t("receipt_title")}
						recipientLabel={t("receipt_recipient_label")}
						recipientManualOptionLabel={t("receipt_recipient_manual_option")}
						requiredBadgeLabel={t("required_badge")}
						optionalBadgeLabel={t("optional_badge")}
						lastNameLabel={t("receipt_last_name_label")}
						firstNameLabel={t("receipt_first_name_label")}
						middleNameLabel={t("receipt_middle_name_label")}
						halfWidthAlphabetLabel={t("receipt_half_width_alphabet_label")}
						emailLabel={t("receipt_email_label")}
						emailConfirmationLabel={t("receipt_email_confirmation_label")}
						halfWidthAlphanumericLabel={t("receipt_half_width_alphanumeric_label")}
						emailHelperText={t("receipt_email_helper_text")}
					/>

					<NewsletterSubscription
						label={t("newsletter_label")}
						caption={t("newsletter_caption")}
						defaultChecked={!isUsCanadaItinerary}
						onCheckedChange={setIsSubscribedToNewsletter}
					/>

					<Precautions
						title={t("precautions_title")}
						subsections={precautionSubsections}
						agreeLabel={t("precautions_agree_label")}
						agreeCheckboxLabel={t("precautions_agree_checkbox_label")}
						checked={hasAcceptedPrecautions}
						onCheckedChange={(checked) => {
							setHasAcceptedPrecautions(checked);
							if (checked) {
								setShowPrecautionsAgreementError(false);
							}
						}}
						showAgreementError={showPrecautionsAgreementError}
						agreementCheckboxError={t("error_labels.precautions_agree_error_message")}
					/>
					{/* Baggage : Error Dialog */}
					<ErrorDialog
						open={baggageErrorState.open}
						title={baggageErrorState.title}
						content={baggageErrorState.content}
						buttonLabel={baggageErrorState.buttonLabel}
						action={baggageErrorState.action}
						onOpenChange={(open) => {
							if (!open) handleBaggageErrorDialogClose();
						}}
						onReturnToTop={handleBaggageErrorDialogClose}
						redirectUrl={baggageErrorState.action === "returnToTop" ? `/${locale}` : undefined}
					/>
					{/* Extras : Error Dialog */}
					<ErrorDialog
						open={extrasErrorState.open}
						title={extrasErrorState.title}
						content={extrasErrorState.content}
						buttonLabel={extrasErrorState.buttonLabel}
						action={extrasErrorState.action}
						redirectUrl={extrasErrorState.redirectUrl}
						onOpenChange={(open) => {
							if (!open) handleExtrasErrorDialogClose();
						}}
						onReturnToTop={handleExtrasErrorDialogClose}
					/>

					<BookingFooter
						amountValue={pageData.grandTotalAmount}
						onProceed={handleProceedToPaymentSelection}
						disabled={false}
					/>
				</div>
			</div>
		</div>
	);
}
